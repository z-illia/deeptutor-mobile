import { useEffect } from 'react';
import { View } from 'react-native';
import { useCopy } from '@/features/entry/copy';
import { Button } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { ListRow } from '@/shared/ui/ListRow';
import { useWorkspaces } from './WorkspaceProvider';

export function WorkspaceList({ open = true, currentId, onSelected }: { open?: boolean; currentId?: string; onSelected: (id: string) => void }) {
  const state = useWorkspaces();
  const t = useCopy();
  const { refresh } = state;
  useEffect(() => { if (open) void refresh(); }, [open, refresh]);
  const select = async (id: string) => { if (await state.selectWorkspace(id)) onSelected(id); };
  return <View style={{ gap: 12 }}>
    {(state.loading || state.switching) && <LoadingState />}
    {!!state.error && <InlineAlert tone="danger">{t(state.error)}</InlineAlert>}
    {!!state.storageError && <InlineAlert tone="danger">{t(state.storageError)}</InlineAlert>}
    {state.unavailable && <InlineAlert tone="warning">{t('This workspace is unavailable. Choose another workspace.')}</InlineAlert>}
    <Button variant="secondary" disabled={state.loading || state.switching} onPress={() => void refresh()}>{t('Refresh')}</Button>
    <ListRow title={t('General workspace')} selected={(currentId ?? state.selectedWorkspaceId) === ''} disabled={state.switching} onPress={() => void select('')} />
    {state.workspaces.map(item => <ListRow key={item.workspace_id} title={item.display_name} selected={(currentId ?? state.selectedWorkspaceId) === item.workspace_id} disabled={state.switching || state.loading || !!state.error} onPress={() => void select(item.workspace_id)} />)}
  </View>;
}
