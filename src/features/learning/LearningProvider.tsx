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
import { allowedDestination } from '@/features/entry/model';
import {
  buildFallbackObjectiveReport,
  buildGeneratedModulesForGoal,
  buildReviewEntryForMasteredPoint,
  createInitialLearningRecent,
  createInitialMasteryTopics,
  createInitialObjectiveReports,
  createInitialReviewStrategies,
  createInitialSourceCandidates,
  createInitialTodoBooks,
  createInitialTopicSessions,
  getCheckpointQuestionForWaypoint,
} from './repository';
import {
  applyRouteDraftToTopic,
  currentWaypoint,
  DEFAULT_PAGE_CUSTOMIZATION,
  LEARNING_SURFACES,
  masteryOpeningMessage,
  normalizeMasteryMode,
  recomputeTopicCountsAndNext,
  type GoalEmblem,
  type LearningKind,
  type LearningOverview,
  type LearningRecentItem,
  type LearningTodoBook,
  type LearningTodoReview,
  type MasteryCheckpointQuestion,
  type MasteryMode,
  type MasteryTopic,
  type ObjectiveReport,
  type PageCustomization,
  type ReviewStrategy,
  type ReviewStrategyInput,
  type SourceCategory,
  type TopicDraft,
  type TopicSession,
  type TopicSourceCandidate,
} from './model';

export type LearningHubLoadState =
  | 'ready'
  | 'loading'
  | 'empty'
  | 'error'
  | 'unavailable';

export type AtlasLoadState = 'ready' | 'loading' | 'empty' | 'error';
export type SubPanelLoadState = 'ready' | 'loading' | 'error';

export interface MasteryTurnMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: MasteryMode;
  createdAt: string;
  checkpoint?: MasteryCheckpointQuestion;
  outlineUpdated?: boolean;
}

export interface WizardDraftState {
  step: 'goal' | 'sources';
  goal: string;
  icon: GoalEmblem;
  selectedSourceKeys: string[];
  selectedChildIdsBySourceKey: Record<string, string[]>;
  activeCategory: SourceCategory;
  searchQuery: string;
}

const INITIAL_WIZARD_DRAFT: WizardDraftState = {
  step: 'goal',
  goal: '',
  icon: '🧭',
  selectedSourceKeys: [],
  selectedChildIdsBySourceKey: {},
  activeCategory: 'kb',
  searchQuery: '',
};

function createInitialSessionMessages(): Record<string, MasteryTurnMessage[]> {
  return {
    'session-general-mastery-1': [
      {
        id: 'm-msg-1',
        role: 'user',
        content:
          'Let’s study "Characteristic polynomial & eigenspace geometry". Walk me through why repeated eigenvalues can produce a defective matrix.',
        mode: 'study',
        createdAt: '2026-04-20T17:20:00Z',
      },
      {
        id: 'm-msg-2',
        role: 'assistant',
        content: [
          '### Characteristic Polynomial & Eigenspace Multiplicity',
          '',
          'When we solve $\\det(A - \\lambda I) = 0$, each root $\\lambda_i$ has two distinct counts:',
          '',
          '1. **Algebraic multiplicity ($\\text{AM}$):** how many times $(\\lambda - \\lambda_i)$ appears as a factor in the characteristic polynomial.',
          '2. **Geometric multiplicity ($\\text{GM}$):** the dimension of the eigenspace $N(A - \\lambda_i I)$, i.e. the number of linearly independent eigenvectors for $\\lambda_i$.',
          '',
          'Because $1 \\le \\text{GM}(\\lambda_i) \\le \\text{AM}(\\lambda_i)$, a matrix is diagonalizable ($A = S \\Lambda S^{-1}$) if and only if $\\text{GM} = \\text{AM}$ for every eigenvalue. Complete the mastery gate check below to advance this waypoint:',
        ].join('\n'),
        mode: 'study',
        createdAt: '2026-04-20T17:21:00Z',
        checkpoint: getCheckpointQuestionForWaypoint(
          'kp-la-3',
          'Characteristic polynomial & eigenspace geometry',
        ),
      },
    ],
    'session-general-mastery-outline': [
      {
        id: 'm-msg-outline-1',
        role: 'user',
        content:
          "Let's design the learning outline together from Gilbert Strang — Linear Algebra KB.",
        mode: 'outline',
        createdAt: '2026-04-18T10:00:00Z',
      },
      {
        id: 'm-msg-outline-2',
        role: 'assistant',
        content: [
          '### Proposed Mastery Route: Linear Algebra Foundations',
          '',
          'I organized your route into **3 modules** and **6 knowledge points** anchored to Strang Chapters 3–7:',
          '',
          '- **Module 1 — Vector Spaces & Orthogonal Projections:** Column space & rank-nullity theorem; Orthogonal projections & least squares.',
          '- **Module 2 — Eigenvalues & Spectral Decomposition:** Characteristic polynomial & eigenspace geometry; Symmetric matrices & Real Spectral Theorem.',
          '- **Module 3 — Singular Value Decomposition & Low-Rank Approximation:** SVD geometry ($A = U\\Sigma V^T$); Eckart–Young low-rank approximation.',
        ].join('\n'),
        mode: 'outline',
        createdAt: '2026-04-18T10:01:00Z',
        outlineUpdated: true,
      },
    ],
    'session-signals-study-1': [
      {
        id: 'm-msg-sig-1',
        role: 'user',
        content: 'Let’s review "Orthogonal complex exponential basis".',
        mode: 'review',
        createdAt: '2026-04-19T15:00:00Z',
      },
      {
        id: 'm-msg-sig-2',
        role: 'assistant',
        content:
          'Ready for your spaced review on **Orthogonal complex exponential basis**. Answer the checkpoint question below to refresh your stability curve:',
        mode: 'review',
        createdAt: '2026-04-19T15:01:00Z',
        checkpoint: getCheckpointQuestionForWaypoint(
          'kp-sig-1',
          'Orthogonal complex exponential basis',
        ),
      },
    ],
  };
}

