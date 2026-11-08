import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Compass,
  CornerDownRight,
  MessageSquare,
  MoreHorizontal,
  Pin,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { geometry } from '@/shared/design/tokens';
import { EmptyState, StatusChip } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import {
  buildSidebarEntries,
  displaySessionTitle,
  formatRelativeSessionTime,
  organizeSessionTree,
  type MasteryTopicLabel,
  type ReadingCollectionLabel,
  type SessionOrganizationPatch,
  type SessionSummary,
  type SidebarEntry,
  type SidebarSessionNode,
} from './model';
import { SessionActionsSheet } from './SessionActionsSheet';

export interface OrganizedSessionListProps {
  sessions: SessionSummary[];
  selectedSessionId?: string | null;
  liveSessionIds?: ReadonlySet<string>;
  masteryTopics?: MasteryTopicLabel[];
  readingCollections?: ReadingCollectionLabel[];
  compact?: boolean;
  nested?: boolean;
  emptyLabel?: string;
  onSelectSession: (session: SessionSummary) => void;
  onRenameSession: (
    sessionId: string,
    title: string,
  ) => { ok: boolean; error?: string };
  onOrganizeSession: (
    sessionId: string,
    patch: SessionOrganizationPatch,
  ) => { ok: boolean; error?: string };
  onDeleteSession: (sessionId: string) => { ok: boolean; error?: string };
}

