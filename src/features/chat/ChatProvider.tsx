import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useFixtures } from '@/features/entry/FixtureProvider';
import {
  buildVisiblePath,
  isPlaceholderSessionTitle,
  selectChildBranch,
  tipMessageId,
  type ChatAttachmentSummary,
  type ChatMessageItem,
  type LLMOption,
  type LLMSelection,
  type MasteryTopicLabel,
  type ReadingCollectionLabel,
  type SessionOrganizationPatch,
  type SessionSummary,
} from './model';
import {
  buildSimulatedAssistantChunks,
  createInitialMessagesBySession,
  createInitialSessions,
  DEFAULT_LLM_SELECTION,
  INITIAL_LLM_OPTIONS,
  MASTERY_TOPICS_BY_WORKSPACE,
  PERSONAL_SUGGESTION_SETS,
  READING_COLLECTIONS_BY_WORKSPACE,
} from './repository';

export type CatalogLoadState = 'ready' | 'loading' | 'error' | 'empty';
export type SessionViewState = 'ready' | 'loading' | 'error';

export interface ChatContextValue {
  sessions: SessionSummary[];
  messagesBySession: Record<string, ChatMessageItem[]>;
  liveSessionIds: ReadonlySet<string>;
  llmOptions: LLMOption[];
  modelCatalogState: CatalogLoadState;
   setModelCatalogState: (state: CatalogLoadState) => void;
  sessionViewState: SessionViewState;
  setSessionViewState: (state: SessionViewState) => void;
  defaultModel: LLMSelection;
  getEffectiveModel: (sessionId: string | null) => LLMSelection;
  selectModel: (sessionId: string | null, selection: LLMSelection) => void;
  refreshModels: () => void;
  getDraft: (sessionId: string | null) => string;
  setDraft: (sessionId: string | null, value: string) => void;
  getAttachments: (sessionId: string | null) => ChatAttachmentSummary[];
  addAttachment: (
    sessionId: string | null,
    candidate: ChatAttachmentSummary,
  ) => { ok: boolean; error?: string };
  removeAttachment: (sessionId: string | null, attachmentId: string) => void;
  clearAttachments: (sessionId: string | null) => void;
  getSelectedBranches: (sessionId: string) => Record<string, number>;
  switchBranch: (
    sessionId: string,
    parentMessageId: number | null,
    childId: number,
  ) => void;
  sendMessage: (
    sessionId: string | null,
    overrideContent?: string,
  ) => { ok: boolean; sessionId: string | null; error?: string };
  stopStreaming: (sessionId: string) => void;
  retryLastTurn: (sessionId: string) => void;
  editUserMessage: (
    sessionId: string,
    messageId: number,
    newContent: string,
  ) => { ok: boolean; error?: string };
  deleteTurn: (sessionId: string, userMessageId: number) => void;
  discardFailedSubmission: (sessionId: string, messageId: number) => void;
  retryFailedSubmission: (sessionId: string, messageId: number) => void;
  renameSession: (
    sessionId: string,
    title: string,
  ) => { ok: boolean; error?: string };
  organizeSession: (
    sessionId: string,
    patch: SessionOrganizationPatch,
  ) => { ok: boolean; error?: string };
  deleteSession: (sessionId: string) => { ok: boolean; error?: string };
  deleteAllArchived: (workspaceId?: string) => {
    ok: boolean;
    count: number;
    error?: string;
  };
  masteryTopicsForWorkspace: (workspaceId: string) => MasteryTopicLabel[];
  readingCollectionsForWorkspace: (
    workspaceId: string,
  ) => ReadingCollectionLabel[];
  personalSuggestions: string[];
  personalSuggestionsLoading: boolean;
  refreshPersonalSuggestions: () => void;
  playingMessageId: number | null;
  togglePlayAloud: (messageId: number) => void;
  resetChatFixtures: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { workspace, failOperation } = useFixtures();
  const [sessions, setSessions] = useState<SessionSummary[]>(() =>
    createInitialSessions(),
  );
  const [messagesBySession, setMessagesBySession] = useState<
    Record<string, ChatMessageItem[]>
  >(() => createInitialMessagesBySession());
  const [draftsByKey, setDraftsByKey] = useState<Record<string, string>>({});
  const [attachmentsByKey, setAttachmentsByKey] = useState<
    Record<string, ChatAttachmentSummary[]>
  >({});
  const [selectedBranchesBySession, setSelectedBranchesBySession] = useState<
    Record<string, Record<string, number>>
  >(() => ({
    'session-general-1': { null: 101 },
  }));
  const [liveSessionIds, setLiveSessionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [defaultModel, setDefaultModel] = useState<LLMSelection>(
    DEFAULT_LLM_SELECTION,
  );
  const [modelCatalogState, setModelCatalogState] =
    useState<CatalogLoadState>('ready');
  const [sessionViewState, setSessionViewState] =
    useState<SessionViewState>('ready');
  const [suggestionSetIdx, setSuggestionSetIdx] = useState(0);
  const [personalSuggestionsLoading, setPersonalSuggestionsLoading] =
    useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);

