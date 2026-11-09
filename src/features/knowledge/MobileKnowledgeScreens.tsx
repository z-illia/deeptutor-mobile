import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDesign } from '@/shared/design/DesignProvider';
import { InlineAlert } from '@/shared/ui/Feedback';
import { useCopy } from '@/features/entry/copy';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import {
  MobileAction,
  MobileChoice,
  MobileField,
  MobilePage,
  MobileRow,
  MobileText,
} from '@/features/mobile/ScreenLayout';
import {
  SCREEN_PRESET_KB_NAMES,
  addGitHubSource,
  addWebSource,
  createKnowledgeBase,
  deleteKnowledgeBase,
  deleteKnowledgeBaseFile,
  getActiveEngineId,
  getActiveKbFile,
  getActiveKbName,
  getIndexingProgress,
  getIndexingRun,
  getKnowledgeBase,
  getKnowledgeBaseConfig,
  getKnowledgeBaseFilePreview,
  getPipelineConfig,
  linkServerFolder,
  listGitHubSources,
  listKnowledgeBaseFiles,
  listKnowledgeBases,
  listLinkedFolders,
  listRagProviders,
  listWebSources,
  moveKnowledgeBase,
  pickKnowledgeBaseFiles,
  preflightRagProvider,
  previewKnowledgeBaseMove,
  reindexKnowledgeBase,
  removeGitHubSource,
  removeWebSource,
  retryKnowledgeBase,
  setActiveEngineId,
  setActiveKbFile,
  setActiveKbName,
  setDefaultKnowledgeBase,
  syncGitHubSources,
  syncLinkedFolder,
  syncWebSources,
  unlinkServerFolder,
  updateKnowledgeBaseConfig,
  updatePipelineConfig,
  updateWebSourceSchedule,
  uploadKnowledgeBaseFiles,
  type GitHubSourceItem,
  type IndexingProgressInfo,
  type IndexingRunInfo,
  type KnowledgeBaseFileEntry,
  type KnowledgeBaseSummary,
  type KnowledgeMovePreview,
  type LinkedFolderItem,
  type PickedKnowledgeFile,
  type RagPreflightReport,
  type RagProviderItem,
  type WebSourceItem,
} from './repository';

function NoticeCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  const { colors } = useDesign();
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 8,
      }}>
      <MobileText style={{ fontWeight: '600' }}>{title}</MobileText>
      <MobileText muted>{body}</MobileText>
      {children}
    </View>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 8 }}>
      <MobileText muted style={{ fontWeight: '600' }}>
        {title}
      </MobileText>
      <View>{children}</View>
    </View>
  );
}

