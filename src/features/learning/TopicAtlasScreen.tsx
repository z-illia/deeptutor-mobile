import type { Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Clock3,
  Plus,
  RotateCcw,
  Route,
  Sparkles,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha } from '@/shared/design/tokens';
import { Button } from '@/shared/ui/Controls';
import { LoadingState } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { CreateTopicWizard } from './CreateTopicWizard';
import { useLearning, type AtlasLoadState } from './LearningProvider';
import { topicDisplayName, type MasteryTopic } from './model';

function TopicMapCard({ topic }: { topic: MasteryTopic }) {
  const { colors } = useDesign();
  const t = useCopy();
  const { map, metadata } = topic;
  const total = map.counts.total;
  const mastered = map.counts.mastered;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const displayName = topicDisplayName(topic, t('Exploration trail'));
  const dueCount = topic.reviews.filter((r) => r.due).length;

  return (
    <Pressable
      testID={`topic-map-card-${topic.path_id}`}
      accessibilityRole="button"
      accessibilityLabel={`Open ${displayName}, ${mastered} of ${total} knowledge points complete`}
      onPress={() =>
        router.push(
          `/learning/mastery/${encodeURIComponent(topic.path_id)}` as Href,
        )
      }
      style={({ pressed }) => ({
        flexGrow: 1,
        flexBasis: 310,
        minWidth: 270,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: pressed ? alpha(colors.accent, 0.5) : colors.card,
        overflow: 'hidden',
      })}
    >
      <View style={{ padding: 16, gap: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              flex: 1,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: alpha(colors.primary, 0.12),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {map.complete ? (
                <CircleCheck size={18} color={colors.primary} />
              ) : (
                <Route size={18} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <DText
                style={{ fontSize: 15, fontWeight: '600' }}
                numberOfLines={1}
              >
                {displayName}
              </DText>
              <DText role="caption" muted>
                {pct}% {t('complete')}
                {dueCount > 0 ? ` · ${dueCount} ${t('due')}` : ''}
              </DText>
            </View>
          </View>
          <ArrowRight size={15} color={colors.mutedForeground} />
        </View>

        <DText role="small" muted numberOfLines={2}>
          {metadata.description || metadata.goal}
        </DText>

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
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          borderTopWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: alpha(colors.muted, 0.25),
        }}
      >
        <DText role="caption" muted>
          {map.modules.length} {t('modules')}
        </DText>
        <DText role="caption" muted>
          {mastered}/{total} {t('knowledge points')}
        </DText>
        <DText role="caption" muted>
          {topic.session_count} {t('sessions')}
        </DText>
      </View>
    </Pressable>
  );
}

export function TopicAtlasScreen() {
  const { colors } = useDesign();
  const t = useCopy();
  const { workspace } = useFixtures();
  const params = useLocalSearchParams<{ create?: string }>();
  const {
    atlasState,
    setAtlasState,
    getWorkspaceTopics,
    resetLearningFixtures,
  } = useLearning();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [dismissedQueryCreate, setDismissedQueryCreate] = useState(false);
  const isWizardOpen =
    wizardOpen || (params.create === '1' && !dismissedQueryCreate);

  const openWizard = () => {
    setDismissedQueryCreate(false);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    if (params.create === '1') {
      setDismissedQueryCreate(true);
    }
  };

  const workspaceTopics = useMemo(
    () => getWorkspaceTopics(workspace),
    [getWorkspaceTopics, workspace],
  );

  const dueTopics = useMemo(
    () =>
      workspaceTopics.filter((topic) => topic.reviews.some((r) => r.due)),
    [workspaceTopics],
  );

  const dueBeacons = useMemo(
    () =>
      dueTopics.reduce(
        (sum, topic) => sum + topic.reviews.filter((r) => r.due).length,
        0,
      ),
    [dueTopics],
  );

  const firstDueTopic = dueTopics[0] ?? null;
  const firstDueReview =
    firstDueTopic?.reviews.find((r) => r.due) ?? null;

  return (
    <View
      testID="topic-atlas-screen"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingVertical: 18,
          gap: 18,
          maxWidth: 1120,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1, minWidth: 240, gap: 4 }}>
            <Pressable
              testID="atlas-back-to-learning-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Back to Learning Hub')}
              onPress={() => router.push('/learning' as Href)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 4,
              }}
            >
              <ArrowLeft size={14} color={colors.mutedForeground} />
              <DText role="caption" muted>
                {t('All learning')}
              </DText>
            </Pressable>
            <DText
              role="caption"
              muted
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.1,
                fontWeight: '600',
              }}
            >
              {t('Mastery Path')}
            </DText>
            <DText role="title" style={{ fontSize: 22, fontWeight: '700' }}>
              {t('Topic Atlas')}
            </DText>
            <DText role="small" muted>
              {t(
                'Build a learning route, study with a tutor, and follow spaced reviews.',
              )}
            </DText>
          </View>

          <Button
            testID="atlas-new-topic-btn"
            variant="primary"
            size="sm"
            icon={<Plus size={14} color={colors.primaryForeground} />}
            onPress={openWizard}
          >
            {t('New topic')}
          </Button>
        </View>

        {/* Atlas state simulation controls */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <DText role="caption" muted>
            {t('Atlas state:')}
          </DText>
          {(['ready', 'loading', 'empty', 'error'] as AtlasLoadState[]).map(
            (candidate) => (
              <Pressable
                key={candidate}
                testID={`atlas-state-${candidate}`}
                accessibilityRole="button"
                accessibilityLabel={`Set atlas state ${candidate}`}
                accessibilityState={{ selected: atlasState === candidate }}
                onPress={() => setAtlasState(candidate)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor:
                    atlasState === candidate ? colors.primary : colors.border,
                  backgroundColor:
                    atlasState === candidate
                      ? alpha(colors.primary, 0.12)
                      : colors.card,
                }}
              >
                <DText
                  role="caption"
                  style={{
                    color:
                      atlasState === candidate
                        ? colors.primary
                        : colors.mutedForeground,
                    fontWeight: atlasState === candidate ? '600' : '400',
                  }}
                >
                  {candidate}
                </DText>
              </Pressable>
            ),
          )}
        </View>

        {/* Due reviews banner */}
        {atlasState === 'ready' && dueBeacons > 0 && firstDueTopic ? (
          <View
            testID="atlas-due-reviews-banner"
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: alpha(colors.primary, 0.35),
              backgroundColor: alpha(colors.primary, 0.06),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                flex: 1,
                minWidth: 220,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: alpha(colors.primary, 0.14),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock3 size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <DText style={{ fontWeight: '600' }}>
                  {dueBeacons} {t('reviews are due across')} {dueTopics.length}{' '}
                  {t('topics')}
                </DText>
                <DText role="caption" muted>
                  {t(
                    'A short check keeps mastered knowledge points from slipping.',
                  )}
                </DText>
              </View>
            </View>

            <Button
              testID="atlas-start-review-btn"
              variant="secondary"
              size="sm"
              onPress={() =>
                router.push(
                  `/learning/mastery/${encodeURIComponent(firstDueTopic.path_id)}/sessions?mode=review${
                    firstDueReview
                      ? `&focus=${encodeURIComponent(firstDueReview.knowledge_point_name)}`
                      : ''
                  }` as Href,
                )
              }
            >
              {`${t('Start review')}: ${topicDisplayName(firstDueTopic, t('Exploration trail'))}`}
            </Button>
          </View>
        ) : null}

        {/* Content states */}
        {atlasState === 'loading' ? (
          <LoadingState label={t('Loading Topic Atlas...')} />
        ) : atlasState === 'error' ? (
          <View
            testID="atlas-error-state"
            style={{
              padding: 20,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AlertCircle size={24} color={colors.destructive} />
            <DText style={{ fontWeight: '600' }}>
              {t('Topics could not be loaded')}
            </DText>
            <Button
              testID="atlas-retry-btn"
              variant="secondary"
              size="sm"
              icon={<RotateCcw size={14} color={colors.foreground} />}
              onPress={() => {
                resetLearningFixtures();
                setAtlasState('ready');
              }}
            >
              {t('Retry')}
            </Button>
          </View>
        ) : workspaceTopics.length === 0 ? (
          <View
            testID="atlas-empty-state"
            style={{
              padding: 28,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: alpha(colors.primary, 0.12),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Route size={22} color={colors.primary} />
            </View>
            <DText style={{ fontSize: 16, fontWeight: '600' }}>
              {t('Your atlas is still uncharted')}
            </DText>
            <DText
              role="small"
              muted
              style={{ textAlign: 'center', maxWidth: 420 }}
            >
              {t(
                'Name a learning goal, connect your knowledge bases or notes, and DeepTutor will turn it into a map of modules and knowledge points.',
              )}
            </DText>
            <Button
              testID="atlas-chart-first-map-btn"
              variant="primary"
              size="sm"
              icon={<Sparkles size={14} color={colors.primaryForeground} />}
              onPress={openWizard}
            >
              {t('Chart the first map')}
            </Button>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            {workspaceTopics.map((topic) => (
              <TopicMapCard key={topic.path_id} topic={topic} />
            ))}
          </View>
        )}
      </ScrollView>

      <CreateTopicWizard
        open={isWizardOpen}
        onClose={closeWizard}
        onCreated={(topic, sessionId) => {
          closeWizard();
          router.push(
            `/learning/mastery/${encodeURIComponent(topic.path_id)}/sessions/${encodeURIComponent(sessionId)}?mode=outline` as Href,
          );
        }}
      />
    </View>
  );
}
