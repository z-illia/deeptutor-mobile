import * as DocumentPicker from 'expo-document-picker';
import { api } from '@/api/client';

export type KnowledgeBaseStatistics = {
  raw_documents: number;
  images: number;
  content_lists: number;
  rag_initialized: boolean;
};

export type KnowledgeBaseProgress = {
  stage?: string;
  message?: string;
  percent?: number;
  current?: number;
  total?: number;
  file_name?: string;
  error?: string;
  error_code?: string;
  retryable?: boolean;
  task_id?: string;
  timestamp?: string;
};

export type KnowledgeBaseSummary = {
  id: string;
  name: string;
  is_default: boolean;
  statistics: KnowledgeBaseStatistics;
  metadata?: Record<string, unknown> | null;
  path?: string | null;
  status?: string | null;
  progress?: KnowledgeBaseProgress | null;
  source?: string;
  assigned?: boolean;
  read_only?: boolean;
  provenance_label?: string | null;
  available?: boolean;
  rag_provider: string;
  search_mode: string;
  embedding_model: string;
  embedding_dimension: number | null;
  description: string;
};

export type KnowledgeBaseFileEntry = {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: number;
  mime_type?: string | null;
};

export type PickedKnowledgeFile = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  webFile?: File;
};

export type CreateKnowledgeBaseInput = {
  name: string;
  rag_provider?: string;
  search_mode?: string;
  embedding_model?: string;
  storage_workspace_id?: string;
  files?: PickedKnowledgeFile[];
};

export type LinkedFolderItem = {
  id: string;
  path: string;
  added_at?: string;
  last_synced_at?: string | null;
  file_count?: number;
};

export type GitHubSourceItem = {
  id: string;
  repo: string;
  branch: string;
  path: string;
  glob: string;
  last_synced_at?: string | null;
  last_commit_sha?: string | null;
  file_count?: number;
};

export type WebSourceItem = {
  id: string;
  url: string;
  max_depth: number;
  max_pages: number;
  auto_sync_enabled: boolean;
  sync_interval_hours: number;
  last_synced_at?: string | null;
  next_sync_at?: string | null;
  last_sync_status?: string | null;
  last_error?: string | null;
  file_count?: number;
};

export type IndexingRunInfo = {
  run_id?: string;
  status?: string;
  provider?: string;
  embedding_model?: string;
  embedding_dimension?: number;
  completed_at?: string;
  started_at?: string;
  error?: string;
  version?: number;
};

export type IndexingProgressInfo = {
  kb_name: string;
  status: string;
  progress: KnowledgeBaseProgress;
};

export type RagProviderItem = {
  id: string;
  name: string;
  description: string;
  available: boolean;
  requires_key?: boolean;
  key_configured?: boolean;
  modes?: string[];
  default_mode?: string;
  linkable?: boolean;
  category?: 'local' | 'server' | 'cloud' | 'external';
};

export type RagPreflightCheck = {
  key: string;
  label: string;
  ok: boolean;
  detail?: string;
  optional?: boolean;
};

export type RagPreflightReport = {
  ok: boolean;
  checks: RagPreflightCheck[];
};

export type KnowledgeMovePreview = {
  source_id: string;
  name: string;
  source_workspace_id: string;
  target_workspace_id: string;
  affected_workspaces: string[];
  can_move: boolean;
};

export type KnowledgeMoveResult = {
  status: string;
  id: string;
  name: string;
  target_workspace_id: string;
};

const activeKbByScope = new Map<string, string>();
const activeFileByScope = new Map<string, string>();
const activeEngineByScope = new Map<string, string>();

const normalizeScope = (scope?: string): string =>
  scope && scope.trim() ? scope.trim() : 'default';

export function getActiveKbName(scope?: string): string {
  return activeKbByScope.get(normalizeScope(scope)) ?? '';
}

export function setActiveKbName(name: string, scope?: string): void {
  const key = normalizeScope(scope);
  if (name.trim()) {
    activeKbByScope.set(key, name.trim());
  } else {
    activeKbByScope.delete(key);
  }
}

export function getActiveKbFile(scope?: string): string {
  return activeFileByScope.get(normalizeScope(scope)) ?? '';
}

