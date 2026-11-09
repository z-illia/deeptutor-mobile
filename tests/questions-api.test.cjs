const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { createLoader } = require('./helpers/rich-markdown.cjs');

const ROOT = path.resolve(__dirname, '..');

function loadQuestionsModule(relativePath, overrides = {}) {
  const calls = [];
  const loadModule = createLoader({
    '@/api/client': {
      api: {
        get: async (url, config) => {
          calls.push({ method: 'GET', url, config });
          if (overrides.get) {
            return overrides.get(url, config);
          }
          return { data: {} };
        },
        post: async (url, data, config) => {
          calls.push({ method: 'POST', url, data, config });
          if (overrides.post) {
            return overrides.post(url, data, config);
          }
          return { data: {} };
        },
        patch: async (url, data, config) => {
          calls.push({ method: 'PATCH', url, data, config });
          if (overrides.patch) {
            return overrides.patch(url, data, config);
          }
          return { data: {} };
        },
        delete: async (url, config) => {
          calls.push({ method: 'DELETE', url, config });
          if (overrides.delete) {
            return overrides.delete(url, config);
          }
          return { data: {} };
        },
      },
    },
    'expo-document-picker': {
      getDocumentAsync: async (options) => {
        calls.push({ method: 'PICK', options });
        if (overrides.pick) {
          return overrides.pick(options);
        }
        return { canceled: true, assets: null };
      },
    },
    'react-native': {
      Platform: { OS: 'ios' },
    },
  });

  return {
    calls,
    module: loadModule(path.join(ROOT, relativePath)),
  };
}

test('question notebook repository scopes entries, stats, and categories by dt_workspace', async () => {
  const { calls, module } = loadQuestionsModule('src/features/questions/repository.ts', {
    get: async (url) => {
      if (url === '/question-notebook/entries') {
        return {
          data: {
            items: [
              {
                id: 11,
                session_id: 's1',
                question: 'What is photosynthesis?',
                question_type: 'choice',
                options: { A: 'Light conversion', B: 'Respiration' },
                correct_answer: 'A',
                explanation: 'Plants convert light energy.',
                difficulty: 'medium',
                user_answer: 'B',
                is_correct: false,
                resolved: false,
                bookmarked: true,
                categories: [{ id: 1, name: 'Biology', entry_count: 6 }],
              },
            ],
            total: 1,
          },
        };
      }
      if (url === '/question-notebook/stats') {
        return {
          data: {
            total: 10,
            wrong: 4,
            unresolved: 3,
            bookmarked: 2,
            uncategorized: 1,
          },
        };
      }
      if (url === '/question-notebook/categories') {
        return {
          data: [{ id: 1, name: 'Biology', entry_count: 6 }],
        };
      }
      throw new Error(`Unexpected GET ${url}`);
    },
    post: async (url, data) => {
      if (url === '/question-notebook/categories') {
        return {
          data: {
            id: 2,
            name: data.name,
            entry_count: 0,
          },
        };
      }
      return { data: { status: 'ok' } };
    },
    patch: async () => ({ data: { status: 'ok' } }),
    delete: async () => ({ data: { status: 'deleted' } }),
  });

  const entries = await module.listQuestionEntries('ws-bio', {
    mistakesOnly: true,
    categoryId: 1,
    search: 'photo',
  });
  const stats = await module.getQuestionStats('ws-bio');
  const categories = await module.listQuestionCategories('ws-bio');
  const createdCategory = await module.createQuestionCategory('ws-bio', 'Cell Bio');
  await module.renameQuestionCategory('ws-bio', 2, 'Genetics');
  await module.updateQuestionEntry('ws-bio', 11, { bookmarked: false, resolved: true });
  await module.linkQuestionCategory('ws-bio', 11, 2);
  await module.unlinkQuestionCategory('ws-bio', 11, 2);
  await module.deleteQuestionCategory('ws-bio', 2);
  await module.deleteQuestionEntry('ws-bio', 11);

  assert.equal(entries.total, 1);
  assert.equal(entries.items[0].id, 11);
  assert.equal(entries.items[0].categories[0].name, 'Biology');
  assert.equal(stats.unresolved, 3);
  assert.equal(categories[0].name, 'Biology');
  assert.equal(createdCategory.name, 'Cell Bio');

  assert.deepEqual(
    calls.map((call) => ({
      method: call.method,
      url: call.url,
      params: call.config?.params,
    })),
    [
      {
        method: 'GET',
        url: '/question-notebook/entries',
        params: {
          dt_workspace: 'ws-bio',
          sort: 'recent',
          limit: 60,
          offset: 0,
          mistakes_only: true,
          category_id: 1,
          search: 'photo',
        },
      },
      {
        method: 'GET',
        url: '/question-notebook/stats',
        params: { dt_workspace: 'ws-bio' },
      },
      {
        method: 'GET',
        url: '/question-notebook/categories',
        params: { dt_workspace: 'ws-bio' },
      },
      {
        method: 'POST',
        url: '/question-notebook/categories',
        params: { dt_workspace: 'ws-bio' },
      },
      {
        method: 'PATCH',
        url: '/question-notebook/categories/2',
        params: { dt_workspace: 'ws-bio' },
      },
      {
        method: 'PATCH',
        url: '/question-notebook/entries/11',
        params: { dt_workspace: 'ws-bio' },
      },
      {
        method: 'POST',
        url: '/question-notebook/entries/11/categories',
        params: { dt_workspace: 'ws-bio' },
      },
      {
        method: 'DELETE',
        url: '/question-notebook/entries/11/categories/2',
        params: { dt_workspace: 'ws-bio' },
      },
      {
        method: 'DELETE',
        url: '/question-notebook/categories/2',
        params: { dt_workspace: 'ws-bio' },
      },
      {
        method: 'DELETE',
        url: '/question-notebook/entries/11',
        params: { dt_workspace: 'ws-bio' },
      },
    ]
  );
});

