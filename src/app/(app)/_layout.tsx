import { Stack, usePathname } from 'expo-router';
import { AppShell } from '@/features/shell/AppShell';
import { EntryBoundary } from '@/features/entry/Boundary';

export default function AppLayout() {
  const path = usePathname();
  const mobileChat = path === '/learning' || path.startsWith('/learning/') || path === '/chat' || path.startsWith('/chat/') || path === '/space/chat-history' || path === '/profile' || path.startsWith('/profile/');
  const screens = <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
  return <EntryBoundary>{mobileChat ? screens : <AppShell>{screens}</AppShell>}</EntryBoundary>;
}
