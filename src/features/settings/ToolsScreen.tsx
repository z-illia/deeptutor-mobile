import { useRef, useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { writeRemote } from './api';
import { MobileAction, MobilePage, MobileRow } from '@/features/mobile/ScreenLayout';
import { Toggle } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { conversationError } from '@/features/chat/live/repository';
import { DataDetails, isRecord, useRemoteData } from './RemoteSettingsScreen';
import { useCopy } from '@/features/entry/copy';

export function ToolsScreen({ details = false }: { details?: boolean }) {
  const { tool } = useLocalSearchParams<{ tool?: string }>(); const remote = useRemoteData('/tools'); const t = useCopy();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const lock = useRef(false);
  const rows = isRecord(remote.data) && Array.isArray(remote.data.tools) ? remote.data.tools.filter(isRecord) : [];
  const enabled = isRecord(remote.data) && Array.isArray(remote.data.enabled_optional_tools) ? remote.data.enabled_optional_tools.filter((item): item is string => typeof item === 'string') : [];
  const toggle = async (name: string, checked: boolean) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await writeRemote('/settings/enabled-tools', 'put', { enabled_tools: checked ? [...new Set([...enabled, name])] : enabled.filter(item => item !== name) }); remote.refresh(); }
    catch (cause) { setError(conversationError(cause)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <MobilePage title={t(details ? 'Tool details' : 'Tools')}>
    {remote.loading && <LoadingState />}{!!(remote.error || error) && <InlineAlert tone="danger">{t(remote.error || error)}</InlineAlert>}
    {rows.filter(row => !details || row.name === tool).map(row => <DataTool key={String(row.name)} row={row} details={details} disabled={busy || remote.loading} onToggle={next => void toggle(String(row.name), next)} />)}
    {details && !remote.loading && !remote.error && !rows.some(row => row.name === tool) && <InlineAlert tone="danger">{t('Choose a tool from the directory.')}</InlineAlert>}
    <MobileAction variant="secondary" disabled={busy} onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
function DataTool({ row, details, disabled, onToggle }: { row: Record<string, unknown>; details: boolean; disabled: boolean; onToggle: (next: boolean) => void }) {
  return <><MobileRow title={String(row.name)} description={String(row.description ?? '')} onPress={() => router.push(`/settings/tools/detail?tool=${encodeURIComponent(String(row.name))}` as Href)} />
    {row.toggleable === true && <Toggle label={String(row.name)} value={row.enabled === true} onChange={onToggle} disabled={disabled || row.coming_soon === true} />}
    {details && <DataDetails value={row} />}</>;
}
