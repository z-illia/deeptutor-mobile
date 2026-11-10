const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./helpers/rich-markdown.cjs').createLoader();
const { mobileHref, favoritesHref } = load('src/features/mobile/routes.ts');

test('mobile migration keeps collection and record identity in old deep links', () => {
  const path = mobileHref('/notebooks/a%2Fb?recordId=r%20%26%20x');
  const url = new URL(path, 'https://app.invalid');
  assert.equal(url.pathname, '/favorites');
  assert.equal(url.searchParams.get('notebookId'), 'a/b');
  assert.equal(url.searchParams.get('recordId'), 'r & x');
  assert.equal(favoritesHref('a/b', 'r & x'), path);
});
test('mobile navigation replaces presentation destinations without changing server paths', () => {
  for (const [previous, next] of Object.entries({ '/settings': '/settings', '/settings/general': '/settings/general', '/settings/appearance': '/settings/appearance', '/settings/archive': '/settings/archive', '/space/chat-history': '/space/chat-history', '/notebooks': '/favorites', '/personalization': '/personalization' })) assert.equal(mobileHref(previous), next);
  for (const path of ['/api/notebooks/a', '/api/settings', '/chat/existing', '/learning/live?sessionId=existing']) assert.equal(mobileHref(path), path);
});

const fs = require('node:fs');
const { legacyScreenPaths, screenPath, isScreenPath } = load('src/features/navigation/paths.ts');

test('every numeric bookmark resolves to a real descriptive Expo route', () => {
  for (let screen = 1; screen <= 154; screen++) {
    const path = screenPath(screen);
    assert.ok(!path.startsWith('/mobile/'), `${screen}: ${path}`);
    assert.ok(isScreenPath(path), path);
    const exists = [`src/app/(app)${path}.tsx`, `src/app/(app)${path}/index.tsx`].some(file => fs.existsSync(file));
    assert.ok(exists, `${screen}: missing route ${path}`);
  }
  assert.equal(Object.keys(legacyScreenPaths).length, 154);
  assert.equal(screenPath('27'), '/space/chat-history');
  assert.equal(screenPath('invalid'), '/learning');
});

test('legacy presentation links retain encoded query values, repeated params and fragments', () => {
  const suffix = '?kb=My%20KB%2F1&file=a%2Fb.pdf&tag=a&tag=b#section';
  assert.equal(mobileHref('/mobile/42' + suffix), '/knowledge-bases/preview' + suffix);
  assert.equal(mobileHref('/settings/overview?tab=a#section'), '/settings?tab=a#section');
  assert.equal(mobileHref('/notebooks/a%2Fb?recordId=r%20%26%20x#record'), '/favorites?notebookId=a%2Fb&recordId=r+%26+x#record');
  assert.equal(mobileHref('/notebooks/%bad'), '/notebooks/%bad');
});

test('new screen routes mount their feature directly instead of redirecting back to numeric paths', () => {
  for (const path of new Set(Object.values(legacyScreenPaths))) {
    const file = [`src/app/(app)${path}.tsx`, `src/app/(app)${path}/index.tsx`].find(file => fs.existsSync(file));
    assert.ok(!fs.readFileSync(file, 'utf8').includes('/mobile/'), path);
  }
  for (const path of ['/partners/[partnerId]', '/partners/groups/[groupId]']) {
    assert.ok(fs.existsSync(`src/app/(app)${path}.tsx`), path);
  }
});

test('legacy route preserves all query values and the progress screen while dropping the numeric segment', () => {
  let params = { screen: '42', kb: 'KB / one', file: 'folder/a b.pdf', tag: ['one', 'two'] };
  const routeLoader = require('./helpers/rich-markdown.cjs').createLoader({
    'expo-router': { useLocalSearchParams: () => params, Redirect: 'Redirect' },
  });
  const route = routeLoader('src/app/mobile/[screen].tsx').default;
  assert.deepEqual(route().props.href, {
    pathname: '/knowledge-bases/preview',
    params: { kb: 'KB / one', file: 'folder/a b.pdf', tag: ['one', 'two'] },
  });
  params = { screen: '58', sessionId: 'server-session' };
  assert.deepEqual(route().props.href, { pathname: '/learning/live', params: { sessionId: 'server-session', view: 'progress' } });
});

test('Expo route files have unique URL patterns across route groups and index files', () => {
  const path = require('node:path');
  const seen = new Map();
  function visit(directory) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) visit(file);
      else if (item.name.endsWith('.tsx') && !item.name.startsWith('_')) {
        const pattern = file.replace(/^src\/app/, '').replace(/\/\([^/]+\)/g, '').replace(/\.tsx$/, '').replace(/\/index$/, '').replace(/\[[^\]]+\]/g, '[param]') || '/';
        assert.ok(!seen.has(pattern), `${file} conflicts with ${seen.get(pattern)}`);
        seen.set(pattern, file);
      }
    }
  }
  visit('src/app');
});
