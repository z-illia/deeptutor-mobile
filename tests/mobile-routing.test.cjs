const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./helpers/rich-markdown.cjs').createLoader();
const { mobileHref, favoritesHref } = load('src/features/mobile/routes.ts');

test('mobile migration keeps collection and record identity in old deep links', () => {
  const path = mobileHref('/notebooks/a%2Fb?recordId=r%20%26%20x');
  const url = new URL(path, 'https://app.invalid');
  assert.equal(url.pathname, '/mobile/31');
  assert.equal(url.searchParams.get('notebookId'), 'a/b');
  assert.equal(url.searchParams.get('recordId'), 'r & x');
  assert.equal(favoritesHref('a/b', 'r & x'), path);
});
test('mobile navigation replaces presentation destinations without changing server paths', () => {
  for (const [previous, next] of Object.entries({ '/settings': '/mobile/81', '/settings/general': '/mobile/82', '/settings/appearance': '/mobile/83', '/settings/archive': '/mobile/108', '/space/chat-history': '/mobile/27', '/notebooks': '/mobile/31', '/personalization': '/mobile/65' })) assert.equal(mobileHref(previous), next);
  for (const path of ['/api/notebooks/a', '/api/settings', '/chat/existing', '/learning/live?sessionId=existing']) assert.equal(mobileHref(path), path);
});
