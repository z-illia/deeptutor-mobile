import { router, useLocalSearchParams, type Href } from 'expo-router';
import { MobileAction, MobilePage, MobileRow } from '@/features/mobile/ScreenLayout';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { useRemoteData, isRecord } from '@/features/settings/RemoteSettingsScreen';
import { ServerForm } from '@/features/settings/ServerForm';
import { useWorkspaces } from './WorkspaceProvider';
import { useCopy } from '@/features/entry/copy';

export function ManageWorkspacesScreen({ details = false }: { details?: boolean }) {
  const { workspaceId } = useLocalSearchParams<{ workspaceId?: string }>();
  const remote = useRemoteData('/settings/workspace/registrations'); const scope = useWorkspaces(); const t = useCopy();
  const rows = isRecord(remote.data) && Array.isArray(remote.data.workspaces) ? remote.data.workspaces.filter(isRecord) : [];
  const row = rows.find(item => item.workspace_id === workspaceId);
  return <MobilePage title={t(details ? 'Workspace details' : 'Workspaces')}>
    {remote.loading && <LoadingState />}
    {!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {!details && rows.map(item => <MobileRow key={String(item.workspace_id)} title={String(item.display_name)} description={item.archived ? t('Archived') : undefined} onPress={() => router.push(`/mobile/85?workspaceId=${encodeURIComponent(String(item.workspace_id))}` as Href)} />)}
    {!details && <MobileAction onPress={() => router.push('/mobile/85')}>{t('New workspace')}</MobileAction>}
    {details && !remote.loading && !remote.error && (!workspaceId || row) && <ServerForm key={workspaceId ?? 'new'}
      initial={{ name: String(row?.display_name ?? ''), instructions: String(row?.instructions ?? ''), ...(row ? { archived: row.archived === true } : {}) }}
      path={`/settings/workspace/registrations${row ? `/${encodeURIComponent(workspaceId!)}` : ''}`} method={row ? 'patch' : 'post'}
      transform={value => { if (!String(value.name).trim()) throw new Error('Enter a workspace name.'); return value; }}
      onSaved={() => { void scope.refresh(); router.replace('/mobile/84'); }} />}
    {details && workspaceId && !remote.loading && !remote.error && !row && <InlineAlert tone="danger">{t('This workspace is unavailable.')}</InlineAlert>}
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
