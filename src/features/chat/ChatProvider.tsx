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
  rebalanceQuizCounts,
  selectChildBranch,
  tipMessageId,
  validateQuizConfig,
  validateResearchConfig,
  type AskUserAnswer,
  type ChatAttachmentSummary,
  type ChatMessageItem,
  type ContextReferenceItem,
  type DeepQuestionFormConfig,
  type DeepResearchFormConfig,
  type FilePreviewSource,
  type LLMOption,
  type LLMSelection,
  type MasteryTopicLabel,
  type QuizQuestionUserState,
  type ReadingCollectionLabel,
  type ResearchOutlineItem,
  type SessionOrganizationPatch,
  type SessionSummary,
  type ViewerTab,
} from './model';
import {
  buildSimulatedAssistantChunks,
  createInitialMessagesBySession,
  createInitialSessions,
  createSampleAskUserCard,
  createSampleQuizQuestions,
  createSampleResearchCard,
  DEFAULT_LLM_SELECTION,
  DEFAULT_QUIZ_CONFIG,
  DEFAULT_RESEARCH_CONFIG,
  INITIAL_LLM_OPTIONS,
  MASTERY_TOPICS_BY_WORKSPACE,
  PERSONAL_SUGGESTION_SETS,
  READING_COLLECTIONS_BY_WORKSPACE,
  SAMPLE_PREVIEW_FILES,
} from './repository';

export type CatalogLoadState = 'ready' | 'loading' | 'error' | 'empty';
export type SessionViewState = 'ready' | 'loading' | 'error';

