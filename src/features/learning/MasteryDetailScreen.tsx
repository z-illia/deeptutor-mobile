import type { Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleDot,
  Clock3,
  Copy,
  LayoutGrid,
  List,
  LockKeyhole,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  PencilRuler,
  Play,
  Plus,
  RotateCcw,
  Route,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha } from '@/shared/design/tokens';
import { Button } from '@/shared/ui/Controls';
import { Dialog } from '@/shared/ui/Dialog';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { EditTopicRouteDialog } from './EditTopicRouteDialog';
import { useLearning } from './LearningProvider';
import {
  BASELINE_INTERVALS,
  buildBoardFromTopic,
  INTERVAL_TYPES,
  knowledgeTypeLabel,
  parseStrategyIntervalsForm,
  RETENTION_TARGETS,
  topicDisplayName,
  type MapKnowledgePoint,
  type ObjectiveReport,
  type ReviewIntervalType,
} from './model';

function StatusBadge({
  point,
  colors,
}: {
  point: MapKnowledgePoint;
  colors: ReturnType<typeof useDesign>['colors'];
}) {
  if (point.status === 'mastered') {
    return (
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {point.mastery_source === 'learner' ? (
          <Sparkles size={12} color={colors.primaryForeground} />
        ) : (
          <Check size={12} color={colors.primaryForeground} />
        )}
      </View>
    );
  }
  if (point.status === 'learning') {
    return (
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          borderWidth: 1.5,
          borderColor: colors.primary,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircleDot size={12} color={colors.primary} />
      </View>
    );
  }
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Circle size={11} color={colors.mutedForeground} />
    </View>
  );
}

