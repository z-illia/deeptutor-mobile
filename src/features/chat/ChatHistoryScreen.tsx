import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import {
  ArchiveRestore,
  BookOpen,
  Compass,
  MessageSquare,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { useDesign } from '@/shared/design/DesignProvider';
import { geometry } from '@/shared/design/tokens';
import { Choice } from '@/shared/ui/Choice';
import { Button, Field } from '@/shared/ui/Controls';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatusChip,
  useFeedback,
} from '@/shared/ui/Feedback';
import { PageScaffold, Surface } from '@/shared/ui/Layout';
import { DText } from '@/shared/ui/Text';
import { useChat } from './ChatProvider';
import {
  archiveCount,
  collectArchivedConversations,
  displaySessionTitle,
  filterChatHistorySessions,
  formatRelativeSessionTime,
  type ArchivedBucketItem,
  type HistoryArchiveFilter,
  type HistoryTypeFilter,
  type SessionSummary,
} from './model';
import { OrganizedSessionList } from './OrganizedSessionList';

export interface ChatHistoryScreenProps {
  mode?: 'history' | 'archive';
}

export function ChatHistoryScreen({ mode = 'history' }: ChatHistoryScreenProps) {
  const { colors } = useDesign();
  const t = useCopy();
  const { notify } = useFeedback();
  const { workspace, resourceState, setResourceState } = useFixtures();
  const chat = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<HistoryTypeFilter>('all');
  const [archiveFilter, setArchiveFilter] = useState<HistoryArchiveFilter>(
    mode === 'archive' ? 'archived' : 'active',
  );
  const [deleteTarget, setDeleteTarget] = useState<SessionSummary | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const effectiveArchiveFilter: HistoryArchiveFilter =
    mode === 'archive' ? 'archived' : archiveFilter;

  const filteredSessions = useMemo(
    () =>
      filterChatHistorySessions(chat.sessions, chat.messagesBySession, {
        query: searchQuery,
        typeFilter,
        archiveFilter: effectiveArchiveFilter,
        workspaceId: workspace,
      }),
    [
      chat.messagesBySession,
      chat.sessions,
      effectiveArchiveFilter,
      searchQuery,
      typeFilter,
      workspace,
    ],
  );

  const masteryTopics = useMemo(
    () => chat.masteryTopicsForWorkspace(workspace),
    [chat, workspace],
  );
  const readingCollections = useMemo(
    () => chat.readingCollectionsForWorkspace(workspace),
    [chat, workspace],
  );

  const archiveBuckets = useMemo(
    () =>
      collectArchivedConversations({
        sessions: filteredSessions,
        masteryTopics,
        readingCollections,
      }),
    [filteredSessions, masteryTopics, readingCollections],
  );

  const totalArchivedCount = archiveCount(archiveBuckets);

  const handleOpenSession = (session: SessionSummary) => {
    router.push(`/chat/${encodeURIComponent(session.session_id)}`);
  };

  const handleUnarchive = (session: SessionSummary) => {
    const res = chat.organizeSession(session.session_id, { archived: false });
    if (!res.ok) {
      notify(t(res.error || 'Failed to save'), 'danger');
      return;
    }
    notify(t('Restore from archive'), 'info');
  };

  const handleConfirmPermanentDelete = () => {
    if (!deleteTarget) return;
    const res = chat.deleteSession(deleteTarget.session_id);
    if (!res.ok) {
      notify(t(res.error || 'Failed to save'), 'danger');
      return;
    }
    setDeleteTarget(null);
    notify(t('Conversation deleted'), 'info');
  };

  const handleConfirmDeleteAllArchived = () => {
    const res = chat.deleteAllArchived(workspace);
    if (!res.ok) {
      notify(t(res.error || 'Failed to save'), 'danger');
      return;
    }
    setDeleteAllOpen(false);
    notify(t('Conversation deleted'), 'info');
  };

  const renderArchivedBucket = (
    bucketKey: 'chat' | 'mastery' | 'reading',
    title: string,
    items: ArchivedBucketItem[],
  ) => {
    if (items.length === 0) return null;
    const BucketIcon =
      bucketKey === 'mastery'
        ? Compass
        : bucketKey === 'reading'
          ? BookOpen
          : MessageSquare;

    return (
      <Surface key={bucketKey}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BucketIcon size={16} color={colors.primary} />
            <DText role="section">{title}</DText>
          </View>
          <StatusChip tone="info">{String(items.length)}</StatusChip>
        </View>

        <View style={{ gap: 8 }}>
          {items.map(({ session, containerLabel }) => {
            const label = displaySessionTitle(session.title, t('New chat'));
            return (
              <View
                key={session.session_id}
                style={{
                  borderRadius: geometry.radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  onPress={() => handleOpenSession(session)}
                  style={{ flex: 1, minWidth: 180, gap: 2 }}
                >
                  <DText role="section" numberOfLines={1}>
                    {label}
                  </DText>
                  <DText role="small" muted numberOfLines={1}>
                    {[
                      containerLabel,
                      formatRelativeSessionTime(
                        session.preferences?.archived_at || session.updated_at,
                      ),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </DText>
                </Pressable>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<ArchiveRestore size={14} color={colors.foreground} />}
                    onPress={() => handleUnarchive(session)}
                  >
                    {t('Restore')}
                  </Button>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${t('Delete permanently')} ${label}`}
                    onPress={() => setDeleteTarget(session)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: geometry.radius.sm,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={15} color={colors.destructive} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </Surface>
    );
  };

  const pageTitle =
    mode === 'archive' ? t('Archived conversations') : t('Chat History');
  const pageDesc =
    mode === 'archive'
      ? t(
          'Archiving a conversation only clears it out of the sidebar — nothing is deleted. Restore one here and it goes back where it was.',
        )
      : t(
          'Browse, rename, delete, and reopen previous conversations from your learning space.',
        );

  return (
      <PageScaffold title={pageTitle} description={pageDesc}>
        <Surface>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <StatusChip tone="info">
                {`${filteredSessions.length} ${t('sessions')}`}
              </StatusChip>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <Button
                size="sm"
                variant="secondary"
                icon={<RefreshCw size={14} color={colors.foreground} />}
                onPress={() => notify(t('Refresh'), 'info')}
              >
                {t('Refresh')}
              </Button>
              <Button
                size="sm"
                icon={<Plus size={14} color={colors.primaryForeground} />}
                onPress={() => router.push('/chat')}
              >
                {t('New conversation')}
              </Button>
              {effectiveArchiveFilter === 'archived' &&
              totalArchivedCount > 0 ? (
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => setDeleteAllOpen(true)}
                >
                  {t('Delete permanently')}
                </Button>
              ) : null}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Field
                  label={t('Search chat history...')}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('Search chat history...')}
                />
              </View>
              {searchQuery ? (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<X size={14} color={colors.mutedForeground} />}
                  onPress={() => setSearchQuery('')}
                >
                  {t('Clear search')}
                </Button>
              ) : null}
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <View style={{ flex: 1, minWidth: 200 }}>
                <Choice
                  label={t('Filter by type')}
                  value={typeFilter}
                  options={[
                    { value: 'all', label: t('All conversations') },
                    { value: 'chat', label: t('Main conversations') },
                    { value: 'selection_tutor', label: t('Tutor threads') },
                  ]}
                  onChange={setTypeFilter}
                />
              </View>

              {mode === 'history' ? (
                <View style={{ flex: 1, minWidth: 200 }}>
                  <Choice
                    label="Filter by archive status"
                    value={archiveFilter}
                    options={[
                      { value: 'active', label: t('Active') },
                      { value: 'archived', label: t('Archived') },
                      { value: 'all', label: t('All') },
                    ]}
                    onChange={setArchiveFilter}
                  />
                </View>
              ) : null}
            </View>
          </View>
        </Surface>

        {resourceState === 'loading' ? (
          <Surface>
            <LoadingState label={t('Loading conversation')} />
          </Surface>
        ) : resourceState === 'error' ? (
          <Surface>
            <ErrorState
              message={t('navigation.loadError')}
              onRetry={() => setResourceState('ready')}
            />
          </Surface>
        ) : effectiveArchiveFilter === 'archived' ? (
          totalArchivedCount === 0 ? (
            <Surface>
              <EmptyState
                title={
                  searchQuery.trim()
                    ? t('No matching sessions found.')
                    : t('No deleted chats')
                }
              />
            </Surface>
          ) : (
            <View style={{ gap: 14 }}>
              {renderArchivedBucket(
                'chat',
                t('Conversations'),
                archiveBuckets.chat,
              )}
              {renderArchivedBucket(
                'mastery',
                t('Mastery Path'),
                archiveBuckets.mastery,
              )}
              {renderArchivedBucket(
                'reading',
                t('Immersive Reading'),
                archiveBuckets.reading,
              )}
            </View>
          )
        ) : (
          <Surface>
            <OrganizedSessionList
              sessions={filteredSessions}
              liveSessionIds={chat.liveSessionIds}
              masteryTopics={masteryTopics}
              readingCollections={readingCollections}
              nested={!searchQuery.trim()}
              emptyLabel={
                searchQuery.trim()
                  ? t('No matching sessions found.')
                  : t('No conversations yet')
              }
              onSelectSession={handleOpenSession}
              onRenameSession={chat.renameSession}
              onOrganizeSession={chat.organizeSession}
              onDeleteSession={chat.deleteSession}
            />
          </Surface>
        )}

        <ConfirmDialog
          open={deleteTarget !== null}
          title={t('Delete chat')}
          confirmLabel={t('Delete permanently')}
          onConfirm={handleConfirmPermanentDelete}
          onCancel={() => setDeleteTarget(null)}
        >
          <DText muted>
            {t(
              'Permanently delete this chat and its tutor threads? This cannot be undone.',
            )}
          </DText>
        </ConfirmDialog>

        <ConfirmDialog
          open={deleteAllOpen}
          title={t('Delete permanently')}
          confirmLabel={t('Delete permanently')}
          onConfirm={handleConfirmDeleteAllArchived}
          onCancel={() => setDeleteAllOpen(false)}
        >
          <DText muted>{t('Permanently delete this session?')}</DText>
        </ConfirmDialog>
      </PageScaffold>
  );
}
