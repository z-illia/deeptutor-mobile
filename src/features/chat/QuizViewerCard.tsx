import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bookmark,
  BookMarked,
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useI18n } from '../../i18n';
import { useFavorites } from '../favorites/FavoritesProvider';
import { useChat } from './ChatProvider';
import {
  isQuizAnswerCorrect,
  type QuizQuestionItem,
} from './model';

const BOOKMARK_CATEGORIES = ['Mistakes', 'Core Concepts', 'Exam Prep'];

export function QuizViewerCard({
  sessionId,
  messageId,
  questions,
}: {
  sessionId: string;
  messageId: number;
  questions: QuizQuestionItem[];
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const {
    getQuizUserState,
    updateQuizUserState,
    openViewerTab,
  } = useChat();
  const { openSaveModal } = useFavorites();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [explanationTab, setExplanationTab] = useState<'reference' | 'ai'>(
    'reference',
  );

  const currentQuestion = questions[currentIndex] ?? questions[0];
  if (!currentQuestion) return null;

  const qState = getQuizUserState(sessionId, messageId, currentQuestion.id);

  const answeredCount = questions.filter(
    (q) => getQuizUserState(sessionId, messageId, q.id).submitted,
  ).length;

  const handleSelectOption = (opt: string) => {
    if (qState.submitted) return;
    updateQuizUserState(sessionId, messageId, currentQuestion.id, {
      userAnswer: opt,
    });
  };

  const handleSubmitAnswer = () => {
    const answerText =
      qState.userAnswer.trim() ||
      (qState.attachedImageName ? `[Image: ${qState.attachedImageName}]` : '');
    if (!answerText) return;
    const correct = isQuizAnswerCorrect(currentQuestion, answerText);
    updateQuizUserState(sessionId, messageId, currentQuestion.id, {
      userAnswer: answerText,
      submitted: true,
      isCorrect: correct,
    });
  };

  const handleRetryQuestion = () => {
    updateQuizUserState(sessionId, messageId, currentQuestion.id, {
      userAnswer: '',
      submitted: false,
      isCorrect: undefined,
      attachedImageName: null,
    });
  };

  const handleToggleBookmark = () => {
    const nextBookmarked = !qState.bookmarked;
    updateQuizUserState(sessionId, messageId, currentQuestion.id, {
      bookmarked: nextBookmarked,
      category: nextBookmarked
        ? qState.category || BOOKMARK_CATEGORIES[0]
        : undefined,
    });
  };

  const handleOpenFollowup = () => {
    openViewerTab(sessionId, {
      id: `tab-quiz-followup-${currentQuestion.id}`,
      kind: 'quiz-followup',
      title: `Quiz Q${currentQuestion.index} Follow-up`,
      closable: true,
      quizQuestionId: currentQuestion.id,
      quizQuestionPrompt: currentQuestion.prompt,
    });
    router.push(
      `/ui/session-viewer?sessionId=${encodeURIComponent(sessionId)}` as never,
    );
  };

  const handleSaveQuizQuestionToFavorites = () => {
    openSaveModal({
      payload: {
        recordType: 'question',
        title: `Quiz Q${currentQuestion.index}: ${currentQuestion.prompt.slice(0, 56)}`,
        userQuery: currentQuestion.prompt,
        summary: `Difficulty: ${currentQuestion.difficulty} · Type: ${currentQuestion.type}`,
        output: [
          `### Question ${currentQuestion.index}`,
          currentQuestion.prompt,
          '',
          `**Expected Answer:** \`${currentQuestion.correctAnswer}\``,
          '',
          '### Reference Explanation',
          currentQuestion.referenceExplanation,
        ].join('\n'),
        metadata: {
          session_id: sessionId,
          question_id: currentQuestion.id,
        },
      },
    });
  };

  const isChoice =
    currentQuestion.type === 'choice' || currentQuestion.type === 'true_false';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {/* Top Pager & Progress Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <HelpCircle size={16} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {`Interactive Quiz · ${currentIndex + 1} / ${questions.length}`}
          </Text>
          <View
            style={[styles.badge, { backgroundColor: colors.secondary }]}
          >
            <Text style={[styles.badgeText, { color: colors.foreground }]}>
              {currentQuestion.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.pagerBtns}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Previous quiz question')}
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            style={[
              styles.pagerIconBtn,
              {
                borderColor: colors.border,
                opacity: currentIndex === 0 ? 0.4 : 1,
              },
            ]}
          >
            <ChevronLeft size={15} color={colors.foreground} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Next quiz question')}
            disabled={currentIndex >= questions.length - 1}
            onPress={() =>
              setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
            }
            style={[
              styles.pagerIconBtn,
              {
                borderColor: colors.border,
                opacity: currentIndex >= questions.length - 1 ? 0.4 : 1,
              },
            ]}
          >
            <ChevronRight size={15} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={[styles.progressTrack, { backgroundColor: colors.secondary }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${Math.round((answeredCount / questions.length) * 100)}%`,
            },
          ]}
        />
      </View>

      {/* Question Prompt */}
      <Text style={[styles.prompt, { color: colors.foreground }]}>
        {currentQuestion.prompt}
      </Text>

      {/* Options or Written Input */}
      {isChoice && currentQuestion.options ? (
        <View style={styles.optionsCol}>
          {currentQuestion.options.map((opt) => {
            const selected = qState.userAnswer === opt;
            const isExpected =
              qState.submitted && opt === currentQuestion.correctAnswer;
            return (
              <Pressable
                key={opt}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`Quiz option ${opt}`}
                onPress={() => handleSelectOption(opt)}
                style={[
                  styles.optionBtn,
                  {
                    borderColor: isExpected
                      ? colors.primary
                      : selected
                        ? colors.primary
                        : colors.border,
                    backgroundColor:
                      selected || isExpected
                        ? colors.secondary
                        : colors.background,
                  },
                ]}
              >
                <Text
                  style={[styles.optionText, { color: colors.foreground }]}
                >
                  {opt}
                </Text>
                {selected ? <Check size={14} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.writtenCol}>
          <TextInput
            value={qState.userAnswer}
            editable={!qState.submitted}
            onChangeText={(val) =>
              updateQuizUserState(sessionId, messageId, currentQuestion.id, {
                userAnswer: val,
              })
            }
            placeholder={t('Type your derivation or short answer...')}
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={t('Quiz written answer input')}
            multiline
            style={[
              styles.writtenInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          />
          <View style={styles.imageAttachRow}>
            {qState.attachedImageName ? (
              <View
                style={[
                  styles.attachedImageChip,
                  {
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ImageIcon size={13} color={colors.primary} />
                <Text
                  style={[
                    styles.attachedImageText,
                    { color: colors.foreground },
                  ]}
                >
                  {qState.attachedImageName}
                </Text>
                {!qState.submitted ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Remove attached solution image')}
                    onPress={() =>
                      updateQuizUserState(
                        sessionId,
                        messageId,
                        currentQuestion.id,
                        { attachedImageName: null },
                      )
                    }
                  >
                    <X size={12} color={colors.mutedForeground} />
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Attach solution image')}
                disabled={qState.submitted}
                onPress={() =>
                  updateQuizUserState(
                    sessionId,
                    messageId,
                    currentQuestion.id,
                    { attachedImageName: 'handwritten-derivation.png' },
                  )
                }
                style={[styles.attachImgBtn, { borderColor: colors.border }]}
              >
                <ImageIcon size={13} color={colors.foreground} />
                <Text
                  style={[styles.attachImgText, { color: colors.foreground }]}
                >
                  {t('Attach image')}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Submit or Post-Submission Panel */}
      {!qState.submitted ? (
        <View style={styles.submitRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Submit quiz answer')}
            onPress={handleSubmitAnswer}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            <Check size={14} color={colors.primaryForeground} />
            <Text
              style={[
                styles.submitBtnText,
                { color: colors.primaryForeground },
              ]}
            >
              {t('Submit Answer')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            styles.feedbackBox,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.feedbackTopRow}>
            <View
              style={[
                styles.verdictBadge,
                {
                  backgroundColor: qState.isCorrect
                    ? colors.primary
                    : colors.destructive,
                },
              ]}
            >
              <Text
                style={[
                  styles.verdictText,
                  { color: colors.primaryForeground },
                ]}
              >
                {qState.isCorrect ? t('Correct') : t('Needs Review')}
              </Text>
            </View>

            <View style={styles.explanationTabs}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{
                  selected: explanationTab === 'reference',
                }}
                accessibilityLabel={t('Reference explanation tab')}
                onPress={() => setExplanationTab('reference')}
                style={[
                  styles.expTabBtn,
                  {
                    borderColor:
                      explanationTab === 'reference'
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.expTabText,
                    {
                      color:
                        explanationTab === 'reference'
                          ? colors.primary
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {t('Reference')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: explanationTab === 'ai' }}
                accessibilityLabel={t('AI Judgment tab')}
                onPress={() => setExplanationTab('ai')}
                style={[
                  styles.expTabBtn,
                  {
                    borderColor:
                      explanationTab === 'ai'
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Sparkles
                  size={11}
                  color={
                    explanationTab === 'ai'
                      ? colors.primary
                      : colors.mutedForeground
                  }
                />
                <Text
                  style={[
                    styles.expTabText,
                    {
                      color:
                        explanationTab === 'ai'
                          ? colors.primary
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {t('AI Judgment')}
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={[styles.explanationText, { color: colors.foreground }]}>
            {explanationTab === 'reference'
              ? currentQuestion.referenceExplanation
              : currentQuestion.aiJudgmentHint}
          </Text>

          {/* Bookmark Category Selector */}
          {qState.bookmarked ? (
            <View style={styles.categoryRow}>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                {t('Bookmark Tag:')}
              </Text>
              {BOOKMARK_CATEGORIES.map((cat) => {
                const active = qState.category === cat;
                return (
                  <Pressable
                    key={cat}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Select bookmark tag ${cat}`}
                    onPress={() =>
                      updateQuizUserState(
                        sessionId,
                        messageId,
                        currentQuestion.id,
                        { category: cat },
                      )
                    }
                    style={[
                      styles.categoryChip,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active
                          ? colors.secondary
                          : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: active ? colors.primary : colors.foreground,
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {/* Post-Submission Action Bar */}
          <View style={styles.postActionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Retry quiz question')}
              onPress={handleRetryQuestion}
              style={[styles.actionBtn, { borderColor: colors.border }]}
            >
              <RotateCcw size={13} color={colors.foreground} />
              <Text
                style={[styles.actionBtnText, { color: colors.foreground }]}
              >
                {t('Retry')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Bookmark quiz question')}
              onPress={handleToggleBookmark}
              style={[
                styles.actionBtn,
                {
                  borderColor: qState.bookmarked
                    ? colors.primary
                    : colors.border,
                },
              ]}
            >
              <Bookmark
                size={13}
                color={qState.bookmarked ? colors.primary : colors.foreground}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  {
                    color: qState.bookmarked
                      ? colors.primary
                      : colors.foreground,
                  },
                ]}
              >
                {qState.bookmarked ? t('Bookmarked') : t('Bookmark')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Save quiz question to Favorites')}
              onPress={handleSaveQuizQuestionToFavorites}
              style={[styles.actionBtn, { borderColor: colors.border }]}
            >
              <BookMarked size={13} color={colors.foreground} />
              <Text
                style={[styles.actionBtnText, { color: colors.foreground }]}
              >
                {t('Save to Favorites')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Ask quiz follow-up')}
              onPress={handleOpenFollowup}
              style={[styles.actionBtn, { borderColor: colors.primary }]}
            >
              <MessageSquare size={13} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                {t('Ask follow-up')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
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
  headerTitleGroup: {
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
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pagerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pagerIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  prompt: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  optionsCol: {
    gap: 6,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  writtenCol: {
    gap: 8,
  },
  writtenInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  imageAttachRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachImgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  attachImgText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attachedImageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  attachedImageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  submitRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  feedbackTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  verdictBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  verdictText: {
    fontSize: 11,
    fontWeight: '700',
  },
  explanationTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  expTabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  postActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
