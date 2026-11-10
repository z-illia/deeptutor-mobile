import { api } from '@/api/client';

export type Workspace = { workspace_id: string; display_name: string; archived: boolean; kind?: 'system' | 'general' | 'workspace' };

export const workspaceStorageKey = (server: string, userId: string) =>
  `deeptutor-workspace:${JSON.stringify([server, userId])}`;

export async function listWorkspaces(signal?: AbortSignal): Promise<Workspace[]> {
  const { data } = await api.get<{ workspaces: Workspace[] }>('/settings/workspace/registrations', { signal });
  if (!Array.isArray(data?.workspaces) || data.workspaces.some(item =>
    !item || typeof item.workspace_id !== 'string' || typeof item.display_name !== 'string' || typeof item.archived !== 'boolean')) {
    throw new Error('Invalid workspace list received from the server.');
  }
  return data.workspaces.filter((item, index, rows) => !item.archived && item.kind !== 'system' && item.kind !== 'general' && item.workspace_id !== '' &&
    rows.findIndex(other => other.workspace_id === item.workspace_id) === index);
}
