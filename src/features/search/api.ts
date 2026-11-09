import { isAxiosError } from 'axios';
import { api } from '@/api/client';
import type { SearchRecord } from './repository';

export const SEARCH_LIMIT = 50;
export const MAX_QUERY_LENGTH = 200;
type Row = Record<string, unknown>;
function object(value: unknown): Row {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid search data received from the server.');
  return value as Row;
}
function rows(value: unknown): Row[] {
  if (!Array.isArray(value)) throw new Error('Invalid search data received from the server.');
  return value.map(object);
}
function id(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Invalid search data received from the server.');
  return value;
}
function text(value: unknown): string { return typeof value === 'string' ? value : ''; }
function scope(row: Row, workspace: string) {
  if (row.content_workspace_id !== undefined && row.content_workspace_id !== workspace) throw new Error('Invalid search data received from the server.');
}
export function searchError(cause: unknown) {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (cause.response?.status === 403) return 'This page is not available for your account.';
    if (cause.response?.status === 404 || cause.response?.status === 501) return 'Search is not available on this server.';
    const detail = cause.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    return 'Failed to search. Please try again.';
  }
  return cause instanceof Error ? cause.message : 'Failed to search. Please try again.';
}
export async function searchConversations(query: string, workspace: string, offset = 0, signal?: AbortSignal) {
  const q = query.trim();
  if (q.length > MAX_QUERY_LENGTH) throw new Error('Search query must be 200 characters or fewer.');
  if (!Number.isInteger(offset) || offset < 0) throw new Error('Invalid search data received from the server.');
  const data = object((await api.get(q ? '/sessions/search' : '/sessions', { params: { ...(q ? { q } : {}), dt_workspace: workspace, limit: SEARCH_LIMIT, offset }, signal })).data);
  const sessions = rows(data.sessions);
  if (sessions.length > SEARCH_LIMIT || (q && (!Number.isSafeInteger(data.total) || Number(data.total) < 0 || data.limit !== SEARCH_LIMIT || data.offset !== offset))) throw new Error('Invalid search data received from the server.');
  const records: SearchRecord[] = sessions.flatMap(row => {
    scope(row, workspace);
    const sessionId = id(row.session_id);
    const preferences = row.preferences === undefined || row.preferences === null ? {} : object(row.preferences);
    if (preferences.archived || preferences.parent_session_id) return [];
    return [{ id: `session:${sessionId}`, kind: 'session', label: text(row.title), detail: (text(row.match_excerpt) || text(row.last_message) || text(row.last_message_preview)).slice(0, 320), href: `/chat/${encodeURIComponent(sessionId)}`, workspace }];
  });
  return { records, offset: offset + sessions.length, hasMore: q ? offset + sessions.length < Number(data.total) && sessions.length > 0 : sessions.length === SEARCH_LIMIT };
}
export async function searchLearning(query: string, workspace: string, signal?: AbortSignal): Promise<SearchRecord[]> {
  const data = object((await api.get('/mastery-paths/topics', { params: { dt_workspace: workspace }, signal })).data);
  const q = query.trim().toLocaleLowerCase();
  return rows(data.topics).map(row => {
    scope(row, workspace);
    const pathId = id(row.path_id); const metadata = row.metadata ? object(row.metadata) : {};
    return { id: `learning:${pathId}`, kind: 'learning' as const, label: id(row.name), detail: [text(metadata.goal), text(metadata.description)].filter(Boolean).join(' · '), href: `/learning/mastery/${encodeURIComponent(pathId)}`, workspace };
  }).filter(row => !q || `${row.label} ${row.detail}`.toLocaleLowerCase().includes(q));
}
export async function searchPartners(query: string, signal?: AbortSignal): Promise<SearchRecord[]> {
  const data = object((await api.get('/partners/navigation', { signal })).data);
  const q = query.trim().toLocaleLowerCase();
  return [...rows(data.partners).map(row => ({ id: `partner:${id(row.partner_id)}`, kind: 'partner' as const, label: id(row.name), detail: text(row.description), href: `/partners/${encodeURIComponent(id(row.partner_id))}` })),
    ...rows(data.groups).map(row => ({ id: `group:${id(row.group_id)}`, kind: 'group' as const, label: id(row.name), detail: text(row.description), href: `/partners/groups/${encodeURIComponent(id(row.group_id))}` }))]
    .filter(row => !q || `${row.label} ${row.detail}`.toLocaleLowerCase().includes(q));
}
