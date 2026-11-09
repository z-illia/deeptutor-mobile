const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { createLoader } = require('./helpers/rich-markdown.cjs');

const ROOT = path.resolve(__dirname, '..');

function loadPlanModule(relativePath, overrides = {}) {
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
        put: async (url, data, config) => {
          calls.push({ method: 'PUT', url, data, config });
          if (overrides.put) {
            return overrides.put(url, data, config);
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
      getDocumentAsync: async () => ({ canceled: true, assets: null }),
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

test('plan repository scopes task board and calendar endpoints by dt_workspace', async () => {
  const baseBoard = {
    cards: [
      {
        id: 'card-1',
        title: 'Summarize chapter 2',
        note: 'Focus on isolation levels',
        status: 'doing',
        archived: false,
        created_at: '2026-04-01T10:00:00Z',
        updated_at: '2026-04-05T12:00:00Z',
        workspace_id: 'ws-plan',
        due_date: '2026-04-06',
      },
    ],
    colors: {
      todo: '#2563eb',
      doing: '#a16207',
      done: '#15803d',
    },
    session_links: [
      {
        workspace_id: 'ws-plan',
        session_id: 'sess-1',
        task_ids: ['card-1'],
        status_link_enabled: true,
      },
    ],
    revision: 3,
  };

  const { calls, module } = loadPlanModule('src/features/plan/repository.ts', {
    get: async (url) => {
      if (url === '/task-board') {
        return { data: baseBoard };
      }
      if (url === '/calendar/calendars') {
        return {
          data: {
            calendars: [
              {
                id: 'cal-1',
                name: 'Study Plan',
                color: '#2f6fde',
                visible: true,
                position: 0,
                is_default: true,
              },
            ],
          },
        };
      }
      if (url === '/calendar/events') {
        return {
          data: {
            occurrences: [
              {
                id: 'occ-1',
                event_id: 'evt-1',
                calendar_id: 'cal-1',
                title: 'Serializability drill',
                notes: 'Two-phase locking exercises',
                location: 'Desk',
                all_day: false,
                start: '2026-04-05T09:00:00Z',
                end: '2026-04-05T09:30:00Z',
                tzid: 'UTC',
                color: '#2f6fde',
                task_id: 'card-1',
              },
            ],
          },
        };
      }
      if (url === '/calendar/layers') {
        return {
          data: {
            workspace_id: 'ws-plan',
            reviews: [
              {
                date: '2026-04-05',
                mastery: 2,
                practice: 3,
                paths: [{ id: 'p-1', title: 'Concurrency control', count: 2 }],
              },
            ],
            automations: [
              {
                id: 'run-1',
                job_id: 'job-1',
                name: 'Morning summary',
                message: 'Check today tasks',
                at: '2026-04-05T08:00:00Z',
                kind: 'cron',
                enabled: true,
              },
            ],
            footprints: [
              {
                date: '2026-04-05',
                session_count: 1,
                sessions: [{ id: 'sess-1', title: 'Chapter 2 review' }],
                practice_reviews: 4,
                mastery_evidence: 1,
              },
            ],
          },
        };
      }
      throw new Error(`Unexpected GET ${url}`);
    },
    post: async (url, data) => {
      if (url === '/task-board/cards') {
        return {
          data: {
            ...baseBoard,
            cards: [
              ...baseBoard.cards,
              {
                id: 'card-2',
                title: data.title,
                note: '',
                status: 'todo',
                archived: false,
                created_at: '2026-04-05T10:00:00Z',
                updated_at: '2026-04-05T10:00:00Z',
                workspace_id: 'ws-plan',
                due_date: data.due_date ?? null,
              },
            ],
            revision: 4,
          },
        };
      }
      throw new Error(`Unexpected POST ${url}`);
    },
    patch: async (url, data) => {
      if (url === '/task-board/cards/card-1') {
        return {
          data: {
            ...baseBoard,
            cards: [
              {
                ...baseBoard.cards[0],
                ...data,
              },
            ],
            revision: 5,
          },
        };
      }
      if (url === '/task-board/sessions/sess-1/status') {
        return {
          data: {
            ...baseBoard,
            session_links: [
              {
                workspace_id: 'ws-plan',
                session_id: 'sess-1',
                task_ids: ['card-1'],
                status_link_enabled: Boolean(data.enabled),
              },
            ],
            revision: 7,
          },
        };
      }
      throw new Error(`Unexpected PATCH ${url}`);
    },
    put: async (url, data) => {
      if (url === '/task-board/colors') {
        return {
          data: {
            ...baseBoard,
            colors: data,
            revision: 6,
          },
        };
      }
      if (url === '/task-board/sessions/sess-1') {
        return {
          data: {
            ...baseBoard,
            session_links: [
              {
                workspace_id: 'ws-plan',
                session_id: 'sess-1',
                task_ids: data.task_ids,
                status_link_enabled: true,
              },
            ],
            revision: 6,
          },
        };
      }
      throw new Error(`Unexpected PUT ${url}`);
    },
  });

  const board = await module.getTaskBoard('ws-plan');
  const created = await module.createTaskCard('ws-plan', 'Prepare reading notes', '2026-04-06');
  const updated = await module.updateTaskCard('ws-plan', 'card-1', {
    status: 'done',
  });
  const colors = await module.updateTaskColors('ws-plan', {
    todo: '#2563eb',
    doing: '#7c3aed',
    done: '#15803d',
  });
  const linked = await module.linkSessionTasks('ws-plan', 'sess-1', ['card-1', 'card-2']);
  const statusLinked = await module.setTaskStatusLink('ws-plan', 'sess-1', false);
  const calendars = await module.listCalendars('ws-plan');
  const occurrences = await module.listCalendarOccurrences('ws-plan', {
    start: '2026-04-01T00:00:00.000Z',
    end: '2026-04-30T23:59:59.999Z',
  });
  const layers = await module.getCalendarLayers('ws-plan', {
    start: '2026-04-01',
    end: '2026-04-30',
  });

  assert.equal(board.cards.length, 1);
  assert.equal(board.cards[0].id, 'card-1');
  assert.equal(board.colors.doing, '#a16207');
  assert.equal(created.cards.length, 2);
  assert.equal(created.cards[1].id, 'card-2');
  assert.equal(updated.cards[0].status, 'done');
  assert.equal(colors.colors.doing, '#7c3aed');
  assert.deepEqual(linked.session_links[0].task_ids, ['card-1', 'card-2']);
  assert.equal(statusLinked.session_links[0].status_link_enabled, false);
  assert.equal(calendars.length, 1);
  assert.equal(occurrences.length, 1);
  assert.equal(occurrences[0].title, 'Serializability drill');
  assert.equal(layers.reviews.length, 1);
  assert.equal(layers.automations.length, 1);
  assert.equal(layers.footprints.length, 1);

  for (const call of calls) {
    assert.equal(call.config.params.dt_workspace, 'ws-plan');
  }
});