export function setActiveKbFile(filename: string, scope?: string): void {
  const key = normalizeScope(scope);
  if (filename.trim()) {
    activeFileByScope.set(key, filename.trim());
  } else {
    activeFileByScope.delete(key);
  }
}

export function getActiveEngineId(scope?: string): string {
  return activeEngineByScope.get(normalizeScope(scope)) ?? 'llamaindex';
}

export function setActiveEngineId(engineId: string, scope?: string): void {
  const key = normalizeScope(scope);
  if (engineId.trim()) {
    activeEngineByScope.set(key, engineId.trim());
  } else {
    activeEngineByScope.delete(key);
  }
}

export const SCREEN_PRESET_KB_NAMES: Record<number, string> = {
  41: 'Databases',
  147: 'Node.js & TypeScript',
  148: 'Software Architecture',
  149: 'System Design & Distributed Systems',
  150: 'Practical Challenges & Engineering Exercises',
  151: 'Production Engineering, Reliability & Security',
};

const wsParams = (workspace?: string): Record<string, string> | undefined =>
  workspace && workspace.trim() ? { dt_workspace: workspace.trim() } : undefined;

const encodePathSegments = (relPath: string): string =>
  relPath
    .split('/')
    .filter(Boolean)
    .map(seg => encodeURIComponent(seg))
    .join('/');

export function normalizeKnowledgeBaseSummary(raw: unknown): KnowledgeBaseSummary {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const statsRaw =
    r.statistics && typeof r.statistics === 'object'
      ? (r.statistics as Record<string, unknown>)
      : {};
  const metaRaw =
    r.metadata && typeof r.metadata === 'object'
      ? (r.metadata as Record<string, unknown>)
      : {};
  const progressRaw =
    r.progress && typeof r.progress === 'object'
      ? (r.progress as KnowledgeBaseProgress)
      : null;

  const name = typeof r.name === 'string' && r.name.trim() ? r.name.trim() : 'Databases';
  const id = typeof r.id === 'string' && r.id.trim() ? r.id.trim() : `user:kb:${name}`;
  const ragProvider =
    typeof metaRaw.rag_provider === 'string' && metaRaw.rag_provider.trim()
      ? metaRaw.rag_provider.trim()
      : typeof r.rag_provider === 'string' && r.rag_provider.trim()
        ? r.rag_provider.trim()
        : 'llamaindex';
  const searchMode =
    typeof metaRaw.search_mode === 'string' && metaRaw.search_mode.trim()
      ? metaRaw.search_mode.trim()
      : 'hybrid';
  const embeddingSelection =
    metaRaw.embedding_selection && typeof metaRaw.embedding_selection === 'object'
      ? (metaRaw.embedding_selection as Record<string, unknown>)
      : {};
  const embeddingModel =
    typeof metaRaw.embedding_model === 'string' && metaRaw.embedding_model.trim()
      ? metaRaw.embedding_model.trim()
      : typeof embeddingSelection.model === 'string' && embeddingSelection.model.trim()
        ? embeddingSelection.model.trim()
        : typeof embeddingSelection.label === 'string' && embeddingSelection.label.trim()
          ? embeddingSelection.label.trim()
          : 'text-embedding-3-small';
  const embeddingDimension =
    typeof metaRaw.embedding_dimension === 'number'
      ? metaRaw.embedding_dimension
      : typeof embeddingSelection.dimension === 'number'
        ? embeddingSelection.dimension
        : null;
  const description =
    typeof metaRaw.description === 'string' ? metaRaw.description.trim() : '';

  return {
    id,
    name,
    is_default: Boolean(r.is_default),
    statistics: {
      raw_documents:
        typeof statsRaw.raw_documents === 'number' ? statsRaw.raw_documents : 0,
      images: typeof statsRaw.images === 'number' ? statsRaw.images : 0,
      content_lists:
        typeof statsRaw.content_lists === 'number' ? statsRaw.content_lists : 0,
      rag_initialized: Boolean(statsRaw.rag_initialized),
    },
    metadata: metaRaw,
    path: typeof r.path === 'string' ? r.path : null,
    status: typeof r.status === 'string' ? r.status : 'ready',
    progress: progressRaw,
    source: typeof r.source === 'string' ? r.source : 'user',
    assigned: Boolean(r.assigned),
    read_only: Boolean(r.read_only),
    provenance_label:
      typeof r.provenance_label === 'string' ? r.provenance_label : null,
    available: r.available !== false,
    rag_provider: ragProvider,
    search_mode: searchMode,
    embedding_model: embeddingModel,
    embedding_dimension: embeddingDimension,
    description,
  };
}

