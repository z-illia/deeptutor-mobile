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
  Edit3,
  HelpCircle,
  SkipForward,
} from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useI18n } from '../../i18n';
import { useChat } from './ChatProvider';
import { type AskUserAnswer, type AskUserCardData } from './model';

export function AskUserQuestionCard({
  sessionId,
  messageId,
  card,
}: {
  sessionId: string;
  messageId: number;
  card: AskUserCardData;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { submitAskUserAnswers, modifyAskUserAnswers } = useChat();

  const [activeIndex, setActiveIndex] = useState(0);
  const [draftAnswers, setDraftAnswers] = useState<
    Record<string, AskUserAnswer>
  >(() => card.answers ?? {});

  const currentQuestion = card.questions[activeIndex] ?? card.questions[0];
  if (!currentQuestion) return null;

  const currentAnswer: AskUserAnswer = draftAnswers[currentQuestion.id] ?? {
    questionId: currentQuestion.id,
    selectedOptionIds: [],
    freeText: '',
    skipped: false,
  };

  const toggleOption = (optionId: string) => {
    const prevIds = currentAnswer.selectedOptionIds;
    const nextIds = currentQuestion.multiSelect
      ? prevIds.includes(optionId)
        ? prevIds.filter((id) => id !== optionId)
        : [...prevIds, optionId]
      : [optionId];

    setDraftAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...currentAnswer,
        selectedOptionIds: nextIds,
        skipped: false,
      },
    }));
  };

  const handleFreeTextChange = (text: string) => {
    setDraftAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...currentAnswer,
        freeText: text,
        skipped: false,
      },
    }));
  };

  const handleSkipCurrent = () => {
    setDraftAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedOptionIds: [],
        freeText: '',
        skipped: true,
      },
    }));
    if (activeIndex < card.questions.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleSubmit = () => {
    submitAskUserAnswers(sessionId, messageId, draftAnswers);
  };

  // Submitted resolved view
  if (card.status === 'submitted') {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.submittedHeader}>
          <View style={styles.titleRow}>
            <Check size={15} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {t('Clarification Answers Submitted')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Modify clarification answers')}
            onPress={() => modifyAskUserAnswers(sessionId, messageId)}
            style={[styles.modifyBtn, { borderColor: colors.border }]}
          >
            <Edit3 size={12} color={colors.foreground} />
            <Text style={[styles.modifyBtnText, { color: colors.foreground }]}>
              {t('Modify')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.summaryList}>
          {card.questions.map((q) => {
            const ans = card.answers[q.id] ?? draftAnswers[q.id];
            const labels = q.options
              .filter((o) => ans?.selectedOptionIds?.includes(o.id))
              .map((o) => o.label);
            if (ans?.freeText?.trim()) {
              labels.push(`"${ans.freeText.trim()}"`);
            }
            const displayVal = ans?.skipped
              ? t('Skipped')
              : labels.length > 0
                ? labels.join(', ')
                : t('No selection');

            return (
              <View
                key={q.id}
                style={[styles.summaryItem, { borderTopColor: colors.border }]}
              >
                <Text
                  style={[
                    styles.summaryHeader,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {q.header}
                </Text>
                <Text
                  style={[styles.summaryValue, { color: colors.foreground }]}
                >
                  {displayVal}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <HelpCircle size={16} color={colors.primary} />
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          {card.title}
        </Text>
      </View>

      {/* Question Tabs */}
      <View style={styles.tabRow}>
        {card.questions.map((q, idx) => {
          const active = idx === activeIndex;
          const ans = draftAnswers[q.id];
          const answered = Boolean(
            ans &&
              (ans.selectedOptionIds.length > 0 ||
                (ans.freeText ?? '').trim().length > 0 ||
                ans.skipped),
          );
          return (
            <Pressable
              key={q.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Question tab ${idx + 1}: ${q.header}`}
              onPress={() => setActiveIndex(idx)}
              style={[
                styles.questionTab,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active
                    ? colors.secondary
                    : colors.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.questionTabText,
                  { color: active ? colors.primary : colors.foreground },
                ]}
              >
                {`${idx + 1}. ${q.header}`}
              </Text>
              {answered ? <Check size={12} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>

      {/* Active Question Body */}
      <View style={styles.questionBody}>
        <Text style={[styles.promptText, { color: colors.foreground }]}>
          {currentQuestion.prompt}
        </Text>

        <View style={styles.optionsList}>
          {currentQuestion.options.map((opt) => {
            const selected = currentAnswer.selectedOptionIds.includes(opt.id);
            return (
              <Pressable
                key={opt.id}
                accessibilityRole={
                  currentQuestion.multiSelect ? 'checkbox' : 'radio'
                }
                accessibilityState={{
                  checked: selected,
                  selected,
                }}
                accessibilityLabel={`Select option ${opt.label}`}
                onPress={() => toggleOption(opt.id)}
                style={[
                  styles.optionRow,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected
                      ? colors.secondary
                      : colors.background,
                  },
                ]}
              >
                <View style={styles.optionTextCol}>
                  <Text
                    style={[styles.optionLabel, { color: colors.foreground }]}
                  >
                    {opt.label}
                  </Text>
                  {opt.description ? (
                    <Text
                      style={[
                        styles.optionDesc,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {opt.description}
                    </Text>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.checkIndicator,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected
                        ? colors.primary
                        : 'transparent',
                    },
                  ]}
                >
                  {selected ? (
                    <Check size={11} color={colors.primaryForeground} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {currentQuestion.allowFreeText ? (
          <TextInput
            value={currentAnswer.freeText ?? ''}
            onChangeText={handleFreeTextChange}
            placeholder={t('Or type a custom response...')}
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={`Custom answer for ${currentQuestion.header}`}
            style={[
              styles.freeTextInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          />
        ) : null}
      </View>

      {card.status === 'error' && card.errorMessage ? (
        <View
          style={[
            styles.errorBanner,
            {
              borderColor: colors.destructive,
              backgroundColor: colors.secondary,
            },
          ]}
        >
          <AlertTriangle size={14} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {card.errorMessage}
          </Text>
        </View>
      ) : null}

      {/* Footer Actions */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Skip question')}
          onPress={handleSkipCurrent}
          style={[styles.skipBtn, { borderColor: colors.border }]}
        >
          <SkipForward size={13} color={colors.mutedForeground} />
          <Text
            style={[styles.skipBtnText, { color: colors.mutedForeground }]}
          >
            {t('Skip')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Submit answers')}
          onPress={handleSubmit}
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
        >
          <Check size={14} color={colors.primaryForeground} />
          <Text
            style={[
              styles.submitBtnText,
              { color: colors.primaryForeground },
            ]}
          >
            {t('Submit answers')}
          </Text>
        </Pressable>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  questionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  questionTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionBody: {
    gap: 8,
  },
  promptText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  optionsList: {
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionTextCol: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  checkIndicator: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  errorBanner: {
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submittedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  modifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  modifyBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryList: {
    gap: 6,
  },
  summaryItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    gap: 2,
  },
  summaryHeader: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
  },
});
