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
import { Bookmark, History, Layers, Plus } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMarkdown } from '../ChatMarkdown';
import { ModelSelectionDialog } from '../ModelSelectionDialog';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { ListRow } from '@/shared/ui/ListRow';
import { commandId } from './protocol';
import { TutorComposer } from './TutorComposer';
import { useLiveChat } from './useLiveChat';

export function LiveChatScreen({ showHistory = false }: { showHistory?: boolean }) {
  const params = useLocalSearchParams<{ sessionId?: string; new?: string; attachFavoriteId?: string; favoriteNotebookId?: string }>();
  const auth = useAuth();
  const { selectedWorkspaceId } = useWorkspaces();
  const id = typeof params.sessionId === 'string' ? params.sessionId : null;
  return <ConversationScreen key={`${auth.serverUrl}:${auth.session?.profile?.id}:${selectedWorkspaceId}:${id ?? params.new ?? 'new'}:${params.attachFavoriteId ?? ''}:${params.favoriteNotebookId ?? ''}`} sessionId={id} showHistory={showHistory} favorite={params.attachFavoriteId && params.favoriteNotebookId ? { notebook_id: params.favoriteNotebookId, record_ids: [params.attachFavoriteId] } : undefined} />;
}

function ConversationScreen({ sessionId, showHistory, favorite }: { sessionId: string | null; showHistory: boolean; favorite?: { notebook_id: string; record_ids: string[] } }) {
  const { selectedWorkspaceId } = useWorkspaces();
  const chat = useLiveChat(sessionId, { workspace_id: selectedWorkspaceId, workspace_mode: 'chat' }, favorite ? { text: '', configuration: { notebook_references: [favorite] } } : undefined);
  const { openSaveModal } = useFavorites();
  const { colors, language, preferences } = useDesign();
  const t = useCopy();
  const [historyOpen, setHistoryOpen] = useState(showHistory);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const list = useRef<FlatList>(null);
  useEffect(() => {
    if (!sessionId && chat.serverSessionId && !chat.busy && !chat.loading && !chat.error) router.replace(`/chat/${encodeURIComponent(chat.serverSessionId)}`);
  }, [sessionId, chat.serverSessionId, chat.busy, chat.loading, chat.error]);
  const followBottom = useRef(true);
  const newChat = () => router.push({ pathname: '/chat', params: { new: commandId() } });
  const openHistory = () => { setHistoryOpen(true); void chat.refreshHistory(); };
  const saveConversation = () => openSaveModal({
    payload: { recordType: 'chat', title: chat.title, userQuery: '', output: '', metadata: { session_id: chat.serverSessionId, source_surface: 'chat', content_workspace_id: selectedWorkspaceId } },
    messages: chat.messages.filter(item => item.role === 'user' || item.role === 'assistant').map(item => ({ role: item.role as 'user' | 'assistant', content: item.content })),
  });
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <MobileHeader title={chat.serverSessionId ? chat.title : t('New chat')} fallback="/mobile/1" bordered numberOfLines={1} right={<>
        <IconButton label={t('Save to Favorites')} disabled={chat.busy || chat.loading || !chat.messages.length} onPress={saveConversation}><Bookmark size={22} color={colors.foreground} /></IconButton>
        <IconButton label={t('Switch workspace')} onPress={() => setWorkspaceOpen(true)}><Layers size={22} color={colors.foreground} /></IconButton>
        <IconButton label={t('Recent conversations')} onPress={openHistory}><History size={22} color={colors.foreground} /></IconButton>
        <IconButton label={t('New chat')} onPress={newChat}><Plus size={22} color={colors.foreground} /></IconButton>
      </>} />
      {!!chat.configuration.notebook_references?.length && <View style={{ paddingHorizontal: 16 }}><Button variant="ghost" onPress={() => chat.setConfiguration(previous => ({ ...previous, notebook_references: [] }))}>{t('Saved Original')} · {t('Remove')}</Button></View>}
      {chat.loading && <LoadingState />}
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
            openSaveModal({ payload: { recordType: 'chat', title: chat.title, userQuery: prompt, output: item.content, metadata: { session_id: chat.serverSessionId, message_id: item.id, source_surface: 'chat', content_workspace_id: selectedWorkspaceId } } });
          }}>{t('Save reply to Favorites')}</Button>}
        </View>}
      />
      <TutorComposer
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
