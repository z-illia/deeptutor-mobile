import { Fragment, type PropsWithChildren } from 'react';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { EntryBoundary, BackButton } from '@/features/entry/Boundary';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { useCopy } from '@/features/entry/copy';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { InlineAlert } from '@/shared/ui/Feedback';

export function ScreenRoute({ children }: PropsWithChildren) {
  const auth = useAuth();
  const scope = useWorkspaces();
  const params = useLocalSearchParams();
  const path = usePathname();
  const fixtures = useFixtures();
  const t = useCopy();
  const key = JSON.stringify([auth.serverUrl, auth.session?.profile?.id, scope.selectedWorkspaceId, path, params]);
  return <EntryBoundary>{allowedDestination(fixtures.mode, path)
    ? <Fragment key={key}>{children}</Fragment>
    : <View style={{ padding: 24, gap: 16 }}><InlineAlert tone="warning">{t('Unavailable')}</InlineAlert><BackButton /></View>}</EntryBoundary>;
}
