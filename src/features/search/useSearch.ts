import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { searchConversations, searchLearning, searchPartners, searchError, MAX_QUERY_LENGTH } from './api';
import type { SearchRecord } from './repository';

export function useSearch(query: string, workspace: string, owner: string, enabled: boolean, learningEnabled = true) {
  const [revision, setRevision] = useState(0);
  const key = JSON.stringify([query.trim(), workspace, owner, enabled, learningEnabled, revision]);
  const [state, setState] = useState<{ key: string; rows: SearchRecord[]; loading: boolean; moreBusy: boolean; offset: number; hasMore: boolean; errors: Partial<Record<'session' | 'learning' | 'partner', string>> }>();
  const active = useRef<AbortController | null>(null);
  const moreLock = useRef(false);
  useFocusEffect(useCallback(() => {
    const controller = new AbortController(); active.current = controller; moreLock.current = false;
    if (!enabled || query.trim().length > MAX_QUERY_LENGTH) return () => controller.abort();
    const timer = setTimeout(() => {
      setState({ key, rows: [], loading: true, moreBusy: false, offset: 0, hasMore: false, errors: {} });
      const calls = [searchConversations(query, workspace, 0, controller.signal), learningEnabled ? searchLearning(query, workspace, controller.signal) : Promise.resolve([]), searchPartners(query, controller.signal)] as const;
      void Promise.allSettled(calls).then(([sessions, learning, partners]) => {
        if (controller.signal.aborted) return;
        const errors: Partial<Record<'session' | 'learning' | 'partner', string>> = {};
        if (sessions.status === 'rejected') errors.session = searchError(sessions.reason);
        if (learning.status === 'rejected') errors.learning = searchError(learning.reason);
        if (partners.status === 'rejected') errors.partner = searchError(partners.reason);
        setState({ key, loading: false, moreBusy: false, rows: [...(sessions.status === 'fulfilled' ? sessions.value.records : []), ...(learning.status === 'fulfilled' ? learning.value : []), ...(partners.status === 'fulfilled' ? partners.value : [])], offset: sessions.status === 'fulfilled' ? sessions.value.offset : 0, hasMore: sessions.status === 'fulfilled' && sessions.value.hasMore, errors });
      });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [enabled, key, learningEnabled, query, workspace]));
  const current = state?.key === key ? state : undefined;
  const loadMore = async () => {
    const controller = active.current;
    if (!current || !current.hasMore || current.loading || moreLock.current || !controller || controller.signal.aborted) return;
    moreLock.current = true; setState(previous => previous?.key === key ? { ...previous, moreBusy: true } : previous);
    try {
      const page = await searchConversations(query, workspace, current.offset, controller.signal);
      if (!controller.signal.aborted) setState(previous => {
        if (!previous || previous.key !== key) return previous;
        const ids = new Set(previous.rows.map(row => row.id));
        const errors = { ...previous.errors }; delete errors.session;
        return { ...previous, moreBusy: false, rows: [...previous.rows, ...page.records.filter(row => !ids.has(row.id))], offset: page.offset, hasMore: page.hasMore, errors };
      });
    } catch (cause) {
      if (!controller.signal.aborted) setState(previous => previous?.key === key ? { ...previous, moreBusy: false, errors: { ...previous.errors, session: searchError(cause) } } : previous);
    } finally { if (active.current === controller) moreLock.current = false; }
  };
  return { rows: current?.rows ?? [], loading: enabled && query.trim().length <= MAX_QUERY_LENGTH && (!current || current.loading), hasMore: current?.hasMore ?? false, moreBusy: current?.moreBusy ?? false, errors: current?.errors ?? {}, retry: () => setRevision(value => value + 1), loadMore };
}
