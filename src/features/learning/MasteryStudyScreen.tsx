import type { Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  X,
} from 'lucide-react-native';
import { useLayoutDimensions } from '@/hooks/use-layout-dimensions';
import { ChatMarkdown } from '@/features/chat/ChatMarkdown';
import { useCopy } from '@/features/entry/copy';
import { useFavorites } from '@/features/favorites/FavoritesProvider';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha, geometry } from '@/shared/design/tokens';
import { Button } from '@/shared/ui/Controls';
import { Dialog } from '@/shared/ui/Dialog';
import { DText } from '@/shared/ui/Text';
import {
  useLearning,
  type MasteryTurnMessage,
} from './LearningProvider';
import {
  currentWaypoint,
  MASTERY_MODE_LABELS,
  MASTERY_MODES,
  masteryOpeningMessage,
  topicDisplayName,
  type MapKnowledgePoint,
  type MasteryCheckpointQuestion,
  type MasteryMode,
  type MasteryTopic,
} from './model';

const MODE_PRESENTATION: Record<
  MasteryMode,
  { title: string; subtitle: string }
> = {
  outline: {
    title: 'Design the learning outline',
    subtitle:
      'Agree on the modules and knowledge points before diving into study, or revise the route as your goals change.',
  },
  study: {
    title: 'Guided mastery session',
    subtitle:
      'Work through the current knowledge point with explanations, examples, and a quick check before moving on.',
  },
  review: {
    title: 'Spaced review',
    subtitle:
      'Revisit due knowledge points to keep them fresh and adjust the review schedule.',
  },
};

const STARTERS: Record<MasteryMode, readonly string[]> = {
  outline: [
    'Propose an initial outline from the goal and materials',
    'Show me the current modules and knowledge points',
    'Add a module focused on hands-on practice',
  ],
  study: [
    'Start the next knowledge point',
    'Explain the current concept from first principles',
    'Give me a quick check question',
  ],
  review: [
    'Start the due reviews',
    'Quiz me on the weakest knowledge point',
    'Summarize what I should revisit today',
  ],
};

function ModeSwitch({
  mode,
  onSelect,
  disabled = false,
}: {
  mode: MasteryMode;
  onSelect: (next: MasteryMode) => void;
  disabled?: boolean;
}) {
  const { colors } = useDesign();
  const t = useCopy();
  return (
    <View
      testID="mastery-mode-switch"
      accessibilityRole="radiogroup"
      accessibilityLabel={t('Conversation mode')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        padding: 3,
        borderRadius: 9,
        backgroundColor: alpha(colors.muted, 0.7),
      }}
    >
      {MASTERY_MODES.map((candidate) => {
        const active = candidate === mode;
        return (
          <Pressable
            key={candidate}
            testID={`mastery-mode-${candidate}`}
            accessibilityRole="button"
            accessibilityLabel={t(MASTERY_MODE_LABELS[candidate])}
            accessibilityState={{ selected: active, disabled }}
            disabled={disabled || active}
            onPress={() => {
              if (!active && !disabled) {
                onSelect(candidate);
              }
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 7,
              backgroundColor: active ? colors.background : 'transparent',
              opacity: disabled && !active ? 0.5 : 1,
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                borderWidth: 1.5,
                borderColor: active ? colors.primary : colors.mutedForeground,
                backgroundColor: active ? colors.primary : 'transparent',
              }}
            />
            <DText
              role="caption"
              style={{
                fontWeight: active ? '600' : '500',
                color: active ? colors.foreground : colors.mutedForeground,
              }}
            >
              {t(MASTERY_MODE_LABELS[candidate])}
            </DText>
          </Pressable>
        );
      })}
    </View>
  );
}

