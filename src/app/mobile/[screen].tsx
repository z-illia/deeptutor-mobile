import { ConfigurationScreen } from '@/features/settings/ConfigurationScreen';
import { RemoteSettingsScreen, remoteSettings } from '@/features/settings/RemoteSettingsScreen';
import { SettingsHubScreen } from '@/features/settings/SettingsHubScreen';
import { ServicesScreen } from '@/features/settings/ServicesScreen';
import { ToolsScreen } from '@/features/settings/ToolsScreen';
import { MigrationScreen } from '@/features/settings/MigrationScreen';
import { ManageWorkspacesScreen } from '@/features/workspaces/ManageWorkspacesScreen';
import { ExtensionsScreen, McpScreen, PersonasSkillsScreen, PlaybookScreen, SubagentsScreen } from '@/features/resources/PersonalizationScreens';
import { PartnerGroupsScreen, PartnerScreen, PartnersScreen } from '@/features/resources/PartnerScreens';
import { ResourceHubScreen } from '@/features/resources/ResourceHubScreen';
import { LiveChatScreen } from '@/features/chat/live/LiveChatScreen';
import type { Panel } from '@/features/chat/live/TutorComposer';
import { AddUserScreen, AuxiliaryStateScreen, DeviceHandoffScreen, ImportUsersScreen, UsersScreen } from '@/features/settings/AccountAdminScreens';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { EntryBoundary } from '@/features/entry/Boundary';
import { MobileWorkspaceScreen } from '@/features/workspaces/MobileWorkspaceScreen';
import { MobileSettingsScreen } from '@/features/settings/MobileSettingsScreen';
import { MobileFavoritesScreen } from '@/features/favorites/MobileFavoritesScreen';
import { MobileConversationLibrary } from '@/features/chat/MobileConversationLibrary';
import { ProfileScreen } from '@/features/entry/ProfileScreen';
import {
  ImportConversationsScreen,
  MemoryEvidenceScreen,
  MemoryOverviewScreen,
  MemoryWorkbenchScreen,
} from '@/features/memory/MobileMemoryScreens';
import { EditNoteScreen, NotebookListScreen, ReviewNoteEditScreen } from '@/features/notes/MobileNotebookScreens';
import { CalendarScreen, PlanOverviewScreen, TaskAppearanceScreen, TaskBoardScreen, TaskDetailsScreen } from '@/features/plan/MobilePlanScreens';
import { ImportQuestionsScreen, LearningJournalScreen, ManageTagsScreen, PracticeQuestionScreen, QuestionBankScreen } from '@/features/questions/MobileLibraryScreens';
import {
  AddDocumentsScreen,
  AddSourceTypeScreen,
  ConnectedSourcesScreen,
  EngineConfigScreen,
  GitHubSourceScreen,
  IndexRecoveryScreen,
  KnowledgeBaseDetailScreen,
  KnowledgeBaseSettingsScreen,
  KnowledgeBasesListScreen,
  KnowledgeEnginesScreen,
  KnowledgeSourcePreviewScreen,
  LinkedFolderScreen,
  MoveKnowledgeBaseScreen,
  NewKnowledgeBaseScreen,
  ReviewDeleteKbScreen,
  WebSourceScreen,
  WebSourcesListScreen,
} from '@/features/knowledge/MobileKnowledgeScreens';

export default function MobileRoute() {
  const auth = useAuth(); const scope = useWorkspaces(); const params = useLocalSearchParams();
  return <MobileRouteContent key={JSON.stringify([auth.serverUrl, auth.session?.profile?.id, scope.selectedWorkspaceId, params])} />;
}

