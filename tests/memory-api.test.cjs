const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { createLoader } = require('./helpers/rich-markdown.cjs');

const ROOT = path.resolve(__dirname, '..');

function loadMemoryModule(relativePath, overrides = {}) {
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

test('memory repository scopes overview, docs, runs, evidence, and conversation imports by dt_workspace', async () => {
  const { calls, module } = loadMemoryModule('src/features/memory/repository.ts', {
    get: async (url) => {
      if (url === '/memory/overview') {
        return {
          data: {
            docs: [
              {
                layer: 'L2',
                key: 'chat',
                exists: true,
                updated_at: '2026-04-05T10:00:00Z',
                entry_count: 1,
                backlog: 0,
              },
              {
                layer: 'L3',
                key: 'recent',
                exists: true,
                updated_at: '2026-04-05T11:00:00Z',
                entry_count: 1,
                backlog: 0,
              },
            ],
            backups: ['2026-04-01'],
          },
        };
      }
      if (url.startsWith('/memory/snapshot/')) {
        const surface = url.split('/').pop();
        return {
          data: {
            surface,
            entities:
              surface === 'chat'
                ? [
                    {
                      id: 'sess-1',
                      label: 'Isolation levels discussion',
                      ts: '2026-04-05T09:00:00Z',
                      content: 'Explained serializable vs repeatable read.',
                      metadata: {},
                      fingerprint: 'fp-1',
                    },
                  ]
                : [],
            last_refresh: '2026-04-05T09:30:00Z',
            pending_changes: [],
          },
        };
      }
      if (url === '/memory/doc/L2/chat/lines') {
        return {
          data: {
            layer: 'L2',
            key: 'chat',
            lines: [
              {
                number: 1,
                kind: 'bullet',
                text: 'Prefers concrete transaction timelines',
                entry_id: 'm_01HZX000000000000000000001',
                section: 'Concepts',
              },
            ],
          },
        };
      }
      if (url === '/memory/doc/L2/chat') {
        return {
          data: {
            layer: 'L2',
            key: 'chat',
            content:
              '# chat memory\n\n## Concepts\n\n- Prefers concrete transaction timelines [^1] <!--m_01HZX000000000000000000001-->\n\n[^1]: chat:sess-1\n',
          },
        };
      }
      if (url.startsWith('/memory/doc/L2/')) {
        const key = url.split('/').pop();
        return { data: { layer: 'L2', key, content: '' } };
      }
      if (url === '/memory/doc/L3/recent') {
        return {
          data: {
            layer: 'L3',
            key: 'recent',
            content:
              '# Recent summary\n\n## Focus\n\n- Studying database isolation levels [^1] <!--m_01HZX000000000000000000002-->\n\n[^1]: m_01HZX000000000000000000001\n',
          },
        };
      }
      if (url.startsWith('/memory/doc/L3/')) {
        const key = url.split('/').pop();
        return { data: { layer: 'L3', key, content: '' } };
      }
      if (url === '/memory/settings') {
        return {
          data: {
            update: { l2_budget: 25, l3_budget: 12 },
            audit: { l2_budget: 20, l3_budget: 10 },
            dedup: { iterations: 4, auto_after_update: true },
          },
        };
      }
      if (url === '/memory/runs' || url === '/memory/runs/run-1') {
        const run = {
          id: 'run-1',
          layer: 'L2',
          key: 'chat',
          mode: 'update',
          status: 'done',
          started_at: '2026-04-05T10:00:00Z',
          ended_at: '2026-04-05T10:01:00Z',
          error: null,
          event_count: 5,
          undo_count: 1,
        };
        return { data: url === '/memory/runs' ? { runs: [run] } : run };
      }
      if (url === '/imports/chat-history') {
        return {
          data: {
            sessions: [
              {
                session_id: 'imported_chatgpt_conv1',
                title: 'Postgres MVCC deep dive',
                created_at: 1700000000,
                updated_at: 1700000500,
                message_count: 6,
                preferences: {
                  import: {
                    source: 'chatgpt',
                    external_id: 'conv1',
                  },
                },
              },
            ],
          },
        };
      }
      if (url === '/subagents/detect') {
        return {
          data: {
            backends: [
              {
                kind: 'claude_code',
                display_name: 'Claude Code',
                available: true,
                version: '1.0.0',
                detail: 'Detected on server',
              },
            ],
          },
        };
      }
      if (url === '/subagents/connections') {
        return {
          data: {
            connections: [
              {
                name: 'Claude Code',
                agent_kind: 'claude_code',
                cwd: '/srv/project',
                description: '',
              },
            ],
          },
        };
      }
      throw new Error(`Unexpected GET ${url}`);
    },
    post: async (url, data) => {
      if (url.startsWith('/memory/snapshot/') && url.endsWith('/refresh')) {
        return {
          data: {
            surface: 'chat',
            changes: [{ kind: 'added', entity_id: 'sess-1' }],
            last_refresh: '2026-04-05T10:05:00Z',
          },
        };
      }
      if (url === '/memory/runs/start') {
        return {
          data: {
            id: 'run-2',
            layer: data.layer,
            key: data.key,
            mode: data.mode,
            status: 'running',
            started_at: '2026-04-05T10:10:00Z',
            ended_at: null,
            error: null,
            event_count: 1,
            undo_count: 0,
          },
        };
      }
      if (url === '/memory/runs/run-2/cancel') {
        return { data: { run_id: 'run-2', cancelled: true } };
      }
      if (url === '/memory/runs/run-1/undo') {
        return { data: { run_id: 'run-1', undone: true, undo_count: 0 } };
      }
      if (url === '/memory/doc/L2/chat/reset') {
        return { data: { layer: 'L2', key: 'chat', reset: true } };
      }
      if (url === '/imports/chat-history') {
        return {
          data: {
            imported: data.sessions.length,
            skipped: 0,
            sessions: data.sessions.map((s) => ({
              external_id: s.external_id,
              session_id: `imported_${data.source}_${s.external_id}`,
              imported: true,
            })),
          },
        };
      }
      if (url === '/subagents/connections') {
        return {
          data: {
            status: 'connected',
            name: data.name,
            agent_kind: data.agent_kind,
            cwd: data.cwd,
          },
        };
      }
      throw new Error(`Unexpected POST ${url}`);
    },
    put: async (url) => {
      if (url === '/memory/doc/L2/chat') {
        return { data: { layer: 'L2', key: 'chat', saved: true } };
      }
      throw new Error(`Unexpected PUT ${url}`);
    },
    delete: async (url) => {
      if (url.startsWith('/memory/doc/L2/chat/entry/')) {
        return { data: { deleted: 'm_01HZX000000000000000000001' } };
      }
      if (url.startsWith('/subagents/connections/')) {
        return { data: { status: 'disconnected' } };
      }
      throw new Error(`Unexpected DELETE ${url}`);
    },
  });

  const overview = await module.getMemoryOverview('ws-mem');
  const snap = await module.getMemorySnapshot('ws-mem', 'chat');
  const refreshed = await module.refreshMemorySnapshot('ws-mem', 'chat');
  const doc = await module.getMemoryDoc('ws-mem', 'L2', 'chat');
  const lines = await module.getMemoryDocLines('ws-mem', 'L2', 'chat');
  const saved = await module.saveMemoryDoc('ws-mem', 'L2', 'chat', '# Updated\n');
  const deleted = await module.deleteMemoryEntry(
    'ws-mem',
    'L2',
    'chat',
    'm_01HZX000000000000000000001',
  );
  const reset = await module.resetMemoryDoc('ws-mem', 'L2', 'chat');
  const settings = await module.getMemorySettings('ws-mem');
  const runs = await module.listMemoryRuns('ws-mem', 'L2', 'chat');
  const started = await module.startMemoryRun('ws-mem', {
    layer: 'L2',
    key: 'chat',
    mode: 'update',
    budget: 20,
  });
  const cancelled = await module.cancelMemoryRun('ws-mem', 'run-2');
  const undone = await module.undoMemoryRun('ws-mem', 'run-1');
  const evidence = await module.fetchMemoryEvidence('ws-mem');

  const parsedExport = module.parseImportedConversationsPayload(
    JSON.stringify([
      {
        id: 'conv-42',
        title: 'B-Tree indexing',
        create_time: 1700000000,
        update_time: 1700000100,
        mapping: {
          n1: {
            id: 'n1',
            parent: null,
            children: ['n2'],
            message: {
              author: { role: 'user' },
              create_time: 1700000000,
              content: { content_type: 'text', parts: ['How do B-Trees split?'] },
            },
          },
          n2: {
            id: 'n2',
            parent: 'n1',
            children: [],
            message: {
              author: { role: 'assistant' },
              create_time: 1700000050,
              content: { content_type: 'text', parts: ['By promoting the median key.'] },
            },
          },
        },
      },
    ]),
    'conversations.json',
    'chatgpt',
  );

  const imported = await module.importConversations(
    'ws-mem',
    parsedExport.source,
    parsedExport.sessions,
  );
  const importedList = await module.listImportedConversations('ws-mem');
  const backends = await module.detectSubagentBackends('ws-mem');
  const connections = await module.listSubagentConnections('ws-mem');
  const connected = await module.connectSubagentFolder('ws-mem', {
    name: 'Claude Code',
    agent_kind: 'claude_code',
    cwd: '/srv/project',
  });
  const disconnected = await module.disconnectSubagentFolder('ws-mem', 'Claude Code');

  assert.equal(overview.docs.length, 2);
  assert.equal(snap.entities.length, 1);
  assert.equal(refreshed.changesCount, 1);
  assert.ok(doc.content.includes('Prefers concrete transaction timelines'));
  assert.equal(lines.length, 1);
  assert.equal(saved, true);
  assert.equal(deleted, true);
  assert.equal(reset, true);
  assert.equal(settings.update.l2_budget, 25);
  assert.equal(runs.length, 1);
  assert.equal(started.id, 'run-2');
  assert.equal(cancelled, true);
  assert.equal(undone.undone, true);

  // Verify L3 -> L2 -> L1 evidence links
  const l3Item = evidence.byId['L3:recent:m_01HZX000000000000000000002'];
  const l2Item = evidence.byId['L2:chat:m_01HZX000000000000000000001'];
  const l1Item = evidence.byId['L1:chat:sess-1'];
  assert.ok(l3Item);
  assert.ok(l2Item);
  assert.ok(l1Item);
  assert.deepEqual(l3Item.inwardIds, ['L2:chat:m_01HZX000000000000000000001']);
  assert.deepEqual(l2Item.outwardIds, ['L3:recent:m_01HZX000000000000000000002']);
  assert.deepEqual(l2Item.inwardIds, ['L1:chat:sess-1']);
  assert.deepEqual(l1Item.outwardIds, ['L2:chat:m_01HZX000000000000000000001']);

  assert.equal(parsedExport.source, 'chatgpt');
  assert.equal(parsedExport.sessions.length, 1);
  assert.equal(parsedExport.sessions[0].messages.length, 2);
  assert.equal(imported.imported, 1);
  assert.equal(importedList.length, 1);
  assert.equal(backends.length, 1);
  assert.equal(connections.length, 1);
  assert.equal(connected.name, 'Claude Code');
  assert.equal(disconnected, true);

  for (const call of calls) {
    assert.equal(call.config.params.dt_workspace, 'ws-mem');
  }
});
