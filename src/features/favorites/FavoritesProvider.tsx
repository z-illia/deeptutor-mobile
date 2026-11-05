import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_NOTEBOOK_COLOR,
  type NotebookRecordItem,
  type NotebookSaveMessage,
  type NotebookSavePayload,
  type NotebookSummary,
} from './model';
import {
  createInitialNotebookRecords,
  createInitialNotebooks,
} from './repository';

export type FavoritesLibraryState = 'ready' | 'loading' | 'empty' | 'error';

export interface SaveModalRequest {
  payload: NotebookSavePayload;
  messages?: NotebookSaveMessage[];
}

export interface FavoritesContextValue {
  notebooks: NotebookSummary[];
  recordsByNotebook: Record<string, NotebookRecordItem[]>;
  libraryState: FavoritesLibraryState;
  setLibraryState: (state: FavoritesLibraryState) => void;
  activeSaveModal: SaveModalRequest | null;
  openSaveModal: (request: SaveModalRequest) => void;
  closeSaveModal: () => void;
  createNotebook: (input: {
    name: string;
    description?: string;
    color?: string;
  }) => NotebookSummary;
  updateNotebook: (
    id: string,
    patch: { name: string; description?: string; color?: string },
  ) => void;
  deleteNotebook: (id: string) => void;
  saveRecordToNotebooks: (
    notebookIds: string[],
    payload: NotebookSavePayload,
  ) => NotebookRecordItem[];
  updateRecord: (
    notebookId: string,
    recordId: string,
    patch: { title: string; summary?: string },
  ) => void;
  deleteRecord: (notebookId: string, recordId: string) => void;
  relocateRecord: (
    mode: 'move' | 'copy',
    sourceNotebookId: string,
    recordId: string,
    targetNotebookId: string,
  ) => NotebookRecordItem | null;
  locateRecord: (
    recordId: string,
  ) => { notebook: NotebookSummary; record: NotebookRecordItem } | null;
  resetFavoritesFixtures: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [notebooks, setNotebooks] = useState<NotebookSummary[]>(() =>
    createInitialNotebooks(),
  );
  const [recordsByNotebook, setRecordsByNotebook] = useState<
    Record<string, NotebookRecordItem[]>
  >(() => createInitialNotebookRecords());
  const [libraryState, setLibraryState] =
    useState<FavoritesLibraryState>('ready');
  const [activeSaveModal, setActiveSaveModal] =
    useState<SaveModalRequest | null>(null);

  const openSaveModal = useCallback((request: SaveModalRequest) => {
    setActiveSaveModal(request);
  }, []);

  const closeSaveModal = useCallback(() => {
    setActiveSaveModal(null);
  }, []);

