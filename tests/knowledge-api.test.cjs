const test = require('node:test');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers/rich-markdown.cjs');

const ROOT = path.resolve(__dirname, '..');

test('Knowledge Base repository integrates with backend KB, sources, indexing, engine, and move endpoints', async () => {
  const calls = [];

  const apiMock = {
    async get(url, config) {
      calls.push({ method: 'GET', url, config });
      if (url === '/knowledge-bases') {
        return {
          data: [
            {
              id: 'user:kb:Databases',
              name: 'Databases',
              is_default: true,
              statistics: {
                raw_documents: 2,
                images: 0,
                content_lists: 2,
                rag_initialized: true,
              },
              metadata: {
                rag_provider: 'llamaindex',
                search_mode: 'hybrid',
                embedding_model: 'text-embedding-3-small',
                embedding_dimension: 1536,
              },
              path: '/data/kb/Databases',
              status: 'ready',
            },
          ],
        };
      }
      if (url === '/knowledge-bases/Databases') {
        return {
          data: {
            id: 'user:kb:Databases',
            name: 'Databases',
            is_default: true,
            statistics: {
              raw_documents: 2,
              images: 0,
              content_lists: 2,
              rag_initialized: true,
            },
            metadata: {
              rag_provider: 'llamaindex',
              search_mode: 'hybrid',
              embedding_model: 'text-embedding-3-small',
              embedding_dimension: 1536,
            },
            path: '/data/kb/Databases',
            status: 'ready',
          },
        };
      }
      if (url === '/knowledge-bases/Databases/files') {
        return {
          data: {
            files: [
              {
                name: 'postgresql.pdf',
                type: 'file',
                size: 2621440,
                modified: 1700000000,
                mime_type: 'application/pdf',
              },
            ],
          },
        };
      }
      if (url === '/knowledge-bases/Databases/file-preview-text/postgresql.pdf') {
        return { data: 'PostgreSQL MVCC and transaction isolation overview.' };
      }
      if (url === '/knowledge-bases/Databases/config') {
        return { data: { kb_name: 'Databases', config: { search_mode: 'hybrid' } } };
      }
      if (url === '/knowledge-bases/Databases/indexing-run') {
        return {
          data: {
            run: {
              run_id: 'run-1',
              status: 'completed',
              embedding_dimension: 1536,
              completed_at: '2026-11-05',
            },
          },
        };
      }
      if (url === '/knowledge-bases/Databases/progress') {
        return {
          data: {
            kb_name: 'Databases',
            status: 'ready',
            progress: { stage: 'ready', message: 'Index is ready', percent: 100 },
          },
        };
      }
      if (url === '/knowledge-bases/Databases/linked-folders') {
        return {
          data: {
            folders: [
              {
                id: 'folder-1',
                path: '/srv/docs/postgres',
                last_synced_at: '2026-11-05T12:00:00Z',
              },
            ],
          },
        };
      }
      if (url === '/knowledge-bases/Databases/github-sources') {
        return {
          data: {
            github_sources: [
              {
                id: 'gh-1',
                repo: 'HKUDS/DeepTutor',
                branch: 'main',
                path: 'docs',
                glob: '**/*.md',
              },
            ],
          },
        };
      }
      if (url === '/knowledge-bases/Databases/web-sources') {
        return {
          data: {
            web_sources: [
              {
                id: 'web-1',
                url: 'https://www.postgresql.org/docs/current/mvcc.html',
                max_depth: 2,
                max_pages: 20,
                auto_sync_enabled: true,
                sync_interval_hours: 24,
                last_sync_status: 'ready',
              },
            ],
          },
        };
      }
      if (url === '/knowledge-bases/rag-providers') {
        return {
          data: {
            providers: [
              {
                id: 'llamaindex',
                name: 'LlamaIndex',
                description: 'Vector and BM25 hybrid index',
                available: true,
                modes: ['hybrid', 'vector', 'bm25'],
                default_mode: 'hybrid',
              },
            ],
          },
        };
      }
      if (url === '/knowledge-bases/rag-pipelines/llamaindex/config') {
        return {
          data: {
            retrieval_profile: 'hybrid',
            top_k: 5,
            chunk_size: 512,
            chunk_overlap: 50,
          },
        };
      }
      if (url === '/knowledge-bases/rag-pipelines/llamaindex/preflight') {
        return {
          data: {
            ok: true,
            checks: [{ key: 'llm', label: 'Active LLM', ok: true, detail: 'gpt-4o' }],
          },
        };
      }
      throw new Error(`Unexpected GET ${url}`);
    },
    async post(url, body, config) {
      calls.push({ method: 'POST', url, body, config });
      if (url === '/knowledge-bases') {
        return { data: { name: 'System Design', status: 'ready' } };
      }
      if (url === '/knowledge-bases/Databases/upload') {
        return { data: { uploaded_count: 1, status: 'processing' } };
      }
      if (url === '/knowledge-bases/delete') {
        return { data: { message: 'deleted' } };
      }
      if (url === '/knowledge-bases/Databases/reindex') {
        return { data: { status: 'reindexing', task_id: 'task-reindex-1' } };
      }
      if (url === '/knowledge-bases/Databases/retry') {
        return { data: { status: 'processing', task_id: 'task-retry-1' } };
      }
      if (url === '/knowledge-bases/Databases/link-folder') {
        return {
          data: {
            folder: { id: 'folder-2', path: body.folder_path },
          },
        };
      }
      if (url === '/knowledge-bases/Databases/sync-folder/folder-2') {
        return {
          data: { status: 'syncing', added_files: ['a.md'], modified_files: [] },
        };
      }
      if (url === '/knowledge-bases/Databases/github-source') {
        return {
          data: {
            source: {
              id: 'gh-2',
              repo: body.repo,
              branch: body.branch,
              path: body.path,
              glob: body.glob,
            },
          },
        };
      }
      if (url === '/knowledge-bases/Databases/sync-github') {
        return { data: { status: 'syncing', new_or_updated_files: 3 } };
      }
      if (url === '/knowledge-bases/Databases/web-source') {
        return {
          data: {
            source: {
              id: 'web-2',
              url: body.url,
              max_depth: body.max_depth,
              max_pages: body.max_pages,
              auto_sync_enabled: false,
              sync_interval_hours: 24,
            },
          },
        };
      }
      if (url === '/knowledge-bases/Databases/sync-web') {
        return { data: { status: 'syncing', new_or_updated_files: 2 } };
      }
      if (url === '/settings/workspace/knowledge-bases/preview-move') {
        return {
          data: {
            source_id: body.source_id,
            name: 'Databases',
            source_workspace_id: 'ws-1',
            target_workspace_id: body.target_workspace_id,
            affected_workspaces: ['ws-1', body.target_workspace_id],
            can_move: true,
          },
        };
      }
      if (url === '/settings/workspace/knowledge-bases/move') {
        return {
          data: {
            status: 'moved',
            id: body.source_id,
            name: 'Databases',
            target_workspace_id: body.target_workspace_id,
          },
        };
      }
      throw new Error(`Unexpected POST ${url}`);
    },
    async put(url, body, config) {
      calls.push({ method: 'PUT', url, body, config });
      if (url === '/knowledge-bases/default/Databases') {
        return { data: { status: 'success', default_kb: 'Databases' } };
      }
      if (url === '/knowledge-bases/Databases/config') {
        return { data: { status: 'success', config: body } };
      }
      if (url === '/knowledge-bases/Databases/web-source/web-2/schedule') {
        return {
          data: {
            source: {
              id: 'web-2',
              url: 'https://redis.io/docs/latest',
              max_depth: 2,
              max_pages: 20,
              auto_sync_enabled: body.auto_sync_enabled,
              sync_interval_hours: body.sync_interval_hours,
            },
          },
        };
      }
      if (url === '/knowledge-bases/rag-pipelines/llamaindex/config') {
        return { data: body };
      }
      throw new Error(`Unexpected PUT ${url}`);
    },
    async delete(url, config) {
      calls.push({ method: 'DELETE', url, config });
      if (url === '/knowledge-bases/Databases/files/postgresql.pdf') {
        return {
          data: { status: 'ok', path: 'postgresql.pdf', was_indexed: true },
        };
      }
      if (url === '/knowledge-bases/Databases/linked-folders/folder-2') {
        return { data: { status: 'unlinked' } };
      }
      if (url === '/knowledge-bases/Databases/github-source/gh-2') {
        return { data: { status: 'removed' } };
      }
      if (url === '/knowledge-bases/Databases/web-source/web-2') {
        return { data: { status: 'removed' } };
      }
      throw new Error(`Unexpected DELETE ${url}`);
    },
  };

  const loadModule = createLoader({
    '@/api/client': { api: apiMock },
    'expo-document-picker': {
      getDocumentAsync: async () => ({
        canceled: false,
        assets: [
          {
            uri: 'file:///tmp/architecture.pdf',
            name: 'architecture.pdf',
            mimeType: 'application/pdf',
            size: 1048576,
          },
        ],
      }),
    },
  });
  const repo = loadModule(path.join(ROOT, 'src/features/knowledge/repository.ts'));

  // 1. List and inspect KBs + files + preview
  const kbs = await repo.listKnowledgeBases('ws-1');
  assert.equal(kbs.length, 1);
  assert.equal(kbs[0].name, 'Databases');
  assert.equal(kbs[0].statistics.raw_documents, 2);

  const detail = await repo.getKnowledgeBase('Databases', 'ws-1');
  assert.equal(detail.embedding_dimension, 1536);

  const files = await repo.listKnowledgeBaseFiles('Databases', 'ws-1');
  assert.equal(files.length, 1);
  assert.equal(files[0].name, 'postgresql.pdf');

  const preview = await repo.getKnowledgeBaseFilePreview(
    'Databases',
    'postgresql.pdf',
    'ws-1',
  );
  assert.match(preview, /PostgreSQL MVCC/);

  const removedFile = await repo.deleteKnowledgeBaseFile(
    'Databases',
    'postgresql.pdf',
    'ws-1',
  );
  assert.equal(removedFile.was_indexed, true);

  // 2. Create KB, pick files, upload files, default & config
  const picked = await repo.pickKnowledgeBaseFiles();
  assert.equal(picked.length, 1);
  assert.equal(picked[0].name, 'architecture.pdf');

  const created = await repo.createKnowledgeBase(
    {
      name: 'System Design',
      rag_provider: 'llamaindex',
      search_mode: 'hybrid',
      files: picked,
    },
    'ws-1',
  );
  assert.equal(created.name, 'System Design');

  const uploaded = await repo.uploadKnowledgeBaseFiles(
    'Databases',
    picked,
    'books',
    'ws-1',
  );
  assert.equal(uploaded.uploaded_count, 1);

  await repo.setDefaultKnowledgeBase('Databases', 'ws-1');
  const cfg = await repo.getKnowledgeBaseConfig('Databases', 'ws-1');
  assert.equal(cfg.search_mode, 'hybrid');
  const updatedCfg = await repo.updateKnowledgeBaseConfig(
    'Databases',
    { search_mode: 'vector' },
    'ws-1',
  );
  assert.equal(updatedCfg.search_mode, 'vector');

  // 3. Indexing & recovery
  const run = await repo.getIndexingRun('Databases', 'ws-1');
  assert.equal(run.run_id, 'run-1');
  const prog = await repo.getIndexingProgress('Databases', 'ws-1');
  assert.equal(prog.progress.percent, 100);
  const reindexed = await repo.reindexKnowledgeBase('Databases', 'ws-1');
  assert.equal(reindexed.status, 'reindexing');
  const retried = await repo.retryKnowledgeBase('Databases', 'ws-1');
  assert.equal(retried.status, 'processing');

  // 4. Connected sources (folders, GitHub, Web)
  const folders = await repo.listLinkedFolders('Databases', 'ws-1');
  assert.equal(folders.length, 1);
  const linked = await repo.linkServerFolder(
    'Databases',
    '/srv/docs/redis',
    'ws-1',
  );
  assert.equal(linked.id, 'folder-2');
  const folderSync = await repo.syncLinkedFolder(
    'Databases',
    'folder-2',
    'ws-1',
  );
  assert.deepEqual(folderSync.added_files, ['a.md']);
  await repo.unlinkServerFolder('Databases', 'folder-2', 'ws-1');

  const ghList = await repo.listGitHubSources('Databases', 'ws-1');
  assert.equal(ghList.length, 1);
  const ghAdded = await repo.addGitHubSource(
    'Databases',
    { repo: 'HKUDS/LightRAG', branch: 'main', path: 'docs', glob: '**/*.md' },
    'ws-1',
  );
  assert.equal(ghAdded.id, 'gh-2');
  const ghSynced = await repo.syncGitHubSources('Databases', 'ws-1');
  assert.equal(ghSynced.new_or_updated_files, 3);
  await repo.removeGitHubSource('Databases', 'gh-2', 'ws-1');

  const webList = await repo.listWebSources('Databases', 'ws-1');
  assert.equal(webList.length, 1);
  const webAdded = await repo.addWebSource(
    'Databases',
    {
      url: 'https://redis.io/docs/latest',
      max_depth: 2,
      max_pages: 20,
      auto_sync_enabled: true,
      sync_interval_hours: 12,
    },
    'ws-1',
  );
  assert.equal(webAdded.auto_sync_enabled, true);
  assert.equal(webAdded.sync_interval_hours, 12);
  const webSynced = await repo.syncWebSources('Databases', 'ws-1');
  assert.equal(webSynced.new_or_updated_files, 2);
  await repo.removeWebSource('Databases', 'web-2', 'ws-1');

  // 5. Engines & preflight
  const providers = await repo.listRagProviders();
  assert.equal(providers.length, 1);
  assert.equal(providers[0].id, 'llamaindex');
  const pipeCfg = await repo.getPipelineConfig('llamaindex');
  assert.equal(pipeCfg.top_k, 5);
  const savedPipe = await repo.updatePipelineConfig('llamaindex', { top_k: 8 });
  assert.equal(savedPipe.top_k, 8);
  const preflight = await repo.preflightRagProvider('llamaindex');
  assert.equal(preflight.ok, true);

  // 6. Move & delete KB
  const movePreview = await repo.previewKnowledgeBaseMove(
    'user:kb:Databases',
    'ws-2',
  );
  assert.equal(movePreview.can_move, true);
  const moved = await repo.moveKnowledgeBase('user:kb:Databases', 'ws-2');
  assert.equal(moved.status, 'moved');
  await repo.deleteKnowledgeBase('Databases', 'ws-1');

  assert.ok(calls.length >= 25);
});