export async function listKnowledgeBases(
  workspace?: string,
  signal?: AbortSignal,
): Promise<KnowledgeBaseSummary[]> {
  const { data } = await api.get<unknown[]>('/knowledge-bases', {
    params: wsParams(workspace),
    signal,
  });
  if (!Array.isArray(data)) return [];
  return data.map(normalizeKnowledgeBaseSummary);
}

export async function getKnowledgeBase(
  kbName: string,
  workspace?: string,
  signal?: AbortSignal,
): Promise<KnowledgeBaseSummary> {
  const { data } = await api.get<unknown>(
    `/knowledge-bases/${encodeURIComponent(kbName)}`,
    { params: wsParams(workspace), signal },
  );
  return normalizeKnowledgeBaseSummary(data);
}

export async function listKnowledgeBaseFiles(
  kbName: string,
  workspace?: string,
  signal?: AbortSignal,
): Promise<KnowledgeBaseFileEntry[]> {
  const { data } = await api.get<{ files?: unknown[] }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/files`,
    { params: wsParams(workspace), signal },
  );
  const items = Array.isArray(data?.files) ? data.files : [];
  return items
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item): KnowledgeBaseFileEntry => ({
      name: typeof item.name === 'string' ? item.name : '',
      type: item.type === 'folder' ? 'folder' : 'file',
      size: typeof item.size === 'number' ? item.size : undefined,
      modified: typeof item.modified === 'number' ? item.modified : undefined,
      mime_type: typeof item.mime_type === 'string' ? item.mime_type : null,
    }))
    .filter(item => Boolean(item.name));
}

export async function getKnowledgeBaseFilePreview(
  kbName: string,
  filename: string,
  workspace?: string,
  signal?: AbortSignal,
): Promise<string> {
  const encodedFile = encodePathSegments(filename);
  const { data } = await api.get<string>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/file-preview-text/${encodedFile}`,
    {
      params: wsParams(workspace),
      responseType: 'text',
      signal,
    },
  );
  return typeof data === 'string' ? data : String(data ?? '');
}

export async function deleteKnowledgeBaseFile(
  kbName: string,
  filename: string,
  workspace?: string,
): Promise<{ status: string; path: string; was_indexed?: boolean }> {
  const encodedFile = encodePathSegments(filename);
  const { data } = await api.delete<{
    status?: string;
    path?: string;
    was_indexed?: boolean;
  }>(`/knowledge-bases/${encodeURIComponent(kbName)}/files/${encodedFile}`, {
    params: wsParams(workspace),
  });
  return {
    status: typeof data?.status === 'string' ? data.status : 'ok',
    path: typeof data?.path === 'string' ? data.path : filename,
    was_indexed: Boolean(data?.was_indexed),
  };
}

const appendFileToFormData = (form: FormData, field: string, file: PickedKnowledgeFile) => {
  if (file.webFile) {
    form.append(field, file.webFile, file.name);
    return;
  }
  form.append(field, {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  } as unknown as Blob);
};

export async function createKnowledgeBase(
  input: CreateKnowledgeBaseInput,
  workspace?: string,
): Promise<{ name: string; status: string }> {
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error('A valid knowledge base name is required before creation.');
  }
  const form = new FormData();
  form.append('name', trimmedName);
  form.append('rag_provider', (input.rag_provider || 'llamaindex').trim());
  if (input.search_mode) {
    form.append('search_mode', input.search_mode.trim());
  }
  if (input.embedding_model) {
    form.append('embedding_model', input.embedding_model.trim());
  }
  const targetWs = input.storage_workspace_id ?? workspace;
  if (targetWs && targetWs.trim()) {
    form.append('storage_workspace_id', targetWs.trim());
  }
  for (const file of input.files ?? []) {
    appendFileToFormData(form, 'files', file);
  }
  const { data } = await api.post<{ name?: string; status?: string }>(
    '/knowledge-bases',
    form,
    { params: wsParams(workspace) },
  );
  return {
    name: typeof data?.name === 'string' && data.name.trim() ? data.name.trim() : trimmedName,
    status: typeof data?.status === 'string' ? data.status : 'ready',
  };
}

