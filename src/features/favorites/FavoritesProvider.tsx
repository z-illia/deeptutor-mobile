import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import type { NotebookRecordItem, NotebookSaveMessage, NotebookSavePayload, NotebookSummary } from './model';
import * as repository from './api';

export type FavoritesLibraryState = 'ready' | 'loading' | 'empty' | 'error';
export interface SaveModalRequest { payload: NotebookSavePayload; messages?: NotebookSaveMessage[] }

function useLibrary(workspace: string, enabled: boolean) {
  const [notebooks, setNotebooks] = useState<NotebookSummary[]>([]);
  const [recordsByNotebook, setRecords] = useState<Record<string, NotebookRecordItem[]>>({});
  const [libraryState, setLibraryState] = useState<FavoritesLibraryState>('loading');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeSaveModal, setActiveSaveModal] = useState<SaveModalRequest | null>(null);
  const read = useRef<AbortController | null>(null);
  const write = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; read.current?.abort(); write.current?.abort(); };
  }, []);

  const refresh = useCallback(async (notebookId?: string) => {
    if (!enabled || write.current) return;
    read.current?.abort();
    const controller = new AbortController(); read.current = controller;
    setLibraryState('loading'); setError('');
    try {
      const rows = await repository.listNotebooks(workspace, controller.signal);
      if (controller.signal.aborted) return;
      setNotebooks(rows);
      setRecords(previous => Object.fromEntries(Object.entries(previous).filter(([id]) => rows.some(row => row.id === id))));
      if (notebookId) {
        const detail = await repository.getNotebook(notebookId, workspace, controller.signal);
        if (controller.signal.aborted) return;
        setNotebooks(previous => [...previous.filter(item => item.id !== notebookId), detail.notebook]);
        setRecords(previous => ({ ...previous, [notebookId]: detail.records }));
      }
      setLibraryState(rows.length || notebookId ? 'ready' : 'empty');
    } catch (cause) {
      if (!controller.signal.aborted) { setError(repository.favoritesError(cause)); setLibraryState('error'); }
    }
  }, [enabled, workspace]);

  const mutate = useCallback(async <T,>(action: (signal: AbortSignal) => Promise<T>, commit: (result: T) => void): Promise<T> => {
    if (!enabled || write.current || libraryState === 'loading') throw new Error('Please wait and try again.');
    read.current?.abort();
    const controller = new AbortController(); write.current = controller; setBusy(true);
    try {
      const result = await action(controller.signal);
      if (controller.signal.aborted || !mounted.current) throw new Error('The workspace has changed.');
      commit(result); setLibraryState('ready'); setError('');
      return result;
    } finally {
      if (write.current === controller) write.current = null;
      if (mounted.current) setBusy(false);
    }
  }, [enabled, libraryState]);

  const touch = (ids: string[], delta = 0) => setNotebooks(previous => previous.map(item => ids.includes(item.id)
    ? { ...item, record_count: Math.max(0, item.record_count + delta), updated_at: Date.now() / 1000 } : item));
  const createNotebook = (input: repository.NotebookInput) => mutate(
    signal => repository.createNotebook(input, workspace, signal),
    notebook => { setNotebooks(previous => [notebook, ...previous]); setRecords(previous => ({ ...previous, [notebook.id]: [] })); },
  );
  const updateNotebook = (id: string, input: repository.NotebookInput) => mutate(
    signal => repository.updateNotebook(id, input, workspace, signal),
    notebook => setNotebooks(previous => previous.map(item => item.id === id ? notebook : item)),
  );
  const deleteNotebook = (id: string) => mutate(signal => repository.deleteNotebook(id, workspace, signal), () => {
    setNotebooks(previous => previous.filter(item => item.id !== id));
    setRecords(previous => { const next = { ...previous }; delete next[id]; return next; });
  });
  const saveRecordToNotebooks = (ids: string[], payload: NotebookSavePayload) => mutate(
    signal => repository.saveRecord(ids, payload, workspace, signal), result => {
      setRecords(previous => {
        const next = { ...previous };
        // Keep an unloaded detail unloaded; an added record is not its full list.
        for (const record of result.records) if (next[record.notebook_id]) next[record.notebook_id] = [...next[record.notebook_id], record];
        return next;
      });
      touch(result.savedNotebookIds, 1);
    },
  );
  const updateRecord = (id: string, recordId: string, patch: { title: string; summary?: string }) => mutate(
    signal => repository.updateRecord(id, recordId, patch, workspace, signal), record => {
      setRecords(previous => ({ ...previous, [id]: (previous[id] ?? []).map(item => item.id === recordId ? record : item) })); touch([id]);
    },
  );
  const deleteRecord = (id: string, recordId: string) => mutate(signal => repository.deleteRecord(id, recordId, workspace, signal), () => {
    setRecords(previous => ({ ...previous, [id]: (previous[id] ?? []).filter(item => item.id !== recordId) })); touch([id], -1);
  });
  const relocateRecord = (mode: 'move' | 'copy', id: string, recordId: string, target: string) => mutate(
    signal => repository.relocateRecord(mode, id, recordId, target, workspace, signal), record => {
      setRecords(previous => {
        const next = { ...previous };
        if (mode === 'move' && next[id]) next[id] = next[id].filter(item => item.id !== recordId);
        if (next[target]) next[target] = [...next[target], record];
        return next;
      });
      if (mode === 'move') touch([id], -1);
      touch([target], 1);
    },
  );
  const locateRecord = useCallback((recordId: string) => {
    for (const notebook of notebooks) {
      const record = recordsByNotebook[notebook.id]?.find(item => item.id === recordId);
      if (record) return { notebook, record };
    }
    return null;
  }, [notebooks, recordsByNotebook]);
  const resolveRecord = useCallback((recordId: string, preferredId: string, signal?: AbortSignal) => repository.locateRecord(recordId, preferredId, workspace, signal), [workspace]);
  const exportNotebook = (id: string) => mutate(signal => repository.exportNotebook(id, workspace, signal), () => {});
  const openSaveModal = useCallback((request: SaveModalRequest) => { setActiveSaveModal(request); }, []);
  const closeSaveModal = useCallback(() => { if (!write.current) setActiveSaveModal(null); }, []);
  const resetFavoritesFixtures = useCallback(() => { void refresh(); }, [refresh]);
  return { notebooks, recordsByNotebook, libraryState, error, busy, refresh, activeSaveModal, openSaveModal, closeSaveModal,
    createNotebook, updateNotebook, deleteNotebook, saveRecordToNotebooks, updateRecord, deleteRecord, relocateRecord, locateRecord,
    resolveRecord, exportNotebook, resetFavoritesFixtures };
}
export type FavoritesContextValue = ReturnType<typeof useLibrary>;
const Context = createContext<FavoritesContextValue | null>(null);
function FavoritesSession({ children, workspace, enabled }: PropsWithChildren<{ workspace: string; enabled: boolean }>) {
  return <Context.Provider value={useLibrary(workspace, enabled)}>{children}</Context.Provider>;
}
export function FavoritesProvider({ children }: PropsWithChildren) {
  const auth = useAuth(); const scope = useWorkspaces();
  const enabled = scope.ready && !auth.loading && !!auth.session && (!auth.session.status.enabled || auth.session.status.authenticated);
  const key = JSON.stringify([auth.serverUrl, auth.session?.profile?.id ?? (auth.session?.status.enabled ? 'signed-out' : 'local'), scope.selectedWorkspaceId]);
  return <FavoritesSession key={key} workspace={scope.selectedWorkspaceId} enabled={enabled}>{children}</FavoritesSession>;
}
export function useFavorites() {
  const value = useContext(Context);
  if (!value) throw new Error('useFavorites must be used within a FavoritesProvider');
  return value;
}
