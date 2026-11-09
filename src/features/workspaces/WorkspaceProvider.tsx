import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { isAxiosError } from 'axios';
import { useAuth } from '@/features/auth/AuthProvider';
import { listWorkspaces, workspaceStorageKey, type Workspace } from './repository';

function errorMessage(cause: unknown) {
  if (isAxiosError(cause)) {
    const detail = cause.response?.data?.detail;
    return typeof detail === 'string' ? detail : 'Unable to load workspaces. Please try again.';
  }
  return cause instanceof Error ? cause.message : 'Unable to load workspaces. Please try again.';
}

function useWorkspaceState(storageKey: string, enabled: boolean) {
  const [selectedWorkspaceId, setSelected] = useState('');
  const [ready, setReady] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [switching, setSwitching] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const lock = useRef(false);

  useEffect(() => {
    mounted.current = true;
    void AsyncStorage.getItem(storageKey).then(value => {
      if (mounted.current) setSelected(value ?? '');
    }).catch(() => {
      if (mounted.current) setStorageError('Could not restore the selected workspace.');
    }).finally(() => { if (mounted.current) setReady(true); });
    return () => { mounted.current = false; activeRequest.current?.abort(); };
  }, [storageKey]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    activeRequest.current?.abort();
    const abort = new AbortController();
    activeRequest.current = abort;
    setLoading(true); setError('');
    try {
      const rows = await listWorkspaces(abort.signal);
      if (!abort.signal.aborted) { setWorkspaces(rows); setLoaded(true); }
    } catch (cause) {
      if (!abort.signal.aborted) setError(errorMessage(cause));
    } finally { if (!abort.signal.aborted) setLoading(false); }
  }, [enabled]);

  useEffect(() => {
    let active = true;
    if (ready) void Promise.resolve().then(() => { if (active) return refresh(); });
    return () => { active = false; };
  }, [ready, refresh]);

  const selectWorkspace = useCallback(async (id: string) => {
    if (lock.current) return false;
    if (id !== '' && (!loaded || !workspaces.some(item => item.workspace_id === id))) {
      setStorageError('This workspace is unavailable. Refresh the list and try again.');
      return false;
    }
    lock.current = true; setSwitching(true); setStorageError('');
    try {
      await AsyncStorage.setItem(storageKey, id);
      if (!mounted.current) return false;
      setSelected(id);
      return true;
    } catch {
      if (mounted.current) setStorageError('Could not save the selected workspace. Please try again.');
      return false;
    } finally { lock.current = false; if (mounted.current) setSwitching(false); }
  }, [storageKey, loaded, workspaces]);

  // Retain the current scope after a failed read. Never silently request another
  // workspace's data if a saved registration was removed or archived.
  const unavailable = loaded && selectedWorkspaceId !== '' && !workspaces.some(item => item.workspace_id === selectedWorkspaceId);
  return { selectedWorkspaceId, workspaces, ready, loading, loaded, error, storageError, switching, unavailable, refresh, selectWorkspace };
}

const Context = createContext<ReturnType<typeof useWorkspaceState> | null>(null);
function WorkspaceSession({ children, storageKey, enabled }: PropsWithChildren<{ storageKey: string; enabled: boolean }>) {
  return <Context.Provider value={useWorkspaceState(storageKey, enabled)}>{children}</Context.Provider>;
}
export function WorkspaceProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const identity = auth.session?.profile?.id ?? (auth.session?.status.enabled ? 'signed-out' : 'local');
  const storageKey = workspaceStorageKey(auth.serverUrl, identity);
  const enabled = !auth.loading && !!auth.session && (!auth.session.status.enabled || auth.session.status.authenticated);
  return <WorkspaceSession key={storageKey} storageKey={storageKey} enabled={enabled}>{children}</WorkspaceSession>;
}
export function useWorkspaces() {
  const value = useContext(Context);
  if (!value) throw new Error('WorkspaceProvider is required');
  return value;
}