test('practice, import, and learning journal endpoints validate responses and pass dt_workspace', async () => {
  const samplePracticeItem = {
    entry: {
      id: 21,
      session_id: 's1',
      question: 'Solve 2 + 2',
      question_type: 'choice',
      options: { A: '3', B: '4' },
      correct_answer: 'B',
      explanation: '2 + 2 = 4',
      difficulty: 'easy',
      user_answer: '',
      is_correct: false,
      resolved: false,
      bookmarked: false,
      categories: [],
    },
    state: {
      version: 3,
      review_count: 1,
      is_mistake: false,
      due_at: null,
    },
    content_workspace_id: 'ws-math',
  };

  const { calls, module } = loadQuestionsModule('src/features/questions/repository.ts', {
    get: async (url) => {
      if (url === '/question-notebook/practice/queue') {
        return { data: [samplePracticeItem] };
      }
      if (url === '/question-notebook/practice/questions/21') {
        return { data: samplePracticeItem };
      }
      if (url === '/learning-journal') {
        return {
          data: {
            version: 2,
            updated_at: '2026-04-12T10:00:00Z',
            mission: {
              topic: 'Linear Algebra',
              why: 'Exam preparation',
              level: 'Intermediate',
              updated_at: '2026-04-12T09:00:00Z',
            },
            last_session: {
              summary: 'Covered eigenvalues',
              next_focus: 'Diagonalization',
              updated_at: '2026-04-12T10:00:00Z',
            },
            records: [
              {
                id: 'rec-1',
                title: 'Determinant property',
                insight: 'det(AB) = det(A)det(B)',
                created_at: '2026-04-12T10:00:00Z',
              },
            ],
          },
        };
      }
      if (url === '/question-notebook/practice/import/template') {
        return {
          data: 'question,correct_answer\n2+2,4',
        };
      }
      throw new Error(`Unexpected GET ${url}`);
    },
    post: async (url) => {
      if (url === '/question-notebook/practice/questions/21/check') {
        return { data: { correct: true } };
      }
      if (url === '/question-notebook/practice/questions/21/review') {
        return { data: { status: 'ok' } };
      }
      if (url === '/question-notebook/practice/import/commit') {
        return { data: { created: 4, duplicates: 1 } };
      }
      throw new Error(`Unexpected POST ${url}`);
    },
  });

  const queue = await module.getPracticeQueue('ws-math', 5);
  const single = await module.getPracticeQuestionById('ws-math', 21);
  const check = await module.checkPracticeAnswer('ws-math', 21, 'B');
  await module.submitPracticeReview('ws-math', 21, {
    request_id: 'req-1',
    version: 3,
    rating: 'good',
    answer: 'B',
  });
  const commit = await module.commitQuestionImport('ws-math', 'tok-123', 'math.csv');
  const template = await module.fetchQuestionTemplate('ws-math');
  const journal = await module.getLearningJournal('ws-math');

  assert.equal(queue.length, 1);
  assert.equal(queue[0].entry.id, 21);
  assert.equal(single.state.version, 3);
  assert.equal(check, true);
  assert.equal(commit.created, 4);
  assert.equal(commit.duplicates, 1);
  assert.equal(template, 'question,correct_answer\n2+2,4');
  assert.equal(journal.mission.topic, 'Linear Algebra');
  assert.equal(journal.records[0].title, 'Determinant property');

  for (const call of calls) {
    assert.equal(call.config.params.dt_workspace, 'ws-math');
  }
});
