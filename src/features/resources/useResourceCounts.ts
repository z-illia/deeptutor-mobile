import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { accountCountKeys, libraryCountKeys, readCount, countError, type Count, type ResourceKey } from './api';
export function useResourceCounts(account: boolean, workspace: string, owner: string) {
  const [revision, setRevision] = useState(0);
  const scope = account ? '' : workspace;
  const key = JSON.stringify([account, scope, owner, revision]);
  const [state, setState] = useState<{ key: string; counts: Partial<Record<ResourceKey, Count>> }>();
  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    for (const resource of account ? accountCountKeys : libraryCountKeys) {
      void readCount(resource, scope, controller.signal).then(value => {
        if (!controller.signal.aborted) setState(previous => ({ key, counts: { ...(previous?.key === key ? previous.counts : {}), [resource]: { status: 'ready', value } } }));
      }).catch(cause => {
        if (!controller.signal.aborted) setState(previous => ({ key, counts: { ...(previous?.key === key ? previous.counts : {}), [resource]: { status: 'error', error: countError(cause) } } }));
      });
    }
    return () => controller.abort();
  }, [account, key, scope]));
  return { counts: state?.key === key ? state.counts : {}, refresh: () => setRevision(value => value + 1) };
}
