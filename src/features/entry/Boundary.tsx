import { Redirect, router, usePathname, useGlobalSearchParams } from 'expo-router';
import { View } from 'react-native';
import type { PropsWithChildren } from 'react';
import { Button } from '@/shared/ui/Controls';
import { ErrorState, LoadingState } from '@/shared/ui/Feedback';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { useFixtures } from './FixtureProvider';
import { useCopy } from './copy';
export function BackButton() { const t = useCopy(); return <Button variant="ghost" onPress={() => router.canGoBack() ? router.back() : router.replace('/chat')}>{t('Back')}</Button>; }
export function EntryBoundary({ children }: PropsWithChildren) {
  const auth = useAuth();
  const workspace = useWorkspaces();
  const f = useFixtures(); const path = usePathname(); const t = useCopy();
  const params = useGlobalSearchParams();
  const query = new URLSearchParams(Object.entries(params).flatMap(([key, value]) => (Array.isArray(value) ? value : value === undefined ? [] : [value]).map(item => [key, String(item)])));
  const returnPath = path.startsWith('/learning') && query.size ? `${path}?${query}` : path;
  if (auth.loading) return <LoadingState label={t('Loading…')} />;
  if (auth.error) return <ErrorState message={t(auth.error)} onRetry={() => void auth.refresh()} />;
  if (auth.session?.status.enabled && !auth.session.status.authenticated) return <Redirect href={{ pathname: '/login', params: { next: returnPath } }} />;
  if (!workspace.ready) return <LoadingState label={t('Loading…')} />;
  if (f.mode === 'loading') return <LoadingState label={t('Loading…')} />;
  if (f.mode === 'unavailable') return <View style={{ padding: 24 }}><ErrorState message={t('Failed to load profile')} onRetry={() => f.resetMode('signed-out')} /></View>;
  if (['signed-out', 'first-user', 'closed'].includes(f.mode)) return <Redirect href={{ pathname: f.mode === 'first-user' ? '/register' : '/login', params: { next: returnPath } }} />;
  return children;
}
