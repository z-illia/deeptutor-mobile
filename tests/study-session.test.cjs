const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToString } = require('react-dom/server');
function load(file, overrides = {}) {
  const mod = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'module', 'exports', js)(name => overrides[name] ?? require(name), mod, mod.exports);
  return mod.exports;
}
const actions = load('src/features/learning/live/study-actions.ts');
const resources = load('src/features/learning/live/study-resources.ts', { './repository': { get: async () => [] } });
test('study starters use the current objective and distinguish assessment, teaching and practical challenge', () => {
  const topic = { name: 'Server path', next: { knowledge_point_id: 'server-point', knowledge_point_name: 'Event loop' }, map: { modules: [{ knowledge_points: [{ id: 'server-point', status: 'learning' }] }] } };
  for (const strategy of ['quick-check', 'teach-me', 'challenge']) {
    const prompt = actions.studyPrompt(strategy, topic);
    assert.match(prompt, /Event loop.*server-point/);
    assert.match(prompt, /Preserve this session, learner context, and selected resources/);
  }
  assert.match(actions.studyPrompt('quick-check', topic), /before grading/);
  assert.match(actions.studyPrompt('teach-me', topic), /concrete worked example.*before quizzing/);
  assert.match(actions.studyPrompt('challenge', topic), /practical, challenging scenario/);
  assert.deepEqual(actions.splitCurrentQuestion('Explanation\nCurrent question?', 'Current question?'), { explanation: 'Explanation', question: 'Current question?' });
  assert.equal(actions.splitCurrentQuestion('A different question?', 'Current question?').question, '');
});
test('active resource count includes selections and pending files, excludes the goal and never counts available resources', () => {
  let config = {};
  const selected = [{ kind: 'history', id: 'server-session' }, { kind: 'books', id: 'server-book' }, { kind: 'favorites', id: 'server-notebook' }, { kind: 'questions', id: '47' }, { kind: 'knowledge', id: 'Server KB' }, { kind: 'reading', id: 'server-material', revision: 3 }];
  for (const option of selected) config = resources.toggleResource(config, option.kind, { ...option, label: option.id, available: true });
  const sources = [{ kind: 'goal', id: 'goal' }, { kind: 'knowledge_base', id: 'source' }];
  assert.equal(resources.activeResourceCount(config, sources, [{ filename: 'test.txt' }]), 8);
  for (const option of selected) config = resources.toggleResource(config, option.kind, { ...option, label: option.id, available: true });
  assert.equal(resources.activeResourceCount(config, sources), 1);
  assert.throws(() => resources.toggleResource({}, 'questions', { id: 'invented', available: true }), /Invalid question/);
  assert.throws(() => resources.toggleResource({}, 'reading', { id: 'real', available: true }), /readable revision/);
});
test('starter component renders exactly three compact accessible actions in one scrollable row', () => {
  let language = 'en';
  const { translateCopy } = load('src/i18n/copy.ts', Object.fromEntries(
    ['en', 'zh', 'fr', 'de', 'uk', 'pl', 'pt', 'vi', 'ja', 'tr'].map(code => [`./locales/${code}.json`, require(`../src/i18n/locales/${code}.json`)])
  ));
  const { StudyActionRow } = load('src/features/learning/live/StudyActionRow.tsx', {
    '@/features/entry/copy': { useCopy: () => key => translateCopy(language, key) },
    'react-native': require('react-native-web'),
    'lucide-react-native': { CircleCheck: () => null, Lightbulb: () => null, Zap: () => null },
    '@/shared/design/DesignProvider': { useDesign: () => ({ colors: { primary: '#d4734b', card: '#242220', border: '#3a3634' } }) },
    './LearningText': { DText: ({ children }) => React.createElement('span', null, children) },
    './study-actions': actions,
  });
  const html = renderToString(React.createElement(StudyActionRow, { disabled: false, selected: 'teach-me', onSelect() {} }));
  assert.equal((html.match(/role="button"/g) || []).length, 3);
  for (const label of ['Quick Check', 'Teach Me', 'Challenge']) assert.ok(html.includes(label));
  assert.ok(html.includes('aria-selected="true"'));
  const disabled = renderToString(React.createElement(StudyActionRow, { disabled: true, onSelect() {} }));
  assert.equal((disabled.match(/aria-disabled="true"/g) || []).length, 3);
  language = 'uk';
  const localized = renderToString(React.createElement(StudyActionRow, { disabled: true, onSelect() {} }));
  for (const action of actions.studyStrategies) assert.ok(localized.includes(translateCopy('uk', action.title)));
  for (const child of StudyActionRow({ disabled: true, onSelect() {} }).props.children) {
    assert.equal(child.props.accessibilityHint, translateCopy('uk', 'Available when the session and current objective are ready.'));
  }
  assert.ok(!localized.includes('Teach Me'));
});
test('shared transport guards empty/duplicate submissions and preserves an unsent answer during a contextual strategy', async () => {
  const states = [], refs = [], effects = [], commands = [];
  let si = 0, ri = 0, event, fail = false;
  const configuration = load('src/features/chat/live/configuration.ts');
  const protocol = load('src/features/chat/live/protocol.ts');
  const { useLiveChat } = load('src/features/chat/live/useLiveChat.ts', {
    react: { useState(initial) { const i = si++; if (!(i in states)) states[i] = initial; return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }]; }, useRef(initial) { const i = ri++; return refs[i] ??= { current: initial }; }, useEffect(fn) { if (!effects.length) effects.push(fn); } },
    './configuration': configuration,
    '@/api/client': { api: { defaults: { baseURL: 'http://test/api' } } },
    './protocol': { ...protocol, ChatConnection: class { constructor(url, callback) { event = callback; } async send(command) { if (fail) throw Error('Offline'); commands.push(command); } close() {} } },
    './repository': { listChatModels: async () => ({ options: [], active: null }) },
  });
  const context = { workspace_id: 'real-workspace', workspace_mode: 'mastery_path', mastery_path_id: 'real-path', mastery_session_mode: 'outline' };
  const render = () => { si = 0; ri = 0; return useLiveChat(null, context); };
  render(); const cleanup = effects[0](); await new Promise(resolve => setImmediate(resolve));
  try {
    assert.equal(await render().send('en'), false); assert.equal(commands.length, 0);
    render().setDraft('Unsent answer');
    render().setConfiguration({ knowledge_bases: ['real-kb'], history_references: ['real-source'] });
    await render().send('en', { content: 'Teach this objective', preserveDraft: true, mastery_session_mode: 'study' });
    assert.equal(render().draft, 'Unsent answer'); assert.equal(commands[0].mastery_path_id, 'real-path');
    assert.equal(commands[0].mastery_session_mode, 'study'); assert.deepEqual(commands[0].history_references, ['real-source']);
    assert.equal(await render().send('en'), false); assert.equal(commands.length, 1);
    event({ type: 'done' }); render().setDraft('Retry answer'); fail = true;
    assert.equal(await render().send('en'), false); assert.equal(render().draft, 'Retry answer');
  } finally { cleanup(); }
});
test('draft cache is scoped and bounded, and restored backend reference IDs remain intact', () => {
  const drafts = load('src/features/learning/live/study-drafts.ts');
  drafts.saveStudyDraft('server:user:workspace:session', { text: 'Unsent', configuration: { history_references: ['real-id'] } });
  assert.equal(drafts.readStudyDraft('server:other:workspace:session'), undefined);
  assert.equal(drafts.readStudyDraft('server:user:workspace:session').text, 'Unsent');
  for (let i = 0; i < 9; i++) drafts.saveStudyDraft(String(i), { text: 'draft' });
  assert.equal(drafts.readStudyDraft('server:user:workspace:session'), undefined);
  const restored = load('src/features/chat/live/configuration.ts').configurationFromPreferences({ history_references: ['s1'], notebook_references: [{ notebook_id: 'n1', record_ids: ['r1'] }], question_notebook_references: [31, 'bad'], knowledge_bases: ['kb'] });
  assert.deepEqual(restored.question_notebook_references, [31]);
  assert.equal(restored.notebook_references[0].record_ids[0], 'r1');
});
