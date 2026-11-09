import { api } from '@/api/client';

export type Source = { id: string; kind: string; source_id: string; label: string; available: boolean };
export type Point = { id: string; name: string; status: string; mastery: number; type: string };
export type Module = { id: string; name: string; objective: string; mastered: number; total: number; knowledge_points: Point[] };
export type Topic = {
  path_id: string; name: string; content_workspace_id?: string;
  metadata: { goal: string; description: string; emoji: string };
  sources: Source[]; session_count: number; updated_at: number;
  map: { counts: { mastered: number; total: number }; modules: Module[]; complete: boolean; due_reviews: number };
  next: { action: string; knowledge_point_id: string; knowledge_point_name: string; session_id: string; reason: string };
  reviews: { id: string; knowledge_point_name: string; due: boolean; reason: string }[];
  review_settings?: { desired_retention: number; strategy?: { template_id: string; name: string } | null };
  learner_profile: { prior_knowledge: string; target_level: string; time_budget: string; preferences: string; notes: string } | null;
};
export type StudySession = { session_id: string; title: string; message_count: number; last_message: string; status: string; updated_at: number };
export type Book = { id: string; title: string; description: string; status: string; chapter_count: number; page_count: number; revision: number; proposal?: { title: string; description?: string; chapters?: { title: string }[] } | null; can_edit?: boolean; reading?: { current_page_id: string; percent: number; visited_pages: number; total_pages: number } };
export type Page = { id: string; title: string; status: string; order: number; blocks: { id: string; type: string; title: string; status: string; payload: Record<string, unknown>; error: string }[] };
export type Material = { material_id: string; title: string; filename: string; status: string; progress: number; render_mode: string; error_detail?: string };
export type MaterialDetail = { material_id: string; title: string; unit_count: number; revision?: number; outline: { locator: number; title: string }[] };
export type PracticeQuestion = { entry: { id: number; question: string; question_type: string; correct_answer: string; options?: Record<string, string> }; state: { version: number; review_count: number }; content_workspace_id?: string };
export const scoped = (path: string, workspace: string) => `${path}${path.includes('?') ? '&' : '?'}dt_workspace=${encodeURIComponent(workspace)}`;
export async function get<T>(path: string, workspace: string, signal?: AbortSignal): Promise<T> {
  const { data } = await api.get<T>(scoped(path, workspace), { signal });
  if (data === null || typeof data !== 'object') throw new Error('Invalid learning data received from the server.');
  return data;
}
export async function mutate<T>(method: 'post' | 'put' | 'patch' | 'delete', path: string, workspace: string, body?: unknown): Promise<T> {
  return (await api.request<T>({ method, url: scoped(path, workspace), data: body })).data;
}
export const topicPath = (id: string) => `/mastery-paths/topics/${encodeURIComponent(id)}`;
export const progressPath = (id: string) => `/mastery-paths/progress/${encodeURIComponent(id)}`;
export async function listTopics(workspace: string, signal?: AbortSignal) {
  const data = await get<{ topics: Topic[] }>('/mastery-paths/topics', workspace, signal);
  if (!Array.isArray(data.topics)) throw new Error('Invalid topic list received from the server.');
  return data.topics;
}

/** Books use a separate, non-v2 protocol; the tutoring socket cannot carry these commands. */
export async function bookOperation<T extends { type: string; [key: string]: unknown }>(workspace: string, message: { type: string; [key: string]: unknown }, resultType: string, signal: AbortSignal) {
  const { runBookSocketOperation } = await import('./book-operation');
  const { websocketUrl } = await import('@/features/chat/live/protocol');
  return runBookSocketOperation<T>(() => {
    const socket = new WebSocket(`${websocketUrl(String(api.defaults.baseURL)).replace(/\/ws$/, '/ws/books')}?dt_workspace=${encodeURIComponent(workspace)}`);
    if (signal.aborted) socket.close();
    else signal.addEventListener('abort', () => socket.close(), { once: true });
    return socket;
  }, { message, resultType });
}

/** Text-bearing book blocks use the same fields as the backend Markdown exporter. */
export function bookBlockContent(payload: Record<string, unknown>): string {
  for (const key of ['body', 'markdown', 'content', 'text']) if (typeof payload[key] === 'string') return payload[key] as string;
  if (typeof payload.code === 'string') return `\`\`\`${typeof payload.language === 'string' ? payload.language : ''}\n${payload.code}\n\`\`\`${typeof payload.explanation === 'string' ? `\n\n${payload.explanation}` : ''}`;
  const parts: string[] = [];
  if (typeof payload.intro === 'string') parts.push(payload.intro);
  if (Array.isArray(payload.subsections)) for (const section of payload.subsections) {
    if (!section || typeof section !== 'object') continue;
    if (typeof section.heading === 'string') parts.push(`### ${section.heading}`);
    if (typeof section.body === 'string') parts.push(section.body);
  }
  if (typeof payload.key_takeaway === 'string') parts.push(payload.key_takeaway);
  return parts.join('\n\n');
}
