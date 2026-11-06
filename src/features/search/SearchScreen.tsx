import type { Href } from 'expo-router';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { View } from 'react-native';
import { Button, Field } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { PageScaffold } from '@/shared/ui/Layout';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/Feedback';
import { useChat } from '../chat/ChatProvider';
import { displaySessionTitle } from '../chat/model';
import { useLearning } from '../learning/LearningProvider';
import { useFixtures } from '../entry/FixtureProvider';
import { useCopy } from '../entry/copy';
import { BackButton } from '../entry/Boundary';
import { allowedDestination, type WorkspaceId } from '../entry/model';
import { searchRecords, type SearchRecord } from './repository';
export function SearchScreen() {
  const f = useFixtures(); const chat = useChat(); const learning = useLearning(); const t = useCopy(); const [query, setQuery] = useState(''); const [selected, setSelected] = useState(0);
  useFocusEffect(useCallback(() => { setQuery(''); setSelected(0); }, []));
  const baseResults = searchRecords(query, f.workspace, (href) => allowedDestination(f.mode, href), t).filter((record) => f.resourceState !== 'empty' || record.kind === 'page');
  const existingIds = new Set(baseResults.map((r) => r.id));
  const normalized = query.trim().toLowerCase();
  const dynamicSessions: SearchRecord[] = f.resourceState === 'empty' ? [] : chat.sessions
    .filter((s) => (s.workspace_id ?? '') === f.workspace && !s.preferences?.archived && !existingIds.has(s.session_id))
    .filter((s) => {
      if (!normalized) return true;
      const title = displaySessionTitle(s.title, t('New chat')).toLowerCase();
      const preview = (s.last_message_preview || '').toLowerCase();
      return title.includes(normalized) || preview.includes(normalized);
    })
    .map((s) => ({
      id: s.session_id,
      kind: 'session' as const,
      label: displaySessionTitle(s.title, t('New chat')),
      href: `/chat/${encodeURIComponent(s.session_id)}`,
      workspace: ((s.workspace_id ?? '') as WorkspaceId),
    }))
    .filter((r) => allowedDestination(f.mode, r.href));
  const dynamicLearning: SearchRecord[] = f.resourceState === 'empty' ? [] : learning.getWorkspaceTopics(f.workspace)
    .filter((topic) => !existingIds.has(topic.path_id))
    .filter((topic) => {
      if (!normalized) return true;
      return `${topic.name} ${topic.metadata.goal} ${topic.metadata.description}`.toLowerCase().includes(normalized);
    })
    .map((topic) => ({
      id: topic.path_id,
      kind: 'learning' as const,
      label: topic.name,
      href: `/learning/mastery/${encodeURIComponent(topic.path_id)}`,
      workspace: (topic.content_workspace_id as WorkspaceId),
    }))
    .filter((r) => allowedDestination(f.mode, r.href));
  const results = [...baseResults, ...dynamicSessions, ...dynamicLearning];
  if (f.resourceState === 'loading') return <LoadingState />;
  if (['denied', 'unavailable'].includes(f.resourceState)) return <PageScaffold title={t('navigation.searchEverything')}><BackButton /><EmptyState title={t('Unavailable')} /></PageScaffold>;
  if (f.resourceState === 'error') return <ErrorState message={t('Unavailable')} onRetry={() => f.setResourceState('ready')} />;
  const pick = (index: number) => { const record = results[index]; if (record) router.replace(record.href as Href); };
  return <PageScaffold title={t('navigation.searchEverything')}><BackButton /><Field label={t('navigation.searchEverything')} value={query} autoFocus onChangeText={(value) => { setQuery(value); setSelected(0); }} onSubmitEditing={() => pick(selected)} onKeyPress={(event) => { if (event.nativeEvent.key === 'Escape') { if (router.canGoBack()) router.back(); else router.replace('/chat'); } if (['ArrowDown', 'ArrowUp'].includes(event.nativeEvent.key)) setSelected((old) => (old + (event.nativeEvent.key === 'ArrowDown' ? 1 : -1) + results.length) % Math.max(results.length, 1)); }} />
    {results.length ? <View style={{ gap: 4 }}>{results.map((record, i) => <Button key={record.id} variant="ghost" accessibilityState={{ selected: selected === i }} onPress={() => pick(i)}><View style={{ flex: 1, gap: 2 }}><DText>{t(record.label)}</DText><DText role="caption" muted>{t(({ page: 'navigation.jumpTo', session: 'Conversations', learning: 'navigation.learning', partner: 'navigation.partners', group: 'Groups' })[record.kind])}</DText></View></Button>)}</View> : <EmptyState title={t('navigation.noResults')} />}
  </PageScaffold>;
}