export function OrganizedSessionList({
  sessions,
  selectedSessionId = null,
  liveSessionIds = new Set(),
  masteryTopics = [],
  readingCollections = [],
  compact = false,
  nested = true,
  emptyLabel,
  onSelectSession,
  onRenameSession,
  onOrganizeSession,
  onDeleteSession,
}: OrganizedSessionListProps) {
  const { colors } = useDesign();
  const t = useCopy();
  const [actionTarget, setActionTarget] = useState<SessionSummary | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const organized = useMemo(() => {
    const activeLike = sessions.map((s) =>
      s.preferences?.archived
        ? { ...s, preferences: { ...s.preferences, archived: false } }
        : s,
    );
    const tree = organizeSessionTree(activeLike, nested, liveSessionIds);
    const originalById = new Map(sessions.map((s) => [s.session_id, s]));
    const restoreNode = (node: SidebarSessionNode): SidebarSessionNode => ({
      ...node,
      session: originalById.get(node.session.session_id) ?? node.session,
      children: node.children.map(restoreNode),
    });
    const pinned = tree.pinned.map(restoreNode);
    const recents = tree.recents.map(restoreNode);
    const entries = buildSidebarEntries({
      roots: [...pinned, ...recents],
      masteryTopics,
      readingCollections,
    });
    return {
      pinnedEntries: entries.filter((e) =>
        e.kind === 'session'
          ? e.node.isPinned
          : e.sessions.some((s) => s.isPinned),
      ),
      recentEntries: entries.filter((e) =>
        e.kind === 'session'
          ? !e.node.isPinned
          : !e.sessions.some((s) => s.isPinned),
      ),
    };
  }, [liveSessionIds, masteryTopics, nested, readingCollections, sessions]);

  if (sessions.length === 0) {
    return (
      <EmptyState
        title={emptyLabel || t('No conversations yet')}
      />
    );
  }

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const renderSessionRow = (node: SidebarSessionNode, depth = 0) => {
    const { session, children, isRunning, isPinned } = node;
    const isSelected = selectedSessionId === session.session_id;
    const isArchived = Boolean(session.preferences?.archived);
    const isTutor = session.session_type === 'selection_tutor';
    const title = displaySessionTitle(session.title, t('New chat'));

    return (
      <View
        key={session.session_id}
        style={{ paddingLeft: depth > 0 ? 12 : 0, gap: 4 }}
      >
        <View
          style={{
            borderRadius: geometry.radius.md,
            borderWidth: 1,
            borderColor: isSelected ? colors.primary : compact ? 'transparent' : colors.border,
            backgroundColor: isSelected
              ? colors.accent
              : compact
                ? 'transparent'
                : colors.card,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: compact ? 8 : 12,
            paddingRight: 4,
            paddingVertical: compact ? 4 : 8,
            gap: 8,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectSession(session)}
            style={{
              flex: 1,
              minHeight: compact ? 34 : 42,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {depth > 0 || isTutor ? (
              <CornerDownRight size={14} color={colors.mutedForeground} />
            ) : (
              <MessageSquare
                size={15}
                color={isSelected ? colors.primary : colors.mutedForeground}
              />
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                <DText
                  role={compact ? 'small' : isSelected ? 'section' : 'label'}
                  numberOfLines={1}
                  style={{ flexShrink: 1 }}
                >
                  {title}
                </DText>
                {isPinned ? (
                  <Pin size={12} color={colors.primary} />
                ) : null}
                {isRunning ? (
                  <StatusChip tone="info">{t('Running')}</StatusChip>
                ) : null}
                {isArchived ? (
                  <StatusChip tone="warning">{t('Archived')}</StatusChip>
                ) : null}
              </View>
              {!compact && session.last_message_preview ? (
                <DText role="small" muted numberOfLines={1}>
                  {session.last_message_preview}
                </DText>
              ) : null}
            </View>
            {!compact ? (
              <DText role="small" muted>
                {formatRelativeSessionTime(session.updated_at)}
              </DText>
            ) : null}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Conversation actions {value1}", { value1: String(title) })}
            onPress={() => setActionTarget(session)}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: geometry.radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? colors.secondary : 'transparent',
            })}
          >
            <MoreHorizontal size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {children.length > 0 ? (
          <View style={{ gap: 4 }}>
            {children.map((child) => renderSessionRow(child, depth + 1))}
          </View>
        ) : null}
      </View>
    );
  };

  const renderEntry = (entry: SidebarEntry) => {
    if (entry.kind === 'session') {
      return renderSessionRow(entry.node, 0);
    }

    const groupKey =
      entry.kind === 'mastery_group'
        ? `mastery:${entry.topicId}`
        : `reading:${entry.collectionId}`;
    const isCollapsed = Boolean(collapsedGroups[groupKey]);
    const GroupIcon = entry.kind === 'mastery_group' ? Compass : BookOpen;
    const badgeLabel =
      entry.kind === 'mastery_group'
        ? t('Mastery Path')
        : t('Conversations & Materials');

    return (
      <View
        key={groupKey}
        style={{
          borderRadius: geometry.radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: compact ? colors.secondary : colors.card,
          padding: compact ? 6 : 8,
          gap: 6,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={entry.title}
          accessibilityState={{ expanded: !isCollapsed }}
          onPress={() => toggleGroup(groupKey)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 32,
            paddingHorizontal: 4,
            gap: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <GroupIcon size={14} color={colors.primary} />
            <DText role="section" numberOfLines={1} style={{ flex: 1 }}>
              {entry.title}
            </DText>
            {!compact ? (
              <DText role="small" muted>
                {badgeLabel} · {entry.sessions.length}
              </DText>
            ) : (
              <DText role="small" muted>
                {entry.sessions.length}
              </DText>
            )}
          </View>
          {isCollapsed ? (
            <ChevronRight size={14} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={14} color={colors.mutedForeground} />
          )}
        </Pressable>

        {!isCollapsed ? (
          <View style={{ gap: 4 }}>
            {entry.sessions.map((node) => renderSessionRow(node, 1))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={{ gap: 10 }}>
      {organized.pinnedEntries.length > 0 ? (
        <View style={{ gap: 6 }}>
          <DText role="section" muted>
            {t('Pinned')}
          </DText>
          {organized.pinnedEntries.map(renderEntry)}
        </View>
      ) : null}

      {organized.recentEntries.length > 0 ? (
        <View style={{ gap: 6 }}>
          {organized.pinnedEntries.length > 0 ? (
            <DText role="section" muted>
              {t('Recents')}
            </DText>
          ) : null}
          {organized.recentEntries.map(renderEntry)}
        </View>
      ) : null}

      <SessionActionsSheet
        session={actionTarget}
        open={actionTarget !== null}
        isRunning={
          actionTarget ? liveSessionIds.has(actionTarget.session_id) : false
        }
        onClose={() => setActionTarget(null)}
        onRename={onRenameSession}
        onOrganize={onOrganizeSession}
        onDelete={onDeleteSession}
      />
    </View>
  );
}
