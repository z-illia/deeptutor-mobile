import { usePathname, useLocalSearchParams, Redirect, type Href } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { EmptyState, InlineAlert } from '@/shared/ui/Feedback';
import { BackButton } from '@/features/entry/Boundary';
import { knownDestination } from '@/features/search/repository';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { useCopy } from '@/features/entry/copy';
const mobileAliases: Record<string, Href> = {
  '/partners': '/mobile/66',
  '/agents': '/mobile/77',
  '/space/personas': '/mobile/73',
  '/space/skills': '/mobile/73',
  '/space/mcp': '/mobile/76',
  '/space/cli-apps': '/mobile/99',
  '/whisper': '/mobile/95',
  '/session-handoff': '/mobile/139',
  '/admin/users': '/mobile/109',
  '/settings/workspace': '/mobile/84',
  '/settings/connections': '/mobile/89',
  '/settings/llm': '/mobile/91',
  '/settings/status': '/mobile/106',
};
export default function DestinationBoundary() {
  const path = usePathname(); const { destination } = useLocalSearchParams<{ destination: string[] }>(); const f = useFixtures(); const t = useCopy();
  if (path === '/settings/overview') return <Redirect href="/mobile/81" />;
  if (path === '/space/questions') return <Redirect href="/mobile/33" />;
  if (path === '/space/journal') return <Redirect href="/mobile/39" />;
  if (!allowedDestination(f.mode, path)) return <View style={{ padding: 24, gap: 16 }}><InlineAlert tone="warning">{t('Unavailable')}</InlineAlert><BackButton /></View>;
  if (mobileAliases[path]) return <Redirect href={mobileAliases[path]} />;
  if (/^\/partners\/groups\/[^/]+$/.test(path)) return <Redirect href={{ pathname: '/mobile/[screen]', params: { screen: '72', groupId: destination[2] } }} />;
  if (/^\/partners\/[^/]+$/.test(path)) return <Redirect href={{ pathname: '/mobile/[screen]', params: { screen: '67', partnerId: destination[1] } }} />;
  if (path === '/co-writer') return <Redirect href="/mobile/28" />;
  if (path === '/knowledge-bases') return <Redirect href="/mobile/40" />;
  if (path === '/calendar') return <Redirect href="/mobile/53" />;
  if (path === '/kanban') return <Redirect href="/mobile/56" />;
  if (path === '/memory') return <Redirect href="/mobile/78" />;
  if (!knownDestination(path)) return <EmptyState title={t('Unavailable')} action={<BackButton />} />;
  return <View style={{ flex: 1, paddingHorizontal: 8, alignItems: 'flex-start' }}><Button variant="ghost" loading={f.busy === 'retry'} onPress={() => void f.run('retry', () => {})}>{t('Retry')}</Button>{__DEV__ && <DText role="caption" muted>{t("Source destination ·")}{path} {t("· implementation belongs to a later milestone")}</DText>}</View>;
}
