const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, overrides = {}) {
  const mod = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', js)(name => overrides[name] ?? require(name), mod, mod.exports);
  return mod.exports;
}
const tools = load('src/features/learning/live/tool-event.ts');
const cards = load('src/features/learning/live/mastery-question.ts', { './tool-event': tools });
const event = payload => ({ type: 'tool_result', metadata: { tool_metadata: payload }, turn_id: 't1', seq: 1 });
test('mastery assessment preserves durable question IDs and rejects malformed grouped cards', () => {
  const question = { question_id: 'server-question', prompt: 'Choose', options: [{ label: 'A', body: 'One' }], objective: { name: 'Objective' } };
  const parsed = cards.extractMasteryQuestion([event({ mastery_question: question })]);
  assert.equal(parsed.questionId, 'server-question');
  assert.equal(parsed.options[0].body, 'One');
  assert.equal(cards.extractMasteryQuestion([event({ mastery_question: { ...question, question_type: 'group', questions: [question, question] } })]), null);
  assert.equal(cards.extractMasteryQuestion([event({ mastery_question: { prompt: 'No server ID' } })]), null);
});
test('assessment verdicts and skips follow the question across later messages', () => {
  const messages = [{ events: [event({ mastery_grade: { result: { question_id: 'q1', is_correct: true, explanation: 'Evidence' } } })] }, { events: [event({ mastery_skip_question: { question_id: 'q2', skipped: true } })] }];
  assert.equal(cards.collectMasteryGrades(messages).get('q1').isCorrect, true);
  assert.equal(cards.collectMasterySkips(messages).has('q2'), true);
  assert.equal(cards.collectMasteryGrades(messages).has('q2'), false);
});
test('Learning HTTP requests preserve explicit workspace identity and propagate cancellation', async () => {
  const requests = [];
  const api = { get: async (url, config) => { requests.push({ url, config }); return { data: { topics: [] } }; } };
  const repository = load('src/features/learning/live/repository.ts', { '@/api/client': { api } });
  const signal = new AbortController().signal;
  await repository.listTopics('workspace / one', signal);
  assert.equal(requests[0].url, '/mastery-paths/topics?dt_workspace=workspace%20%2F%20one');
  assert.equal(requests[0].config.signal, signal);
  assert.equal(repository.scoped('/reading/library/materials?search=a', ''), '/reading/library/materials?search=a&dt_workspace=');
  api.get = async () => ({ data: '<html>proxy page</html>' });
  await assert.rejects(repository.listTopics('', signal), /Invalid learning data/);
});
test('saved Learning references restore backend IDs rather than manufacturing replacements', () => {
  const config = load('src/features/chat/live/configuration.ts').configurationFromPreferences({ mastery_session_mode: 'review', book_references: [{ book_id: 'book-server', page_ids: ['page-server'] }], reading_references: [{ material_id: 'material-server', revision: 2, locators: [3] }, { material_id: 'broken' }] });
  assert.equal(config.mastery_session_mode, 'review');
  assert.deepEqual(config.book_references, [{ book_id: 'book-server', page_ids: ['page-server'] }]);
  assert.equal(config.reading_references.length, 1);
  assert.equal(config.reading_references[0].revision, 2);
});