function PointMark({
  point,
  current,
  justMastered,
  colors,
}: {
  point: MapKnowledgePoint;
  current: boolean;
  justMastered: boolean;
  colors: ReturnType<typeof useDesign>['colors'];
}) {
  if (point.status === 'mastered') {
    return (
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: colors.primary,
          borderWidth: justMastered ? 2 : 0,
          borderColor: colors.foreground,
        }}
      />
    );
  }
  if (current) {
    return (
      <View
        style={{
          width: 9,
          height: 9,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: colors.primary,
          backgroundColor: colors.background,
        }}
      />
    );
  }
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        borderWidth: 1.2,
        borderColor:
          point.status === 'learning'
            ? alpha(colors.primary, 0.65)
            : colors.mutedForeground,
      }}
    />
  );
}

function StudyOutlineRail({
  topic,
  currentPointId,
  justMasteredId,
  collapsed,
  onToggleCollapsed,
  onSelectWaypoint,
}: {
  topic: MasteryTopic;
  currentPointId: string;
  justMasteredId: string | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectWaypoint: (pointName: string) => void;
}) {
  const { colors } = useDesign();
  const t = useCopy();
  const { mastered, total } = topic.map.counts;

  if (collapsed) {
    return (
      <Pressable
        testID="study-outline-show-btn"
        accessibilityRole="button"
        accessibilityLabel={t('Show outline')}
        onPress={onToggleCollapsed}
        style={{
          width: 38,
          borderRightWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          alignItems: 'center',
          paddingTop: 14,
          gap: 8,
        }}
      >
        <ChevronsRight size={15} color={colors.mutedForeground} />
        <DText
          role="caption"
          muted
          style={{ fontSize: 10, fontWeight: '600' }}
        >
          {mastered}/{total}
        </DText>
      </Pressable>
    );
  }

  return (
    <View
      testID="study-outline-rail"
      style={{
        width: 248,
        borderRightWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        padding: 12,
        gap: 12,
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
          role="caption"
          muted
          style={{
            textTransform: 'uppercase',
            letterSpacing: 1.1,
            fontWeight: '600',
          }}
        >
          {t('Outline')}
        </DText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <DText
            testID="study-outline-progress"
            role="caption"
            muted
            style={{ fontWeight: '600' }}
          >
            {mastered}/{total}
          </DText>
          <Pressable
            testID="study-outline-hide-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Hide outline')}
            onPress={onToggleCollapsed}
            style={{ padding: 4 }}
          >
            <ChevronsLeft size={14} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 14 }}>
        {topic.map.modules.length === 0 ? (
          <DText role="caption" muted>
            {t(
              'No modules yet — send a message in Outline mode to generate your route.',
            )}
          </DText>
        ) : (
          topic.map.modules.map((mod, idx) => (
            <View key={mod.id} style={{ gap: 6 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: 6,
                }}
              >
                <DText
                  role="caption"
                  muted
                  style={{ fontWeight: '700', width: 20 }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </DText>
                <DText
                  role="small"
                  style={{ fontWeight: '600', flex: 1 }}
                  numberOfLines={2}
                >
                  {mod.name}
                </DText>
              </View>

              <View
                style={{
                  marginLeft: 8,
                  paddingLeft: 10,
                  borderLeftWidth: 1,
                  borderColor: colors.border,
                  gap: 4,
                }}
              >
                {mod.knowledge_points.map((pt) => {
                  const isCurrent = pt.id === currentPointId;
                  const isJustMastered = pt.id === justMasteredId;
                  return (
                    <Pressable
                      key={pt.id}
                      testID={`study-outline-point-${pt.id}`}
                      accessibilityRole="button"
                      accessibilityLabel={pt.name}
                      onPress={() => onSelectWaypoint(pt.name)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 5,
                        paddingHorizontal: 6,
                        borderRadius: 6,
                        backgroundColor: isJustMastered
                          ? alpha(colors.primary, 0.16)
                          : isCurrent
                            ? alpha(colors.primary, 0.08)
                            : 'transparent',
                      }}
                    >
                      <PointMark
                        point={pt}
                        current={isCurrent}
                        justMastered={isJustMastered}
                        colors={colors}
                      />
                      <DText
                        role="caption"
                        style={{
                          flex: 1,
                          fontWeight:
                            isCurrent || isJustMastered ? '600' : '400',
                          color:
                            isCurrent || isJustMastered
                              ? colors.foreground
                              : colors.mutedForeground,
                        }}
                        numberOfLines={2}
                      >
                        {pt.name}
                      </DText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function MasteryQuestionCard({
  pathId,
  question,
}: {
  pathId: string;
  question: MasteryCheckpointQuestion;
}) {
  const { colors } = useDesign();
  const t = useCopy();
  const {
    completedCheckpointsByPoint,
    submitCheckpointAnswer,
    skipCheckpointQuestion,
  } = useLearning();

  const existing = completedCheckpointsByPoint[question.knowledgePointId];
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    existing?.selectedOptionId || '',
  );

  const [answerError, setAnswerError] = useState<string | null>(null);
  const submitted = Boolean(existing && !existing.skipped);
  const skipped = Boolean(existing?.skipped);

  return (
    <View
      testID={`mastery-checkpoint-card-${question.knowledgePointId}`}
      style={{
        marginTop: 8,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: alpha(colors.primary, 0.4),
        backgroundColor: alpha(colors.primary, 0.04),
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} color={colors.primary} />
          <DText
            role="caption"
            style={{
              color: colors.primary,
              fontWeight: '700',
              textTransform: 'uppercase',
            }}
          >
            {question.header}
          </DText>
        </View>
        <DText role="caption" muted numberOfLines={1}>
          {question.knowledgePointName}
        </DText>
      </View>

      <DText style={{ fontWeight: '600', lineHeight: 20 }}>
        {question.prompt}
      </DText>

      <View style={{ gap: 8 }}>
        {question.options.map((opt) => {
          const active =
            (submitted ? existing?.selectedOptionId : selectedOptionId) ===
            opt.id;
          return (
            <Pressable
              key={opt.id}
              testID={`checkpoint-option-${opt.id}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, disabled: submitted }}
              accessibilityLabel={opt.label}
              disabled={submitted}
              onPress={() => setSelectedOptionId(opt.id)}
              style={{
                padding: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active
                  ? alpha(colors.primary, 0.1)
                  : colors.card,
                gap: 3,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    borderWidth: 1.5,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {active ? (
                    <Check size={10} color={colors.primaryForeground} />
                  ) : null}
                </View>
                <DText
                  role="small"
                  style={{ fontWeight: active ? '600' : '500', flex: 1 }}
                >
                  {opt.label}
                </DText>
              </View>
              {opt.description ? (
                <DText role="caption" muted style={{ paddingLeft: 24 }}>
                  {opt.description}
                </DText>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {submitted ? (
        <View
          testID={`checkpoint-result-${question.knowledgePointId}`}
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: existing?.isCorrect
              ? alpha(colors.primary, 0.12)
              : alpha(colors.destructive, 0.12),
            gap: 4,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <CheckCircle2
              size={15}
              color={
                existing?.isCorrect ? colors.primary : colors.destructive
              }
            />
            <DText
              role="small"
              style={{
                fontWeight: '700',
                color: existing?.isCorrect
                  ? colors.primary
                  : colors.destructive,
              }}
            >
              {existing?.isCorrect
                ? t('Gate cleared! Waypoint mastered.')
                : t('Needs another pass — review the explanation below.')}
            </DText>
          </View>
          <DText role="caption" style={{ lineHeight: 18 }}>
            {question.explanation}
          </DText>
        </View>
      ) : skipped ? (
        <DText role="caption" muted>
          {t('Skipped for now — you can answer this checkpoint anytime.')}
        </DText>
      ) : null}

      {answerError && <DText accessibilityRole="alert" style={{ color: colors.destructive }}>{t(answerError)}</DText>}
      {!submitted ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Button
            testID={`checkpoint-skip-${question.knowledgePointId}`}
            variant="ghost"
            size="sm"
            onPress={() =>
              skipCheckpointQuestion(pathId, question.knowledgePointId)
            }
          >
            {t('Skip for now')}
          </Button>
          <Button
            testID={`checkpoint-submit-${question.knowledgePointId}`}
            variant="primary"
            size="sm"
            disabled={!selectedOptionId}
            onPress={() => {
              const result = submitCheckpointAnswer(
                pathId,
                question.knowledgePointId,
                selectedOptionId,
              );
              setAnswerError(result.ok ? null : result.error ?? 'Please retry.');
            }}
          >
            {t('Submit answer')}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export function MasteryStudyScreen({
  pathId,
  sessionId: routeSessionId,
  queryMode,
  queryFocus,
}: {
  pathId: string;
  sessionId?: string | null;
  queryMode?: string | null;
  queryFocus?: string | null;
}) {
  const { colors } = useDesign();
  const t = useCopy();
  const { openSaveModal } = useFavorites();
  const { width } = useLayoutDimensions();
  const compact = width < geometry.tablet;

  const {
    studyDrafts,
    setStudyDraft,
    stopMasteryMessage,
    getSelectedObjectiveId,
    getTopic,
    getSessionsForTopic,
    getActiveSessionForTopic,
    getSessionMode,
    setSessionMode,
    getSessionMessages,
    isSessionStreaming,
    sendMasteryMessage,
    justMasteredPointId,
    celebrationNonce,
    dismissCelebration,
  } = useLearning();

  const topic = getTopic(pathId);
  const sessions = getSessionsForTopic(pathId);
  const activeSession = getActiveSessionForTopic(pathId, routeSessionId);
  const activeSessionId = activeSession?.session_id ?? routeSessionId ?? null;
  const mode = getSessionMode(pathId, activeSessionId, queryMode);
  const messages = getSessionMessages(activeSessionId);
  const isStreaming = isSessionStreaming(activeSessionId);

  const [outlineCollapsed, setOutlineCollapsed] = useState(compact);
  const [mobileOutlineSheetOpen, setMobileOutlineSheetOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const draftKey = `${pathId}::${activeSessionId ?? '__new__'}`;
  const draft = studyDrafts[draftKey] ?? '';
  const setDraft = (text: string) => setStudyDraft(draftKey, text);
  const [sendError, setSendError] = useState<string | null>(null);

  const handledFocusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!topic) return;
    const focusKey = `${pathId}:${queryMode ?? ''}:${queryFocus ?? ''}`;
    if (!routeSessionId && queryMode && handledFocusRef.current !== focusKey) {
      setSessionMode(pathId, activeSessionId, queryMode === 'outline' || queryMode === 'review' ? queryMode : 'study');
    }
    if (queryFocus && handledFocusRef.current !== focusKey) {
      handledFocusRef.current = focusKey;
      const openingMode = !routeSessionId && (queryMode === 'study' || queryMode === 'review' || queryMode === 'outline') ? queryMode : mode;
      const opening = masteryOpeningMessage(openingMode, queryFocus);
      const point = topic.map.modules.flatMap(m => m.knowledge_points).find(p => p.name === queryFocus);
      sendMasteryMessage(pathId, activeSessionId, opening, openingMode, point?.id);
    }
    handledFocusRef.current = focusKey;
  }, [activeSessionId, mode, pathId, queryFocus, queryMode, routeSessionId, sendMasteryMessage, setSessionMode, topic]);

  const selectedPointId = getSelectedObjectiveId(pathId);
  const waypoint = useMemo(
    () => topic?.map.modules.flatMap(m => m.knowledge_points).find(p => p.id === selectedPointId) ?? (topic ? currentWaypoint(topic) : null),
    [topic, selectedPointId],
  );
  const currentPointId = waypoint?.id ?? '';

  if (!topic || (routeSessionId && !activeSession)) {
    return (
      <View
        testID="mastery-study-missing"
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
          {t(topic ? 'This session could not be found' : 'This map could not be found')}
        </DText>
        <Button
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
  const presentation = MODE_PRESENTATION[mode];
  const starters = STARTERS[mode];

  const handleSend = (textOverride?: string, pointName?: string) => {
    const text = (textOverride ?? draft).trim();
    if (!text) return;
    const point = topic.map.modules.flatMap(m => m.knowledge_points).find(p => p.name === pointName);
    const res = sendMasteryMessage(pathId, activeSessionId, text, pointName ? 'study' : mode, point?.id ?? selectedPointId ?? undefined);
    setSendError(res.ok ? null : res.error ?? 'Could not send message. Please retry.');
    if (res.ok) {
      if (!textOverride) setDraft('');
      if (!routeSessionId && res.sessionId) {
        router.setParams({ sessionId: res.sessionId });
      }
    }
  };

  return (
    <View
      testID="mastery-study-screen"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {/* LevelUpCelebration banner when a knowledge point gate is cleared */}
      {justMasteredPointId && celebrationNonce > 0 ? (
        <View
          testID="level-up-celebration"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: colors.primary,
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
            <Sparkles size={16} color={colors.primaryForeground} />
            <DText
              role="small"
              style={{
                color: colors.primaryForeground,
                fontWeight: '700',
                flex: 1,
              }}
            >
              {t('Waypoint mastered! Progress and spaced review trail updated.')}
            </DText>
          </View>
          <Pressable
            testID="dismiss-celebration-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Dismiss celebration')}
            onPress={dismissCelebration}
            style={{ padding: 4 }}
          >
            <X size={15} color={colors.primaryForeground} />
          </Pressable>
        </View>
      ) : null}

      {/* Top Header */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            flex: 1,
            minWidth: 180,
          }}
        >
          <Pressable
            testID="study-back-to-topic-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Back to topic')}
            onPress={() =>
              router.push(
                `/learning/mastery/${encodeURIComponent(pathId)}` as Href,
              )
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 4,
            }}
          >
            <ArrowLeft size={16} color={colors.foreground} />
            <DText style={{ fontWeight: '600' }} numberOfLines={1}>
              {displayName}
            </DText>
          </Pressable>

          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: colors.muted,
            }}
          >
            <DText
              testID="study-header-progress"
              role="caption"
              style={{ fontWeight: '600' }}
            >
              {topic.map.counts.mastered}/{topic.map.counts.total}
            </DText>
          </View>
        </View>

        <ModeSwitch
          mode={mode}
          disabled={isStreaming}
          onSelect={(nextMode) =>
            setSessionMode(pathId, activeSessionId, nextMode)
          }
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {compact ? (
            <Pressable
              testID="study-mobile-outline-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Outline')}
              onPress={() => setMobileOutlineSheetOpen(true)}
              style={{
                paddingHorizontal: 9,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
              }}
            >
              <DText role="caption" style={{ fontWeight: '600' }}>
                {t('Outline')} ({topic.map.counts.mastered}/
                {topic.map.counts.total})
              </DText>
            </Pressable>
          ) : null}

          <Pressable
            testID="study-sessions-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Mastery sessions')}
            onPress={() => setSessionsModalOpen(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 9,
              paddingVertical: 6,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <MessageCircle size={13} color={colors.mutedForeground} />
            <DText role="caption">{sessions.length}</DText>
          </Pressable>

          <Pressable
            testID="study-save-favorites-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Save to Favorites')}
            onPress={() =>
              openSaveModal({
                payload: {
                  recordType: 'chat',
                  title: activeSession?.title || displayName,
                  userQuery: messages.find((m) => m.role === 'user')?.content || '',
                  output: messages
                    .map((m) => `**${m.role.toUpperCase()}:**\n${m.content}`)
                    .join('\n\n'),
                  metadata: {
                    source_surface: 'mastery',
                    mastery_path_id: pathId,
                    mastery_mode: mode,
                  },
                },
                messages: messages.map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
              })
            }
            style={{
              padding: 7,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <Bookmark size={14} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            testID="study-session-viewer-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Session Viewer')}
            onPress={() =>
              router.push(
                `/ui/session-viewer?sessionId=${encodeURIComponent(
                  activeSessionId || 'session-general-mastery-1',
                )}` as Href,
              )
            }
            style={{
              padding: 7,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <Activity size={14} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      {/* Main Workspace Row: Collapsible StudyOutline + Conversation */}
      <View style={{ flex: 1, flexDirection: 'row', minHeight: 0 }}>
        {!compact ? (
          <StudyOutlineRail
            topic={topic}
            currentPointId={currentPointId}
            justMasteredId={justMasteredPointId}
            collapsed={outlineCollapsed}
            onToggleCollapsed={() => setOutlineCollapsed((prev) => !prev)}
            onSelectWaypoint={(pointName) => {
              setSessionMode(pathId, activeSessionId, 'study');
              handleSend(masteryOpeningMessage('study', pointName), pointName);
            }}
          />
        ) : null}

        {/* Conversation Column */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 14,
              maxWidth: 820,
              width: '100%',
              alignSelf: 'center',
            }}
          >
            {/* Current Waypoint Context Banner */}
            <View
              testID="study-mode-banner"
              style={{
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                gap: 6,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <DText style={{ fontWeight: '600' }}>
                  {t(presentation.title)}
                </DText>
                {waypoint ? (
                  <DText
                    testID="study-current-waypoint-label"
                    role="caption"
                    style={{ color: colors.primary, fontWeight: '600' }}
                    numberOfLines={1}
                  >
                    {waypoint.name}
                  </DText>
                ) : null}
              </View>
              <DText role="caption" muted>
                {t(presentation.subtitle)}
              </DText>
            </View>

            {/* Starter Prompts */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {starters.map((promptText, idx) => (
                <Pressable
                  key={promptText}
                  testID={`study-starter-${idx}`}
                  accessibilityRole="button"
                  accessibilityLabel={promptText}
                  disabled={isStreaming}
                  onPress={() => handleSend(promptText)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: pressed
                      ? alpha(colors.accent, 0.6)
                      : colors.card,
                  })}
                >
                  <DText role="caption" style={{ fontWeight: '500' }}>
                    {t(promptText)}
                  </DText>
                </Pressable>
              ))}
            </View>

            {/* Message History */}
            {messages.map((msg: MasteryTurnMessage) => (
              <View
                key={msg.id}
                testID={`study-msg-${msg.id}`}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'stretch',
                  maxWidth: msg.role === 'user' ? '86%' : '100%',
                  padding: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor:
                    msg.role === 'user'
                      ? alpha(colors.primary, 0.35)
                      : colors.border,
                  backgroundColor:
                    msg.role === 'user'
                      ? alpha(colors.primary, 0.1)
                      : colors.card,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <DText
                    role="caption"
                    muted
                    style={{ fontWeight: '600', textTransform: 'uppercase' }}
                  >
                    {msg.role === 'user' ? t('You') : t('DeepTutor')} ·{' '}
                    {t(MASTERY_MODE_LABELS[msg.mode])}
                  </DText>
                  {msg.outlineUpdated ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 999,
                        backgroundColor: alpha(colors.primary, 0.12),
                      }}
                    >
                      <Check size={11} color={colors.primary} />
                      <DText
                        role="caption"
                        style={{ color: colors.primary, fontWeight: '600' }}
                      >
                        {t('Outline updated')}
                      </DText>
                    </View>
                  ) : null}
                </View>

                <ChatMarkdown content={msg.content} />

                {msg.checkpoint ? (
                  <MasteryQuestionCard
                    pathId={pathId}
                    question={msg.checkpoint}
                  />
                ) : null}
              </View>
            ))}
          </ScrollView>

          {/* Bottom Composer */}
          <View
            style={{
              borderTopWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                maxWidth: 820,
                width: '100%',
                alignSelf: 'center',
              }}
            >
              {sendError && <DText accessibilityRole="alert" style={{ color: colors.destructive }}>{t(sendError)}</DText>}
              <TextInput
                testID="study-composer-input"
                accessibilityLabel={t('Study message input')}
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => handleSend()}
                placeholder={
                  mode === 'outline'
                    ? t('Ask to adjust modules or knowledge points...')
                    : mode === 'review'
                      ? t('Answer the review prompt or ask for a hint...')
                      : t('Ask a question or request a gate check...')
                }
                placeholderTextColor={colors.mutedForeground}
                style={{
                  flex: 1,
                  minHeight: 40,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  paddingHorizontal: 12,
                  fontSize: 13,
                  color: colors.foreground,
                }}
              />
              <Button
                testID="study-send-btn"
                variant="primary"
                size="sm"
                disabled={!isStreaming && !draft.trim()}
                icon={<Send size={14} color={colors.primaryForeground} />}
                onPress={() => isStreaming && activeSessionId ? stopMasteryMessage(activeSessionId) : handleSend()}
              >
                {t(isStreaming ? 'Stop' : 'Send')}
              </Button>
            </View>
          </View>
        </View>
      </View>

      {/* Mobile Outline Modal Sheet */}
      <Dialog
        open={mobileOutlineSheetOpen}
        title={t('Outline')}
        onClose={() => setMobileOutlineSheetOpen(false)}
      >
        <View style={{ maxHeight: 360, gap: 10 }}>
          {topic.map.modules.map((mod, idx) => (
            <View key={mod.id} style={{ gap: 4 }}>
              <DText role="small" style={{ fontWeight: '600' }}>
                {idx + 1}. {mod.name} ({mod.mastered}/{mod.total})
              </DText>
              {mod.knowledge_points.map((pt) => (
                <Pressable
                  key={pt.id}
                  testID={`mobile-outline-point-${pt.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={pt.name}
                  onPress={() => {
                    setMobileOutlineSheetOpen(false);
                    setSessionMode(pathId, activeSessionId, 'study');
                    handleSend(masteryOpeningMessage('study', pt.name), pt.name);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor:
                      pt.id === currentPointId
                        ? alpha(colors.primary, 0.1)
                        : 'transparent',
                  }}
                >
                  <PointMark
                    point={pt}
                    current={pt.id === currentPointId}
                    justMastered={pt.id === justMasteredPointId}
                    colors={colors}
                  />
                  <DText role="caption" style={{ flex: 1 }}>
                    {pt.name}
                  </DText>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </Dialog>

      {/* Sessions Switcher Modal */}
      <Dialog
        open={sessionsModalOpen}
        title={t('Mastery sessions')}
        onClose={() => setSessionsModalOpen(false)}
      >
        <View testID="study-sessions-modal" style={{ gap: 8 }}>
          {sessions.map((s) => {
            const active = s.session_id === activeSessionId;
            return (
              <Pressable
                key={s.session_id}
                testID={`study-switch-session-${s.session_id}`}
                accessibilityRole="button"
                accessibilityLabel={s.title}
                onPress={() => {
                  setSessionsModalOpen(false);
                  router.push(
                    `/learning/mastery/${encodeURIComponent(pathId)}/sessions/${encodeURIComponent(s.session_id)}` as Href,
                  );
                }}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active
                    ? alpha(colors.primary, 0.08)
                    : colors.background,
                  gap: 2,
                }}
              >
                <DText role="small" style={{ fontWeight: '600' }}>
                  {s.title}
                </DText>
                <DText role="caption" muted>
                  {s.mode} · {s.message_count} {t('messages')}
                </DText>
              </Pressable>
            );
          })}
          <Button
            testID="study-new-session-btn"
            variant="secondary"
            size="sm"
            icon={<Plus size={13} color={colors.foreground} />}
            onPress={() => {
              setSessionsModalOpen(false);
              const res = sendMasteryMessage(
                pathId,
                null,
                masteryOpeningMessage(mode, waypoint?.name),
                mode,
              );
              if (res.ok && res.sessionId) {
                router.push(
                  `/learning/mastery/${encodeURIComponent(pathId)}/sessions/${encodeURIComponent(res.sessionId)}` as Href,
                );
              }
            }}
          >
            {t('Start from a fresh angle')}
          </Button>
        </View>
      </Dialog>

      {/* Save to Favorites Modal (`UI-FAVORITES-SAVE`) */}
    </View>
  );
}
