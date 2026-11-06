import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  AlertCircle,
  BookMarked,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileCode,
  FileText,
  Pencil,
  RotateCcw,
  Square,
  Trash2,
  Volume2,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { useFavorites } from '@/features/favorites/FavoritesProvider';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha, geometry } from '@/shared/design/tokens';
import { Button } from '@/shared/ui/Controls';
import { InlineAlert, StatusChip, useFeedback } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { AskUserQuestionCard } from './AskUserQuestionCard';
import { ContextReferenceTree } from './ContextReferenceTree';
import { QuizViewerCard } from './QuizViewerCard';
import { ResearchOutlineCard } from './ResearchOutlineCard';
import type { ChatMessageItem, SiblingInfo } from './model';

export interface ChatMessageListProps {
  sessionId?: string | null;
  messages: ChatMessageItem[];
  siblingsByMessageId: Map<number, SiblingInfo>;
  isStreaming: boolean;
  playingMessageId: number | null;
  onSwitchBranch: (parentMessageId: number | null, childId: number) => void;
  onEditUserMessage: (
    messageId: number,
    newContent: string,
  ) => { ok: boolean; error?: string };
  onRetryLastTurn: () => void;
  onDeleteTurn: (userMessageId: number) => void;
  onDiscardFailedSubmission: (messageId: number) => void;
  onRetryFailedSubmission: (messageId: number) => void;
  onTogglePlayAloud: (messageId: number) => void;
}

type MarkdownSegment =
  | { kind: 'code'; language: string; code: string }
  | { kind: 'text'; lines: string[] };

function parseMarkdownSegments(raw: string): MarkdownSegment[] {
  const lines = raw.split('\n');
  const segments: MarkdownSegment[] = [];
  let inCode = false;
  let codeLang = '';
  let codeLines: string[] = [];
  let textLines: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        if (textLines.length > 0) {
          segments.push({ kind: 'text', lines: textLines });
          textLines = [];
        }
        inCode = true;
        codeLang = line.trim().slice(3).trim() || 'code';
        codeLines = [];
      } else {
        segments.push({
          kind: 'code',
          language: codeLang,
          code: codeLines.join('\n'),
        });
        inCode = false;
        codeLang = '';
        codeLines = [];
      }
    } else if (inCode) {
      codeLines.push(line);
    } else {
      textLines.push(line);
    }
  }

  if (inCode) {
    segments.push({
      kind: 'code',
      language: codeLang || 'code',
      code: codeLines.join('\n'),
    });
  } else if (textLines.length > 0) {
    segments.push({ kind: 'text', lines: textLines });
  }

  return segments;
}

function BranchNavigator({
  info,
  disabled,
  onSelect,
}: {
  info: SiblingInfo;
  disabled?: boolean;
  onSelect: (parentMessageId: number | null, childId: number) => void;
}) {
  const { colors } = useDesign();
  const t = useCopy();
  const prevId = info.index > 1 ? info.siblingIds[info.index - 2] : undefined;
  const nextId =
    info.index < info.total ? info.siblingIds[info.index] : undefined;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Pressable
        disabled={disabled || prevId === undefined}
        accessibilityRole="button"
        accessibilityLabel={t('Previous branch')}
        onPress={() => {
          if (prevId !== undefined) onSelect(info.parentId, prevId);
        }}
        style={{
          width: 26,
          height: 26,
          borderRadius: geometry.radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled || prevId === undefined ? 0.35 : 1,
        }}
      >
        <ChevronLeft size={14} color={colors.mutedForeground} />
      </Pressable>
      <DText role="small" muted>
        {info.index} / {info.total}
      </DText>
      <Pressable
        disabled={disabled || nextId === undefined}
        accessibilityRole="button"
        accessibilityLabel={t('Next branch')}
        onPress={() => {
          if (nextId !== undefined) onSelect(info.parentId, nextId);
        }}
        style={{
          width: 26,
          height: 26,
          borderRadius: geometry.radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled || nextId === undefined ? 0.35 : 1,
        }}
      >
        <ChevronRight size={14} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}