  const createNotebook = useCallback(
    (input: { name: string; description?: string; color?: string }) => {
      const now = Date.now() / 1000;
      const newNotebook: NotebookSummary = {
        id: `nb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: input.name.trim(),
        description: input.description?.trim() ?? '',
        color: input.color || DEFAULT_NOTEBOOK_COLOR,
        record_count: 0,
        updated_at: now,
        workspace_id: 'ws-default',
      };
      setNotebooks((prev) => [newNotebook, ...prev]);
      setRecordsByNotebook((prev) => ({
        ...prev,
        [newNotebook.id]: [],
      }));
      return newNotebook;
    },
    [],
  );

  const updateNotebook = useCallback(
    (
      id: string,
      patch: { name: string; description?: string; color?: string },
    ) => {
      const now = Date.now() / 1000;
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === id
            ? {
                ...nb,
                name: patch.name.trim(),
                description:
                  patch.description !== undefined
                    ? patch.description.trim()
                    : nb.description,
                color: patch.color || nb.color,
                updated_at: now,
              }
            : nb,
        ),
      );
    },
    [],
  );

  const deleteNotebook = useCallback((id: string) => {
    setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    setRecordsByNotebook((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const saveRecordToNotebooks = useCallback(
    (notebookIds: string[], payload: NotebookSavePayload) => {
      const now = Date.now() / 1000;
      const created: NotebookRecordItem[] = [];
      setRecordsByNotebook((prev) => {
        const next = { ...prev };
        notebookIds.forEach((notebookId, idx) => {
          const item: NotebookRecordItem = {
            id: `fav-rec-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            notebook_id: notebookId,
            type: payload.recordType,
            title: payload.title.trim() || 'Untitled favorite',
            user_query: payload.userQuery,
            summary: payload.summary?.trim() || undefined,
            output: payload.output,
            created_at: now,
            metadata: payload.metadata,
          };
          created.push(item);
          next[notebookId] = [item, ...(next[notebookId] ?? [])];
        });
        return next;
      });
      setNotebooks((prev) =>
        prev.map((nb) => {
          if (!notebookIds.includes(nb.id)) return nb;
          return {
            ...nb,
            record_count: (nb.record_count ?? 0) + 1,
            updated_at: now,
          };
        }),
      );
      return created;
    },
    [],
  );

  const updateRecord = useCallback(
    (
      notebookId: string,
      recordId: string,
      patch: { title: string; summary?: string },
    ) => {
      const now = Date.now() / 1000;
      setRecordsByNotebook((prev) => {
        const list = prev[notebookId] ?? [];
        return {
          ...prev,
          [notebookId]: list.map((rec) =>
            rec.id === recordId
              ? {
                  ...rec,
                  title: patch.title.trim(),
                  summary:
                    patch.summary !== undefined
                      ? patch.summary.trim()
                      : rec.summary,
                }
              : rec,
          ),
        };
      });
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === notebookId ? { ...nb, updated_at: now } : nb,
        ),
      );
    },
    [],
  );

  const deleteRecord = useCallback((notebookId: string, recordId: string) => {
    const now = Date.now() / 1000;
    setRecordsByNotebook((prev) => {
      const list = prev[notebookId] ?? [];
      const filtered = list.filter((rec) => rec.id !== recordId);
      return {
        ...prev,
        [notebookId]: filtered,
      };
    });
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              record_count: Math.max(0, (nb.record_count ?? 1) - 1),
              updated_at: now,
            }
          : nb,
      ),
    );
  }, []);

  const relocateRecord = useCallback(
    (
      mode: 'move' | 'copy',
      sourceNotebookId: string,
      recordId: string,
      targetNotebookId: string,
    ): NotebookRecordItem | null => {
      const sourceList = recordsByNotebook[sourceNotebookId] ?? [];
      const sourceItem = sourceList.find((r) => r.id === recordId);
      if (!sourceItem || sourceNotebookId === targetNotebookId) return null;

      const now = Date.now() / 1000;
      const newRecord: NotebookRecordItem = {
        ...sourceItem,
        id:
          mode === 'move'
            ? sourceItem.id
            : `fav-rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        notebook_id: targetNotebookId,
        created_at: mode === 'move' ? sourceItem.created_at : now,
      };

      setRecordsByNotebook((prev) => {
        const currentSource = prev[sourceNotebookId] ?? [];
        const currentTarget = prev[targetNotebookId] ?? [];
        return {
          ...prev,
          [sourceNotebookId]:
            mode === 'move'
              ? currentSource.filter((r) => r.id !== recordId)
              : currentSource,
          [targetNotebookId]: [newRecord, ...currentTarget],
        };
      });

      setNotebooks((prev) =>
        prev.map((nb) => {
          if (nb.id === sourceNotebookId && mode === 'move') {
            return {
              ...nb,
              record_count: Math.max(0, (nb.record_count ?? 1) - 1),
              updated_at: now,
            };
          }
          if (nb.id === targetNotebookId) {
            return {
              ...nb,
              record_count: (nb.record_count ?? 0) + 1,
              updated_at: now,
            };
          }
          return nb;
        }),
      );

      return newRecord;
    },
    [recordsByNotebook],
  );

  const locateRecord = useCallback(
    (recordId: string) => {
      for (const nb of notebooks) {
        const list = recordsByNotebook[nb.id] ?? [];
        const found = list.find((r) => r.id === recordId);
        if (found) {
          return { notebook: nb, record: found };
        }
      }
      return null;
    },
    [notebooks, recordsByNotebook],
  );

  const resetFavoritesFixtures = useCallback(() => {
    setNotebooks(createInitialNotebooks());
    setRecordsByNotebook(createInitialNotebookRecords());
    setLibraryState('ready');
    setActiveSaveModal(null);
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      notebooks,
      recordsByNotebook,
      libraryState,
      setLibraryState,
      activeSaveModal,
      openSaveModal,
      closeSaveModal,
      createNotebook,
      updateNotebook,
      deleteNotebook,
      saveRecordToNotebooks,
      updateRecord,
      deleteRecord,
      relocateRecord,
      locateRecord,
      resetFavoritesFixtures,
    }),
    [
      notebooks,
      recordsByNotebook,
      libraryState,
      activeSaveModal,
      openSaveModal,
      closeSaveModal,
      createNotebook,
      updateNotebook,
      deleteNotebook,
      saveRecordToNotebooks,
      updateRecord,
      deleteRecord,
      relocateRecord,
      locateRecord,
      resetFavoritesFixtures,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
}
