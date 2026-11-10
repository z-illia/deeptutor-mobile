import { useLayoutDimensions } from '@/hooks/use-layout-dimensions';
import type { Href } from 'expo-router';
import { useEffect, useRef, useState, type PropsWithChildren, type ElementRef } from 'react';
import { BackHandler, Modal, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, CalendarDays, ChevronsLeft, ChevronsRight, Columns3, Folder, History, Menu, MessageCircle, PenLine, Plus, SlidersHorizontal, SquarePen, Search, ChevronDown } from 'lucide-react-native';
import { useChat } from '@/features/chat/ChatProvider';
import { OrganizedSessionList } from '@/features/chat/OrganizedSessionList';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { useCopy } from '@/features/entry/copy';
import { allowedDestination } from '@/features/entry/model';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { WorkspaceSheet } from '@/features/entry/WorkspaceSheet';
import { useDesign } from '@/shared/design/DesignProvider';
import { geometry, alpha } from '@/shared/design/tokens';
import { DText } from '@/shared/ui/Text';
import { Button, IconButton } from '@/shared/ui/Controls';
import { EmptyState, LoadingState } from '@/shared/ui/Feedback';
import { useOverlayFocus } from '@/shared/ui/use-overlay-focus';
import { HomeShelfIcon, LearningShelfIcon, ResourcesShelfIcon, PartnersShelfIcon, PersonalizationShelfIcon } from '@/shared/ui/ShelfIcons';
import { shelves, shellRepository, sidebarWidth, type ShelfId, type ShellState } from './fixtures';

const glyphs = { home: HomeShelfIcon, learning: LearningShelfIcon, resources: ResourcesShelfIcon, partners: PartnersShelfIcon, personalization: PersonalizationShelfIcon };
const itemIcons = { '/chat': MessageCircle, '/calendar': CalendarDays, '/kanban': Columns3, '/co-writer': PenLine };

