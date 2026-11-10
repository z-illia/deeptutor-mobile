import { useCallback, useMemo, useRef, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { MobileChoice as Choice, MobileAction, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { IconButton } from '@/shared/ui/Controls';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { ErrorState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import {
  conversationError,
  deleteConversation,
  listWorkspaceSessionSummaries,
  organizeConversation,
  renameConversation,
} from './live/repository';
import { SessionActionsSheet } from './SessionActionsSheet';
import {
  displaySessionTitle,
  filterChatHistorySessions,
  formatRelativeSessionTime,
  type HistoryArchiveFilter,
  type HistoryTypeFilter,
  type SessionOrganizationPatch,
  type SessionSummary,
} from './model';

export function MobileConversationLibrary({ archive = false, actions = false }: { archive?: boolean; actions?: boolean }) {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const workspaceScope = useWorkspaces();
  const workspace = workspaceScope.selectedWorkspaceId;
  const t = useCopy();
  const { colors } = useDesign();
  const [allSessions, setAllSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<HistoryTypeFilter>('all');
  const [filter, setFilter] = useState<HistoryArchiveFilter>('active');
  const [target, setTarget] = useState<SessionSummary | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const openedDirect = useRef(false);
  const [deleteAll, setDeleteAll] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const seq = useRef(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    const current = ++seq.current;
    setLoading(true);
    setError('');
    try {
      const items = await listWorkspaceSessionSummaries(workspace, signal);
      if (signal?.aborted || current !== seq.current) return;
      setAllSessions(items);
      if (actions && sessionId && !openedDirect.current) {
        const session = items.find(item => item.session_id === sessionId);
        if (session) { setTarget(session); setActionsOpen(true); openedDirect.current = true; }
      }
    } catch (cause) {
      if (signal?.aborted || current !== seq.current) return;
      setError(conversationError(cause));
    } finally {
      if (!signal?.aborted && current === seq.current) setLoading(false);
    }
  }, [workspace, actions, sessionId]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]));

  const sessions = useMemo(
    () =>
      filterChatHistorySessions(
        allSessions,
        {},
        {
          workspaceId: workspace,
          query,
          typeFilter: type,
          archiveFilter: archive ? 'archived' : filter,
        },
      ),
    [archive, allSessions, workspace, query, type, filter],
  );

  const archivedSessions = useMemo(
    () => allSessions.filter(item => (item.workspace_id ?? '') === workspace && item.preferences?.archived),
    [allSessions, workspace],
  );
  const archivedCount = archivedSessions.length;

  const workspaceOptions = useMemo(
    () => [
      { id: '', name: t('General workspace') },
      ...workspaceScope.workspaces
        .filter(w => Boolean(w.workspace_id))
        .map(w => ({ id: w.workspace_id, name: w.display_name || w.workspace_id })),
    ],
    [workspaceScope.workspaces, t],
  );

  const handleRename = async (sessionId: string, title: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      await renameConversation(sessionId, title, workspace);
      await load();
      return { ok: true };
    } catch (cause) {
      const msg = conversationError(cause);
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const handleOrganize = async (
    sessionId: string,
    patch: SessionOrganizationPatch,
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      await organizeConversation(sessionId, patch, workspace);
      await load();
      return { ok: true };
    } catch (cause) {
      const msg = conversationError(cause);
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const handleDelete = async (sessionId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      await deleteConversation(sessionId, workspace);
      await load();
      return { ok: true };
    } catch (cause) {
      const msg = conversationError(cause);
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const handleDeleteAllArchived = async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      for (const item of archivedSessions) {
        await deleteConversation(item.session_id, workspace);
      }
      setDeleteAll(false);
      await load();
    } catch (cause) {
      setError(conversationError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return <MobilePage title={t(archive ? 'Archived conversations' : 'Conversations')} fallback={archive ? '/mobile/27' : '/mobile/26'} tab={archive ? undefined : 26}>
    <MobileText muted>{t(archive ? 'Archived conversations' : 'Browse, rename, delete, and reopen previous conversations from your learning space.')}</MobileText>
    {!!error && <ErrorState message={t(error)} onRetry={() => void load()} />}
    <MobileField label={t(archive ? 'Search archived chats' : 'Search conversations')} value={query} onChangeText={setQuery} />
    {!archive && <>
      <MobileAction onPress={() => router.push('/chat?new=1')}>{t('New conversation')}</MobileAction>
      <MobileRow title={t('Archived conversations')} description={String(archivedCount)} onPress={() => router.push('/mobile/108')} />
      <Choice label={t('Type')} value={type} options={['all', 'chat', 'selection_tutor'].map(value => ({ value, label: t(value === 'all' ? 'All' : value === 'chat' ? 'Chat' : 'Selection Tutor') }))} onChange={value => setType(value as HistoryTypeFilter)} />
      <Choice label={t('Archive')} value={filter} options={['active', 'archived', 'all'].map(value => ({ value, label: t(value === 'active' ? 'Active' : value === 'archived' ? 'Archived' : 'All') }))} onChange={value => setFilter(value as HistoryArchiveFilter)} />
    </>}
    <MobileAction variant="secondary" disabled={loading || busy} onPress={() => void load()}>{t('Refresh')}</MobileAction>
    {loading && <LoadingState />}
    {!loading && !sessions.length && <MobileText muted>{t(archive ? 'Nothing archived yet' : 'No conversations yet')}</MobileText>}
    {!loading && sessions.map(session => <View key={session.session_id} style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <MobileRow
            title={displaySessionTitle(session.title, t('New chat'))}
            description={[session.preferences?.pinned ? t('Pinned') : '', session.last_message_preview, formatRelativeSessionTime(session.updated_at)].filter(Boolean).join(' · ')}
            onPress={() => router.push(`/chat/${encodeURIComponent(session.session_id)}`)}
          />
        </View>
        <IconButton label={`${t('More actions')} ${displaySessionTitle(session.title, t('New chat'))}`} onPress={event => { event.stopPropagation(); setTarget(session); setActionsOpen(true); }}>
          <MoreHorizontal size={22} color={colors.mutedForeground} />
        </IconButton>
      </View>
      {session.preferences?.archived && (
        <MobileAction variant="secondary" disabled={busy} onPress={() => void handleOrganize(session.session_id, { archived: false })}>
          {t('Restore')}
        </MobileAction>
      )}
    </View>)}
    {archive && <MobileAction variant="secondary" disabled={!archivedCount || busy} loading={busy} onPress={() => setDeleteAll(true)}>{t('Delete all archived chats')}</MobileAction>}
    <SessionActionsSheet
      open={actionsOpen}
      session={target}
      workspaceOptions={workspaceOptions}
      onClose={() => setActionsOpen(false)}
      onRename={handleRename}
      onOrganize={handleOrganize}
      onDelete={handleDelete}
    />
    <ConfirmDialog
      open={deleteAll}
      title={t('Delete all archived chats')}
      confirmLabel={t('Delete')}
      busy={busy}
      onCancel={() => setDeleteAll(false)}
      onConfirm={() => void handleDeleteAllArchived()}
    >
      {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    </ConfirmDialog>
  </MobilePage>;
}
