import rows from './source-tiles.json';
import type { ResourceState, WorkspaceId } from '../entry/model';
export type Count = { status: 'ready'; value: number } | { status: 'loading' | 'error' };
export type ResourceTile = (typeof rows)[number] & { count?: Count };
const accountCounts: Record<string, number> = { agents: 2, personas: 3, skills: 4, mcp: 1, cli_apps: 2 };
export function readTiles(account: boolean, workspace: WorkspaceId, state: ResourceState, whisper: boolean): ResourceTile[] {
  return rows.filter((row) => row.account === account && (row.key !== 'whisper' || (whisper && state !== 'loading'))).map((row, i) => ({ ...row, count: !row.unit ? undefined : state === 'loading' ? { status: 'loading' } : state === 'error' && i === 0 ? { status: 'error' } : { status: 'ready', value: state === 'empty' ? 0 : row.account ? accountCounts[row.key] ?? 0 : workspace === 'fixture-ws-b' ? i + 1 : i + 3 } }));
}
export const resourceRoutes = rows.map((row) => row.href);
