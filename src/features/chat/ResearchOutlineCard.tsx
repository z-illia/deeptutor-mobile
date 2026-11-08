import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  AlertTriangle,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Microscope,
  Play,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useI18n } from '../../i18n';
import { useFavorites } from '../favorites/FavoritesProvider';
import { ChatMarkdown } from './ChatMarkdown';
import { useChat } from './ChatProvider';
import { type ResearchCardState } from './model';

export function ResearchOutlineCard({
  sessionId,
  messageId,
  research,
}: {
  sessionId: string;
  messageId: number;
  research: ResearchCardState;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { updateResearchOutline, startResearchExecution } = useChat();
  const { openSaveModal } = useFavorites();

  const [outlineExpanded, setOutlineExpanded] = useState(
    research.status !== 'completed',
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleUpdateSubtopic = (
    id: string,
    patch: { title?: string; overview?: string },
  ) => {
    setValidationError(null);
    const next = research.outline.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    );
    updateResearchOutline(sessionId, messageId, next);
  };

  const handleAddSubtopic = () => {
    setValidationError(null);
    const nextIdx = research.outline.length + 1;
    const next = [
      ...research.outline,
      {
        id: `sub-${Date.now()}`,
        title: `${nextIdx}. Additional Sub-topic`,
        overview: 'Investigate supporting theorems, examples, and edge cases.',
      },
    ];
    updateResearchOutline(sessionId, messageId, next);
  };

  const handleDeleteSubtopic = (id: string) => {
    const next = research.outline.filter((item) => item.id !== id);
    updateResearchOutline(sessionId, messageId, next);
  };

  const handleStartResearch = () => {
    const validSubtopics = research.outline.filter(
      (item) => item.title.trim().length > 0,
    );
    if (validSubtopics.length === 0) {
      setValidationError(
        'Add at least one titled sub-topic before starting research.',
      );
      return;
    }
    setValidationError(null);
    startResearchExecution(sessionId, messageId);
    setOutlineExpanded(false);
  };

  const handleSaveResearchToFavorites = () => {
    openSaveModal({
      payload: {
        recordType: 'research',
        title: `Research: ${research.topic.slice(0, 60)}`,
        userQuery: research.topic,
        summary: `${research.outline.length} sub-topics · ${research.citations?.length ?? 0} citations`,
        output: research.reportMarkdown ?? '',
        metadata: {
          session_id: sessionId,
          citation_count: research.citations?.length ?? 0,
        },
      },
    });
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {/* Outline Header */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Toggle research outline')}
        onPress={() => setOutlineExpanded((v) => !v)}
        style={styles.headerRow}
      >
        <View style={styles.headerLeft}>
          <Microscope size={16} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {t("Research Outline · {value1} sub-topics", { value1: String(research.outline.length) })}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  research.status === 'completed'
                    ? colors.primary
                    : colors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color:
                    research.status === 'completed'
                      ? colors.primaryForeground
                      : colors.foreground,
                },
              ]}
            >
              {research.status === 'completed'
                ? t('Synthesized')
                : t('Draft Outline')}
            </Text>
          </View>
        </View>
        {outlineExpanded ? (
          <ChevronUp size={16} color={colors.mutedForeground} />
        ) : (
          <ChevronDown size={16} color={colors.mutedForeground} />
        )}
      </Pressable>

      {/* Editable or Locked Outline Body */}
      {outlineExpanded ? (
        <View style={[styles.outlineBody, { borderTopColor: colors.border }]}>
          {research.outline.map((item) => (
            <View
              key={item.id}
              style={[
                styles.subtopicCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              {research.status === 'completed' ? (
                <>
                  <Text
                    style={[
                      styles.subtopicLockedTitle,
                      { color: colors.foreground },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.subtopicLockedDesc,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {item.overview}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.subtopicEditTopRow}>
                    <TextInput
                      value={item.title}
                      onChangeText={(val) =>
                        handleUpdateSubtopic(item.id, { title: val })
                      }
                      accessibilityLabel={t("Sub-topic title {value1}", { value1: String(item.id) })}
                      style={[
                        styles.subtopicTitleInput,
                        {
                          color: colors.foreground,
                          borderColor: colors.border,
                        },
                      ]}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t("Delete sub-topic {value1}", { value1: String(item.title) })}
                      onPress={() => handleDeleteSubtopic(item.id)}
                      style={styles.deleteSubBtn}
                    >
                      <Trash2 size={14} color={colors.destructive} />
                    </Pressable>
                  </View>
                  <TextInput
                    value={item.overview}
                    onChangeText={(val) =>
                      handleUpdateSubtopic(item.id, { overview: val })
                    }
                    accessibilityLabel={t("Sub-topic overview {value1}", { value1: String(item.id) })}
                    multiline
                    style={[
                      styles.subtopicDescInput,
                      {
                        color: colors.mutedForeground,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                </>
              )}
            </View>
          ))}

          {research.status !== 'completed' ? (
            <View style={styles.outlineFooter}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Add research sub-topic')}
                onPress={handleAddSubtopic}
                style={[styles.addBtn, { borderColor: colors.border }]}
              >
                <Plus size={13} color={colors.foreground} />
                <Text
                  style={[styles.addBtnText, { color: colors.foreground }]}
                >
                  {t('Add sub-topic')}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Start Research')}
                onPress={handleStartResearch}
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
              >
                <Play size={13} color={colors.primaryForeground} />
                <Text
                  style={[
                    styles.startBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {research.status === 'error'
                    ? t('Retry Research')
                    : t('Start Research')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {validationError ? (
            <View
              style={[
                styles.errorBox,
                {
                  borderColor: colors.destructive,
                  backgroundColor: colors.secondary,
                },
              ]}
            >
              <AlertTriangle size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {t(validationError)}
              </Text>
            </View>
          ) : null}

          {research.status === 'error' && research.errorMessage ? (
            <View
              style={[
                styles.errorBox,
                {
                  borderColor: colors.destructive,
                  backgroundColor: colors.secondary,
                },
              ]}
            >
              <AlertTriangle size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {t(research.errorMessage)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Synthesized Report & Citations */}
      {research.status === 'completed' && research.reportMarkdown ? (
        <View style={[styles.reportSection, { borderTopColor: colors.border }]}>
          <ChatMarkdown content={research.reportMarkdown} />

          {research.citations && research.citations.length > 0 ? (
            <View
              style={[
                styles.citationsBox,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[styles.citationsTitle, { color: colors.foreground }]}
              >
                {t("Citations ({value1})", { value1: String(research.citations.length) })}
              </Text>
              {research.citations.map((cit) => (
                <View key={cit.id} style={styles.citationRow}>
                  <Text
                    style={[styles.citationIdx, { color: colors.primary }]}
                  >
                    {`[${cit.index}]`}
                  </Text>
                  <View style={styles.citationTextCol}>
                    <Text
                      style={[
                        styles.citationHeader,
                        { color: colors.foreground },
                      ]}
                    >
                      {cit.title}
                    </Text>
                    <Text
                      style={[
                        styles.citationSource,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {`${cit.source} — "${cit.snippet}"`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.reportActionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Save research report to Favorites')}
              onPress={handleSaveResearchToFavorites}
              style={[styles.saveReportBtn, { borderColor: colors.border }]}
            >
              <BookMarked size={13} color={colors.primary} />
              <Text
                style={[styles.saveReportBtnText, { color: colors.foreground }]}
              >
                {t('Save Report to Favorites')}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  outlineBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    gap: 8,
  },
  subtopicCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  subtopicLockedTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  subtopicLockedDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  subtopicEditTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtopicTitleInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteSubBtn: {
    padding: 4,
  },
  subtopicDescInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  outlineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  reportSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  citationsBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  citationsTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  citationIdx: {
    fontSize: 12,
    fontWeight: '700',
  },
  citationTextCol: {
    flex: 1,
    gap: 2,
  },
  citationHeader: {
    fontSize: 12,
    fontWeight: '600',
  },
  citationSource: {
    fontSize: 11,
    lineHeight: 15,
  },
  reportActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  saveReportBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
