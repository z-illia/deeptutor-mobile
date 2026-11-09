import { isAxiosError } from 'axios';
import { api } from '@/api/client';
export type ResourceKey = 'chat_history' | 'notebooks' | 'knowledge' | 'question_bank' | 'partners' | 'personas' | 'skills' | 'mcp' | 'cli_apps' | 'agents';
export type Count = { status: 'loading' } | { status: 'ready'; value: number } | { status: 'error'; error: string };
const invalid = () => new Error('Invalid resource data received from the server.');
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
  return value as Record<string, unknown>;
}
function array(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw invalid();
  return value.map(object);
}
export function countError(cause: unknown) {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (cause.response?.status === 403) return 'This page is not available for your account.';
    const detail = cause.response?.data?.detail;
    return typeof detail === 'string' ? detail : 'Failed to load resource counts';
  }
  return cause instanceof Error ? cause.message : 'Failed to load resource counts';
}
export const libraryCountKeys: ResourceKey[] = ['chat_history', 'notebooks', 'knowledge', 'question_bank'];
export const accountCountKeys: ResourceKey[] = ['partners', 'personas', 'skills', 'mcp', 'cli_apps', 'agents'];
export async function readCount(key: ResourceKey, workspace: string, signal?: AbortSignal): Promise<number> {
  const get = async (path: string, scoped = false, extra = {}) => (await api.get<unknown>(path, { params: { ...(scoped ? { dt_workspace: workspace } : {}), ...extra }, signal })).data;
  if (key === 'chat_history') {
    const seen = new Set<string>(); let count = 0;
    for (let offset = 0; ; offset += 200) {
      if (signal?.aborted) throw new Error('cancelled');
      const page = array(object(await get('/sessions', true, { limit: 200, offset })).sessions);
      if (page.length > 200) throw invalid();
      let added = 0;
      for (const row of page) {
        if (typeof row.session_id !== 'string' || !row.session_id || (row.content_workspace_id !== undefined && row.content_workspace_id !== workspace)) throw invalid();
        if (seen.has(row.session_id)) continue;
        seen.add(row.session_id); added++;
        const preferences = row.preferences == null ? {} : object(row.preferences);
        if (!preferences.archived && !preferences.parent_session_id) count++;
      }
      if (page.length < 200) return count;
      if (!added) throw invalid();
    }
  }
  if (key === 'question_bank') {
    const total = object(await get('/question-notebook/entries', true, { limit: 1 })).total;
    if (!Number.isSafeInteger(total) || Number(total) < 0) throw invalid();
    return Number(total);
  }
  if (key === 'knowledge') {
    const data = await get('/knowledge-bases/list', true);
    return array(Array.isArray(data) ? data : object(data).knowledge_bases).length;
  }
  if (key === 'notebooks') return array(object(await get('/notebooks', true)).notebooks).length;
  if (key === 'partners') return array(object(await get('/partners/navigation')).partners).length;
  if (key === 'personas') return array(object(await get('/personas')).personas).length;
  if (key === 'skills') return array(object(await get('/skills/list')).skills).length;
  if (key === 'agents') return array(object(await get('/subagents/connections')).connections).length;
  if (key === 'mcp') return Object.keys(object(object(await get('/space/mcp/servers')).servers)).length;
  return array(object(await get('/space/cli-apps/apps')).apps).filter(row => row.granted === true && row.enabled === true).length;
}
