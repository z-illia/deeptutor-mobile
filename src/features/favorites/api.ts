import { isAxiosError } from 'axios';
import { api } from '@/api/client';
import { DEFAULT_NOTEBOOK_COLOR, type NotebookRecordItem, type NotebookSavePayload, type NotebookSummary } from './model';

export type NotebookInput = { name: string; description?: string; color?: string };
export type SaveResult = { records: NotebookRecordItem[]; savedNotebookIds: string[]; failedNotebookIds: string[] };
const root = '/notebooks';
const notebookPath = (id: string) => `${root}/${encodeURIComponent(id)}`;
const recordPath = (id: string, record: string) => `${notebookPath(id)}/records/${encodeURIComponent(record)}`;
const config = (workspace: string, signal?: AbortSignal) => ({ params: { dt_workspace: workspace }, signal });

export function favoritesError(cause: unknown): string {
  if (isAxiosError(cause)) {
    const detail = cause.response?.data?.detail;
    if (cause.response?.status === 409 && detail?.code === 'notebook_unreadable') return 'This collection is unreadable. Restore a backup or delete it.';
    if (typeof detail === 'string') return detail;
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
  }
  return cause instanceof Error && !isAxiosError(cause) ? cause.message : 'Unable to load Favorites';
}

function summary(value: unknown, workspace: string): NotebookSummary {
  const row = value as (Partial<NotebookSummary> & { records?: unknown }) | null;
  if (!row || typeof row.id !== 'string' || typeof row.name !== 'string') throw new Error('Unable to load Favorites');
  const { records, ...fields } = row;
  const count = Array.isArray(records) ? records.length : row.record_count ?? 0;
  if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) throw new Error('Unable to load Favorites');
  return { ...fields, id: row.id, name: row.name, color: row.color || DEFAULT_NOTEBOOK_COLOR, record_count: count, updated_at: row.updated_at ?? 0, workspace_id: workspace };
}
function record(value: unknown, notebookId: string): NotebookRecordItem {
  const row = value as Partial<NotebookRecordItem> | null;
  if (!row || typeof row.id !== 'string' || typeof row.title !== 'string' || typeof row.type !== 'string' || typeof row.output !== 'string' || typeof row.user_query !== 'string') throw new Error('Unable to load Favorites');
  return { ...row, id: row.id, title: row.title, type: row.type, output: row.output, user_query: row.user_query, notebook_id: notebookId, created_at: row.created_at ?? 0 };
}

export async function listNotebooks(workspace: string, signal?: AbortSignal): Promise<NotebookSummary[]> {
  const { data } = await api.get(root, config(workspace, signal));
  if (!Array.isArray(data?.notebooks)) throw new Error('Unable to load Favorites');
  return data.notebooks.map((item: unknown) => summary(item, workspace));
}
export async function getNotebook(id: string, workspace: string, signal?: AbortSignal) {
  const { data } = await api.get(notebookPath(id), config(workspace, signal));
  if (!Array.isArray(data?.records)) throw new Error('Unable to load Favorites');
  return { notebook: summary(data, workspace), records: data.records.map((item: unknown) => record(item, id)) as NotebookRecordItem[] };
}
export async function createNotebook(input: NotebookInput, workspace: string, signal?: AbortSignal) {
  const { data } = await api.post(root, { ...input, icon: 'book' }, config(workspace, signal));
  return summary(data?.notebook, workspace);
}
export async function updateNotebook(id: string, input: NotebookInput, workspace: string, signal?: AbortSignal) {
  const { data } = await api.put(notebookPath(id), input, config(workspace, signal));
  return summary(data?.notebook, workspace);
}
export async function deleteNotebook(id: string, workspace: string, signal?: AbortSignal) {
  await api.delete(notebookPath(id), config(workspace, signal));
}
export async function saveRecord(ids: string[], payload: NotebookSavePayload, workspace: string, signal?: AbortSignal): Promise<SaveResult> {
  const requested = [...new Set(ids)];
  const { data } = await api.post(`${root}/actions/add-record`, {
    notebook_ids: requested, record_type: payload.recordType, title: payload.title, summary: payload.summary ?? '',
    user_query: payload.userQuery, output: payload.output, metadata: payload.metadata ?? {}, kb_name: payload.kbName ?? null,
  }, { ...config(workspace, signal), timeout: 120000 });
  if (!Array.isArray(data?.added_to_notebooks) || data.added_to_notebooks.some((id: unknown) => typeof id !== 'string')) throw new Error('Unable to load Favorites');
  const savedNotebookIds = requested.filter(id => data.added_to_notebooks.includes(id));
  return { savedNotebookIds, failedNotebookIds: requested.filter(id => !savedNotebookIds.includes(id)), records: savedNotebookIds.map(id => record(data.record, id)) };
}
export async function updateRecord(id: string, recordId: string, patch: { title: string; summary?: string }, workspace: string, signal?: AbortSignal) {
  // Saved originals are immutable: never resend output, query, or provenance.
  const { data } = await api.put(recordPath(id, recordId), patch, config(workspace, signal));
  return record(data?.record, id);
}
export async function deleteRecord(id: string, recordId: string, workspace: string, signal?: AbortSignal) {
  await api.delete(recordPath(id, recordId), config(workspace, signal));
}
export async function relocateRecord(mode: 'move' | 'copy', id: string, recordId: string, target: string, workspace: string, signal?: AbortSignal) {
  const { data } = await api.post(`${recordPath(id, recordId)}/actions/${mode}`, { target_notebook_id: target }, config(workspace, signal));
  return record(data?.record, target);
}
export async function locateRecord(recordId: string, preferredId: string, workspace: string, signal?: AbortSignal): Promise<string> {
  const { data } = await api.get(`${root}/records/${encodeURIComponent(recordId)}/location`, { ...config(workspace, signal), params: { dt_workspace: workspace, notebook_id: preferredId } });
  if (typeof data?.notebook_id !== 'string') throw new Error('Unable to load Favorites');
  return data.notebook_id;
}
export async function exportNotebook(id: string, workspace: string, signal?: AbortSignal): Promise<string> {
  const { data } = await api.get(`${notebookPath(id)}/export`, { ...config(workspace, signal), responseType: 'text' });
  if (typeof data !== 'string') throw new Error('Unable to load Favorites');
  return data;
}
