const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const cache = new Map();
function loadTs(rel) {
  const filename = path.resolve(__dirname, '..', rel);
  if (cache.has(filename)) return cache.get(filename);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  const mod = { exports: {} };
  cache.set(filename, mod.exports);
  new Function('exports', 'require', 'module', '__dirname', '__filename', code)(
    mod.exports,
    (id) => {
      if (id.startsWith('.')) {
        const base = path.resolve(path.dirname(filename), id);
        for (const candidate of [base, `${base}.ts`, `${base}.json`]) {
          if (fs.existsSync(candidate)) {
            return candidate.endsWith('.json')
              ? JSON.parse(fs.readFileSync(candidate, 'utf8'))
              : loadTs(path.relative(path.resolve(__dirname, '..'), candidate));
          }
        }
      }
      return require(id);
    },
    mod,
    path.dirname(filename),
    filename,
  );
  cache.set(filename, mod.exports);
  return mod.exports;
}

const model = loadTs('src/features/chat/model.ts');
const repo = loadTs('src/features/chat/repository.ts');

test('M3.1 session title and model selection helpers follow audited web contracts', () => {
  assert.equal(model.isPlaceholderSessionTitle(''), true);
  assert.equal(model.isPlaceholderSessionTitle('New conversation'), true);
  assert.equal(model.isPlaceholderSessionTitle('Fourier transform'), false);
  assert.equal(model.displaySessionTitle('', 'New chat'), 'New chat');
  assert.equal(
    model.displaySessionTitle('New conversation', 'New chat'),
    'New chat',
  );
  assert.equal(
    model.displaySessionTitle('  Eigenvalues  ', 'New chat'),
    'Eigenvalues',
  );

  assert.equal(
    model.llmSelectionKey({ provider: 'anthropic', model: 'claude-3-7-sonnet' }),
    'anthropic::claude-3-7-sonnet',
  );
  assert.equal(
    model.sameLLMSelection(
      { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      { provider: 'anthropic', model: 'claude-3-7-sonnet' },
    ),
    true,
  );
  assert.equal(
    model.sameLLMSelection(
      { provider: 'anthropic', model: 'claude-3-7-sonnet' },
      { provider: 'openai', model: 'gpt-4.1' },
    ),
    false,
  );
  assert.equal(model.formatContextWindow(200_000), '200k ctx');
  assert.equal(model.formatContextWindow(1_000_000), '1M ctx');
  assert.equal(model.formatContextWindow(null), null);
});

test('M3.1 session tree organization, sidebar grouping, and archive buckets', () => {
  const sessions = repo.createInitialSessions();
  const generalSessions = sessions.filter((s) => (s.workspace_id ?? '') === '');

  const tree = model.organizeSessionTree(
    generalSessions,
    true,
    new Set(['session-general-2']),
  );
  assert.equal(tree.pinned.length, 1);
  assert.equal(tree.pinned[0].session.session_id, 'session-general-1');
  // Nested tutor thread is attached as child of session-general-1
  assert.equal(tree.pinned[0].children.length, 1);
  assert.equal(
    tree.pinned[0].children[0].session.session_id,
    'session-general-tutor-1',
  );
  // Running session ranks first among unpinned recents
  assert.equal(tree.recents[0].session.session_id, 'session-general-2');
  assert.equal(tree.recents[0].isRunning, true);

  const entries = model.buildSidebarEntries({
    roots: [...tree.pinned, ...tree.recents],
    masteryTopics: repo.MASTERY_TOPICS_BY_WORKSPACE[''],
    readingCollections: repo.READING_COLLECTIONS_BY_WORKSPACE[''],
  });
  const kinds = entries.map((e) => e.kind);
  assert(kinds.includes('session'));
  assert(kinds.includes('mastery_group'));
  assert(kinds.includes('reading_group'));

  const buckets = model.collectArchivedConversations({
    sessions: generalSessions,
    masteryTopics: repo.MASTERY_TOPICS_BY_WORKSPACE[''],
    readingCollections: repo.READING_COLLECTIONS_BY_WORKSPACE[''],
  });
  assert.equal(buckets.chat.length, 1);
  assert.equal(buckets.mastery.length, 1);
  assert.equal(
    buckets.mastery[0].containerLabel,
    'Linear Algebra Foundations',
  );
  assert.equal(buckets.reading.length, 1);
  assert.equal(
    buckets.reading[0].containerLabel,
    'Applied Mathematics Papers',
  );
  assert.equal(model.archiveCount(buckets), 3);
});

test('M3.1 edit-branching path walk and branch switching', () => {
  const messagesBySession = repo.createInitialMessagesBySession();
  const fourierMessages = messagesBySession['session-general-1'];

  // Branch 1 selected (id 101 -> 102)
  const path1 = model.buildVisiblePath(fourierMessages, { null: 101 });
  assert.deepEqual(
    path1.messages.map((m) => m.id),
    [101, 102],
  );
  const sibling1 = path1.siblingsByMessageId.get(101);
  assert.equal(sibling1.total, 2);
  assert.equal(sibling1.index, 1);
  assert.deepEqual(sibling1.siblingIds, [101, 103]);

  // Switch to branch 2 (id 103 -> 104)
  const switched = model.selectChildBranch({ null: 101 }, null, 103);
  const path2 = model.buildVisiblePath(fourierMessages, switched);
  assert.deepEqual(
    path2.messages.map((m) => m.id),
    [103, 104],
  );
  const sibling2 = path2.siblingsByMessageId.get(103);
  assert.equal(sibling2.index, 2);
  assert.equal(model.tipMessageId(path2.messages), 104);
});

test('M3.1 chat history filtering and markdown export', () => {
  const sessions = repo.createInitialSessions();
  const messagesBySession = repo.createInitialMessagesBySession();

  const activeGeneral = model.filterChatHistorySessions(
    sessions,
    messagesBySession,
    {
      query: '',
      typeFilter: 'all',
      archiveFilter: 'active',
      workspaceId: '',
    },
  );
  assert.equal(activeGeneral.length, 5);

  const tutorOnly = model.filterChatHistorySessions(
    sessions,
    messagesBySession,
    {
      query: '',
      typeFilter: 'selection_tutor',
      archiveFilter: 'active',
      workspaceId: '',
    },
  );
  assert.equal(tutorOnly.length, 1);
  assert.equal(tutorOnly[0].session_id, 'session-general-tutor-1');

  // Content search inside message body ("Parseval")
  const byContent = model.filterChatHistorySessions(
    sessions,
    messagesBySession,
    {
      query: 'Parseval',
      typeFilter: 'all',
      archiveFilter: 'active',
      workspaceId: '',
    },
  );
  assert.equal(byContent.length, 1);
  assert.equal(byContent[0].session_id, 'session-general-1');

  const md = model.exportSessionMarkdown(
    sessions[0],
    messagesBySession['session-general-1'].slice(0, 2),
  );
  assert.match(md, /^# Fourier transform intuition/);
  assert.match(md, /## User/);
  assert.match(md, /## Assistant/);
});

test('M3.1 simulated assistant response and transport isolation', () => {
  const sim = repo.buildSimulatedAssistantChunks(
    'Explain singular value decomposition',
    { provider: 'openai', model: 'gpt-4.1' },
  );
  assert.equal(sim.chunks.length, 3);
  assert(sim.chunks[0].length < sim.chunks[2].length);
  assert.equal(sim.usage.model, 'gpt-4.1');
  assert.equal(sim.usage.providerLabel, 'OpenAI');

  const chatDir = path.resolve(__dirname, '../src/features/chat');
  for (const file of fs.readdirSync(chatDir)) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
    const text = fs.readFileSync(path.join(chatDir, file), 'utf8');
    assert.doesNotMatch(
      text,
      /from\s+['"][^'"]*(?:api\/client|axios)|\bfetch\s*\(|new WebSocket/,
      `${file} must remain transport-free`,
    );
  }
});
