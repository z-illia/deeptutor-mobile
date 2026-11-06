export type LearningKind = 'books' | 'mastery' | 'practice' | 'reading';

export interface LearningSurfaceDefinition {
  kind: LearningKind;
  title: string;
  description: string;
  intro: string;
  highlights: readonly [string, string, string];
  href: string;
  createHref: string;
  unitLabel: string;
  milestone: 'M4.1' | 'M4.2' | 'M5';
}

export const LEARNING_SURFACES: readonly LearningSurfaceDefinition[] = [
  {
    kind: 'books',
    title: 'Books',
    description:
      'Turn a learning topic into a multi-chapter book with inline exercises, runnable code, and a chapter tutor.',
    intro:
      'Generate a structured textbook for a topic you want to learn deeply. Review the chapter plan, compile chapters in the background, and read with explanations, code sandboxes, and inline checks.',
    highlights: [
      'AI-planned chapter outline before compilation starts',
      'Interactive reading with exercises, callouts, and code blocks',
      'Resume from the chapter you last opened',
    ],
    href: '/learning/books',
    createHref: '/learning/books?create=1',
    unitLabel: '{{count}} books',
    milestone: 'M5',
  },
  {
    kind: 'mastery',
    title: 'Mastery Path',
    description:
      'Build a structured knowledge map, study with a tutor, and track spaced reviews.',
    intro:
      'Break a subject into modules and knowledge points. The tutor guides you through explanations, checks understanding before advancing, and schedules reviews when memory starts to fade.',
    highlights: [
      'Visual map of modules, prerequisites, and mastery status',
      'Guided study sessions tied to specific knowledge points',
      'Forgetting-curve review reminders for due objectives',
    ],
    href: '/learning/mastery',
    createHref: '/learning/mastery?create=1',
    unitLabel: '{{count}} paths',
    milestone: 'M4.1',
  },
  {
    kind: 'practice',
    title: 'Practice',
    description:
      'Import documents or notes to generate quizzes, grade answers, and review weak spots.',
    intro:
      'Turn course handouts, papers, or personal notes into targeted question sets. Practice in timed or untimed sessions, inspect detailed grading explanations, and revisit missed questions.',
    highlights: [
      'Single-choice, multiple-choice, true/false, fill-in, and written questions',
      'Instant AI grading with reference answers and explanations',
      'Reusable question bank organized by category',
    ],
    href: '/learning/practice',
    createHref: '/learning/practice?create=1',
    unitLabel: '{{count}} questions',
    milestone: 'M4.2',
  },
  {
    kind: 'reading',
    title: 'Immersive Reading',
    description:
      'Read PDFs and documents side-by-side with an AI tutor, annotations, and reading packs.',
    intro:
      'Upload papers, textbooks, or web articles into a focused reading workspace. Select passages to ask questions, translate or summarize sections, and generate study packs from what you read.',
    highlights: [
      'Side-by-side PDF and document reader with passage selection',
      'Context-aware tutor threads anchored to the current material',
      'Exportable reading notes, flashcards, and mind maps',
    ],
    href: '/learning/reading',
    createHref: '/learning/reading?create=1',
    unitLabel: '{{count}} collections',
    milestone: 'M5',
  },
];

export interface LearningSurfaceSummary {
  kind: LearningKind;
  count: number;
  available: boolean;
}

export interface LearningTodoReview {
  id: string;
  path_id: string;
  topic_name: string;
  knowledge_point_id: string;
  knowledge_point_name: string;
  due_at: number;
  forgetting_risk: number;
}

export interface LearningTodoBook {
  book_id: string;
  title: string;
  status: 'paused' | 'failed' | 'compiling';
  resume_chapter_id?: string | null;
  status_hint: string;
}

export interface LearningRecentItem {
  id: string;
  kind: LearningKind;
  title: string;
  subtitle: string;
  href: string;
  updated_at: string;
  progress?: number | null;
  workspace_id: string;
}