function formatFileSize(bytes?: number): string {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes <= 0) {
    return '0 KB';
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatProviderName(id: string): string {
  const key = id.trim().toLowerCase();
  if (key === 'llamaindex') return 'LlamaIndex';
  if (key === 'pageindex_oss' || key === 'pageindex-oss') return 'PageIndex OSS';
  if (key === 'pageindex') return 'PageIndex Cloud';
  if (key === 'graphrag') return 'GraphRAG';
  if (key === 'lightrag') return 'LightRAG';
  if (key === 'lightrag_server' || key === 'lightrag-server') return 'LightRAG Server';
  if (key === 'ima') return 'Tencent IMA';
  return id;
}

function useKbScope(): { scope: string; workspaceId: string; workspaceName: string } {
  const auth = useAuth();
  const ws = useWorkspaces();
  const workspaceId = ws.selectedWorkspaceId || '';
  const workspaceName =
    ws.workspaces.find(item => item.workspace_id === workspaceId)?.display_name ||
    'Software Development';
  const scope = `${auth.serverUrl}:${auth.session?.profile?.id ?? 'anon'}:${workspaceId || 'default'}`;
  return { scope, workspaceId, workspaceName };
}

function resolveTargetKbName(
  paramKb: string | undefined,
  screenNumber: number | undefined,
  scope: string,
  items: KnowledgeBaseSummary[],
): string {
  if (paramKb && paramKb.trim()) return paramKb.trim();
  const preset = screenNumber ? SCREEN_PRESET_KB_NAMES[screenNumber] : undefined;
  if (preset && screenNumber !== 41) {
    const matched = items.find(i => i.name.toLowerCase() === preset.toLowerCase());
    if (matched) return matched.name;
  }
  const active = getActiveKbName(scope);
  if (active) {
    const matched = items.find(i => i.name === active);
    if (matched) return matched.name;
  }
  if (preset) {
    const matched = items.find(i => i.name.toLowerCase() === preset.toLowerCase());
    if (matched) return matched.name;
  }
  const def = items.find(i => i.is_default);
  if (def) return def.name;
  return items[0]?.name || active || preset || 'Databases';
}

export function KnowledgeBasesListScreen() {
  const t = useCopy();
  const { scope, workspaceId, workspaceName } = useKbScope();
  const [items, setItems] = useState<KnowledgeBaseSummary[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const list = await listKnowledgeBases(workspaceId);
      setItems(list);
      if (list.length && !getActiveKbName(scope)) {
        const def = list.find(i => i.is_default) ?? list[0];
        if (def) setActiveKbName(def.name, scope);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  }, [scope, t, workspaceId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.rag_provider.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <MobilePage
      title={t('Knowledge bases')}
      fallback="/mobile/26"
      tab={26}
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction onPress={() => router.push('/mobile/43')}>
            {t('New knowledge base')}
          </MobileAction>
          <MobileAction
            variant="secondary"
            loading={busy}
            onPress={() => void load()}>
            {t('Refresh')}
          </MobileAction>
        </View>
      }>
      <MobileText muted>
        {`${items.length} · ${workspaceName}`}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <MobileField
        label={t('Search knowledge bases')}
        placeholder={t('Search by name')}
        value={query}
        onChangeText={setQuery}
      />
      <View>
        {filtered.length === 0 ? (
          <NoticeCard
            title={t('No files yet')}
            body={t('Add documents or connect a source to begin.')}
          />
        ) : (
          filtered.map(kb => {
            const docsCount = kb.statistics.raw_documents;
            const docLabel =
              docsCount === 0
                ? t('No documents yet')
                : `${docsCount} · ${formatProviderName(kb.rag_provider)}${
                    kb.is_default ? ` · ${t('Default')}` : ''
                  }`;
            return (
              <MobileRow
                key={kb.id || kb.name}
                title={kb.name}
                description={docLabel}
                selected={kb.is_default}
                onPress={() => {
                  setActiveKbName(kb.name, scope);
                  router.push({
                    pathname: '/mobile/[screen]',
                    params: { screen: '41', kb: kb.name },
                  });
                }}
              />
            );
          })
        )}
      </View>
      <MobileRow
        title={t('Knowledge engines')}
        description={t('Local · server · cloud · external sources')}
        onPress={() => router.push('/mobile/59')}
      />
    </MobilePage>
  );
}

export function KnowledgeBaseDetailScreen({
  screenNumber = 41,
}: {
  screenNumber?: number;
}) {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId, workspaceName } = useKbScope();
  const [kb, setKb] = useState<KnowledgeBaseSummary | null>(null);
  const [files, setFiles] = useState<KnowledgeBaseFileEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const all = await listKnowledgeBases(workspaceId);
      const targetName = resolveTargetKbName(
        params.kb,
        screenNumber,
        scope,
        all,
      );
      setActiveKbName(targetName, scope);
      const [detail, fileEntries] = await Promise.all([
        getKnowledgeBase(targetName, workspaceId).catch(
          () =>
            all.find(item => item.name === targetName) ?? {
              id: `user:kb:${targetName}`,
              name: targetName,
              is_default: false,
              statistics: {
                raw_documents: 0,
                images: 0,
                content_lists: 0,
                rag_initialized: false,
              },
              status: 'ready',
              rag_provider: 'llamaindex',
              search_mode: 'hybrid',
              embedding_model: 'text-embedding-3-small',
              embedding_dimension: 1536,
              description: '',
            },
        ),
        listKnowledgeBaseFiles(targetName, workspaceId).catch(() => []),
      ]);
      setKb(detail);
      setFiles(fileEntries.filter(f => f.type === 'file'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  }, [params.kb, scope, screenNumber, t, workspaceId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const activeName =
    kb?.name ||
    params.kb ||
    getActiveKbName(scope) ||
    SCREEN_PRESET_KB_NAMES[screenNumber] ||
    t('Databases');

  const statusText =
    kb?.status === 'ready' || !kb?.status ? t('Ready') : kb.status;
  const providerLabel = formatProviderName(kb?.rag_provider || 'llamaindex');

  return (
    <MobilePage
      title={activeName}
      fallback="/mobile/40"
      tab={26}
      footer={
        <MobileAction
          onPress={() => {
            setActiveKbName(activeName, scope);
            router.push('/chat');
          }}>
          {t('Use in a conversation')}
        </MobileAction>
      }>
      <MobileText muted>
        {`${statusText} · ${providerLabel} · ${workspaceName}`}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <MobileText style={{ fontSize: 28, lineHeight: 34, fontWeight: '700' }}>
        {t('Your database\nreference shelf.')}
      </MobileText>

      <SectionBlock title={`${files.length} documents`}>
        {files.length === 0 ? (
          <NoticeCard
            title={t('No files yet')}
            body={t('Add documents or connect a source to begin.')}
          />
        ) : (
          files.map(file => {
            const ext =
              file.name.split('.').pop()?.toUpperCase() || 'PDF';
            return (
              <MobileRow
                key={file.name}
                title={file.name}
                description={`${ext} · ${formatFileSize(file.size)}`}
                onPress={() => {
                  setActiveKbName(activeName, scope);
                  setActiveKbFile(file.name, scope);
                  router.push({
                    pathname: '/mobile/[screen]',
                    params: { screen: '42', kb: activeName, file: file.name },
                  });
                }}
              />
            );
          })
        )}
      </SectionBlock>

      <SectionBlock title={t('Sources & indexing')}>
        <MobileRow
          title={t('Add documents')}
          description={t('Choose files or import a folder once')}
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '44', kb: activeName },
            })
          }
        />
        <MobileRow
          title={t('Connected sources')}
          description={t('Linked folders · GitHub · Web')}
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '45', kb: activeName },
            })
          }
        />
        <MobileRow
          title={t('Index versions')}
          description={t('2 versions · re-index and recovery details')}
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '50', kb: activeName },
            })
          }
        />
        <MobileRow
          title={t('Knowledge base settings')}
          description={t('Default, move, metadata and deletion')}
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '51', kb: activeName },
            })
          }
        />
      </SectionBlock>

      <MobileAction
        variant="secondary"
        loading={busy}
        onPress={() => void load()}>
        {t('Refresh')}
      </MobileAction>
    </MobilePage>
  );
}

export function KnowledgeSourcePreviewScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string; file?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const [filename, setFilename] = useState(
    params.file || getActiveKbFile(scope) || '',
  );
  const [previewText, setPreviewText] = useState('');
  const [fileMeta, setFileMeta] = useState<KnowledgeBaseFileEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const files = await listKnowledgeBaseFiles(kbName, workspaceId).catch(
        () => [],
      );
      const onlyFiles = files.filter(item => item.type === 'file');
      const targetFile =
        params.file ||
        getActiveKbFile(scope) ||
        onlyFiles[0]?.name ||
        '';
      setFilename(targetFile);
      if (targetFile) {
        setActiveKbFile(targetFile, scope);
        const found = onlyFiles.find(item => item.name === targetFile) ?? null;
        setFileMeta(found);
        const text = await getKnowledgeBaseFilePreview(
          kbName,
          targetFile,
          workspaceId,
        );
        setPreviewText(text);
      } else {
        setPreviewText('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  }, [kbName, params.file, scope, t, workspaceId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const handleRemoveFile = async () => {
    if (!filename) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteKnowledgeBaseFile(kbName, filename, workspaceId);
      setActiveKbFile('', scope);
      router.replace({
        pathname: '/mobile/[screen]',
        params: { screen: '41', kb: kbName },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setDeleting(false);
    }
  };

  const ext = filename ? filename.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF';
  const metaLine = fileMeta
    ? `${kbName} · ${ext} · ${formatFileSize(fileMeta.size)}`
    : `${kbName} · ${ext}`;

  return (
    <MobilePage
      title={t('Source preview')}
      fallback="/mobile/41"
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction onPress={() => router.push('/chat')}>
            {t('Ask tutor about this document')}
          </MobileAction>
          <MobileAction
            variant="secondary"
            onPress={() => router.push('/learning/reading')}>
            {t('Open in immersive reading')}
          </MobileAction>
        </View>
      }>
      <MobileText style={{ fontSize: 22, lineHeight: 28, fontWeight: '700' }}>
        {filename || t('The Art of PostgreSQL')}
      </MobileText>
      <MobileText muted>{metaLine}</MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <NoticeCard
        title={t('Preview surface')}
        body={
          previewText.trim()
            ? previewText.slice(0, 2400)
            : t(
                'Open the selected document here, then ask your tutor about what you’re reading.',
              )
        }
      />
      <View style={{ gap: 12 }}>
        <MobileAction
          variant="secondary"
          loading={busy}
          onPress={() => void load()}>
          {t('Refresh')}
        </MobileAction>
        {Boolean(filename) && (
          <MobileAction
            variant="danger"
            loading={deleting}
            onPress={() => void handleRemoveFile()}>
            {t('Remove')}
          </MobileAction>
        )}
      </View>
    </MobilePage>
  );
}

export function NewKnowledgeBaseScreen() {
  const t = useCopy();
  const { scope, workspaceId } = useKbScope();
  const [name, setName] = useState('');
  const [provider, setProvider] = useState(getActiveEngineId(scope) || 'llamaindex');
  const [searchMode, setSearchMode] = useState('hybrid');
  const [embeddingModel, setEmbeddingModel] = useState('');
  const [pickedFiles, setPickedFiles] = useState<PickedKnowledgeFile[]>([]);
  const [providers, setProviders] = useState<RagProviderItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listRagProviders()
      .then(list => {
        if (list.length) setProviders(list);
      })
      .catch(() => {});
  }, []);

  const providerOptions = useMemo(() => {
    if (providers.length > 0) {
      return providers.map(p => ({ value: p.id, label: p.name }));
    }
    return [
      { value: 'llamaindex', label: 'LlamaIndex' },
      { value: 'lightrag', label: 'LightRAG' },
      { value: 'graphrag', label: 'GraphRAG' },
      { value: 'pageindex', label: 'PageIndex Cloud' },
    ];
  }, [providers]);

  const handlePickFiles = async () => {
    try {
      const selected = await pickKnowledgeBaseFiles();
      if (selected.length) {
        setPickedFiles(selected);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    }
  };

  const handleCreate = async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await createKnowledgeBase(
        {
          name,
          rag_provider: provider,
          search_mode: searchMode,
          embedding_model: embeddingModel || undefined,
          storage_workspace_id: workspaceId || undefined,
          files: pickedFiles,
        },
        workspaceId,
      );
      setActiveKbName(created.name, scope);
      router.replace({
        pathname: '/mobile/[screen]',
        params: { screen: '41', kb: created.name },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('New knowledge base')}
      fallback="/mobile/40"
      footer={
        <MobileAction loading={busy} onPress={() => void handleCreate()}>
          {t('Create knowledge base')}
        </MobileAction>
      }>
      <MobileText muted>
        {t('Create an index or connect one that already exists.')}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <MobileField
        label={t('Name')}
        placeholder={t('e.g. backend-papers')}
        value={name}
        onChangeText={setName}
      />
      <MobileChoice
        label={t('Index engine')}
        value={provider}
        options={providerOptions}
        onChange={val => {
          setProvider(val);
          setActiveEngineId(val, scope);
        }}
      />
      <MobileChoice
        label={t('Retrieval profile')}
        value={searchMode}
        options={[
          { value: 'hybrid', label: t('Hybrid') },
          { value: 'vector', label: 'vector' },
          { value: 'bm25', label: 'bm25' },
        ]}
        onChange={setSearchMode}
      />
      <MobileField
        label={t('Embedding model')}
        placeholder={t('Use configured default')}
        value={embeddingModel}
        onChangeText={setEmbeddingModel}
      />
      <View>
        <MobileRow
          title={t('Source type')}
          description={t('Create new / Link existing')}
          onPress={() => router.push('/mobile/49')}
        />
        <MobileRow
          title={t('Engine defaults')}
          description={t('Hybrid · 5 results · chunks 512 / overlap 50')}
          onPress={() => {
            setActiveEngineId(provider, scope);
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '60', engine: provider },
            });
          }}
        />
        <MobileRow
          title={t('Initial documents · optional')}
          description={
            pickedFiles.length > 0
              ? pickedFiles.map(f => f.name).join(', ')
              : t('Choose files')
          }
          onPress={() => void handlePickFiles()}
        />
      </View>
      <NoticeCard
        title={t('Keep the model binding')}
        body={t(
          'This library continues using its selected embedding model if the global default changes.',
        )}
      />
    </MobilePage>
  );
}