  const nextMsgIdRef = useRef(2000);
  const nextSessionSeqRef = useRef(1);
  const streamTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>[]>>(
    new Map(),
  );
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSessionTimers = useCallback((sessionId: string) => {
    const timers = streamTimersRef.current.get(sessionId);
    if (timers) {
      timers.forEach((t) => clearTimeout(t));
      streamTimersRef.current.delete(sessionId);
    }
  }, []);

  useEffect(() => {
    const timersMap = streamTimersRef.current;
    return () => {
      timersMap.forEach((timers) => timers.forEach((t) => clearTimeout(t)));
      timersMap.clear();
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    };
  }, []);

  const draftKey = useCallback(
    (sessionId: string | null) => `${workspace}::${sessionId ?? '__new__'}`,
    [workspace],
  );

  const getDraft = useCallback(
    (sessionId: string | null) => draftsByKey[draftKey(sessionId)] ?? '',
    [draftKey, draftsByKey],
  );

  const setDraft = useCallback(
    (sessionId: string | null, value: string) => {
      const key = draftKey(sessionId);
      setDraftsByKey((prev) => ({ ...prev, [key]: value }));
    },
    [draftKey],
  );

  const getAttachments = useCallback(
    (sessionId: string | null) =>
      attachmentsByKey[draftKey(sessionId)] ?? [],
    [attachmentsByKey, draftKey],
  );

  const addAttachment = useCallback(
    (
      sessionId: string | null,
      candidate: ChatAttachmentSummary,
    ): { ok: boolean; error?: string } => {
      if (candidate.status === 'invalid') {
        return {
          ok: false,
          error: candidate.errorReason ?? 'Unsupported attachment type',
        };
      }
      const key = draftKey(sessionId);
      setAttachmentsByKey((prev) => {
        const current = prev[key] ?? [];
        if (current.some((item) => item.id === candidate.id)) return prev;
        return { ...prev, [key]: [...current, candidate] };
      });
      return { ok: true };
    },
    [draftKey],
  );

  const removeAttachment = useCallback(
    (sessionId: string | null, attachmentId: string) => {
      const key = draftKey(sessionId);
      setAttachmentsByKey((prev) => ({
        ...prev,
        [key]: (prev[key] ?? []).filter((item) => item.id !== attachmentId),
      }));
    },
    [draftKey],
  );

  const clearAttachments = useCallback(
    (sessionId: string | null) => {
      const key = draftKey(sessionId);
      setAttachmentsByKey((prev) => ({ ...prev, [key]: [] }));
    },
    [draftKey],
  );

  const getSelectedBranches = useCallback(
    (sessionId: string): Record<string, number> =>
      selectedBranchesBySession[sessionId] ?? {},
    [selectedBranchesBySession],
  );

  const switchBranch = useCallback(
    (sessionId: string, parentMessageId: number | null, childId: number) => {
      setSelectedBranchesBySession((prev) => ({
        ...prev,
        [sessionId]: selectChildBranch(
          prev[sessionId] ?? {},
          parentMessageId,
          childId,
        ),
      }));
    },
    [],
  );

  const getEffectiveModel = useCallback(
    (sessionId: string | null): LLMSelection => {
      if (sessionId) {
        const found = sessions.find((s) => s.session_id === sessionId);
        if (found?.preferences?.llm) return found.preferences.llm;
      }
      return defaultModel;
    },
    [defaultModel, sessions],
  );