export async function uploadKnowledgeBaseFiles(
  kbName: string,
  files: PickedKnowledgeFile[],
  destSubdir?: string,
  workspace?: string,
): Promise<{ uploaded_count: number; status: string }> {
  if (!files.length) {
    throw new Error('At least one file must be selected before uploading.');
  }
  const form = new FormData();
  for (const file of files) {
    appendFileToFormData(form, 'files', file);
  }
  if (destSubdir && destSubdir.trim()) {
    form.append('dest_subdir', destSubdir.trim());
  }
  const { data } = await api.post<{ uploaded_count?: number; status?: string }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/upload`,
    form,
    { params: wsParams(workspace) },
  );
  return {
    uploaded_count:
      typeof data?.uploaded_count === 'number' ? data.uploaded_count : files.length,
    status: typeof data?.status === 'string' ? data.status : 'processing',
  };
}

export async function deleteKnowledgeBase(
  kbName: string,
  workspace?: string,
): Promise<void> {
  await api.post(
    '/knowledge-bases/delete',
    { name: kbName },
    { params: wsParams(workspace) },
  );
}

export async function setDefaultKnowledgeBase(
  kbName: string,
  workspace?: string,
): Promise<void> {
  await api.put(
    `/knowledge-bases/default/${encodeURIComponent(kbName)}`,
    {},
    { params: wsParams(workspace) },
  );
}

export async function getKnowledgeBaseConfig(
  kbName: string,
  workspace?: string,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  const { data } = await api.get<{ config?: Record<string, unknown> }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/config`,
    { params: wsParams(workspace), signal },
  );
  return data?.config && typeof data.config === 'object' ? data.config : {};
}

export async function updateKnowledgeBaseConfig(
  kbName: string,
  config: Record<string, unknown>,
  workspace?: string,
): Promise<Record<string, unknown>> {
  const { data } = await api.put<{ config?: Record<string, unknown> }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/config`,
    config,
    { params: wsParams(workspace) },
  );
  return data?.config && typeof data.config === 'object' ? data.config : config;
}

export async function getIndexingRun(
  kbName: string,
  workspace?: string,
  signal?: AbortSignal,
): Promise<IndexingRunInfo | null> {
  const { data } = await api.get<{ run?: IndexingRunInfo | null }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/indexing-run`,
    { params: wsParams(workspace), signal },
  );
  return data?.run && typeof data.run === 'object' ? data.run : null;
}

export async function getIndexingProgress(
  kbName: string,
  workspace?: string,
  signal?: AbortSignal,
): Promise<IndexingProgressInfo> {
  const { data } = await api.get<{
    kb_name?: string;
    status?: string;
    progress?: KnowledgeBaseProgress;
  }>(`/knowledge-bases/${encodeURIComponent(kbName)}/progress`, {
    params: wsParams(workspace),
    signal,
  });
  return {
    kb_name: typeof data?.kb_name === 'string' ? data.kb_name : kbName,
    status: typeof data?.status === 'string' ? data.status : 'ready',
    progress:
      data?.progress && typeof data.progress === 'object' ? data.progress : {},
  };
}

export async function reindexKnowledgeBase(
  kbName: string,
  workspace?: string,
): Promise<{ status: string; task_id?: string }> {
  const form = new FormData();
  const { data } = await api.post<{ status?: string; task_id?: string }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/reindex`,
    form,
    { params: wsParams(workspace) },
  );
  return {
    status: typeof data?.status === 'string' ? data.status : 'reindexing',
    task_id: typeof data?.task_id === 'string' ? data.task_id : undefined,
  };
}

export async function retryKnowledgeBase(
  kbName: string,
  workspace?: string,
): Promise<{ status: string; task_id?: string }> {
  const { data } = await api.post<{ status?: string; task_id?: string }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/retry`,
    {},
    { params: wsParams(workspace) },
  );
  return {
    status: typeof data?.status === 'string' ? data.status : 'processing',
    task_id: typeof data?.task_id === 'string' ? data.task_id : undefined,
  };
}

