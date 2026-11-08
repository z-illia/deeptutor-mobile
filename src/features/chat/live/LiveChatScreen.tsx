import { useAuth } from '@/features/auth/AuthProvider';
import { useCopy } from '@/features/entry/copy';
import { BottomNavigation } from '@/features/mobile/BottomNavigation';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, Field, IconButton } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState, StatusChip } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUp, ChevronLeft, History, Plus, Square } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMarkdown } from '../ChatMarkdown';
import { ModelSelectionDialog } from '../ModelSelectionDialog';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { ListRow } from '@/shared/ui/ListRow';
import { commandId } from './protocol';
import { useLiveChat } from './useLiveChat';

export function LiveChatScreen({ showHistory = false }: { showHistory?: boolean }) {
  const params = useLocalSearchParams<{ sessionId?: string; new?: string }>();
  const auth = useAuth();
  const id = typeof params.sessionId === 'string' ? params.sessionId : null;
  return <ConversationScreen key={`${auth.serverUrl}:${id ?? params.new ?? 'new'}`} sessionId={id} showHistory={showHistory} />;
}

function ConversationScreen({ sessionId, showHistory }: { sessionId: string | null; showHistory: boolean }) {
  const chat = useLiveChat(sessionId);
  const { colors, language } = useDesign();
  const t = useCopy();
  const [historyOpen, setHistoryOpen] = useState(showHistory);
  const [modelsOpen, setModelsOpen] = useState(false);
  const list = useRef<FlatList>(null);
  useEffect(() => {
    if (!sessionId && chat.serverSessionId && !chat.busy && !chat.loading && !chat.error) router.replace(`/chat/${encodeURIComponent(chat.serverSessionId)}`);
  }, [sessionId, chat.serverSessionId, chat.busy, chat.loading, chat.error]);
  const followBottom = useRef(true);
  const newChat = () => router.push({ pathname: '/chat', params: { new: commandId() } });
  const openHistory = () => { setHistoryOpen(true); void chat.refreshHistory(); };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8, minHeight: 60, borderBottomWidth: 1, borderColor: colors.border }}>
        <IconButton label={t('Back')} onPress={() => router.canGoBack() ? router.back() : router.replace('/mobile/1')}><ChevronLeft size={22} color={colors.foreground} /></IconButton>
        <DText accessibilityRole="header" numberOfLines={1} style={{ flex: 1, fontSize: 22 }}>{chat.serverSessionId ? chat.title : t('New chat')}</DText>
        <IconButton label={t('Recent conversations')} onPress={openHistory}><History size={22} color={colors.foreground} /></IconButton>
        <IconButton label={t('New chat')} onPress={newChat}><Plus size={22} color={colors.foreground} /></IconButton>
      </View>
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
        </View>}
      />
      <View style={{ padding: 16, gap: 10, borderTopWidth: 1, borderColor: colors.border }}>
        <Button variant="ghost" disabled={chat.busy || chat.loading} onPress={() => setModelsOpen(true)}>{chat.model?.model_name ?? t('Server default model')}</Button>
        {chat.waiting && <InlineAlert>{t('Your tutor is waiting for your reply.')}</InlineAlert>}
        <Field
          label={t('Message')}
          placeholder={t('Ask DeepTutor…')}
          value={chat.draft}
          onChangeText={chat.setDraft}
          multiline
          editable={!chat.loading && (!chat.busy || chat.waiting)}
          style={{ maxHeight: 160, minHeight: 56, paddingVertical: 12, textAlignVertical: 'center' }}
          trailing={
            chat.busy && (!chat.waiting || !chat.draft.trim()) ? (
              <Button accessibilityLabel={t('Stop response')} onPress={() => void chat.stop()} style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, paddingHorizontal: 0, paddingVertical: 0, borderRadius: 999 }}>
                <Square size={16} color={colors.primaryForeground} fill={colors.primaryForeground} />
              </Button>
            ) : (
              <Button accessibilityLabel={t('Send')} disabled={!chat.draft.trim() || chat.loading || !!chat.error || (chat.busy && !chat.waiting)} onPress={() => { followBottom.current = true; void chat.send(language); }} style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, paddingHorizontal: 0, paddingVertical: 0, borderRadius: 999 }}>
                <ArrowUp size={18} color={colors.primaryForeground} />
              </Button>
            )
          }
        />
      </View>
    </KeyboardAvoidingView>
    <BottomNavigation activeScreen={12} />
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
