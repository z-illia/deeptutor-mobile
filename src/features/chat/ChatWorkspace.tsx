import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AlertCircle,
  ArchiveRestore,
  Check,
  History,
  MoreHorizontal,
  Pencil,
  Plus,
  X,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { geometry } from '@/shared/design/tokens';
import { Button, IconButton } from '@/shared/ui/Controls';
import {
  EmptyState,
  InlineAlert,
  LoadingState,
  StatusChip,
  useFeedback,
} from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { useChat } from './ChatProvider';
import { ChatComposer } from './ChatComposer';
import { ChatMessageList } from './ChatMessageList';
import {
  buildVisiblePath,
  displaySessionTitle,
  isPlaceholderSessionTitle,
} from './model';
import { SessionActionsSheet } from './SessionActionsSheet';
import { StarterSuggestions } from './StarterSuggestions';

export function ChatWorkspace() {
  const params = useLocalSearchParams<{ sessionId?: string | string[] }>();
  const rawSessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const sessionId =
    typeof rawSessionId === 'string' && rawSessionId.trim()
      ? decodeURIComponent(rawSessionId.trim())
      : null;

  const { colors, dark } = useDesign();
  const t = useCopy();
  const { notify } = useFeedback();
  const chat = useChat();

  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(
    null,
  );
  const [headerTitleDraft, setHeaderTitleDraft] = useState('');
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [sendErrorSessionKey, setSendErrorSessionKey] = useState<string | null>(
    null,
  );
  const [sendErrorText, setSendErrorText] = useState('');

  const activeSession = useMemo(
    () =>
      sessionId
        ? chat.sessions.find((s) => s.session_id === sessionId) ?? null
        : null,
    [chat.sessions, sessionId],
  );

  const renamingHeader = Boolean(
    activeSession && renamingSessionId === activeSession.session_id,
  );
  const sendError =
    sendErrorSessionKey === (sessionId ?? '__new__') ? sendErrorText : '';

  const rawMessages = useMemo(
    () => (sessionId ? chat.messagesBySession[sessionId] ?? [] : []),
    [chat.messagesBySession, sessionId],
  );

  const selectedBranches = useMemo(
    () => (sessionId ? chat.getSelectedBranches(sessionId) : {}),
    [chat, sessionId],
  );

  const { messages: visibleMessages, siblingsByMessageId } = useMemo(
    () => buildVisiblePath(rawMessages, selectedBranches),
    [rawMessages, selectedBranches],
  );

  const isStreaming = Boolean(
    sessionId && chat.liveSessionIds.has(sessionId),
  );
  const effectiveModel = chat.getEffectiveModel(sessionId);
  const draft = chat.getDraft(sessionId);
  const attachments = chat.getAttachments(sessionId);
  const isArchived = Boolean(activeSession?.preferences?.archived);
  const titleDisplay = displaySessionTitle(
    activeSession?.title,
    t('New chat'),
  );

  const handleSend = () => {
    setSendErrorText('');
    setSendErrorSessionKey(sessionId ?? '__new__');
    const result = chat.sendMessage(sessionId);
    if (!result.ok && result.error) {
      setSendErrorText(t(result.error));
      setSendErrorSessionKey(result.sessionId ?? sessionId ?? '__new__');
      notify(t(result.error), 'danger');
    }
    if (result.sessionId && result.sessionId !== sessionId) {
      router.replace(`/chat/${encodeURIComponent(result.sessionId)}`);
    }
  };

  const handleCommitHeaderRename = () => {
    if (!activeSession) return;
    const res = chat.renameSession(activeSession.session_id, headerTitleDraft);
    if (!res.ok) {
      notify(t(res.error || 'Rename failed'), 'danger');
      return;
    }
    setRenamingSessionId(null);
    notify(t('Saved'), 'success');
  };

  const handleRestoreArchived = () => {
    if (!activeSession) return;
    const res = chat.organizeSession(activeSession.session_id, {
      archived: false,
    });
    if (!res.ok) {
      notify(t(res.error || 'Failed to save'), 'danger');
      return;
    }
    notify(t('Restore from archive'), 'info');
  };

  const handleDeleteCurrentSession = (targetId: string) => {
    const res = chat.deleteSession(targetId);
    if (res.ok && targetId === sessionId) {
      router.replace('/chat');
    }
    return res;
  };

  return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        {/* Conversation Header Bar */}
        <View
          style={{
            minHeight: 50,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              minWidth: 0,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {renamingHeader && activeSession ? (
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <TextInput
                  value={headerTitleDraft}
                  onChangeText={setHeaderTitleDraft}
                  placeholder={t('New chat')}
                  placeholderTextColor={colors.mutedForeground}
                  accessibilityLabel={t('Session title')}
                  onSubmitEditing={handleCommitHeaderRename}
                  style={{
                    flex: 1,
                    minWidth: 80,
                    minHeight: 36,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: geometry.radius.sm,
                    borderWidth: 1,
                    borderColor: colors.ring,
                    backgroundColor: colors.card,
                    color: colors.foreground,
                    fontFamily: 'Geist',
                    fontSize: 14,
                  }}
                />
                <IconButton
                  label={t('Save title')}
                  onPress={handleCommitHeaderRename}
                >
                  <Check size={16} color={colors.success} />
                </IconButton>
                <IconButton
                  label={t('Cancel')}
                  onPress={() => setRenamingSessionId(null)}
                >
                  <X size={16} color={colors.mutedForeground} />
                </IconButton>
              </View>
            ) : (
              <Pressable
                disabled={!activeSession}
                accessibilityRole="button"
                accessibilityLabel={
                  activeSession
                    ? t('Click to rename session')
                    : t('Start a conversation to rename')
                }
                onPress={() => {
                  if (!activeSession) return;
                  setHeaderTitleDraft(
                    isPlaceholderSessionTitle(activeSession.title)
                      ? ''
                      : activeSession.title,
                  );
                  setRenamingSessionId(activeSession.session_id);
                }}
                style={({ pressed }) => ({
                  flexShrink: 1,
                  minWidth: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: geometry.radius.sm,
                  backgroundColor:
                    pressed && activeSession ? colors.secondary : 'transparent',
                })}
              >
                <DText role="section" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {titleDisplay}
                </DText>
                {activeSession ? (
                  <Pencil size={13} color={colors.mutedForeground} />
                ) : null}
              </Pressable>
            )}

            {isArchived ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Restore archived session"
                onPress={handleRestoreArchived}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: colors.warningSurface,
                  borderWidth: 1,
                  borderColor: colors.warning,
                }}
              >
                <ArchiveRestore size={13} color={colors.warning} />
                <DText
                  role="section"
                  style={{ color: colors.warning }}
                >
                  {t('Archived')} · {t('Restore')}
                </DText>
              </Pressable>
            ) : null}

            {activeSession?.session_type === 'selection_tutor' ? (
              <StatusChip tone="info">{t('Tutor threads')}</StatusChip>
            ) : null}
          </View>

          {!renamingHeader ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Chat History')}
              onPress={() => router.push('/space/chat-history')}
              style={({ pressed }) => ({
                minHeight: 36,
                paddingHorizontal: 10,
                borderRadius: geometry.radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: pressed ? colors.secondary : colors.card,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              })}
            >
              <History size={15} color={colors.mutedForeground} />
              <DText role="small" style={{ fontFamily: 'GeistMedium' }}>
                {t('History')}
              </DText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('New chat')}
              onPress={() => router.push('/chat')}
              style={({ pressed }) => ({
                minHeight: 36,
                paddingHorizontal: 10,
                borderRadius: geometry.radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: pressed ? colors.secondary : colors.card,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              })}
            >
              <Plus size={15} color={colors.foreground} />
              <DText role="small" style={{ fontFamily: 'GeistMedium' }}>
                {t('New')}
              </DText>
            </Pressable>

            <Pressable
              disabled={!activeSession}
              accessibilityRole="button"
              accessibilityLabel="Conversation actions"
              onPress={() => setHeaderMenuOpen(true)}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: geometry.radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: pressed ? colors.secondary : colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !activeSession ? 0.45 : 1,
              })}
            >
              <MoreHorizontal size={16} color={colors.foreground} />
            </Pressable>
          </View>
          ) : null}
        </View>

        {/* Main Workspace Body */}
        {chat.sessionViewState === 'loading' ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              gap: 14,
            }}
          >
            <LoadingState label={t('Loading conversation')} />
            <Button
              variant="secondary"
              onPress={() => {
                chat.setSessionViewState('ready');
                router.replace('/chat');
              }}
            >
              {t('Cancel')}
            </Button>
          </View>
        ) : chat.sessionViewState === 'error' ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              gap: 14,
            }}
          >
            <View
              style={{
                maxWidth: 420,
                width: '100%',
                borderRadius: geometry.radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 18,
                alignItems: 'center',
                gap: 10,
              }}
            >
              <AlertCircle size={24} color={colors.destructive} />
              <DText role="section">{t('Failed to load session')}</DText>
              <DText role="small" muted style={{ textAlign: 'center' }}>
                {t(
                  "Couldn't reach the server. Please check your connection and retry.",
                )}
              </DText>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Button
                  variant="secondary"
                  onPress={() => chat.setSessionViewState('ready')}
                >
                  {t('Retry')}
                </Button>
                <Button
                  onPress={() => {
                    chat.setSessionViewState('ready');
                    router.replace('/chat');
                  }}
                >
                  {t('New conversation')}
                </Button>
              </View>
            </View>
          </View>
        ) : sessionId && !activeSession ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              gap: 14,
            }}
          >
            <EmptyState title={t('Session not found')} />
            <DText role="small" muted style={{ textAlign: 'center' }}>
              {t('navigation.sessionUnavailable')}
            </DText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                variant="secondary"
                onPress={() => router.push('/space/chat-history')}
              >
                {t('Chat History')}
              </Button>
              <Button onPress={() => router.replace('/chat')}>
                {t('New conversation')}
              </Button>
            </View>
          </View>
        ) : visibleMessages.length === 0 ? (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 24,
            }}
          >
            <View
              style={{
                width: '100%',
                maxWidth: 680,
                alignItems: 'center',
                gap: 18,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Image
                  source={
                    dark
                      ? require('../../../assets/brand/color-logo.png')
                      : require('../../../assets/brand/black-logo.png')
                  }
                  style={{ width: 36, height: 36, resizeMode: 'contain' }}
                />
                <DText
                  role="title"
                  style={{ textAlign: 'center', fontFamily: 'LoraSemiBold' }}
                >
                  {t('What would you like to learn?')}
                </DText>
              </View>

              {sendError ? (
                <View style={{ width: '100%' }}>
                  <InlineAlert tone="danger">{sendError}</InlineAlert>
                </View>
              ) : null}

              <ChatComposer
                value={draft}
                onChangeText={(text) => chat.setDraft(sessionId, text)}
                attachments={attachments}
                onAddAttachment={(cand) => chat.addAttachment(sessionId, cand)}
                onRemoveAttachment={(id) =>
                  chat.removeAttachment(sessionId, id)
                }
                llmOptions={chat.llmOptions}
                selectedModel={effectiveModel}
                modelCatalogState={chat.modelCatalogState}
                onSelectModel={(sel) => chat.selectModel(sessionId, sel)}
                onRefreshModels={chat.refreshModels}
                isStreaming={isStreaming}
                hasMessages={false}
                onSend={handleSend}
                onStop={() => {
                  if (sessionId) chat.stopStreaming(sessionId);
                }}
              />

              <StarterSuggestions
                onPickPrompt={(prompt) => chat.setDraft(sessionId, prompt)}
                personalSuggestions={chat.personalSuggestions}
                personalLoading={chat.personalSuggestionsLoading}
                onRefreshPersonal={chat.refreshPersonalSuggestions}
              />
            </View>
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 18,
                alignItems: 'center',
              }}
            >
              <View style={{ width: '100%', maxWidth: 740, gap: 16 }}>
                <ChatMessageList
                  messages={visibleMessages}
                  siblingsByMessageId={siblingsByMessageId}
                  isStreaming={isStreaming}
                  playingMessageId={chat.playingMessageId}
                  onSwitchBranch={(parentId, childId) => {
                    if (sessionId) {
                      chat.switchBranch(sessionId, parentId, childId);
                    }
                  }}
                  onEditUserMessage={(msgId, content) =>
                    sessionId
                      ? chat.editUserMessage(sessionId, msgId, content)
                      : { ok: false, error: 'Session not found' }
                  }
                  onRetryLastTurn={() => {
                    if (sessionId) chat.retryLastTurn(sessionId);
                  }}
                  onDeleteTurn={(userMsgId) => {
                    if (sessionId) chat.deleteTurn(sessionId, userMsgId);
                  }}
                  onDiscardFailedSubmission={(msgId) => {
                    if (sessionId) {
                      chat.discardFailedSubmission(sessionId, msgId);
                    }
                  }}
                  onRetryFailedSubmission={(msgId) => {
                    if (sessionId) {
                      chat.retryFailedSubmission(sessionId, msgId);
                    }
                  }}
                  onTogglePlayAloud={chat.togglePlayAloud}
                />
              </View>
            </ScrollView>

            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 14,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                backgroundColor: colors.background,
                alignItems: 'center',
              }}
            >
              <View style={{ width: '100%', maxWidth: 740, gap: 8 }}>
                {sendError ? (
                  <InlineAlert tone="danger">{sendError}</InlineAlert>
                ) : null}
                <ChatComposer
                  value={draft}
                  onChangeText={(text) => chat.setDraft(sessionId, text)}
                  attachments={attachments}
                  onAddAttachment={(cand) =>
                    chat.addAttachment(sessionId, cand)
                  }
                  onRemoveAttachment={(id) =>
                    chat.removeAttachment(sessionId, id)
                  }
                  llmOptions={chat.llmOptions}
                  selectedModel={effectiveModel}
                  modelCatalogState={chat.modelCatalogState}
                  onSelectModel={(sel) => chat.selectModel(sessionId, sel)}
                  onRefreshModels={chat.refreshModels}
                  isStreaming={isStreaming}
                  hasMessages
                  onSend={handleSend}
                  onStop={() => {
                    if (sessionId) chat.stopStreaming(sessionId);
                  }}
                />
              </View>
            </View>
          </View>
        )}

        <SessionActionsSheet
          session={activeSession}
          open={headerMenuOpen}
          isRunning={isStreaming}
          includeHeaderExtras
          messages={visibleMessages}
          onClose={() => setHeaderMenuOpen(false)}
          onStartInlineRename={(target) => {
            setHeaderTitleDraft(
              isPlaceholderSessionTitle(target.title) ? '' : target.title,
            );
            setRenamingSessionId(target.session_id);
          }}
          onRename={chat.renameSession}
          onOrganize={chat.organizeSession}
          onDelete={handleDeleteCurrentSession}
        />
      </View>
  );
}