  const selectModel = useCallback(
    (sessionId: string | null, selection: LLMSelection) => {
      setDefaultModel(selection);
      if (sessionId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.session_id === sessionId
              ? {
                  ...s,
                  preferences: {
                    ...s.preferences,
                    llm: selection,
                  },
                }
              : s,
          ),
        );
      }
    },
    [],
  );

  const refreshModels = useCallback(() => {
    if (failOperation) {
      setModelCatalogState('error');
      return;
    }
    setModelCatalogState('ready');
  }, [failOperation]);

  const scheduleAssistantStream = useCallback(
    (
      targetSessionId: string,
      assistantMsgId: number,
      prompt: string,
      selection: LLMSelection,
      attachments: ChatAttachmentSummary[],
    ) => {
      clearSessionTimers(targetSessionId);
      const { chunks, usage, suggestedTitle } = buildSimulatedAssistantChunks(
        prompt,
        selection,
        attachments,
      );
      const isSlowStream = prompt.toLowerCase().includes('[stream]');
      const firstDelay = isSlowStream ? 800 : 120;
      const finalDelay = isSlowStream ? 2400 : 280;

      setLiveSessionIds((prev) => {
        const next = new Set(prev);
        next.add(targetSessionId);
        return next;
      });

      const t1 = setTimeout(() => {
        setMessagesBySession((prev) => ({
          ...prev,
          [targetSessionId]: (prev[targetSessionId] ?? []).map((m) =>
            m.id === assistantMsgId ? { ...m, content: chunks[1] } : m,
          ),
        }));
      }, firstDelay);

      const t2 = setTimeout(() => {
        setMessagesBySession((prev) => ({
          ...prev,
          [targetSessionId]: (prev[targetSessionId] ?? []).map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: chunks[2],
                  isStreaming: false,
                  usage,
                }
              : m,
          ),
        }));
        setSessions((prev) =>
          prev.map((s) =>
            s.session_id === targetSessionId
              ? {
                  ...s,
                  title: isPlaceholderSessionTitle(s.title)
                    ? suggestedTitle
                    : s.title,
                  updated_at: '2026-04-20T16:00:00Z',
                  last_message_preview: chunks[2]
                    .replace(/[#*`>-]/g, '')
                    .trim()
                    .slice(0, 120),
                }
              : s,
          ),
        );
        setLiveSessionIds((prev) => {
          const next = new Set(prev);
          next.delete(targetSessionId);
          return next;
        });
        streamTimersRef.current.delete(targetSessionId);
      }, finalDelay);

      streamTimersRef.current.set(targetSessionId, [t1, t2]);
    },
    [clearSessionTimers],
  );

  const stopStreaming = useCallback(
    (sessionId: string) => {
      clearSessionTimers(sessionId);
      setLiveSessionIds((prev) => {
        const next = new Set(prev);
        next.delete(sessionId);
        return next;
      });
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] ?? []).map((m) =>
          m.isStreaming
            ? {
                ...m,
                isStreaming: false,
                stopped: true,
              }
            : m,
        ),
      }));
    },
    [clearSessionTimers],
  );

  const sendMessage = useCallback(
    (
      sessionId: string | null,
      overrideContent?: string,
    ): { ok: boolean; sessionId: string | null; error?: string } => {
      const currentDraft =
        overrideContent !== undefined ? overrideContent : getDraft(sessionId);
      const currentAttachments = getAttachments(sessionId);
      const trimmed = currentDraft.trim();
      if (!trimmed && currentAttachments.length === 0) {
        return { ok: false, sessionId, error: 'Empty message' };
      }

      if (sessionId && liveSessionIds.has(sessionId)) {
        return {
          ok: false,
          sessionId,
          error: 'Finish or stop the current generation first.',
        };
      }

      let targetSessionId = sessionId;
      const model = getEffectiveModel(sessionId);

      if (!targetSessionId) {
        const seq = nextSessionSeqRef.current++;
        targetSessionId = `session-local-${seq}`;
        const words = (trimmed || 'Attached study material')
          .replace(/[^\w\s-]/g, ' ')
          .trim()
          .split(/\s+/)
          .slice(0, 6);
        const initialTitle = words.join(' ').slice(0, 48) || 'New conversation';
        const newSessionSummary: SessionSummary = {
          session_id: targetSessionId,
          title: initialTitle,
          created_at: '2026-04-20T15:45:00Z',
          updated_at: '2026-04-20T15:45:00Z',
          message_count: failOperation ? 1 : 2,
          last_message_preview: trimmed || currentAttachments[0]?.name || '',
          session_type: 'chat',
          parent_session_id: null,
          workspace_id: workspace,
          workspace_mode: 'chat',
          preferences: {
            pinned: false,
            archived: false,
            workspace_id: workspace,
            llm: model,
          },
        };
        setSessions((prev) => [newSessionSummary, ...prev]);
      }

      const existingMessages = messagesBySession[targetSessionId] ?? [];
      const currentBranches = selectedBranchesBySession[targetSessionId] ?? {};
      const visible = buildVisiblePath(existingMessages, currentBranches).messages;
      const parentId = tipMessageId(visible);

      const userMsgId = nextMsgIdRef.current++;

      if (failOperation) {
        const failedUserMsg: ChatMessageItem = {
          id: userMsgId,
          parentMessageId: parentId,
          role: 'user',
          content: trimmed,
          createdAt: '2026-04-20T15:45:00Z',
          attachments: currentAttachments.length ? currentAttachments : undefined,
          llm: model,
          failedSubmission: true,
          error: "Couldn't reach the server. Please check your connection and retry.",
        };
        setMessagesBySession((prev) => ({
          ...prev,
          [targetSessionId!]: [...(prev[targetSessionId!] ?? []), failedUserMsg],
        }));
        setSelectedBranchesBySession((prev) => ({
          ...prev,
          [targetSessionId!]: selectChildBranch(
            prev[targetSessionId!] ?? {},
            parentId,
            userMsgId,
          ),
        }));
        setDraft(sessionId, '');
        clearAttachments(sessionId);
        return {
          ok: false,
          sessionId: targetSessionId,
          error: "Couldn't reach the server. Please check your connection and retry.",
        };
      }

      const assistantMsgId = nextMsgIdRef.current++;
      const { chunks } = buildSimulatedAssistantChunks(
        trimmed,
        model,
        currentAttachments,
      );

      const userMsg: ChatMessageItem = {
        id: userMsgId,
        parentMessageId: parentId,
        role: 'user',
        content: trimmed,
        createdAt: '2026-04-20T15:45:00Z',
        attachments: currentAttachments.length ? currentAttachments : undefined,
        llm: model,
      };

      const assistantMsg: ChatMessageItem = {
        id: assistantMsgId,
        parentMessageId: userMsgId,
        role: 'assistant',
        content: chunks[0],
        createdAt: '2026-04-20T15:45:01Z',
        llm: model,
        isStreaming: true,
      };

      setMessagesBySession((prev) => ({
        ...prev,
        [targetSessionId!]: [
          ...(prev[targetSessionId!] ?? []),
          userMsg,
          assistantMsg,
        ],
      }));
      setSelectedBranchesBySession((prev) => ({
        ...prev,
        [targetSessionId!]: selectChildBranch(
          prev[targetSessionId!] ?? {},
          parentId,
          userMsgId,
        ),
      }));
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === targetSessionId
            ? {
                ...s,
                updated_at: '2026-04-20T15:45:01Z',
                message_count: s.message_count + 2,
                last_message_preview: trimmed,
              }
            : s,
        ),
      );

      setDraft(sessionId, '');
      if (targetSessionId !== sessionId) {
        setDraft(targetSessionId, '');
      }
      clearAttachments(sessionId);

      scheduleAssistantStream(
        targetSessionId,
        assistantMsgId,
        trimmed,
        model,
        currentAttachments,
      );

      return { ok: true, sessionId: targetSessionId };
    },
    [
      clearAttachments,
      failOperation,
      getAttachments,
      getDraft,
      getEffectiveModel,
      liveSessionIds,
      messagesBySession,
      scheduleAssistantStream,
      selectedBranchesBySession,
      setDraft,
      workspace,
    ],
  );

  const editUserMessage = useCallback(
    (
      sessionId: string,
      messageId: number,
      newContent: string,
    ): { ok: boolean; error?: string } => {
      const trimmed = newContent.trim();
      if (!trimmed) {
        return { ok: false, error: 'Empty message' };
      }
      if (failOperation) {
        return {
          ok: false,
          error:
            'The edit could not be sent. Your draft is still here; please retry.',
        };
      }
      const list = messagesBySession[sessionId] ?? [];
      const original = list.find((m) => m.id === messageId);
      if (!original) return { ok: false, error: 'Message not found' };

      const parentId = original.parentMessageId ?? null;
      const model = getEffectiveModel(sessionId);
      const newUserMsgId = nextMsgIdRef.current++;
      const newAssistantMsgId = nextMsgIdRef.current++;
      const { chunks } = buildSimulatedAssistantChunks(
        trimmed,
        model,
        original.attachments ?? [],
      );

      const newUserMsg: ChatMessageItem = {
        id: newUserMsgId,
        parentMessageId: parentId,
        role: 'user',
        content: trimmed,
        createdAt: '2026-04-20T15:50:00Z',
        attachments: original.attachments,
        llm: model,
      };
      const newAssistantMsg: ChatMessageItem = {
        id: newAssistantMsgId,
        parentMessageId: newUserMsgId,
        role: 'assistant',
        content: chunks[0],
        createdAt: '2026-04-20T15:50:01Z',
        llm: model,
        isStreaming: true,
      };

      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] ?? []), newUserMsg, newAssistantMsg],
      }));
      setSelectedBranchesBySession((prev) => ({
        ...prev,
        [sessionId]: selectChildBranch(
          prev[sessionId] ?? {},
          parentId,
          newUserMsgId,
        ),
      }));

      scheduleAssistantStream(
        sessionId,
        newAssistantMsgId,
        trimmed,
        model,
        original.attachments ?? [],
      );

      return { ok: true };
    },
    [
      failOperation,
      getEffectiveModel,
      messagesBySession,
      scheduleAssistantStream,
    ],
  );

  const retryLastTurn = useCallback(
    (sessionId: string) => {
      const list = messagesBySession[sessionId] ?? [];
      const visible = buildVisiblePath(
        list,
        selectedBranchesBySession[sessionId] ?? {},
      ).messages;
      const lastUser = [...visible].reverse().find((m) => m.role === 'user');
      if (!lastUser) return;

      const model = getEffectiveModel(sessionId);
      const newAssistantMsgId = nextMsgIdRef.current++;
      const { chunks } = buildSimulatedAssistantChunks(
        lastUser.content,
        model,
        lastUser.attachments ?? [],
      );

      if (failOperation) {
        const errAssistantMsg: ChatMessageItem = {
          id: newAssistantMsgId,
          parentMessageId: lastUser.id,
          role: 'assistant',
          content: '',
          createdAt: '2026-04-20T15:52:00Z',
          llm: model,
          error:
            'Connection lost while generating. Please retry your message.',
        };
        setMessagesBySession((prev) => ({
          ...prev,
          [sessionId]: [...(prev[sessionId] ?? []), errAssistantMsg],
        }));
        setSelectedBranchesBySession((prev) => ({
          ...prev,
          [sessionId]: selectChildBranch(
            prev[sessionId] ?? {},
            lastUser.id,
            newAssistantMsgId,
          ),
        }));
        return;
      }

      const newAssistantMsg: ChatMessageItem = {
        id: newAssistantMsgId,
        parentMessageId: lastUser.id,
        role: 'assistant',
        content: chunks[0],
        createdAt: '2026-04-20T15:52:00Z',
        llm: model,
        isStreaming: true,
      };

      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] ?? []), newAssistantMsg],
      }));
      setSelectedBranchesBySession((prev) => ({
        ...prev,
        [sessionId]: selectChildBranch(
          prev[sessionId] ?? {},
          lastUser.id,
          newAssistantMsgId,
        ),
      }));

      scheduleAssistantStream(
        sessionId,
        newAssistantMsgId,
        lastUser.content,
        model,
        lastUser.attachments ?? [],
      );
    },
    [
      failOperation,
      getEffectiveModel,
      messagesBySession,
      scheduleAssistantStream,
      selectedBranchesBySession,
    ],
  );

  const deleteTurn = useCallback((sessionId: string, userMessageId: number) => {
    setMessagesBySession((prev) => {
      const list = prev[sessionId] ?? [];
      const targetUser = list.find((m) => m.id === userMessageId);
      if (!targetUser) return prev;
      const grandParentId = targetUser.parentMessageId ?? null;
      const assistantIds = new Set(
        list
          .filter((m) => m.parentMessageId === userMessageId)
          .map((m) => m.id),
      );
      const removedIds = new Set<number>([userMessageId, ...assistantIds]);
      const updated = list
        .filter((m) => !removedIds.has(m.id))
        .map((m) =>
          m.parentMessageId !== null && removedIds.has(m.parentMessageId)
            ? { ...m, parentMessageId: grandParentId }
            : m,
        );
      return {
        ...prev,
        [sessionId]: updated,
      };
    });
  }, []);

  const discardFailedSubmission = useCallback(
    (sessionId: string, messageId: number) => {
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] ?? []).filter((m) => m.id !== messageId),
      }));
    },
    [],
  );

  const retryFailedSubmission = useCallback(
    (sessionId: string, messageId: number) => {
      const list = messagesBySession[sessionId] ?? [];
      const target = list.find((m) => m.id === messageId);
      if (!target) return;
      if (failOperation) return;

      const model = getEffectiveModel(sessionId);
      const assistantMsgId = nextMsgIdRef.current++;
      const { chunks } = buildSimulatedAssistantChunks(
        target.content,
        model,
        target.attachments ?? [],
      );

      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: [
          ...(prev[sessionId] ?? []).map((m) =>
            m.id === messageId
              ? { ...m, failedSubmission: false, error: null }
              : m,
          ),
          {
            id: assistantMsgId,
            parentMessageId: messageId,
            role: 'assistant',
            content: chunks[0],
            createdAt: '2026-04-20T15:55:00Z',
            llm: model,
            isStreaming: true,
          },
        ],
      }));

      scheduleAssistantStream(
        sessionId,
        assistantMsgId,
        target.content,
        model,
        target.attachments ?? [],
      );
    },
    [
      failOperation,
      getEffectiveModel,
      messagesBySession,
      scheduleAssistantStream,
    ],
  );

  const renameSession = useCallback(
    (
      sessionId: string,
      title: string,
    ): { ok: boolean; error?: string } => {
      if (failOperation) {
        return { ok: false, error: 'Rename failed' };
      }
      const trimmed = title.trim();
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === sessionId
            ? {
                ...s,
                title: trimmed || 'New conversation',
                updated_at: '2026-04-20T16:05:00Z',
              }
            : s,
        ),
      );
      return { ok: true };
    },
    [failOperation],
  );

  const organizeSession = useCallback(
    (
      sessionId: string,
      patch: SessionOrganizationPatch,
    ): { ok: boolean; error?: string } => {
      if (failOperation) {
        return { ok: false, error: 'Failed to save' };
      }
      setSessions((prev) =>
        prev.map((s) => {
          if (s.session_id !== sessionId && s.parent_session_id !== sessionId) {
            return s;
          }
          const nextWorkspaceId =
            patch.workspace_id !== undefined
              ? patch.workspace_id ?? ''
              : s.workspace_id ?? '';
          const nextArchived =
            patch.archived !== undefined
              ? patch.archived
              : Boolean(s.preferences?.archived);
          const nextPinned =
            patch.pinned !== undefined
              ? patch.pinned
              : Boolean(s.preferences?.pinned);
          return {
            ...s,
            workspace_id: nextWorkspaceId,
            preferences: {
              ...s.preferences,
              pinned: s.session_id === sessionId ? nextPinned : s.preferences?.pinned,
              archived: nextArchived,
              archived_at: nextArchived
                ? s.preferences?.archived_at ?? '2026-04-20T16:10:00Z'
                : null,
              workspace_id: nextWorkspaceId,
            },
          };
        }),
      );
      return { ok: true };
    },
    [failOperation],
  );

  const deleteSession = useCallback(
    (sessionId: string): { ok: boolean; error?: string } => {
      if (failOperation) {
        return { ok: false, error: 'Failed to save' };
      }
      clearSessionTimers(sessionId);
      setLiveSessionIds((prev) => {
        const next = new Set(prev);
        next.delete(sessionId);
        return next;
      });
      setSessions((prev) =>
        prev.filter(
          (s) =>
            s.session_id !== sessionId && s.parent_session_id !== sessionId,
        ),
      );
      setMessagesBySession((prev) => {
        const copy = { ...prev };
        delete copy[sessionId];
        return copy;
      });
      return { ok: true };
    },
    [clearSessionTimers, failOperation],
  );

  const deleteAllArchived = useCallback(
    (
      workspaceId?: string,
    ): { ok: boolean; count: number; error?: string } => {
      if (failOperation) {
        return { ok: false, count: 0, error: 'Failed to save' };
      }
      let removedCount = 0;
      setSessions((prev) =>
        prev.filter((s) => {
          const isArchived = Boolean(s.preferences?.archived);
          const matchesWs =
            workspaceId === undefined || (s.workspace_id ?? '') === workspaceId;
          if (isArchived && matchesWs) {
            removedCount += 1;
            return false;
          }
          return true;
        }),
      );
      return { ok: true, count: removedCount };
    },
    [failOperation],
  );

  const masteryTopicsForWorkspace = useCallback(
    (workspaceId: string) => MASTERY_TOPICS_BY_WORKSPACE[workspaceId] ?? [],
    [],
  );

  const readingCollectionsForWorkspace = useCallback(
    (workspaceId: string) =>
      READING_COLLECTIONS_BY_WORKSPACE[workspaceId] ?? [],
    [],
  );

  const refreshPersonalSuggestions = useCallback(() => {
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    setPersonalSuggestionsLoading(true);
    suggestionTimerRef.current = setTimeout(() => {
      setSuggestionSetIdx((prev) => (prev + 1) % PERSONAL_SUGGESTION_SETS.length);
      setPersonalSuggestionsLoading(false);
    }, 150);
  }, []);

  const togglePlayAloud = useCallback((messageId: number) => {
    setPlayingMessageId((prev) => (prev === messageId ? null : messageId));
  }, []);

  const resetChatFixtures = useCallback(() => {
    streamTimersRef.current.forEach((timers) =>
      timers.forEach((t) => clearTimeout(t)),
    );
    streamTimersRef.current.clear();
    setSessions(createInitialSessions());
    setMessagesBySession(createInitialMessagesBySession());
    setDraftsByKey({});
    setAttachmentsByKey({});
    setSelectedBranchesBySession({ 'session-general-1': { null: 101 } });
    setLiveSessionIds(new Set());
    setDefaultModel(DEFAULT_LLM_SELECTION);
    setModelCatalogState('ready');
    setSessionViewState('ready');
    setSuggestionSetIdx(0);
    setPlayingMessageId(null);
  }, []);

  const llmOptions = useMemo(() => {
    if (modelCatalogState === 'empty') return [];
    return INITIAL_LLM_OPTIONS;
  }, [modelCatalogState]);

  const personalSuggestions = useMemo(
    () => PERSONAL_SUGGESTION_SETS[suggestionSetIdx] ?? PERSONAL_SUGGESTION_SETS[0],
    [suggestionSetIdx],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      sessions,
      messagesBySession,
      liveSessionIds,
      llmOptions,
      modelCatalogState,
      setModelCatalogState,
      sessionViewState,
      setSessionViewState,
      defaultModel,
      getEffectiveModel,
      selectModel,
      refreshModels,
      getDraft,
      setDraft,
      getAttachments,
      addAttachment,
      removeAttachment,
      clearAttachments,
      getSelectedBranches,
      switchBranch,
      sendMessage,
      stopStreaming,
      retryLastTurn,
      editUserMessage,
      deleteTurn,
      discardFailedSubmission,
      retryFailedSubmission,
      renameSession,
      organizeSession,
      deleteSession,
      deleteAllArchived,
      masteryTopicsForWorkspace,
      readingCollectionsForWorkspace,
      personalSuggestions,
      personalSuggestionsLoading,
      refreshPersonalSuggestions,
      playingMessageId,
      togglePlayAloud,
      resetChatFixtures,
    }),
    [
      sessions,
      messagesBySession,
      liveSessionIds,
      llmOptions,
      modelCatalogState,
      sessionViewState,
      defaultModel,
      getEffectiveModel,
      selectModel,
      refreshModels,
      getDraft,
      setDraft,
      getAttachments,
      addAttachment,
      removeAttachment,
      clearAttachments,
      getSelectedBranches,
      switchBranch,
      sendMessage,
      stopStreaming,
      retryLastTurn,
      editUserMessage,
      deleteTurn,
      discardFailedSubmission,
      retryFailedSubmission,
      renameSession,
      organizeSession,
      deleteSession,
      deleteAllArchived,
      masteryTopicsForWorkspace,
      readingCollectionsForWorkspace,
      personalSuggestions,
      personalSuggestionsLoading,
      refreshPersonalSuggestions,
      playingMessageId,
      togglePlayAloud,
      resetChatFixtures,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return ctx;
}
