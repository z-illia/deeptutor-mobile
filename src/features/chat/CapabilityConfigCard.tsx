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
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Microscope,
  Sliders,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useI18n } from '../../i18n';
import { useChat } from './ChatProvider';
import {
  type QuizDifficulty,
  type QuizQuestionType,
  type ResearchDepth,
  type ResearchMode,
} from './model';

const QUIZ_TYPES: { id: QuizQuestionType; label: string }[] = [
  { id: 'choice', label: 'Choice' },
  { id: 'true_false', label: 'True / False' },
  { id: 'fill_blank', label: 'Fill Blank' },
  { id: 'written', label: 'Written' },
];

const QUIZ_DIFFICULTIES: { id: QuizDifficulty; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

const RESEARCH_MODES: { id: ResearchMode; label: string }[] = [
  { id: 'study_notes', label: 'Study Notes' },
  { id: 'report', label: 'Report' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'learning_path', label: 'Learning Path' },
];

const RESEARCH_DEPTHS: { id: ResearchDepth; label: string }[] = [
  { id: 'quick', label: 'Quick' },
  { id: 'standard', label: 'Standard' },
  { id: 'deep', label: 'Deep' },
  { id: 'manual', label: 'Manual' },
];

export function CapabilityConfigCard({
  sessionId,
  compact = false,
}: {
  sessionId: string | null;
  compact?: boolean;
}) {
  const { getActiveCapability } = useChat();
  const capability = getActiveCapability(sessionId);

  if (capability !== 'question' && capability !== 'research') {
    return null;
  }

  return (
    <CapabilityConfigCardBody
      key={`${sessionId ?? 'new'}:${capability}`}
      sessionId={sessionId}
      capability={capability}
      compact={compact}
    />
  );
}

function CapabilityConfigCardBody({
  sessionId,
  capability,
  compact = false,
}: {
  sessionId: string | null;
  capability: 'question' | 'research';
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const {
    setActiveCapability,
    quizConfig,
    updateQuizConfig,
    researchConfig,
    updateResearchConfig,
    isCapabilityConfirmed,
    confirmCapabilityConfig,
  } = useChat();

  const confirmed = isCapabilityConfirmed(sessionId);
  const [expanded, setExpanded] = useState(!confirmed || !compact);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isQuiz = capability === 'question';
  const summaryText = isQuiz
    ? [t(quizConfig.mode === 'mimic' ? 'Mimic Paper' : 'Custom Quiz'), t('Questions ({value1})', { value1: quizConfig.totalCount }), t(QUIZ_DIFFICULTIES.find(item => item.id === quizConfig.difficulty)?.label ?? 'Auto'), `${t('Type')}: ${quizConfig.selectedTypes.length}`].join(' · ')
    : [t(RESEARCH_MODES.find(item => item.id === researchConfig.mode)?.label ?? 'Report'), t(RESEARCH_DEPTHS.find(item => item.id === researchConfig.depth)?.label ?? 'Standard'), t('Sub-topics ({value1})', { value1: researchConfig.subtopics }), t('Iterations ({value1})', { value1: researchConfig.iterations })].join(' · ');

  const translateError = (message: string) => {
    const counts = message.match(/^Type mix sum \((\d+)\) must equal total count \((\d+)\)\.$/);
    return counts ? t('Type mix sum ({sum}) must equal total count ({total}).', { sum: counts[1], total: counts[2] }) : t(message);
  };

  const toggleQuizType = (qType: QuizQuestionType) => {
    setValidationErrors([]);
    const exists = quizConfig.selectedTypes.includes(qType);
    const nextTypes = exists
      ? quizConfig.selectedTypes.filter((item) => item !== qType)
      : [...quizConfig.selectedTypes, qType];
    updateQuizConfig({ selectedTypes: nextTypes });
  };

  const handleConfirm = () => {
    const res = confirmCapabilityConfig(sessionId);
    setValidationErrors(res.errors);
    if (res.ok && compact) {
      setExpanded(false);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: confirmed ? colors.border : colors.primary,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Toggle capability configuration card')}
          onPress={() => setExpanded((v) => !v)}
          style={styles.headerMain}
        >
          <View
            style={[styles.iconBox, { backgroundColor: colors.secondary }]}
          >
            {isQuiz ? (
              <HelpCircle size={15} color={colors.primary} />
            ) : (
              <Microscope size={15} color={colors.primary} />
            )}
          </View>
          <View style={styles.headerTextCol}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {isQuiz
                  ? t('Quiz Generation Settings')
                  : t('Deep Research Settings')}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: confirmed
                      ? colors.secondary
                      : colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: confirmed
                        ? colors.foreground
                        : colors.primaryForeground,
                    },
                  ]}
                >
                  {confirmed ? t('Confirmed') : t('Required')}
                </Text>
              </View>
            </View>
            <Text
              numberOfLines={1}
              style={[styles.summary, { color: colors.mutedForeground }]}
            >
              {summaryText}
            </Text>
          </View>
          {expanded ? (
            <ChevronUp size={16} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={16} color={colors.mutedForeground} />
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Clear capability selection')}
          onPress={() => setActiveCapability(sessionId, 'chat')}
          style={styles.clearBtn}
        >
          <X size={15} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {expanded ? (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {isQuiz ? (
            <>
              {/* Quiz Mode: Custom vs Mimic Paper */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                  {t('Generation Mode')}
                </Text>
                <View style={styles.pillRow}>
                  {(['custom', 'mimic'] as const).map((m) => {
                    const active = quizConfig.mode === m;
                    return (
                      <Pressable
                        key={m}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={t("Quiz mode {value1}", { value1: t(m === 'custom' ? 'Custom' : 'Mimic Paper') })}
                        onPress={() => {
                          setValidationErrors([]);
                          updateQuizConfig({ mode: m });
                        }}
                        style={[
                          styles.optionPill,
                          {
                            borderColor: active
                              ? colors.primary
                              : colors.border,
                            backgroundColor: active
                              ? colors.primary
                              : colors.background,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionPillText,
                            {
                              color: active
                                ? colors.primaryForeground
                                : colors.foreground,
                            },
                          ]}
                        >
                          {m === 'custom' ? t('Custom') : t('Mimic Paper')}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {quizConfig.mode === 'mimic' ? (
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionLabel, { color: colors.foreground }]}
                  >
                    {t('Reference Exam Paper')}
                  </Text>
                  <TextInput
                    value={quizConfig.mimicPaperTitle ?? ''}
                    onChangeText={(val) => {
                      setValidationErrors([]);
                      updateQuizConfig({ mimicPaperTitle: val });
                    }}
                    placeholder={t('Enter reference exam or upload title...')}
                    placeholderTextColor={colors.mutedForeground}
                    accessibilityLabel={t('Reference Exam Paper')}
                    style={[
                      styles.textInput,
                      {
                        color: colors.foreground,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  />
                </View>
              ) : null}

              {/* Total Question Count & Difficulty */}
              <View style={styles.twoColRow}>
                <View style={styles.colItem}>
                  <Text
                    style={[styles.sectionLabel, { color: colors.foreground }]}
                  >
                    {t("Questions ({value1})", { value1: String(quizConfig.totalCount) })}
                  </Text>
                  <View style={styles.stepperRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Decrease question count')}
                      onPress={() =>
                        updateQuizConfig({
                          totalCount: Math.max(1, quizConfig.totalCount - 1),
                        })
                      }
                      style={[
                        styles.stepperBtn,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperBtnText,
                          { color: colors.foreground },
                        ]}
                      >
                        -
                      </Text>
                    </Pressable>
                    <Text
                      style={[styles.stepperVal, { color: colors.foreground }]}
                    >
                      {quizConfig.totalCount}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Increase question count')}
                      onPress={() =>
                        updateQuizConfig({
                          totalCount: Math.min(50, quizConfig.totalCount + 1),
                        })
                      }
                      style={[
                        styles.stepperBtn,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperBtnText,
                          { color: colors.foreground },
                        ]}
                      >
                        +
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.colItem}>
                  <Text
                    style={[styles.sectionLabel, { color: colors.foreground }]}
                  >
                    {t('Difficulty')}
                  </Text>
                  <View style={styles.pillRow}>
                    {QUIZ_DIFFICULTIES.map((diff) => {
                      const active = quizConfig.difficulty === diff.id;
                      return (
                        <Pressable
                          key={diff.id}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          accessibilityLabel={t("Quiz difficulty {value1}", { value1: t(diff.label) })}
                          onPress={() =>
                            updateQuizConfig({ difficulty: diff.id })
                          }
                          style={[
                            styles.miniPill,
                            {
                              borderColor: active
                                ? colors.primary
                                : colors.border,
                              backgroundColor: active
                                ? colors.secondary
                                : colors.background,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.miniPillText,
                              {
                                color: active
                                  ? colors.primary
                                  : colors.foreground,
                              },
                            ]}
                          >
                            {t(diff.label)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Question Types & Auto-Rebalanced Mix */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: colors.foreground }]}
                >
                  {t('Question Types & Auto-Rebalanced Mix')}
                </Text>
                <View style={styles.pillRow}>
                  {QUIZ_TYPES.map((qt) => {
                    const active = quizConfig.selectedTypes.includes(qt.id);
                    const count = quizConfig.typeCounts[qt.id] ?? 0;
                    return (
                      <Pressable
                        key={qt.id}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: active }}
                        accessibilityLabel={t("Toggle question type {value1}", { value1: t(qt.label) })}
                        onPress={() => toggleQuizType(qt.id)}
                        style={[
                          styles.optionPill,
                          {
                            borderColor: active
                              ? colors.primary
                              : colors.border,
                            backgroundColor: active
                              ? colors.secondary
                              : colors.background,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionPillText,
                            {
                              color: active
                                ? colors.primary
                                : colors.foreground,
                            },
                          ]}
                        >
                          {`${qt.label} (${count})`}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Research Mode */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: colors.foreground }]}
                >
                  {t('Research Output Format')}
                </Text>
                <View style={styles.pillRow}>
                  {RESEARCH_MODES.map((rm) => {
                    const active = researchConfig.mode === rm.id;
                    return (
                      <Pressable
                        key={rm.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={t("Research mode {value1}", { value1: t(rm.label) })}
                        onPress={() => updateResearchConfig({ mode: rm.id })}
                        style={[
                          styles.optionPill,
                          {
                            borderColor: active
                              ? colors.primary
                              : colors.border,
                            backgroundColor: active
                              ? colors.primary
                              : colors.background,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionPillText,
                            {
                              color: active
                                ? colors.primaryForeground
                                : colors.foreground,
                            },
                          ]}
                        >
                          {t(rm.label)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Research Depth */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: colors.foreground }]}
                >
                  {t('Investigation Depth')}
                </Text>
                <View style={styles.pillRow}>
                  {RESEARCH_DEPTHS.map((rd) => {
                    const active = researchConfig.depth === rd.id;
                    return (
                      <Pressable
                        key={rd.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={t("Research depth {value1}", { value1: t(rd.label) })}
                        onPress={() => updateResearchConfig({ depth: rd.id })}
                        style={[
                          styles.optionPill,
                          {
                            borderColor: active
                              ? colors.primary
                              : colors.border,
                            backgroundColor: active
                              ? colors.secondary
                              : colors.background,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionPillText,
                            {
                              color: active
                                ? colors.primary
                                : colors.foreground,
                            },
                          ]}
                        >
                          {t(rd.label)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Subtopics & Iterations controls */}
              <View style={styles.twoColRow}>
                <View style={styles.colItem}>
                  <Text
                    style={[styles.sectionLabel, { color: colors.foreground }]}
                  >
                    {t("Sub-topics ({value1})", { value1: String(researchConfig.subtopics) })}
                  </Text>
                  <View style={styles.stepperRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Decrease subtopics')}
                      onPress={() =>
                        updateResearchConfig({
                          depth: 'manual',
                          subtopics: Math.max(1, researchConfig.subtopics - 1),
                        })
                      }
                      style={[
                        styles.stepperBtn,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperBtnText,
                          { color: colors.foreground },
                        ]}
                      >
                        -
                      </Text>
                    </Pressable>
                    <Text
                      style={[styles.stepperVal, { color: colors.foreground }]}
                    >
                      {researchConfig.subtopics}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Increase subtopics')}
                      onPress={() =>
                        updateResearchConfig({
                          depth: 'manual',
                          subtopics: Math.min(
                            10,
                            researchConfig.subtopics + 1,
                          ),
                        })
                      }
                      style={[
                        styles.stepperBtn,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperBtnText,
                          { color: colors.foreground },
                        ]}
                      >
                        +
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.colItem}>
                  <Text
                    style={[styles.sectionLabel, { color: colors.foreground }]}
                  >
                    {t("Iterations ({value1})", { value1: String(researchConfig.iterations) })}
                  </Text>
                  <View style={styles.stepperRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Decrease iterations')}
                      onPress={() =>
                        updateResearchConfig({
                          depth: 'manual',
                          iterations: Math.max(
                            1,
                            researchConfig.iterations - 1,
                          ),
                        })
                      }
                      style={[
                        styles.stepperBtn,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperBtnText,
                          { color: colors.foreground },
                        ]}
                      >
                        -
                      </Text>
                    </Pressable>
                    <Text
                      style={[styles.stepperVal, { color: colors.foreground }]}
                    >
                      {researchConfig.iterations}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Increase iterations')}
                      onPress={() =>
                        updateResearchConfig({
                          depth: 'manual',
                          iterations: Math.min(
                            8,
                            researchConfig.iterations + 1,
                          ),
                        })
                      }
                      style={[
                        styles.stepperBtn,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperBtnText,
                          { color: colors.foreground },
                        ]}
                      >
                        +
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </>
          )}

          {validationErrors.length > 0 ? (
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
              <View style={styles.errorTextCol}>
                {validationErrors.map((err, idx) => (
                  <Text
                    key={`cap-err-${idx}`}
                    style={[styles.errorText, { color: colors.destructive }]}
                  >
                    {translateError(err)}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.footerRow}>
            <View style={styles.hintRow}>
              <Sliders size={12} color={colors.mutedForeground} />
              <Text
                style={[styles.hintText, { color: colors.mutedForeground }]}
              >
                {confirmed
                  ? t('Parameters confirmed for next turn.')
                  : t('Confirm parameters to unlock composer send.')}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Confirm capability settings')}
              onPress={handleConfirm}
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            >
              <Check size={14} color={colors.primaryForeground} />
              <Text
                style={[
                  styles.confirmBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                {t('Confirm')}
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
    marginBottom: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
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
  summary: {
    fontSize: 11,
  },
  clearBtn: {
    padding: 4,
  },
  body: {
    borderTopWidth: 1,
    padding: 12,
    gap: 12,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  miniPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  miniPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  colItem: {
    flex: 1,
    minWidth: 140,
    gap: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  stepperVal: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 22,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorTextCol: {
    flex: 1,
    gap: 2,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  hintText: {
    fontSize: 11,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
