const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers/rich-markdown.cjs');
const notebook = id => ({ id, name: `Collection ${id}`, color: '#123456', record_count: 1, updated_at: 1 });
const record = id => ({ id, type: 'chat', title: 'Original', user_query: 'Question', output: '**Original answer**', created_at: 1, metadata: { session_id: 'real-session' } });

test('favorites API scopes and encodes requests, normalizes detail counts and sends metadata-only edits', async () => {
  const requests = [];
  const api = Object.fromEntries(['get', 'put', 'post', 'delete'].map(method => [method, async (...args) => {
    requests.push({ method, args });
    return { data: method === 'get' ? { ...notebook('a'), record_count: undefined, records: [record('r1'), record('r2')] } : { record: record('r1') } };
  }]));
  const repo = createLoader({ '@/api/client': { api } })('src/features/favorites/api.ts');
  const signal = new AbortController().signal;
  const detail = await repo.getNotebook('a / b', '', signal);
  assert.equal(detail.notebook.record_count, 2);
  assert.equal(detail.records[0].notebook_id, 'a / b');
  assert.equal('records' in detail.notebook, false);
  await repo.updateRecord('a / b', 'r / 1', { title: 'New title', summary: '' }, 'workspace / 1', signal);
  assert.equal(requests[1].args[0], '/notebooks/a%20%2F%20b/records/r%20%2F%201');
  assert.deepEqual(requests[1].args[1], { title: 'New title', summary: '' });
  assert.deepEqual(requests[0].args[1], { params: { dt_workspace: '' }, signal });
  assert.equal(requests[1].args[2].params.dt_workspace, 'workspace / 1');
  await repo.relocateRecord('copy', 'a', 'r', 'b', 'w', signal);
  assert.equal(requests[2].args[0], '/notebooks/a/records/r/actions/copy');
  assert.deepEqual(requests[2].args[1], { target_notebook_id: 'b' });
});

test('saving honors only server-confirmed destinations and preserves original snapshots and knowledge-base links', async () => {
  const requests = [];
  const repo = createLoader({ '@/api/client': { api: { post: async (...args) => {
    requests.push(args); return { data: { record: record('server-record'), added_to_notebooks: ['a', 'unrequested'] } };
  } } } })('src/features/favorites/api.ts');
  const payload = { recordType: 'chat', title: 'Title', userQuery: 'Q', output: 'Untouched\n**Markdown**', summary: '', metadata: { session_id: 's' }, kbName: 'Knowledge' };
  const result = await repo.saveRecord(['a', 'b', 'a'], payload, 'w');
  assert.deepEqual(result.savedNotebookIds, ['a']);
  assert.deepEqual(result.failedNotebookIds, ['b']);
  assert.equal(result.records[0].id, 'server-record');
  assert.equal(result.records[0].notebook_id, 'a');
  assert.deepEqual(requests[0][1], { notebook_ids: ['a', 'b'], record_type: 'chat', title: 'Title', user_query: 'Q', output: payload.output, summary: '', metadata: payload.metadata, kb_name: 'Knowledge' });
});

function harness(repository, workspace = 'w') {
  const React = require('react');
  const slots = [], cleanups = [];
  let index = 0;
  const load = createLoader({
    react: {
      ...React,
      useState(initial) { const i = index++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
      useRef(initial) { const i = index++; return slots[i] ??= { current: initial }; },
      useEffect(fn) { if (!cleanups.length) cleanups.push(fn()); },
      useCallback(fn, deps) {
        const i = index++;
        if (!slots[i] || deps.some((value, n) => value !== slots[i].deps[n])) slots[i] = { fn, deps };
        return slots[i].fn;
      },
    },
    '@/features/auth/AuthProvider': { useAuth: () => ({ serverUrl: 'server', loading: false, session: { status: { enabled: true, authenticated: true }, profile: { id: 'user' } } }) },
    '@/features/workspaces/WorkspaceProvider': { useWorkspaces: () => ({ ready: true, selectedWorkspaceId: workspace }) },
    './api': { favoritesError: error => error.message, ...repository },
  });
  const { FavoritesProvider } = load('src/features/favorites/FavoritesProvider.tsx');
  return {
    render() { index = 0; const element = FavoritesProvider({ children: null }); return element.type(element.props).props.value; },
    close() { cleanups.forEach(fn => fn?.()); },
  };
}

test('favorites cache loads details on demand, preserves server IDs and changes state only after successful writes', async () => {
  let fail = false, detailReads = 0;
  const h = harness({
    listNotebooks: async () => [notebook('a')],
    getNotebook: async () => { detailReads++; return { notebook: notebook('a'), records: [{ ...record('server-r'), notebook_id: 'a' }] }; },
    updateRecord: async () => { if (fail) throw Error('Server unavailable'); return { ...record('server-r'), notebook_id: 'a', title: 'Edited' }; },
    createNotebook: async () => ({ ...notebook('server-id'), record_count: 0 }),
  });
  try {
    await h.render().refresh();
    assert.equal(detailReads, 0);
    assert.deepEqual(h.render().recordsByNotebook, {});
    await h.render().refresh('a');
    fail = true;
    await assert.rejects(h.render().updateRecord('a', 'server-r', { title: 'Edited' }), /Server unavailable/);
    assert.equal(h.render().recordsByNotebook.a[0].title, 'Original');
    fail = false;
    await h.render().updateRecord('a', 'server-r', { title: 'Edited' });
    assert.equal(h.render().recordsByNotebook.a[0].title, 'Edited');
    assert.equal(h.render().recordsByNotebook.a[0].output, '**Original answer**');
    const created = await h.render().createNotebook({ name: 'Name' });
    assert.equal(created.id, 'server-id');
    assert.deepEqual(h.render().recordsByNotebook['server-id'], []);
  } finally { h.close(); }
});

test('superseded reads and writes from an old workspace cannot update the new library', async () => {
  const reads = [];
  const h = harness({ listNotebooks: (_, signal) => new Promise(resolve => reads.push({ signal, resolve })) });
  try {
    const first = h.render().refresh();
    const second = h.render().refresh();
    assert.equal(reads[0].signal.aborted, true);
    reads[1].resolve([notebook('fresh')]); await second;
    reads[0].resolve([notebook('stale')]); await first;
    assert.equal(h.render().notebooks[0].id, 'fresh');
  } finally { h.close(); }
  let resolveWrite, signal;
  const old = harness({ listNotebooks: async () => [], createNotebook: (_, __, requestSignal) => { signal = requestSignal; return new Promise(resolve => { resolveWrite = resolve; }); } }, 'old');
  await old.render().refresh();
  const write = old.render().createNotebook({ name: 'Delayed' });
  await assert.rejects(old.render().createNotebook({ name: 'Duplicate' }), /Please wait/);
  old.close(); assert.equal(signal.aborted, true);
  resolveWrite(notebook('old-server-id'));
  await assert.rejects(write, /workspace has changed/);
  const current = harness({ listNotebooks: async () => [] }, 'new');
  try { await current.render().refresh(); assert.deepEqual(current.render().notebooks, []); } finally { current.close(); }
});