export async function listLinkedFolders(
  kbName: string,
  workspace?: string,
  signal?: AbortSignal,
): Promise<LinkedFolderItem[]> {
  const { data } = await api.get<{ folders?: unknown[] }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/linked-folders`,
    { params: wsParams(workspace), signal },
  );
  const rows = Array.isArray(data?.folders) ? data.folders : [];
  return rows
    .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'))
    .map((r, idx) => ({
      id: typeof r.id === 'string' && r.id ? r.id : `folder-${idx + 1}`,
      path: typeof r.path === 'string' ? r.path : '',
      added_at: typeof r.added_at === 'string' ? r.added_at : undefined,
      last_synced_at:
        typeof r.last_synced_at === 'string' ? r.last_synced_at : null,
      file_count: typeof r.file_count === 'number' ? r.file_count : undefined,
    }))
    .filter(item => Boolean(item.path));
}

export async function linkServerFolder(
  kbName: string,
  folderPath: string,
  workspace?: string,
): Promise<LinkedFolderItem> {
  const trimmed = folderPath.trim();
  if (!trimmed) {
    throw new Error('A server folder path is required before linking.');
  }
  const { data } = await api.post<{ folder?: Record<string, unknown> }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/link-folder`,
    { folder_path: trimmed },
    { params: wsParams(workspace) },
  );
  const f = data?.folder && typeof data.folder === 'object' ? data.folder : {};
  return {
    id: typeof f.id === 'string' && f.id ? f.id : 'folder-1',
    path: typeof f.path === 'string' && f.path ? f.path : trimmed,
    added_at: typeof f.added_at === 'string' ? f.added_at : undefined,
    last_synced_at:
      typeof f.last_synced_at === 'string' ? f.last_synced_at : null,
  };
}

export async function unlinkServerFolder(
  kbName: string,
  folderId: string,
  workspace?: string,
): Promise<void> {
  await api.delete(
    `/knowledge-bases/${encodeURIComponent(kbName)}/linked-folders/${encodeURIComponent(folderId)}`,
    { params: wsParams(workspace) },
  );
}

export async function syncLinkedFolder(
  kbName: string,
  folderId: string,
  workspace?: string,
): Promise<{ status: string; added_files: string[]; modified_files: string[] }> {
  const { data } = await api.post<{
    status?: string;
    added_files?: string[];
    modified_files?: string[];
  }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/sync-folder/${encodeURIComponent(folderId)}`,
    {},
    { params: wsParams(workspace) },
  );
  return {
    status: typeof data?.status === 'string' ? data.status : 'up_to_date',
    added_files: Array.isArray(data?.added_files) ? data.added_files : [],
    modified_files: Array.isArray(data?.modified_files) ? data.modified_files : [],
  };
}

export async function listGitHubSources(
  kbName: string,
  workspace?: string,
  signal?: AbortSignal,
): Promise<GitHubSourceItem[]> {
  const { data } = await api.get<{ github_sources?: unknown[] }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/github-sources`,
    { params: wsParams(workspace), signal },
  );
  const rows = Array.isArray(data?.github_sources) ? data.github_sources : [];
  return rows
    .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'))
    .map((r, idx) => ({
      id: typeof r.id === 'string' && r.id ? r.id : `gh-${idx + 1}`,
      repo: typeof r.repo === 'string' ? r.repo : '',
      branch: typeof r.branch === 'string' && r.branch ? r.branch : 'main',
      path: typeof r.path === 'string' ? r.path : '',
      glob: typeof r.glob === 'string' && r.glob ? r.glob : '**/*.md',
      last_synced_at:
        typeof r.last_synced_at === 'string' ? r.last_synced_at : null,
      last_commit_sha:
        typeof r.last_commit_sha === 'string' ? r.last_commit_sha : null,
      file_count: typeof r.file_count === 'number' ? r.file_count : undefined,
    }))
    .filter(item => Boolean(item.repo));
}

