import { View } from 'react-native';
import { BackButton } from '@/features/entry/Boundary';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { TopicAtlasScreen } from '@/features/learning/TopicAtlasScreen';
import { InlineAlert } from '@/shared/ui/Feedback';

export default function MasteryLibraryRoute() {
  const f = useFixtures();
  const t = useCopy();
  if (!allowedDestination(f.mode, '/learning/mastery')) {
    return (
      <View style={{ padding: 24, gap: 16 }}>
        <InlineAlert tone="warning">{t('Unavailable')}</InlineAlert>
        <BackButton />
      </View>
    );
  }
  return <TopicAtlasScreen />;
}
