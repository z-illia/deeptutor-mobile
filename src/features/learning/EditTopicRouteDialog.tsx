import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha } from '@/shared/design/tokens';
import { Button } from '@/shared/ui/Controls';
import { Dialog } from '@/shared/ui/Dialog';
import { InlineAlert } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { useLearning } from './LearningProvider';
import {
  isRouteDraftValid,
  KNOWLEDGE_TYPE_LABELS,
  moveRouteModule,
  moveRouteWaypoint,
  normalizeRouteModules,
  routeDraftIssues,
  topicToRouteDraft,
  type KnowledgeType,
  type MasteryTopic,
  type ModuleInit,
  type TopicDraft,
} from './model';

const KNOWLEDGE_TYPES: readonly KnowledgeType[] = [
  'concept',
  'memory',
  'procedure',
  'design',
];

export function EditTopicRouteDialog({
  open,
  topic,
  onClose,
  onSaved,
}: {
  open: boolean;
  topic: MasteryTopic;
  onClose: () => void;
  onSaved: (updated: MasteryTopic) => void;
}) {
  const { colors } = useDesign();
  const t = useCopy();
  const { saveTopicRoute } = useLearning();

  return (
    <Dialog
      open={open}
      title={t('Edit modules')}
      onClose={onClose}
    >
      {open ? (
        <EditTopicRouteDialogBody
          key={`${topic.path_id}:${topic.path_revision}`}
          topic={topic}
          colors={colors}
          t={t}
          onSave={(draft) => saveTopicRoute(topic.path_id, draft)}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Dialog>
  );
}

function EditTopicRouteDialogBody({
  topic,
  colors,
  t,
  onSave,
  onClose,
  onSaved,
}: {
  topic: MasteryTopic;
  colors: ReturnType<typeof useDesign>['colors'];
  t: (key: string) => string;
  onSave: (draft: TopicDraft) => {
    ok: boolean;
    topic?: MasteryTopic;
    error?: string;
  };
  onClose: () => void;
  onSaved: (updated: MasteryTopic) => void;
}) {
  const [draft, setDraft] = useState<TopicDraft>(() =>
    topicToRouteDraft(topic),
  );
  const [error, setError] = useState<string | null>(null);
  const [seq, setSeq] = useState(10);

  const issues = routeDraftIssues(draft);
  const canSave = isRouteDraftValid(draft);

  const updateModule = (index: number, nextModule: ModuleInit) => {
    const modules = [...draft.modules];
    modules[index] = nextModule;
    setDraft({ ...draft, modules: normalizeRouteModules(modules) });
  };

  const addModule = () => {
    const nextSeq = seq + 1;
    setSeq(nextSeq);
    const modId = `draft_mod_${nextSeq}`;
    setDraft({
      ...draft,
      modules: normalizeRouteModules([
        ...draft.modules,
        {
          id: modId,
          name: `New module ${draft.modules.length + 1}`,
          order: draft.modules.length,
          knowledge_points: [
            {
              id: `draft_kp_${nextSeq}_1`,
              name: 'New knowledge point',
              type: 'concept',
              module_id: modId,
            },
          ],
        },
      ]),
    });
  };

  const removeModule = (index: number) => {
    if (draft.modules.length <= 1) return;
    setDraft({
      ...draft,
      modules: normalizeRouteModules(
        draft.modules.filter((_, idx) => idx !== index),
      ),
    });
  };

  const handleSave = () => {
    if (!canSave) return;
    const res = onSave(draft);
    if (!res.ok || !res.topic) {
      setError(res.error ?? t('Failed to save'));
      return;
    }
    setError(null);
    onSaved(res.topic);
  };

  return (
    <View testID="edit-topic-route-dialog" style={{ gap: 12 }}>
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
          style={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
        >
          {t('Map workshop')}
        </DText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Close')}
          onPress={onClose}
          style={{ padding: 4 }}
        >
          <X size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Warning banner */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
          padding: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: alpha(colors.muted, 0.4),
        }}
      >
        <AlertTriangle size={15} color={colors.mutedForeground} />
        <DText role="caption" muted style={{ flex: 1, lineHeight: 17 }}>
          {t(
            'Reordering or renaming existing knowledge points keeps their mastery progress. Removing a point clears its progress and review schedule.',
          )}
        </DText>
      </View>

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 12 }}>
        {/* Map description */}
        <View style={{ gap: 4 }}>
          <DText role="caption" style={{ fontWeight: '600' }}>
            {t('Map description')}
          </DText>
          <TextInput
            testID="route-draft-description"
            accessibilityLabel={t('Map description')}
            multiline
            numberOfLines={2}
            value={draft.description}
            onChangeText={(text) => setDraft({ ...draft, description: text })}
            style={{
              minHeight: 54,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              paddingHorizontal: 10,
              paddingVertical: 8,
              fontSize: 13,
              color: colors.foreground,
            }}
          />
        </View>

        {/* Modules list */}
        <View style={{ gap: 10 }}>
          {draft.modules.map((mod, modIdx) => {
            const blankRegion = issues.some(
              (iss) =>
                iss.code === 'blank_region' && iss.moduleIndex === modIdx,
            );
            return (
              <View
                key={mod.id}
                testID={`route-module-card-${modIdx}`}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: blankRegion ? colors.destructive : colors.border,
                  backgroundColor: colors.background,
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
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      backgroundColor: alpha(colors.primary, 0.12),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DText
                      role="caption"
                      style={{ color: colors.primary, fontWeight: '700' }}
                    >
                      {modIdx + 1}
                    </DText>
                  </View>

                  <TextInput
                    testID={`route-module-name-${modIdx}`}
                    accessibilityLabel={`Module ${modIdx + 1} name`}
                    value={mod.name}
                    onChangeText={(text) =>
                      updateModule(modIdx, { ...mod, name: text })
                    }
                    style={{
                      flex: 1,
                      minHeight: 34,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: blankRegion
                        ? colors.destructive
                        : colors.border,
                      backgroundColor: colors.card,
                      paddingHorizontal: 10,
                      fontSize: 13,
                      fontWeight: '600',
                      color: colors.foreground,
                    }}
                  />

                  <Pressable
                    testID={`route-module-up-${modIdx}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Move module ${mod.name || modIdx + 1} up`}
                    disabled={modIdx === 0}
                    onPress={() =>
                      setDraft(moveRouteModule(draft, modIdx, modIdx - 1))
                    }
                    style={{
                      padding: 6,
                      opacity: modIdx === 0 ? 0.3 : 1,
                    }}
                  >
                    <ArrowUp size={14} color={colors.mutedForeground} />
                  </Pressable>

                  <Pressable
                    testID={`route-module-down-${modIdx}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Move module ${mod.name || modIdx + 1} down`}
                    disabled={modIdx === draft.modules.length - 1}
                    onPress={() =>
                      setDraft(moveRouteModule(draft, modIdx, modIdx + 1))
                    }
                    style={{
                      padding: 6,
                      opacity: modIdx === draft.modules.length - 1 ? 0.3 : 1,
                    }}
                  >
                    <ArrowDown size={14} color={colors.mutedForeground} />
                  </Pressable>

                  <Pressable
                    testID={`route-module-remove-${modIdx}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove module ${mod.name || modIdx + 1}`}
                    disabled={draft.modules.length <= 1}
                    onPress={() => removeModule(modIdx)}
                    style={{
                      padding: 6,
                      opacity: draft.modules.length <= 1 ? 0.3 : 1,
                    }}
                  >
                    <Trash2 size={14} color={colors.destructive} />
                  </Pressable>
                </View>

                {blankRegion ? (
                  <DText
                    role="caption"
                    style={{ color: colors.destructive }}
                  >
                    {t('Module name cannot be blank.')}
                  </DText>
                ) : null}

                {/* Knowledge points in module */}
                <View style={{ paddingLeft: 12, gap: 6 }}>
                  {mod.knowledge_points.map((pt, ptIdx) => {
                    const blankPt = issues.some(
                      (iss) =>
                        iss.code === 'blank_waypoint' &&
                        iss.moduleIndex === modIdx &&
                        iss.waypointIndex === ptIdx,
                    );
                    const nextTypeIdx =
                      (KNOWLEDGE_TYPES.indexOf(pt.type) + 1) %
                      KNOWLEDGE_TYPES.length;
                    const nextType = KNOWLEDGE_TYPES[nextTypeIdx] ?? 'concept';

                    return (
                      <View
                        key={pt.id}
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <TextInput
                          testID={`route-point-name-${modIdx}-${ptIdx}`}
                          accessibilityLabel={`Knowledge point ${ptIdx + 1} name in module ${modIdx + 1}`}
                          value={pt.name}
                          onChangeText={(text) => {
                            const pts = [...mod.knowledge_points];
                            pts[ptIdx] = { ...pt, name: text };
                            updateModule(modIdx, {
                              ...mod,
                              knowledge_points: pts,
                            });
                          }}
                          style={{
                            flex: 1,
                            minWidth: 150,
                            minHeight: 32,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: blankPt
                              ? colors.destructive
                              : colors.border,
                            backgroundColor: colors.card,
                            paddingHorizontal: 8,
                            fontSize: 12,
                            color: colors.foreground,
                          }}
                        />

                        <Pressable
                          testID={`route-point-type-${modIdx}-${ptIdx}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Type for ${pt.name || ptIdx + 1}: ${KNOWLEDGE_TYPE_LABELS[pt.type]}`}
                          onPress={() => {
                            const pts = [...mod.knowledge_points];
                            pts[ptIdx] = { ...pt, type: nextType };
                            updateModule(modIdx, {
                              ...mod,
                              knowledge_points: pts,
                            });
                          }}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 5,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                          }}
                        >
                          <DText role="caption">
                            {t(KNOWLEDGE_TYPE_LABELS[pt.type])}
                          </DText>
                        </Pressable>

                        <Pressable
                          testID={`route-point-up-${modIdx}-${ptIdx}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Move ${pt.name || ptIdx + 1} up`}
                          disabled={ptIdx === 0}
                          onPress={() =>
                            setDraft(
                              moveRouteWaypoint(
                                draft,
                                modIdx,
                                ptIdx,
                                ptIdx - 1,
                              ),
                            )
                          }
                          style={{
                            padding: 4,
                            opacity: ptIdx === 0 ? 0.3 : 1,
                          }}
                        >
                          <ArrowUp size={13} color={colors.mutedForeground} />
                        </Pressable>

                        <Pressable
                          testID={`route-point-down-${modIdx}-${ptIdx}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Move ${pt.name || ptIdx + 1} down`}
                          disabled={ptIdx === mod.knowledge_points.length - 1}
                          onPress={() =>
                            setDraft(
                              moveRouteWaypoint(
                                draft,
                                modIdx,
                                ptIdx,
                                ptIdx + 1,
                              ),
                            )
                          }
                          style={{
                            padding: 4,
                            opacity:
                              ptIdx === mod.knowledge_points.length - 1
                                ? 0.3
                                : 1,
                          }}
                        >
                          <ArrowDown size={13} color={colors.mutedForeground} />
                        </Pressable>

                        <Pressable
                          testID={`route-point-remove-${modIdx}-${ptIdx}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${pt.name || ptIdx + 1}`}
                          disabled={mod.knowledge_points.length <= 1}
                          onPress={() =>
                            updateModule(modIdx, {
                              ...mod,
                              knowledge_points: mod.knowledge_points.filter(
                                (_, idx) => idx !== ptIdx,
                              ),
                            })
                          }
                          style={{
                            padding: 4,
                            opacity:
                              mod.knowledge_points.length <= 1 ? 0.3 : 1,
                          }}
                        >
                          <X size={13} color={colors.destructive} />
                        </Pressable>

                        {blankPt ? (
                          <DText
                            role="caption"
                            style={{
                              width: '100%',
                              color: colors.destructive,
                            }}
                          >
                            {t('Knowledge point name cannot be blank.')}
                          </DText>
                        ) : null}
                      </View>
                    );
                  })}

                  <Pressable
                    testID={`route-add-point-${modIdx}`}
                    accessibilityRole="button"
                    accessibilityLabel={t('Add knowledge point')}
                    onPress={() => {
                      const nextSeq = seq + 1;
                      setSeq(nextSeq);
                      updateModule(modIdx, {
                        ...mod,
                        knowledge_points: [
                          ...mod.knowledge_points,
                          {
                            id: `draft_kp_${nextSeq}`,
                            name: 'New knowledge point',
                            type: 'concept',
                            module_id: mod.id,
                          },
                        ],
                      });
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingVertical: 4,
                    }}
                  >
                    <Plus size={13} color={colors.primary} />
                    <DText
                      role="caption"
                      style={{ color: colors.primary, fontWeight: '600' }}
                    >
                      {t('Add knowledge point')}
                    </DText>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable
          testID="route-add-module-btn"
          accessibilityRole="button"
          accessibilityLabel={t('Add module')}
          onPress={addModule}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 9,
            borderRadius: 10,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.border,
          }}
        >
          <Plus size={14} color={colors.primary} />
          <DText
            role="caption"
            style={{ color: colors.primary, fontWeight: '600' }}
          >
            {t('Add module')}
          </DText>
        </Pressable>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 8,
          borderTopWidth: 1,
          borderColor: colors.border,
          paddingTop: 12,
        }}
      >
        <Button
          testID="route-cancel-btn"
          variant="secondary"
          size="sm"
          onPress={onClose}
        >
          {t('Cancel')}
        </Button>
        <Button
          testID="route-save-btn"
          variant="primary"
          size="sm"
          disabled={!canSave}
          onPress={handleSave}
        >
          {t('Save')}
        </Button>
      </View>
    </View>
  );
}
