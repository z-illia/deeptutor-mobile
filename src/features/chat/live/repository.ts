import { isAxiosError } from 'axios';
import { contentFingerprint, richDiagnostic } from '@/shared/markdown/diagnostics';
import { api } from '@/api/client';
import type { SessionOrganizationPatch, SessionSummary, SessionWorkspaceMode } from '../model';
import type { ChatModel, Conversation } from './protocol';

export function conversationError(cause: unknown): string {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (cause.response?.status === 403) return 'This page is not available for your account.';
    const detail = (cause.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (detail && typeof detail === 'object' && 'message' in detail && typeof detail.message === 'string') return detail.message;
    if (!cause.response) return "Couldn't reach the server. Please check your connection and retry.";
  }
  return cause instanceof Error ? cause.message : 'Failed to save';
}

function normalizeTimestamp(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value > 1e11 ? value : value * 1000;
    return new Date(ms).toISOString();
  }
  if (typeof value === 'string' && value.trim()) return value;
  return new Date(0).toISOString();
}

export function normalizeSessionSummary(raw: Record<string, unknown>, workspace: string): SessionSummary {
  if (typeof raw.session_id !== 'string' || !raw.session_id.trim()) {
    throw new Error('Invalid conversation list received from the server.');
  }
  const prefs = raw.preferences && typeof raw.preferences === 'object' && !Array.isArray(raw.preferences)
    ? (raw.preferences as Record<string, unknown>)
    : {};
  const kind = prefs.session_kind ?? raw.session_type;
  const mode = (prefs.workspace_mode ?? raw.workspace_mode ?? 'chat') as string;
  const resolvedWorkspace = typeof raw.content_workspace_id === 'string'
    ? raw.content_workspace_id
    : typeof prefs.workspace_id === 'string'
      ? prefs.workspace_id
      : workspace;
  return {
    session_id: raw.session_id,
    title: typeof raw.title === 'string' ? raw.title : '',
    created_at: normalizeTimestamp(raw.created_at),
    updated_at: normalizeTimestamp(raw.updated_at ?? raw.created_at),
    message_count: typeof raw.message_count === 'number' ? raw.message_count : 0,
    last_message_preview:
      typeof raw.last_message === 'string'
        ? raw.last_message
        : typeof raw.last_message_preview === 'string'
          ? raw.last_message_preview
          : '',
    session_type: kind === 'selection_tutor' ? 'selection_tutor' : 'chat',
    parent_session_id: typeof prefs.parent_session_id === 'string' ? prefs.parent_session_id : null,
    workspace_id: resolvedWorkspace,
    workspace_mode: (mode === 'mastery_path' || mode === 'immersive_reading' ? mode : 'chat') as SessionWorkspaceMode,
    preferences: {
      pinned: Boolean(prefs.pinned),
      archived: Boolean(prefs.archived),
      archived_at: typeof prefs.archived_at === 'string' ? prefs.archived_at : null,
      workspace_id: resolvedWorkspace,
      mastery_path_id: typeof prefs.mastery_path_id === 'string' ? prefs.mastery_path_id : null,
      reading_workspace_id: typeof prefs.reading_workspace_id === 'string' ? prefs.reading_workspace_id : null,
    },
  };
}

export async function listConversations(signal?: AbortSignal, offset = 0, workspace?: string) {
  const { data } = await api.get<{ sessions: Conversation[] }>('/sessions', { params: { limit: 50, offset, ...(workspace !== undefined ? { dt_workspace: workspace } : {}) }, signal });
  if (!Array.isArray(data.sessions)) throw new Error('Invalid conversation list received from the server.');
  return data.sessions;
}

export async function listWorkspaceSessionSummaries(workspace: string, signal?: AbortSignal): Promise<SessionSummary[]> {
  const pageSize = 200;
  const seen = new Set<string>();
  const result: SessionSummary[] = [];
  for (let offset = 0; ; offset += pageSize) {
    if (signal?.aborted) throw new Error('cancelled');
    const { data } = await api.get<{ sessions: unknown }>('/sessions', {
      params: { limit: pageSize, offset, dt_workspace: workspace },
      signal,
    });
    if (!data || typeof data !== 'object' || !Array.isArray(data.sessions)) {
      throw new Error('Invalid conversation list received from the server.');
    }
    let added = 0;
    for (const item of data.sessions) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        throw new Error('Invalid conversation list received from the server.');
      }
      const summary = normalizeSessionSummary(item as Record<string, unknown>, workspace);
      if (seen.has(summary.session_id)) continue;
      seen.add(summary.session_id);
      result.push(summary);
      added++;
    }
    if (data.sessions.length < pageSize || added === 0) return result;
  }
}

export async function getConversation(id: string, signal?: AbortSignal, workspace?: string) {
  const { data } = await api.get<Conversation>(`/sessions/${encodeURIComponent(id)}`, { signal, ...(workspace !== undefined ? { params: { dt_workspace: workspace } } : {}) });
  if (!Array.isArray(data.messages)) throw new Error('Invalid conversation received from the server.');
  if (typeof __DEV__ !== 'undefined' && __DEV__) for (const row of data.messages) if (typeof row.content === 'string') richDiagnostic('history-decoded', { fingerprint: contentFingerprint(row.content), length: row.content.length, role: row.role });
  return data;
}

export async function listChatModels(signal?: AbortSignal) {
  const { data } = await api.get<{ options: ChatModel[]; active: { profile_id: string; model_id: string } | null }>('/settings/llm-options', { signal });
  if (!Array.isArray(data.options)) throw new Error('Invalid model catalog received from the server.');
  return data;
}

export async function renameConversation(sessionId: string, title: string, workspace?: string): Promise<void> {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('Title cannot be empty.');
  await api.patch(
    `/sessions/${encodeURIComponent(sessionId)}`,
    { title: trimmed },
    workspace !== undefined ? { params: { dt_workspace: workspace } } : undefined,
  );
}

export async function organizeConversation(
  sessionId: string,
  patch: SessionOrganizationPatch,
  workspace?: string,
): Promise<void> {
  await api.patch(
    `/sessions/${encodeURIComponent(sessionId)}/organization`,
    patch,
    workspace !== undefined ? { params: { dt_workspace: workspace } } : undefined,
  );
}

export async function deleteConversation(sessionId: string, workspace?: string): Promise<void> {
  const { data } = await api.delete<{ deleted?: boolean }>(
    `/sessions/${encodeURIComponent(sessionId)}`,
    workspace !== undefined ? { params: { dt_workspace: workspace } } : undefined,
  );
  if (!data || data.deleted !== true) {
    throw new Error('Could not delete conversation.');
  }
}
