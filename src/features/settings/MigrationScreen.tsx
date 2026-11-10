import { useRef, useState } from 'react';
import { writeRemote } from './api';
import { MobileAction, MobileChoice, MobilePage } from '@/features/mobile/ScreenLayout';
import { Toggle } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { conversationError } from '@/features/chat/live/repository';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { DataDetails, isRecord, useRemoteData } from './RemoteSettingsScreen';
import { useCopy } from '@/features/entry/copy';

export function MigrationScreen({ bundles = false }: { bundles?: boolean }) {
  const scope = useWorkspaces(); const t = useCopy();
  const [source, setSource] = useState(scope.selectedWorkspaceId); const [target, setTarget] = useState(''); const [features, setFeatures] = useState<string[]>([]);
  const [preview, setPreview] = useState<unknown>(null); const [result, setResult] = useState<unknown>(null); const [error, setError] = useState('');
  const [busy, setBusy] = useState(false); const lock = useRef(false);
  const remote = useRemoteData(bundles ? '/settings/workspace/data/operations' : `/settings/workspace/data/discover?source_workspace_id=${encodeURIComponent(source)}`);
  const options = [{ value: '', label: t('General workspace') }, ...scope.workspaces.map(row => ({ value: row.workspace_id, label: row.display_name }))];
  const rows = isRecord(remote.data) && Array.isArray(remote.data.features) ? remote.data.features.filter(isRecord) : [];
  const invalidate = () => { setPreview(null); setResult(null); setError(''); };
  const perform = async (action: 'preview' | 'migrate' | 'export') => {
    if (lock.current) return;
    if (!features.length || (action !== 'export' && source === target)) { setError('Choose data and two different workspaces.'); return; }
    lock.current = true; setBusy(true); setError('');
    try {
      const data = await writeRemote(`/settings/workspace/data/${action}`, 'post', { source_workspace_id: source, target_workspace_id: target, features });
      if (action === 'preview') setPreview(data); else { setResult(data); setPreview(null); remote.refresh(); }
    } catch (cause) { setError(conversationError(cause)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <MobilePage title={t(bundles ? 'Migration bundles' : 'Data migration')}>
    {remote.loading && <LoadingState />}{!!(remote.error || error) && <InlineAlert tone="danger">{t(remote.error || error)}</InlineAlert>}
    {bundles ? <DataDetails value={remote.data} /> : <>
      <MobileChoice label={t('Source workspace')} value={source} options={options} disabled={busy} onChange={next => { setSource(next); setFeatures([]); invalidate(); }} />
      <MobileChoice label={t('Target workspace')} value={target} options={options} disabled={busy} onChange={next => { setTarget(next); invalidate(); }} />
      {rows.map(row => <Toggle key={String(row.feature)} label={String(row.label ?? row.feature)} value={features.includes(String(row.feature))} disabled={busy} onChange={checked => { setFeatures(old => checked ? [...old, String(row.feature)] : old.filter(item => item !== row.feature)); invalidate(); }} />)}
      <MobileAction loading={busy} disabled={!features.length || remote.loading || !!remote.error} onPress={() => void perform('preview')}>{t('Review migration')}</MobileAction>
      {preview != null && <><DataDetails value={preview} /><MobileAction variant="danger" loading={busy} onPress={() => void perform('migrate')}>{t('Confirm migration')}</MobileAction></>}
      <MobileAction variant="secondary" disabled={!features.length || busy} onPress={() => void perform('export')}>{t('Export selected data')}</MobileAction>
      {result != null && <DataDetails value={result} />}
    </>}
    <MobileAction variant="secondary" disabled={busy} onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
