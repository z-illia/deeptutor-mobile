import { isAxiosError } from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { api } from '@/api/client';

export type NoteSummary = {
  id: string;
  title: string;
  preview: string;
  created_at: number;
  updated_at: number;
  parent_id: string | null;
  icon: string;
  cover?: string;
  pinned: boolean;
  revision: number;
};

export type NotePage = NoteSummary & {
  content: string;
  blocks: Record<string, unknown>[] | null;
};

export type NoteSuggestion = {
  id: string;
  operation: 'insert' | 'replace' | 'delete' | 'comment';
  block_id: string;
  markdown: string;
  explanation: string;
  original_text: string;
  status: 'pending' | 'accepted' | 'dismissed';
};

export type StagedNoteReview = {
  docId: string;
  title: string;
  originalContent: string;
  suggestedContent: string;
  explanation?: string;
  suggestionId?: string;
  revision?: number;
};

const invalid = () => new Error('Invalid resource data received from the server.');

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
  return value as Record<string, unknown>;
}

function list(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw invalid();
  return value.map(record);
}

function parseSummary(raw: Record<string, unknown>): NoteSummary {
  if (typeof raw.id !== 'string' || !raw.id.trim()) throw invalid();
  return {
    id: raw.id,
    title: typeof raw.title === 'string' ? raw.title : '',
    preview: typeof raw.preview === 'string' ? raw.preview : '',
    created_at: typeof raw.created_at === 'number' ? raw.created_at : 0,
    updated_at: typeof raw.updated_at === 'number' ? raw.updated_at : 0,
    parent_id: typeof raw.parent_id === 'string' ? raw.parent_id : null,
    icon: typeof raw.icon === 'string' ? raw.icon : '',
    cover: typeof raw.cover === 'string' ? raw.cover : undefined,
    pinned: Boolean(raw.pinned),
    revision: typeof raw.revision === 'number' ? raw.revision : 0,
  };
}

function parsePage(raw: Record<string, unknown>): NotePage {
  const summary = parseSummary(raw);
  const content = typeof raw.content === 'string' ? raw.content : '';
  return {
    ...summary,
    preview: summary.preview || content.slice(0, 140),
    content,
    blocks: Array.isArray(raw.blocks) ? raw.blocks.map(record) : null,
  };
}

function parseSuggestion(raw: Record<string, unknown>): NoteSuggestion {
  if (typeof raw.id !== 'string' || !raw.id.trim()) throw invalid();
  const op = raw.operation;
  const status = raw.status;
  const orig = raw.original && typeof raw.original === 'object' && !Array.isArray(raw.original)
    ? (raw.original as Record<string, unknown>)
    : null;
  const origContent = orig && typeof orig.content === 'string' ? orig.content : '';
  return {
    id: raw.id,
    operation: op === 'insert' || op === 'replace' || op === 'delete' || op === 'comment' ? op : 'replace',
    block_id: typeof raw.block_id === 'string' ? raw.block_id : '',
    markdown: typeof raw.markdown === 'string' ? raw.markdown : '',
    explanation: typeof raw.explanation === 'string' ? raw.explanation : '',
    original_text: origContent,
    status: status === 'pending' || status === 'accepted' || status === 'dismissed' ? status : 'pending',
  };
}

export function noteError(cause: unknown): string {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (cause.response?.status === 403) return 'This page is not available for your account.';
    const detail = (cause.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (!cause.response) return "Couldn't reach the server. Please check your connection and retry.";
  }
  return cause instanceof Error ? cause.message : 'Failed to load resource counts';
}

export async function listNotes(workspace: string, signal?: AbortSignal): Promise<NoteSummary[]> {
  const data = record((await api.get('/documents', { params: { dt_workspace: workspace }, signal })).data);
  return list(data.documents).map(parseSummary);
}

export async function getNote(workspace: string, docId: string, signal?: AbortSignal): Promise<NotePage> {
  const { data } = await api.get(`/documents/${encodeURIComponent(docId)}`, {
    params: { dt_workspace: workspace },
    signal,
  });
  return parsePage(record(data));
}

