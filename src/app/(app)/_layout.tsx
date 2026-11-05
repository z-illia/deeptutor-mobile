import { Stack } from 'expo-router';
import { AppShell } from '@/features/shell/AppShell';
import { EntryBoundary } from '@/features/entry/Boundary';
export default function AppLayout() { return <EntryBoundary><AppShell><Stack screenOptions={{ headerShown: false, animation: 'none' }} /></AppShell></EntryBoundary>; }
