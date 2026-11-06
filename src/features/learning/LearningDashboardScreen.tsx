import type { Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Clock3,
  FileText,
  Plus,
  RotateCcw,
  Route,
  Search,
  Sparkles,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha } from '@/shared/design/tokens';
import { Button } from '@/shared/ui/Controls';
import { EmptyState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import {
  useLearning,
  type LearningHubLoadState,
} from './LearningProvider';
import {
  filterLearningRecent,
  LEARNING_SURFACES,
  visibleLearningSurfaces,
  type LearningKind,
  type LearningSurfaceDefinition,
} from './model';
import {
  PageCustomizeButton,
  PageCustomizeDialog,
} from './PageCustomizeDialog';

function SurfaceGlyph({
  kind,
  color,
  size = 18,
}: {
  kind: LearningKind;
  color: string;
  size?: number;
}) {
  if (kind === 'books') return <BookOpen size={size} color={color} />;
  if (kind === 'mastery') return <Route size={size} color={color} />;
  if (kind === 'practice') return <ClipboardCheck size={size} color={color} />;
  return <FileText size={size} color={color} />;
}

function formatUnitCount(unitLabel: string, count: number): string {
  return unitLabel.replace('{{count}}', String(count));
}

export function LearningDashboardScreen() {
  const { colors } = useDesign();
  const t = useCopy();
  const { workspace, mode: entryMode } = useFixtures();
  const {
    customization,
    hubState,
    setHubState,
    getLearningOverview,
    resetLearningFixtures,
  } = useLearning();

  const [kindFilter, setKindFilter] = useState<'all' | LearningKind>('all');
  const [query, setQuery] = useState('');
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [deferredNotice, setDeferredNotice] = useState<string | null>(null);

  const visibleSurfaces = useMemo(
    () =>
      visibleLearningSurfaces(customization, (href) =>
        allowedDestination(entryMode, href),
      ),
    [customization, entryMode],
  );

  const visibleKinds = useMemo(
    () => new Set(visibleSurfaces.map((s) => s.kind)),
    [visibleSurfaces],
  );

  const activeKindFilter: 'all' | LearningKind =
    kindFilter !== 'all' && !visibleKinds.has(kindFilter) ? 'all' : kindFilter;

  const overview = useMemo(
    () => getLearningOverview(workspace),
    [getLearningOverview, workspace],
  );

  const filteredRecent = useMemo(
    () =>
      filterLearningRecent(overview.recent, {
        workspaceId: workspace,
        kindFilter: activeKindFilter,
        query,
        visibleKinds,
      }),
    [activeKindFilter, overview.recent, query, visibleKinds, workspace],
  );

  const openSurface = (surface: LearningSurfaceDefinition, create = false) => {
    const summary = overview.surfaces.find((s) => s.kind === surface.kind);
    if (summary && !summary.available) {
      setDeferredNotice(
        `${surface.title} is currently unavailable in this workspace state.`,
      );
      return;
    }
    if (surface.kind === 'mastery') {
      setDeferredNotice(null);
      router.push(
        (create ? '/learning/mastery?create=1' : '/learning/mastery') as Href,
      );
      return;
    }
    setDeferredNotice(
      `${surface.title} (${surface.milestone}) is scheduled for ${surface.milestone}. Mastery Path is active in M4.1.`,
    );
  };

  return (
    <View
      testID="learning-dashboard-screen"
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
            <DText
              role="caption"
              muted
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.1,
                fontWeight: '600',
              }}
            >
              {t('Learning')}
            </DText>
            <DText
              role="title"
              style={{ fontSize: 22, fontWeight: '700' }}
            >
              {t('All learning')}
            </DText>
            <DText role="small" muted>
              {t(
                'Books, Mastery Path, Practice, and Immersive Reading in one place.',
              )}
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
            <PageCustomizeButton
              testID="learning-hub-customize-btn"
              onPress={() => setCustomizeOpen(true)}
            />
            <Button
              testID="learning-create-btn"
              variant="primary"
              size="sm"
              icon={<Plus size={14} color={colors.primaryForeground} />}
              onPress={() => router.push('/learning/new' as Href)}
            >
              {t('Create learning')}
            </Button>
          </View>
        </View>

        {/* State simulation bar for deterministic testing */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <DText role="caption" muted>
            {t('Hub state:')}
          </DText>
          {(
            [
              'ready',
              'loading',
              'empty',
              'error',
              'unavailable',
            ] as LearningHubLoadState[]
          ).map((candidate) => (
            <Pressable
              key={candidate}
              testID={`learning-hub-state-${candidate}`}
              accessibilityRole="button"
              accessibilityLabel={`Set hub state ${candidate}`}
              accessibilityState={{ selected: hubState === candidate }}
              onPress={() => setHubState(candidate)}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                borderWidth: 1,
                borderColor:
                  hubState === candidate ? colors.primary : colors.border,
                backgroundColor:
                  hubState === candidate
                    ? alpha(colors.primary, 0.12)
                    : colors.card,
              }}
            >
              <DText
                role="caption"
                style={{
                  color:
                    hubState === candidate
                      ? colors.primary
                      : colors.mutedForeground,
                  fontWeight: hubState === candidate ? '600' : '400',
                }}
              >
                {candidate}
              </DText>
            </Pressable>
          ))}
        </View>

        {deferredNotice ? (
          <InlineAlert tone="warning">{deferredNotice}</InlineAlert>
        ) : null}

        {hubState === 'loading' ? (
          <LoadingState label={t('Loading learning workspace...')} />
        ) : hubState === 'error' ? (
          <View
            testID="learning-hub-error"
            style={{
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AlertCircle size={24} color={colors.destructive} />
            <DText style={{ fontWeight: '600' }}>
              {t('Learning overview could not be loaded')}
            </DText>
            <DText role="small" muted style={{ textAlign: 'center' }}>
              {t('Check your connection or retry loading your learning records.')}
            </DText>
            <Button
              testID="learning-hub-retry-btn"
              variant="secondary"
              size="sm"
              icon={<RotateCcw size={14} color={colors.foreground} />}
              onPress={() => {
                resetLearningFixtures();
                setHubState('ready');
              }}
            >
              {t('Retry')}
            </Button>
          </View>
        ) : visibleSurfaces.length === 0 ? (
          <View
            testID="learning-all-hidden-state"
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
            <DText style={{ fontWeight: '600' }}>
              {t('All learning ways are hidden on this page.')}
            </DText>
            <DText role="small" muted style={{ textAlign: 'center' }}>
              {t('Re-enable at least one learning way in Page Customization.')}
            </DText>
            <Button
              testID="learning-hidden-recover-btn"
              variant="secondary"
              size="sm"
              onPress={() => setCustomizeOpen(true)}
            >
              {t('Customize page')}
            </Button>
          </View>
        ) : (
          <>
            {/* Surface Cards Grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              {visibleSurfaces.map((surface) => {
                const summary = overview.surfaces.find(
                  (s) => s.kind === surface.kind,
                );
                const available = summary?.available ?? true;
                const count = summary?.count ?? 0;

                return (
                  <Pressable
                    key={surface.kind}
                    testID={`learning-surface-card-${surface.kind}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${surface.title}, ${
                      available
                        ? formatUnitCount(surface.unitLabel, count)
                        : 'Unavailable'
                    }`}
                    onPress={() => openSurface(surface, false)}
                    style={({ pressed }) => ({
                      flexGrow: 1,
                      flexBasis: 230,
                      minWidth: 220,
                      padding: 16,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor:
                        surface.kind === 'mastery'
                          ? alpha(colors.primary, 0.45)
                          : colors.border,
                      backgroundColor: pressed
                        ? alpha(colors.accent, 0.5)
                        : colors.card,
                      opacity: available ? 1 : 0.65,
                      gap: 10,
                    })}
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
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          backgroundColor: alpha(colors.primary, 0.1),
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SurfaceGlyph
                          kind={surface.kind}
                          color={colors.primary}
                          size={18}
                        />
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 999,
                          backgroundColor: available
                            ? alpha(colors.muted, 0.8)
                            : alpha(colors.destructive, 0.12),
                        }}
                      >
                        <DText
                          role="caption"
                          style={{
                            color: available
                              ? colors.mutedForeground
                              : colors.destructive,
                            fontWeight: '600',
                          }}
                        >
                          {available
                            ? formatUnitCount(surface.unitLabel, count)
                            : t('Unavailable')}
                        </DText>
                      </View>
                    </View>

                    <View style={{ gap: 4 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <DText style={{ fontWeight: '600', fontSize: 15 }}>
                          {t(surface.title)}
                        </DText>
                        {surface.milestone !== 'M4.1' ? (
                          <DText
                            role="caption"
                            muted
                            style={{ fontSize: 11 }}
                          >
                            ({surface.milestone})
                          </DText>
                        ) : null}
                      </View>
                      <DText role="small" muted numberOfLines={2}>
                        {t(surface.description)}
                      </DText>
                    </View>

                    <View
                      style={{
                        marginTop: 'auto',
                        paddingTop: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <DText
                        role="caption"
                        style={{ color: colors.primary, fontWeight: '600' }}
                      >
                        {surface.kind === 'mastery'
                          ? t('Open Mastery Atlas')
                          : t('Inspect surface')}
                      </DText>
                      <ArrowRight size={14} color={colors.primary} />
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* What needs your attention (`learningTodos`) */}
            {activeKindFilter === 'all' &&
            !query.trim() &&
            overview.todos.total > 0 ? (
              <View
                testID="learning-todos-panel"
                style={{
                  padding: 16,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: alpha(colors.primary, 0.3),
                  backgroundColor: alpha(colors.primary, 0.05),
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
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Clock3 size={16} color={colors.primary} />
                    <DText style={{ fontWeight: '600' }}>
                      {t('What needs your attention')}
                    </DText>
                  </View>
                  <DText role="caption" muted>
                    {overview.todos.total} {t('items')}
                  </DText>
                </View>

                <View style={{ gap: 8 }}>
                  {visibleKinds.has('mastery') &&
                    overview.todos.reviews.map((rev) => (
                      <Pressable
                        key={rev.id}
                        testID={`todo-review-${rev.knowledge_point_id}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Start review for ${rev.knowledge_point_name} in ${rev.topic_name}`}
                        onPress={() =>
                          router.push(
                            `/learning/mastery/${encodeURIComponent(rev.path_id)}/sessions?mode=review&focus=${encodeURIComponent(rev.knowledge_point_name)}` as Href,
                          )
                        }
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: pressed
                            ? colors.accent
                            : colors.card,
                        })}
                      >
                        <View style={{ flex: 1, gap: 2 }}>
                          <DText
                            role="small"
                            style={{ fontWeight: '600' }}
                            numberOfLines={1}
                          >
                            {rev.knowledge_point_name}
                          </DText>
                          <DText role="caption" muted numberOfLines={1}>
                            {rev.topic_name} · {t('Due review')} ·{' '}
                            {t('risk')}{' '}
                            {Math.round(rev.forgetting_risk * 100)}%
                          </DText>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <DText
                            role="caption"
                            style={{
                              color: colors.primary,
                              fontWeight: '600',
                            }}
                          >
                            {t('Start review')}
                          </DText>
                          <ArrowRight size={13} color={colors.primary} />
                        </View>
                      </Pressable>
                    ))}

                  {visibleKinds.has('books') &&
                    overview.todos.books.map((book) => (
                      <Pressable
                        key={book.book_id}
                        testID={`todo-book-${book.book_id}`}
                        accessibilityRole="button"
                        accessibilityLabel={`${book.title} — ${book.status_hint}`}
                        onPress={() =>
                          setDeferredNotice(
                            `${book.title}: Books reader & chapter compilation belong to M5.`,
                          )
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        }}
                      >
                        <View style={{ flex: 1, gap: 2 }}>
                          <DText
                            role="small"
                            style={{ fontWeight: '600' }}
                            numberOfLines={1}
                          >
                            {book.title}
                          </DText>
                          <DText role="caption" muted numberOfLines={1}>
                            {book.status_hint}
                          </DText>
                        </View>
                        <DText role="caption" muted>
                          M5
                        </DText>
                      </Pressable>
                    ))}
                </View>
              </View>
            ) : null}

            {/* Filter & Search Bar (`learningFilterBar`) */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <View
                accessibilityRole="tablist"
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                <Pressable
                  testID="learning-filter-all"
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeKindFilter === 'all' }}
                  accessibilityLabel={t('All')}
                  onPress={() => setKindFilter('all')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor:
                      activeKindFilter === 'all'
                        ? colors.primary
                        : colors.border,
                    backgroundColor:
                      activeKindFilter === 'all'
                        ? alpha(colors.primary, 0.12)
                        : colors.card,
                  }}
                >
                  <DText
                    role="caption"
                    style={{
                      color:
                        activeKindFilter === 'all'
                          ? colors.primary
                          : colors.foreground,
                      fontWeight: activeKindFilter === 'all' ? '600' : '400',
                    }}
                  >
                    {t('All')}
                  </DText>
                </Pressable>

                {visibleSurfaces.map((surface) => {
                  const selected = activeKindFilter === surface.kind;
                  return (
                    <Pressable
                      key={surface.kind}
                      testID={`learning-filter-${surface.kind}`}
                      accessibilityRole="tab"
                      accessibilityState={{ selected }}
                      accessibilityLabel={t(surface.title)}
                      onPress={() => setKindFilter(surface.kind)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected
                          ? alpha(colors.primary, 0.12)
                          : colors.card,
                      }}
                    >
                      <DText
                        role="caption"
                        style={{
                          color: selected ? colors.primary : colors.foreground,
                          fontWeight: selected ? '600' : '400',
                        }}
                      >
                        {t(surface.title)}
                      </DText>
                    </Pressable>
                  );
                })}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 220,
                  flexGrow: 1,
                  maxWidth: 340,
                  paddingHorizontal: 10,
                  minHeight: 36,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Search size={14} color={colors.mutedForeground} />
                <TextInput
                  testID="learning-search-input"
                  accessibilityLabel={t('Search learning records')}
                  placeholder={t('Search learning records...')}
                  placeholderTextColor={colors.mutedForeground}
                  value={query}
                  onChangeText={setQuery}
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: colors.foreground,
                    paddingVertical: 6,
                  }}
                />
              </View>
            </View>

            {/* Learning Records (`recent`) or Empty (`LearningWays`) */}
            {filteredRecent.length > 0 ? (
              <View style={{ gap: 10 }}>
                <DText
                  role="caption"
                  muted
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: 0.7,
                    fontWeight: '600',
                  }}
                >
                  {t('Learning records')} ({filteredRecent.length})
                </DText>

                {filteredRecent.map((item) => {
                  const pct =
                    typeof item.progress === 'number'
                      ? Math.round(item.progress * 100)
                      : null;
                  return (
                    <Pressable
                      key={item.id}
                      testID={`learning-record-${item.id}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${item.title}`}
                      onPress={() => {
                        if (item.kind === 'mastery') {
                          setDeferredNotice(null);
                          router.push(item.href as Href);
                        } else {
                          const surface = LEARNING_SURFACES.find(
                            (s) => s.kind === item.kind,
                          );
                          setDeferredNotice(
                            `${item.title}: ${
                              surface?.title ?? item.kind
                            } detail view is scheduled for ${
                              surface?.milestone ?? 'a later milestone'
                            }.`,
                          );
                        }
                      }}
                      style={({ pressed }) => ({
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: pressed
                          ? alpha(colors.accent, 0.5)
                          : colors.card,
                        gap: 8,
                      })}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
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
                          <SurfaceGlyph
                            kind={item.kind}
                            color={colors.primary}
                            size={17}
                          />
                          <View style={{ flex: 1, gap: 2 }}>
                            <DText
                              style={{ fontWeight: '600' }}
                              numberOfLines={1}
                            >
                              {item.title}
                            </DText>
                            <DText role="caption" muted numberOfLines={1}>
                              {item.subtitle}
                            </DText>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          {pct !== null ? (
                            <DText
                              role="caption"
                              style={{
                                fontWeight: '600',
                                color: colors.mutedForeground,
                              }}
                            >
                              {pct}%
                            </DText>
                          ) : null}
                          <ArrowRight size={14} color={colors.mutedForeground} />
                        </View>
                      </View>

                      {pct !== null ? (
                        <View
                          style={{
                            height: 5,
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
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View
                testID="learning-empty-records"
                style={{
                  padding: 20,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  gap: 12,
                }}
              >
                <EmptyState
                  title={
                    query.trim()
                      ? t('No matching learning records')
                      : t('No learning records yet')
                  }
                  description={t(
                    'Choose a learning way below to create your first structured goal or study collection.',
                  )}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    testID="learning-empty-start-mastery-btn"
                    variant="primary"
                    size="sm"
                    icon={<Sparkles size={14} color={colors.primaryForeground} />}
                    onPress={() =>
                      router.push('/learning/mastery?create=1' as Href)
                    }
                  >
                    {t('Start Mastery Path')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => router.push('/learning/new' as Href)}
                  >
                    {t('Explore all learning ways')}
                  </Button>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <PageCustomizeDialog
        open={customizeOpen}
        page="learning"
        onClose={() => setCustomizeOpen(false)}
      />
    </View>
  );
}