export interface LearningContextValue {
  // Page Customization (`UI-PAGE-CUSTOMIZE`)
  customization: PageCustomization;
  saveCustomization: (
    next: PageCustomization,
  ) => { ok: boolean; error?: string };
  resetCustomization: () => void;
  // Learning Hub (`MS-LEARNING`, `MS-LEARNING-CREATE`)
  hubState: LearningHubLoadState;
  setHubState: (state: LearningHubLoadState) => void;
  getLearningOverview: (workspaceId?: string) => LearningOverview;
  sourceCandidates: TopicSourceCandidate[];
  // Mastery Atlas (`MS-MASTERY-LIBRARY`)
  atlasState: AtlasLoadState;
  setAtlasState: (state: AtlasLoadState) => void;
  topics: MasteryTopic[];
  getWorkspaceTopics: (workspaceId?: string) => MasteryTopic[];
  getTopic: (pathId: string) => MasteryTopic | null;
  // Create Topic Wizard (`UI-MASTERY-CREATE`)
  wizardDraft: WizardDraftState;
  updateWizardDraft: (patch: Partial<WizardDraftState>) => void;
  toggleWizardSource: (candidate: TopicSourceCandidate) => void;
  toggleWizardChildSource: (
    candidate: TopicSourceCandidate,
    childId: string,
  ) => void;
  resetWizardDraft: () => void;
  createTopicFromWizard: () => {
    ok: boolean;
    topic?: MasteryTopic;
    sessionId?: string;
    error?: string;
  };
  // Mastery Detail (`MS-MASTERY-DETAIL` & `UI-MASTERY-ROUTE-EDIT`)
  getSelectedObjectiveId: (pathId: string) => string | null;
  setSelectedObjectiveId: (pathId: string, objectiveId: string | null) => void;
  getTopicView: (pathId: string) => 'outline' | 'board';
  setTopicView: (pathId: string, view: 'outline' | 'board') => void;
  getBoardError: (pathId: string) => boolean;
  setBoardError: (pathId: string, hasError: boolean) => void;
  getSessionsState: (pathId: string) => SubPanelLoadState;
  setSessionsState: (pathId: string, state: SubPanelLoadState) => void;
  strategiesState: SubPanelLoadState;
  setStrategiesState: (state: SubPanelLoadState) => void;
  renameTopic: (
    pathId: string,
    newName: string,
  ) => { ok: boolean; error?: string };
  saveTopicRoute: (
    pathId: string,
    draft: TopicDraft,
  ) => { ok: boolean; topic?: MasteryTopic; error?: string };
  generateOutlineWithTutor: (
    pathId: string,
    focusNote?: string,
  ) => { ok: boolean; topic?: MasteryTopic; error?: string };
  getObjectiveReport: (pathId: string, objectiveId: string) => ObjectiveReport;
  overrideObjectiveMastery: (
    pathId: string,
    objectiveId: string,
    mastered: boolean,
    note: string,
  ) => { ok: boolean; error?: string };
  setDesiredRetention: (
    pathId: string,
    retention: number,
  ) => { ok: boolean; error?: string };
  strategies: ReviewStrategy[];
  selectReviewStrategy: (
    pathId: string,
    templateId: string,
  ) => { ok: boolean; error?: string };
  saveReviewStrategy: (
    pathId: string,
    input: ReviewStrategyInput,
    templateId?: string,
  ) => { ok: boolean; strategy?: ReviewStrategy; error?: string };
  duplicateReviewStrategy: (
    pathId: string,
    templateId: string,
    copyName: string,
  ) => { ok: boolean; strategy?: ReviewStrategy; error?: string };
  deleteReviewStrategy: (
    pathId: string,
    templateId: string,
  ) => { ok: boolean; error?: string };
  resetTopicProgress: (pathId: string) => { ok: boolean; error?: string };
  deleteTopic: (pathId: string) => { ok: boolean; error?: string };
  // Mastery Study (`MS-MASTERY-STUDY`)
  studyDrafts: Record<string, string>;
  setStudyDraft: (key: string, text: string) => void;
  stopMasteryMessage: (sessionId: string) => void;
  getSessionsForTopic: (pathId: string) => TopicSession[];
  getActiveSessionForTopic: (
    pathId: string,
    requestedSessionId?: string | null,
  ) => TopicSession | null;
  getSessionMode: (
    pathId: string,
    sessionId: string | null,
    queryMode?: string | null,
  ) => MasteryMode;
  setSessionMode: (
    pathId: string,
    sessionId: string | null,
    mode: MasteryMode,
  ) => void;
  getSessionMessages: (sessionId: string | null) => MasteryTurnMessage[];
  isSessionStreaming: (sessionId: string | null) => boolean;
  startOrResumeStudySession: (
    pathId: string,
    options?: {
      sessionId?: string | null;
      mode?: MasteryMode;
      focus?: string | null;
      autoSendPrompt?: boolean;
    },
  ) => { sessionId: string; mode: MasteryMode };
  sendMasteryMessage: (
    pathId: string,
    sessionId: string | null,
    content: string,
    modeOverride?: MasteryMode,
    focusPointId?: string,
  ) => { ok: boolean; sessionId: string; error?: string };
  submitCheckpointAnswer: (
    pathId: string,
    knowledgePointId: string,
    optionId: string,
  ) => {
    ok: boolean;
    isCorrect: boolean;
    masteredNow: boolean;
    error?: string;
  };
  skipCheckpointQuestion: (pathId: string, knowledgePointId: string) => void;
  completedCheckpointsByPoint: Record<
    string,
    { selectedOptionId: string; isCorrect: boolean; skipped?: boolean }
  >;
  justMasteredPointId: string | null;
  celebrationNonce: number;
  dismissCelebration: () => void;
  resetLearningFixtures: () => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: { children: ReactNode }) {
  const { workspace, mode: entryMode, failOperation } = useFixtures();
  const [customization, setCustomization] = useState<PageCustomization>(
    DEFAULT_PAGE_CUSTOMIZATION,
  );
  const [hubState, setHubState] = useState<LearningHubLoadState>('ready');
  const [atlasState, setAtlasState] = useState<AtlasLoadState>('ready');
  const [topics, setTopics] = useState<MasteryTopic[]>(() =>
    createInitialMasteryTopics(),
  );
  const [objectiveReports, setObjectiveReports] = useState<
    Record<string, ObjectiveReport>
  >(() => createInitialObjectiveReports());
  const [sessionsByPath, setSessionsByPath] = useState<
    Record<string, TopicSession[]>
  >(() => createInitialTopicSessions());
  const [messagesBySession, setMessagesBySession] = useState<
    Record<string, MasteryTurnMessage[]>
  >(() => createInitialSessionMessages());
  const [streamingSessionIds, setStreamingSessionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [strategies, setStrategies] = useState<ReviewStrategy[]>(() =>
    createInitialReviewStrategies(),
  );
  const [sourceCandidates] = useState<TopicSourceCandidate[]>(() =>
    createInitialSourceCandidates(),
  );
  const [todoBooks] = useState<LearningTodoBook[]>(() =>
    createInitialTodoBooks(),
  );
  const [recentItems, setRecentItems] = useState<LearningRecentItem[]>(() =>
    createInitialLearningRecent(),
  );
  const [wizardDraft, setWizardDraft] =
    useState<WizardDraftState>(INITIAL_WIZARD_DRAFT);

  const [selectedObjectiveByPath, setSelectedObjectiveByPath] = useState<
    Record<string, string | null>
  >({});
  const [topicViewByPath, setTopicViewByPath] = useState<
    Record<string, 'outline' | 'board'>
  >({});
  const [boardErrorByPath, setBoardErrorByPath] = useState<
    Record<string, boolean>
  >({});
  const [sessionsStateByPath, setSessionsStateByPath] = useState<
    Record<string, SubPanelLoadState>
  >({});
  const [strategiesState, setStrategiesState] =
    useState<SubPanelLoadState>('ready');
  const [modeBySessionKey, setModeBySessionKey] = useState<
    Record<string, MasteryMode>
  >({
    'path-general::session-general-mastery-1': 'study',
    'path-general::session-general-mastery-outline': 'outline',
    'path-signals-fourier::session-signals-study-1': 'review',
  });
  const [completedCheckpointsByPoint, setCompletedCheckpointsByPoint] =
    useState<
      Record<
        string,
        { selectedOptionId: string; isCorrect: boolean; skipped?: boolean }
      >
    >({});
  const [justMasteredPointId, setJustMasteredPointId] = useState<string | null>(
    null,
  );
  const [celebrationNonce, setCelebrationNonce] = useState(0);

  const [studyDrafts, setStudyDrafts] = useState<Record<string, string>>({});
  const setStudyDraft = useCallback((key: string, text: string) => {
    setStudyDrafts(prev => ({ ...prev, [key]: text }));
  }, []);
  const activeStreams = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const stopMasteryMessage = useCallback((sessionId: string) => {
    const timer = activeStreams.current.get(sessionId);
    if (timer) { clearTimeout(timer); streamTimersRef.current.delete(timer); }
    activeStreams.current.delete(sessionId);
    setStreamingSessionIds(prev => { const next = new Set(prev); next.delete(sessionId); return next; });
    setSessionsByPath(prev => Object.fromEntries(Object.entries(prev).map(([id, rows]) =>
      [id, rows.map(row => row.session_id === sessionId ? { ...row, status: 'idle' as const } : row)])));
  }, []);

  const nextPathSeqRef = useRef(1);
  const nextSessionSeqRef = useRef(1);
  const nextMsgSeqRef = useRef(100);
  const streamTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const timers = streamTimersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const saveCustomization = useCallback(
    (next: PageCustomization): { ok: boolean; error?: string } => {
      if (failOperation) {
        return {
          ok: false,
          error: 'Could not save page customization while failure mode is on.',
        };
      }
      setCustomization(next);
      return { ok: true };
    },
    [failOperation],
  );

  const resetCustomization = useCallback(() => {
    setCustomization(DEFAULT_PAGE_CUSTOMIZATION);
  }, []);

  const getWorkspaceTopics = useCallback(
    (workspaceId?: string) => {
      const ws = workspaceId !== undefined ? workspaceId : workspace;
      if (atlasState === 'empty') return [];
      return topics.filter((t) => t.content_workspace_id === ws);
    },
    [atlasState, topics, workspace],
  );

  const getTopic = useCallback(
    (pathId: string) => topics.find((t) => t.path_id === pathId) ?? null,
    [topics],
  );

  const getLearningOverview = useCallback(
    (workspaceId?: string): LearningOverview => {
      const ws = workspaceId !== undefined ? workspaceId : workspace;
      const wsTopics =
        hubState === 'empty'
          ? []
          : topics.filter((t) => t.content_workspace_id === ws);
      const dueReviews: LearningTodoReview[] =
        hubState === 'empty'
          ? []
          : wsTopics.flatMap((topic) =>
              topic.reviews
                .filter((r) => r.due)
                .map((r) => ({
                  id: `${topic.path_id}:${r.id}`,
                  path_id: topic.path_id,
                  topic_name: topic.name,
                  knowledge_point_id: r.knowledge_point_id,
                  knowledge_point_name: r.knowledge_point_name,
                  due_at: r.due_at,
                  forgetting_risk: r.forgetting_risk,
                })),
            );
      const activeBooks: LearningTodoBook[] =
        hubState === 'empty' || ws !== '' ? [] : todoBooks;

      const surfaces = LEARNING_SURFACES.map((surface) => {
        const permitted = allowedDestination(entryMode, surface.href);
        const available = permitted && hubState !== 'unavailable';
        let count = 0;
        if (hubState !== 'empty' && available) {
          if (surface.kind === 'mastery') {
            count = wsTopics.length;
          } else if (surface.kind === 'books') {
            count = ws === '' ? 1 : 0;
          } else if (surface.kind === 'practice') {
            count = ws === '' ? 24 : 6;
          } else if (surface.kind === 'reading') {
            count = 1;
          }
        }
        return {
          kind: surface.kind,
          count,
          available,
        };
      });

      const recent =
        hubState === 'empty'
          ? []
          : recentItems.filter((item) => item.workspace_id === ws);

      return {
        surfaces,
        todos: {
          total: dueReviews.length + activeBooks.length,
          reviews: dueReviews,
          books: activeBooks,
        },
        recent,
      };
    },
    [entryMode, hubState, recentItems, todoBooks, topics, workspace],
  );

  // Create Topic Wizard (`UI-MASTERY-CREATE`)
  const updateWizardDraft = useCallback((patch: Partial<WizardDraftState>) => {
    setWizardDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleWizardSource = useCallback((candidate: TopicSourceCandidate) => {
    setWizardDraft((prev) => {
      const exists = prev.selectedSourceKeys.includes(candidate.key);
      const nextKeys = exists
        ? prev.selectedSourceKeys.filter((k) => k !== candidate.key)
        : [...prev.selectedSourceKeys, candidate.key];
      const nextChildren = { ...prev.selectedChildIdsBySourceKey };
      if (exists) {
        delete nextChildren[candidate.key];
      } else if (candidate.children && candidate.children.length > 0) {
        nextChildren[candidate.key] = candidate.children.map((c) => c.id);
      }
      return {
        ...prev,
        selectedSourceKeys: nextKeys,
        selectedChildIdsBySourceKey: nextChildren,
      };
    });
  }, []);

  const toggleWizardChildSource = useCallback(
    (candidate: TopicSourceCandidate, childId: string) => {
      setWizardDraft((prev) => {
        const currentChildren =
          prev.selectedChildIdsBySourceKey[candidate.key] ?? [];
        const hasChild = currentChildren.includes(childId);
        const nextList = hasChild
          ? currentChildren.filter((id) => id !== childId)
          : [...currentChildren, childId];
        const nextChildrenMap = {
          ...prev.selectedChildIdsBySourceKey,
          [candidate.key]: nextList,
        };
        const parentSelected = prev.selectedSourceKeys.includes(candidate.key);
        const nextKeys =
          nextList.length > 0 && !parentSelected
            ? [...prev.selectedSourceKeys, candidate.key]
            : nextList.length === 0 && parentSelected
              ? prev.selectedSourceKeys.filter((k) => k !== candidate.key)
              : prev.selectedSourceKeys;
        return {
          ...prev,
          selectedSourceKeys: nextKeys,
          selectedChildIdsBySourceKey: nextChildrenMap,
        };
      });
    },
    [],
  );

  const resetWizardDraft = useCallback(() => {
    setWizardDraft(INITIAL_WIZARD_DRAFT);
  }, []);

  const createTopicFromWizard = useCallback((): {
    ok: boolean;
    topic?: MasteryTopic;
    sessionId?: string;
    error?: string;
  } => {
    const trimmedGoal = wizardDraft.goal.trim();
    if (!trimmedGoal) {
      return { ok: false, error: 'Learning goal cannot be blank.' };
    }
    if (failOperation) {
      return {
        ok: false,
        error: 'Could not create topic while simulated failure is active.',
      };
    }

    const seq = nextPathSeqRef.current++;
    const pathId = `path-custom-${seq}`;
    const shortName =
      trimmedGoal.split(/[.;\n]/)[0]?.trim().slice(0, 60) || trimmedGoal;
    const selectedSources = wizardDraft.selectedSourceKeys
      .map((key) => sourceCandidates.find((c) => c.key === key))
      .filter((c): c is TopicSourceCandidate => Boolean(c))
      .map((c) => ({
        type: c.type,
        id: c.id,
        label: c.title,
        child_ids: wizardDraft.selectedChildIdsBySourceKey[c.key],
      }));

    const sessionId = `session-${pathId}-outline`;
    const newTopic: MasteryTopic = {
      path_id: pathId,
      name: shortName,
      updated_at: '2026-04-21T10:00:00Z',
      path_revision: 1,
      session_count: 1,
      content_workspace_id: workspace,
      metadata: {
        goal: trimmedGoal,
        description: trimmedGoal,
        icon: wizardDraft.icon,
        sources: selectedSources,
      },
      map: {
        complete: false,
        counts: {
          mastered: 0,
          learning: 0,
          new_count: 0,
          total: 0,
        },
        modules: [],
      },
      next: {
        action: 'study',
        knowledge_point_id: null,
        knowledge_point_name: null,
        module_name: null,
        reason: 'Design the outline with the tutor to begin.',
      },
      reviews: [],
      review_settings: {
        desired_retention: 0.9,
        strategy: {
          template_id: 'strat-balanced',
          name: 'Balanced FSRS',
        },
      },
      learner_profile: {
        background_summary: `Focused on: ${trimmedGoal}`,
        strengths: [],
        recurring_gaps: [],
      },
    };

    const openingText = masteryOpeningMessage('outline', null);
    const generatedModules = buildGeneratedModulesForGoal(trimmedGoal, pathId);
    const initialOutlineReply = [
      `### Proposed Mastery Route: ${shortName}`,
      '',
      `Based on your goal (**"${trimmedGoal}"**) and ${selectedSources.length} selected material source(s), I have structured an initial 2-module route with 4 waypoints:`,
      '',
      ...generatedModules.map(
        (m, idx) =>
          `- **Module ${idx + 1} — ${m.name}:** ${m.knowledge_points.map((p) => p.name).join('; ')}`,
      ),
      '',
      'You can refine this outline right here in **Outline** mode, switch to **Study** mode to start the first waypoint, or edit modules manually on the topic page.',
    ].join('\n');

    const populatedTopic = recomputeTopicCountsAndNext({
      ...newTopic,
      map: {
        ...newTopic.map,
        modules: generatedModules,
      },
    });

    const newSession: TopicSession = {
      session_id: sessionId,
      path_id: pathId,
      title: `Outline design: ${shortName}`,
      mode: 'outline',
      status: 'idle',
      message_count: 2,
      updated_at: 1_776_765_600,
      last_message:
        'Structured an initial 2-module route with 4 waypoints from your goal and materials.',
    };

    setTopics((prev) => [populatedTopic, ...prev]);
    setSessionsByPath((prev) => ({
      ...prev,
      [pathId]: [newSession],
    }));
    setMessagesBySession((prev) => ({
      ...prev,
      [sessionId]: [
        {
          id: `m-wiz-u-${seq}`,
          role: 'user',
          content: openingText,
          mode: 'outline',
          createdAt: '2026-04-21T10:00:00Z',
        },
        {
          id: `m-wiz-a-${seq}`,
          role: 'assistant',
          content: initialOutlineReply,
          mode: 'outline',
          createdAt: '2026-04-21T10:00:05Z',
          outlineUpdated: true,
        },
      ],
    }));
    setModeBySessionKey((prev) => ({
      ...prev,
      [`${pathId}::${sessionId}`]: 'outline',
    }));
    setRecentItems((prev) => [
      {
        id: `rec-${pathId}`,
        kind: 'mastery' as LearningKind,
        title: shortName,
        subtitle: 'Mastery Path · 0/4 knowledge points mastered',
        href: `/learning/mastery/${pathId}`,
        updated_at: '2026-04-21T10:00:00Z',
        progress: 0,
        workspace_id: workspace,
      },
      ...prev,
    ]);
    setAtlasState('ready');
    setWizardDraft(INITIAL_WIZARD_DRAFT);

    return { ok: true, topic: populatedTopic, sessionId };
  }, [failOperation, sourceCandidates, wizardDraft, workspace]);

  // Mastery Detail (`MS-MASTERY-DETAIL`)
  const getSelectedObjectiveId = useCallback(
    (pathId: string) => selectedObjectiveByPath[pathId] ?? null,
    [selectedObjectiveByPath],
  );

  const setSelectedObjectiveId = useCallback(
    (pathId: string, objectiveId: string | null) => {
      setSelectedObjectiveByPath((prev) => ({
        ...prev,
        [pathId]: objectiveId,
      }));
    },
    [],
  );

  const getTopicView = useCallback(
    (pathId: string) => topicViewByPath[pathId] ?? 'outline',
    [topicViewByPath],
  );

  const setTopicView = useCallback(
    (pathId: string, view: 'outline' | 'board') => {
      setTopicViewByPath((prev) => ({ ...prev, [pathId]: view }));
    },
    [],
  );

  const getBoardError = useCallback(
    (pathId: string) => Boolean(boardErrorByPath[pathId]),
    [boardErrorByPath],
  );

  const setBoardError = useCallback((pathId: string, hasError: boolean) => {
    setBoardErrorByPath((prev) => ({ ...prev, [pathId]: hasError }));
  }, []);

  const getSessionsState = useCallback(
    (pathId: string): SubPanelLoadState =>
      sessionsStateByPath[pathId] ?? 'ready',
    [sessionsStateByPath],
  );

  const setSessionsState = useCallback(
    (pathId: string, state: SubPanelLoadState) => {
      setSessionsStateByPath((prev) => ({ ...prev, [pathId]: state }));
    },
    [],
  );

  const renameTopic = useCallback(
    (pathId: string, newName: string): { ok: boolean; error?: string } => {
      const trimmed = newName.trim();
      if (!trimmed) {
        return { ok: false, error: 'Topic title cannot be blank.' };
      }
      if (failOperation) {
        return {
          ok: false,
          error: 'Could not rename topic while simulated failure is active.',
        };
      }
      setTopics((prev) =>
        prev.map((t) =>
          t.path_id === pathId
            ? {
                ...t,
                name: trimmed,
                updated_at: '2026-04-21T10:15:00Z',
              }
            : t,
        ),
      );
      setRecentItems((prev) =>
        prev.map((item) =>
          item.href === `/learning/mastery/${pathId}`
            ? { ...item, title: trimmed }
            : item,
        ),
      );
      return { ok: true };
    },
    [failOperation],
  );

  const saveTopicRoute = useCallback(
    (
      pathId: string,
      draft: TopicDraft,
    ): { ok: boolean; topic?: MasteryTopic; error?: string } => {
      if (failOperation) {
        return {
          ok: false,
          error: 'Failed to save modules while simulated failure is active.',
        };
      }
      const existing = topics.find((t) => t.path_id === pathId);
      if (!existing) {
        return { ok: false, error: 'Topic not found.' };
      }
      const updated = applyRouteDraftToTopic(existing, draft);
      setTopics((prev) =>
        prev.map((t) => (t.path_id === pathId ? updated : t)),
      );
      return { ok: true, topic: updated };
    },
    [failOperation, topics],
  );

  const generateOutlineWithTutor = useCallback(
    (
      pathId: string,
      focusNote?: string,
    ): { ok: boolean; topic?: MasteryTopic; error?: string } => {
      if (failOperation) {
        return {
          ok: false,
          error: 'Tutor could not update the outline right now.',
        };
      }
      const existing = topics.find((t) => t.path_id === pathId);
      if (!existing) return { ok: false, error: 'Topic not found.' };

      let nextModules = existing.map.modules;
      if (nextModules.length === 0) {
        nextModules = buildGeneratedModulesForGoal(
          existing.metadata.goal,
          pathId,
        );
      } else if (focusNote && focusNote.trim()) {
        const modIdx = nextModules.length + 1;
        const modId = `mod-${pathId}-rev-${modIdx}`;
        nextModules = [
          ...nextModules,
          {
            id: modId,
            name: focusNote.trim().slice(0, 56),
            objective: `Focused mastery module for: ${focusNote.trim()}`,
            order: nextModules.length,
            mastered: 0,
            learning: 0,
            new_count: 1,
            total: 1,
            knowledge_points: [
              {
                id: `kp-${modId}-1`,
                name: `${focusNote.trim().slice(0, 44)} — synthesis & check`,
                type: 'concept',
                status: 'new',
                mastery_level: 0,
                mastery_source: null,
                prerequisites: [],
                module_id: modId,
                next_review_at: null,
              },
            ],
          },
        ];
      }

      const updated = recomputeTopicCountsAndNext({
        ...existing,
        path_revision: existing.path_revision + 1,
        updated_at: '2026-04-21T10:30:00Z',
        map: {
          ...existing.map,
          modules: nextModules,
        },
      });
      setTopics((prev) =>
        prev.map((t) => (t.path_id === pathId ? updated : t)),
      );
      return { ok: true, topic: updated };
    },
    [failOperation, topics],
  );

  const getObjectiveReport = useCallback(
    (pathId: string, objectiveId: string): ObjectiveReport => {
      const existing = objectiveReports[objectiveId];
      if (existing) return existing;
      const topic = topics.find((t) => t.path_id === pathId);
      for (const mod of topic?.map.modules ?? []) {
        const pt = mod.knowledge_points.find((p) => p.id === objectiveId);
        if (pt) {
          return buildFallbackObjectiveReport(
            pt.id,
            pt.name,
            pt.type,
            pt.status,
            pt.mastery_level,
            pt.mastery_source,
          );
        }
      }
      return buildFallbackObjectiveReport(objectiveId, 'Knowledge point');
    },
    [objectiveReports, topics],
  );

  const overrideObjectiveMastery = useCallback(
    (
      pathId: string,
      objectiveId: string,
      mastered: boolean,
      note: string,
    ): { ok: boolean; error?: string } => {
      if (failOperation) {
        return {
          ok: false,
          error: 'Could not update mastery override while failure mode is active.',
        };
      }
      const topic = topics.find((t) => t.path_id === pathId);
      if (!topic) return { ok: false, error: 'Topic not found.' };

      const updatedModules = topic.map.modules.map((mod) => ({
        ...mod,
        knowledge_points: mod.knowledge_points.map((pt) => {
          if (pt.id !== objectiveId) return pt;
          return {
            ...pt,
            status: (mastered ? 'mastered' : 'new') as
              | 'mastered'
              | 'learning'
              | 'new',
            mastery_level: mastered ? 1 : 0,
            mastery_source: mastered ? ('learner' as const) : null,
          };
        }),
      }));

      const recomputed = recomputeTopicCountsAndNext({
        ...topic,
        path_revision: topic.path_revision + 1,
        map: {
          ...topic.map,
          modules: updatedModules,
        },
      });

      setTopics((prev) =>
        prev.map((t) => (t.path_id === pathId ? recomputed : t)),
      );

      const baseReport = getObjectiveReport(pathId, objectiveId);
      setObjectiveReports((prev) => ({
        ...prev,
        [objectiveId]: {
          ...baseReport,
          mastered,
          mastery: mastered ? 1 : 0,
          mastery_source: mastered ? 'learner' : null,
          learner_note: note.trim() || undefined,
        },
      }));

      return { ok: true };
    },
    [failOperation, getObjectiveReport, topics],
  );

  const setDesiredRetention = useCallback(
    (pathId: string, retention: number): { ok: boolean; error?: string } => {
      if (failOperation) {
        return {
          ok: false,
          error: 'Could not update recall target right now.',
        };
      }
      setTopics((prev) =>
        prev.map((t) =>
          t.path_id === pathId
            ? {
                ...t,
                review_settings: {
                  ...t.review_settings,
                  desired_retention: retention,
                },
                reviews: t.reviews.map((r) => ({
                  ...r,
                  desired_retention: retention,
                })),
              }
            : t,
        ),
      );
      return { ok: true };
    },
    [failOperation],
  );

  const selectReviewStrategy = useCallback(
    (pathId: string, templateId: string): { ok: boolean; error?: string } => {
      if (failOperation) {
        return { ok: false, error: 'Could not switch review strategy.' };
      }
      const found = strategies.find((s) => s.template_id === templateId);
      setTopics((prev) =>
        prev.map((t) =>
          t.path_id === pathId
            ? {
                ...t,
                review_settings: {
                  ...t.review_settings,
                  strategy: found
                    ? { template_id: found.template_id, name: found.name }
                    : null,
                },
              }
            : t,
        ),
      );
      return { ok: true };
    },
    [failOperation, strategies],
  );

  const saveReviewStrategy = useCallback(
    (
      pathId: string,
      input: ReviewStrategyInput,
      templateId?: string,
    ): { ok: boolean; strategy?: ReviewStrategy; error?: string } => {
      if (failOperation) {
        return { ok: false, error: 'Could not save custom strategy.' };
      }
      const id = templateId || `strat-custom-${Date.now()}`;
      const saved: ReviewStrategy = {
        template_id: id,
        name: input.name.trim(),
        builtin: false,
        intervals: input.intervals,
        desired_retention: input.desired_retention,
      };
      setStrategies((prev) => {
        const exists = prev.some((s) => s.template_id === id);
        return exists
          ? prev.map((s) => (s.template_id === id ? saved : s))
          : [...prev, saved];
      });
      setTopics((prev) =>
        prev.map((t) =>
          t.path_id === pathId
            ? {
                ...t,
                review_settings: {
                  ...t.review_settings,
                  strategy: { template_id: saved.template_id, name: saved.name },
                },
              }
            : t,
        ),
      );
      return { ok: true, strategy: saved };
    },
    [failOperation],
  );

  const duplicateReviewStrategy = useCallback(
    (
      pathId: string,
      templateId: string,
      copyName: string,
    ): { ok: boolean; strategy?: ReviewStrategy; error?: string } => {
      const source = strategies.find((s) => s.template_id === templateId);
      if (!source) return { ok: false, error: 'Strategy not found.' };
      return saveReviewStrategy(pathId, {
        name: copyName,
        intervals: source.intervals,
        desired_retention: source.desired_retention,
      });
    },
    [saveReviewStrategy, strategies],
  );

  const deleteReviewStrategy = useCallback(
    (pathId: string, templateId: string): { ok: boolean; error?: string } => {
      if (failOperation) {
        return { ok: false, error: 'Could not delete custom strategy.' };
      }
      setStrategies((prev) =>
        prev.filter((s) => s.template_id !== templateId || s.builtin),
      );
      setTopics((prev) =>
        prev.map((t) =>
          t.path_id === pathId &&
          t.review_settings.strategy?.template_id === templateId
            ? {
                ...t,
                review_settings: {
                  ...t.review_settings,
                  strategy: null,
                },
              }
            : t,
        ),
      );
      return { ok: true };
    },
    [failOperation],
  );

  const resetTopicProgress = useCallback(
    (pathId: string): { ok: boolean; error?: string } => {
      if (failOperation) {
        return {
          ok: false,
          error: 'Could not reset progress while simulated failure is active.',
        };
      }
      const existing = topics.find((t) => t.path_id === pathId);
      if (!existing) return { ok: false, error: 'Topic not found.' };
      const pointIds = new Set(existing.map.modules.flatMap(m => m.knowledge_points.map(p => p.id)));
      setCompletedCheckpointsByPoint(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => !pointIds.has(id))));
      setObjectiveReports(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => !pointIds.has(id))));

      const resetModules = existing.map.modules.map((mod) => ({
        ...mod,
        knowledge_points: mod.knowledge_points.map((pt) => ({
          ...pt,
          status: 'new' as const,
          mastery_level: 0,
          mastery_source: null,
          next_review_at: null,
        })),
      }));

      const updated = recomputeTopicCountsAndNext({
        ...existing,
        path_revision: existing.path_revision + 1,
        reviews: [],
        map: {
          ...existing.map,
          modules: resetModules,
        },
      });

      setTopics((prev) =>
        prev.map((t) => (t.path_id === pathId ? updated : t)),
      );
      setRecentItems((prev) =>
        prev.map((item) =>
          item.href === `/learning/mastery/${pathId}`
            ? {
                ...item,
                subtitle: `Mastery Path · 0/${updated.map.counts.total} knowledge points mastered`,
                progress: 0,
              }
            : item,
        ),
      );
      return { ok: true };
    },
    [failOperation, topics],
  );

  const deleteTopic = useCallback(
    (pathId: string): { ok: boolean; error?: string } => {
      if (failOperation) {
        return {
          ok: false,
          error: 'Could not delete topic while simulated failure is active.',
        };
      }
      setTopics((prev) => prev.filter((t) => t.path_id !== pathId));
      setSessionsByPath((prev) => {
        const next = { ...prev };
        delete next[pathId];
        return next;
      });
      setRecentItems((prev) =>
        prev.filter((item) => item.href !== `/learning/mastery/${pathId}`),
      );
      return { ok: true };
    },
    [failOperation],
  );

  // Mastery Study (`MS-MASTERY-STUDY`)
  const getSessionsForTopic = useCallback(
    (pathId: string): TopicSession[] => sessionsByPath[pathId] ?? [],
    [sessionsByPath],
  );

  const getActiveSessionForTopic = useCallback(
    (
      pathId: string,
      requestedSessionId?: string | null,
    ): TopicSession | null => {
      const list = sessionsByPath[pathId] ?? [];
      if (requestedSessionId) {
        return list.find((s) => s.session_id === requestedSessionId) ?? null;
      }
      return list[0] ?? null;
    },
    [sessionsByPath],
  );

  const getSessionMode = useCallback(
    (
      pathId: string,
      sessionId: string | null,
      queryMode?: string | null,
    ): MasteryMode => {
      const key = `${pathId}::${sessionId ?? '__new__'}`;
      if (modeBySessionKey[key]) return modeBySessionKey[key];
      if (queryMode === 'outline' || queryMode === 'study' || queryMode === 'review') {
        return queryMode;
      }
      const topic = topics.find((t) => t.path_id === pathId);
      if (topic && topic.map.modules.length === 0) return 'outline';
      return 'study';
    },
    [modeBySessionKey, topics],
  );

  const setSessionMode = useCallback(
    (pathId: string, sessionId: string | null, mode: MasteryMode) => {
      if (sessionId && activeStreams.current.has(sessionId)) return;
      const key = `${pathId}::${sessionId ?? '__new__'}`;
      setModeBySessionKey((prev) => ({ ...prev, [key]: mode }));
      if (sessionId) {
        setSessionsByPath((prev) => ({
          ...prev,
          [pathId]: (prev[pathId] ?? []).map((s) =>
            s.session_id === sessionId ? { ...s, mode } : s,
          ),
        }));
      }
    },
    [],
  );

  const getSessionMessages = useCallback(
    (sessionId: string | null): MasteryTurnMessage[] => {
      if (!sessionId) return [];
      return messagesBySession[sessionId] ?? [];
    },
    [messagesBySession],
  );

  const isSessionStreaming = useCallback(
    (sessionId: string | null): boolean => {
      if (!sessionId) return false;
      return streamingSessionIds.has(sessionId);
    },
    [streamingSessionIds],
  );

  const sendMasteryMessage = useCallback(
    (
      pathId: string,
      sessionId: string | null,
      content: string,
      modeOverride?: MasteryMode,
    focusPointId?: string,
    ): { ok: boolean; sessionId: string; error?: string } => {
      if (failOperation || (sessionId && activeStreams.current.has(sessionId))) {
        return { ok: false, sessionId: sessionId ?? '', error: failOperation ? 'Could not send message. Please retry.' : 'Wait for the current reply or stop it.' };
      }
      const trimmed = content.trim();
      if (!trimmed) {
        return {
          ok: false,
          sessionId: sessionId ?? '',
          error: 'Message cannot be empty.',
        };
      }
      const topic = topics.find((t) => t.path_id === pathId);
      const effectiveMode =
        modeOverride ?? getSessionMode(pathId, sessionId, null);

      let targetSessionId = sessionId;
      if (!targetSessionId) {
        const seq = nextSessionSeqRef.current++;
        targetSessionId = `session-${pathId}-${seq}`;
        const newSession: TopicSession = {
          session_id: targetSessionId,
          path_id: pathId,
          title: trimmed.slice(0, 48),
          mode: effectiveMode,
          status: 'idle',
          message_count: 0,
          updated_at: 1_776_765_600 + seq,
          last_message: trimmed,
        };
        setSessionsByPath((prev) => ({
          ...prev,
          [pathId]: [newSession, ...(prev[pathId] ?? [])],
        }));
        setTopics((prev) =>
          prev.map((t) =>
            t.path_id === pathId
              ? { ...t, session_count: t.session_count + 1 }
              : t,
          ),
        );
      }

      const userMsgId = `m-u-${nextMsgSeqRef.current++}`;
      const asstMsgId = `m-a-${nextMsgSeqRef.current++}`;
      const focusedPoint = topic?.map.modules.flatMap(m => m.knowledge_points).find(p => p.id === focusPointId);
      const waypoint = focusedPoint ?? (topic ? currentWaypoint(topic) : null);
      if (focusedPoint) setSelectedObjectiveByPath(prev => ({ ...prev, [pathId]: focusedPoint.id }));
      const dueReview = topic?.reviews.find((r) => r.due);

      let assistantContent = '';
      let checkpoint: MasteryCheckpointQuestion | undefined;
      let outlineUpdated = false;

      if (effectiveMode === 'outline') {
        generateOutlineWithTutor(pathId, trimmed);
        outlineUpdated = true;
        assistantContent = [
          `### Outline Updated for ${topic?.name ?? 'Topic'}`,
          '',
          `I have updated the module structure based on your request: **"${trimmed}"**.`,
          '',
          '- Verified prerequisite ordering across modules.',
          '- Balanced conceptual and procedural waypoints.',
          '',
          'Inspect the updated **Outline** rail on the left or switch to **Study** mode to begin working through the next waypoint.',
        ].join('\n');
      } else if (effectiveMode === 'review') {
        const targetId =
          dueReview?.knowledge_point_id ??
          waypoint?.id ??
          'kp-la-1';
        const targetName =
          dueReview?.knowledge_point_name ??
          waypoint?.name ??
          'Column space & rank-nullity theorem';
        checkpoint = getCheckpointQuestionForWaypoint(targetId, targetName);
        assistantContent = [
          `### Spaced Review: ${targetName}`,
          '',
          `Let’s verify your recall on **${targetName}**. Recall the core invariant without consulting notes, then complete the review check below:`,
        ].join('\n');
      } else {
        const targetId = waypoint?.id ?? 'kp-la-3';
        const targetName =
          waypoint?.name ?? 'Characteristic polynomial & eigenspace geometry';
        checkpoint = getCheckpointQuestionForWaypoint(targetId, targetName);
        assistantContent = [
          `### Guided Study: ${targetName}`,
          '',
          `Addressing your question: *"${trimmed}"*`,
          '',
          `For **${targetName}**, focus on how the structural invariant behaves under basis transformation. Once the intuition is clear, complete the mastery gate check below to advance your progress:`,
        ].join('\n');
      }

      const userTurn: MasteryTurnMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        mode: effectiveMode,
        createdAt: '2026-04-21T10:35:00Z',
      };

      const partialAssistantTurn: MasteryTurnMessage = {
        id: asstMsgId,
        role: 'assistant',
        content: assistantContent.slice(0, 72) + ' …',
        mode: effectiveMode,
        createdAt: '2026-04-21T10:35:01Z',
      };

      const finalAssistantTurn: MasteryTurnMessage = {
        id: asstMsgId,
        role: 'assistant',
        content: assistantContent,
        mode: effectiveMode,
        createdAt: '2026-04-21T10:35:02Z',
        checkpoint,
        outlineUpdated,
      };

      const sid = targetSessionId;
      setModeBySessionKey((prev) => ({
        ...prev,
        [`${pathId}::${sid}`]: effectiveMode,
      }));
      setMessagesBySession((prev) => ({
        ...prev,
        [sid]: [...(prev[sid] ?? []), userTurn, partialAssistantTurn],
      }));
      setStreamingSessionIds((prev) => {
        const next = new Set(prev);
        next.add(sid);
        return next;
      });
      setSessionsByPath((prev) => ({
        ...prev,
        [pathId]: (prev[pathId] ?? []).map((s) =>
          s.session_id === sid
            ? {
                ...s,
                mode: effectiveMode,
                status: 'running',
                message_count: s.message_count + 2,
                last_message: trimmed,
              }
            : s,
        ),
      }));

      const timer = setTimeout(() => {
        activeStreams.current.delete(sid);
        streamTimersRef.current.delete(timer);
        setMessagesBySession((prev) => ({
          ...prev,
          [sid]: (prev[sid] ?? []).map((m) =>
            m.id === asstMsgId ? finalAssistantTurn : m,
          ),
        }));
        setStreamingSessionIds((prev) => {
          const next = new Set(prev);
          next.delete(sid);
          return next;
        });
        setSessionsByPath((prev) => ({
          ...prev,
          [pathId]: (prev[pathId] ?? []).map((s) =>
            s.session_id === sid
              ? {
                  ...s,
                  status: 'idle',
                  last_message: assistantContent.split('\n')[0] ?? trimmed,
                }
              : s,
          ),
        }));
      }, 600);
      activeStreams.current.set(sid, timer);
      streamTimersRef.current.add(timer);

      return { ok: true, sessionId: sid };
    },
    [failOperation, generateOutlineWithTutor, getSessionMode, topics],
  );

  const startOrResumeStudySession = useCallback(
    (
      pathId: string,
      options?: {
        sessionId?: string | null;
        mode?: MasteryMode;
        focus?: string | null;
        autoSendPrompt?: boolean;
      },
    ): { sessionId: string; mode: MasteryMode } => {
      const mode = normalizeMasteryMode(options?.mode);
      const existingList = sessionsByPath[pathId] ?? [];
      if (options?.sessionId) {
        const found = existingList.find(
          (s) => s.session_id === options.sessionId,
        );
        if (found) {
          if (options.mode) {
            setSessionMode(pathId, found.session_id, mode);
          }
          return { sessionId: found.session_id, mode: options.mode ? mode : found.mode };
        }
      }

      if (options?.autoSendPrompt) {
        const prompt = masteryOpeningMessage(mode, options.focus);
        const targetSid = existingList[0]?.session_id ?? null;
        const res = sendMasteryMessage(pathId, targetSid, prompt, mode);
        return { sessionId: res.sessionId, mode };
      }

      if (existingList.length > 0) {
        const first = existingList[0];
        if (options?.mode) {
          setSessionMode(pathId, first.session_id, mode);
        }
        return {
          sessionId: first.session_id,
          mode: options?.mode ? mode : first.mode,
        };
      }

      const prompt = masteryOpeningMessage(mode, options?.focus);
      const res = sendMasteryMessage(pathId, null, prompt, mode);
      return { sessionId: res.sessionId, mode };
    },
    [sendMasteryMessage, sessionsByPath, setSessionMode],
  );

  const submitCheckpointAnswer = useCallback(
    (
      pathId: string,
      knowledgePointId: string,
      optionId: string,
    ): {
      ok: boolean;
      isCorrect: boolean;
      masteredNow: boolean;
      error?: string;
    } => {
      if (failOperation) {
        return {
          ok: false,
          isCorrect: false,
          masteredNow: false,
          error: 'Could not record checkpoint answer while failure mode is on.',
        };
      }

      const topic = topics.find((t) => t.path_id === pathId);
      if (!topic) {
        return {
          ok: false,
          isCorrect: false,
          masteredNow: false,
          error: 'Topic not found.',
        };
      }

      const priorAnswer = completedCheckpointsByPoint[knowledgePointId];
      if (priorAnswer && !priorAnswer.skipped) return { ok: true, isCorrect: priorAnswer.isCorrect, masteredNow: false };
      let pointName = knowledgePointId;
      for (const mod of topic.map.modules) {
        const pt = mod.knowledge_points.find((p) => p.id === knowledgePointId);
        if (pt) {
          pointName = pt.name;
          break;
        }
      }

      const question = getCheckpointQuestionForWaypoint(
        knowledgePointId,
        pointName,
      );
      const chosen = question.options.find((o) => o.id === optionId);
      const isCorrect = Boolean(chosen?.isCorrect);

      setCompletedCheckpointsByPoint((prev) => ({
        ...prev,
        [knowledgePointId]: { selectedOptionId: optionId, isCorrect },
      }));

      let masteredNow = false;
      const updatedModules = topic.map.modules.map((mod) => ({
        ...mod,
        knowledge_points: mod.knowledge_points.map((pt) => {
          if (pt.id !== knowledgePointId) return pt;
          if (isCorrect) {
            if (pt.status !== 'mastered') {
              masteredNow = true;
            }
            return {
              ...pt,
              status: 'mastered' as const,
              mastery_level: 0.94,
              mastery_source: 'tutor' as const,
            };
          }
          return {
            ...pt,
            status: (pt.status === 'mastered' ? 'mastered' : 'learning') as
              | 'mastered'
              | 'learning'
              | 'new',
            mastery_level: Math.max(0.45, pt.mastery_level),
          };
        }),
      }));

      // Update review trail: if a due review existed for this knowledgePointId, mark it completed (`due: false`);
      // if newly mastered, add a scheduled review entry!
      const hadReview = topic.reviews.some(
        (r) => r.knowledge_point_id === knowledgePointId,
      );
      let nextReviews = topic.reviews.map((r) =>
        r.knowledge_point_id === knowledgePointId && isCorrect
          ? {
              ...r,
              due: false,
              due_at: 1_776_765_600 + 86_400 * 7,
              retrievability: 0.97,
              stability: Number((r.stability * 1.8).toFixed(1)),
              forgetting_risk: 0.03,
              reason: 'Reviewed just now — stability increased.',
            }
          : r,
      );
      if (isCorrect && !hadReview) {
        nextReviews = [
          ...nextReviews,
          buildReviewEntryForMasteredPoint(
            knowledgePointId,
            pointName,
            topic.review_settings.desired_retention,
          ),
        ];
      }

      const recomputed = recomputeTopicCountsAndNext({
        ...topic,
        path_revision: topic.path_revision + 1,
        updated_at: '2026-04-21T10:40:00Z',
        reviews: nextReviews,
        map: {
          ...topic.map,
          modules: updatedModules,
        },
      });

      setTopics((prev) =>
        prev.map((t) => (t.path_id === pathId ? recomputed : t)),
      );

      const baseReport = getObjectiveReport(pathId, knowledgePointId);
      setObjectiveReports((prev) => ({
        ...prev,
        [knowledgePointId]: {
          ...baseReport,
          mastered: isCorrect ? true : baseReport.mastered,
          assessed_mastered: isCorrect ? true : baseReport.assessed_mastered,
          mastery: isCorrect ? 0.94 : Math.max(0.5, baseReport.mastery),
          correct_count: baseReport.correct_count + (isCorrect ? 1 : 0),
          attempts: [
            ...baseReport.attempts,
            {
              question_id: question.id,
              prompt: question.prompt,
              answer: chosen?.label ?? optionId,
              is_correct: isCorrect,
              at: 1_776_765_600,
              independent: true,
            },
          ],
          evidence: [
            {
              timestamp: 1_776_765_600,
              turn_id: `turn-chk-${Date.now()}`,
              result: isCorrect ? 'Passed gate' : 'Needs practice',
              assessment_type: 'Mastery checkpoint',
              quality: isCorrect ? 0.94 : 0.4,
            },
            ...baseReport.evidence,
          ],
          evidence_count: baseReport.evidence_count + 1,
        },
      }));

      if (isCorrect) {
        setJustMasteredPointId(knowledgePointId);
        setCelebrationNonce((n) => n + 1);
      }

      setRecentItems((prev) =>
        prev.map((item) =>
          item.href === `/learning/mastery/${pathId}`
            ? {
                ...item,
                subtitle: `Mastery Path · ${recomputed.map.counts.mastered}/${recomputed.map.counts.total} knowledge points mastered`,
                progress:
                  recomputed.map.counts.total > 0
                    ? recomputed.map.counts.mastered /
                      recomputed.map.counts.total
                    : 0,
              }
            : item,
        ),
      );

      return { ok: true, isCorrect, masteredNow };
    },
    [completedCheckpointsByPoint, failOperation, getObjectiveReport, topics],
  );

  const skipCheckpointQuestion = useCallback(
    (_pathId: string, knowledgePointId: string) => {
      setCompletedCheckpointsByPoint((prev) => ({
        ...prev,
        [knowledgePointId]: {
          selectedOptionId: '',
          isCorrect: false,
          skipped: true,
        },
      }));
    },
    [],
  );

  const dismissCelebration = useCallback(() => {
    setJustMasteredPointId(null);
  }, []);

  const resetLearningFixtures = useCallback(() => {
    streamTimersRef.current.forEach((t) => clearTimeout(t));
    streamTimersRef.current.clear();
    activeStreams.current.clear();
    setStudyDrafts({});
    nextPathSeqRef.current = 1;
    nextSessionSeqRef.current = 1;
    nextMsgSeqRef.current = 100;
    setCustomization(DEFAULT_PAGE_CUSTOMIZATION);
    setHubState('ready');
    setAtlasState('ready');
    setTopics(createInitialMasteryTopics());
    setObjectiveReports(createInitialObjectiveReports());
    setSessionsByPath(createInitialTopicSessions());
    setMessagesBySession(createInitialSessionMessages());
    setStreamingSessionIds(new Set());
    setStrategies(createInitialReviewStrategies());
    setRecentItems(createInitialLearningRecent());
    setWizardDraft(INITIAL_WIZARD_DRAFT);
    setSelectedObjectiveByPath({});
    setTopicViewByPath({});
    setBoardErrorByPath({});
    setSessionsStateByPath({});
    setStrategiesState('ready');
    setModeBySessionKey({
      'path-general::session-general-mastery-1': 'study',
      'path-general::session-general-mastery-outline': 'outline',
      'path-signals-fourier::session-signals-study-1': 'review',
    });
    setCompletedCheckpointsByPoint({});
    setJustMasteredPointId(null);
    setCelebrationNonce(0);
  }, []);

  const value = useMemo<LearningContextValue>(
    () => ({
      customization,
      saveCustomization,
      resetCustomization,
      hubState,
      setHubState,
      getLearningOverview,
      sourceCandidates,
      atlasState,
      setAtlasState,
      topics,
      getWorkspaceTopics,
      getTopic,
      wizardDraft,
      updateWizardDraft,
      toggleWizardSource,
      toggleWizardChildSource,
      resetWizardDraft,
      createTopicFromWizard,
      getSelectedObjectiveId,
      setSelectedObjectiveId,
      getTopicView,
      setTopicView,
      getBoardError,
      setBoardError,
      getSessionsState,
      setSessionsState,
      strategiesState,
      setStrategiesState,
      renameTopic,
      saveTopicRoute,
      generateOutlineWithTutor,
      getObjectiveReport,
      overrideObjectiveMastery,
      setDesiredRetention,
      strategies,
      selectReviewStrategy,
      saveReviewStrategy,
      duplicateReviewStrategy,
      deleteReviewStrategy,
      resetTopicProgress,
      deleteTopic,
      studyDrafts,
      setStudyDraft,
      stopMasteryMessage,
      getSessionsForTopic,
      getActiveSessionForTopic,
      getSessionMode,
      setSessionMode,
      getSessionMessages,
      isSessionStreaming,
      startOrResumeStudySession,
      sendMasteryMessage,
      submitCheckpointAnswer,
      skipCheckpointQuestion,
      completedCheckpointsByPoint,
      justMasteredPointId,
      celebrationNonce,
      dismissCelebration,
      resetLearningFixtures,
    }),
    [
      customization,
      saveCustomization,
      resetCustomization,
      hubState,
      getLearningOverview,
      sourceCandidates,
      atlasState,
      topics,
      getWorkspaceTopics,
      getTopic,
      wizardDraft,
      updateWizardDraft,
      toggleWizardSource,
      toggleWizardChildSource,
      resetWizardDraft,
      createTopicFromWizard,
      getSelectedObjectiveId,
      setSelectedObjectiveId,
      getTopicView,
      setTopicView,
      getBoardError,
      setBoardError,
      getSessionsState,
      setSessionsState,
      strategiesState,
      renameTopic,
      saveTopicRoute,
      generateOutlineWithTutor,
      getObjectiveReport,
      overrideObjectiveMastery,
      setDesiredRetention,
      strategies,
      selectReviewStrategy,
      saveReviewStrategy,
      duplicateReviewStrategy,
      deleteReviewStrategy,
      resetTopicProgress,
      deleteTopic,
      studyDrafts,
      setStudyDraft,
      stopMasteryMessage,
      getSessionsForTopic,
      getActiveSessionForTopic,
      getSessionMode,
      setSessionMode,
      getSessionMessages,
      isSessionStreaming,
      startOrResumeStudySession,
      sendMasteryMessage,
      submitCheckpointAnswer,
      skipCheckpointQuestion,
      completedCheckpointsByPoint,
      justMasteredPointId,
      celebrationNonce,
      dismissCelebration,
      resetLearningFixtures,
    ],
  );

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const ctx = useContext(LearningContext);
  if (!ctx) {
    throw new Error('useLearning must be used within LearningProvider');
  }
  return ctx;
}
