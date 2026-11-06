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

const learningModel = loadTs('src/features/learning/model.ts');
const learningRepo = loadTs('src/features/learning/repository.ts');

test('M4.1 Learning Hub surfaces, Page Customization visibility, and recent record filtering', () => {
  assert.equal(learningModel.LEARNING_SURFACES.length, 4);
  assert.deepEqual(
    learningModel.LEARNING_SURFACES.map((s) => s.kind),
    ['books', 'mastery', 'practice', 'reading'],
  );

  // Default customization shows all 4 surfaces when permitted
  const allVisible = learningModel.visibleLearningSurfaces(
    learningModel.DEFAULT_PAGE_CUSTOMIZATION,
    () => true,
  );
  assert.equal(allVisible.length, 4);

  // Hiding books and practice leaves mastery and reading
  const customHidden = {
    ...learningModel.DEFAULT_PAGE_CUSTOMIZATION,
    hidden_features: learningModel.toggleHiddenEntry(
      learningModel.toggleHiddenEntry([], 'books', false),
      'practice',
      false,
    ),
  };
  const visibleSubset = learningModel.visibleLearningSurfaces(
    customHidden,
    () => true,
  );
  assert.deepEqual(
    visibleSubset.map((s) => s.kind),
    ['mastery', 'reading'],
  );

  // Source-hidden predicate (e.g. learner fixture mode) cannot be bypassed by PageCustomization
  const learnerVisible = learningModel.visibleLearningSurfaces(
    learningModel.DEFAULT_PAGE_CUSTOMIZATION,
    (href) => href === '/learning/reading',
  );
  assert.deepEqual(
    learnerVisible.map((s) => s.kind),
    ['reading'],
  );

  // Recent learning records filter by workspace, visible kinds, kind pill, and search query
  const recent = learningRepo.createInitialLearningRecent();
  const visibleSet = new Set(['books', 'mastery', 'practice', 'reading']);

  const masteryOnly = learningModel.filterLearningRecent(recent, {
    workspaceId: '',
    kindFilter: 'mastery',
    query: '',
    visibleKinds: visibleSet,
  });
  assert.equal(masteryOnly.length, 2);
  assert.equal(masteryOnly[0].id, 'rec-mastery-la');

  const searched = learningModel.filterLearningRecent(recent, {
    workspaceId: '',
    kindFilter: 'all',
    query: 'Fourier',
    visibleKinds: visibleSet,
  });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 'rec-mastery-signals');
});

test('M4.1 Create Topic Wizard emblems, source categories, and candidate filtering', () => {
  assert.equal(learningModel.GOAL_EMBLEMS.length, 8);
  assert.equal(learningModel.SOURCE_CATEGORIES.length, 6);

  const candidates = learningRepo.createInitialSourceCandidates();
  const kbCandidates = learningModel.filterSourceCandidates(
    candidates,
    'kb',
    '',
    '',
  );
  assert.equal(kbCandidates.length, 2);

  // Search matches child document titles inside expandable KB candidate
  const childSearched = learningModel.filterSourceCandidates(
    candidates,
    'kb',
    'Gram–Schmidt',
    '',
  );
  assert.equal(childSearched.length, 1);
  assert.equal(childSearched[0].id, 'kb-linear-algebra');
});

test('M4.1 Route Draft Editor validation, reordering, and applying route updates', () => {
  const topics = learningRepo.createInitialMasteryTopics();
  const linearTopic = topics[0];
  assert.equal(linearTopic.path_id, 'path-general');
  assert.equal(linearTopic.map.counts.mastered, 2);
  assert.equal(linearTopic.map.counts.total, 6);

  const draft = learningModel.topicToRouteDraft(linearTopic);
  assert.equal(learningModel.isRouteDraftValid(draft), true);

  // Blank module name triggers blank_region validation issue
  const invalidDraft = {
    ...draft,
    modules: draft.modules.map((m, idx) =>
      idx === 0 ? { ...m, name: '   ' } : m,
    ),
  };
  assert.equal(learningModel.isRouteDraftValid(invalidDraft), false);
  const issues = learningModel.routeDraftIssues(invalidDraft);
  assert.equal(issues[0].code, 'blank_region');

  // Reordering modules preserves module IDs and updates order index
  const movedModules = learningModel.moveRouteModule(draft, 0, 1);
  assert.equal(movedModules.modules[0].id, 'mod-la-2');
  assert.equal(movedModules.modules[1].id, 'mod-la-1');
  assert.equal(movedModules.modules[0].order, 0);
  assert.equal(movedModules.modules[1].order, 1);

  // Applying route draft preserves existing mastery progress on retained knowledge points
  const updatedTopic = learningModel.applyRouteDraftToTopic(
    linearTopic,
    movedModules,
  );
  assert.equal(updatedTopic.map.counts.mastered, 2);
  assert.equal(updatedTopic.map.counts.total, 6);
  assert.equal(updatedTopic.map.modules[0].id, 'mod-la-2');
});

test('M4.1 Mastery Study modes, opening messages, current waypoint, and review strategy validation', () => {
  assert.equal(learningModel.normalizeMasteryMode('outline'), 'outline');
  assert.equal(learningModel.normalizeMasteryMode('review'), 'review');
  assert.equal(learningModel.normalizeMasteryMode('study'), 'study');
  assert.equal(learningModel.normalizeMasteryMode('unknown'), 'study');

  assert.match(
    learningModel.masteryOpeningMessage('outline', null),
    /Let's design the learning outline together/,
  );
  assert.equal(
    learningModel.masteryOpeningMessage('study', 'SVD geometry'),
    'Let\'s study "SVD geometry".',
  );
  assert.equal(
    learningModel.masteryOpeningMessage('review', 'Rank-nullity'),
    'I\'m ready to review "Rank-nullity". Quiz me on it and record the result.',
  );

  const topics = learningRepo.createInitialMasteryTopics();
  const wp = learningModel.currentWaypoint(topics[0]);
  assert.equal(wp.id, 'kp-la-3');
  assert.equal(wp.name, 'Characteristic polynomial & eigenspace geometry');

  const board = learningModel.buildBoardFromTopic(topics[0]);
  assert.equal(board.modules.length, 3);
  assert.equal(board.modules[0].cards.length, 2);

  // Review strategy form parser accepts valid non-decreasing day rounds and rejects invalid ones
  const validStrategy = learningModel.parseStrategyIntervalsForm({
    name: 'Custom Exam Plan',
    intervals: {
      memory: '0, 1, 3, 7, 14',
      concept: '2, 5, 10',
      procedure: '3, 7, 14',
      design: '7, 21',
    },
  });
  assert.ok(validStrategy);
  assert.equal(validStrategy.name, 'Custom Exam Plan');
  assert.deepEqual(validStrategy.intervals.concept, [2, 5, 10]);

  const decreasingInvalid = learningModel.parseStrategyIntervalsForm({
    name: 'Bad Plan',
    intervals: {
      memory: '1, 5, 3',
      concept: '3, 7',
      procedure: '3, 7',
      design: '14, 28',
    },
  });
  assert.equal(decreasingInvalid, null);
});

test('M4.1 transport isolation across all learning modules', () => {
  const absDir = path.resolve(__dirname, '../src/features/learning');
  for (const file of fs.readdirSync(absDir)) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
    const text = fs.readFileSync(path.join(absDir, file), 'utf8');
    assert.doesNotMatch(
      text,
      /from\s+['"][^'"]*(?:api\/client|axios)|\bfetch\s*\(|new WebSocket/,
      `src/features/learning/${file} must remain transport-free`,
    );
  }
});
