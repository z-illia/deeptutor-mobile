const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers/rich-markdown.cjs');

test('server search sends explicit General scope, literal query, pagination and cancellation; opens exact server identities', async () => {
  const requests = []; let data;
  const repo = createLoader({ '@/api/client': { api: { get: async (...args) => { requests.push(args); return { data }; } } } })('src/features/search/api.ts');
  const signal = new AbortController().signal;
  data = { sessions: [{ session_id: 'actual / id', title: 'Keep user title', content_workspace_id: '', match_excerpt: 'Body hit' }, { session_id: 'archived', preferences: { archived: true } }], total: 57, limit: 50, offset: 0 };
  const result = await repo.searchConversations('  %literal_  ', '', 0, signal);
  assert.deepEqual(requests[0], ['/sessions/search', { params: { q: '%literal_', dt_workspace: '', limit: 50, offset: 0 }, signal }]);
  assert.equal(result.offset, 2, 'Pagination advances across filtered records, not only rendered hits');
  assert.equal(result.hasMore, true);
  assert.equal(result.records[0].href, '/chat/actual%20%2F%20id');
  assert.equal(result.records[0].detail, 'Body hit');
  assert.equal(result.records.length, 1);
  data = { sessions: [] };
  await repo.searchConversations(' ', 'scope-b', 50, signal);
  assert.deepEqual(requests[1], ['/sessions', { params: { dt_workspace: 'scope-b', limit: 50, offset: 50 }, signal }]);
  await assert.rejects(repo.searchConversations('x'.repeat(201), '', 0), /200/);
  assert.equal(requests.length, 2);
});
test('search rejects malformed pages and cross-workspace responses instead of displaying false results', async () => {
  let data;
  const repo = createLoader({ '@/api/client': { api: { get: async () => ({ data }) } } })('src/features/search/api.ts');
  for (data of [{ sessions: null }, { sessions: [], total: -1, limit: 50, offset: 0 }, { sessions: [{ session_id: 'a', content_workspace_id: 'other' }], total: 1, limit: 50, offset: 0 }]) await assert.rejects(repo.searchConversations('query', '', 0), /Invalid search data/);
  data = { topics: [{ path_id: 'real/path', name: 'Authored path', content_workspace_id: 'scope', metadata: { goal: 'literal term' } }] };
  const learning = await repo.searchLearning('literal', 'scope');
  assert.equal(learning[0].href, '/learning/mastery/real%2Fpath');
  data = { partners: [{ partner_id: 'real/id', name: 'General' }], groups: [{ group_id: 'group', name: 'General group' }] };
  const partners = await repo.searchPartners('general');
  assert.deepEqual(partners.map(row => row.kind), ['partner', 'group']);
  assert.equal(partners[0].label, 'General');
  assert.equal(partners[0].href, '/partners/real%2Fid');
});
