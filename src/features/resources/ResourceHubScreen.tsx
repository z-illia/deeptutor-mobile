import { Pressable, View } from 'react-native';
import { ChevronRight, Layers, UserRound } from 'lucide-react-native';
import { router, type Href } from 'expo-router';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useDesign } from '@/shared/design/DesignProvider';
import { InlineAlert } from '@/shared/ui/Feedback';
import { MobileAction, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { useCopy } from '@/features/entry/copy';
import { useResourceCounts } from './useResourceCounts';
import type { ResourceKey } from './api';
const library: { title: string; href: Href; key?: ResourceKey; description: string }[] = [
  { title: 'Conversations', href: '/mobile/27', key: 'chat_history', description: 'Review and reopen previous conversations.' },
  { title: 'Learning notebook', href: '/mobile/28', description: 'Authored notes' },
  { title: 'Favorites', href: '/mobile/31', key: 'notebooks', description: 'Keep original conversations and sources, ready to use in your notes.' },
  { title: 'Knowledge bases', href: '/mobile/40', key: 'knowledge', description: 'Manage knowledge bases and retrieval engines.' },
  { title: 'Question bank', href: '/mobile/33', key: 'question_bank', description: 'Review and organize quiz questions across sessions.' },
  { title: 'Learning journal', href: '/mobile/39', description: 'Inspect your mission, session handoff and confirmed records.' },
];
const account: typeof library = [
  { title: 'Partners', href: '/mobile/66', key: 'partners', description: 'Companions with their own soul, library and channels' },
  { title: 'Personas', href: '/mobile/73', key: 'personas', description: 'Behavior presets you can apply per chat turn.' },
  { title: 'Skills', href: '/mobile/73', key: 'skills', description: 'Capability playbooks the model reads on demand.' },
  { title: 'Connectors', href: '/mobile/76', key: 'mcp', description: 'Connect hosted MCP services and bring their tools into chat.' },
  { title: 'CLI apps', href: '/mobile/99', key: 'cli_apps', description: 'Command-line tools from the CLI-Anything catalog, callable from chat.' },
  { title: 'Subagents & imports', href: '/mobile/77', key: 'agents', description: 'Connect local or remote agents and consult them from any chat.' },
  { title: 'Memory', href: '/mobile/78', description: 'Review what your tutor remembers about you.' },
];
export function ResourceHubScreen({ personalization = false }: { personalization?: boolean }) {
  const auth = useAuth(); const scope = useWorkspaces(); const t = useCopy(); const { colors } = useDesign();
  const owner = JSON.stringify([auth.serverUrl, auth.session?.profile?.id ?? null]);
  const { counts, refresh } = useResourceCounts(personalization, scope.selectedWorkspaceId, owner);
  return <MobilePage title={t(personalization ? 'Personalization' : 'Library')} fallback="/mobile/61" tab={personalization ? undefined : 26}
    headerLeft={personalization ? undefined : <Pressable accessibilityRole="button" accessibilityLabel={t('Switch workspace')} onPress={() => router.push('/mobile/62')} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><Layers size={22} color={colors.foreground} /></Pressable>}
    headerRight={personalization ? undefined : <Pressable accessibilityRole="button" accessibilityLabel={t('Account and settings')} onPress={() => router.push('/mobile/61')} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><UserRound size={22} color={colors.primary} /></Pressable>}>
    <MobileText muted>{personalization ? t('Account resources can be assigned to multiple workspaces.') : scope.workspaces.find(item => item.workspace_id === scope.selectedWorkspaceId)?.display_name ?? (scope.selectedWorkspaceId || t('General workspace'))}</MobileText>
    {!personalization && <MobileRow title={t('Search library')} description={t('navigation.searchEverything')} onPress={() => router.push('/search')} />}
    {(personalization ? account : library).map(item => {
      const count = item.key ? counts[item.key] : undefined;
      return <View key={item.href + item.title} style={{ gap: 8 }}>
        <MobileRow title={t(item.title)} description={t(item.description)} onPress={() => router.push(item.href)}>
          {item.key && <MobileText muted testID={`count-${item.key}`} accessibilityLiveRegion="polite">{count?.status === 'ready' ? String(count.value) : count?.status === 'error' ? t('Unavailable') : t('Loading…')}</MobileText>}<ChevronRight size={20} color={colors.mutedForeground} />
        </MobileRow>
        {count?.status === 'error' && <InlineAlert tone="danger">{t(count.error)}</InlineAlert>}
      </View>;
    })}
    <MobileAction variant="secondary" onPress={refresh}>{t('Refresh')}</MobileAction>
  </MobilePage>;
}
