import { isScreenPath } from '@/features/navigation/paths';
import { Stack, usePathname } from 'expo-router';
import { AppShell } from '@/features/shell/AppShell';
import { EntryBoundary } from '@/features/entry/Boundary';

export default function AppLayout() {
  const path = usePathname();
  const mobileScreen = isScreenPath(path) || path === '/learning' || path.startsWith('/learning/')
    || path === '/chat' || path.startsWith('/chat/')
    || path === '/profile' || path.startsWith('/profile/')
    || path.startsWith('/notebooks/')
    || ['/space/chat-history', '/personalization', '/settings', '/settings/overview', '/settings/general', '/settings/appearance', '/settings/archive', '/notebooks'].includes(path);
  const screens = <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
  return <EntryBoundary>{mobileScreen ? screens : <AppShell>{screens}</AppShell>}</EntryBoundary>;
}
