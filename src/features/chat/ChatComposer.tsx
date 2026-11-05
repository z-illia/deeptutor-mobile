import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import {
  ArrowUp,
  Check,
  FileText,
  Mic,
  Paperclip,
  Sparkles,
  Square,
  X,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { geometry } from '@/shared/design/tokens';
import { Dialog } from '@/shared/ui/Dialog';
import { InlineAlert, StatusChip, useFeedback } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import type { CatalogLoadState } from './ChatProvider';
import {
  CHAT_CAPABILITY_OPTIONS,
  type ChatAttachmentSummary,
  type LLMOption,
  type LLMSelection,
} from './model';
import { ModelSelector } from './ModelSelector';
import { SAMPLE_ATTACHMENT_CANDIDATES } from './repository';

export interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  attachments: ChatAttachmentSummary[];
  onAddAttachment: (candidate: ChatAttachmentSummary) => {
    ok: boolean;
    error?: string;
  };
  onRemoveAttachment: (attachmentId: string) => void;
  llmOptions: LLMOption[];
  selectedModel: LLMSelection;
  modelCatalogState: CatalogLoadState;
  onSelectModel: (selection: LLMSelection) => void;
  onRefreshModels: () => void;
  isStreaming: boolean;
  hasMessages: boolean;
  onSend: () => void;
  onStop: () => void;
}

