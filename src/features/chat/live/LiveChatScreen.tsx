import { WorkspaceSheet } from '@/features/entry/WorkspaceSheet';
import { useFavorites } from '@/features/favorites/FavoritesProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCopy } from '@/features/entry/copy';
import { BottomNavigation } from '@/features/mobile/BottomNavigation';
import { MobileHeader } from '@/features/mobile/ScreenLayout';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, IconButton } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState, StatusChip } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { router, useLocalSearchParams } from 'expo-router';
import { History, Layers, MoreHorizontal, Plus } from 'lucide-react-native';
import { SessionActionsSheet } from '../SessionActionsSheet';
import type { SessionSummary } from '../model';
import { conversationError, deleteConversation, getConversation, normalizeSessionSummary, organizeConversation, renameConversation } from './repository';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMarkdown } from '../ChatMarkdown';
import { ModelSelectionDialog } from '../ModelSelectionDialog';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { ListRow } from '@/shared/ui/ListRow';
import { commandId } from './protocol';
import { TutorComposer, type Panel } from './TutorComposer';
import { useLiveChat } from './useLiveChat';
import { StudyResourcesSheet } from '@/features/learning/live/StudyResourcesSheet';
import { activeResourceCount } from '@/features/learning/live/study-resources';

export function LiveChatScreen({ showHistory = false, initialPanel, chooseModel = false }: { showHistory?: boolean; initialPanel?: Panel; chooseModel?: boolean }) {
  const params = useLocalSearchParams<{ sessionId?: string; new?: string; attachFavoriteId?: string; favoriteNotebookId?: string }>();
  const auth = useAuth();
  const { selectedWorkspaceId } = useWorkspaces();
  const id = typeof params.sessionId === 'string' ? params.sessionId : null;
  return <ConversationScreen key={`${auth.serverUrl}:${auth.session?.profile?.id}:${selectedWorkspaceId}:${id ?? params.new ?? 'new'}:${params.attachFavoriteId ?? ''}:${params.favoriteNotebookId ?? ''}`} chooseModel={chooseModel} initialPanel={initialPanel} sessionId={id} showHistory={showHistory} favorite={params.attachFavoriteId && params.favoriteNotebookId ? { notebook_id: params.favoriteNotebookId, record_ids: [params.attachFavoriteId] } : undefined} />;
}

