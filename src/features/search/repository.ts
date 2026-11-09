import { shellRepository } from '../shell/fixtures';
import { resourceRoutes } from '../resources/repository';
import type { WorkspaceId } from '../entry/model';
export type SearchRecord = { id: string; label: string; kind: 'page' | 'session' | 'learning' | 'partner' | 'group'; href: string; workspace?: WorkspaceId; detail?: string };
export const records: readonly SearchRecord[] = [
  ...shellRepository.items.map((item): SearchRecord => ({ id: `page:${item.key}`, label: item.label, kind: 'page', href: item.route })),
  { id: 'new-chat', label: 'navigation.newChat', kind: 'page', href: '/chat' }, { id: 'settings', label: 'Settings', kind: 'page', href: '/mobile/81' },
];
export function searchRecords(query: string, workspace: WorkspaceId, allowed: (href: string) => boolean, translate: (text: string) => string = (text) => text) {
  const q = query.trim().toLocaleLowerCase();
  return records.filter((record) => (!record.workspace || record.workspace === workspace) && allowed(record.href) && (q ? `${translate(record.label)} ${record.kind}`.toLocaleLowerCase().includes(q) : record.kind === 'page' || record.kind === 'session')).filter((record, i, list) => list.findIndex((other) => other.href === record.href) === i);
}
export function knownDestination(path: string) { return /^\/partners\/(?:groups\/)?[^/]+$/.test(path) || [...resourceRoutes, ...records.map((r) => r.href), '/session-handoff', '/admin/users', '/settings/workspace', '/settings/connections', '/settings/llm', '/settings/status'].includes(path); }
