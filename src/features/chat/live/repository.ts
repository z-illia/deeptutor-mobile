import { api } from '@/api/client';
import type { ChatModel, Conversation } from './protocol';

export async function listConversations(signal?: AbortSignal, offset = 0) {
  const { data } = await api.get<{ sessions: Conversation[] }>('/sessions', { params: { limit: 50, offset }, signal });
  if (!Array.isArray(data.sessions)) throw new Error('Invalid conversation list received from the server.');
  return data.sessions;
}
export async function getConversation(id: string, signal?: AbortSignal) {
  const { data } = await api.get<Conversation>(`/sessions/${encodeURIComponent(id)}`, { signal });
  if (!Array.isArray(data.messages)) throw new Error('Invalid conversation received from the server.');
  return data;
}
export async function listChatModels(signal?: AbortSignal) {
  const { data } = await api.get<{ options: ChatModel[]; active: { profile_id: string; model_id: string } | null }>('/settings/llm-options', { signal });
  if (!Array.isArray(data.options)) throw new Error('Invalid model catalog received from the server.');
  return data;
}
