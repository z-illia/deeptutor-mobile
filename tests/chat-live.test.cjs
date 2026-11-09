const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { once } = require('node:events');
const ts = require('typescript');
const { WebSocket, WebSocketServer } = require('ws');
const axios = require('axios');
function load(file, overrides = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', 'WebSocket', output)(id => overrides[id] ?? require(id), mod, mod.exports, WebSocket);
  return mod.exports;
}
const protocol = load('src/features/chat/live/protocol.ts');

test('chat wire protocol rejects incompatible versions and hides internal model text', () => {
  assert.equal(protocol.websocketUrl('https://tutor.test/prefix/api/'), 'wss://tutor.test/prefix/ws');
  assert.equal(protocol.websocketUrl('http://tutor.local:8001/api'), 'ws://tutor.local:8001/ws');
  for (const raw of ['null', '[]', '{"type":"content"}', '{"protocol_version":"1.0","type":"done"}']) assert.throws(() => protocol.parseChatEvent(raw));
  assert.equal(protocol.answerChunk({ type: 'thinking', content: 'private' }), '');
  assert.equal(protocol.answerChunk({ type: 'content', content: 'internal', metadata: { call_id: 'a', call_kind: 'planning' } }), '');
  assert.equal(protocol.answerChunk({ type: 'content', content: 'answer', metadata: { call_id: 'b', call_kind: 'agent_loop_round' } }), 'answer');
});

test('history follows server-selected branches and does not show sibling answers', () => {
  const rows = [
    { id: 1, role: 'user', content: 'Q', parent_message_id: null },
    { id: 2, role: 'assistant', content: 'first', parent_message_id: 1 },
    { id: 3, role: 'assistant', content: 'second', parent_message_id: 1 },
    { id: 4, role: 'user', content: 'followup', parent_message_id: 2 },
  ];
  assert.deepEqual(protocol.visibleMessages({ messages: rows, preferences: { selected_branches: { '1': 2 } } }).map(row => row.id), [1, 2, 4]);
  assert.deepEqual(protocol.visibleMessages({ messages: rows }).map(row => row.id), [1, 3]);
});

test('real socket sends v2 commands, deduplicates replay and cancels the admitted turn', async () => {
  const server = new WebSocketServer({ host: '127.0.0.1', port: 0 });
  await once(server, 'listening');
  const commands = [];
  server.on('connection', socket => socket.on('message', raw => {
    const command = JSON.parse(String(raw)); commands.push(command);
    if (command.type === 'start_turn') {
      socket.send(JSON.stringify({ protocol_version: '2.0', type: 'session', session_id: 's1', turn_id: 't1', seq: 1 }));
      const content = JSON.stringify({ protocol_version: '2.0', type: 'content', content: 'Привіт', session_id: 's1', turn_id: 't1', seq: 2 });
      socket.send(content); socket.send(content);
    } else if (command.type === 'cancel_turn') socket.send(JSON.stringify({ protocol_version: '2.0', type: 'done', session_id: 's1', turn_id: 't1', seq: 3, metadata: { status: 'cancelled' } }));
  }));
  const events = [], disconnects = [];
  let resolveDone;
  const done = new Promise(resolve => { resolveDone = resolve; });
  const connection = new protocol.ChatConnection(`ws://127.0.0.1:${server.address().port}/ws`, event => {
    events.push(event);
    if (event.type === 'content') void connection.send({ type: 'cancel_turn', turn_id: 't1', command_id: 'cancel-1' });
    if (event.type === 'done') resolveDone();
  }, message => disconnects.push(message));
  try {
    await connection.send({ type: 'start_turn', content: 'Hello', client_submission_id: 'submission-1', llm_selection: { profile_id: 'p1', model_id: 'm1' } });
    await Promise.race([done, new Promise((_, reject) => setTimeout(() => reject(new Error('Socket test timed out')), 2000).unref())]);
    assert.deepEqual(events.map(event => event.type), ['session', 'content', 'done']);
    assert.equal(commands.length, 2);
    assert.ok(commands.every(command => command.protocol_version === '2.0'));
    assert.equal(commands[0].llm_selection.profile_id, 'p1');
    assert.equal(commands[1].turn_id, 't1');
    assert.deepEqual(disconnects, []);
  } finally {
    connection.close();
    for (const client of server.clients) client.terminate();
    await new Promise(resolve => server.close(resolve));
  }
});

