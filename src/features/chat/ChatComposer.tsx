import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import {
  ArrowUp,
  AtSign,
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
import { CapabilityConfigCard } from './CapabilityConfigCard';
import { useChat, type CatalogLoadState } from './ChatProvider';
import { ComposerResourcesSheet } from './ComposerResourcesSheet';
import { ContextReferenceTree } from './ContextReferenceTree';
import {
  CHAT_CAPABILITY_OPTIONS,
  type ChatAttachmentSummary,
  type LLMOption,
  type LLMSelection,
} from './model';
import { ModelSelector } from './ModelSelector';
import { SAMPLE_ATTACHMENT_CANDIDATES } from './repository';

export interface ChatComposerProps {
  sessionId?: string | null;
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
  sessionId = null,
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
  const {
    getReferences,
    removeReference,
    getActiveCapability,
    setActiveCapability,
    isCapabilityConfirmed,
  } = useChat();

  const [attachOpen, setAttachOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [capabilityOpen, setCapabilityOpen] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const [recordingVoice, setRecordingVoice] = useState(false);

  const references = getReferences(sessionId);
  const activeCapability = getActiveCapability(sessionId);
  const capabilityConfirmed = isCapabilityConfirmed(sessionId);
  const activeCapOption =
    CHAT_CAPABILITY_OPTIONS.find((c) => c.id === activeCapability) ??
    CHAT_CAPABILITY_OPTIONS[0];

  const canSend =
    !isStreaming &&
    capabilityConfirmed &&
    (value.trim().length > 0 ||
      attachments.length > 0 ||
      references.length > 0);

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
    <View style={{ width: '100%' }}>
      <CapabilityConfigCard sessionId={sessionId} compact />

      <ContextReferenceTree
        items={references}
        direction="up"
        onRemove={(refId) => removeReference(sessionId, refId)}
      />

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
          <InlineAlert tone="danger">{t(attachmentError)}</InlineAlert>
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
              accessibilityLabel={t('Reference Context (@mention)')}
              onPress={() => setResourcesOpen(true)}
              style={({ pressed }) => ({
                minHeight: 36,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor:
                  references.length > 0 ? colors.primary : colors.border,
                backgroundColor:
                  references.length > 0
                    ? colors.secondary
                    : pressed
                      ? colors.secondary
                      : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              })}
            >
              <AtSign
                size={14}
                color={
                  references.length > 0
                    ? colors.primary
                    : colors.mutedForeground
                }
              />
              <DText
                role="small"
                muted={references.length === 0}
                style={
                  references.length > 0
                    ? { color: colors.primary, fontFamily: 'GeistMedium' }
                    : undefined
                }
              >
                {references.length > 0
                  ? `@Context (${references.length})`
                  : '@Context'}
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
                borderColor:
                  activeCapability !== 'chat' ? colors.primary : colors.border,
                backgroundColor: pressed ? colors.secondary : colors.accent,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              })}
            >
              <Sparkles size={14} color={colors.primary} />
              <DText role="small" style={{ fontFamily: 'GeistMedium' }}>
                {t(activeCapOption.labelKey)}
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
                <DText role="section" style={{ color: colors.background }}>
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
                        ? t(
                            candidate.errorReason ||
                              'Unsupported attachment type',
                          )
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
                  {t('Context')} (@mention)
                </DText>
                {[
                  { label: 'Select Knowledge Bases & Notes' },
                  { label: 'Select Favorites Snapshots' },
                  { label: 'Select Chat History Sessions' },
                ].map((ctxItem) => (
                  <Pressable
                    key={ctxItem.label}
                    accessibilityRole="button"
                    accessibilityLabel={t(ctxItem.label)}
                    onPress={() => {
                      setAttachOpen(false);
                      setResourcesOpen(true);
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
                    <StatusChip tone="info">@mention</StatusChip>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </Dialog>

        <ComposerResourcesSheet
          visible={resourcesOpen}
          sessionId={sessionId}
          onClose={() => setResourcesOpen(false)}
        />

        <Dialog
          open={capabilityOpen}
          title={t('Capabilities')}
          onClose={() => setCapabilityOpen(false)}
        >
          <ScrollView style={{ maxHeight: 380 }}>
            <View style={{ gap: 8 }}>
              {CHAT_CAPABILITY_OPTIONS.map((cap) => {
                const isSelected = activeCapability === cap.id;
                const isDeferredM5 = cap.availableInMilestone === 'M5';
                return (
                  <Pressable
                    key={cap.id}
                    accessibilityRole="button"
                    accessibilityLabel={t(cap.labelKey)}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      setCapabilityOpen(false);
                      if (isDeferredM5) {
                        notify(
                          `${t(cap.labelKey)} — ${t('Coming soon')} (${cap.availableInMilestone})`,
                          'info',
                        );
                        return;
                      }
                      setActiveCapability(sessionId, cap.id);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: geometry.radius.md,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.accent : colors.card,
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
                        <DText role={isSelected ? 'section' : 'label'}>
                          {t(cap.labelKey)}
                        </DText>
                        {isDeferredM5 ? (
                          <StatusChip tone="info">
                            {cap.availableInMilestone}
                          </StatusChip>
                        ) : null}
                      </View>
                      <DText role="small" muted>
                        {t(cap.descriptionKey)}
                      </DText>
                    </View>
                    {isSelected ? (
                      <Check size={16} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Dialog>
      </View>
    </View>
  );
}
