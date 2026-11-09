import { ResourceHubScreen } from '@/features/resources/ResourceHubScreen';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { EntryBoundary } from '@/features/entry/Boundary';
import { MobileWorkspaceScreen } from '@/features/workspaces/MobileWorkspaceScreen';
import { MobileSettingsScreen } from '@/features/settings/MobileSettingsScreen';
import { MobileFavoritesScreen } from '@/features/favorites/MobileFavoritesScreen';
import { MobileConversationLibrary } from '@/features/chat/MobileConversationLibrary';
import { ProfileScreen } from '@/features/entry/ProfileScreen';
import { MobileScreen } from '@/features/mobile/MobileScreen';
import {
  ImportConversationsScreen,
  MemoryEvidenceScreen,
  MemoryOverviewScreen,
  MemoryWorkbenchScreen,
} from '@/features/memory/MobileMemoryScreens';
import { EditNoteScreen, NotebookListScreen, ReviewNoteEditScreen } from '@/features/notes/MobileNotebookScreens';
import { CalendarScreen, PlanOverviewScreen, TaskAppearanceScreen, TaskBoardScreen, TaskDetailsScreen } from '@/features/plan/MobilePlanScreens';
import { ImportQuestionsScreen, LearningJournalScreen, ManageTagsScreen, PracticeQuestionScreen, QuestionBankScreen } from '@/features/questions/MobileLibraryScreens';

export default function MobileRoute() {
  const { screen, notebookId, recordId, docId, taskId } = useLocalSearchParams<{ screen: string; notebookId?: string; recordId?: string; docId?: string; taskId?: string }>();
  const num = Number(screen);
  if ([26, 65].includes(num)) return <EntryBoundary><ResourceHubScreen key={screen} personalization={num === 65} /></EntryBoundary>;
  if ([82, 83].includes(num)) return <EntryBoundary><MobileSettingsScreen key={screen} appearance={num === 83} /></EntryBoundary>;
  if (num === 28) return <EntryBoundary><NotebookListScreen /></EntryBoundary>;
  if ([21, 29].includes(num)) return <EntryBoundary><EditNoteScreen key={`${screen}:${docId ?? ''}`} conversationNote={num === 21} /></EntryBoundary>;
  if (num === 30) return <EntryBoundary><ReviewNoteEditScreen /></EntryBoundary>;
  if ([31, 32].includes(num)) return <EntryBoundary><MobileFavoritesScreen key={`${screen}:${notebookId ?? ''}:${recordId ?? ''}`} create={num === 32} /></EntryBoundary>;
  if ([33, 34].includes(num)) return <EntryBoundary><QuestionBankScreen key={screen} mistakes={num === 34} /></EntryBoundary>;
  if ([35, 36, 115].includes(num)) return <EntryBoundary><ImportQuestionsScreen key={screen} step={num as 35 | 36 | 115} /></EntryBoundary>;
  if ([37, 38].includes(num)) return <EntryBoundary><PracticeQuestionScreen key={screen} review={num === 38} /></EntryBoundary>;
  if (num === 39) return <EntryBoundary><LearningJournalScreen /></EntryBoundary>;
  if (num === 130) return <EntryBoundary><ManageTagsScreen /></EntryBoundary>;
  if (num === 52) return <EntryBoundary><PlanOverviewScreen /></EntryBoundary>;
  if ([53, 54, 55].includes(num)) return <EntryBoundary><CalendarScreen key={screen} view={num === 53 ? 'month' : num === 54 ? 'day' : 'week'} /></EntryBoundary>;
  if (num === 56) return <EntryBoundary><TaskBoardScreen /></EntryBoundary>;
  if (num === 57) return <EntryBoundary><TaskDetailsScreen key={`${screen}:${taskId ?? ''}`} /></EntryBoundary>;
  if (num === 129) return <EntryBoundary><TaskAppearanceScreen /></EntryBoundary>;
  if (num === 78) return <EntryBoundary><MemoryOverviewScreen /></EntryBoundary>;
  if (num === 79) return <EntryBoundary><MemoryWorkbenchScreen /></EntryBoundary>;
  if (num === 80) return <EntryBoundary><MemoryEvidenceScreen /></EntryBoundary>;
  if (num === 123) return <EntryBoundary><ImportConversationsScreen /></EntryBoundary>;
  if ([63, 64, 138].includes(num)) return <EntryBoundary><ProfileScreen key={screen} view={num === 64 ? 'password' : num === 138 ? 'avatar' : 'profile'} /></EntryBoundary>;
  if (num === 62) return <EntryBoundary><MobileWorkspaceScreen /></EntryBoundary>;
  if (num === 58) return <EntryBoundary><Redirect href="/learning/live?view=progress" /></EntryBoundary>;
  if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 126, 127, 131, 132, 133, 134, 135, 136, 137, 153, 154].includes(num)) return <EntryBoundary><Redirect href={num === 2 ? '/learning/new' : num === 9 ? '/learning/books' : [10, 11].includes(num) ? '/learning/reading' : '/learning'} /></EntryBoundary>;
  if ([12, 13, 14, 24, 25].includes(num)) return <EntryBoundary><Redirect href="/chat" /></EntryBoundary>;
  if ([27, 108].includes(num)) return <EntryBoundary><MobileConversationLibrary key={screen} archive={num === 108} /></EntryBoundary>;
  return <EntryBoundary><MobileScreen key={screen} number={num} /></EntryBoundary>;
}
