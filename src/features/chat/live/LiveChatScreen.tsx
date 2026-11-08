import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUp, BookOpen, Calendar, ChevronLeft, Folder, History, MessageCircle, Plus, X } from 'lucide-react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, Field, IconButton } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { ChatMarkdown } from '../ChatMarkdown';
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
  const rowStyle = { minHeight: 52, padding: 14, borderBottomWidth: 1, borderColor: colors.border };
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
          trailing={<Button accessibilityLabel={t('Send')} disabled={!chat.draft.trim() || chat.loading || !!chat.error || (chat.busy && !chat.waiting)} onPress={() => { followBottom.current = true; void chat.send(language); }} style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, paddingHorizontal: 0, paddingVertical: 0, borderRadius: 999 }}><ArrowUp size={18} color={colors.primaryForeground} /></Button>}
        />
        {chat.busy && <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onPress={() => void chat.stop()}>{t('Stop response')}</Button>
        </View>}
      </View>
    </KeyboardAvoidingView>
    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: colors.border }}>
      {[{ label: 'Learn', path: '/mobile/1', Icon: BookOpen }, { label: 'Tutor', path: '/chat', Icon: MessageCircle }, { label: 'Library', path: '/mobile/26', Icon: Folder }, { label: 'Plan', path: '/mobile/52', Icon: Calendar }].map(({ label, path, Icon }) => <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: label === 'Tutor' }} accessibilityLabel={t(label)} onPress={() => { if (label !== 'Tutor') router.navigate(path as Href); }} style={{ flex: 1, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 4 }}><Icon size={22} color={label === 'Tutor' ? colors.primary : colors.mutedForeground} /><DText role="caption" muted={label !== 'Tutor'}>{t(label)}</DText></Pressable>)}
    </View>
    <Modal visible={historyOpen} animationType="slide" onRequestClose={() => setHistoryOpen(false)} onShow={() => { if (showHistory) void chat.refreshHistory(); }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}><DText accessibilityRole="header" style={{ flex: 1, fontSize: 22 }}>{t('Recent conversations')}</DText><IconButton label={t('Close')} onPress={() => setHistoryOpen(false)}><X size={22} color={colors.foreground} /></IconButton></View>
        {!!chat.historyError && <InlineAlert tone="danger">{t(chat.historyError)}</InlineAlert>}
        <FlatList data={chat.sessions.filter(item => (!item.workspace_mode || item.workspace_mode === 'chat') && (!item.session_type || item.session_type === 'chat'))} keyExtractor={item => item.session_id} refreshing={chat.historyLoading} onRefresh={() => void chat.refreshHistory()} ListEmptyComponent={!chat.historyLoading ? <DText muted style={{ padding: 20 }}>{t('No conversations yet')}</DText> : <LoadingState />} renderItem={({ item }) => <Pressable accessibilityRole="button" style={rowStyle} onPress={() => { setHistoryOpen(false); router.push(`/chat/${encodeURIComponent(item.session_id)}`); }}><DText numberOfLines={2}>{item.title || t('New chat')}</DText></Pressable>} ListFooterComponent={<View style={{ padding: 16, gap: 8 }}>{!!chat.historyError && <Button onPress={() => void chat.refreshHistory()}>{t('Retry')}</Button>}{chat.hasMore && <Button loading={chat.historyLoading} onPress={() => void chat.refreshHistory(true)}>{t('Load more')}</Button>}</View>} />
      </SafeAreaView>
    </Modal>
    <Modal visible={modelsOpen} animationType="slide" onRequestClose={() => setModelsOpen(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}><DText accessibilityRole="header" style={{ flex: 1, fontSize: 22 }}>{t('Choose model')}</DText><IconButton label={t('Close')} onPress={() => setModelsOpen(false)}><X size={22} color={colors.foreground} /></IconButton></View><ScrollView>{chat.models.length === 0 && <DText style={{ padding: 20 }}>{t('Server default model')}</DText>}{chat.models.map(model => <Pressable key={`${model.profile_id}:${model.model_id}`} accessibilityRole="radio" accessibilityState={{ checked: model.profile_id === chat.model?.profile_id && model.model_id === chat.model?.model_id }} onPress={() => { chat.setModel(model); setModelsOpen(false); }} style={rowStyle}><DText>{model.model_name}</DText><DText muted>{model.profile_name}</DText></Pressable>)}</ScrollView></SafeAreaView>
    </Modal>
  </SafeAreaView>;
}
