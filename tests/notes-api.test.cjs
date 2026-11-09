const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { createLoader } = require('./helpers/rich-markdown.cjs');

const ROOT = path.resolve(__dirname, '..');

function loadNotesModule(relativePath, overrides = {}) {
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

test('notes repository scopes list, get, create, save, delete, suggestions, and Dito edits by dt_workspace', async () => {
  const { calls, module } = loadNotesModule('src/features/notes/repository.ts', {
    get: async (url) => {
      if (url === '/documents') {
        return {
          data: {
            documents: [
              {
                id: 'a1b2c3d4',
                title: 'Isolation: a working model',
                preview: 'Start with the invariant',
                created_at: 1700000000,
                updated_at: 1700000100,
                parent_id: null,
                icon: 'book',
                pinned: true,
                revision: 2,
              },
            ],
          },
        };
      }
      if (url === '/documents/a1b2c3d4') {
        return {
          data: {
            id: 'a1b2c3d4',
            title: 'Isolation: a working model',
            content: 'Start with the invariant\n\nUse a read/write sequence.',
            preview: 'Start with the invariant',
            created_at: 1700000000,
            updated_at: 1700000100,
            parent_id: null,
            icon: 'book',
            cover: '',
            pinned: true,
            revision: 2,
            blocks: [],
          },
        };
      }
      if (url === '/documents/a1b2c3d4/suggestions') {
        return {
          data: {
            suggestions: [
              {
                id: 'sug-1',
                operation: 'replace',
                block_id: 'b1',
                markdown: 'Write two overlapping transactions.',
                explanation: 'Clarifies the example.',
                original: { content: 'Use a read/write sequence.' },
                status: 'pending',
              },
            ],
          },
        };
      }
      throw new Error(`Unexpected GET ${url}`);
    },
    post: async (url, data) => {
      if (url === '/documents') {
        return {
          data: {
            id: 'b2c3d4e5',
            title: data.title,
            content: data.content,
            preview: data.content,
            created_at: 1700000200,
            updated_at: 1700000200,
            parent_id: null,
            icon: '',
            cover: '',
            pinned: false,
            revision: 1,
            blocks: [],
          },
        };
      }
      if (url === '/documents/a1b2c3d4/suggestions/sug-1') {
        return {
          data: {
            id: 'a1b2c3d4',
            title: 'Isolation: a working model',
            content: 'Write two overlapping transactions.',
            preview: 'Write two overlapping transactions.',
            created_at: 1700000000,
            updated_at: 1700000300,
            parent_id: null,
            icon: 'book',
            cover: '',
            pinned: true,
            revision: 3,
            blocks: [],
          },
        };
      }
      if (url === '/documents/actions/edit') {
        return {
          data: {
            edited_text: 'Refined: ' + data.text,
            operation_id: 'op-99',
          },
        };
      }
      throw new Error(`Unexpected POST ${url}`);
    },
    put: async (url, data) => ({
      data: {
        id: 'a1b2c3d4',
        title: data.title ?? 'Isolation: a working model',
        content: data.content ?? '',
        preview: data.content ?? '',
        created_at: 1700000000,
        updated_at: 1700000400,
        parent_id: null,
        icon: 'book',
        cover: '',
        pinned: true,
        revision: (data.expected_revision ?? 2) + 1,
        blocks: [],
      },
    }),
    delete: async () => ({ data: { deleted: true } }),
  });

  const list = await module.listNotes('ws-dev');
  const page = await module.getNote('ws-dev', 'a1b2c3d4');
  const created = await module.createNote('ws-dev', {
    title: 'New note',
    content: 'Initial body',
  });
  const saved = await module.saveNote('ws-dev', 'a1b2c3d4', {
    title: 'Updated title',
    content: 'Updated body',
    expected_revision: 2,
  });
  const suggestions = await module.listNoteSuggestions('ws-dev', 'a1b2c3d4');
  const reviewed = await module.reviewNoteSuggestion('ws-dev', 'a1b2c3d4', 'sug-1', true);
  const edited = await module.requestDitoEdit('ws-dev', {
    text: 'Draft text',
    action: 'rewrite',
  });
  const deleted = await module.deleteNote('ws-dev', 'a1b2c3d4');

  assert.equal(list.length, 1);
  assert.equal(list[0].id, 'a1b2c3d4');
  assert.equal(page.revision, 2);
  assert.equal(created.id, 'b2c3d4e5');
  assert.equal(saved.revision, 3);
  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].original_text, 'Use a read/write sequence.');
  assert.equal(reviewed.content, 'Write two overlapping transactions.');
  assert.equal(edited.edited_text, 'Refined: Draft text');
  assert.equal(deleted, true);

  for (const call of calls) {
    assert.equal(call.config.params.dt_workspace, 'ws-dev');
  }
});
