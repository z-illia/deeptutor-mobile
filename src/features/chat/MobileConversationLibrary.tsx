import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';
import { useChat } from './ChatProvider';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { MobileChoice as Choice, MobileAction, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { Button, IconButton } from '@/shared/ui/Controls';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { SessionActionsSheet } from './SessionActionsSheet';
import { displaySessionTitle, filterChatHistorySessions, formatRelativeSessionTime, type HistoryArchiveFilter, type HistoryTypeFilter, type SessionSummary } from './model';

// Presentation replacement only. Archive actions still use the existing ChatProvider.
export function MobileConversationLibrary({ archive = false }: { archive?: boolean }) {
  const chat = useChat(); const f = useFixtures(); const t = useCopy(); const { colors } = useDesign();
  const [query, setQuery] = useState(''); const [type, setType] = useState<HistoryTypeFilter>('all');
  const [filter, setFilter] = useState<HistoryArchiveFilter>('active');
  const [target, setTarget] = useState<SessionSummary | null>(null); const [deleteAll, setDeleteAll] = useState(false); const [error, setError] = useState('');
  const sessions = useMemo(() => filterChatHistorySessions(chat.sessions, chat.messagesBySession, { workspaceId: f.workspace, query, typeFilter: type, archiveFilter: archive ? 'archived' : filter }), [archive, chat.sessions, chat.messagesBySession, f.workspace, query, type, filter]);
  const archivedCount = chat.sessions.filter(item => (item.workspace_id ?? '') === f.workspace && item.preferences?.archived).length;
  return <MobilePage title={t(archive ? 'Archived conversations' : 'Conversations')} fallback={archive ? '/mobile/27' : '/mobile/26'} tab={archive ? undefined : 26}>
    <MobileText muted>{t(archive ? 'Archived conversations' : 'Browse, rename, delete, and reopen previous conversations from your learning space.')}</MobileText>
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {f.resourceState === 'loading' ? <LoadingState /> : ['denied', 'unavailable'].includes(f.resourceState) ? <InlineAlert tone="warning">{t('Unavailable')}</InlineAlert> : f.resourceState === 'error' ? <Button variant="secondary" onPress={() => f.setResourceState('ready')}>{t('Retry')}</Button> : <>
      <MobileField label={t(archive ? 'Search archived chats' : 'Search conversations')} value={query} onChangeText={setQuery} />
      {!archive && <>
        <MobileAction onPress={() => router.push('/chat?new=1')}>{t('New conversation')}</MobileAction>
        <MobileRow title={t('Archived conversations')} description={String(archivedCount)} onPress={() => router.push('/mobile/108')} />
        <Choice label={t('Type')} value={type} options={['all', 'chat', 'selection_tutor'].map(value => ({ value, label: t(value === 'all' ? 'All' : value === 'chat' ? 'Chat' : 'Selection Tutor') }))} onChange={value => setType(value as HistoryTypeFilter)} />
        <Choice label={t('Archive')} value={filter} options={['active', 'archived', 'all'].map(value => ({ value, label: t(value === 'active' ? 'Active' : value === 'archived' ? 'Archived' : 'All') }))} onChange={value => setFilter(value as HistoryArchiveFilter)} />
      </>}
      {!sessions.length && <MobileText muted>{t(archive ? 'Nothing archived yet' : 'No conversations yet')}</MobileText>}
      {sessions.map(session => <View key={session.session_id} style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ flex: 1 }}><MobileRow title={displaySessionTitle(session.title, t('New chat'))} description={formatRelativeSessionTime(session.updated_at)} onPress={() => router.push(`/chat/${encodeURIComponent(session.session_id)}`)} /></View>
          <IconButton label={`${t('More actions')} ${displaySessionTitle(session.title, t('New chat'))}`} onPress={event => { event.stopPropagation(); setTarget(session); }}><MoreHorizontal size={22} color={colors.mutedForeground} /></IconButton>
        </View>
        {session.preferences?.archived && <MobileAction variant="secondary" onPress={() => { const result = chat.organizeSession(session.session_id, { archived: false }); if (!result.ok) setError(result.error || 'Failed to save'); }}>{t('Restore')}</MobileAction>}
      </View>)}
      {archive && <MobileAction variant="secondary" disabled={!archivedCount} onPress={() => setDeleteAll(true)}>{t('Delete all archived chats')}</MobileAction>}
    </>}
    <SessionActionsSheet open={!!target} session={target} onClose={() => setTarget(null)} onRename={chat.renameSession} onOrganize={chat.organizeSession} onDelete={chat.deleteSession} />
    <ConfirmDialog open={deleteAll} title={t('Delete all archived chats')} confirmLabel={t('Delete')} onCancel={() => setDeleteAll(false)} onConfirm={() => { const result = chat.deleteAllArchived(f.workspace); if (result.ok) setDeleteAll(false); else setError(result.error || 'Failed to save'); }}>{!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}</ConfirmDialog>
  </MobilePage>;
}
