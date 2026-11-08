import { Redirect, useLocalSearchParams } from 'expo-router';
import { EntryBoundary } from '@/features/entry/Boundary';
import { MobileScreen } from '@/features/mobile/MobileScreen';

export default function MobileRoute() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  if ([12, 13, 14, 24, 25].includes(Number(screen))) return <EntryBoundary><Redirect href="/chat" /></EntryBoundary>;
  if (Number(screen) === 27) return <EntryBoundary><Redirect href="/space/chat-history" /></EntryBoundary>;
  return <EntryBoundary><MobileScreen key={screen} number={Number(screen)} /></EntryBoundary>;
}
