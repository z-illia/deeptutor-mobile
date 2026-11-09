import { usePathname, Redirect } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { EmptyState, InlineAlert } from '@/shared/ui/Feedback';
import { BackButton } from '@/features/entry/Boundary';
import { knownDestination } from '@/features/search/repository';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { useCopy } from '@/features/entry/copy';
// M1's observed Retry frame at source destinations owned by later milestones.
// This route is a handoff boundary, not a completed feature screen.
export default function DestinationBoundary() {
  const path = usePathname(); const f = useFixtures(); const t = useCopy();
  if (path === '/settings/overview') return <Redirect href="/mobile/81" />;
  if (path === '/space/questions') return <Redirect href="/mobile/33" />;
  if (path === '/space/journal') return <Redirect href="/mobile/39" />;
  if (!allowedDestination(f.mode, path)) return <View style={{ padding: 24, gap: 16 }}><InlineAlert tone="warning">{t('Unavailable')}</InlineAlert><BackButton /></View>;
  if (path === '/co-writer') return <Redirect href="/mobile/28" />;
  if (path === '/calendar') return <Redirect href="/mobile/53" />;
  if (path === '/kanban') return <Redirect href="/mobile/56" />;
  if (path === '/memory') return <Redirect href="/mobile/78" />;
  if (!knownDestination(path)) return <EmptyState title={t('Unavailable')} action={<BackButton />} />;
  return <View style={{ flex: 1, paddingHorizontal: 8, alignItems: 'flex-start' }}><Button variant="ghost" loading={f.busy === 'retry'} onPress={() => void f.run('retry', () => {})}>{t('Retry')}</Button>{__DEV__ && <DText role="caption" muted>{t("Source destination ·")}{path} {t("· implementation belongs to a later milestone")}</DText>}</View>;
}