function MobileRouteContent() {
  const { screen, notebookId, recordId, docId, taskId, kb, file, engine } = useLocalSearchParams<{ screen: string; notebookId?: string; recordId?: string; docId?: string; taskId?: string; kb?: string; file?: string; engine?: string }>();
  const num = Number(screen);
  if ([15, 16, 17, 18, 19, 20, 23, 124, 125].includes(num)) return <EntryBoundary><LiveChatScreen chooseModel={num === 18} initialPanel={({ 15: 'More tools', 16: 'Mode', 17: 'Attachments', 19: 'Skills', 23: 'Preferences', 124: 'research', 125: 'Partners' } as Record<number, Panel>)[num]} /></EntryBoundary>;
  if ([22, 152].includes(num)) return <EntryBoundary><MobileConversationLibrary actions /></EntryBoundary>;
  if (num === 109) return <EntryBoundary><UsersScreen /></EntryBoundary>;
  if (num === 110) return <EntryBoundary><AddUserScreen /></EntryBoundary>;
  if (num === 111) return <EntryBoundary><ImportUsersScreen /></EntryBoundary>;
  if (num === 139) return <EntryBoundary><DeviceHandoffScreen /></EntryBoundary>;
  if ([113, 114, 116].includes(num)) return <EntryBoundary><AuxiliaryStateScreen number={num} /></EntryBoundary>;
  if ([61, 81, 141, 142, 143, 144, 145, 146].includes(num)) return <EntryBoundary><SettingsHubScreen key={screen} number={num} /></EntryBoundary>;
  if ([84, 85].includes(num)) return <EntryBoundary><ManageWorkspacesScreen key={screen} details={num === 85} /></EntryBoundary>;
  if ([86, 87, 122].includes(num)) return <EntryBoundary><MigrationScreen key={screen} bundles={num === 122} /></EntryBoundary>;
  if (remoteSettings[num]) return <EntryBoundary><RemoteSettingsScreen key={screen} number={num} /></EntryBoundary>;
  if ([98, 99, 102, 103].includes(num)) return <EntryBoundary><ConfigurationScreen key={screen} number={num} /></EntryBoundary>;
  if ([89, 90, 91, 92, 93, 94, 95, 96, 118].includes(num)) return <EntryBoundary><ServicesScreen key={screen} number={num} /></EntryBoundary>;
  if ([104, 119, 120].includes(num)) return <EntryBoundary><ToolsScreen key={screen} details={num === 120} /></EntryBoundary>;
  if (num === 66) return <EntryBoundary><PartnersScreen /></EntryBoundary>;
  if ([67, 68, 69, 70, 71].includes(num)) return <EntryBoundary><PartnerScreen key={screen} number={num} /></EntryBoundary>;
  if (num === 72) return <EntryBoundary><PartnerGroupsScreen /></EntryBoundary>;
  if (num === 73) return <EntryBoundary><PersonasSkillsScreen /></EntryBoundary>;
  if (num === 74) return <EntryBoundary><PlaybookScreen /></EntryBoundary>;
  if ([75, 117].includes(num)) return <EntryBoundary><ExtensionsScreen key={screen} details={num === 117} /></EntryBoundary>;
  if (num === 76) return <EntryBoundary><McpScreen /></EntryBoundary>;
  if (num === 77) return <EntryBoundary><SubagentsScreen /></EntryBoundary>;
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
  if (num === 40) return <EntryBoundary><KnowledgeBasesListScreen /></EntryBoundary>;
  if ([41, 147, 148, 149, 150, 151].includes(num)) return <EntryBoundary><KnowledgeBaseDetailScreen key={`${screen}:${kb ?? ''}`} screenNumber={num} /></EntryBoundary>;
  if (num === 42) return <EntryBoundary><KnowledgeSourcePreviewScreen key={`${screen}:${kb ?? ''}:${file ?? ''}`} /></EntryBoundary>;
  if (num === 43) return <EntryBoundary><NewKnowledgeBaseScreen /></EntryBoundary>;
  if (num === 44) return <EntryBoundary><AddDocumentsScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 45) return <EntryBoundary><ConnectedSourcesScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 46) return <EntryBoundary><AddSourceTypeScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 47) return <EntryBoundary><GitHubSourceScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 48) return <EntryBoundary><WebSourceScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 49) return <EntryBoundary><LinkedFolderScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 50) return <EntryBoundary><IndexRecoveryScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 51) return <EntryBoundary><KnowledgeBaseSettingsScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 59) return <EntryBoundary><KnowledgeEnginesScreen /></EntryBoundary>;
  if (num === 60) return <EntryBoundary><EngineConfigScreen key={`${screen}:${engine ?? ''}`} /></EntryBoundary>;
  if (num === 112) return <EntryBoundary><ReviewDeleteKbScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 128) return <EntryBoundary><WebSourcesListScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
  if (num === 140) return <EntryBoundary><MoveKnowledgeBaseScreen key={`${screen}:${kb ?? ''}`} /></EntryBoundary>;
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
  return <EntryBoundary><Redirect href="/learning" /></EntryBoundary>;
}
