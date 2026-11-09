import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useWorkspaces } from './WorkspaceProvider';
import { useCopy } from '@/features/entry/copy';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { MobileAction, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';

export function MobileWorkspaceScreen() {
  const state = useWorkspaces(); const t = useCopy();
  const [selected, setSelected] = useState(state.selectedWorkspaceId);
  const { refresh } = state;
  useEffect(() => { void refresh(); }, [refresh]);
  const disabled = state.loading || state.switching;
  const exists = selected === '' || state.workspaces.some(item => item.workspace_id === selected);
  return <MobilePage title={t('Switch workspace')} fallback="/mobile/61">
    <MobileText muted>{t('Choose a workspace')}</MobileText>
    {state.loading && <LoadingState />}
    {!!state.error && <InlineAlert tone="danger">{t(state.error)}</InlineAlert>}
    {!!state.storageError && <InlineAlert tone="danger">{t(state.storageError)}</InlineAlert>}
    {(state.unavailable || !exists) && <InlineAlert tone="warning">{t('This workspace is unavailable. Choose another workspace.')}</InlineAlert>}
    <MobileAction variant="secondary" disabled={disabled} onPress={() => void refresh()}>{t('Refresh')}</MobileAction>
    <MobileRow title={t('General workspace')} selected={selected === ''} disabled={disabled} onPress={() => setSelected('')} />
    {state.workspaces.map(item => <MobileRow key={item.workspace_id} title={item.display_name} selected={selected === item.workspace_id} disabled={disabled || !!state.error} onPress={() => setSelected(item.workspace_id)} />)}
    <MobileRow title={t('Manage workspaces')} onPress={() => router.push('/mobile/84')} />
    <MobileAction disabled={disabled || !exists || !!state.error} loading={state.switching} onPress={() => { void state.selectWorkspace(selected).then(ok => { if (ok) router.replace('/learning'); }); }}>{t('Use selected workspace')}</MobileAction>
  </MobilePage>;
}
