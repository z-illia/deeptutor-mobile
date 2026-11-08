import { Stack, usePathname } from 'expo-router';
import { AppShell } from '@/features/shell/AppShell';
import { EntryBoundary } from '@/features/entry/Boundary';

export default function AppLayout() {
  const path = usePathname();
  const mobileChat = path === '/chat' || path.startsWith('/chat/') || path === '/space/chat-history';
  const screens = <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
  return <EntryBoundary>{mobileChat ? screens : <AppShell>{screens}</AppShell>}</EntryBoundary>;
}