export interface LearningOverview {
  surfaces: LearningSurfaceSummary[];
  todos: {
    total: number;
    reviews: LearningTodoReview[];
    books: LearningTodoBook[];
  };
  recent: LearningRecentItem[];
}

export interface PageCustomization {
  hidden_features: string[];
  hidden_modes: string[];
  controls: {
    model_selector: boolean;
    context_picker: boolean;
  };
  starters: {
    suggested_questions: boolean;
  };
}

export const DEFAULT_PAGE_CUSTOMIZATION: PageCustomization = {
  hidden_features: [],
  hidden_modes: [],
  controls: {
    model_selector: true,
    context_picker: true,
  },
  starters: {
    suggested_questions: true,
  },
};

export const LEARNING_CUSTOMIZE_ITEMS: readonly {
  id: LearningKind;
  label: string;
}[] = [
  { id: 'books', label: 'Books' },
  { id: 'mastery', label: 'Mastery Path' },
  { id: 'practice', label: 'Practice' },
  { id: 'reading', label: 'Immersive Reading' },
];

export const CHAT_MODE_CUSTOMIZE_ITEMS: readonly {
  id: string;
  label: string;
}[] = [
  { id: 'question', label: 'Deep Question' },
  { id: 'research', label: 'Deep Research' },
  { id: 'math', label: 'Math Animator' },
];

export function toggleHiddenEntry(
  list: readonly string[],
  id: string,
  visible: boolean,
): string[] {
  if (visible) {
    return list.filter((item) => item !== id);
  }
  return list.includes(id) ? [...list] : [...list, id];
}

export function visibleLearningSurfaces(
  customization: PageCustomization,
  allowedPredicate: (href: string) => boolean = () => true,
): LearningSurfaceDefinition[] {
  const hiddenSet = new Set(customization.hidden_features);
  return LEARNING_SURFACES.filter(
    (surface) =>
      allowedPredicate(surface.href) && !hiddenSet.has(surface.kind),
  );
}

export function filterLearningRecent(
  items: readonly LearningRecentItem[],
  options: {
    workspaceId: string;
    kindFilter: 'all' | LearningKind;
    query: string;
    visibleKinds: ReadonlySet<LearningKind>;
  },
): LearningRecentItem[] {
  const q = options.query.trim().toLowerCase();
  return items.filter((item) => {
    if (item.workspace_id !== options.workspaceId) return false;
    if (!options.visibleKinds.has(item.kind)) return false;
    if (options.kindFilter !== 'all' && item.kind !== options.kindFilter) {
      return false;
    }
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q)
    );
  });
}

export const GOAL_EMBLEMS = [
  '🧭',
  '🏔️',
  '🌿',
  '🔭',
  '🧪',
  '🧠',
  '📐',
  '🌌',
] as const;

export type GoalEmblem = (typeof GOAL_EMBLEMS)[number];

export const EMBLEM_META: Record<
  GoalEmblem,
  { iconKey: string; label: string }
> = {
  '🧭': { iconKey: 'Compass', label: 'Compass' },
  '🏔️': { iconKey: 'Mountain', label: 'Summit' },
  '🌿': { iconKey: 'Sprout', label: 'Growth' },
  '🔭': { iconKey: 'Telescope', label: 'Discovery' },
  '🧪': { iconKey: 'FlaskConical', label: 'Experiment' },
  '🧠': { iconKey: 'Brain', label: 'Reasoning' },
  '📐': { iconKey: 'Ruler', label: 'Craft' },
  '🌌': { iconKey: 'Orbit', label: 'Systems' },
};

export type SourceCategory =
  | 'kb'
  | 'notebook'
  | 'book'
  | 'question_bank'
  | 'session'
  | 'co_writer';

export interface SourceCategoryMeta {
  type: SourceCategory;
  label: string;
  emptyLabel: string;
}

