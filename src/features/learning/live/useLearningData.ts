import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { chatError } from '@/features/chat/live/useLiveChat';

/** One request owner per view; refresh and blur cancel superseded reads. */
export function useLearningData<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const activeRequest = useRef<AbortController | null>(null);
  const refresh = useCallback(() => {
    activeRequest.current?.abort();
    const abort = new AbortController();
    activeRequest.current = abort;
    setLoading(true); setError('');
    void load(abort.signal).then(value => { if (!abort.signal.aborted) setData(value); })
      .catch(cause => { if (!abort.signal.aborted) setError(chatError(cause)); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
  }, [load]);
  useFocusEffect(useCallback(() => {
    refresh();
    return () => activeRequest.current?.abort();
  }, [refresh]));
  return { data, loading, error, refresh };
}