export async function addGitHubSource(
  kbName: string,
  input: { repo: string; branch?: string; path?: string; glob?: string },
  workspace?: string,
): Promise<GitHubSourceItem> {
  const repo = input.repo.trim();
  if (!repo || !repo.includes('/')) {
    throw new Error('GitHub repository must be formatted as owner/repo.');
  }
  const { data } = await api.post<{ source?: Record<string, unknown> }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/github-source`,
    {
      repo,
      branch: (input.branch ?? 'main').trim() || 'main',
      path: (input.path ?? '').trim(),
      glob: (input.glob ?? '**/*.md').trim() || '**/*.md',
    },
    { params: wsParams(workspace) },
  );
  const s = data?.source && typeof data.source === 'object' ? data.source : {};
  return {
    id: typeof s.id === 'string' && s.id ? s.id : 'gh-1',
    repo: typeof s.repo === 'string' && s.repo ? s.repo : repo,
    branch: typeof s.branch === 'string' && s.branch ? s.branch : input.branch || 'main',
    path: typeof s.path === 'string' ? s.path : input.path || '',
    glob: typeof s.glob === 'string' && s.glob ? s.glob : input.glob || '**/*.md',
    last_synced_at:
      typeof s.last_synced_at === 'string' ? s.last_synced_at : null,
  };
}

export async function removeGitHubSource(
  kbName: string,
  sourceId: string,
  workspace?: string,
): Promise<void> {
  await api.delete(
    `/knowledge-bases/${encodeURIComponent(kbName)}/github-source/${encodeURIComponent(sourceId)}`,
    { params: wsParams(workspace) },
  );
}

export async function syncGitHubSources(
  kbName: string,
  workspace?: string,
): Promise<{ status: string; new_or_updated_files: number }> {
  const { data } = await api.post<{
    status?: string;
    new_or_updated_files?: number;
  }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/sync-github`,
    {},
    { params: wsParams(workspace) },
  );
  return {
    status: typeof data?.status === 'string' ? data.status : 'up_to_date',
    new_or_updated_files:
      typeof data?.new_or_updated_files === 'number'
        ? data.new_or_updated_files
        : 0,
  };
}

export async function listWebSources(
  kbName: string,
  workspace?: string,
  signal?: AbortSignal,
): Promise<WebSourceItem[]> {
  const { data } = await api.get<{ web_sources?: unknown[] }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/web-sources`,
    { params: wsParams(workspace), signal },
  );
  const rows = Array.isArray(data?.web_sources) ? data.web_sources : [];
  return rows
    .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'))
    .map((r, idx) => ({
      id: typeof r.id === 'string' && r.id ? r.id : `web-${idx + 1}`,
      url: typeof r.url === 'string' ? r.url : '',
      max_depth: typeof r.max_depth === 'number' ? r.max_depth : 2,
      max_pages: typeof r.max_pages === 'number' ? r.max_pages : 20,
      auto_sync_enabled: Boolean(r.auto_sync_enabled),
      sync_interval_hours:
        typeof r.sync_interval_hours === 'number' ? r.sync_interval_hours : 24,
      last_synced_at:
        typeof r.last_synced_at === 'string' ? r.last_synced_at : null,
      next_sync_at:
        typeof r.next_sync_at === 'string' ? r.next_sync_at : null,
      last_sync_status:
        typeof r.last_sync_status === 'string' ? r.last_sync_status : 'pending',
      last_error: typeof r.last_error === 'string' ? r.last_error : null,
      file_count: typeof r.file_count === 'number' ? r.file_count : undefined,
    }))
    .filter(item => Boolean(item.url));
}

export async function addWebSource(
  kbName: string,
  input: {
    url: string;
    max_depth?: number;
    max_pages?: number;
    auto_sync_enabled?: boolean;
    sync_interval_hours?: number;
  },
  workspace?: string,
): Promise<WebSourceItem> {
  const url = input.url.trim();
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('Documentation URL must start with http:// or https://.');
  }
  const { data } = await api.post<{ source?: Record<string, unknown> }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/web-source`,
    {
      url,
      max_depth: input.max_depth ?? 2,
      max_pages: input.max_pages ?? 20,
    },
    { params: wsParams(workspace) },
  );
  const s = data?.source && typeof data.source === 'object' ? data.source : {};
  const id = typeof s.id === 'string' && s.id ? s.id : 'web-1';
  let result: WebSourceItem = {
    id,
    url: typeof s.url === 'string' && s.url ? s.url : url,
    max_depth: typeof s.max_depth === 'number' ? s.max_depth : input.max_depth ?? 2,
    max_pages: typeof s.max_pages === 'number' ? s.max_pages : input.max_pages ?? 20,
    auto_sync_enabled: Boolean(s.auto_sync_enabled ?? input.auto_sync_enabled),
    sync_interval_hours:
      typeof s.sync_interval_hours === 'number'
        ? s.sync_interval_hours
        : input.sync_interval_hours ?? 24,
    last_synced_at:
      typeof s.last_synced_at === 'string' ? s.last_synced_at : null,
    last_sync_status:
      typeof s.last_sync_status === 'string' ? s.last_sync_status : 'pending',
  };
  if (input.auto_sync_enabled !== undefined) {
    result = await updateWebSourceSchedule(
      kbName,
      id,
      {
        auto_sync_enabled: input.auto_sync_enabled,
        sync_interval_hours: input.sync_interval_hours ?? 24,
      },
      workspace,
    );
  }
  return result;
}

