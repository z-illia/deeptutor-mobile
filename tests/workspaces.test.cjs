const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers/rich-markdown.cjs');

const tick = () => new Promise(resolve => setImmediate(resolve));

// Run the provider's real hook lifecycle with controlled storage and transport.
function harness({ stored = '', failSave = false, list = async () => [] } = {}) {
  const slots = [], cleanups = [], pending = [];
  const writes = [];
  let cursor = 0;
  const React = require('react');
  const react = {
    ...React,
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = initial;
      return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }];
    },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useCallback(fn, deps) {
      const i = cursor++;
      if (!slots[i] || deps.some((value, index) => value !== slots[i].deps[index])) slots[i] = { fn, deps };
      return slots[i].fn;
    },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!slots[i] || deps.some((value, index) => value !== slots[i][index])) {
        slots[i] = deps;
        pending.push(() => { cleanups[i]?.(); cleanups[i] = fn(); });
      }
    },
  };
  const load = createLoader({
    react,
    '@react-native-async-storage/async-storage': {
      getItem: async () => stored,
      setItem: async (key, value) => { if (failSave) throw Error('disk full'); writes.push({ key, value }); },
    },
    '@/features/auth/AuthProvider': { useAuth: () => ({ serverUrl: 'https://server.test', loading: false, session: { status: { enabled: true, authenticated: true }, profile: { id: 'user-a' } } }) },
    './repository': { listWorkspaces: (...args) => list(...args), workspaceStorageKey: (server, user) => JSON.stringify([server, user]) },
  });
  const { WorkspaceProvider } = load('src/features/workspaces/WorkspaceProvider.tsx');
  const render = () => {
    cursor = 0;
    const session = WorkspaceProvider({ children: null });
    return session.type(session.props).props.value;
  };
  const flush = async () => {
    for (let i = 0; i < 4; i++) { render(); pending.splice(0).forEach(fn => fn()); await tick(); }
    return render();
  };
  return { render, flush, writes, close: () => cleanups.forEach(fn => fn?.()) };
}

const a = { workspace_id: 'workspace-a', display_name: 'Назва користувача', archived: false };

test('workspace selection restores scope, saves only registered IDs and preserves selection on storage failure', async () => {
  const h = harness({ stored: a.workspace_id, list: async () => [a] });
  try {
    assert.equal(h.render().ready, false);
    let state = await h.flush();
    assert.equal(state.ready, true);
    assert.equal(state.selectedWorkspaceId, a.workspace_id);
    assert.equal(await state.selectWorkspace('missing'), false);
    assert.equal(h.writes.length, 0);
    assert.equal(await state.selectWorkspace(''), true);
    assert.equal(h.render().selectedWorkspaceId, '');
    assert.equal(h.writes[0].value, '');
  } finally { h.close(); }
  const failed = harness({ stored: a.workspace_id, failSave: true, list: async () => [a] });
  try {
    const state = await failed.flush();
    assert.equal(await state.selectWorkspace(''), false);
    assert.equal(failed.render().selectedWorkspaceId, a.workspace_id);
    assert.match(failed.render().storageError, /Could not save/);
  } finally { failed.close(); }
});

test('workspace refresh cancels superseded responses and retains scope across server failures', async () => {
  let rejectNext = false;
  const h = harness({ stored: a.workspace_id, list: async () => { if (rejectNext) throw Error('service unavailable'); return [a]; } });
  try {
    await h.flush();
    rejectNext = true;
    await h.render().refresh();
    assert.equal(h.render().selectedWorkspaceId, a.workspace_id);
    assert.match(h.render().error, /service unavailable/);
    rejectNext = false;
    await h.render().refresh();
    assert.equal(h.render().error, '');
  } finally { h.close(); }
  const requests = [];
  const racing = harness({ list: signal => new Promise(resolve => requests.push({ signal, resolve })) });
  try {
    await racing.flush();
    const second = racing.render().refresh();
    assert.equal(requests[0].signal.aborted, true);
    requests[1].resolve([a]); await second;
    requests[0].resolve([]); await tick();
    assert.deepEqual(racing.render().workspaces, [a]);
  } finally { racing.close(); }
});

test('removed workspace is marked unavailable without silently changing data scope', async () => {
  const h = harness({ stored: 'removed', list: async () => [a] });
  try {
    const state = await h.flush();
    assert.equal(state.unavailable, true);
    assert.equal(state.selectedWorkspaceId, 'removed');
    assert.equal(await state.selectWorkspace(a.workspace_id), true);
    assert.equal(h.render().unavailable, false);
  } finally { h.close(); }
});

test('workspace repository validates responses, excludes archived/general duplicates, and isolates persisted identities', async () => {
  let data = { workspaces: [a, a, { ...a, workspace_id: 'old', archived: true }, { ...a, workspace_id: '' },
    { ...a, workspace_id: 'system', display_name: 'System workspace', kind: 'system' },
    { ...a, workspace_id: 'general', display_name: 'General workspace', kind: 'general' },
    { ...a, workspace_id: 'custom', display_name: 'General workspace', kind: 'workspace' }] };
  const requests = [];
  const load = createLoader({ '@/api/client': { api: { get: async (...args) => { requests.push(args); return { data }; } } } });
  const repo = load('src/features/workspaces/repository.ts');
  const signal = new AbortController().signal;
  assert.deepEqual(await repo.listWorkspaces(signal), [a, data.workspaces[6]]);
  assert.equal(requests[0][0], '/settings/workspace/registrations');
  assert.equal(requests[0][1].signal, signal);
  data = { workspaces: [{ workspace_id: 'bad' }] };
  await assert.rejects(repo.listWorkspaces(), /Invalid workspace list/);
  assert.notEqual(repo.workspaceStorageKey('server-a', 'user'), repo.workspaceStorageKey('server-b', 'user'));
  assert.notEqual(repo.workspaceStorageKey('server', 'user-a'), repo.workspaceStorageKey('server', 'user-b'));
});
