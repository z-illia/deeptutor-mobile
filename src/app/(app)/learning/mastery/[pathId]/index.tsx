import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { BackButton } from '@/features/entry/Boundary';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { MasteryDetailScreen } from '@/features/learning/MasteryDetailScreen';
import { InlineAlert } from '@/shared/ui/Feedback';

export default function MasteryDetailRoute() {
  const f = useFixtures();
  const t = useCopy();
  const params = useLocalSearchParams<{ pathId?: string }>();
  const pathId = params.pathId ? decodeURIComponent(params.pathId) : '';
  if (!allowedDestination(f.mode, `/learning/mastery/${pathId}`)) {
    return (
      <View style={{ padding: 24, gap: 16 }}>
        <InlineAlert tone="warning">{t('Unavailable')}</InlineAlert>
        <BackButton />
      </View>
    );
  }
  return <MasteryDetailScreen pathId={pathId} />;
}
