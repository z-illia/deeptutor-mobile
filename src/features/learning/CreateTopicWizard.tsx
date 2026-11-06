import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  FileQuestion,
  FileText,
  FlaskConical,
  FolderOpen,
  MessageSquare,
  Mountain,
  Orbit,
  Ruler,
  Search,
  Sparkles,
  Sprout,
  Telescope,
  X,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha } from '@/shared/design/tokens';
import { Button } from '@/shared/ui/Controls';
import { Dialog } from '@/shared/ui/Dialog';
import { InlineAlert } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { useLearning } from './LearningProvider';
import {
  EMBLEM_META,
  filterSourceCandidates,
  GOAL_EMBLEMS,
  SOURCE_CATEGORIES,
  type GoalEmblem,
  type MasteryTopic,
  type SourceCategory,
} from './model';

function EmblemIcon({
  emblem,
  color,
  size = 18,
}: {
  emblem: GoalEmblem;
  color: string;
  size?: number;
}) {
  switch (emblem) {
    case '🧭':
      return <Compass size={size} color={color} />;
    case '🏔️':
      return <Mountain size={size} color={color} />;
    case '🌿':
      return <Sprout size={size} color={color} />;
    case '🔭':
      return <Telescope size={size} color={color} />;
    case '🧪':
      return <FlaskConical size={size} color={color} />;
    case '🧠':
      return <Brain size={size} color={color} />;
    case '📐':
      return <Ruler size={size} color={color} />;
    case '🌌':
      return <Orbit size={size} color={color} />;
  }
}

function CategoryGlyph({
  type,
  color,
  size = 15,
}: {
  type: SourceCategory;
  color: string;
  size?: number;
}) {
  switch (type) {
    case 'kb':
      return <FolderOpen size={size} color={color} />;
    case 'notebook':
      return <BookOpen size={size} color={color} />;
    case 'book':
      return <BookMarked size={size} color={color} />;
    case 'question_bank':
      return <FileQuestion size={size} color={color} />;
    case 'session':
      return <MessageSquare size={size} color={color} />;
    case 'co_writer':
      return <FileText size={size} color={color} />;
  }
}