export function AddDocumentsScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const [selectedFiles, setSelectedFiles] = useState<PickedKnowledgeFile[]>([]);
  const [destSubdir, setDestSubdir] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleChooseFiles = async () => {
    setError(null);
    setSavedMessage(null);
    try {
      const files = await pickKnowledgeBaseFiles();
      if (files.length) {
        setSelectedFiles(files);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    }
  };

  const handleUpload = async () => {
    setBusy(true);
    setError(null);
    setSavedMessage(null);
    try {
      await uploadKnowledgeBaseFiles(
        kbName,
        selectedFiles,
        destSubdir,
        workspaceId,
      );
      setSelectedFiles([]);
      setSavedMessage(t('Saved'));
      router.replace({
        pathname: '/mobile/[screen]',
        params: { screen: '41', kb: kbName },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('Add documents')}
      fallback="/mobile/41"
      footer={
        <MobileAction
          loading={busy}
          onPress={() => void handleUpload()}>
          {t('Upload selected files')}
        </MobileAction>
      }>
      <MobileText muted>
        {t('Databases · New documents use this library’s embedding model.')}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      {savedMessage && <InlineAlert tone="info">{savedMessage}</InlineAlert>}
      <View style={{ gap: 12 }}>
        <MobileAction
          variant="secondary"
          onPress={() => void handleChooseFiles()}>
          {t('Choose files')}
        </MobileAction>
        <MobileAction
          variant="secondary"
          onPress={() => void handleChooseFiles()}>
          {t('Import a folder once')}
        </MobileAction>
      </View>
      {selectedFiles.length > 0 && (
        <View>
          {selectedFiles.map(file => (
            <MobileRow
              key={`${file.uri}:${file.name}`}
              title={file.name}
              description={formatFileSize(file.size)}
              onPress={() =>
                setSelectedFiles(curr =>
                  curr.filter(item => item.name !== file.name),
                )
              }
            />
          ))}
        </View>
      )}
      <MobileField
        label={t('Path prefix · optional')}
        placeholder="docs"
        value={destSubdir}
        onChangeText={setDestSubdir}
      />
      <NoticeCard
        title={t('Upload limits')}
        body={t(
          '301 supported types · maximum 200 MB per file in this installation. Chat attachments use separate limits.',
        )}
      />
      <MobileRow
        title={t('Keep a server folder in sync')}
        description={t('Use connected sources instead')}
        onPress={() =>
          router.push({
            pathname: '/mobile/[screen]',
            params: { screen: '49', kb: kbName },
          })
        }
      />
    </MobilePage>
  );
}

export function ConnectedSourcesScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const [folders, setFolders] = useState<LinkedFolderItem[]>([]);
  const [github, setGithub] = useState<GitHubSourceItem[]>([]);
  const [web, setWeb] = useState<WebSourceItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncedNotice, setSyncedNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const [fList, gList, wList] = await Promise.all([
        listLinkedFolders(kbName, workspaceId).catch(() => []),
        listGitHubSources(kbName, workspaceId).catch(() => []),
        listWebSources(kbName, workspaceId).catch(() => []),
      ]);
      setFolders(fList);
      setGithub(gList);
      setWeb(wList);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  }, [kbName, t, workspaceId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const handleSyncAll = async () => {
    setBusy(true);
    setError(null);
    setSyncedNotice(null);
    try {
      await Promise.all([
        ...folders.map(f => syncLinkedFolder(kbName, f.id, workspaceId)),
        github.length ? syncGitHubSources(kbName, workspaceId) : Promise.resolve(),
        web.length ? syncWebSources(kbName, workspaceId) : Promise.resolve(),
      ]);
      setSyncedNotice(t('Saved'));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('Connected sources')}
      fallback="/mobile/41"
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction
            onPress={() =>
              router.push({
                pathname: '/mobile/[screen]',
                params: { screen: '46', kb: kbName },
              })
            }>
            {t('Add a source')}
          </MobileAction>
          <MobileAction
            variant="secondary"
            loading={busy}
            onPress={() => void handleSyncAll()}>
            {t('Sync now')}
          </MobileAction>
        </View>
      }>
      <MobileText muted>{kbName}</MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      {syncedNotice && <InlineAlert tone="info">{syncedNotice}</InlineAlert>}
      <View>
        <MobileRow
          title={t('Linked folders')}
          description={
            folders.length > 0
              ? `${folders.length} · ${folders.map(f => f.path).join(', ')}`
              : t('Sync manually · deleted source files remain indexed')
          }
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '49', kb: kbName },
            })
          }
        />
        <MobileRow
          title={t('GitHub')}
          description={
            github.length > 0
              ? `${github.length} · ${github.map(g => g.repo).join(', ')}`
              : t('Track Markdown docs · daily automatic sync')
          }
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '47', kb: kbName },
            })
          }
        />
        <MobileRow
          title={t('Web')}
          description={
            web.length > 0
              ? `${web.length} · ${web[0].url}`
              : t('8 sources · schedules pending')
          }
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '128', kb: kbName },
            })
          }
        />
      </View>
    </MobilePage>
  );
}

export function AddSourceTypeScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';

  return (
    <MobilePage title={t('Add source')} fallback="/mobile/45">
      <MobileText muted>{t('Databases · Choose one source type')}</MobileText>
      <View>
        <MobileRow
          title={t('Server folder')}
          description={t('Server path · explicit sync action')}
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '49', kb: kbName },
            })
          }
        />
        <MobileRow
          title={t('GitHub repository')}
          description={t('Owner/repo, branch, path and glob')}
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '47', kb: kbName },
            })
          }
        />
        <MobileRow
          title={t('Documentation website')}
          description={t('Bounded crawl with depth and page limits')}
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '48', kb: kbName },
            })
          }
        />
      </View>
    </MobilePage>
  );
}