export const SOURCE_CATEGORIES: readonly SourceCategoryMeta[] = [
  {
    type: 'kb',
    label: 'Knowledge bases',
    emptyLabel: 'No knowledge bases yet',
  },
  {
    type: 'notebook',
    label: 'Notebooks',
    emptyLabel: 'No notebooks yet',
  },
  {
    type: 'book',
    label: 'Books',
    emptyLabel: 'No books yet',
  },
  {
    type: 'question_bank',
    label: 'Question bank',
    emptyLabel: 'No question banks yet',
  },
  {
    type: 'session',
    label: 'Conversations',
    emptyLabel: 'No conversations yet',
  },
  {
    type: 'co_writer',
    label: 'Co-Writer drafts',
    emptyLabel: 'No Co-Writer documents yet',
  },
];

export interface TopicSourceChild {
  id: string;
  title: string;
  detail?: string;
}

export interface TopicSourceCandidate {
  key: string;
  id: string;
  type: SourceCategory;
  title: string;
  subtitle: string;
  detail?: string;
  children?: TopicSourceChild[];
  workspace_id?: string;
}

export function filterSourceCandidates(
  candidates: readonly TopicSourceCandidate[],
  category: SourceCategory,
  query: string,
  workspaceId = '',
): TopicSourceCandidate[] {
  const q = query.trim().toLowerCase();
  return candidates.filter((item) => {
    if (item.workspace_id !== undefined && item.workspace_id !== workspaceId) {
      return false;
    }
    if (item.type !== category) return false;
    if (!q) return true;
    const parentMatches = `${item.title} ${item.subtitle} ${item.detail ?? ''}`
      .toLowerCase()
      .includes(q);
    const childMatches = (item.children ?? []).some((child) =>
      `${child.title} ${child.detail ?? ''}`.toLowerCase().includes(q),
    );
    return parentMatches || childMatches;
  });
}

export type KnowledgeType = 'concept' | 'memory' | 'procedure' | 'design';
export type ObjectiveStatus = 'mastered' | 'learning' | 'new';

export const KNOWLEDGE_TYPE_LABELS: Record<KnowledgeType, string> = {
  concept: 'Concept',
  memory: 'Memory',
  procedure: 'Procedure',
  design: 'Design',
};

