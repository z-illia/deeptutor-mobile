import { View } from 'react-native';
import { BookOpen, Database, Heart, ListChecks, MessageSquare, NotebookPen, Search, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { router, type Href } from 'expo-router';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useDesign } from '@/shared/design/DesignProvider';
import { InlineAlert } from '@/shared/ui/Feedback';
import { MobileAction, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { useCopy } from '@/features/entry/copy';
import { useResourceCounts } from './useResourceCounts';
import type { ResourceKey } from './api';
const library: { title: string; href: Href; key?: ResourceKey; description: string; icon?: LucideIcon }[] = [
  { title: 'Conversations', icon: MessageSquare, href: '/space/chat-history', key: 'chat_history', description: 'Review and reopen previous conversations.' },
  { title: 'Learning notebook', icon: NotebookPen, href: '/notes', description: 'Authored notes' },
  { title: 'Favorites', icon: Heart, href: '/favorites', key: 'notebooks', description: 'Keep original conversations and sources, ready to use in your notes.' },
  { title: 'Knowledge bases', icon: Database, href: '/knowledge-bases', key: 'knowledge', description: 'Manage knowledge bases and retrieval engines.' },
  { title: 'Question bank', icon: ListChecks, href: '/space/questions', key: 'question_bank', description: 'Review and organize quiz questions across sessions.' },
  { title: 'Learning journal', icon: BookOpen, href: '/space/journal', description: 'Inspect your mission, session handoff and confirmed records.' },
];
const account: typeof library = [
  { title: 'Partners', href: '/partners', key: 'partners', description: 'Companions with their own soul, library and channels' },
  { title: 'Personas', href: '/space/personas', key: 'personas', description: 'Behavior presets you can apply per chat turn.' },
  { title: 'Skills', href: '/space/personas', key: 'skills', description: 'Capability playbooks the model reads on demand.' },
  { title: 'Connectors', href: '/space/mcp', key: 'mcp', description: 'Connect hosted MCP services and bring their tools into chat.' },
  { title: 'CLI apps', href: '/settings/agents', key: 'cli_apps', description: 'Command-line tools from the CLI-Anything catalog, callable from chat.' },
  { title: 'Subagents & imports', href: '/agents', key: 'agents', description: 'Connect local or remote agents and consult them from any chat.' },
  { title: 'Memory', href: '/memory', description: 'Review what your tutor remembers about you.' },
];
export function ResourceHubScreen({ personalization = false }: { personalization?: boolean }) {
  const auth = useAuth(); const scope = useWorkspaces(); const t = useCopy(); const { colors } = useDesign();
  const owner = JSON.stringify([auth.serverUrl, auth.session?.profile?.id ?? null]);
  const { counts, refresh } = useResourceCounts(personalization, scope.selectedWorkspaceId, owner);
  return <MobilePage title={t(personalization ? 'Personalization' : 'Library')} root={!personalization} fallback="/account" tab={personalization ? undefined : 26}>
    <MobileText muted>{personalization ? t('Account resources can be assigned to multiple workspaces.') : scope.workspaces.find(item => item.workspace_id === scope.selectedWorkspaceId)?.display_name ?? (scope.selectedWorkspaceId || t('General workspace'))}</MobileText>
    {!personalization && <MobileRow icon={<Search size={22} color={colors.primary} />} title={t('Search library')} description={t('navigation.searchEverything')} onPress={() => router.push('/search')} />}
    {(personalization ? account : library).map(item => {
      const count = item.key ? counts[item.key] : undefined;
      const Icon = item.icon;
      return <View key={item.href + item.title} style={{ gap: 8 }}>
        <MobileRow icon={Icon ? <Icon size={22} color={colors.primary} /> : undefined} title={t(item.title)} description={t(item.description)} onPress={() => router.push(item.href)}>
          {item.key && <MobileText muted testID={`count-${item.key}`} accessibilityLiveRegion="polite">{count?.status === 'ready' ? String(count.value) : count?.status === 'error' ? t('Unavailable') : t('Loading…')}</MobileText>}<ChevronRight size={20} color={colors.mutedForeground} />
        </MobileRow>
        {count?.status === 'error' && <InlineAlert tone="danger">{t(count.error)}</InlineAlert>}
      </View>;
    })}
    <MobileAction variant="secondary" onPress={refresh}>{t('Refresh')}</MobileAction>
  </MobilePage>;
}
