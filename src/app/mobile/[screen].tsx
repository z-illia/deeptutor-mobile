import { Redirect, useLocalSearchParams } from 'expo-router';
import { EntryBoundary } from '@/features/entry/Boundary';
import { WorkspaceScreen } from '@/features/workspaces/WorkspaceScreen';
import { MobileScreen } from '@/features/mobile/MobileScreen';

export default function MobileRoute() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  if (Number(screen) === 62) return <EntryBoundary><WorkspaceScreen /></EntryBoundary>;
  if (Number(screen) === 58) return <EntryBoundary><Redirect href="/learning/live?view=progress" /></EntryBoundary>;
  if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 126, 127, 131, 132, 133, 134, 135, 136, 137, 153, 154].includes(Number(screen))) return <EntryBoundary><Redirect href={Number(screen) === 2 ? '/learning/new' : Number(screen) === 9 ? '/learning/books' : [10, 11].includes(Number(screen)) ? '/learning/reading' : '/learning'} /></EntryBoundary>;
  if ([12, 13, 14, 24, 25].includes(Number(screen))) return <EntryBoundary><Redirect href="/chat" /></EntryBoundary>;
  if (Number(screen) === 27) return <EntryBoundary><Redirect href="/space/chat-history" /></EntryBoundary>;
  return <EntryBoundary><MobileScreen key={screen} number={Number(screen)} /></EntryBoundary>;
}