export function CreateTopicWizard({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (topic: MasteryTopic, sessionId: string) => void;
}) {
  const { colors } = useDesign();
  const t = useCopy();
  const { workspace } = useFixtures();
  const {
    wizardDraft,
    updateWizardDraft,
    toggleWizardSource,
    toggleWizardChildSource,
    sourceCandidates,
    createTopicFromWizard,
  } = useLearning();

  const [expandedByKey, setExpandedByKey] = useState<Record<string, boolean>>({
    'kb:kb-linear-algebra': true,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const creating = useRef(false);

  const filteredCandidates = useMemo(
    () =>
      filterSourceCandidates(
        sourceCandidates,
        wizardDraft.activeCategory,
        wizardDraft.searchQuery,
        workspace,
      ),
    [
      sourceCandidates,
      wizardDraft.activeCategory,
      wizardDraft.searchQuery,
      workspace,
    ],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<SourceCategory, number> = {
      kb: 0,
      notebook: 0,
      book: 0,
      question_bank: 0,
      session: 0,
      co_writer: 0,
    };
    for (const item of sourceCandidates) {
      if (item.workspace_id === undefined || item.workspace_id === workspace) {
        counts[item.type] += 1;
      }
    }
    return counts;
  }, [sourceCandidates, workspace]);

  const handleCreate = async () => {
    if (creating.current) return;
    creating.current = true;
    setBusy(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    const res = createTopicFromWizard();
    creating.current = false;
    setBusy(false);
    if (!res.ok || !res.topic || !res.sessionId) {
      setError(res.error ?? t('Topic creation failed'));
      return;
    }
    setError(null);
    onCreated(res.topic, res.sessionId);
  };

  return (
    <Dialog
      open={open}
      busy={busy}
      title={t('Create a new topic')}
      onClose={onClose}
    >
      <View testID="create-topic-wizard" style={{ gap: 14 }}>
        {/* Header with step pills */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            borderBottomWidth: 1,
            borderColor: colors.border,
            paddingBottom: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {(
              [
                ['goal', t('Goal')],
                ['sources', t('Materials')],
              ] as const
            ).map(([id, label], index) => {
              const active = wizardDraft.step === id;
              return (
                <View
                  key={id}
                  testID={`wizard-step-badge-${id}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: active
                      ? alpha(colors.primary, 0.14)
                      : colors.muted,
                  }}
                >
                  <DText
                    role="caption"
                    style={{
                      color: active ? colors.primary : colors.mutedForeground,
                      fontWeight: active ? '600' : '400',
                    }}
                  >
                    {index + 1}. {label}
                  </DText>
                </View>
              );
            })}
          </View>

          <Pressable
            testID="wizard-close-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Close')}
            onPress={onClose}
            style={{ padding: 4 }}
          >
            <X size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

        {wizardDraft.step === 'goal' ? (
          <View testID="wizard-step-goal" style={{ gap: 14 }}>
            <View style={{ gap: 4 }}>
              <DText style={{ fontSize: 16, fontWeight: '600' }}>
                {t('What do you want to master?')}
              </DText>
              <DText role="small" muted>
                {t(
                  'Describe the ability you want to leave with. In the first session, you and your tutor will agree on the modules and knowledge points.',
                )}
              </DText>
            </View>

            <View style={{ gap: 6 }}>
              <DText role="caption" style={{ fontWeight: '600' }}>
                {t('Learning goal')}
              </DText>
              <TextInput
                testID="wizard-goal-input"
                accessibilityLabel={t('Learning goal')}
                multiline
                numberOfLines={4}
                maxLength={500}
                value={wizardDraft.goal}
                onChangeText={(text) => {
                  setError(null);
                  updateWizardDraft({ goal: text });
                }}
                placeholder={t(
                  'Understand transformer architectures well enough to implement attention and explain training tradeoffs.',
                )}
                placeholderTextColor={colors.mutedForeground}
                style={{
                  minHeight: 92,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 13,
                  color: colors.foreground,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            <View style={{ gap: 8 }}>
              <DText role="caption" style={{ fontWeight: '600' }}>
                {t('Goal emblem')}
              </DText>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {GOAL_EMBLEMS.map((emblem) => {
                  const meta = EMBLEM_META[emblem];
                  const selected = wizardDraft.icon === emblem;
                  return (
                    <Pressable
                      key={emblem}
                      testID={`wizard-emblem-${meta.iconKey}`}
                      accessibilityRole="button"
                      accessibilityLabel={`${t('Goal emblem')} ${t(meta.label)}`}
                      accessibilityState={{ selected }}
                      onPress={() => updateWizardDraft({ icon: emblem })}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected
                          ? alpha(colors.primary, 0.14)
                          : colors.background,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <EmblemIcon
                        emblem={emblem}
                        color={
                          selected ? colors.primary : colors.mutedForeground
                        }
                        size={18}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                borderTopWidth: 1,
                borderColor: colors.border,
                paddingTop: 12,
              }}
            >
              <Button
                testID="wizard-choose-sources-btn"
                variant="primary"
                size="sm"
                disabled={!wizardDraft.goal.trim()}
                icon={<ArrowRight size={14} color={colors.primaryForeground} />}
                onPress={() => updateWizardDraft({ step: 'sources' })}
              >
                {t('Choose sources')}
              </Button>
            </View>
          </View>
        ) : (
          <View testID="wizard-step-sources" style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <DText style={{ fontSize: 16, fontWeight: '600' }}>
                  {t('Knowledge sources')}
                </DText>
                <DText role="small" muted>
                  {t(
                    'Select materials so the tutor can ground the outline and questions in your own sources.',
                  )}
                </DText>
              </View>
              <DText
                testID="wizard-selected-sources-count"
                role="caption"
                muted
                style={{ fontWeight: '600' }}
              >
                {wizardDraft.selectedSourceKeys.length} {t('selected')}
              </DText>
            </View>

            {/* Search input */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 10,
                minHeight: 36,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
              }}
            >
              <Search size={14} color={colors.mutedForeground} />
              <TextInput
                testID="wizard-sources-search"
                accessibilityLabel={t('Search materials')}
                value={wizardDraft.searchQuery}
                onChangeText={(text) =>
                  updateWizardDraft({ searchQuery: text })
                }
                placeholder={t('Search materials')}
                placeholderTextColor={colors.mutedForeground}
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: colors.foreground,
                  paddingVertical: 6,
                }}
              />
            </View>

            {/* Category tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
            >
              {SOURCE_CATEGORIES.map((cat) => {
                const active = wizardDraft.activeCategory === cat.type;
                const count = categoryCounts[cat.type] ?? 0;
                return (
                  <Pressable
                    key={cat.type}
                    testID={`wizard-source-tab-${cat.type}`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={t(cat.label)}
                    onPress={() =>
                      updateWizardDraft({ activeCategory: cat.type })
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active
                        ? alpha(colors.primary, 0.12)
                        : colors.background,
                    }}
                  >
                    <CategoryGlyph
                      type={cat.type}
                      color={active ? colors.primary : colors.mutedForeground}
                      size={13}
                    />
                    <DText
                      role="caption"
                      style={{
                        color: active ? colors.primary : colors.foreground,
                        fontWeight: active ? '600' : '400',
                      }}
                    >
                      {t(cat.label)} ({count})
                    </DText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Candidate list */}
            <ScrollView
              style={{ maxHeight: 240 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {filteredCandidates.length === 0 ? (
                <View
                  style={{
                    padding: 18,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                  }}
                >
                  <DText role="small" muted>
                    {t(
                      SOURCE_CATEGORIES.find(
                        (c) => c.type === wizardDraft.activeCategory,
                      )?.emptyLabel ?? 'No sources found',
                    )}
                  </DText>
                </View>
              ) : (
                filteredCandidates.map((candidate) => {
                  const selected = wizardDraft.selectedSourceKeys.includes(
                    candidate.key,
                  );
                  const children = candidate.children ?? [];
                  const expanded = Boolean(expandedByKey[candidate.key]);
                  const selectedChildren =
                    wizardDraft.selectedChildIdsBySourceKey[candidate.key] ??
                    [];

                  return (
                    <View
                      key={candidate.key}
                      style={{
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected
                          ? alpha(colors.primary, 0.06)
                          : colors.background,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 10,
                          paddingVertical: 10,
                          gap: 8,
                        }}
                      >
                        <Pressable
                          testID={`wizard-source-row-${candidate.id}`}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: selected }}
                          accessibilityLabel={candidate.title}
                          onPress={() => toggleWizardSource(candidate)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            flex: 1,
                          }}
                        >
                          <View
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 5,
                              borderWidth: 1,
                              borderColor: selected
                                ? colors.primary
                                : colors.border,
                              backgroundColor: selected
                                ? colors.primary
                                : colors.card,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {selected ? (
                              <Check
                                size={12}
                                color={colors.primaryForeground}
                              />
                            ) : null}
                          </View>

                          <View style={{ flex: 1, gap: 2 }}>
                            <DText
                              role="small"
                              style={{ fontWeight: '600' }}
                              numberOfLines={1}
                            >
                              {candidate.title}
                            </DText>
                            <DText role="caption" muted numberOfLines={1}>
                              {candidate.subtitle}
                              {candidate.detail
                                ? ` · ${candidate.detail}`
                                : ''}
                            </DText>
                          </View>
                        </Pressable>

                        {children.length > 0 ? (
                          <Pressable
                            testID={`wizard-source-expand-${candidate.id}`}
                            accessibilityRole="button"
                            accessibilityLabel={
                              expanded
                                ? t('Collapse items')
                                : t('Expand items')
                            }
                            onPress={() =>
                              setExpandedByKey((prev) => ({
                                ...prev,
                                [candidate.key]: !prev[candidate.key],
                              }))
                            }
                            style={{
                              padding: 6,
                              borderRadius: 6,
                            }}
                          >
                            {expanded ? (
                              <ChevronDown
                                size={15}
                                color={colors.mutedForeground}
                              />
                            ) : (
                              <ChevronRight
                                size={15}
                                color={colors.mutedForeground}
                              />
                            )}
                          </Pressable>
                        ) : null}
                      </View>

                      {children.length > 0 && expanded ? (
                        <View
                          style={{
                            borderTopWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            gap: 6,
                            backgroundColor: alpha(colors.muted, 0.25),
                          }}
                        >
                          {children.map((child) => {
                            const childChecked = selectedChildren.includes(
                              child.id,
                            );
                            return (
                              <Pressable
                                key={child.id}
                                testID={`wizard-child-source-${child.id}`}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: childChecked }}
                                accessibilityLabel={child.title}
                                onPress={() =>
                                  toggleWizardChildSource(candidate, child.id)
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 8,
                                  paddingVertical: 4,
                                }}
                              >
                                <View
                                  style={{
                                    width: 15,
                                    height: 15,
                                    borderRadius: 4,
                                    borderWidth: 1,
                                    borderColor: childChecked
                                      ? colors.primary
                                      : colors.border,
                                    backgroundColor: childChecked
                                      ? colors.primary
                                      : colors.card,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {childChecked ? (
                                    <Check
                                      size={10}
                                      color={colors.primaryForeground}
                                    />
                                  ) : null}
                                </View>
                                <DText
                                  role="caption"
                                  style={{ flex: 1 }}
                                  numberOfLines={1}
                                >
                                  {child.title}
                                </DText>
                                {child.detail ? (
                                  <DText role="caption" muted>
                                    {child.detail}
                                  </DText>
                                ) : null}
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* Footer */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTopWidth: 1,
                borderColor: colors.border,
                paddingTop: 12,
                gap: 8,
              }}
            >
              <Button
                testID="wizard-back-to-goal-btn"
                disabled={busy}
                variant="secondary"
                size="sm"
                icon={<ArrowLeft size={14} color={colors.foreground} />}
                onPress={() => updateWizardDraft({ step: 'goal' })}
              >
                {t('Back')}
              </Button>
              <Button
                testID="wizard-submit-create-btn"
                loading={busy}
                variant="primary"
                size="sm"
                icon={
                  <Sparkles size={14} color={colors.primaryForeground} />
                }
                onPress={handleCreate}
              >
                {t('Design the outline with the tutor')}
              </Button>
            </View>
          </View>
        )}
      </View>
    </Dialog>
  );
}