export function knowledgeTypeLabel(type: string): string {
  return (
    KNOWLEDGE_TYPE_LABELS[type as KnowledgeType] ??
    (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Concept')
  );
}

export interface MapKnowledgePoint {
  id: string;
  name: string;
  description?: string;
  type: KnowledgeType;
  status: ObjectiveStatus;
  mastery_level: number;
  mastery_source?: 'tutor' | 'learner' | null;
  prerequisites: string[];
  module_id: string;
  next_review_at?: number | null;
}

export interface MapModule {
  id: string;
  name: string;
  objective: string;
  order: number;
  mastered: number;
  learning: number;
  new_count: number;
  total: number;
  knowledge_points: MapKnowledgePoint[];
}

export type ReviewIntervalType = 'memory' | 'concept' | 'procedure' | 'design';

export const INTERVAL_TYPES: readonly ReviewIntervalType[] = [
  'memory',
  'concept',
  'procedure',
  'design',
];

export const RETENTION_TARGETS: readonly number[] = [
  0.7, 0.8, 0.85, 0.9, 0.95, 0.97, 0.99,
];

export const BASELINE_INTERVALS: Record<ReviewIntervalType, number[]> = {
  memory: [0, 1, 3, 7, 14, 30, 60],
  concept: [3, 7, 14, 30],
  procedure: [3, 7, 14],
  design: [14, 28],
};

export interface ReviewStrategy {
  template_id: string;
  name: string;
  builtin: boolean;
  intervals: Record<ReviewIntervalType, number[]>;
  desired_retention: number | null;
}

export interface ReviewStrategyInput {
  name: string;
  intervals: Record<ReviewIntervalType, number[]>;
  desired_retention: number | null;
}

export function parseStrategyIntervalsForm(form: {
  name: string;
  intervals: Record<ReviewIntervalType, string>;
}): ReviewStrategyInput | null {
  const name = form.name.trim();
  if (!name) return null;
  const intervals = {} as Record<ReviewIntervalType, number[]>;
  for (const type of INTERVAL_TYPES) {
    const raw = (form.intervals[type] ?? '').trim();
    if (!/^\d+(?:\s*,\s*\d+)*$/.test(raw)) return null;
    const rounds = raw.split(',').map((value) => Number(value.trim()));
    if (
      rounds.length === 0 ||
      rounds.length > 16 ||
      rounds.some((days) => days > 365 || days < 0) ||
      rounds.some((days, index) => index > 0 && days < rounds[index - 1]) ||
      rounds.some((days, index) => index > 0 && days === 0)
    ) {
      return null;
    }
    intervals[type] = rounds;
  }
  return { name, intervals, desired_retention: null };
}

export interface TopicReview {
  id: string;
  knowledge_point_id: string;
  knowledge_point_name: string;
  due: boolean;
  due_at: number;
  retrievability: number;
  stability: number;
  forgetting_risk: number;
  lapse_count: number;
  recent_failure: boolean;
  reason: string;
  desired_retention: number;
}

export interface ObjectiveAttempt {
  question_id: string;
  prompt: string;
  answer: string;
  is_correct: boolean;
  at: number;
  independent?: boolean;
}

export interface ObjectiveErrorRecord {
  id: string;
  error_type: string;
  retries: number;
  status: 'open' | 'graduated';
}

export interface ObjectiveEvidenceItem {
  timestamp: number;
  turn_id: string;
  result: string;
  assessment_type: string;
  quality: number | null;
  hints_used?: boolean;
  visual_context?: { task?: string };
}

export interface ObjectiveReport {
  id: string;
  name: string;
  type: KnowledgeType;
  gate: 'quantitative' | 'qualitative';
  mastery: number;
  threshold: number;
  mastered: boolean;
  assessed_mastered: boolean;
  mastery_source?: 'tutor' | 'learner' | null;
  learner_note?: string;
  explanation?: string;
  explained?: { summary: string } | null;
  attempts: ObjectiveAttempt[];
  correct_count: number;
  errors: ObjectiveErrorRecord[];
  evidence: ObjectiveEvidenceItem[];
  evidence_count: number;
  required_visual_tasks?: string[];
  demonstrated_visual_tasks?: string[];
  review?: {
    due_at: number | null;
    retrievability: number;
    stability: number;
    forgetting_risk: number;
    lapse_count: number;
    reason?: string;
  } | null;
}

export const MASTERY_MODES = ['outline', 'study', 'review'] as const;
export type MasteryMode = (typeof MASTERY_MODES)[number];

export const MASTERY_MODE_LABELS: Record<MasteryMode, string> = {
  outline: 'Outline',
  study: 'Study',
  review: 'Review',
};

export function normalizeMasteryMode(
  value: string | null | undefined,
): MasteryMode {
  return value === 'outline' || value === 'review' ? value : 'study';
}

export function masteryOpeningMessage(
  mode: MasteryMode,
  focus?: string | null,
): string {
  const trimmed = focus?.trim() || '';
  if (mode === 'outline') {
    return trimmed
      ? `Let's adjust the learning outline: ${trimmed}`
      : "Let's design the learning outline together. Please inspect the topic and selected materials, ask any clarifying questions you need, and then create or update the modules and knowledge points.";
  }
  if (mode === 'review') {
    return trimmed
      ? `I'm ready to review "${trimmed}". Quiz me on it and record the result.`
      : "Let's review the knowledge points that are due.";
  }
  return trimmed
    ? `Let's study "${trimmed}".`
    : "Let's continue with the next knowledge point.";
}

export interface TopicSession {
  session_id: string;
  path_id: string;
  title: string;
  mode: MasteryMode;
  status: 'idle' | 'running';
  active_turn_id?: string | null;
  message_count: number;
  updated_at: number;
  last_message: string;
}

export interface LearnerProfileSnapshot {
  background_summary?: string;
  strengths: string[];
  recurring_gaps: string[];
  preferred_style?: string;
}

export interface MasteryTopic {
  path_id: string;
  name: string;
  updated_at: string;
  path_revision: number;
  session_count: number;
  content_workspace_id: string;
  metadata: {
    goal: string;
    description: string;
    icon: GoalEmblem;
    sources: {
      type: SourceCategory;
      id: string;
      label: string;
      child_ids?: string[];
    }[];
  };
  map: {
    complete: boolean;
    counts: {
      mastered: number;
      learning: number;
      new_count: number;
      total: number;
    };
    modules: MapModule[];
  };
  next: {
    action: 'study' | 'review' | 'complete';
    knowledge_point_id: string | null;
    knowledge_point_name: string | null;
    module_name: string | null;
    reason: string;
  };
  reviews: TopicReview[];
  review_settings: {
    desired_retention: number;
    strategy?: {
      template_id: string;
      name: string;
    } | null;
  };
  learner_profile: LearnerProfileSnapshot;
}

export interface BoardCard {
  id: string;
  name: string;
  type: KnowledgeType;
  status: ObjectiveStatus;
  mastery_level: number;
  next_review_at?: number | null;
}

export interface BoardModule {
  id: string;
  name: string;
  mastered: number;
  total: number;
  cards: BoardCard[];
}

export interface BoardResult {
  path_id: string;
  modules: BoardModule[];
}

export function buildBoardFromTopic(topic: MasteryTopic): BoardResult {
  return {
    path_id: topic.path_id,
    modules: topic.map.modules.map((mod) => ({
      id: mod.id,
      name: mod.name,
      mastered: mod.mastered,
      total: mod.total,
      cards: mod.knowledge_points.map((pt) => ({
        id: pt.id,
        name: pt.name,
        type: pt.type,
        status: pt.status,
        mastery_level: pt.mastery_level,
        next_review_at: pt.next_review_at,
      })),
    })),
  };
}

export function topicDisplayName(
  topic: { name: string; path_id: string },
  fallbackLabel = 'Exploration trail',
): string {
  const name = topic.name.trim();
  if (
    name &&
    name !== topic.path_id &&
    !/^unified_\d+_[a-z0-9]+$/i.test(name)
  ) {
    return name;
  }
  const suffix = topic.path_id.split('_').at(-1)?.slice(-4) || 'map';
  return `${fallbackLabel} · ${suffix}`;
}

export function currentWaypoint(topic: MasteryTopic): {
  id: string;
  name: string;
  moduleIndex: number;
  moduleName: string;
} | null {
  const targetId = topic.next.knowledge_point_id;
  if (targetId) {
    for (let i = 0; i < topic.map.modules.length; i++) {
      const point = topic.map.modules[i].knowledge_points.find(
        (candidate) => candidate.id === targetId,
      );
      if (point) {
        return {
          id: point.id,
          name: point.name,
          moduleIndex: i,
          moduleName: topic.map.modules[i].name,
        };
      }
    }
  }
  for (let i = 0; i < topic.map.modules.length; i++) {
    const point = topic.map.modules[i].knowledge_points.find(
      (candidate) => candidate.status !== 'mastered',
    );
    if (point) {
      return {
        id: point.id,
        name: point.name,
        moduleIndex: i,
        moduleName: topic.map.modules[i].name,
      };
    }
  }
  return null;
}

export interface WaypointInit {
  id: string;
  name: string;
  description?: string;
  type: KnowledgeType;
  prerequisites?: string[];
  module_id: string;
}

export interface ModuleInit {
  id: string;
  name: string;
  objective?: string;
  order: number;
  knowledge_points: WaypointInit[];
}

export interface TopicDraft {
  name: string;
  description: string;
  goal: string;
  icon: GoalEmblem;
  modules: ModuleInit[];
}

export type RouteDraftIssue =
  | { code: 'no_regions' }
  | { code: 'blank_region'; moduleIndex: number }
  | { code: 'no_waypoints'; moduleIndex: number }
  | {
      code: 'blank_waypoint';
      moduleIndex: number;
      waypointIndex: number;
    };

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function normalizeRouteModules(modules: ModuleInit[]): ModuleInit[] {
  return modules.map((module, order) => ({
    ...module,
    order,
    knowledge_points: module.knowledge_points.map((point) => ({
      ...point,
      module_id: module.id,
    })),
  }));
}

export function moveRouteModule(
  draft: TopicDraft,
  from: number,
  to: number,
): TopicDraft {
  return {
    ...draft,
    modules: normalizeRouteModules(moveItem(draft.modules, from, to)),
  };
}

export function moveRouteWaypoint(
  draft: TopicDraft,
  moduleIndex: number,
  from: number,
  to: number,
): TopicDraft {
  const currentModule = draft.modules[moduleIndex];
  if (!currentModule) return draft;
  const modules = [...draft.modules];
  modules[moduleIndex] = {
    ...currentModule,
    knowledge_points: moveItem(currentModule.knowledge_points, from, to),
  };
  return { ...draft, modules: normalizeRouteModules(modules) };
}

export function routeDraftIssues(draft: TopicDraft): RouteDraftIssue[] {
  if (draft.modules.length === 0) return [{ code: 'no_regions' }];
  const issues: RouteDraftIssue[] = [];
  draft.modules.forEach((module, moduleIndex) => {
    if (!module.name.trim()) {
      issues.push({ code: 'blank_region', moduleIndex });
    }
    if (module.knowledge_points.length === 0) {
      issues.push({ code: 'no_waypoints', moduleIndex });
    }
    module.knowledge_points.forEach((point, waypointIndex) => {
      if (!point.name.trim()) {
        issues.push({
          code: 'blank_waypoint',
          moduleIndex,
          waypointIndex,
        });
      }
    });
  });
  return issues;
}

export function isRouteDraftValid(draft: TopicDraft): boolean {
  return routeDraftIssues(draft).length === 0;
}

export function topicToRouteDraft(topic: MasteryTopic): TopicDraft {
  if (topic.map.modules.length === 0) {
    const initialModuleId = `mod-${topic.path_id}-1`;
    return {
      name: topic.name,
      description: topic.metadata.description,
      goal: topic.metadata.goal,
      icon: topic.metadata.icon,
      modules: [
        {
          id: initialModuleId,
          name: 'Foundations & Core Principles',
          objective: 'Establish the fundamental concepts and vocabulary.',
          order: 0,
          knowledge_points: [
            {
              id: `kp-${topic.path_id}-1`,
              name: 'Core definitions and geometric intuition',
              type: 'concept',
              module_id: initialModuleId,
            },
          ],
        },
      ],
    };
  }
  return {
    name: topic.name,
    description: topic.metadata.description,
    goal: topic.metadata.goal,
    icon: topic.metadata.icon,
    modules: topic.map.modules.map((module, index) => ({
      id: module.id,
      name: module.name,
      objective: module.objective,
      order: index,
      knowledge_points: module.knowledge_points.map((point) => ({
        id: point.id,
        name: point.name,
        description: point.description,
        type: point.type,
        prerequisites: point.prerequisites,
        module_id: module.id,
      })),
    })),
  };
}

export function recomputeTopicCountsAndNext(topic: MasteryTopic): MasteryTopic {
  let totalMastered = 0;
  let totalLearning = 0;
  let totalNew = 0;
  let firstUnmastered: {
    point: MapKnowledgePoint;
    moduleName: string;
  } | null = null;

  const updatedModules: MapModule[] = topic.map.modules.map(
    (module, moduleIdx) => {
      let modMastered = 0;
      let modLearning = 0;
      let modNew = 0;
      for (const pt of module.knowledge_points) {
        if (pt.status === 'mastered') {
          modMastered += 1;
          totalMastered += 1;
        } else if (pt.status === 'learning') {
          modLearning += 1;
          totalLearning += 1;
          if (!firstUnmastered) {
            firstUnmastered = { point: pt, moduleName: module.name };
          }
        } else {
          modNew += 1;
          totalNew += 1;
          if (!firstUnmastered) {
            firstUnmastered = { point: pt, moduleName: module.name };
          }
        }
      }
      return {
        ...module,
        order: moduleIdx,
        mastered: modMastered,
        learning: modLearning,
        new_count: modNew,
        total: module.knowledge_points.length,
      };
    },
  );

  const total = totalMastered + totalLearning + totalNew;
  const complete = total > 0 && totalMastered === total;
  const dueReview = topic.reviews.find((r) => r.due);

  const next: MasteryTopic['next'] = dueReview
    ? {
        action: 'review',
        knowledge_point_id: dueReview.knowledge_point_id,
        knowledge_point_name: dueReview.knowledge_point_name,
        module_name:
          updatedModules.find((m) =>
            m.knowledge_points.some(
              (p) => p.id === dueReview.knowledge_point_id,
            ),
          )?.name ?? null,
        reason: dueReview.reason,
      }
    : firstUnmastered
      ? {
          action: 'study',
          knowledge_point_id: firstUnmastered.point.id,
          knowledge_point_name: firstUnmastered.point.name,
          module_name: firstUnmastered.moduleName,
          reason:
            totalMastered === 0 && totalLearning === 0
              ? 'First waypoint on your route.'
              : 'Continue building mastery on the next unlocked waypoint.',
        }
      : {
          action: 'complete',
          knowledge_point_id: null,
          knowledge_point_name: null,
          module_name: null,
          reason: 'Every knowledge point on this route is mastered.',
        };

  return {
    ...topic,
    map: {
      complete,
      counts: {
        mastered: totalMastered,
        learning: totalLearning,
        new_count: totalNew,
        total,
      },
      modules: updatedModules,
    },
    next,
  };
}

export function applyRouteDraftToTopic(
  topic: MasteryTopic,
  draft: TopicDraft,
): MasteryTopic {
  const existingPoints = new Map<string, MapKnowledgePoint>();
  for (const mod of topic.map.modules) {
    for (const pt of mod.knowledge_points) {
      existingPoints.set(pt.id, pt);
    }
  }
  const existingModules = new Map<string, MapModule>();
  for (const mod of topic.map.modules) {
    existingModules.set(mod.id, mod);
  }

  const nextModules: MapModule[] = normalizeRouteModules(draft.modules).map(
    (mod, order) => {
      const prevMod = existingModules.get(mod.id);
      const points: MapKnowledgePoint[] = mod.knowledge_points.map((pt) => {
        const prevPt = existingPoints.get(pt.id);
        return {
          id: pt.id,
          name: pt.name.trim(),
          description: pt.description ?? prevPt?.description ?? '',
          type: pt.type,
          status: prevPt?.status ?? 'new',
          mastery_level: prevPt?.mastery_level ?? 0,
          mastery_source: prevPt?.mastery_source ?? null,
          prerequisites: pt.prerequisites ?? prevPt?.prerequisites ?? [],
          module_id: mod.id,
          next_review_at: prevPt?.next_review_at ?? null,
        };
      });
      return {
        id: mod.id,
        name: mod.name.trim(),
        objective:
          mod.objective?.trim() ||
          prevMod?.objective ||
          `Master ${mod.name.trim()}`,
        order,
        mastered: 0,
        learning: 0,
        new_count: 0,
        total: points.length,
        knowledge_points: points,
      };
    },
  );

  const validPointIds = new Set(
    nextModules.flatMap((m) => m.knowledge_points.map((p) => p.id)),
  );

  const updated: MasteryTopic = {
    ...topic,
    name: draft.name.trim() || topic.name,
    path_revision: topic.path_revision + 1,
    updated_at: '2026-04-21T10:00:00Z',
    metadata: {
      ...topic.metadata,
      description: draft.description.trim(),
    },
    map: {
      ...topic.map,
      modules: nextModules,
    },
    reviews: topic.reviews.filter((r) =>
      validPointIds.has(r.knowledge_point_id),
    ),
  };

  return recomputeTopicCountsAndNext(updated);
}

export interface MasteryCheckpointQuestion {
  id: string;
  knowledgePointId: string;
  knowledgePointName: string;
  header: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    description: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}