export function ChatMessageList({
  sessionId = 'session-general-1',
  messages,
  siblingsByMessageId,
  isStreaming,
  playingMessageId,
  onSwitchBranch,
  onEditUserMessage,
  onRetryLastTurn,
  onDeleteTurn,
  onDiscardFailedSubmission,
  onRetryFailedSubmission,
  onTogglePlayAloud,
}: ChatMessageListProps) {
  const { colors } = useDesign();
  const t = useCopy();
  const router = useRouter();
  const { notify } = useFeedback();
  const { settings } = useFixtures();
  const { openSaveModal } = useFavorites();
  const resolvedSessionId = sessionId ?? 'session-general-1';
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [editError, setEditError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteUserMsgId, setConfirmDeleteUserMsgId] = useState<
    number | null
  >(null);

  const scale = settings.active.scale;
  const lineSpacing = settings.active.spacing;
  const showLineNumbers = settings.active.lineNumbers;
  const wrapLines = settings.active.wrap;
  const learningFontSize = (16 * scale) / 100;
  const learningLineHeight =
    learningFontSize *
    ({ compact: 1.5, normal: 1.75, relaxed: 2 }[lineSpacing] ?? 1.75);

  const handleCopy = (key: string, text: string) => {
    void Clipboard.setStringAsync(text).catch(() => {});
    setCopiedId(key);
    notify(t('Copied'), 'success');
    setTimeout(() => {
      setCopiedId((prev) => (prev === key ? null : prev));
    }, 1200);
  };

  return (
    <View style={{ gap: 18 }}>
      {messages.map((msg, idx) => {
        const siblingInfo = siblingsByMessageId.get(msg.id);

        if (msg.role === 'user') {
          const isEditing = editingId === msg.id;

          if (isEditing) {
            return (
              <View
                key={msg.id}
                style={{
                  alignSelf: 'flex-end',
                  width: '100%',
                  maxWidth: 640,
                  borderRadius: geometry.radius.lg,
                  borderWidth: 1,
                  borderColor: colors.ring,
                  backgroundColor: colors.secondary,
                  padding: 14,
                  gap: 10,
                }}
              >
                <TextInput
                  value={editDraft}
                  onChangeText={setEditDraft}
                  multiline
                  accessibilityLabel="Edit message input"
                  style={{
                    minHeight: 72,
                    color: colors.foreground,
                    fontFamily: 'Geist',
                    fontSize: 15,
                    textAlignVertical: 'top',
                  }}
                />
                {editError ? (
                  <InlineAlert tone="danger">{editError}</InlineAlert>
                ) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <DText role="small" muted style={{ flex: 1 }}>
                    {t('Use the arrows below to switch between branches.')}
                  </DText>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => {
                        setEditingId(null);
                        setEditError('');
                      }}
                    >
                      {t('Cancel')}
                    </Button>
                    <Button
                      size="sm"
                      disabled={!editDraft.trim() || isStreaming}
                      onPress={() => {
                        const res = onEditUserMessage(msg.id, editDraft);
                        if (!res.ok) {
                          setEditError(t(res.error || 'Failed to save'));
                          return;
                        }
                        setEditingId(null);
                        setEditError('');
                      }}
                    >
                      {t('Send')}
                    </Button>
                  </View>
                </View>
              </View>
            );
          }

          return (
            <View
              key={msg.id}
              style={{
                alignItems: 'flex-end',
                gap: 6,
              }}
            >
              <View
                style={{
                  maxWidth: '88%',
                  borderRadius: geometry.radius.lg,
                  backgroundColor: colors.secondary,
                  borderWidth: msg.failedSubmission ? 1 : 0,
                  borderColor: msg.failedSubmission
                    ? colors.destructive
                    : 'transparent',
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  gap: 8,
                }}
              >
                {msg.attachments && msg.attachments.length > 0 ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    {msg.attachments.map((att) => (
                      <Pressable
                        key={att.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Preview attachment ${att.name}`}
                        onPress={() =>
                          router.push(
                            `/ui/file-preview?fileId=${encodeURIComponent(att.name)}&sessionId=${encodeURIComponent(resolvedSessionId)}` as never,
                          )
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: geometry.radius.sm,
                          backgroundColor: colors.card,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <FileText size={13} color={colors.primary} />
                        <DText role="small">{att.name}</DText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                <DText
                  role="learning"
                  style={{
                    fontSize: learningFontSize,
                    lineHeight: learningLineHeight,
                  }}
                >
                  {msg.content}
                </DText>
              </View>

              {msg.references && msg.references.length > 0 ? (
                <ContextReferenceTree
                  items={msg.references}
                  direction="down"
                />
              ) : null}

              {msg.failedSubmission ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <StatusChip tone="danger">{t('Not sent')}</StatusChip>
                  {msg.error ? (
                    <DText role="small" style={{ color: colors.destructive }}>
                      {t(msg.error)}
                    </DText>
                  ) : null}
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => onRetryFailedSubmission(msg.id)}
                  >
                    {t('Retry')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => onDiscardFailedSubmission(msg.id)}
                  >
                    {t('Discard unsent draft')}
                  </Button>
                </View>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {siblingInfo ? (
                  <BranchNavigator
                    info={siblingInfo}
                    disabled={isStreaming}
                    onSelect={onSwitchBranch}
                  />
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Copy user message"
                  onPress={() => handleCopy(`user-${msg.id}`, msg.content)}
                  style={{
                    minHeight: 28,
                    paddingHorizontal: 8,
                    borderRadius: geometry.radius.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {copiedId === `user-${msg.id}` ? (
                    <Check size={13} color={colors.success} />
                  ) : (
                    <Copy size={13} color={colors.mutedForeground} />
                  )}
                  <DText role="small" muted>
                    {t('Copy')}
                  </DText>
                </Pressable>

                <Pressable
                  disabled={isStreaming}
                  accessibilityRole="button"
                  accessibilityLabel={t('Edit')}
                  onPress={() => {
                    setEditingId(msg.id);
                    setEditDraft(msg.content);
                    setEditError('');
                  }}
                  style={{
                    minHeight: 28,
                    paddingHorizontal: 8,
                    borderRadius: geometry.radius.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    opacity: isStreaming ? 0.4 : 1,
                  }}
                >
                  <Pencil size={13} color={colors.mutedForeground} />
                  <DText role="small" muted>
                    {t('Edit')}
                  </DText>
                </Pressable>
              </View>
            </View>
          );
        }

        // Assistant message
        const segments = parseMarkdownSegments(msg.content);
        const parentUserMsg =
          msg.parentMessageId !== null
            ? messages.find(
                (m) => m.id === msg.parentMessageId && m.role === 'user',
              )
            : messages
                .slice(0, idx)
                .reverse()
                .find((m) => m.role === 'user');
        const isLastAssistant = idx === messages.length - 1;
        const isPlaying = playingMessageId === msg.id;

        return (
          <View
            key={msg.id}
            style={{
              gap: 10,
              paddingVertical: 4,
            }}
          >
            {segments.map((seg, segIdx) => {
              if (seg.kind === 'code') {
                const codeLines = seg.code.split('\n');
                const copyKey = `code-${msg.id}-${segIdx}`;
                return (
                  <View
                    key={copyKey}
                    style={{
                      borderRadius: geometry.radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.secondary,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        backgroundColor: colors.card,
                      }}
                    >
                      <DText role="code" muted>
                        {seg.language}
                      </DText>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('Copy code')}
                        onPress={() => handleCopy(copyKey, seg.code)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        {copiedId === copyKey ? (
                          <Check size={13} color={colors.success} />
                        ) : (
                          <Copy size={13} color={colors.mutedForeground} />
                        )}
                        <DText role="small" muted>
                          {copiedId === copyKey ? t('Copied') : t('Copy code')}
                        </DText>
                      </Pressable>
                    </View>
                    <View style={{ padding: 12, gap: 2 }}>
                      {codeLines.map((line, lineIdx) => (
                        <View
                          key={`${lineIdx}-${line}`}
                          style={{
                            flexDirection: 'row',
                            gap: 10,
                          }}
                        >
                          {showLineNumbers ? (
                            <DText
                              role="code"
                              muted
                              style={{ minWidth: 22, textAlign: 'right' }}
                            >
                              {lineIdx + 1}
                            </DText>
                          ) : null}
                          <DText
                            role="code"
                            numberOfLines={wrapLines ? undefined : 1}
                            style={{ flex: 1 }}
                          >
                            {line}
                          </DText>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              }

              return (
                <View key={`text-${msg.id}-${segIdx}`} style={{ gap: 6 }}>
                  {seg.lines.map((line, lineIdx) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;
                    if (trimmedLine.startsWith('### ')) {
                      return (
                        <DText
                          key={`${lineIdx}-${trimmedLine}`}
                          role="section"
                          style={{ marginTop: 4 }}
                        >
                          {trimmedLine.slice(4)}
                        </DText>
                      );
                    }
                    if (trimmedLine.startsWith('## ')) {
                      return (
                        <DText
                          key={`${lineIdx}-${trimmedLine}`}
                          role="section"
                          style={{ marginTop: 6 }}
                        >
                          {trimmedLine.slice(3)}
                        </DText>
                      );
                    }
                    return (
                      <DText
                        key={`${lineIdx}-${trimmedLine}`}
                        role="learning"
                        style={{
                          fontSize: learningFontSize,
                          lineHeight: learningLineHeight,
                        }}
                      >
                        {trimmedLine}
                      </DText>
                    );
                  })}
                </View>
              );
            })}

            {msg.artifacts && msg.artifacts.length > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                {msg.artifacts.map((art) => (
                  <Pressable
                    key={art.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Preview artifact ${art.filename}`}
                    onPress={() =>
                      router.push(
                        `/ui/file-preview?fileId=${encodeURIComponent(art.id)}&sessionId=${encodeURIComponent(resolvedSessionId)}` as never,
                      )
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: geometry.radius.sm,
                      backgroundColor: colors.secondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <FileCode size={13} color={colors.primary} />
                    <DText role="small" style={{ fontFamily: 'GeistMedium' }}>
                      {art.filename}
                    </DText>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {msg.askUser ? (
              <AskUserQuestionCard
                sessionId={resolvedSessionId}
                messageId={msg.id}
                card={msg.askUser}
              />
            ) : null}

            {msg.quiz && msg.quiz.length > 0 ? (
              <QuizViewerCard
                sessionId={resolvedSessionId}
                messageId={msg.id}
                questions={msg.quiz}
              />
            ) : null}

            {msg.research ? (
              <ResearchOutlineCard
                sessionId={resolvedSessionId}
                messageId={msg.id}
                research={msg.research}
              />
            ) : null}

            {msg.isStreaming ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <StatusChip tone="info">{t('Streaming…')}</StatusChip>
              </View>
            ) : null}

            {msg.stopped && !msg.isStreaming ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Square size={11} color={colors.mutedForeground} />
                <DText role="small" muted>
                  Stopped
                </DText>
              </View>
            ) : null}

            {msg.error && !msg.isStreaming ? (
              <View
                style={{
                  borderRadius: geometry.radius.md,
                  borderWidth: 1,
                  borderColor: colors.destructive,
                  backgroundColor: alpha(colors.destructive, 0.1),
                  padding: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} color={colors.destructive} />
                  <DText role="small" style={{ flex: 1 }}>
                    {t(msg.error)}
                  </DText>
                </View>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={onRetryLastTurn}
                >
                  {t('Retry')}
                </Button>
              </View>
            ) : null}

            {!msg.isStreaming ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  paddingTop: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}
                >
                  {siblingInfo ? (
                    <BranchNavigator
                      info={siblingInfo}
                      disabled={isStreaming}
                      onSelect={onSwitchBranch}
                    />
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Copy')}
                    onPress={() => handleCopy(`assistant-${msg.id}`, msg.content)}
                    style={{
                      minHeight: 30,
                      paddingHorizontal: 8,
                      borderRadius: geometry.radius.sm,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {copiedId === `assistant-${msg.id}` ? (
                      <Check size={13} color={colors.success} />
                    ) : (
                      <Copy size={13} color={colors.mutedForeground} />
                    )}
                    <DText role="small" muted>
                      {copiedId === `assistant-${msg.id}`
                        ? t('Copied')
                        : t('Copy')}
                    </DText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Save to Favorites')}
                    onPress={() =>
                      openSaveModal({
                        payload: {
                          recordType:
                            msg.capability === 'question'
                              ? 'question'
                              : msg.capability === 'research'
                                ? 'research'
                                : msg.capability === 'solve'
                                  ? 'solve'
                                  : 'chat',
                          title: (
                            parentUserMsg?.content || 'Assistant Reply'
                          ).slice(0, 72),
                          userQuery: parentUserMsg?.content ?? '',
                          output: msg.content,
                          metadata: {
                            session_id: resolvedSessionId,
                            message_id: msg.id,
                          },
                        },
                      })
                    }
                    style={{
                      minHeight: 30,
                      paddingHorizontal: 8,
                      borderRadius: geometry.radius.sm,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <BookMarked size={13} color={colors.mutedForeground} />
                    <DText role="small" muted>
                      {t('Save')}
                    </DText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isPlaying ? t('Stop') : t('Listen')}
                    onPress={() => {
                      onTogglePlayAloud(msg.id);
                      notify(
                        isPlaying ? t('Stop') : t('Listen'),
                        'info',
                      );
                    }}
                    style={{
                      minHeight: 30,
                      paddingHorizontal: 8,
                      borderRadius: geometry.radius.sm,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: isPlaying
                        ? colors.accent
                        : 'transparent',
                    }}
                  >
                    {isPlaying ? (
                      <Square size={12} color={colors.primary} />
                    ) : (
                      <Volume2 size={13} color={colors.mutedForeground} />
                    )}
                    <DText role="small" muted={!isPlaying}>
                      {isPlaying ? t('Stop') : t('Listen')}
                    </DText>
                  </Pressable>

                  {isLastAssistant ? (
                    <Pressable
                      disabled={isStreaming}
                      accessibilityRole="button"
                      accessibilityLabel={t('Regenerate')}
                      onPress={onRetryLastTurn}
                      style={{
                        minHeight: 30,
                        paddingHorizontal: 8,
                        borderRadius: geometry.radius.sm,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <RotateCcw size={13} color={colors.mutedForeground} />
                      <DText role="small" muted>
                        {t('Regenerate')}
                      </DText>
                    </Pressable>
                  ) : null}

                  {parentUserMsg ? (
                    confirmDeleteUserMsgId === parentUserMsg.id ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: geometry.radius.sm,
                          backgroundColor: alpha(colors.destructive, 0.12),
                        }}
                      >
                        <DText role="small" style={{ color: colors.destructive }}>
                          {t('Delete this turn?')}
                        </DText>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Confirm delete turn"
                          onPress={() => {
                            onDeleteTurn(parentUserMsg.id);
                            setConfirmDeleteUserMsgId(null);
                            notify(t('Delete'), 'info');
                          }}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: geometry.radius.sm,
                            backgroundColor: colors.destructive,
                          }}
                        >
                          <DText
                            role="section"
                            style={{ color: colors.destructiveForeground }}
                          >
                            {t('Delete')}
                          </DText>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Cancel delete turn"
                          onPress={() => setConfirmDeleteUserMsgId(null)}
                          style={{
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                          }}
                        >
                          <DText role="small" muted>
                            {t('Cancel')}
                          </DText>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Delete turn"
                        onPress={() =>
                          setConfirmDeleteUserMsgId(parentUserMsg.id)
                        }
                        style={{
                          minHeight: 30,
                          paddingHorizontal: 8,
                          borderRadius: geometry.radius.sm,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Trash2 size={13} color={colors.mutedForeground} />
                        <DText role="small" muted>
                          {t('Delete')}
                        </DText>
                      </Pressable>
                    )
                  ) : null}
                </View>

                {msg.usage ? (
                  <DText role="small" muted>
                    {msg.usage.model} · {msg.usage.totalTokens} {t('tokens')} ·{' '}
                    {msg.usage.latencySeconds}s
                  </DText>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
