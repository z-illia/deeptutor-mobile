const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers/rich-markdown.cjs');
test('resource counters page all sessions, deduplicate and filter inactive/nested entries in the explicit workspace', async () => {
  const requests = []; const signal = new AbortController().signal;
  const first = Array.from({ length: 200 }, (_, i) => ({ session_id: String(i), content_workspace_id: '', preferences: { archived: i === 0, parent_session_id: i === 1 ? '0' : undefined } }));
  const api = { get: async (path, options) => { requests.push({ path, options }); return { data: { sessions: options.params.offset === 0 ? first : [first[199], { session_id: 'last', content_workspace_id: '' }] } }; } };
  const repo = createLoader({ '@/api/client': { api } })('src/features/resources/api.ts');
  assert.equal(await repo.readCount('chat_history', '', signal), 199);
  assert.deepEqual(requests.map(row => row.options.params), [{ dt_workspace: '', limit: 200, offset: 0 }, { dt_workspace: '', limit: 200, offset: 200 }]);
  assert.ok(requests.every(row => row.options.signal === signal));
});
test('account counters use caller-owned registries and count only enabled granted CLI apps', async () => {
  const requests = []; const data = {
    '/personas': { personas: Array.from({ length: 7 }, () => ({})) },
    '/skills/list': { skills: [] },
    '/space/mcp/servers': { servers: { one: {}, two: {} }, deployment: { servers: ['global-a', 'global-b', 'global-c'] } },
    '/space/cli-apps/apps': { apps: [{ granted: true, enabled: true }, { granted: false, enabled: true }, { granted: true, enabled: false }] },
    '/question-notebook/entries': { total: 301 }, '/knowledge-bases/list': [],
  };
  const repo = createLoader({ '@/api/client': { api: { get: async (path, options) => { requests.push({ path, options }); return { data: data[path] }; } } } })('src/features/resources/api.ts');
  assert.equal(await repo.readCount('personas', 'workspace-a'), 7);
  assert.equal(await repo.readCount('skills', 'workspace-b'), 0);
  assert.equal(await repo.readCount('mcp', ''), 2);
  assert.equal(await repo.readCount('cli_apps', ''), 1);
  assert.ok(requests.every(row => !('dt_workspace' in row.options.params)));
  assert.equal(await repo.readCount('question_bank', 'b'), 301);
  assert.deepEqual(requests.at(-1).options.params, { dt_workspace: 'b', limit: 1 });
  assert.equal(await repo.readCount('knowledge', ''), 0);
  data['/personas'] = {};
  await assert.rejects(repo.readCount('personas', ''), /Invalid resource/);
  data['/question-notebook/entries'] = { total: -1 };
  await assert.rejects(repo.readCount('question_bank', ''), /Invalid resource/);
});
test('cross-workspace rows and repeated full pages fail instead of manufacturing a count', async () => {
  let data = { sessions: [{ session_id: 'foreign', content_workspace_id: 'other' }] };
  const repo = createLoader({ '@/api/client': { api: { get: async () => ({ data }) } } })('src/features/resources/api.ts');
  await assert.rejects(repo.readCount('chat_history', ''), /Invalid resource/);
  data = { sessions: Array.from({ length: 200 }, (_, i) => ({ session_id: String(i) })) };
  await assert.rejects(repo.readCount('chat_history', ''), /Invalid resource/);
});
