import { usePathname, Redirect, type Href } from 'expo-router';
import { mobileHref } from '@/features/mobile/routes';
import { View } from 'react-native';
import { Button } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { EmptyState, InlineAlert } from '@/shared/ui/Feedback';
import { BackButton } from '@/features/entry/Boundary';
import { knownDestination } from '@/features/search/repository';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { useCopy } from '@/features/entry/copy';
export default function DestinationBoundary() {
  const path = usePathname(); const f = useFixtures(); const t = useCopy();
  if (!allowedDestination(f.mode, path)) return <View style={{ padding: 24, gap: 16 }}><InlineAlert tone="warning">{t('Unavailable')}</InlineAlert><BackButton /></View>;
  const destination = mobileHref(path);
  if (destination !== path) return <Redirect href={destination as Href} />;
  if (path === '/co-writer') return <Redirect href="/notes" />;
  if (!knownDestination(path)) return <EmptyState title={t('Unavailable')} action={<BackButton />} />;
  return <View style={{ flex: 1, paddingHorizontal: 8, alignItems: 'flex-start' }}><Button variant="ghost" loading={f.busy === 'retry'} onPress={() => void f.run('retry', () => {})}>{t('Retry')}</Button>{__DEV__ && <DText role="caption" muted>{t("Source destination ·")}{path} {t("· implementation belongs to a later milestone")}</DText>}</View>;
}
