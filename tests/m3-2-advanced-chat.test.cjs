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

const chatModel = loadTs('src/features/chat/model.ts');
const chatRepo = loadTs('src/features/chat/repository.ts');
const favModel = loadTs('src/features/favorites/model.ts');
const favRepo = loadTs('src/features/favorites/repository.ts');

test('M3.2 File Preview kind classification and byte formatting', () => {
  assert.equal(
    chatModel.previewKindFor('fourier_derivation.md', 'text/markdown'),
    'markdown',
  );
  assert.equal(
    chatModel.previewKindFor('fft_verification.py', 'text/x-python'),
    'code',
  );
  assert.equal(
    chatModel.previewKindFor('calculus-notes.pdf', 'application/pdf'),
    'pdf',
  );
  assert.equal(
    chatModel.previewKindFor('phasor_projection.svg', 'image/svg+xml'),
    'svg',
  );
  assert.equal(
    chatModel.previewKindFor('diagram-board.png', 'image/png'),
    'image',
  );
  assert.equal(
    chatModel.previewKindFor('spectral_table.xlsx', 'text/csv'),
    'xlsx',
  );
  assert.equal(
    chatModel.previewKindFor('guide.docx', ''),
    'docx',
  );
  assert.equal(
    chatModel.previewKindFor('slides.pptx', ''),
    'office-text',
  );
  assert.equal(
    chatModel.previewKindFor('notes.txt', 'text/plain'),
    'text',
  );
  assert.equal(
    chatModel.previewKindFor('model_checkpoint.bin', 'application/octet-stream'),
    'fallback',
  );

  assert.equal(chatModel.formatBytes(512), '512 B');
  assert.equal(chatModel.formatBytes(4_820), '4.7 KB');
  assert.equal(chatModel.formatBytes(1_048_576), '1.00 MB');
  assert.equal(chatModel.formatBytes(null), '0 B');
});

test('M3.2 Capability Configuration rebalancing, validation, and summaries', () => {
  const counts = chatModel.rebalanceQuizCounts(5, [
    'choice',
    'true_false',
    'written',
  ]);
  assert.deepEqual(counts, {
    choice: 2,
    true_false: 2,
    fill_blank: 0,
    written: 1,
  });

  const validQuizErrors = chatModel.validateQuizConfig(
    chatRepo.DEFAULT_QUIZ_CONFIG,
  );
  assert.deepEqual(validQuizErrors, []);

  const invalidQuizErrors = chatModel.validateQuizConfig({
    mode: 'mimic',
    totalCount: 0,
    difficulty: 'hard',
    selectedTypes: [],
    typeCounts: { choice: 0, true_false: 0, fill_blank: 0, written: 0 },
    mimicPaperTitle: '   ',
  });
  assert.equal(invalidQuizErrors.length, 3);

  assert.match(
    chatModel.summarizeQuizConfig(chatRepo.DEFAULT_QUIZ_CONFIG),
    /Custom Quiz · 4 Qs · MEDIUM · 3 types/,
  );

  const validResearchErrors = chatModel.validateResearchConfig(
    chatRepo.DEFAULT_RESEARCH_CONFIG,
  );
  assert.deepEqual(validResearchErrors, []);

  const invalidResearchErrors = chatModel.validateResearchConfig({
    mode: 'report',
    depth: 'manual',
    subtopics: 12,
    iterations: 0,
  });
  assert.equal(invalidResearchErrors.length, 2);

  assert.match(
    chatModel.summarizeResearchConfig(chatRepo.DEFAULT_RESEARCH_CONFIG),
    /Study Notes · STANDARD \(3 sub-topics, 2 iters\)/,
  );
});

test('M3.2 Structured Quiz answer evaluation and Session Activity aggregation', () => {
  const questions = chatRepo.createSampleQuizQuestions();
  assert.equal(chatModel.isQuizAnswerCorrect(questions[0], '7'), true);
  assert.equal(chatModel.isQuizAnswerCorrect(questions[0], '5'), false);
  assert.equal(chatModel.isQuizAnswerCorrect(questions[1], 'true'), true);
  assert.equal(
    chatModel.isQuizAnswerCorrect(
      questions[2],
      'Because geometric multiplicity is smaller than algebraic multiplicity.',
    ),
    true,
  );

  const messagesBySession = chatRepo.createInitialMessagesBySession();
  const activity = chatModel.buildSessionActivity(
    messagesBySession['session-general-1'].slice(0, 2),
    [],
    'chat',
  );
  assert.deepEqual(activity.toolsUsed, ['kb_search', 'python_sandbox']);
  assert.equal(activity.knowledgeBases.length, 1);
  assert.equal(activity.spaceReferences.length, 1);
  assert.equal(activity.artifacts.length, 3);
});

test('M3.2 Favorites / Saved Originals filtering, turn indexing, and Markdown export', () => {
  const notebooks = favRepo.createInitialNotebooks();
  const recordsByNotebook = favRepo.createInitialNotebookRecords();

  assert.equal(favModel.SWATCHES.length, 9);
  assert.equal(favModel.favoriteKind('question'), 'question');
  assert.equal(
    favModel.favoriteKind('chat', { source_surface: 'reading' }),
    'reading',
  );

  const filteredNbs = favModel.filterNotebooks(
    notebooks,
    recordsByNotebook,
    'Eckart',
  );
  assert.equal(filteredNbs.length, 1);
  assert.equal(filteredNbs[0].id, 'nb-linear-algebra');

  const linearRecords = recordsByNotebook['nb-linear-algebra'];
  const questionOnly = favModel.filterNotebookRecords(
    linearRecords,
    '',
    'question',
  );
  assert.equal(questionOnly.length, 1);
  assert.equal(questionOnly[0].id, 'fav-rec-102');

  const sampleMessages = [
    { role: 'user', content: 'Turn 1 question' },
    { role: 'assistant', content: 'Turn 1 answer' },
    { role: 'user', content: 'Turn 2 question' },
    { role: 'assistant', content: 'Turn 2 answer' },
  ];
  assert.deepEqual(favModel.indexesForLastTurns(sampleMessages, 1), [2, 3]);
  assert.deepEqual(
    favModel.indexesForLastTurns(sampleMessages, 2),
    [0, 1, 2, 3],
  );
  assert.equal(
    favModel.deriveSaveTitle(sampleMessages, 'Fallback'),
    'Turn 1 question',
  );

  const md = favModel.exportNotebookAsMarkdown(notebooks[0], linearRecords);
  assert.match(md, /^# Linear Algebra Originals/);
  assert.match(md, /### Saved Original Snapshot/);
});

test('M3.2 transport isolation across chat and favorites modules', () => {
  for (const relDir of ['src/features/chat', 'src/features/favorites']) {
    const absDir = path.resolve(__dirname, '..', relDir);
    for (const file of fs.readdirSync(absDir)) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      const text = fs.readFileSync(path.join(absDir, file), 'utf8');
      assert.doesNotMatch(
        text,
        /from\s+['"][^'"]*(?:api\/client|axios)|\bfetch\s*\(|new WebSocket/,
        `${relDir}/${file} must remain transport-free`,
      );
    }
  }
});