export async function createNote(
  workspace: string,
  payload: { title?: string; content?: string; parent_id?: string | null } = {},
): Promise<NotePage> {
  const content = payload.content ?? '';
  const body = {
    title: payload.title ?? '',
    parent_id: payload.parent_id ?? null,
    content,
    ...(content ? {} : { blocks: [] }),
  };
  const { data } = await api.post('/documents', body, { params: { dt_workspace: workspace } });
  return parsePage(record(data));
}

export async function saveNote(
  workspace: string,
  docId: string,
  patch: {
    title?: string;
    content?: string;
    expected_revision?: number;
    pinned?: boolean;
    icon?: string;
    cover?: string;
  },
): Promise<NotePage> {
  const { data } = await api.put(`/documents/${encodeURIComponent(docId)}`, patch, {
    params: { dt_workspace: workspace },
  });
  return parsePage(record(data));
}

export async function deleteNote(workspace: string, docId: string): Promise<boolean> {
  const { data } = await api.delete(`/documents/${encodeURIComponent(docId)}`, {
    params: { dt_workspace: workspace },
  });
  return Boolean(record(data).deleted);
}

export async function pickAndImportDocx(workspace: string): Promise<NotePage | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '*/*'],
    copyToCacheDirectory: true,
  });
  if (picked.canceled || !picked.assets?.[0]) return null;
  const asset = picked.assets[0];
  if (typeof asset.size === 'number' && asset.size > 20 * 1024 * 1024) {
    throw new Error('Image is too large');
  }
  const form = new FormData();
  if (Platform.OS === 'web' && asset.file) {
    form.append('file', asset.file, asset.name);
  } else {
    form.append(
      'file',
      {
        uri: asset.uri,
        name: asset.name || 'document.docx',
        type: asset.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      } as unknown as Blob,
    );
  }
  const { data } = await api.post('/documents/import/docx', form, {
    params: { dt_workspace: workspace },
    headers: { 'Content-Type': undefined },
  });
  return parsePage(record(data));
}

export async function listNoteSuggestions(
  workspace: string,
  docId: string,
  signal?: AbortSignal,
): Promise<NoteSuggestion[]> {
  const data = record(
    (
      await api.get(`/documents/${encodeURIComponent(docId)}/suggestions`, {
        params: { dt_workspace: workspace },
        signal,
      })
    ).data,
  );
  return list(data.suggestions).map(parseSuggestion);
}

export async function reviewNoteSuggestion(
  workspace: string,
  docId: string,
  suggestionId: string,
  accept: boolean,
): Promise<NotePage> {
  const { data } = await api.post(
    `/documents/${encodeURIComponent(docId)}/suggestions/${encodeURIComponent(suggestionId)}`,
    { accept },
    { params: { dt_workspace: workspace } },
  );
  return parsePage(record(data));
}

export async function requestDitoEdit(
  workspace: string,
  payload: {
    text: string;
    instruction?: string;
    action?: 'rewrite' | 'shorten' | 'expand';
  },
): Promise<{ edited_text: string; operation_id: string }> {
  const { data } = await api.post(
    '/documents/actions/edit',
    {
      text: payload.text,
      instruction: payload.instruction?.trim() || 'Improve clarity and structure while keeping the meaning.',
      action: payload.action ?? 'rewrite',
    },
    { params: { dt_workspace: workspace } },
  );
  const raw = record(data);
  if (typeof raw.edited_text !== 'string') throw invalid();
  return {
    edited_text: raw.edited_text,
    operation_id: typeof raw.operation_id === 'string' ? raw.operation_id : '',
  };
}

const activeNoteIds = new Map<string, string>();
const stagedReviews = new Map<string, StagedNoteReview>();

export function setActiveNoteId(scopeKey: string, docId: string | null) {
  if (docId) activeNoteIds.set(scopeKey, docId);
  else activeNoteIds.delete(scopeKey);
}

export function getActiveNoteId(scopeKey: string): string | null {
  return activeNoteIds.get(scopeKey) ?? null;
}

export function stageNoteReview(scopeKey: string, review: StagedNoteReview | null) {
  if (review) stagedReviews.set(scopeKey, review);
  else stagedReviews.delete(scopeKey);
}

export function readStagedNoteReview(scopeKey: string): StagedNoteReview | null {
  return stagedReviews.get(scopeKey) ?? null;
}