export function ChatComposer({
  value,
  onChangeText,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  llmOptions,
  selectedModel,
  modelCatalogState,
  onSelectModel,
  onRefreshModels,
  isStreaming,
  hasMessages,
  onSend,
  onStop,
}: ChatComposerProps) {
  const { colors } = useDesign();
  const t = useCopy();
  const { notify } = useFeedback();
  const [attachOpen, setAttachOpen] = useState(false);
  const [capabilityOpen, setCapabilityOpen] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const [recordingVoice, setRecordingVoice] = useState(false);

  const canSend =
    !isStreaming && (value.trim().length > 0 || attachments.length > 0);

  const handlePickAttachment = (candidate: ChatAttachmentSummary) => {
    const res = onAddAttachment(candidate);
    if (!res.ok) {
      const msg = t(res.error || 'Unsupported attachment type');
      setAttachmentError(msg);
      notify(msg, 'danger');
      return;
    }
    setAttachmentError('');
    setAttachOpen(false);
    notify(`${t('Attach')}: ${candidate.name}`, 'info');
  };

  const handleToggleVoice = () => {
    if (recordingVoice) {
      setRecordingVoice(false);
      const transcript =
        'Explain the geometric meaning of the determinant of a 2×2 matrix.';
      onChangeText(value ? `${value} ${transcript}` : transcript);
      notify(t('Record voice'), 'success');
    } else {
      setRecordingVoice(true);
      notify(`${t('Record voice')}…`, 'info');
    }
  };

  return (
    <View
      style={{
        width: '100%',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 10,
        gap: 10,
      }}
    >
      {attachments.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {attachments.map((att) => (
            <View
              key={att.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingLeft: 10,
                paddingRight: 6,
                paddingVertical: 5,
                borderRadius: geometry.radius.md,
                backgroundColor: colors.secondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <FileText size={14} color={colors.primary} />
              <DText role="small" style={{ fontFamily: 'GeistMedium' }}>
                {att.name}
              </DText>
              <DText role="small" muted>
                {att.sizeLabel}
              </DText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t('Remove attachment')} ${att.name}`}
                onPress={() => onRemoveAttachment(att.id)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={13} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {attachmentError ? (
        <InlineAlert tone="danger">{attachmentError}</InlineAlert>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={
          hasMessages
            ? t('Ask anything about this conversation.')
            : t('Type a message...')
        }
        placeholderTextColor={colors.mutedForeground}
        multiline
        accessibilityLabel={t('Type a message...')}
        style={{
          minHeight: 48,
          maxHeight: 160,
          color: colors.foreground,
          fontFamily: 'Geist',
          fontSize: 15,
          lineHeight: 22,
          textAlignVertical: 'top',
          paddingVertical: 2,
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Attach files')}
            onPress={() => {
              setAttachmentError('');
              setAttachOpen(true);
            }}
            style={({ pressed }) => ({
              minHeight: 36,
              paddingHorizontal: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: pressed ? colors.secondary : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            })}
          >
            <Paperclip size={15} color={colors.mutedForeground} />
            <DText role="small" muted>
              {t('Attach')}
            </DText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Capabilities')}
            onPress={() => setCapabilityOpen(true)}
            style={({ pressed }) => ({
              minHeight: 36,
              paddingHorizontal: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: pressed ? colors.secondary : colors.accent,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            })}
          >
            <Sparkles size={14} color={colors.primary} />
            <DText role="small" style={{ fontFamily: 'GeistMedium' }}>
              {t('Chat')}
            </DText>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ModelSelector
            options={llmOptions}
            selectedModel={selectedModel}
            state={modelCatalogState}
            disabled={isStreaming}
            onSelect={onSelectModel}
            onRefresh={onRefreshModels}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Record voice')}
            accessibilityState={{ selected: recordingVoice }}
            onPress={handleToggleVoice}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: recordingVoice
                ? colors.warningSurface
                : pressed
                  ? colors.secondary
                  : 'transparent',
            })}
          >
            <Mic
              size={16}
              color={recordingVoice ? colors.warning : colors.mutedForeground}
            />
          </Pressable>

          {isStreaming ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Stop generating')}
              onPress={onStop}
              style={({ pressed }) => ({
                height: 36,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: colors.foreground,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Square size={12} color={colors.background} />
              <DText
                role="section"
                style={{ color: colors.background }}
              >
                {t('Stop')}
              </DText>
            </Pressable>
          ) : (
            <Pressable
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel={t('Send')}
              onPress={onSend}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 999,
                backgroundColor: canSend ? colors.primary : colors.secondary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !canSend ? 0.45 : pressed ? 0.85 : 1,
              })}
            >
              <ArrowUp
                size={18}
                color={
                  canSend ? colors.primaryForeground : colors.mutedForeground
                }
              />
            </Pressable>
          )}
        </View>
      </View>

      <Dialog
        open={attachOpen}
        title={t('Add files & context')}
        onClose={() => setAttachOpen(false)}
      >
        <ScrollView style={{ maxHeight: 380 }}>
          <View style={{ gap: 8 }}>
            <DText role="small" muted>
              {t('Images, Office docs, code & text')}
            </DText>
            {SAMPLE_ATTACHMENT_CANDIDATES.map((candidate) => (
              <Pressable
                key={candidate.id}
                accessibilityRole="button"
                accessibilityLabel={`${candidate.name} · ${candidate.sizeLabel}`}
                onPress={() => handlePickAttachment(candidate)}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: geometry.radius.md,
                  borderWidth: 1,
                  borderColor:
                    candidate.status === 'invalid'
                      ? colors.warning
                      : colors.border,
                  backgroundColor: pressed ? colors.secondary : colors.card,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <DText role="label">
                    {candidate.name} · {candidate.sizeLabel}
                  </DText>
                  <DText role="small" muted>
                    {candidate.status === 'invalid'
                      ? t(candidate.errorReason || 'Unsupported attachment type')
                      : candidate.mimeType}
                  </DText>
                </View>
                <StatusChip
                  tone={candidate.status === 'invalid' ? 'warning' : 'info'}
                >
                  {candidate.status === 'invalid'
                    ? t('Needs attention')
                    : t('Ready')}
                </StatusChip>
              </Pressable>
            ))}

            <View
              style={{
                marginTop: 6,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                gap: 6,
              }}
            >
              <DText role="section" muted>
                {t('Context')} (M3.2)
              </DText>
              {[
                { label: 'Select History Sessions', milestone: 'M3.2' },
                { label: 'Select Notebook Records', milestone: 'M3.2' },
                { label: 'Select Question Bank Entries', milestone: 'M3.2' },
              ].map((ctxItem) => (
                <Pressable
                  key={ctxItem.label}
                  accessibilityRole="button"
                  accessibilityLabel={t(ctxItem.label)}
                  onPress={() => {
                    setAttachOpen(false);
                    notify(
                      `${t(ctxItem.label)} — ${t('Coming soon')} (${ctxItem.milestone})`,
                      'info',
                    );
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    borderRadius: geometry.radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.secondary,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <DText role="small">{t(ctxItem.label)}</DText>
                  <StatusChip tone="info">{ctxItem.milestone}</StatusChip>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </Dialog>

      <Dialog
        open={capabilityOpen}
        title={t('Capabilities')}
        onClose={() => setCapabilityOpen(false)}
      >
        <ScrollView style={{ maxHeight: 380 }}>
          <View style={{ gap: 8 }}>
            {CHAT_CAPABILITY_OPTIONS.map((cap) => {
              const isChat = cap.id === 'chat';
              return (
                <Pressable
                  key={cap.id}
                  accessibilityRole="button"
                  accessibilityLabel={t(cap.labelKey)}
                  accessibilityState={{ selected: isChat }}
                  onPress={() => {
                    setCapabilityOpen(false);
                    if (!isChat) {
                      notify(
                        `${t(cap.labelKey)} — ${t('Coming soon')} (${cap.availableInMilestone})`,
                        'info',
                      );
                    }
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: geometry.radius.md,
                    borderWidth: 1,
                    borderColor: isChat ? colors.primary : colors.border,
                    backgroundColor: isChat ? colors.accent : colors.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <DText role={isChat ? 'section' : 'label'}>
                        {t(cap.labelKey)}
                      </DText>
                      {!isChat ? (
                        <StatusChip tone="info">
                          {cap.availableInMilestone}
                        </StatusChip>
                      ) : null}
                    </View>
                    <DText role="small" muted>
                      {t(cap.descriptionKey)}
                    </DText>
                  </View>
                  {isChat ? <Check size={16} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Dialog>
    </View>
  );
}
