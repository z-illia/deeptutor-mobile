const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
function load(file, overrides = {}) {
  const mod = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'module', 'exports', js)(name => overrides[name] ?? require(name), mod, mod.exports);
  return mod.exports;
}
const repo = load('src/features/learning/live/repository.ts', { '@/api/client': { api: {} } });
const session = (id, pending = false) => ({ session_id: id, has_pending_question: pending });
test('Continue restores newest history when next.session_id is empty, preserving pending question routing', () => {
  const rows = [session('newest'), session('pending', true), session('oldest')];
  assert.equal(repo.continuationSessionId({ action: 'study', session_id: '' }, rows), 'newest');
  assert.equal(repo.continuationSessionId({ action: 'answer_pending', session_id: 'explicit' }, rows), 'explicit');
  assert.equal(repo.continuationSessionId({ action: 'answer_pending', session_id: '' }, rows), 'pending');
  assert.equal(repo.continuationSessionId({ action: 'answer_pending', session_id: '' }, [session('latest')]), 'latest');
  assert.equal(repo.continuationSessionId({ action: 'study', session_id: 'explicit' }, []), 'explicit');
  assert.equal(repo.continuationSessionId({ action: 'study', session_id: '' }, []), undefined);
});
test('topic and session history load in the same workspace with cancellation; failures propagate', async () => {
  const requests = [];
  const api = { get: async (url, options) => { requests.push({ url, options }); return { data: url.includes('/sessions?') ? { sessions: [session('saved')] } : { path_id: 'path' } }; } };
  const repository = load('src/features/learning/live/repository.ts', { '@/api/client': { api } });
  const signal = new AbortController().signal;
  const data = await repository.getTopicWithSessions('path / one', 'workspace / one', signal);
  assert.equal(data.sessions[0].session_id, 'saved');
  assert.deepEqual(requests.map(r => r.url), ['/mastery-paths/topics/path%20%2F%20one?dt_workspace=workspace%20%2F%20one', '/mastery-paths/topics/path%20%2F%20one/sessions?dt_workspace=workspace%20%2F%20one']);
  assert.ok(requests.every(r => r.options.signal === signal));
  api.get = async url => { if (url.includes('/sessions?')) throw Error('History unavailable'); return { data: {} }; };
  await assert.rejects(repository.getTopicWithSessions('path', 'workspace'), /History unavailable/);
  api.get = async () => ({ data: { sessions: null } });
  await assert.rejects(repository.getTopicWithSessions('path', 'workspace'), /Invalid conversation list/);
});
function screenHarness(view, rows) {
  const topic = { path_id: 'path', name: 'Topic', metadata: {}, next: { action: 'study', session_id: '' }, map: { modules: [], counts: { mastered: 0, total: 0 } }, reviews: [] };
  const state = { data: { topic, sessions: rows, workspaces: [] }, loading: false, error: '', refresh() {} };
  const navigations = [], loaders = [];
  const source = fs.readFileSync('src/features/learning/live/LiveLearningScreen.tsx', 'utf8');
  const imports = ts.createSourceFile('screen.tsx', source, ts.ScriptTarget.Latest, true).statements.filter(ts.isImportDeclaration);
  const overrides = Object.fromEntries(imports.map(node => [node.moduleSpecifier.text, new Proxy({}, { get: (_, key) => String(key) })]));
  Object.assign(overrides, {
    react: { useCallback: fn => fn, useEffect() {}, useState: initial => [initial, () => {}], useRef: value => ({ current: value }) },
    'expo-router': { router: { push: url => navigations.push(url) }, useFocusEffect() {}, useLocalSearchParams: () => ({ view, workspace: 'workspace', pathId: 'path' }) },
    '@/features/auth/AuthProvider': { useAuth: () => ({ serverUrl: 'server', session: { profile: { id: 'user' } } }) },
    '@/features/workspaces/WorkspaceProvider': { useWorkspaces: () => ({ selectedWorkspaceId: '', workspaces: [] }) },
    '@/shared/preferences/store': { usePreferencesStore: selector => selector({ values: {}, setValue() {} }) },
    '@/features/chat/live/protocol': { commandId: () => 'navigation-instance' },
    './routes': load('src/features/learning/live/routes.ts'),
    './repository': repo,
    './useLearningData': { useLearningData: loader => { loaders.push(loader); return state; } },
  });
  const { LiveLearningScreen } = load('src/features/learning/live/LiveLearningScreen.tsx', overrides);
  const component = LiveLearningScreen({});
  const render = () => component.type(component.props);
  const find = (node, label) => {
    if (!React.isValidElement(node)) return undefined;
    if (node.type === 'Button' && node.props.children === label) return node;
    return React.Children.toArray(node.props.children).map(child => find(child, label)).find(Boolean);
  };
  return { state, navigations, render, find, loaders };
}
test('topic Continue passes saved session to Study and is disabled while history reloads or fails', () => {
  const h = screenHarness('topic', [session('saved-dialog')]);
  h.find(h.render(), 'Continue current session').props.onPress();
  const params = new URL('http://local' + h.navigations[0]).searchParams;
  assert.equal(params.get('sessionId'), 'saved-dialog');
  assert.equal(params.get('workspace'), 'workspace');
  assert.equal(params.get('mode'), null);
  h.state.loading = true;
  assert.equal(h.find(h.render(), 'Continue current session').props.disabled, true);
  h.state.loading = false; h.state.error = 'Offline';
  assert.equal(h.find(h.render(), 'Continue current session').props.disabled, true);
});
test('explicit fresh session action stays fresh even when previous sessions exist', () => {
  const h = screenHarness('sessions', [session('saved-dialog')]);
  h.find(h.render(), 'Start from a fresh angle').props.onPress();
  assert.equal(new URL('http://local' + h.navigations[0]).searchParams.has('sessionId'), false);
});
