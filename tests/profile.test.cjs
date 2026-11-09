const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers/rich-markdown.cjs');

test('profile requests use the backend contract and let FormData choose its boundary', async () => {
  const requests = [];
  const api = {
    put: async (...args) => { requests.push(['PUT', ...args]); return { data: { avatar: 'img:7' } }; },
    delete: async (...args) => { requests.push(['DELETE', ...args]); return { data: { avatar: '' } }; },
  };
  const repo = createLoader({ '@/api/client': { api } })('src/features/profile/repository.ts');
  const signal = new AbortController().signal;
  const form = new FormData(); form.append('file', new Blob(['png']), 'avatar.png');
  assert.equal(await repo.setAvatarMarker('icon:leaf:teal', signal), 'img:7');
  assert.equal(await repo.uploadAvatar(form, signal), 'img:7');
  assert.equal(await repo.removeAvatar(signal), '');
  await repo.changePassword('current-private', 'next-private', signal);
  assert.deepEqual(requests.map(row => row.slice(0, 2)), [
    ['PUT', '/auth/profile'], ['PUT', '/auth/profile/avatar'], ['DELETE', '/auth/profile/avatar'], ['PUT', '/auth/profile/password'],
  ]);
  assert.equal(requests[1][2], form);
  assert.equal(requests[1][3].headers['Content-Type'], undefined);
  assert.equal(requests[1][3].signal, signal);
  assert.deepEqual(requests[3][2], { current_password: 'current-private', new_password: 'next-private' });
  assert.equal(repo.validatePassword('unknown-to-client', 'new-password', 'new-password'), null);
  assert.equal(repo.validatePassword('current', 'short', 'short'), 'Password must be at least 8 characters');
  assert.equal(repo.validatePassword('current', 'new-password', 'different'), 'Passwords do not match');
});

test('avatar reads use the authenticated transport and preserve exact bytes in data URIs', async () => {
  const reads = [];
  let bytes;
  const repo = createLoader({ '@/api/client': { api: { get: async (...args) => {
    reads.push(args); return { data: bytes.buffer, headers: { 'content-type': 'image/png' } };
  } } } })('src/features/profile/repository.ts');
  const signal = new AbortController().signal;
  for (const length of [1, 2, 3, 4, 256]) {
    bytes = Uint8Array.from({ length }, (_, i) => (i * 53) % 256);
    const uri = await repo.getAvatarImage('user / one', 'img:8', signal);
    assert.equal(uri, `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`);
  }
  assert.equal(reads[0][0], '/auth/avatar/user%20%2F%20one');
  assert.equal(reads[0][1].params.v, '8');
  assert.equal(reads[0][1].signal, signal);
  bytes = new Uint8Array();
  await assert.rejects(repo.getAvatarImage('user', 'img:8'), /Could not decode/);
});

test('avatar picker sends a browser File or native URI and blocks oversized files before upload', async () => {
  let result;
  const platform = { OS: 'web' };
  const parts = [];
  const OriginalFormData = global.FormData;
  global.FormData = class { append(...args) { parts.push(args); } };
  try {
    const pick = createLoader({
      'react-native': { Platform: platform },
      'expo-document-picker': { getDocumentAsync: async () => result },
      'expo-file-system': { File: class { get size() { return result.assets[0].size; } } },
      './repository': { MAX_AVATAR_BYTES: 1024 * 1024, AVATAR_MIME_TYPES: ['image/png', 'image/jpeg', 'image/webp'] },
    })('src/features/profile/pick-avatar.ts').pickAvatar;
    result = { canceled: true }; assert.equal(await pick(), null);
    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    result = { canceled: false, assets: [{ name: file.name, uri: 'file:///photo.png', mimeType: file.type, file, size: file.size }] };
    await pick(); assert.equal(parts[0][1], file);
    platform.OS = 'android'; await pick();
    assert.deepEqual(parts[1][1], { uri: 'file:///photo.png', name: 'photo.png', type: 'image/png' });
    result.assets[0].size = 1024 * 1024 + 1;
    await assert.rejects(pick(), /max 1 MB/);
    assert.equal(parts.length, 2);
  } finally { global.FormData = OriginalFormData; }
});

function actionHarness(repository) {
  const states = [], refs = [], cleanups = [];
  const patches = [];
  let si = 0, ri = 0;
  const auth = { serverUrl: 'server', session: { profile: { id: 'user', canChangePassword: true } }, patchProfile: (...args) => patches.push(args) };
  const actions = createLoader({
    react: {
      useState(initial) { const i = si++; if (!(i in states)) states[i] = initial; return [states[i], value => { states[i] = value; }]; },
      useRef(initial) { const i = ri++; return refs[i] ??= { current: initial }; },
      useEffect(fn) { if (!cleanups.length) cleanups.push(fn()); },
    },
    '@/features/auth/AuthProvider': { useAuth: () => auth },
    './repository': { ...repository, profileError: error => error.message },
    './pick-avatar': { pickAvatar: async () => null },
  })('src/features/profile/useProfileActions.ts');
  return { patches, auth, render: () => { si = 0; ri = 0; return actions.useProfileActions(); }, close: () => cleanups.forEach(fn => fn()) };
}

test('profile actions lock duplicate submissions, reject stale completions and preserve profile on API failure', async () => {
  let resolve, signal;
  const h = actionHarness({ setAvatarMarker: (_, requestSignal) => { signal = requestSignal; return new Promise(done => { resolve = done; }); } });
  const first = h.render().setMarker('icon:leaf:teal');
  assert.equal(await h.render().setMarker('icon:sun:blue'), false);
  h.close(); assert.equal(signal.aborted, true);
  resolve('icon:leaf:teal'); assert.equal(await first, false);
  assert.deepEqual(h.patches, []);
  const failed = actionHarness({ changePassword: async () => { throw Error('Current password is incorrect'); } });
  assert.equal(await failed.render().changePassword('wrong', 'next-password'), false);
  assert.deepEqual(failed.patches, []);
  assert.equal(failed.render().error, 'Current password is incorrect');
  assert.equal(failed.render().notice, '');
  failed.close();
});