export function AppShell({ children }: PropsWithChildren) {
  const { colors, layout } = useDesign();
  const t = useCopy(); const f = useFixtures(); const chat = useChat(); const path = usePathname();
  const activeChatSessionId = path.startsWith('/chat/') ? decodeURIComponent(path.slice('/chat/'.length)) : null;
  const activeWorkspaceSessions = chat.sessions.filter((s) => (s.workspace_id ?? '') === f.workspace && !s.preferences?.archived);
  const [workspaceSheet, setWorkspaceSheet] = useState(false);
  const workspaceState = useWorkspaces();
  const workspaceName = workspaceState.workspaces.find(row => row.workspace_id === f.workspace)?.display_name ?? (f.workspace ? f.workspace : t('General workspace'));
  const { width } = useLayoutDimensions();
  const compact = width < geometry.tablet;
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [preferredWidth, setPreferredWidth] = useState<number>(272);
  const params = useLocalSearchParams<{ shelf?: ShelfId; page?: string; scenario?: ShellState }>();
  const inferredShelf: ShelfId = /^\/(personalization|agents|memory|space\/(personas|skills|mcp|cli-apps))/.test(path) ? 'personalization' : path.startsWith('/space') || path.startsWith('/knowledge') || path.startsWith('/favorites') ? 'resources' : path.startsWith('/learning') ? 'learning' : path.startsWith('/partners') ? 'partners' : 'home';
  const shelf = ['/', '/explore', '/avatar-preview'].includes(path) && shelves.some((item) => item.id === params.shelf) ? params.shelf! : inferredShelf;
  const state: ShellState = ['ready', 'loading', 'empty', 'error'].includes(params.scenario || '') ? params.scenario! : 'ready';
  const [hidden, setHidden] = useState<readonly string[]>([]);
  const [arranging, setArranging] = useState(false);
  const [order, setOrder] = useState<readonly string[]>([]);
  const [retrying, setRetrying] = useState(false);
  const root = useRef<ElementRef<typeof View>>(null);
  const opener = useRef<ElementRef<typeof View>>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => { const current = timers.current; return () => current.forEach(clearTimeout); }, []);
  const closeDrawer = () => setDrawer(false);
  useOverlayFocus(drawer && compact, root, closeDrawer, false);
  useEffect(() => { if (!drawer) return; const sub = BackHandler.addEventListener('hardwareBackPress', () => { setDrawer(false); return true; }); return () => sub.remove(); }, [drawer]);
  const items = [...shellRepository.read(shelf, state)].filter((item) => allowedDestination(f.mode, item.route)).sort((a, b) => { const ai = order.indexOf(a.key); const bi = order.indexOf(b.key); return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi); });
  const moveUp = (key: string) => { const keys = items.map((item) => item.key); const i = keys.indexOf(key); if (i > 0) { [keys[i - 1], keys[i]] = [keys[i], keys[i - 1]]; setOrder(keys); } };
  const page = items.find((item) => item.route === path || path.startsWith(item.route + '/')) || items.find((item) => item.key === params.page) || items[0];
  const choose = (next: ShelfId, key?: string) => {
    const entry = shellRepository.read(next, 'ready').find((item) => item.key === key) || shellRepository.read(next, 'ready')[0];
    if (entry) router.navigate(entry.route as Href);
    setDrawer(false);
  };
  const sidebar = (phone = false) => <SafeAreaView edges={['top', 'bottom']} style={{ height: '100%', width: phone ? Math.min(geometry.phoneSidebar, width * 0.85) : collapsed ? geometry.rail : sidebarWidth(preferredWidth, width), backgroundColor: colors.secondary, borderRightWidth: 1, borderColor: colors.border }}>
    <View style={{ paddingHorizontal: 8, paddingTop: 8, flexDirection: collapsed && !phone ? 'column' : 'row', alignItems: 'center' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Workspace')} onPress={() => { setDrawer(false); setWorkspaceSheet(true); }} style={{ flex: collapsed && !phone ? undefined : 1, flexDirection: 'row', alignItems: 'center', minHeight: 48, minWidth: 48, gap: 4 }}><Image source={require('../../../assets/brand/color-logo.png')} style={{ width: 22, height: 22, marginHorizontal: 8 }} accessibilityLabel="DeepTutor" />{(!collapsed || phone) && <><DText role="section" numberOfLines={1} style={{ flex: 1 }}>{workspaceName}</DText><ChevronDown size={14} color={colors.mutedForeground} /></>}</Pressable>
      {!collapsed && <IconButton label={t('Search')} onPress={() => { setDrawer(false); router.navigate('/search'); }}><Search size={16} color={colors.mutedForeground} /></IconButton>}
      <IconButton label={phone ? t('Close') : t(collapsed ? 'Expand sidebar' : 'Collapse sidebar')} onPress={() => phone ? setDrawer(false) : setCollapsed((old) => !old)}>{collapsed ? <ChevronsRight size={16} color={colors.mutedForeground} /> : <ChevronsLeft size={16} color={colors.mutedForeground} />}</IconButton>
    </View>
    <View accessibilityRole="tablist" accessibilityLabel="DeepTutor" style={{ flexDirection: collapsed && !phone ? 'column' : 'row', flexWrap: 'wrap', margin: 8, gap: 0 }}>
      {shelves.map((entry) => { const Icon = glyphs[entry.id]; return <Pressable key={entry.id} accessibilityRole="tab" accessibilityState={{ selected: shelf === entry.id }} accessibilityLabel={t(entry.label)} onPress={() => choose(entry.id)} style={({ pressed }) => ({ flex: collapsed && !phone ? undefined : 1, minWidth: 48, minHeight: 48, borderRadius: 7, backgroundColor: shelf === entry.id || pressed ? colors.accent : 'transparent', alignItems: 'center', justifyContent: 'center' })}><Icon size={19} strokeWidth={1.6} color={shelf === entry.id ? colors.foreground : colors.mutedForeground} fill={shelf === entry.id ? alpha(colors.foreground, 0.16) : 'none'} /></Pressable>; })}
    </View>
    {(!collapsed || phone) && <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 8, gap: 4 }}>
      {state === 'loading' ? <LoadingState /> : state === 'error' ? <Button variant="ghost" onPress={() => router.setParams({ scenario: 'ready' })}>{t('Retry')}</Button> : state === 'empty' ? <EmptyState title={t('No conversations yet')} /> : items.filter((item) => !hidden.includes(item.key)).map((item) => { const Icon = itemIcons[item.key as keyof typeof itemIcons] || (shelf === 'learning' ? BookOpen : Folder); return <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t(item.label)} accessibilityState={{ selected: page?.key === item.key }} onPress={() => choose(shelf, item.key)} style={({ pressed }) => ({ flex: 1, minHeight: 48, borderRadius: 7, paddingHorizontal: 10, gap: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: page?.key === item.key || pressed ? colors.accent : 'transparent' })}><Icon size={16} strokeWidth={1.6} color={colors.mutedForeground} /><DText role="small" numberOfLines={1} style={{ flex: 1 }}>{t(item.label)}</DText></Pressable>
        {arranging && <Button size="sm" variant="ghost" accessibilityLabel={`${t('Move up')} ${t(item.label)}`} disabled={items[0]?.key === item.key} onPress={() => moveUp(item.key)}>↑</Button>}
        {arranging && <Button size="sm" variant="ghost" accessibilityLabel={`${t('Hide pages')} ${t(item.label)}`} onPress={() => setHidden((old) => [...old, item.key])}>−</Button>}
      </View>; })}
      <View style={{ marginTop: 14, paddingHorizontal: 6, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
          <DText role="caption" muted>{t('Conversations')}  {state === 'ready' ? activeWorkspaceSessions.length : 0}</DText>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Chat History')} onPress={() => { setDrawer(false); router.push('/space/chat-history'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
            <History size={12} color={colors.mutedForeground} />
            <DText role="caption" muted>{t('History')}</DText>
          </Pressable>
        </View>
        {state === 'ready' && activeWorkspaceSessions.length > 0 ? (
          <OrganizedSessionList
            compact
            sessions={activeWorkspaceSessions}
            selectedSessionId={activeChatSessionId}
            liveSessionIds={chat.liveSessionIds}
            masteryTopics={chat.masteryTopicsForWorkspace(f.workspace)}
            readingCollections={chat.readingCollectionsForWorkspace(f.workspace)}
            onSelectSession={(session) => {
              setDrawer(false);
              router.push(`/chat/${encodeURIComponent(session.session_id)}`);
            }}
            onRenameSession={chat.renameSession}
            onOrganizeSession={chat.organizeSession}
            onDeleteSession={(targetId) => {
              const res = chat.deleteSession(targetId);
              if (res.ok && targetId === activeChatSessionId) {
                router.replace('/chat');
              }
              return res;
            }}
          />
        ) : (
          <DText role="caption" muted style={{ paddingHorizontal: 4 }}>{t('No conversations yet')}</DText>
        )}
      </View>
      {arranging && <View style={{ gap: 4, marginTop: 12 }}><Button variant="ghost" onPress={() => { setHidden([]); setOrder([]); }}>{t('Reset to defaults')}</Button>{!phone && <View style={{ flexDirection: 'row' }}><Button variant="ghost" accessibilityLabel={t("Narrow sidebar")} onPress={() => setPreferredWidth((old) => Math.max(220, old - 20))}>−</Button><Button variant="ghost" accessibilityLabel={t("Widen sidebar")} onPress={() => setPreferredWidth((old) => Math.min(480, old + 20))}>+</Button></View>}</View>}
    </ScrollView>}
    <View style={{ padding: 8, gap: 4, marginTop: 'auto' }}>
      <IconButton label={t('Arrange sidebar')} onPress={() => { setCollapsed(false); setArranging((old) => !old); }}><SlidersHorizontal size={16} color={colors.mutedForeground} /></IconButton>
      <Button variant="secondary" onPress={() => { setDrawer(false); router.push('/chat'); }} icon={<SquarePen size={16} color={colors.mutedForeground} />} style={{ borderRadius: layout === 'modern' ? 999 : 8, minWidth: 0, paddingHorizontal: collapsed && !phone ? 0 : 12 }}>{collapsed && !phone ? <Plus size={16} color={colors.foreground} /> : t('New conversation')}</Button>
    </View>
  </SafeAreaView>;
  return <SafeAreaView edges={compact ? ['top', 'bottom', 'left', 'right'] : ['left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <View testID="app-shell" style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background, backgroundImage: colors.background === '#0e0d1a' ? 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0d0d1a 100%)' : undefined }}>
      {!compact && sidebar()}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ minHeight: 48, paddingHorizontal: 8, borderBottomWidth: compact ? 1 : 0, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {compact && <IconButton ref={opener} label={t('Open navigation')} onPress={() => { setCollapsed(false); setDrawer(true); }}><Menu size={18} color={colors.foreground} /></IconButton>}
          {compact && <Image source={require('../../../assets/brand/color-logo.png')} style={{ width: 20, height: 20 }} accessibilityLabel="DeepTutor" />}
          {compact ? <Image source={require('../../../assets/brand/color-word.png')} style={{ width: 90, height: 24 }} contentFit="contain" accessibilityLabel="DeepTutor" /> : <View style={{ backgroundColor: colors.muted, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', gap: 8, alignItems: 'center' }}><MessageCircle size={16} color={colors.mutedForeground} /><DText role="small">{page ? t(page.label) : t('Chat')}</DText></View>}
          <View style={{ flex: 1 }} />
          {compact && <IconButton label={t('Search')} onPress={() => router.navigate('/search')}><Search size={18} color={colors.foreground} /></IconButton>}
          {__DEV__ && <IconButton label="Component preview" onPress={() => router.push('/explore')}><SlidersHorizontal size={17} color={colors.mutedForeground} /></IconButton>}
        </View>
        {children || <View style={{ flex: 1, alignItems: 'flex-start', paddingHorizontal: 8, paddingTop: 4 }}>
          <Button variant="ghost" loading={retrying} onPress={() => { setRetrying(true); const timer = setTimeout(() => { setRetrying(false); timers.current.delete(timer); }, 400); timers.current.add(timer); }}>{t('Retry')}</Button>
        </View>}
      </View>
      <WorkspaceSheet open={workspaceSheet} onClose={() => setWorkspaceSheet(false)} />
      <Modal transparent visible={drawer && compact} animationType="none" onRequestClose={closeDrawer} onDismiss={() => opener.current?.focus()}>
        <View style={{ flex: 1, backgroundColor: colors.overlay }}>
          <Pressable accessible={false} onPress={closeDrawer} style={{ position: 'absolute', inset: 0 }} />
          <View ref={root} accessibilityViewIsModal style={{ height: '100%', alignSelf: 'flex-start' }}>{sidebar(true)}</View>
        </View>
      </Modal>
    </View>
  </SafeAreaView>;
}
