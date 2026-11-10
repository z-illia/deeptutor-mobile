import { MobileAction, MobilePage } from '@/features/mobile/ScreenLayout';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { DataDetails, isRecord, useRemoteData } from './RemoteSettingsScreen';
import { ServerForm } from './ServerForm';
import { useCopy } from '@/features/entry/copy';

const specs: Record<number, { title: string; path: string }> = {
  98: { title: 'Video learning', path: '/settings/video-learning' },
  99: { title: 'Agents', path: '/subagents/settings' },
  102: { title: 'Memory processing', path: '/memory/settings' },
  103: { title: 'Capabilities', path: '/capabilities/settings' },
};
export function ConfigurationScreen({ number }: { number: number }) {
  const spec = specs[number]; const remote = useRemoteData(spec.path); const t = useCopy();
  return <MobilePage title={t(spec.title)}>
    {remote.loading && <LoadingState />}
    {!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {isRecord(remote.data) && <ServerForm key={JSON.stringify(remote.data)} initial={remote.data} path={spec.path} />}
    {remote.data != null && !isRecord(remote.data) && <DataDetails value={remote.data} />}
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