test('HTTP repository reads real paginated requests and propagates auth failures', async () => {
  const requests = [];
  const server = http.createServer((req, res) => {
    requests.push(req.url);
    res.setHeader('Content-Type', 'application/json');
    const url = new URL(req.url, 'http://test');
    if (url.pathname === '/api/sessions') res.end(JSON.stringify({ sessions: [{ session_id: 's1', title: 'Stored conversation' }] }));
    else if (url.pathname === '/api/sessions/s1') res.end(JSON.stringify({ session_id: 's1', messages: [{ id: 1, role: 'user', content: 'Q' }] }));
    else if (url.pathname === '/api/settings/llm-options') res.end(JSON.stringify({ options: [], active: null }));
    else { res.statusCode = 401; res.end('{"detail":"Unauthorized"}'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const api = axios.create({ baseURL: `http://127.0.0.1:${server.address().port}/api`, withCredentials: true });
  const repository = load('src/features/chat/live/repository.ts', { '@/api/client': { api }, '@/shared/markdown/diagnostics': load('src/shared/markdown/diagnostics.ts') });
  try {
    assert.equal((await repository.listConversations(undefined, 50))[0].session_id, 's1');
    assert.equal((await repository.getConversation('s1')).messages[0].content, 'Q');
    assert.deepEqual((await repository.listChatModels()).options, []);
    await assert.rejects(repository.getConversation('missing'), error => error.response.status === 401);
    assert.equal(requests[0], '/api/sessions?limit=50&offset=50');
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('cancelled turn refreshes persisted history and allows the next message without reload', async () => {
  const states = [], refs = [], effects = [];
  let stateIndex = 0, refIndex = 0, onEvent;
  const commands = [];
  const stored = { session_id: 's1', title: 'Chat', messages: [{ id: 1, role: 'user', content: 'Question' }, { id: 2, parent_message_id: 1, role: 'assistant', content: 'Partial answer' }] };
  let reads = 0;
  const { useLiveChat } = load('src/features/chat/live/useLiveChat.ts', {
    './configuration': load('src/features/chat/live/configuration.ts'),
    react: {
      useState(initial) {
        const index = stateIndex++;
        if (!(index in states)) states[index] = initial;
        return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
      },
      useRef(initial) { const index = refIndex++; return refs[index] ??= { current: initial }; },
      useEffect(effect) { if (!effects.length) effects.push(effect); },
    },
    '@/api/client': { api: { defaults: { baseURL: 'http://test/api' } } },
    './protocol': { ...protocol, ChatConnection: class {
      constructor(url, callback) { onEvent = callback; }
      async send(command) { commands.push(command); }
      close() {}
    } },
    './repository': {
      listChatModels: async () => ({ options: [], active: null }),
      getConversation: async () => { reads++; return stored; },
    },
  });
  const render = () => { stateIndex = 0; refIndex = 0; return useLiveChat(null); };
  render();
  const cleanup = effects[0]();
  const settle = () => new Promise(resolve => setImmediate(resolve));
  try {
    await settle();
    render().setConfiguration({ capability: 'solve', skills: ['pdf'], mcp: ['docs'], persona: 'teacher', answer_by: 'partner:p1', create_target: 'skill' });
    render().setDraft('Question');
    await render().send('en');
    assert.equal(commands[0].capability, 'solve');
    assert.deepEqual(commands[0].skills, ['pdf']);
    assert.deepEqual(commands[0].mcp, ['docs']);
    assert.equal(commands[0].persona, 'teacher');
    assert.equal(commands[0].answer_by, 'partner:p1');
    assert.equal(commands[0].create_target, 'skill');
    onEvent({ type: 'session', session_id: 's1', turn_id: 't1' });
    await render().stop();
    assert.equal(commands.at(-1).type, 'cancel_turn');
    onEvent({ type: 'error', content: 'Turn cancelled', turn_id: 't1' });
    onEvent({ type: 'done', turn_id: 't1', metadata: { status: 'cancelled' } });
    await settle();
    const chat = render();
    assert.equal(chat.error, '');
    assert.equal(chat.busy, false);
    assert.equal(chat.loading, false);
    assert.equal(reads, 1);
    assert.deepEqual(chat.messages, stored.messages);
    chat.setDraft('Continue');
    await render().send('en');
    assert.equal(commands.at(-1).type, 'start_turn');
    assert.equal(commands.at(-1).parent_message_id, 2);
    onEvent({ type: 'error', content: 'Inference failed' });
    assert.equal(render().error, 'Inference failed');
  } finally { cleanup(); }
});

test('Tutor restores valid saved configuration without manufacturing unset overrides', () => {
  const { configurationFromPreferences } = load('src/features/chat/live/configuration.ts');
  assert.deepEqual(configurationFromPreferences(), {});
  assert.deepEqual(configurationFromPreferences({ capability: 'solve', skills: ['pdf'], mcp: ['docs'], persona: 'teacher', answer_by: 'partner:p1', create_target: 'skill', unrelated: true }), { capability: 'solve', persona: 'teacher', answer_by: 'partner:p1', create_target: 'skill', skills: ['pdf'], mcp: ['docs'] });
  assert.deepEqual(configurationFromPreferences({ skills: [false], mcp: 'docs', persona: 2 }), {});
  assert.deepEqual(configurationFromPreferences({ skills: [], mcp: [], persona: '', answer_by: '', create_target: '' }), { skills: [], mcp: [], persona: '', answer_by: '', create_target: '' });
});