export function GitHubSourceScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const [repo, setRepo] = useState('HKUDS/DeepTutor');
  const [branch, setBranch] = useState('main');
  const [pathPrefix, setPathPrefix] = useState('');
  const [globPattern, setGlobPattern] = useState('**/*.md');
  const [sources, setSources] = useState<GitHubSourceItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await listGitHubSources(kbName, workspaceId);
      setSources(list);
    } catch {
      // ignore initial error if KB has none
    }
  }, [kbName, workspaceId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const handleAdd = async () => {
    setBusy(true);
    setError(null);
    try {
      await addGitHubSource(
        kbName,
        {
          repo,
          branch,
          path: pathPrefix,
          glob: globPattern,
        },
        workspaceId,
      );
      await load();
      router.replace({
        pathname: '/mobile/[screen]',
        params: { screen: '45', kb: kbName },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await removeGitHubSource(kbName, id, workspaceId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('GitHub source')}
      fallback="/mobile/45"
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction loading={busy} onPress={() => void handleAdd()}>
            {t('Add GitHub source')}
          </MobileAction>
          <MobileAction
            variant="secondary"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/mobile/45')
            }>
            {t('Cancel')}
          </MobileAction>
        </View>
      }>
      <MobileText muted>
        {t('Databases · Markdown docs sync daily.')}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <MobileField
        label={t('Repository')}
        placeholder={t('HKUDS/DeepTutor')}
        value={repo}
        onChangeText={setRepo}
      />
      <MobileField
        label={t('Branch')}
        placeholder="main"
        value={branch}
        onChangeText={setBranch}
      />
      <MobileField
        label={t('Path prefix · optional')}
        placeholder="docs"
        value={pathPrefix}
        onChangeText={setPathPrefix}
      />
      <MobileField
        label={t('Glob pattern')}
        placeholder="**/*.md"
        value={globPattern}
        onChangeText={setGlobPattern}
      />
      {sources.length > 0 && (
        <View>
          {sources.map(src => (
            <MobileRow
              key={src.id}
              title={src.repo}
              description={`${src.branch} · ${src.glob}`}
              onPress={() => void handleRemove(src.id)}
            />
          ))}
        </View>
      )}
    </MobilePage>
  );
}

export function WebSourceScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const { colors } = useDesign();
  const [url, setUrl] = useState('https://www.postgresql.org/docs/current/mvcc.html');
  const [maxDepth, setMaxDepth] = useState('2');
  const [autoSync, setAutoSync] = useState(false);
  const [intervalHours, setIntervalHours] = useState('24');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setBusy(true);
    setError(null);
    try {
      const parsedDepth = Math.max(1, Math.min(5, Number(maxDepth) || 2));
      const parsedInterval = Math.max(1, Number(intervalHours) || 24);
      await addWebSource(
        kbName,
        {
          url,
          max_depth: parsedDepth,
          max_pages: 25,
          auto_sync_enabled: autoSync,
          sync_interval_hours: parsedInterval,
        },
        workspaceId,
      );
      router.replace({
        pathname: '/mobile/[screen]',
        params: { screen: '128', kb: kbName },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('Web source')}
      fallback="/mobile/128"
      footer={
        <MobileAction loading={busy} onPress={() => void handleAdd()}>
          {t('Add web source')}
        </MobileAction>
      }>
      <MobileText muted>
        {t('Databases · Crawl only within configured limits.')}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <MobileField
        label={t('Documentation URL')}
        placeholder="https://www.postgresql.org/docs/current/mvcc.html"
        value={url}
        onChangeText={setUrl}
      />
      <MobileField
        label={t('Max crawl depth')}
        placeholder="2"
        keyboardType="numeric"
        value={maxDepth}
        onChangeText={setMaxDepth}
      />
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={t('Automatic sync')}
        accessibilityState={{ checked: autoSync }}
        onPress={() => setAutoSync(v => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
        <View style={{ gap: 4 }}>
          <MobileText style={{ fontWeight: '500' }}>
            {t('Automatic sync')}
          </MobileText>
          <MobileText muted>{autoSync ? t('On') : t('Off')}</MobileText>
        </View>
      </Pressable>
      <MobileField
        label={t('Interval when enabled')}
        placeholder={t('24 hours')}
        keyboardType="numeric"
        value={intervalHours}
        onChangeText={setIntervalHours}
      />
      <NoticeCard
        title={t('Before adding')}
        body={t(
          'Review crawl scope and configured page limits. Pending is a state, not a completed import.',
        )}
      />
    </MobilePage>
  );
}

export function WebSourcesListScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const [sources, setSources] = useState<WebSourceItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const list = await listWebSources(kbName, workspaceId);
      setSources(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  }, [kbName, t, workspaceId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const handleToggleSchedule = async (item: WebSourceItem) => {
    setBusy(true);
    setError(null);
    try {
      await updateWebSourceSchedule(
        kbName,
        item.id,
        {
          auto_sync_enabled: !item.auto_sync_enabled,
          sync_interval_hours: item.sync_interval_hours || 24,
        },
        workspaceId,
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const handleSync = async () => {
    setBusy(true);
    setError(null);
    try {
      await syncWebSources(kbName, workspaceId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await removeWebSource(kbName, id, workspaceId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('Web sources')}
      fallback="/mobile/45"
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction
            onPress={() =>
              router.push({
                pathname: '/mobile/[screen]',
                params: { screen: '48', kb: kbName },
              })
            }>
            {t('Add web source')}
          </MobileAction>
          <MobileAction
            variant="secondary"
            loading={busy}
            onPress={() => void handleSync()}>
            {t('Sync now')}
          </MobileAction>
        </View>
      }>
      <MobileText muted>{`${kbName} · ${sources.length}`}</MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      {sources.length === 0 ? (
        <NoticeCard
          title={t('Before adding')}
          body={t(
            'Review crawl scope and configured page limits. Pending is a state, not a completed import.',
          )}
        />
      ) : (
        <View>
          {sources.map(item => (
            <MobileRow
              key={item.id}
              title={item.url}
              description={`${item.max_depth} · ${
                item.last_sync_status || 'pending'
              } · ${item.auto_sync_enabled ? t('On') : t('Off')}`}
              selected={item.auto_sync_enabled}
              onPress={() => void handleToggleSchedule(item)}
              onLongPress={() => void handleRemove(item.id)}
            />
          ))}
        </View>
      )}
    </MobilePage>
  );
}

export function LinkedFolderScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const [folderPath, setFolderPath] = useState('');
  const [folders, setFolders] = useState<LinkedFolderItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await listLinkedFolders(kbName, workspaceId);
      setFolders(list);
      if (list[0] && !folderPath) {
        setFolderPath(list[0].path);
      }
    } catch {
      // ignore if empty
    }
  }, [folderPath, kbName, workspaceId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const handleLink = async () => {
    setBusy(true);
    setError(null);
    try {
      await linkServerFolder(kbName, folderPath, workspaceId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const handleSync = async () => {
    setBusy(true);
    setError(null);
    try {
      const target = folders[0];
      if (target) {
        await syncLinkedFolder(kbName, target.id, workspaceId);
      } else if (folderPath.trim()) {
        const created = await linkServerFolder(kbName, folderPath, workspaceId);
        await syncLinkedFolder(kbName, created.id, workspaceId);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await unlinkServerFolder(kbName, id, workspaceId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('Linked folder')}
      fallback="/mobile/45"
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction loading={busy} onPress={() => void handleLink()}>
            {t('Link folder')}
          </MobileAction>
          <MobileAction
            variant="secondary"
            loading={busy}
            onPress={() => void handleSync()}>
            {t('Sync linked folder')}
          </MobileAction>
        </View>
      }>
      <MobileText muted>
        {t('Databases · Folder resides on the DeepTutor server.')}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <MobileField
        label={t('Server folder path')}
        placeholder={t('Choose or enter server folder')}
        value={folderPath}
        onChangeText={setFolderPath}
      />
      {folders.length > 0 && (
        <View>
          {folders.map(item => (
            <MobileRow
              key={item.id}
              title={item.path}
              description={item.last_synced_at || t('Ready')}
              onPress={() => void handleUnlink(item.id)}
            />
          ))}
        </View>
      )}
      <NoticeCard
        title={t('Sync behavior')}
        body={t(
          'New and modified supported files are imported on demand. Deleted or renamed originals are not removed from the index.',
        )}
      />
    </MobilePage>
  );
}

export function IndexRecoveryScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const [runInfo, setRunInfo] = useState<IndexingRunInfo | null>(null);
  const [progressInfo, setProgressInfo] = useState<IndexingProgressInfo | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const [run, prog] = await Promise.all([
        getIndexingRun(kbName, workspaceId).catch(() => null),
        getIndexingProgress(kbName, workspaceId).catch(() => null),
      ]);
      setRunInfo(run);
      setProgressInfo(prog);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  }, [kbName, t, workspaceId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const handleReindex = async () => {
    setBusy(true);
    setError(null);
    try {
      await reindexKnowledgeBase(kbName, workspaceId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const handleRetry = async () => {
    setBusy(true);
    setError(null);
    try {
      await retryKnowledgeBase(kbName, workspaceId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const dim = runInfo?.embedding_dimension || 1536;
  const completedLabel =
    runInfo?.completed_at || t('1536 dimensions · indexed Nov 5, 2026');

  return (
    <MobilePage
      title={t('Index & recovery')}
      fallback="/mobile/41"
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction loading={busy} onPress={() => void handleReindex()}>
            {t('Re-index')}
          </MobileAction>
          <MobileAction
            variant="secondary"
            loading={busy}
            onPress={() => void handleRetry()}>
            {t('Retry')}
          </MobileAction>
        </View>
      }>
      <MobileText muted>{kbName}</MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <View>
        <MobileRow
          title={t('Current version · version-2')}
          description={`${dim}d · ${completedLabel}`}
          selected
          onPress={() => void load()}
        />
        <MobileRow
          title={t('Previous version · version-1')}
          description={runInfo?.embedding_model || 'text-embedding-3-small'}
          onPress={() => void load()}
        />
      </View>
      <NoticeCard
        title={t('Indexing in progress')}
        body={
          progressInfo?.progress?.message ||
          t('Processing documents… Your current index remains available.')
        }
      />
      <MobileRow
        title={t('Indexing recovery details')}
        description={t('Review failures and retry available operations')}
        onPress={() => void handleRetry()}
      />
    </MobilePage>
  );
}

export function KnowledgeBaseSettingsScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const [kb, setKb] = useState<KnowledgeBaseSummary | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const [detail, cfg] = await Promise.all([
        getKnowledgeBase(kbName, workspaceId).catch(() => null),
        getKnowledgeBaseConfig(kbName, workspaceId).catch(() => ({})),
      ]);
      if (detail) setKb(detail);
      setConfig(cfg);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  }, [kbName, t, workspaceId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const handleSetDefault = async () => {
    setBusy(true);
    setError(null);
    setSavedNotice(null);
    try {
      await setDefaultKnowledgeBase(kbName, workspaceId);
      setSavedNotice(t('Saved'));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveMetadata = async () => {
    setBusy(true);
    setError(null);
    setSavedNotice(null);
    try {
      const nextMode =
        config.search_mode === 'vector' ? 'hybrid' : 'vector';
      const updated = await updateKnowledgeBaseConfig(
        kbName,
        { ...config, search_mode: nextMode },
        workspaceId,
      );
      setConfig(updated);
      setSavedNotice(t('Saved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  const metaDescription = kb
    ? `${formatProviderName(kb.rag_provider)} · ${kb.embedding_model} · ${
        kb.embedding_dimension || 1536
      }d`
    : 'LlamaIndex · text-embedding-3-small · 1536d';

  return (
    <MobilePage
      title={t('Library settings')}
      fallback="/mobile/41"
      footer={
        <MobileAction
          variant="danger"
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: { screen: '112', kb: kbName },
            })
          }>
          {t('Review deletion')}
        </MobileAction>
      }>
      <MobileText muted>{kbName}</MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      {savedNotice && <InlineAlert tone="info">{savedNotice}</InlineAlert>}
      <View>
        <MobileRow
          title={t('Metadata')}
          description={metaDescription}
          onPress={() => void handleSaveMetadata()}
        />
        <MobileRow
          title={t('Default knowledge base')}
          description={t('Select automatically in chat and partners')}
          selected={Boolean(kb?.is_default)}
          disabled={busy}
          onPress={() => void handleSetDefault()}
        />
        <MobileRow
          title={t('Move knowledge base')}
          description={t('Review destination; workspace assignments update')}
          onPress={() =>
            router.push({
              pathname: '/mobile/[screen]',
              params: {
                screen: '140',
                kb: kbName,
                sourceId: kb?.id || `user:kb:${kbName}`,
              },
            })
          }
        />
        <MobileRow
          title={t('Server storage location')}
          description={kb?.path || t('View read-only on-disk path')}
          onPress={() => void load()}
        />
      </View>
      <NoticeCard
        title={t('Delete this knowledge base')}
        body={t(
          'Permanently removes raw documents and index versions. Review confirmation first.',
        )}
      />
    </MobilePage>
  );
}

export function ReviewDeleteKbScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string }>();
  const { scope, workspaceId } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmText.trim() && confirmText.trim() !== kbName) {
      setError(t('Confirm knowledge base name'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteKnowledgeBase(kbName, workspaceId);
      setActiveKbName('', scope);
      router.replace('/mobile/40');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('Review deletion')}
      fallback="/mobile/51"
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction
            variant="danger"
            loading={busy}
            onPress={() => void handleDelete()}>
            {t('Delete knowledge base')}
          </MobileAction>
          <MobileAction
            variant="secondary"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/mobile/51')
            }>
            {t('Keep knowledge base')}
          </MobileAction>
        </View>
      }>
      <MobileText muted>{kbName}</MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <NoticeCard
        title={t('Delete Databases permanently?')}
        body={t(
          'Raw documents and index versions will be removed. This cannot be undone from this screen.',
        )}
      />
      <MobileField
        label={t('Confirm knowledge base name')}
        placeholder={t('Type Databases')}
        value={confirmText}
        onChangeText={setConfirmText}
      />
    </MobilePage>
  );
}

export function MoveKnowledgeBaseScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ kb?: string; sourceId?: string }>();
  const ws = useWorkspaces();
  const { scope } = useKbScope();
  const kbName = params.kb || getActiveKbName(scope) || 'Databases';
  const sourceId = params.sourceId || `user:kb:${kbName}`;
  const workspaceOptions = useMemo(() => {
    const list = ws.workspaces.map(item => ({
      value: item.workspace_id,
      label: item.display_name,
    }));
    if (list.length > 0) return list;
    return [{ value: 'default', label: 'Software Development' }];
  }, [ws.workspaces]);

  const [targetWorkspace, setTargetWorkspace] = useState(
    workspaceOptions.find(w => w.value !== ws.selectedWorkspaceId)?.value ||
      workspaceOptions[0]?.value ||
      'default',
  );
  const [preview, setPreview] = useState<KnowledgeMovePreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetWorkspace) return;
    void previewKnowledgeBaseMove(sourceId, targetWorkspace)
      .then(res => setPreview(res))
      .catch(() => {});
  }, [sourceId, targetWorkspace]);

  const handleMove = async () => {
    setBusy(true);
    setError(null);
    try {
      await moveKnowledgeBase(sourceId, targetWorkspace);
      router.replace('/mobile/40');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('Library move')}
      fallback="/mobile/51"
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction loading={busy} onPress={() => void handleMove()}>
            {t('Confirm move')}
          </MobileAction>
          <MobileAction
            variant="secondary"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/mobile/51')
            }>
            {t('Cancel')}
          </MobileAction>
        </View>
      }>
      <MobileText muted>
        {t('Move Databases with documents, settings and index versions.')}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      <MobileChoice
        label={t('Destination workspace')}
        value={targetWorkspace}
        options={workspaceOptions}
        onChange={setTargetWorkspace}
      />
      <NoticeCard
        title={t('Review related assignments')}
        body={
          preview?.affected_workspaces?.length
            ? `${preview.affected_workspaces.join(', ')} — ${t(
                'Existing workspace assignments update after the move. Check the destination before continuing.',
              )}`
            : t(
                'Existing workspace assignments update after the move. Check the destination before continuing.',
              )
        }
      />
    </MobilePage>
  );
}

export function KnowledgeEnginesScreen() {
  const t = useCopy();
  const { scope } = useKbScope();
  const [providers, setProviders] = useState<RagProviderItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const list = await listRagProviders();
      setProviders(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const openEngine = (engineId: string) => {
    setActiveEngineId(engineId, scope);
    router.push({
      pathname: '/mobile/[screen]',
      params: { screen: '60', engine: engineId },
    });
  };

  const statusFor = (id: string, fallback: string): string => {
    const found = providers.find(p => p.id === id);
    if (!found) return fallback;
    return found.available ? t('Ready') : fallback;
  };

  return (
    <MobilePage
      title={t('Knowledge engines')}
      fallback="/mobile/40"
      footer={
        <MobileAction
          variant="secondary"
          loading={busy}
          onPress={() => void load()}>
          {t('Refresh')}
        </MobileAction>
      }>
      <MobileText muted>
        {t('11 engines · choose by availability, then configure.')}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}

      <SectionBlock title={t('Local engines')}>
        <MobileRow
          title={t('LlamaIndex')}
          description={statusFor('llamaindex', t('Ready · 6 knowledge bases'))}
          onPress={() => openEngine('llamaindex')}
        />
        <MobileRow
          title={t('PageIndex OSS')}
          description={statusFor('pageindex_oss', t('Not installed · PDF'))}
          onPress={() => openEngine('pageindex_oss')}
        />
        <MobileRow
          title="GraphRAG"
          description={statusFor('graphrag', t('Not installed · graph retrieval'))}
          onPress={() => openEngine('graphrag')}
        />
        <MobileRow
          title="LightRAG"
          description={statusFor('lightrag', t('Not installed · graph + vector'))}
          onPress={() => openEngine('lightrag')}
        />
      </SectionBlock>

      <SectionBlock title={t('Server engines')}>
        <MobileRow
          title={t('LightRAG Server')}
          description={statusFor('lightrag-server', t('Needs setup'))}
          onPress={() => openEngine('lightrag-server')}
        />
      </SectionBlock>

      <SectionBlock title={t('Cloud services')}>
        <MobileRow
          title={t('PageIndex Cloud')}
          description={statusFor('pageindex', t('Needs key'))}
          onPress={() => openEngine('pageindex')}
        />
        <MobileRow
          title={t('Tencent IMA')}
          description={statusFor('ima', t('Needs key · external library'))}
          onPress={() => openEngine('ima')}
        />
        <MobileRow
          title="WeKnora"
          description={t('Ready · self-hosted service')}
          onPress={() => openEngine('llamaindex')}
        />
      </SectionBlock>

      <SectionBlock title={t('External knowledge sources')}>
        <MobileRow
          title={t('Obsidian')}
          description={t('Connect a live vault')}
          onPress={() => openEngine('llamaindex')}
        />
        <MobileRow
          title={t('MarginNote 4')}
          description={t('Connect pushed library')}
          onPress={() => openEngine('llamaindex')}
        />
        <MobileRow
          title={t('Kiwix / ZIM')}
          description={t('Connect archive server')}
          onPress={() => openEngine('llamaindex')}
        />
      </SectionBlock>
    </MobilePage>
  );
}

export function EngineConfigScreen() {
  const t = useCopy();
  const params = useLocalSearchParams<{ engine?: string }>();
  const { scope } = useKbScope();
  const [engine, setEngine] = useState(
    params.engine || getActiveEngineId(scope) || 'llamaindex',
  );
  const [retrievalProfile, setRetrievalProfile] = useState('hybrid');
  const [topK, setTopK] = useState('5');
  const [chunkSize, setChunkSize] = useState('512');
  const [chunkOverlap, setChunkOverlap] = useState('50');
  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [preflight, setPreflight] = useState<RagPreflightReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const loadConfig = useCallback(async (targetEngine: string) => {
    setBusy(true);
    setError(null);
    try {
      const cfg = await getPipelineConfig(targetEngine);
      if (typeof cfg.retrieval_profile === 'string') {
        setRetrievalProfile(cfg.retrieval_profile);
      }
      if (typeof cfg.top_k === 'number') {
        setTopK(String(cfg.top_k));
      }
      if (typeof cfg.chunk_size === 'number') {
        setChunkSize(String(cfg.chunk_size));
      }
      if (typeof cfg.chunk_overlap === 'number') {
        setChunkOverlap(String(cfg.chunk_overlap));
      }
      if (typeof cfg.server_url === 'string') {
        setServerUrl(cfg.server_url);
      }
    } catch {
      // keep defaults if pipeline endpoint is not applicable
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadConfig(engine));
  }, [engine, loadConfig]);

  const handleTestConnection = async () => {
    setTesting(true);
    setError(null);
    setSavedNotice(null);
    try {
      const report = await preflightRagProvider(engine);
      setPreflight(report);
      setSavedNotice(report.ok ? t('Ready') : t('Unavailable'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    setSavedNotice(null);
    try {
      const payload: Record<string, unknown> = {
        retrieval_profile: retrievalProfile,
        top_k: Number(topK) || 5,
        chunk_size: Number(chunkSize) || 512,
        chunk_overlap: Number(chunkOverlap) || 50,
      };
      if (serverUrl.trim()) payload.server_url = serverUrl.trim();
      if (apiKey.trim()) payload.api_key = apiKey.trim();
      await updatePipelineConfig(engine, payload);
      setSavedNotice(t('Saved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unavailable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage
      title={t('Engine configuration')}
      fallback="/mobile/59"
      footer={
        <View style={{ gap: 12 }}>
          <MobileAction
            variant="secondary"
            loading={testing}
            onPress={() => void handleTestConnection()}>
            {t('Test connection')}
          </MobileAction>
          <MobileAction loading={busy} onPress={() => void handleSave()}>
            {t('Save engine defaults')}
          </MobileAction>
        </View>
      }>
      <MobileText muted>
        {t('Configure only the fields required by the selected engine.')}
      </MobileText>
      {error && <InlineAlert tone="danger">{error}</InlineAlert>}
      {savedNotice && <InlineAlert tone="info">{savedNotice}</InlineAlert>}
      <MobileChoice
        label={t('Engine')}
        value={engine}
        options={[
          { value: 'llamaindex', label: t('LlamaIndex') },
          { value: 'lightrag', label: 'LightRAG' },
          { value: 'graphrag', label: 'GraphRAG' },
          { value: 'pageindex', label: t('PageIndex Cloud') },
          { value: 'lightrag-server', label: t('LightRAG Server') },
          { value: 'ima', label: t('Tencent IMA') },
        ]}
        onChange={val => {
          setEngine(val);
          setActiveEngineId(val, scope);
        }}
      />
      <MobileChoice
        label={t('Retrieval profile')}
        value={retrievalProfile}
        options={[
          { value: 'hybrid', label: t('Hybrid') },
          { value: 'vector', label: 'vector' },
          { value: 'bm25', label: 'bm25' },
        ]}
        onChange={setRetrievalProfile}
      />
      <MobileField
        label={t('Results per query')}
        keyboardType="numeric"
        value={topK}
        onChangeText={setTopK}
      />
      <MobileField
        label={t('Chunk size')}
        keyboardType="numeric"
        value={chunkSize}
        onChangeText={setChunkSize}
      />
      <MobileField
        label={t('Chunk overlap')}
        keyboardType="numeric"
        value={chunkOverlap}
        onChangeText={setChunkOverlap}
      />
      <MobileField
        label={t('Server URL')}
        placeholder="https://lightrag.example.com"
        value={serverUrl}
        onChangeText={setServerUrl}
      />
      <MobileField
        label={t('Remote connection when required')}
        placeholder={t('API origin · credential · external knowledge-base ID')}
        secureTextEntry
        value={apiKey}
        onChangeText={setApiKey}
      />
      {preflight && (
        <View>
          {preflight.checks.map(check => (
            <MobileRow
              key={check.key}
              title={check.label}
              description={check.detail || (check.ok ? t('Ready') : t('Unavailable'))}
              selected={check.ok}
            />
          ))}
        </View>
      )}
      <NoticeCard
        title={t('Engine availability')}
        body={t(
          'Installations and model downloads remain explicit server actions. External libraries keep their documents in place.',
        )}
      />
    </MobilePage>
  );
}