function ObjectiveDetailView({
  report,
  colors,
  t,
}: {
  report: ObjectiveReport;
  colors: ReturnType<typeof useDesign>['colors'];
  t: (key: string) => string;
}) {
  const qualitative = report.gate === 'qualitative';
  const pct = qualitative
    ? report.mastered
      ? 100
      : 0
    : Math.round(report.mastery * 100);
  const thresholdPct = Math.round(report.threshold * 100);

  return (
    <View
      testID={`objective-detail-${report.id}`}
      style={{
        borderLeftWidth: 2,
        borderColor: colors.border,
        paddingLeft: 12,
        gap: 10,
      }}
    >
      {/* GateBar */}
      <View style={{ gap: 4 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <DText role="caption" muted>
            {qualitative
              ? t('Qualitative gate: explain it in your own words')
              : `${t('Quantitative gate')}: ${thresholdPct}%`}
          </DText>
          <DText
            role="caption"
            style={{
              fontWeight: '700',
              color: report.mastered ? colors.primary : colors.mutedForeground,
            }}
          >
            {pct}%
          </DText>
        </View>
        <View
          style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: colors.muted,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: report.mastered
                ? colors.primary
                : colors.mutedForeground,
            }}
          />
        </View>
      </View>

      {/* Spaced review row */}
      {report.review ? (
        <View style={{ gap: 2 }}>
          <DText role="caption" muted>
            {t('Spaced review')}
          </DText>
          <DText role="caption">
            {t('memory')} {Math.round(report.review.retrievability * 100)}% ·{' '}
            {t('stability')} {report.review.stability.toFixed(1)} {t('days')} ·{' '}
            {t('risk')} {Math.round(report.review.forgetting_risk * 100)}% ·{' '}
            {report.review.lapse_count} {t('lapses')}
          </DText>
          {report.review.reason ? (
            <DText role="caption" muted>
              {report.review.reason}
            </DText>
          ) : null}
        </View>
      ) : null}

      {report.explained ? (
        <View style={{ gap: 2 }}>
          <DText role="caption" muted>
            {t('Explained')}
          </DText>
          <DText role="caption">{report.explained.summary}</DText>
        </View>
      ) : null}

      {report.learner_note ? (
        <View style={{ gap: 2 }}>
          <DText role="caption" muted>
            {t('Skip note')}
          </DText>
          <DText role="caption">{report.learner_note}</DText>
        </View>
      ) : null}

      {/* Attempts */}
      {report.attempts.length > 0 ? (
        <View style={{ gap: 6 }}>
          <DText role="caption" muted>
            {t('Attempts')} ({report.correct_count}/{report.attempts.length}{' '}
            {t('correct')})
          </DText>
          {report.attempts.map((att, idx) => (
            <View
              key={`${att.question_id}-${idx}`}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 6,
              }}
            >
              {att.is_correct ? (
                <Check size={13} color={colors.primary} />
              ) : (
                <X size={13} color={colors.destructive} />
              )}
              <View style={{ flex: 1, gap: 1 }}>
                <DText role="caption" style={{ fontWeight: '500' }}>
                  {att.prompt}
                </DText>
                <DText role="caption" muted>
                  {t('You said: ')}
                  {att.answer}
                </DText>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <DText role="caption" muted>
          {t(
            'No attempts yet. Once you work through this waypoint, its questions, your answers, and the grading evidence will appear here.',
          )}
        </DText>
      )}

      {/* Error diagnosis */}
      {report.errors.length > 0 ? (
        <View style={{ gap: 2 }}>
          <DText role="caption" muted>
            {t('Error diagnosis')}
          </DText>
          <DText role="caption">
            {report.errors
              .map(
                (err) =>
                  `${err.error_type}${err.retries > 0 ? ` · ${err.retries} retries` : ''}`,
              )
              .join(', ')}
          </DText>
        </View>
      ) : null}
    </View>
  );
}

export function MasteryDetailScreen({ pathId }: { pathId: string }) {
  const { colors } = useDesign();
  const t = useCopy();
  const {
    getTopic,
    getSelectedObjectiveId,
    setSelectedObjectiveId,
    getTopicView,
    setTopicView,
    getBoardError,
    setBoardError,
    getSessionsState,
    setSessionsState,
    renameTopic,
    getObjectiveReport,
    overrideObjectiveMastery,
    setDesiredRetention,
    strategies,
    selectReviewStrategy,
    saveReviewStrategy,
    duplicateReviewStrategy,
    deleteReviewStrategy,
    resetTopicProgress,
    deleteTopic,
    getSessionsForTopic,
  } = useLearning();

  const topic = getTopic(pathId);
  const selectedId = getSelectedObjectiveId(pathId);
  const topicView = getTopicView(pathId);
  const boardError = getBoardError(pathId);
  const sessionsState = getSessionsState(pathId);
  const sessions = getSessionsForTopic(pathId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [routeEditorOpen, setRouteEditorOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'delete' | null>(
    null,
  );
  const [overrideNoteOpenFor, setOverrideNoteOpenFor] = useState<string | null>(
    null,
  );
  const [overrideNote, setOverrideNote] = useState('');
  const [strategyEditorOpen, setStrategyEditorOpen] = useState(false);
  const [strategyFormName, setStrategyFormName] = useState('Balanced FSRS copy');
  const [strategyIntervals, setStrategyIntervals] = useState<
    Record<ReviewIntervalType, string>
  >({
    memory: BASELINE_INTERVALS.memory.join(','),
    concept: BASELINE_INTERVALS.concept.join(','),
    procedure: BASELINE_INTERVALS.procedure.join(','),
    design: BASELINE_INTERVALS.design.join(','),
  });
  const [strategyFormError, setStrategyFormError] = useState<string | null>(
    null,
  );
  const [boardOpenCardId, setBoardOpenCardId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const board = useMemo(
    () => (topic ? buildBoardFromTopic(topic) : null),
    [topic],
  );

  if (!topic) {
    return (
      <View
        testID="mastery-detail-missing"
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          gap: 12,
        }}
      >
        <AlertCircle size={28} color={colors.mutedForeground} />
        <DText style={{ fontSize: 16, fontWeight: '600' }}>
          {t('This map could not be found')}
        </DText>
        <Button
          testID="missing-back-to-topics-btn"
          variant="secondary"
          size="sm"
          onPress={() => router.replace('/learning/mastery' as Href)}
        >
          {t('Back to topics')}
        </Button>
      </View>
    );
  }

  const displayName = topicDisplayName(topic, t('Exploration trail'));
  const { mastered, total } = topic.map.counts;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const needsRouteRepair = topic.map.modules.length === 0;
  const dueReviews = topic.reviews.filter((r) => r.due);
  const selectedStrategyId =
    topic.review_settings?.strategy?.template_id ?? 'strat-balanced';
  const selectedStrategy = strategies.find(
    (s) => s.template_id === selectedStrategyId,
  );
  const editingCustomStrategy = Boolean(
    selectedStrategy && !selectedStrategy.builtin,
  );

  const openStudy = (mode?: 'outline' | 'study' | 'review', focus?: string) => {
    const query: string[] = [];
    if (mode) query.push(`mode=${encodeURIComponent(mode)}`);
    if (focus) query.push(`focus=${encodeURIComponent(focus)}`);
    const suffix = query.length > 0 ? `?${query.join('&')}` : '';
    router.push(
      `/learning/mastery/${encodeURIComponent(pathId)}/sessions${suffix}` as Href,
    );
  };

  const handleSaveTitle = () => {
    const res = renameTopic(pathId, titleDraft);
    if (!res.ok) {
      setActionError(res.error ?? t('Update failed'));
      return;
    }
    setActionError(null);
    setEditingTitle(false);
  };

  const handleSubmitStrategy = () => {
    const parsed = parseStrategyIntervalsForm({
      name: strategyFormName,
      intervals: strategyIntervals,
    });
    if (!parsed) {
      setStrategyFormError(
        t('Use 1-16 non-decreasing whole-day rounds from 0-365 in every row.'),
      );
      return;
    }
    const res = saveReviewStrategy(
      pathId,
      parsed,
      editingCustomStrategy ? selectedStrategyId : undefined,
    );
    if (!res.ok) {
      setStrategyFormError(res.error ?? t('Failed to save'));
      return;
    }
    setStrategyFormError(null);
    setStrategyEditorOpen(false);
  };

  return (
    <View
      testID="mastery-detail-screen"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingVertical: 18,
          gap: 16,
          maxWidth: 1120,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* Top Header Card */}
        <View
          style={{
            padding: 18,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            gap: 14,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 240, gap: 6 }}>
              <Pressable
                testID="detail-back-to-atlas-btn"
                accessibilityRole="button"
                accessibilityLabel={t('All topics')}
                onPress={() => router.push('/learning/mastery' as Href)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ArrowLeft size={14} color={colors.mutedForeground} />
                <DText role="caption" muted>
                  {t('All topics')}
                </DText>
              </Pressable>

              {/* Inline Rename Title */}
              {editingTitle ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <TextInput
                    testID="detail-rename-input"
                    accessibilityLabel={t('Rename topic')}
                    value={titleDraft}
                    onChangeText={setTitleDraft}
                    onSubmitEditing={handleSaveTitle}
                    style={{
                      flex: 1,
                      minHeight: 36,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.primary,
                      backgroundColor: colors.background,
                      paddingHorizontal: 10,
                      fontSize: 16,
                      fontWeight: '700',
                      color: colors.foreground,
                    }}
                  />
                  <Button
                    testID="detail-rename-save-btn"
                    variant="primary"
                    size="sm"
                    onPress={handleSaveTitle}
                  >
                    {t('Save')}
                  </Button>
                  <Button
                    testID="detail-rename-cancel-btn"
                    variant="ghost"
                    size="sm"
                    onPress={() => setEditingTitle(false)}
                  >
                    {t('Cancel')}
                  </Button>
                </View>
              ) : (
                <Pressable
                  testID="detail-rename-trigger"
                  accessibilityRole="button"
                  accessibilityLabel={`${displayName} — ${t('Rename topic')}`}
                  onPress={() => {
                    setTitleDraft(displayName);
                    setEditingTitle(true);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <DText
                    role="title"
                    style={{ fontSize: 21, fontWeight: '700' }}
                  >
                    {displayName}
                  </DText>
                  <Pencil size={14} color={colors.mutedForeground} />
                </Pressable>
              )}

              <DText role="small" muted>
                {topic.metadata.description || topic.metadata.goal}
              </DText>

              {topic.metadata.sources.length > 0 ? (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginTop: 2,
                  }}
                >
                  {topic.metadata.sources.map((src) => (
                    <View
                      key={`${src.type}:${src.id}`}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      }}
                    >
                      <DText role="caption" muted>
                        {src.label}
                      </DText>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Progress bar */}
              {!needsRouteRepair ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  <DText
                    testID="detail-progress-count"
                    role="caption"
                    style={{ fontWeight: '600' }}
                  >
                    {mastered}/{total} {t('knowledge points')}
                  </DText>
                  <View
                    style={{
                      flex: 1,
                      maxWidth: 200,
                      height: 6,
                      borderRadius: 999,
                      backgroundColor: colors.muted,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: colors.primary,
                      }}
                    />
                  </View>
                  <DText role="caption" muted>
                    {pct}%
                  </DText>
                </View>
              ) : null}
            </View>

            {/* Right column: Edit modules, More actions, and Next up card */}
            <View style={{ minWidth: 240, gap: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 8,
                }}
              >
                <Button
                  testID="detail-edit-modules-btn"
                  variant="secondary"
                  size="sm"
                  icon={<Pencil size={13} color={colors.foreground} />}
                  onPress={() => setRouteEditorOpen(true)}
                >
                  {needsRouteRepair ? t('Add modules') : t('Edit modules')}
                </Button>

                <Pressable
                  testID="detail-more-actions-btn"
                  accessibilityRole="button"
                  accessibilityLabel={t('More actions')}
                  onPress={() => setMoreMenuOpen((prev) => !prev)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MoreHorizontal size={16} color={colors.foreground} />
                </Pressable>
              </View>

              {moreMenuOpen ? (
                <View
                  testID="detail-more-menu"
                  style={{
                    padding: 6,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    gap: 4,
                  }}
                >
                  {!needsRouteRepair ? (
                    <Pressable
                      testID="detail-reset-progress-btn"
                      accessibilityRole="button"
                      accessibilityLabel={t('Reset progress')}
                      onPress={() => {
                        setMoreMenuOpen(false);
                        setConfirmAction('reset');
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: 8,
                      }}
                    >
                      <RotateCcw size={14} color={colors.foreground} />
                      <DText role="small">{t('Reset progress')}</DText>
                    </Pressable>
                  ) : null}
                  <Pressable
                    testID="detail-delete-topic-btn"
                    accessibilityRole="button"
                    accessibilityLabel={t('Delete topic')}
                    onPress={() => {
                      setMoreMenuOpen(false);
                      setConfirmAction('delete');
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Trash2 size={14} color={colors.destructive} />
                    <DText role="small" style={{ color: colors.destructive }}>
                      {t('Delete topic')}
                    </DText>
                  </Pressable>
                </View>
              ) : null}

              {/* Next Up Card */}
              <View
                testID="detail-next-up-card"
                style={{
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: alpha(colors.primary, 0.35),
                  backgroundColor: alpha(colors.primary, 0.05),
                  gap: 6,
                }}
              >
                <DText
                  role="caption"
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: 0.7,
                    color: colors.primary,
                    fontWeight: '600',
                  }}
                >
                  {t('Next up')}
                </DText>
                <DText style={{ fontWeight: '600' }} numberOfLines={2}>
                  {needsRouteRepair
                    ? t('Design the outline')
                    : topic.next.knowledge_point_name ||
                      t('All knowledge points mastered')}
                </DText>
                <DText role="caption" muted>
                  {topic.next.reason}
                </DText>
                <View style={{ marginTop: 4 }}>
                  <Button
                    testID="detail-continue-learning-btn"
                    variant="primary"
                    size="sm"
                    icon={
                      <ArrowRight size={14} color={colors.primaryForeground} />
                    }
                    onPress={() =>
                      openStudy(
                        needsRouteRepair
                          ? 'outline'
                          : topic.next.action === 'review'
                            ? 'review'
                            : 'study',
                        topic.next.knowledge_point_name ?? undefined,
                      )
                    }
                  >
                    {needsRouteRepair
                      ? t('Design the outline')
                      : topic.next.action === 'review'
                        ? t('Start review')
                        : mastered === 0 && topic.map.counts.learning === 0
                          ? t('Begin first waypoint')
                          : t('Continue learning')}
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>

        {actionError ? (
          <InlineAlert tone="danger">{actionError}</InlineAlert>
        ) : null}

        {/* Main Content: Outline / Board + Review Plan + Sessions */}
        {needsRouteRepair ? (
          <View
            testID="detail-no-outline-card"
            style={{
              padding: 24,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Route size={24} color={colors.primary} />
            <DText style={{ fontSize: 16, fontWeight: '600' }}>
              {t('No outline yet')}
            </DText>
            <DText
              role="small"
              muted
              style={{ textAlign: 'center', maxWidth: 440 }}
            >
              {t(
                'Open a session to design the modules and knowledge points with your tutor, or write the modules yourself.',
              )}
            </DText>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                justifyContent: 'center',
              }}
            >
              <Button
                testID="detail-design-outline-tutor-btn"
                variant="primary"
                size="sm"
                onPress={() => openStudy('outline')}
              >
                {t('Design the outline with the tutor')}
              </Button>
              <Button
                testID="detail-write-modules-myself-btn"
                variant="secondary"
                size="sm"
                onPress={() => setRouteEditorOpen(true)}
              >
                {t('Write the modules myself')}
              </Button>
            </View>
          </View>
        ) : (
          <View
            style={{
              padding: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              gap: 14,
            }}
          >
            {/* Outline vs Board Header */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <DText style={{ fontSize: 15, fontWeight: '600' }}>
                {t('Mastery outline')}
              </DText>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 3,
                    borderRadius: 8,
                    backgroundColor: colors.muted,
                    gap: 4,
                  }}
                >
                  {(
                    [
                      ['outline', List, t('Outline')],
                      ['board', LayoutGrid, t('Board')],
                    ] as const
                  ).map(([val, Icon, label]) => {
                    const active = topicView === val;
                    return (
                      <Pressable
                        key={val}
                        testID={`detail-view-${val}`}
                        accessibilityRole="button"
                        accessibilityLabel={label}
                        accessibilityState={{ selected: active }}
                        onPress={() => setTopicView(pathId, val)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 6,
                          backgroundColor: active
                            ? colors.background
                            : 'transparent',
                        }}
                      >
                        <Icon
                          size={13}
                          color={
                            active ? colors.foreground : colors.mutedForeground
                          }
                        />
                        <DText
                          role="caption"
                          style={{
                            fontWeight: active ? '600' : '400',
                            color: active
                              ? colors.foreground
                              : colors.mutedForeground,
                          }}
                        >
                          {label}
                        </DText>
                      </Pressable>
                    );
                  })}
                </View>

                {topicView === 'board' ? (
                  <Pressable
                    testID="detail-toggle-board-error-btn"
                    accessibilityRole="button"
                    accessibilityLabel={
                      boardError ? t('Try again') : 'Simulate Board Error'
                    }
                    onPress={() => setBoardError(pathId, !boardError)}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <DText role="caption" muted>
                      {boardError ? t('Try again') : 'Simulate Board Error'}
                    </DText>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* ModuleOutline or LearningBoard */}
            {topicView === 'outline' ? (
              <View testID="module-outline-view" style={{ gap: 14 }}>
                {topic.map.modules.map((mod, modIdx) => (
                  <View
                    key={mod.id}
                    testID={`outline-module-${mod.id}`}
                    style={{ gap: 6 }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          flex: 1,
                        }}
                      >
                        <DText
                          role="caption"
                          style={{
                            color: colors.primary,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                          }}
                        >
                          {t('Module')} {modIdx + 1}
                        </DText>
                        <DText
                          style={{ fontWeight: '600', flex: 1 }}
                          numberOfLines={1}
                        >
                          {mod.name}
                        </DText>
                      </View>
                      <DText role="caption" muted>
                        {mod.mastered}/{mod.total}
                      </DText>
                    </View>

                    {mod.objective ? (
                      <DText role="caption" muted>
                        {mod.objective}
                      </DText>
                    ) : null}

                    <View style={{ gap: 6, marginTop: 2 }}>
                      {mod.knowledge_points.map((pt) => {
                        const selected = pt.id === selectedId;
                        const isNext =
                          pt.id === topic.next.knowledge_point_id;
                        const report = selected
                          ? getObjectiveReport(pathId, pt.id)
                          : null;

                        return (
                          <View
                            key={pt.id}
                            style={{
                              borderRadius: 10,
                              borderWidth: 1,
                              borderColor: selected
                                ? colors.primary
                                : colors.border,
                              backgroundColor: selected
                                ? alpha(colors.primary, 0.04)
                                : colors.background,
                              overflow: 'hidden',
                            }}
                          >
                            <Pressable
                              testID={`detail-waypoint-${pt.id}`}
                              accessibilityRole="button"
                              accessibilityLabel={pt.name}
                              accessibilityState={{ selected }}
                              onPress={() =>
                                setSelectedObjectiveId(
                                  pathId,
                                  selected ? null : pt.id,
                                )
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                              }}
                            >
                              <StatusBadge point={pt} colors={colors} />
                              <DText
                                role="small"
                                style={{
                                  flex: 1,
                                  fontWeight: selected ? '600' : '500',
                                }}
                              >
                                {pt.name}
                              </DText>
                              {isNext ? (
                                <View
                                  style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 999,
                                    backgroundColor: alpha(
                                      colors.primary,
                                      0.12,
                                    ),
                                  }}
                                >
                                  <DText
                                    role="caption"
                                    style={{
                                      color: colors.primary,
                                      fontWeight: '700',
                                    }}
                                  >
                                    {t('Next')}
                                  </DText>
                                </View>
                              ) : null}
                              <DText role="caption" muted>
                                {pt.mastery_source === 'learner'
                                  ? t('Marked as known')
                                  : pt.status === 'mastered'
                                    ? t('Mastered')
                                    : pt.status === 'learning'
                                      ? t('In progress')
                                      : t('Not started')}
                              </DText>
                              <ChevronRight
                                size={14}
                                color={colors.mutedForeground}
                              />
                            </Pressable>

                            {selected && report ? (
                              <View
                                testID={`objective-drawer-${pt.id}`}
                                style={{
                                  borderTopWidth: 1,
                                  borderColor: colors.border,
                                  padding: 12,
                                  gap: 10,
                                  backgroundColor: colors.card,
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      gap: 8,
                                    }}
                                  >
                                    <DText
                                      role="caption"
                                      muted
                                      style={{ fontWeight: '600' }}
                                    >
                                      {knowledgeTypeLabel(report.type)}
                                    </DText>
                                    {report.mastery_source === 'learner' ? (
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          gap: 4,
                                          paddingHorizontal: 8,
                                          paddingVertical: 2,
                                          borderRadius: 999,
                                          backgroundColor: colors.muted,
                                        }}
                                      >
                                        <Sparkles
                                          size={11}
                                          color={colors.foreground}
                                        />
                                        <DText role="caption">
                                          {t('Confirmed by you')}
                                        </DText>
                                      </View>
                                    ) : null}
                                  </View>

                                  <Pressable
                                    testID={`objective-collapse-${pt.id}`}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('Collapse')}
                                    onPress={() =>
                                      setSelectedObjectiveId(pathId, null)
                                    }
                                    style={{ paddingHorizontal: 6 }}
                                  >
                                    <DText role="caption" muted>
                                      {t('Collapse')}
                                    </DText>
                                  </Pressable>
                                </View>

                                <ObjectiveDetailView
                                  report={report}
                                  colors={colors}
                                  t={t}
                                />

                                {/* Manual mastery override controls */}
                                {!report.assessed_mastered ? (
                                  <View style={{ gap: 8 }}>
                                    {report.mastery_source === 'learner' ? (
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          flexWrap: 'wrap',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: 8,
                                        }}
                                      >
                                        <DText
                                          role="caption"
                                          muted
                                          style={{ flex: 1 }}
                                        >
                                          {t(
                                            'Marked as known by you; assessed evidence is unchanged.',
                                          )}
                                        </DText>
                                        <Button
                                          testID={`objective-undo-override-${pt.id}`}
                                          variant="secondary"
                                          size="sm"
                                          icon={
                                            <Undo2
                                              size={13}
                                              color={colors.foreground}
                                            />
                                          }
                                          onPress={() => {
                                            overrideObjectiveMastery(
                                              pathId,
                                              pt.id,
                                              false,
                                              '',
                                            );
                                          }}
                                        >
                                          {t('Return to assessment')}
                                        </Button>
                                      </View>
                                    ) : overrideNoteOpenFor === pt.id ? (
                                      <View style={{ gap: 8 }}>
                                        <DText
                                          role="caption"
                                          style={{ fontWeight: '600' }}
                                        >
                                          {t(
                                            'Optional: why are you skipping this?',
                                          )}
                                        </DText>
                                        <TextInput
                                          testID={`objective-override-note-${pt.id}`}
                                          accessibilityLabel={t(
                                            'Optional: why are you skipping this?',
                                          )}
                                          value={overrideNote}
                                          onChangeText={setOverrideNote}
                                          placeholder={t(
                                            'Already covered in coursework...',
                                          )}
                                          placeholderTextColor={
                                            colors.mutedForeground
                                          }
                                          style={{
                                            minHeight: 44,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            backgroundColor: colors.background,
                                            paddingHorizontal: 10,
                                            fontSize: 12,
                                            color: colors.foreground,
                                          }}
                                        />
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end',
                                            gap: 8,
                                          }}
                                        >
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onPress={() =>
                                              setOverrideNoteOpenFor(null)
                                            }
                                          >
                                            {t('Cancel')}
                                          </Button>
                                          <Button
                                            testID={`objective-confirm-mastery-${pt.id}`}
                                            variant="primary"
                                            size="sm"
                                            onPress={() => {
                                              overrideObjectiveMastery(
                                                pathId,
                                                pt.id,
                                                true,
                                                overrideNote,
                                              );
                                              setOverrideNoteOpenFor(null);
                                              setOverrideNote('');
                                            }}
                                          >
                                            {t('Confirm mastery')}
                                          </Button>
                                        </View>
                                      </View>
                                    ) : (
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          flexWrap: 'wrap',
                                          gap: 8,
                                        }}
                                      >
                                        <Button
                                          testID={`objective-advance-btn-${pt.id}`}
                                          variant="secondary"
                                          size="sm"
                                          icon={
                                            <LockKeyhole
                                              size={13}
                                              color={colors.foreground}
                                            />
                                          }
                                          onPress={() =>
                                            setOverrideNoteOpenFor(pt.id)
                                          }
                                        >
                                          {t(
                                            'I already know this — advance',
                                          )}
                                        </Button>
                                        <Button
                                          testID={`objective-study-btn-${pt.id}`}
                                          variant="primary"
                                          size="sm"
                                          icon={
                                            <MessageSquare
                                              size={13}
                                              color={colors.primaryForeground}
                                            />
                                          }
                                          onPress={() =>
                                            openStudy('study', pt.name)
                                          }
                                        >
                                          {t('Start tutoring')}
                                        </Button>
                                      </View>
                                    )}
                                  </View>
                                ) : (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'flex-start',
                                    }}
                                  >
                                    <Button
                                      testID={`objective-study-btn-${pt.id}`}
                                      variant="secondary"
                                      size="sm"
                                      icon={
                                        <MessageSquare
                                          size={13}
                                          color={colors.foreground}
                                        />
                                      }
                                      onPress={() =>
                                        openStudy('study', pt.name)
                                      }
                                    >
                                      {t('Start tutoring')}
                                    </Button>
                                  </View>
                                )}
                              </View>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            ) : boardError ? (
              <View
                testID="learning-board-error"
                style={{
                  padding: 20,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <DText role="small" muted>
                  {t('The learning board could not be loaded')}
                </DText>
                <Button
                  testID="learning-board-retry-btn"
                  variant="secondary"
                  size="sm"
                  onPress={() => setBoardError(pathId, false)}
                >
                  {t('Try again')}
                </Button>
              </View>
            ) : (
              <ScrollView
                testID="learning-board-view"
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {(board?.modules ?? []).map((mod) => (
                  <View
                    key={mod.id}
                    testID={`board-column-${mod.id}`}
                    style={{
                      width: 264,
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: alpha(colors.muted, 0.35),
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <DText
                        role="small"
                        style={{ fontWeight: '600', flex: 1 }}
                        numberOfLines={1}
                      >
                        {mod.name}
                      </DText>
                      <DText role="caption" muted>
                        {mod.mastered}/{mod.total}
                      </DText>
                    </View>

                    {mod.cards.map((card) => {
                      const open = boardOpenCardId === card.id;
                      const cardReport = open
                        ? getObjectiveReport(pathId, card.id)
                        : null;
                      return (
                        <View key={card.id} style={{ gap: 6 }}>
                          <Pressable
                            testID={`board-card-${card.id}`}
                            accessibilityRole="button"
                            accessibilityLabel={card.name}
                            accessibilityState={{ expanded: open }}
                            onPress={() =>
                              setBoardOpenCardId(open ? null : card.id)
                            }
                            style={{
                              padding: 10,
                              borderRadius: 10,
                              borderWidth: 1,
                              borderColor:
                                card.status === 'mastered'
                                  ? colors.primary
                                  : colors.border,
                              backgroundColor: colors.card,
                              gap: 6,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: 6,
                              }}
                            >
                              <DText
                                role="small"
                                style={{ flex: 1, fontWeight: '500' }}
                              >
                                {card.name}
                              </DText>
                              {card.status === 'mastered' ? (
                                <CircleCheck size={14} color={colors.primary} />
                              ) : card.status === 'learning' ? (
                                <CircleDot size={14} color={colors.primary} />
                              ) : (
                                <Circle
                                  size={14}
                                  color={colors.mutedForeground}
                                />
                              )}
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <DText role="caption" muted>
                                {knowledgeTypeLabel(card.type)}
                              </DText>
                              <DText role="caption" muted>
                                {Math.round(card.mastery_level * 100)}%
                              </DText>
                            </View>
                          </Pressable>

                          {open && cardReport ? (
                            <View
                              style={{
                                padding: 10,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: colors.border,
                                backgroundColor: colors.card,
                                gap: 8,
                              }}
                            >
                              <ObjectiveDetailView
                                report={cardReport}
                                colors={colors}
                                t={t}
                              />
                              <Button
                                testID={`board-start-tutoring-${card.id}`}
                                variant="primary"
                                size="sm"
                                icon={
                                  <MessageSquare
                                    size={13}
                                    color={colors.primaryForeground}
                                  />
                                }
                                onPress={() => openStudy('study', card.name)}
                              >
                                {t('Start tutoring')}
                              </Button>
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Review Plan (`ReviewTrail`) */}
        {!needsRouteRepair ? (
          <View
            testID="review-trail-panel"
            style={{
              padding: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <View style={{ gap: 2 }}>
                <DText style={{ fontSize: 15, fontWeight: '600' }}>
                  {t('Review plan')}
                </DText>
                <DText role="caption" muted>
                  {t('Higher targets schedule reviews sooner.')}
                </DText>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {/* Strategy selector pills */}
                {strategies.map((strat) => {
                  const selected = strat.template_id === selectedStrategyId;
                  return (
                    <Pressable
                      key={strat.template_id}
                      testID={`review-strategy-chip-${strat.template_id}`}
                      accessibilityRole="button"
                      accessibilityLabel={`${t('Strategy')} ${strat.name}`}
                      accessibilityState={{ selected }}
                      onPress={() =>
                        selectReviewStrategy(pathId, strat.template_id)
                      }
                      style={{
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected
                          ? alpha(colors.primary, 0.12)
                          : colors.background,
                      }}
                    >
                      <DText
                        role="caption"
                        style={{
                          color: selected ? colors.primary : colors.foreground,
                          fontWeight: selected ? '600' : '400',
                        }}
                      >
                        {strat.name}
                      </DText>
                    </Pressable>
                  );
                })}

                <Pressable
                  testID="review-edit-strategy-btn"
                  accessibilityRole="button"
                  accessibilityLabel={
                    strategyEditorOpen
                      ? t('Close strategy editor')
                      : t('Edit strategy')
                  }
                  onPress={() => {
                    const next = !strategyEditorOpen;
                    setStrategyEditorOpen(next);
                    if (next) {
                      setStrategyFormName(
                        selectedStrategy && !selectedStrategy.builtin
                          ? selectedStrategy.name
                          : `${selectedStrategy?.name ?? 'Default'} copy`,
                      );
                      setStrategyFormError(null);
                    }
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PencilRuler size={13} color={colors.mutedForeground} />
                </Pressable>

                {/* Recall target pills */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <DText role="caption" muted>
                    {t('Recall target')}:
                  </DText>
                  {RETENTION_TARGETS.map((target) => {
                    const active =
                      Math.abs(
                        (topic.review_settings?.desired_retention ?? 0.9) -
                          target,
                      ) < 0.001;
                    return (
                      <Pressable
                        key={target}
                        testID={`retention-target-${Math.round(target * 100)}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Recall target ${Math.round(target * 100)}%`}
                        accessibilityState={{ selected: active }}
                        onPress={() => setDesiredRetention(pathId, target)}
                        style={{
                          paddingHorizontal: 7,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active
                            ? alpha(colors.primary, 0.12)
                            : colors.background,
                        }}
                      >
                        <DText
                          role="caption"
                          style={{
                            color: active ? colors.primary : colors.foreground,
                            fontWeight: active ? '600' : '400',
                          }}
                        >
                          {Math.round(target * 100)}%
                        </DText>
                      </Pressable>
                    );
                  })}
                </View>

                <DText role="caption" muted>
                  {dueReviews.length} {t('due')}
                </DText>
              </View>
            </View>

            {!strategyEditorOpen &&
            strategies.every((strategy) => strategy.builtin) ? (
              <DText role="caption" muted>
                {t('No custom strategies yet')}
              </DText>
            ) : null}

            {/* Strategy Editor */}
            {strategyEditorOpen ? (
              <View
                testID="review-strategy-editor"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  gap: 10,
                }}
              >
                <View style={{ gap: 4 }}>
                  <DText role="caption" style={{ fontWeight: '600' }}>
                    {t('Name')}
                  </DText>
                  <TextInput
                    testID="strategy-form-name"
                    accessibilityLabel={t('Name')}
                    value={strategyFormName}
                    onChangeText={setStrategyFormName}
                    style={{
                      minHeight: 32,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      paddingHorizontal: 8,
                      fontSize: 12,
                      color: colors.foreground,
                    }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {INTERVAL_TYPES.map((type) => (
                    <View
                      key={type}
                      style={{ flexGrow: 1, flexBasis: 130, gap: 4 }}
                    >
                      <DText role="caption" muted>
                        {type} {t('rounds (days)')}
                      </DText>
                      <TextInput
                        testID={`strategy-interval-${type}`}
                        accessibilityLabel={`${type} rounds (days)`}
                        value={strategyIntervals[type]}
                        onChangeText={(val) =>
                          setStrategyIntervals((prev) => ({
                            ...prev,
                            [type]: val,
                          }))
                        }
                        style={{
                          minHeight: 30,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                          paddingHorizontal: 8,
                          fontSize: 12,
                          color: colors.foreground,
                        }}
                      />
                    </View>
                  ))}
                </View>

                {strategyFormError ? (
                  <DText
                    role="caption"
                    style={{ color: colors.destructive }}
                  >
                    {strategyFormError}
                  </DText>
                ) : null}

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Button
                    testID="strategy-save-btn"
                    variant="primary"
                    size="sm"
                    icon={<Check size={13} color={colors.primaryForeground} />}
                    onPress={handleSubmitStrategy}
                  >
                    {editingCustomStrategy
                      ? t('Save')
                      : t('Save as custom')}
                  </Button>
                  {selectedStrategy ? (
                    <Button
                      testID="strategy-duplicate-btn"
                      variant="secondary"
                      size="sm"
                      icon={<Copy size={13} color={colors.foreground} />}
                      onPress={() => {
                        duplicateReviewStrategy(
                          pathId,
                          selectedStrategy.template_id,
                          `${selectedStrategy.name} copy`,
                        );
                        setStrategyEditorOpen(false);
                      }}
                    >
                      {t('Duplicate')}
                    </Button>
                  ) : null}
                  {editingCustomStrategy ? (
                    <Button
                      testID="strategy-delete-btn"
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={13} color={colors.destructive} />}
                      onPress={() => {
                        deleteReviewStrategy(pathId, selectedStrategyId);
                        setStrategyEditorOpen(false);
                      }}
                    >
                      {t('Delete and use default')}
                    </Button>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Reviews List */}
            {topic.reviews.length === 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 4,
                }}
              >
                <CheckCircle2 size={15} color={colors.primary} />
                <DText role="small" muted>
                  {t(
                    'Nothing is due today. Keep going — reviews will resurface at the right time.',
                  )}
                </DText>
              </View>
            ) : (
              <View style={{ gap: 6 }}>
                {topic.reviews.map((rev) => (
                  <View
                    key={rev.id}
                    testID={`review-row-${rev.knowledge_point_id}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    }}
                  >
                    <Clock3
                      size={14}
                      color={
                        rev.due ? colors.primary : colors.mutedForeground
                      }
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${rev.knowledge_point_name}`}
                      onPress={() =>
                        setSelectedObjectiveId(pathId, rev.knowledge_point_id)
                      }
                      style={{ flex: 1, gap: 2 }}
                    >
                      <DText
                        role="small"
                        style={{ fontWeight: '500' }}
                        numberOfLines={1}
                      >
                        {rev.knowledge_point_name}
                      </DText>
                      <DText role="caption" muted numberOfLines={1}>
                        {rev.due ? t('Ready now') : t('Scheduled')} ·{' '}
                        {t('risk')} {Math.round(rev.forgetting_risk * 100)}% ·{' '}
                        {rev.reason}
                      </DText>
                    </Pressable>
                    <Pressable
                      testID={`review-start-btn-${rev.knowledge_point_id}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Start review for ${rev.knowledge_point_name}`}
                      onPress={() =>
                        openStudy('review', rev.knowledge_point_name)
                      }
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        backgroundColor: alpha(colors.primary, 0.12),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Play size={13} color={colors.primary} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}

        {/* Learner Profile & Mastery Sessions (`SessionCamp`) */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          {/* Learner Profile Card */}
          <View
            testID="learner-profile-card"
            style={{
              flexGrow: 1,
              flexBasis: 300,
              padding: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              gap: 8,
            }}
          >
            <DText style={{ fontSize: 15, fontWeight: '600' }}>
              {t('Learner profile')}
            </DText>
            {topic.learner_profile.background_summary ? (
              <DText role="small" muted>
                {topic.learner_profile.background_summary}
              </DText>
            ) : null}
            {topic.learner_profile.strengths.length > 0 ? (
              <View style={{ gap: 2 }}>
                <DText role="caption" muted>
                  {t('Strengths')}
                </DText>
                <DText role="caption">
                  {topic.learner_profile.strengths.join(' · ')}
                </DText>
              </View>
            ) : null}
            {topic.learner_profile.recurring_gaps.length > 0 ? (
              <View style={{ gap: 2 }}>
                <DText role="caption" muted>
                  {t('Focus areas')}
                </DText>
                <DText role="caption">
                  {topic.learner_profile.recurring_gaps.join(' · ')}
                </DText>
              </View>
            ) : null}
          </View>

          {/* SessionCamp (`Mastery sessions`) */}
          <View
            testID="session-camp-panel"
            style={{
              flexGrow: 1,
              flexBasis: 360,
              padding: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <DText style={{ fontSize: 15, fontWeight: '600' }}>
                  {t('Mastery sessions')}
                </DText>
                {sessionsState === 'error' ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Could not refresh — retry')}
                    onPress={() => setSessionsState(pathId, 'ready')}
                  >
                    <DText
                      role="caption"
                      style={{
                        color: colors.primary,
                        textDecorationLine: 'underline',
                      }}
                    >
                      {t('Could not refresh — retry')}
                    </DText>
                  </Pressable>
                ) : null}
              </View>

              <Pressable
                testID="session-camp-new-btn"
                accessibilityRole="button"
                accessibilityLabel={t('Start a new learning session')}
                onPress={() => openStudy()}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={14} color={colors.foreground} />
              </Pressable>
            </View>

            {sessionsState === 'loading' ? (
              <LoadingState />
            ) : sessions.length === 0 ? (
              <View
                style={{
                  paddingVertical: 16,
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <MessageCircle size={22} color={colors.mutedForeground} />
                <DText role="small" style={{ fontWeight: '600' }}>
                  {t('No sessions yet')}
                </DText>
                <DText
                  role="caption"
                  muted
                  style={{ textAlign: 'center', maxWidth: 280 }}
                >
                  {t(
                    'Start your first session. Later you can resume this thread or begin again from a fresh angle.',
                  )}
                </DText>
                <Button
                  testID="session-camp-begin-btn"
                  variant="primary"
                  size="sm"
                  icon={<Plus size={13} color={colors.primaryForeground} />}
                  onPress={() => openStudy()}
                >
                  {t('Begin learning')}
                </Button>
              </View>
            ) : (
              <View style={{ gap: 6 }}>
                {sessions.map((session) => (
                  <Pressable
                    key={session.session_id}
                    testID={`session-camp-row-${session.session_id}`}
                    accessibilityRole="button"
                    accessibilityLabel={session.title}
                    onPress={() =>
                      router.push(
                        `/learning/mastery/${encodeURIComponent(pathId)}/sessions/${encodeURIComponent(session.session_id)}` as Href,
                      )
                    }
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      padding: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: pressed
                        ? alpha(colors.accent, 0.5)
                        : colors.background,
                    })}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: alpha(colors.primary, 0.1),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MessageCircle size={15} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <DText
                        role="small"
                        style={{ fontWeight: '600' }}
                        numberOfLines={1}
                      >
                        {session.title}
                      </DText>
                      <DText role="caption" muted numberOfLines={1}>
                        {session.message_count} {t('messages')} ·{' '}
                        {session.mode}
                        {session.last_message
                          ? ` · ${session.last_message}`
                          : ''}
                      </DText>
                    </View>
                    <ArrowRight size={14} color={colors.mutedForeground} />
                  </Pressable>
                ))}

                <Pressable
                  testID="session-camp-fresh-angle-btn"
                  accessibilityRole="button"
                  accessibilityLabel={t('Start from a fresh angle')}
                  onPress={() => openStudy()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 4,
                  }}
                >
                  <Plus size={13} color={colors.primary} />
                  <DText
                    role="caption"
                    style={{ color: colors.primary, fontWeight: '600' }}
                  >
                    {t('Start from a fresh angle')}
                  </DText>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Route Modal */}
      <EditTopicRouteDialog
        open={routeEditorOpen}
        topic={topic}
        onClose={() => setRouteEditorOpen(false)}
        onSaved={() => {
          setSelectedObjectiveId(pathId, null);
          setRouteEditorOpen(false);
        }}
      />

      {/* Reset Progress Confirmation Modal */}
      <Dialog
        open={confirmAction === 'reset'}
        title={t('Reset learning progress?')}
        onClose={() => setConfirmAction(null)}
      >
        <View testID="confirm-reset-dialog" style={{ gap: 14 }}>
          <DText role="small" muted>
            {t(
              'Modules and knowledge points stay. Mastery evidence, pending questions, and review schedules will be cleared.',
            )}
          </DText>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              onPress={() => setConfirmAction(null)}
            >
              {t('Cancel')}
            </Button>
            <Button
              testID="confirm-reset-submit-btn"
              variant="primary"
              size="sm"
              onPress={() => {
                const res = resetTopicProgress(pathId);
                if (!res.ok) {
                  setActionError(res.error ?? t('Reset failed'));
                } else {
                  setSelectedObjectiveId(pathId, null);
                }
                setConfirmAction(null);
              }}
            >
              {t('Confirm reset')}
            </Button>
          </View>
        </View>
      </Dialog>

      {/* Delete Topic Confirmation Modal */}
      <Dialog
        open={confirmAction === 'delete'}
        title={t('Permanently delete this topic?')}
        onClose={() => setConfirmAction(null)}
      >
        <View testID="confirm-delete-dialog" style={{ gap: 14 }}>
          <DText role="small" muted>
            {t(
              'The map, evidence, review schedule, and linked records will be deleted. This cannot be undone.',
            )}
          </DText>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              onPress={() => setConfirmAction(null)}
            >
              {t('Cancel')}
            </Button>
            <Button
              testID="confirm-delete-submit-btn"
              variant="danger"
              size="sm"
              onPress={() => {
                const res = deleteTopic(pathId);
                setConfirmAction(null);
                if (res.ok) {
                  router.replace('/learning/mastery' as Href);
                } else {
                  setActionError(res.error ?? t('Delete failed'));
                }
              }}
            >
              {t('Delete permanently')}
            </Button>
          </View>
        </View>
      </Dialog>
    </View>
  );
}