function ConversationScreen({ sessionId, showHistory, favorite, initialPanel, chooseModel = false }: { sessionId: string | null; showHistory: boolean; favorite?: { notebook_id: string; record_ids: string[] }; initialPanel?: Panel; chooseModel?: boolean }) {
  const { selectedWorkspaceId, workspaces } = useWorkspaces();
  const chat = useLiveChat(sessionId, { workspace_id: selectedWorkspaceId, workspace_mode: 'chat' }, favorite ? { text: '', configuration: { notebook_references: [favorite] } } : undefined);
  const { openSaveModal } = useFavorites();
  const { colors, language, preferences } = useDesign();
  const t = useCopy();
  const [historyOpen, setHistoryOpen] = useState(showHistory);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(chooseModel);
  const [resourcesOpen, setResourcesOpen] = useState(initialPanel === 'Attachments');
  const [actionSession, setActionSession] = useState<SessionSummary | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [renamedTitle, setRenamedTitle] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionsLoading, setActionsLoading] = useState(false);
  const active = useRef(true); const actionRequest = useRef<AbortController | null>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; actionRequest.current?.abort(); }; }, []);
  const openActions = async () => {
    if (!chat.serverSessionId || actionsLoading) return;
    const controller = new AbortController(); actionRequest.current = controller;
    setActionsLoading(true); setActionError('');
    try {
      const session = await getConversation(chat.serverSessionId, controller.signal, selectedWorkspaceId);
      if (!active.current || controller.signal.aborted) return;
      setActionSession(normalizeSessionSummary(session, selectedWorkspaceId));
      setActionsOpen(true);
    } catch (cause) { if (active.current && !controller.signal.aborted) setActionError(conversationError(cause)); }
    finally { if (active.current) setActionsLoading(false); }
  };
  const mutate = async (operation: () => Promise<void>, after?: () => void) => {
    try { await operation(); if (active.current) after?.(); return { ok: true }; }
    catch (cause) { return { ok: false, error: conversationError(cause) }; }
  };
  const list = useRef<FlatList>(null);
  useEffect(() => {
    if (!sessionId && chat.serverSessionId && !chat.busy && !chat.loading && !chat.error) router.replace(`/chat/${encodeURIComponent(chat.serverSessionId)}`);
  }, [sessionId, chat.serverSessionId, chat.busy, chat.loading, chat.error]);
  const followBottom = useRef(true);
  const newChat = () => router.push({ pathname: '/chat', params: { new: commandId() } });
  const openHistory = () => { setHistoryOpen(true); void chat.refreshHistory(); };
  const saveConversation = () => openSaveModal({
    payload: { recordType: 'chat', title: renamedTitle ?? chat.title, userQuery: '', output: '', metadata: { session_id: chat.serverSessionId, source_surface: 'chat', content_workspace_id: selectedWorkspaceId } },
    messages: chat.messages.filter(item => item.role === 'user' || item.role === 'assistant').map(item => ({ role: item.role as 'user' | 'assistant', content: item.content })),
  });
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <MobileHeader title={chat.serverSessionId ? renamedTitle ?? chat.title : t('New chat')} fallback="/mobile/1" bordered numberOfLines={1} right={<>
        <IconButton label={t('Conversation actions')} disabled={!chat.serverSessionId || chat.busy || chat.loading || actionsLoading} onPress={() => void openActions()}><MoreHorizontal size={22} color={colors.foreground} /></IconButton>
        <IconButton label={t('Switch workspace')} onPress={() => setWorkspaceOpen(true)}><Layers size={22} color={colors.foreground} /></IconButton>
        <IconButton label={t('Recent conversations')} onPress={openHistory}><History size={22} color={colors.foreground} /></IconButton>
        <IconButton label={t('New chat')} onPress={newChat}><Plus size={22} color={colors.foreground} /></IconButton>
      </>} />
      {!!chat.configuration.notebook_references?.length && <View style={{ paddingHorizontal: 16 }}><Button variant="ghost" onPress={() => chat.setConfiguration(previous => ({ ...previous, notebook_references: [] }))}>{t('Saved Original')} · {t('Remove')}</Button></View>}
      {chat.loading && <LoadingState />}
      {!!actionError && <InlineAlert tone="danger">{t(actionError)}</InlineAlert>}
      {!!chat.error && <View style={{ padding: 16, gap: 8 }}><InlineAlert tone="danger">{t(chat.error)}</InlineAlert><Button variant="secondary" onPress={chat.reload}>{t('Reload conversation')}</Button></View>}
      <FlatList
        ref={list}
        data={chat.messages}
        keyExtractor={row => String(row.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 24, flexGrow: 1 }}
        onScroll={({ nativeEvent: { contentOffset, contentSize, layoutMeasurement } }) => { followBottom.current = contentSize.height - layoutMeasurement.height - contentOffset.y < 100; }}
        scrollEventThrottle={100}
        onContentSizeChange={() => { if (followBottom.current) list.current?.scrollToEnd({ animated: false }); }}
        ListEmptyComponent={!chat.loading ? <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}><DText accessibilityRole="header" style={{ fontSize: 28, lineHeight: 38 }}>{t('What would you like to understand?')}</DText><DText muted>{t('Ask a question to start a conversation with your tutor.')}</DText></View> : undefined}
        renderItem={({ item }) => <View style={{ gap: 8, padding: item.role === 'user' ? 16 : 0, borderRadius: 16, backgroundColor: item.role === 'user' ? colors.secondary : 'transparent' }}>
          <DText role="label" muted>{t(item.role === 'user' ? 'You' : 'DeepTutor')}</DText>
          {item.content ? <ChatMarkdown content={item.content} /> : chat.busy ? <DText muted>{t('Thinking…')}</DText> : null}
          {item.role === 'assistant' && !!item.content && !chat.busy && <Button variant="ghost" onPress={() => {
            const index = chat.messages.indexOf(item);
            const prompt = chat.messages.slice(0, index).findLast(row => row.role === 'user')?.content ?? '';
            openSaveModal({ payload: { recordType: 'chat', title: renamedTitle ?? chat.title, userQuery: prompt, output: item.content, metadata: { session_id: chat.serverSessionId, message_id: item.id, source_surface: 'chat', content_workspace_id: selectedWorkspaceId } } });
          }}>{t('Save reply to Favorites')}</Button>}
        </View>}
      />
      <TutorComposer
        initialPanel={initialPanel === 'Attachments' ? undefined : initialPanel}
        onResources={() => setResourcesOpen(true)}
        resourceCount={activeResourceCount(chat.configuration, [], chat.pendingAttachments)}
        value={chat.draft} onChangeText={chat.setDraft}
        modelName={chat.model?.model_name ?? t('Server default model')}
        onChooseModel={() => setModelsOpen(true)}
        workspace={selectedWorkspaceId}
        configuration={chat.configuration} onConfigure={chat.setConfiguration}
        loading={chat.loading} busy={chat.busy} waiting={chat.waiting} error={!!chat.error}
        onSend={() => { followBottom.current = true; void chat.send(preferences?.responseLanguage ?? language); }}
        onStop={() => void chat.stop()}
      />
    </KeyboardAvoidingView>
    <BottomNavigation activeScreen={12} />
    <WorkspaceSheet open={workspaceOpen} onClose={() => setWorkspaceOpen(false)} />
    <StudyResourcesSheet open={resourcesOpen} onClose={() => setResourcesOpen(false)} workspace={selectedWorkspaceId} sessionId={chat.serverSessionId}
      configuration={chat.configuration} onConfigure={chat.setConfiguration} files={chat.pendingAttachments} onFiles={chat.setPendingAttachments}
      pathSources={[]} savedFiles={chat.messages.flatMap(message => message.attachments ?? [])} disabled={chat.busy || chat.loading} />
    <SessionActionsSheet session={actionSession} open={actionsOpen} onClose={() => setActionsOpen(false)} isRunning={chat.busy}
      onSave={chat.messages.length ? saveConversation : undefined}
      workspaceOptions={[{ id: '', name: t('General workspace') }, ...workspaces.map(item => ({ id: item.workspace_id, name: item.display_name }))]}
      onRename={(id, title) => mutate(() => renameConversation(id, title, selectedWorkspaceId), () => { setRenamedTitle(title.trim()); setActionsOpen(false); })}
      onOrganize={(id, patch) => mutate(() => organizeConversation(id, patch, selectedWorkspaceId), () => {
        setActionsOpen(false);
        if (patch.archived || (patch.workspace_id !== undefined && patch.workspace_id !== selectedWorkspaceId)) router.replace('/mobile/27');
        else void chat.refreshHistory();
      })}
      onDelete={id => mutate(() => deleteConversation(id, selectedWorkspaceId), () => { setActionsOpen(false); router.replace('/mobile/27'); })}
    />
    <FullScreenModal open={historyOpen} title={t('Recent conversations')} onClose={() => setHistoryOpen(false)} onShow={() => { if (showHistory) void chat.refreshHistory(); }}>
        {!!chat.historyError && <InlineAlert tone="danger">{t(chat.historyError)}</InlineAlert>}
        <FlatList contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} data={chat.sessions.filter(item => (!item.workspace_mode || item.workspace_mode === 'chat') && (!item.session_type || item.session_type === 'chat'))} keyExtractor={item => item.session_id} refreshing={chat.historyLoading} onRefresh={() => void chat.refreshHistory()} ListEmptyComponent={!chat.historyLoading ? <DText muted style={{ padding: 20 }}>{t('No conversations yet')}</DText> : <LoadingState />} renderItem={({ item }) => <ListRow title={item.title || t('New chat')} onPress={() => { setHistoryOpen(false); router.push(`/chat/${encodeURIComponent(item.session_id)}`); }} />} ListFooterComponent={<View style={{ padding: 16, gap: 8 }}>{!!chat.historyError && <Button onPress={() => void chat.refreshHistory()}>{t('Retry')}</Button>}{chat.hasMore && <Button loading={chat.historyLoading} onPress={() => void chat.refreshHistory(true)}>{t('Load more')}</Button>}</View>} />
    </FullScreenModal>
    <ModelSelectionDialog
      fullScreen
      open={modelsOpen}
      onClose={() => setModelsOpen(false)}
      selectedKey={chat.model ? JSON.stringify([chat.model.profile_id, chat.model.model_id]) : undefined}
      options={chat.models.map(model => ({ key: JSON.stringify([model.profile_id, model.model_id]), label: model.model_name, description: model.profile_name, badge: model.is_active_default ? <StatusChip tone="info">{t('Default')}</StatusChip> : undefined }))}
      onSelect={key => {
        const model = chat.models.find(item => JSON.stringify([item.profile_id, item.model_id]) === key);
        if (model) chat.setModel(model);
      }}
    />
  </SafeAreaView>;
}
