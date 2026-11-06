import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { BackButton } from '@/features/entry/Boundary';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { MasteryStudyScreen } from '@/features/learning/MasteryStudyScreen';
import { InlineAlert } from '@/shared/ui/Feedback';

export default function MasterySessionsIndexRoute() {
  const f = useFixtures();
  const t = useCopy();
  const params = useLocalSearchParams<{
    pathId?: string;
    mode?: string;
    focus?: string;
    sessionId?: string;
  }>();
  const pathId = params.pathId ? decodeURIComponent(params.pathId) : '';
  if (!allowedDestination(f.mode, `/learning/mastery/${pathId}/sessions`)) {
    return (
      <View style={{ padding: 24, gap: 16 }}>
        <InlineAlert tone="warning">{t('Unavailable')}</InlineAlert>
        <BackButton />
      </View>
    );
  }
  return (
    <MasteryStudyScreen
      pathId={pathId}
      sessionId={params.sessionId ? decodeURIComponent(params.sessionId) : null}
      queryMode={params.mode ?? null}
      queryFocus={params.focus ? decodeURIComponent(params.focus) : null}
    />
  );
}