const DEFAULT_ACTIVITY_TAB: ViewerTab = {
  id: 'tab-activity',
  kind: 'activity',
  title: 'Activity',
  closable: false,
};

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
  // M3.2 Composer References (`UI-COMPOSER-PICKERS`)
  referenceCatalogState: CatalogLoadState;
  setReferenceCatalogState: (state: CatalogLoadState) => void;
  getReferences: (sessionId: string | null) => ContextReferenceItem[];
  addReference: (
    sessionId: string | null,
    item: ContextReferenceItem,
  ) => { ok: boolean; error?: string };
  removeReference: (sessionId: string | null, referenceId: string) => void;
  clearReferences: (sessionId: string | null) => void;
  // M3.2 Capability Configuration (`UI-CAPABILITIES`)
  getActiveCapability: (sessionId: string | null) => string;
  setActiveCapability: (
    sessionId: string | null,
    capabilityId: string,
  ) => void;
  quizConfig: DeepQuestionFormConfig;
  updateQuizConfig: (patch: Partial<DeepQuestionFormConfig>) => void;
  researchConfig: DeepResearchFormConfig;
  updateResearchConfig: (patch: Partial<DeepResearchFormConfig>) => void;
  isCapabilityConfirmed: (sessionId: string | null) => boolean;
  confirmCapabilityConfig: (sessionId: string | null) => {
    ok: boolean;
    errors: string[];
  };
  // M3.2 Structured Responses (`UI-STRUCTURED-REPLY`, `UI-QUIZ`, `UI-RESEARCH`)
  submitAskUserAnswers: (
    sessionId: string,
    messageId: number,
    answers: Record<string, AskUserAnswer>,
  ) => { ok: boolean; error?: string };
  modifyAskUserAnswers: (sessionId: string, messageId: number) => void;
  getQuizUserState: (
    sessionId: string,
    messageId: number,
    questionId: string,
  ) => QuizQuestionUserState;
  updateQuizUserState: (
    sessionId: string,
    messageId: number,
    questionId: string,
    patch: Partial<QuizQuestionUserState>,
  ) => void;
  quizFollowupByQuestion: Record<
    string,
    { role: 'user' | 'assistant'; content: string }[]
  >;
  sendQuizFollowup: (
    questionId: string,
    prompt: string,
    questionPrompt: string,
  ) => void;
  updateResearchOutline: (
    sessionId: string,
    messageId: number,
    outline: ResearchOutlineItem[],
  ) => void;
  startResearchExecution: (sessionId: string, messageId: number) => void;
  // M3.2 Session Viewer (`MS-SESSION-VIEWER`)
  getViewerTabs: (sessionId: string | null) => ViewerTab[];
  getActiveViewerTabId: (sessionId: string | null) => string;
  getClosedViewerTabs: (sessionId: string | null) => ViewerTab[];
  openViewerTab: (sessionId: string | null, tab: ViewerTab) => void;
  closeViewerTab: (sessionId: string | null, tabId: string) => void;
  selectViewerTab: (sessionId: string | null, tabId: string) => void;
  reopenClosedViewerTab: (sessionId: string | null) => ViewerTab | null;
  getMarkdownScratchpad: (sessionId: string | null) => string;
  setMarkdownScratchpad: (sessionId: string | null, text: string) => void;
  // M3.2 File Preview (`MS-FILE-PREVIEW`)
  previewFiles: FilePreviewSource[];
  activePreviewFile: FilePreviewSource | null;
  openFilePreview: (
    fileIdOrSource: string | FilePreviewSource,
  ) => FilePreviewSource | null;
  closeFilePreview: () => void;
  // M3.1 Branching & Session Operations
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
  const [referencesByKey, setReferencesByKey] = useState<
    Record<string, ContextReferenceItem[]>
  >({});
  const [referenceCatalogState, setReferenceCatalogState] =
    useState<CatalogLoadState>('ready');
  const [capabilityByKey, setCapabilityByKey] = useState<
    Record<string, string>
  >({});
  const [capabilityConfirmedByKey, setCapabilityConfirmedByKey] = useState<
    Record<string, boolean>
  >({});
  const [quizConfig, setQuizConfig] = useState<DeepQuestionFormConfig>(
    DEFAULT_QUIZ_CONFIG,
  );
  const [researchConfig, setResearchConfig] = useState<DeepResearchFormConfig>(
    DEFAULT_RESEARCH_CONFIG,
  );
  const [quizStatesByKey, setQuizStatesByKey] = useState<
    Record<string, QuizQuestionUserState>
  >({});
  const [quizFollowupByQuestion, setQuizFollowupByQuestion] = useState<
    Record<string, { role: 'user' | 'assistant'; content: string }[]>
  >({
    'quiz-q1': [
      {
        role: 'assistant',
        content:
          'Ask me anything about why the trace equals the sum of eigenvalues or how to factor the characteristic polynomial.',
      },
    ],
  });
  const [viewerTabsByKey, setViewerTabsByKey] = useState<
    Record<string, ViewerTab[]>
  >({});
  const [activeViewerTabByKey, setActiveViewerTabByKey] = useState<
    Record<string, string>
  >({});
  const [closedViewerTabsByKey, setClosedViewerTabsByKey] = useState<
    Record<string, ViewerTab[]>
  >({});
  const [scratchpadByKey, setScratchpadByKey] = useState<
    Record<string, string>
  >({
    '::session-general-1':
      '# Scratchpad — Fourier Transform\n\n- Parseval energy identity check\n- Compare rectangular vs. Hann window spectral leakage\n',
  });
  const [activePreviewFile, setActivePreviewFile] =
    useState<FilePreviewSource | null>(() => SAMPLE_PREVIEW_FILES[0]);

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

  // M3.2 Composer References (`UI-COMPOSER-PICKERS`)
  const getReferences = useCallback(
    (sessionId: string | null) => referencesByKey[draftKey(sessionId)] ?? [],
    [draftKey, referencesByKey],
  );

  const addReference = useCallback(
    (
      sessionId: string | null,
      item: ContextReferenceItem,
    ): { ok: boolean; error?: string } => {
      if (item.status === 'unavailable') {
        return {
          ok: false,
          error: 'Selected reference is no longer available in this workspace.',
        };
      }
      const key = draftKey(sessionId);
      setReferencesByKey((prev) => {
        const current = prev[key] ?? [];
        if (current.some((r) => r.id === item.id)) return prev;
        return { ...prev, [key]: [...current, item] };
      });
      return { ok: true };
    },
    [draftKey],
  );

  const removeReference = useCallback(
    (sessionId: string | null, referenceId: string) => {
      const key = draftKey(sessionId);
      setReferencesByKey((prev) => ({
        ...prev,
        [key]: (prev[key] ?? []).filter((r) => r.id !== referenceId),
      }));
    },
    [draftKey],
  );

  const clearReferences = useCallback(
    (sessionId: string | null) => {
      const key = draftKey(sessionId);
      setReferencesByKey((prev) => ({ ...prev, [key]: [] }));
    },
    [draftKey],
  );

  // M3.2 Capability Configuration (`UI-CAPABILITIES`)
  const getActiveCapability = useCallback(
    (sessionId: string | null) =>
      capabilityByKey[draftKey(sessionId)] ?? 'chat',
    [capabilityByKey, draftKey],
  );

  const setActiveCapability = useCallback(
    (sessionId: string | null, capabilityId: string) => {
      const key = draftKey(sessionId);
      setCapabilityByKey((prev) => ({ ...prev, [key]: capabilityId }));
      const needsConfirm =
        capabilityId === 'question' || capabilityId === 'research';
      setCapabilityConfirmedByKey((prev) => ({
        ...prev,
        [key]: !needsConfirm,
      }));
    },
    [draftKey],
  );

  const updateQuizConfig = useCallback(
    (patch: Partial<DeepQuestionFormConfig>) => {
      setQuizConfig((prev) => {
        const nextTotal =
          patch.totalCount !== undefined ? patch.totalCount : prev.totalCount;
        const nextTypes =
          patch.selectedTypes !== undefined
            ? patch.selectedTypes
            : prev.selectedTypes;
        const nextCounts =
          patch.typeCounts !== undefined
            ? patch.typeCounts
            : rebalanceQuizCounts(nextTotal, nextTypes);
        return {
          ...prev,
          ...patch,
          totalCount: nextTotal,
          selectedTypes: nextTypes,
          typeCounts: nextCounts,
        };
      });
    },
    [],
  );

  const updateResearchConfig = useCallback(
    (patch: Partial<DeepResearchFormConfig>) => {
      setResearchConfig((prev) => {
        const next = { ...prev, ...patch };
        if (patch.depth === 'quick') {
          next.subtopics = 2;
          next.iterations = 1;
        } else if (patch.depth === 'standard') {
          next.subtopics = 3;
          next.iterations = 2;
        } else if (patch.depth === 'deep') {
          next.subtopics = 5;
          next.iterations = 4;
        }
        return next;
      });
    },
    [],
  );

  const isCapabilityConfirmed = useCallback(
    (sessionId: string | null) => {
      const cap = getActiveCapability(sessionId);
      if (cap !== 'question' && cap !== 'research') return true;
      return Boolean(capabilityConfirmedByKey[draftKey(sessionId)]);
    },
    [capabilityConfirmedByKey, draftKey, getActiveCapability],
  );

  const confirmCapabilityConfig = useCallback(
    (sessionId: string | null): { ok: boolean; errors: string[] } => {
      const cap = getActiveCapability(sessionId);
      const errors =
        cap === 'question'
          ? validateQuizConfig(quizConfig)
          : cap === 'research'
            ? validateResearchConfig(researchConfig)
            : [];
      if (errors.length > 0) {
        return { ok: false, errors };
      }
      setCapabilityConfirmedByKey((prev) => ({
        ...prev,
        [draftKey(sessionId)]: true,
      }));
      return { ok: true, errors: [] };
    },
    [draftKey, getActiveCapability, quizConfig, researchConfig],
  );

  // M3.2 Structured Responses (`UI-STRUCTURED-REPLY`, `UI-QUIZ`, `UI-RESEARCH`)
  const submitAskUserAnswers = useCallback(
    (
      sessionId: string,
      messageId: number,
      answers: Record<string, AskUserAnswer>,
    ): { ok: boolean; error?: string } => {
      if (failOperation) {
        setMessagesBySession((prev) => ({
          ...prev,
          [sessionId]: (prev[sessionId] ?? []).map((m) =>
            m.id === messageId && m.askUser
              ? {
                  ...m,
                  askUser: {
                    ...m.askUser,
                    status: 'error',
                    errorMessage:
                      'Unable to submit answers while simulated failure is active.',
                  },
                }
              : m,
          ),
        }));
        return {
          ok: false,
          error: 'Unable to submit answers while simulated failure is active.',
        };
      }
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] ?? []).map((m) =>
          m.id === messageId && m.askUser
            ? {
                ...m,
                askUser: {
                  ...m.askUser,
                  status: 'submitted',
                  answers,
                  errorMessage: undefined,
                },
              }
            : m,
        ),
      }));
      return { ok: true };
    },
    [failOperation],
  );

  const modifyAskUserAnswers = useCallback(
    (sessionId: string, messageId: number) => {
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] ?? []).map((m) =>
          m.id === messageId && m.askUser
            ? {
                ...m,
                askUser: {
                  ...m.askUser,
                  status: 'pending',
                  errorMessage: undefined,
                },
              }
            : m,
        ),
      }));
    },
    [],
  );

  const getQuizUserState = useCallback(
    (
      sessionId: string,
      messageId: number,
      questionId: string,
    ): QuizQuestionUserState => {
      const key = `${sessionId}::${messageId}::${questionId}`;
      return (
        quizStatesByKey[key] ?? {
          userAnswer: '',
          submitted: false,
        }
      );
    },
    [quizStatesByKey],
  );

  const updateQuizUserState = useCallback(
    (
      sessionId: string,
      messageId: number,
      questionId: string,
      patch: Partial<QuizQuestionUserState>,
    ) => {
      const key = `${sessionId}::${messageId}::${questionId}`;
      setQuizStatesByKey((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] ?? { userAnswer: '', submitted: false }),
          ...patch,
        },
      }));
    },
    [],
  );

  const sendQuizFollowup = useCallback(
    (questionId: string, prompt: string, questionPrompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) return;
      setQuizFollowupByQuestion((prev) => {
        const current = prev[questionId] ?? [];
        const reply = `**Follow-up on "${questionPrompt.slice(0, 48)}...":** Start by checking how your step applies to ${trimmed}. Notice that the invariant holds regardless of basis rotation.`;
        return {
          ...prev,
          [questionId]: [
            ...current,
            { role: 'user', content: trimmed },
            { role: 'assistant', content: reply },
          ],
        };
      });
    },
    [],
  );

  const updateResearchOutline = useCallback(
    (sessionId: string, messageId: number, outline: ResearchOutlineItem[]) => {
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] ?? []).map((m) =>
          m.id === messageId && m.research
            ? {
                ...m,
                research: {
                  ...m.research,
                  outline,
                },
              }
            : m,
        ),
      }));
    },
    [],
  );

  const startResearchExecution = useCallback(
    (sessionId: string, messageId: number) => {
      if (failOperation) {
        setMessagesBySession((prev) => ({
          ...prev,
          [sessionId]: (prev[sessionId] ?? []).map((m) =>
            m.id === messageId && m.research
              ? {
                  ...m,
                  research: {
                    ...m.research,
                    status: 'error',
                    errorMessage:
                      'Research synthesis interrupted. Check your connection and retry.',
                  },
                }
              : m,
          ),
        }));
        return;
      }
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] ?? []).map((m) =>
          m.id === messageId && m.research
            ? {
                ...m,
                research: {
                  ...m.research,
                  status: 'completed',
                  errorMessage: undefined,
                },
              }
            : m,
        ),
      }));
    },
    [failOperation],
  );

  // M3.2 Session Viewer (`MS-SESSION-VIEWER`)
  const getViewerTabs = useCallback(
    (sessionId: string | null): ViewerTab[] => {
      const key = draftKey(sessionId);
      const list = viewerTabsByKey[key];
      if (!list || list.length === 0) return [DEFAULT_ACTIVITY_TAB];
      return list;
    },
    [draftKey, viewerTabsByKey],
  );

  const getActiveViewerTabId = useCallback(
    (sessionId: string | null): string => {
      const key = draftKey(sessionId);
      return activeViewerTabByKey[key] ?? DEFAULT_ACTIVITY_TAB.id;
    },
    [activeViewerTabByKey, draftKey],
  );

  const getClosedViewerTabs = useCallback(
    (sessionId: string | null): ViewerTab[] =>
      closedViewerTabsByKey[draftKey(sessionId)] ?? [],
    [closedViewerTabsByKey, draftKey],
  );

  const openViewerTab = useCallback(
    (sessionId: string | null, tab: ViewerTab) => {
      const key = draftKey(sessionId);
      setViewerTabsByKey((prev) => {
        const current = prev[key] ?? [DEFAULT_ACTIVITY_TAB];
        if (current.some((t) => t.id === tab.id)) return prev;
        return { ...prev, [key]: [...current, tab] };
      });
      setActiveViewerTabByKey((prev) => ({ ...prev, [key]: tab.id }));
    },
    [draftKey],
  );

  const closeViewerTab = useCallback(
    (sessionId: string | null, tabId: string) => {
      if (tabId === DEFAULT_ACTIVITY_TAB.id) return;
      const key = draftKey(sessionId);
      setViewerTabsByKey((prev) => {
        const current = prev[key] ?? [DEFAULT_ACTIVITY_TAB];
        const target = current.find((t) => t.id === tabId);
        if (target) {
          setClosedViewerTabsByKey((closedPrev) => ({
            ...closedPrev,
            [key]: [
              target,
              ...(closedPrev[key] ?? []).filter((t) => t.id !== tabId),
            ],
          }));
        }
        const remaining = current.filter((t) => t.id !== tabId);
        return {
          ...prev,
          [key]: remaining.length > 0 ? remaining : [DEFAULT_ACTIVITY_TAB],
        };
      });
      setActiveViewerTabByKey((prev) =>
        prev[key] === tabId
          ? { ...prev, [key]: DEFAULT_ACTIVITY_TAB.id }
          : prev,
      );
    },
    [draftKey],
  );

  const selectViewerTab = useCallback(
    (sessionId: string | null, tabId: string) => {
      const key = draftKey(sessionId);
      setActiveViewerTabByKey((prev) => ({ ...prev, [key]: tabId }));
    },
    [draftKey],
  );

  const reopenClosedViewerTab = useCallback(
    (sessionId: string | null): ViewerTab | null => {
      const key = draftKey(sessionId);
      const closedList = closedViewerTabsByKey[key] ?? [];
      if (closedList.length === 0) return null;
      const [restored, ...rest] = closedList;
      setClosedViewerTabsByKey((prev) => ({ ...prev, [key]: rest }));
      openViewerTab(sessionId, restored);
      return restored;
    },
    [closedViewerTabsByKey, draftKey, openViewerTab],
  );

  const getMarkdownScratchpad = useCallback(
    (sessionId: string | null): string =>
      scratchpadByKey[draftKey(sessionId)] ??
      '# Session Scratchpad\n\nJot down formulas, definitions, or questions during this study session.\n',
    [draftKey, scratchpadByKey],
  );

  const setMarkdownScratchpad = useCallback(
    (sessionId: string | null, text: string) => {
      const key = draftKey(sessionId);
      setScratchpadByKey((prev) => ({ ...prev, [key]: text }));
    },
    [draftKey],
  );

  // M3.2 File Preview (`MS-FILE-PREVIEW`)
  const openFilePreview = useCallback(
    (
      fileIdOrSource: string | FilePreviewSource,
    ): FilePreviewSource | null => {
      if (typeof fileIdOrSource === 'string') {
        const found =
          SAMPLE_PREVIEW_FILES.find((f) => f.id === fileIdOrSource) ??
          SAMPLE_PREVIEW_FILES.find((f) => f.filename === fileIdOrSource) ??
          null;
        if (found) setActivePreviewFile(found);
        return found;
      }
      setActivePreviewFile(fileIdOrSource);
      return fileIdOrSource;
    },
    [],
  );

  const closeFilePreview = useCallback(() => {
    setActivePreviewFile(null);
  }, []);

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
      const currentReferences = getReferences(sessionId);
      const activeCapability = getActiveCapability(sessionId);
      const trimmed = currentDraft.trim();
      if (
        !trimmed &&
        currentAttachments.length === 0 &&
        currentReferences.length === 0
      ) {
        return { ok: false, sessionId, error: 'Empty message' };
      }

      if (!isCapabilityConfirmed(sessionId)) {
        return {
          ok: false,
          sessionId,
          error: 'Confirm capability settings before sending.',
        };
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

        // Migrate any draft viewer tabs & scratchpad from __new__ to targetSessionId
        const oldKey = draftKey(null);
        const newKey = draftKey(targetSessionId);
        setViewerTabsByKey((prev) =>
          prev[oldKey] ? { ...prev, [newKey]: prev[oldKey] } : prev,
        );
        setActiveViewerTabByKey((prev) =>
          prev[oldKey] ? { ...prev, [newKey]: prev[oldKey] } : prev,
        );
        setScratchpadByKey((prev) =>
          prev[oldKey] ? { ...prev, [newKey]: prev[oldKey] } : prev,
        );
      }

      const existingMessages = messagesBySession[targetSessionId] ?? [];
      const currentBranches = selectedBranchesBySession[targetSessionId] ?? {};
      const visible = buildVisiblePath(
        existingMessages,
        currentBranches,
      ).messages;
      const parentId = tipMessageId(visible);

      const userMsgId = nextMsgIdRef.current++;

      if (failOperation) {
        const failedUserMsg: ChatMessageItem = {
          id: userMsgId,
          parentMessageId: parentId,
          role: 'user',
          content: trimmed,
          createdAt: '2026-04-20T15:45:00Z',
          capability: activeCapability,
          attachments: currentAttachments.length
            ? currentAttachments
            : undefined,
          references: currentReferences.length ? currentReferences : undefined,
          llm: model,
          failedSubmission: true,
          error:
            "Couldn't reach the server. Please check your connection and retry.",
        };
        setMessagesBySession((prev) => ({
          ...prev,
          [targetSessionId!]: [
            ...(prev[targetSessionId!] ?? []),
            failedUserMsg,
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
        setDraft(sessionId, '');
        clearAttachments(sessionId);
        clearReferences(sessionId);
        return {
          ok: false,
          sessionId: targetSessionId,
          error:
            "Couldn't reach the server. Please check your connection and retry.",
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
        capability: activeCapability,
        attachments: currentAttachments.length ? currentAttachments : undefined,
        references: currentReferences.length ? currentReferences : undefined,
        llm: model,
      };

      const assistantMsg: ChatMessageItem = {
        id: assistantMsgId,
        parentMessageId: userMsgId,
        role: 'assistant',
        content: chunks[0],
        createdAt: '2026-04-20T15:45:01Z',
        capability: activeCapability,
        llm: model,
        isStreaming: true,
        askUser:
          activeCapability === 'solve' ? createSampleAskUserCard() : undefined,
        quiz:
          activeCapability === 'question'
            ? createSampleQuizQuestions()
            : undefined,
        research:
          activeCapability === 'research'
            ? createSampleResearchCard(trimmed || 'Research Topic')
            : undefined,
        toolsUsed:
          activeCapability !== 'chat' ? [activeCapability] : ['kb_search'],
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
      clearReferences(sessionId);

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
      clearReferences,
      draftKey,
      failOperation,
      getActiveCapability,
      getAttachments,
      getDraft,
      getEffectiveModel,
      getReferences,
      isCapabilityConfirmed,
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
        references: original.references,
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
              pinned:
                s.session_id === sessionId
                  ? nextPinned
                  : s.preferences?.pinned,
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
      setSuggestionSetIdx(
        (prev) => (prev + 1) % PERSONAL_SUGGESTION_SETS.length,
      );
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
    setReferencesByKey({});
    setReferenceCatalogState('ready');
    setCapabilityByKey({});
    setCapabilityConfirmedByKey({});
    setQuizConfig(DEFAULT_QUIZ_CONFIG);
    setResearchConfig(DEFAULT_RESEARCH_CONFIG);
    setQuizStatesByKey({});
    setViewerTabsByKey({});
    setActiveViewerTabByKey({});
    setClosedViewerTabsByKey({});
    setActivePreviewFile(SAMPLE_PREVIEW_FILES[0]);
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
    () =>
      PERSONAL_SUGGESTION_SETS[suggestionSetIdx] ?? PERSONAL_SUGGESTION_SETS[0],
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
      referenceCatalogState,
      setReferenceCatalogState,
      getReferences,
      addReference,
      removeReference,
      clearReferences,
      getActiveCapability,
      setActiveCapability,
      quizConfig,
      updateQuizConfig,
      researchConfig,
      updateResearchConfig,
      isCapabilityConfirmed,
      confirmCapabilityConfig,
      submitAskUserAnswers,
      modifyAskUserAnswers,
      getQuizUserState,
      updateQuizUserState,
      quizFollowupByQuestion,
      sendQuizFollowup,
      updateResearchOutline,
      startResearchExecution,
      getViewerTabs,
      getActiveViewerTabId,
      getClosedViewerTabs,
      openViewerTab,
      closeViewerTab,
      selectViewerTab,
      reopenClosedViewerTab,
      getMarkdownScratchpad,
      setMarkdownScratchpad,
      previewFiles: SAMPLE_PREVIEW_FILES,
      activePreviewFile,
      openFilePreview,
      closeFilePreview,
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
      referenceCatalogState,
      getReferences,
      addReference,
      removeReference,
      clearReferences,
      getActiveCapability,
      setActiveCapability,
      quizConfig,
      updateQuizConfig,
      researchConfig,
      updateResearchConfig,
      isCapabilityConfirmed,
      confirmCapabilityConfig,
      submitAskUserAnswers,
      modifyAskUserAnswers,
      getQuizUserState,
      updateQuizUserState,
      quizFollowupByQuestion,
      sendQuizFollowup,
      updateResearchOutline,
      startResearchExecution,
      getViewerTabs,
      getActiveViewerTabId,
      getClosedViewerTabs,
      openViewerTab,
      closeViewerTab,
      selectViewerTab,
      reopenClosedViewerTab,
      getMarkdownScratchpad,
      setMarkdownScratchpad,
      activePreviewFile,
      openFilePreview,
      closeFilePreview,
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