export async function updateWebSourceSchedule(
  kbName: string,
  sourceId: string,
  input: { auto_sync_enabled: boolean; sync_interval_hours?: number },
  workspace?: string,
): Promise<WebSourceItem> {
  const { data } = await api.put<{ source?: Record<string, unknown> }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/web-source/${encodeURIComponent(sourceId)}/schedule`,
    {
      auto_sync_enabled: input.auto_sync_enabled,
      sync_interval_hours: input.sync_interval_hours ?? 24,
    },
    { params: wsParams(workspace) },
  );
  const s = data?.source && typeof data.source === 'object' ? data.source : {};
  return {
    id: typeof s.id === 'string' && s.id ? s.id : sourceId,
    url: typeof s.url === 'string' ? s.url : '',
    max_depth: typeof s.max_depth === 'number' ? s.max_depth : 2,
    max_pages: typeof s.max_pages === 'number' ? s.max_pages : 20,
    auto_sync_enabled: Boolean(s.auto_sync_enabled ?? input.auto_sync_enabled),
    sync_interval_hours:
      typeof s.sync_interval_hours === 'number'
        ? s.sync_interval_hours
        : input.sync_interval_hours ?? 24,
    last_synced_at:
      typeof s.last_synced_at === 'string' ? s.last_synced_at : null,
    next_sync_at:
      typeof s.next_sync_at === 'string' ? s.next_sync_at : null,
    last_sync_status:
      typeof s.last_sync_status === 'string' ? s.last_sync_status : 'pending',
  };
}

export async function removeWebSource(
  kbName: string,
  sourceId: string,
  workspace?: string,
): Promise<void> {
  await api.delete(
    `/knowledge-bases/${encodeURIComponent(kbName)}/web-source/${encodeURIComponent(sourceId)}`,
    { params: wsParams(workspace) },
  );
}

export async function syncWebSources(
  kbName: string,
  workspace?: string,
): Promise<{ status: string; new_or_updated_files: number }> {
  const { data } = await api.post<{
    status?: string;
    new_or_updated_files?: number;
  }>(
    `/knowledge-bases/${encodeURIComponent(kbName)}/sync-web`,
    {},
    { params: wsParams(workspace) },
  );
  return {
    status: typeof data?.status === 'string' ? data.status : 'up_to_date',
    new_or_updated_files:
      typeof data?.new_or_updated_files === 'number'
        ? data.new_or_updated_files
        : 0,
  };
}

const normalizePipelineSlug = (provider: string): string => {
  const p = provider.trim().toLowerCase();
  if (p === 'lightrag_server' || p === 'lightrag-server') return 'lightrag-server';
  if (p === 'pageindex_oss' || p === 'pageindex-oss') return 'pageindex';
  if (['llamaindex', 'pageindex', 'graphrag', 'lightrag', 'ima'].includes(p)) {
    return p;
  }
  return 'llamaindex';
};

export async function listRagProviders(
  signal?: AbortSignal,
): Promise<RagProviderItem[]> {
  const { data } = await api.get<{ providers?: unknown[] }>(
    '/knowledge-bases/rag-providers',
    { signal },
  );
  const rows = Array.isArray(data?.providers) ? data.providers : [];
  return rows
    .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'))
    .map(r => {
      const id = typeof r.id === 'string' ? r.id : 'llamaindex';
      return {
        id,
        name: typeof r.name === 'string' && r.name ? r.name : id,
        description: typeof r.description === 'string' ? r.description : '',
        available: r.available !== false,
        requires_key: Boolean(r.requires_key),
        key_configured: Boolean(r.key_configured),
        modes: Array.isArray(r.modes)
          ? r.modes.filter((m): m is string => typeof m === 'string')
          : undefined,
        default_mode:
          typeof r.default_mode === 'string' ? r.default_mode : undefined,
        linkable: Boolean(r.linkable),
      };
    });
}

export async function getPipelineConfig(
  provider: string,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  const slug = normalizePipelineSlug(provider);
  const { data } = await api.get<Record<string, unknown>>(
    `/knowledge-bases/rag-pipelines/${encodeURIComponent(slug)}/config`,
    { signal },
  );
  return data && typeof data === 'object' ? data : {};
}

export async function updatePipelineConfig(
  provider: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const slug = normalizePipelineSlug(provider);
  const { data } = await api.put<Record<string, unknown>>(
    `/knowledge-bases/rag-pipelines/${encodeURIComponent(slug)}/config`,
    payload,
  );
  return data && typeof data === 'object' ? data : payload;
}

export async function preflightRagProvider(
  provider: string,
  signal?: AbortSignal,
): Promise<RagPreflightReport> {
  const { data } = await api.get<{
    ok?: boolean;
    checks?: RagPreflightCheck[];
  }>(
    `/knowledge-bases/rag-pipelines/${encodeURIComponent(provider.trim() || 'llamaindex')}/preflight`,
    { signal },
  );
  return {
    ok: Boolean(data?.ok),
    checks: Array.isArray(data?.checks) ? data.checks : [],
  };
}

export async function previewKnowledgeBaseMove(
  sourceId: string,
  targetWorkspaceId: string,
): Promise<KnowledgeMovePreview> {
  const { data } = await api.post<Record<string, unknown>>(
    '/settings/workspace/knowledge-bases/preview-move',
    {
      source_id: sourceId,
      target_workspace_id: targetWorkspaceId,
    },
  );
  const d = data && typeof data === 'object' ? data : {};
  return {
    source_id: typeof d.source_id === 'string' ? d.source_id : sourceId,
    name: typeof d.name === 'string' ? d.name : sourceId,
    source_workspace_id:
      typeof d.source_workspace_id === 'string' ? d.source_workspace_id : '',
    target_workspace_id:
      typeof d.target_workspace_id === 'string'
        ? d.target_workspace_id
        : targetWorkspaceId,
    affected_workspaces: Array.isArray(d.affected_workspaces)
      ? d.affected_workspaces.filter((w): w is string => typeof w === 'string')
      : [],
    can_move: d.can_move !== false,
  };
}

export async function moveKnowledgeBase(
  sourceId: string,
  targetWorkspaceId: string,
): Promise<KnowledgeMoveResult> {
  const { data } = await api.post<Record<string, unknown>>(
    '/settings/workspace/knowledge-bases/move',
    {
      source_id: sourceId,
      target_workspace_id: targetWorkspaceId,
    },
  );
  const d = data && typeof data === 'object' ? data : {};
  return {
    status: typeof d.status === 'string' ? d.status : 'moved',
    id: typeof d.id === 'string' ? d.id : sourceId,
    name: typeof d.name === 'string' ? d.name : sourceId,
    target_workspace_id:
      typeof d.target_workspace_id === 'string'
        ? d.target_workspace_id
        : targetWorkspaceId,
  };
}

export async function pickKnowledgeBaseFiles(): Promise<PickedKnowledgeFile[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) {
    return [];
  }
  return result.assets.map(asset => ({
    uri: asset.uri,
    name: asset.name || 'document.pdf',
    mimeType: asset.mimeType || 'application/octet-stream',
    size: asset.size,
    webFile: (asset as unknown as { file?: File }).file,
  }));
}
