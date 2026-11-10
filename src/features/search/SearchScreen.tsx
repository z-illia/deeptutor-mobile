import { useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { View } from 'react-native';
import { MobileAction, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { useCopy } from '@/features/entry/copy';
import { searchRecords } from './repository';
import { MAX_QUERY_LENGTH } from './api';
import { useSearch } from './useSearch';

export function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string | string[] }>();
  const [query, setQuery] = useState(Array.isArray(q) ? q[0] ?? '' : q ?? ''); const [selected, setSelected] = useState(0);
  const auth = useAuth(); const workspace = useWorkspaces(); const f = useFixtures(); const t = useCopy();
  const allowed = (href: string) => allowedDestination(f.mode, href);
  const enabled = workspace.ready && !auth.loading && !!auth.session && (!auth.session.status.enabled || auth.session.status.authenticated);
  const owner = JSON.stringify([auth.serverUrl, auth.session?.profile?.id ?? null]);
  const search = useSearch(query, workspace.selectedWorkspaceId, owner, enabled, allowed('/learning/mastery'));
  const pages = searchRecords(query, workspace.selectedWorkspaceId, allowed, t);
  const rows = search.rows.filter(row => allowed(row.href));
  const results = [...pages, ...rows];
  const pick = (index: number) => { const record = results[index]; if (record) router.replace(record.href as Href); };
  const labels = { page: 'navigation.jumpTo', session: 'Conversations', learning: 'navigation.learning', partner: 'navigation.partners', group: 'Groups' } as const;
  return <MobilePage title={t('navigation.searchEverything')} fallback="/library">
    <MobileField label={t('navigation.searchEverything')} value={query} autoFocus maxLength={MAX_QUERY_LENGTH} onChangeText={value => { setQuery(value); setSelected(0); router.setParams({ q: value }); }} onSubmitEditing={() => { if (!search.loading) pick(Math.min(selected, results.length - 1)); }} returnKeyType="search" onKeyPress={event => {
      if (event.nativeEvent.key === 'Escape') { if (router.canGoBack()) router.back(); else router.replace('/library'); }
      if (results.length && ['ArrowDown', 'ArrowUp'].includes(event.nativeEvent.key)) setSelected(previous => (previous + (event.nativeEvent.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
    }} />
    {query.trim().length > MAX_QUERY_LENGTH && <InlineAlert tone="warning">{t('Search query must be 200 characters or fewer.')}</InlineAlert>}
    {search.loading && <LoadingState />}
    {Object.entries(search.errors).map(([kind, error]) => <InlineAlert key={kind} tone="danger">{`${t(labels[kind as 'session' | 'learning' | 'partner'])}: ${t(error!)}`}</InlineAlert>)}
    {!!Object.keys(search.errors).length && <MobileAction variant="secondary" onPress={search.retry}>{t('Retry')}</MobileAction>}
    {(['page', 'session', 'learning', 'partner', 'group'] as const).map(kind => {
      const section = results.filter(row => row.kind === kind);
      if (!section.length) return null;
      return <View key={kind} style={{ gap: 12 }}><MobileText style={{ fontSize: 18, fontWeight: '600' }}>{t(labels[kind])}</MobileText>{section.map(row => <MobileRow key={row.id} title={kind === 'page' ? t(row.label) : row.label || t('New conversation')} description={row.detail} selected={results.indexOf(row) === Math.min(selected, results.length - 1)} onPress={() => router.replace(row.href as Href)} />)}</View>;
    })}
    {query.trim().length <= MAX_QUERY_LENGTH && !search.loading && !search.hasMore && !results.length && !Object.keys(search.errors).length && <MobileText muted>{t('navigation.noResults')}</MobileText>}
    {search.hasMore && <MobileAction variant="secondary" disabled={search.moreBusy} loading={search.moreBusy} onPress={() => void search.loadMore()}>{t('Load more')}</MobileAction>}
  </MobilePage>;
}
