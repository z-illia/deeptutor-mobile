import { ResourceHubScreen } from '@/features/resources/ResourceHubScreen';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { EntryBoundary } from '@/features/entry/Boundary';
import { MobileWorkspaceScreen } from '@/features/workspaces/MobileWorkspaceScreen';
import { MobileSettingsScreen } from '@/features/settings/MobileSettingsScreen';
import { MobileFavoritesScreen } from '@/features/favorites/MobileFavoritesScreen';
import { MobileConversationLibrary } from '@/features/chat/MobileConversationLibrary';
import { ProfileScreen } from '@/features/entry/ProfileScreen';
import { MobileScreen } from '@/features/mobile/MobileScreen';

export default function MobileRoute() {
  const { screen, notebookId, recordId } = useLocalSearchParams<{ screen: string; notebookId?: string; recordId?: string }>();
  if ([26, 65].includes(Number(screen))) return <EntryBoundary><ResourceHubScreen key={screen} personalization={Number(screen) === 65} /></EntryBoundary>;
  if ([82, 83].includes(Number(screen))) return <EntryBoundary><MobileSettingsScreen key={screen} appearance={Number(screen) === 83} /></EntryBoundary>;
  if ([31, 32].includes(Number(screen))) return <EntryBoundary><MobileFavoritesScreen key={`${screen}:${notebookId ?? ''}:${recordId ?? ''}`} create={Number(screen) === 32} /></EntryBoundary>;
  if ([63, 64, 138].includes(Number(screen))) return <EntryBoundary><ProfileScreen key={screen} view={Number(screen) === 64 ? 'password' : Number(screen) === 138 ? 'avatar' : 'profile'} /></EntryBoundary>;
  if (Number(screen) === 62) return <EntryBoundary><MobileWorkspaceScreen /></EntryBoundary>;
  if (Number(screen) === 58) return <EntryBoundary><Redirect href="/learning/live?view=progress" /></EntryBoundary>;
  if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 126, 127, 131, 132, 133, 134, 135, 136, 137, 153, 154].includes(Number(screen))) return <EntryBoundary><Redirect href={Number(screen) === 2 ? '/learning/new' : Number(screen) === 9 ? '/learning/books' : [10, 11].includes(Number(screen)) ? '/learning/reading' : '/learning'} /></EntryBoundary>;
  if ([12, 13, 14, 24, 25].includes(Number(screen))) return <EntryBoundary><Redirect href="/chat" /></EntryBoundary>;
  if ([27, 108].includes(Number(screen))) return <EntryBoundary><MobileConversationLibrary key={screen} archive={Number(screen) === 108} /></EntryBoundary>;
  return <EntryBoundary><MobileScreen key={screen} number={Number(screen)} /></EntryBoundary>;
}
