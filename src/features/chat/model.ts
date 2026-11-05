export type SessionType = 'chat' | 'selection_tutor';
export type SessionWorkspaceMode = 'chat' | 'mastery_path' | 'immersive_reading';

export interface LLMSelection {
  provider: string;
  model: string;
}

export interface LLMOption extends LLMSelection {
  id?: string;
  name?: string;
  provider_label?: string;
  model_name?: string;
  is_active_default?: boolean;
  context_window?: number | null;
}

export interface SessionPreferences {
  pinned?: boolean;
  archived?: boolean;
  archived_at?: string | null;
  workspace_id?: string | null;
  mastery_path_id?: string | null;
  reading_workspace_id?: string | null;
  llm?: LLMSelection | null;
  selected_branches?: Record<string, number>;
}

export interface SessionSummary {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string;
  session_type?: SessionType;
  parent_session_id?: string | null;
  workspace_id?: string | null;
  workspace_mode?: SessionWorkspaceMode;
  preferences?: SessionPreferences;
}

export interface SessionOrganizationPatch {
  pinned?: boolean;
  archived?: boolean;
  workspace_id?: string | null;
}

export interface ChatAttachmentSummary {
  id: string;
  name: string;
  sizeLabel: string;
  mimeType: string;
  status: 'ready' | 'invalid';
  errorReason?: string;
}

export interface ChatMessageUsage {
  totalTokens: number;
  latencySeconds: number;
  model: string;
  providerLabel: string;
}

export interface ChatMessageItem {
  id: number;
  parentMessageId: number | null;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  capability?: string | null;
  attachments?: ChatAttachmentSummary[];
  references?: ContextReferenceItem[];
  askUser?: AskUserCardData;
  quiz?: QuizQuestionItem[];
  research?: ResearchCardState;
  toolsUsed?: string[];
  artifacts?: FilePreviewSource[];
  llm?: LLMSelection | null;
  isStreaming?: boolean;
  stopped?: boolean;
  error?: string | null;
  failedSubmission?: boolean;
  usage?: ChatMessageUsage | null;
}

export interface BranchMessage {
  id?: number;
  parentMessageId?: number | null;
}

export interface SiblingInfo {
  total: number;
  index: number;
  siblingIds: number[];
  parentId: number | null;
}

export interface VisiblePathResult<T extends BranchMessage> {
  messages: T[];
  siblingsByMessageId: Map<number, SiblingInfo>;
}

export interface SidebarSessionNode {
  session: SessionSummary;
  children: SidebarSessionNode[];
  isRunning: boolean;
  isPinned: boolean;
}

export interface OrganizedSessions {
  pinned: SidebarSessionNode[];
  recents: SidebarSessionNode[];
}

export interface MasteryTopicLabel {
  id: string;
  title: string;
}

export interface ReadingCollectionLabel {
  id: string;
  title: string;
}

export interface SidebarMasteryGroupEntry {
  kind: 'mastery_group';
  topicId: string;
  title: string;
  sessions: SidebarSessionNode[];
  latestUpdatedAt: string;
  isRunning: boolean;
}

export interface SidebarReadingGroupEntry {
  kind: 'reading_group';
  collectionId: string;
  title: string;
  sessions: SidebarSessionNode[];
  latestUpdatedAt: string;
  isRunning: boolean;
}

export interface SidebarSessionEntry {
  kind: 'session';
  node: SidebarSessionNode;
  latestUpdatedAt: string;
}

export type SidebarEntry =
  | SidebarMasteryGroupEntry
  | SidebarReadingGroupEntry
  | SidebarSessionEntry;

export type ArchivedBucketKey = 'chat' | 'mastery' | 'reading';

export interface ArchivedBucketItem {
  session: SessionSummary;
  containerLabel: string | null;
}

export type ArchiveBuckets = Record<ArchivedBucketKey, ArchivedBucketItem[]>;

export type StarterGroupId = 'explain' | 'solve' | 'practice' | 'plan' | 'research';

export interface StarterPromptItem {
  id: string;
  labelKey: string;
  promptKey: string;
}

export interface StarterGroup {
  id: StarterGroupId;
  labelKey: string;
  prompts: StarterPromptItem[];
}

export interface ChatCapabilityOption {
  id: 'chat' | 'solve' | 'question' | 'research' | 'animator' | 'visualize';
  labelKey: string;
  descriptionKey: string;
  availableInMilestone: 'M3.1' | 'M3.2' | 'M5';
}

export const STARTER_GROUPS: StarterGroup[] = [
  {
    id: 'explain',
    labelKey: 'starters.explain',
    prompts: [
      { id: 'explain-1', labelKey: 'starters.explain.1', promptKey: 'starters.explain.1.prompt' },
      { id: 'explain-2', labelKey: 'starters.explain.2', promptKey: 'starters.explain.2.prompt' },
      { id: 'explain-3', labelKey: 'starters.explain.3', promptKey: 'starters.explain.3.prompt' },
      { id: 'explain-4', labelKey: 'starters.explain.4', promptKey: 'starters.explain.4.prompt' },
    ],
  },
  {
    id: 'solve',
    labelKey: 'starters.solve',
    prompts: [
      { id: 'solve-1', labelKey: 'starters.solve.1', promptKey: 'starters.solve.1.prompt' },
      { id: 'solve-2', labelKey: 'starters.solve.2', promptKey: 'starters.solve.2.prompt' },
      { id: 'solve-3', labelKey: 'starters.solve.3', promptKey: 'starters.solve.3.prompt' },
      { id: 'solve-4', labelKey: 'starters.solve.4', promptKey: 'starters.solve.4.prompt' },
    ],
  },
  {
    id: 'practice',
    labelKey: 'starters.practice',
    prompts: [
      { id: 'practice-1', labelKey: 'starters.practice.1', promptKey: 'starters.practice.1.prompt' },
      { id: 'practice-2', labelKey: 'starters.practice.2', promptKey: 'starters.practice.2.prompt' },
      { id: 'practice-3', labelKey: 'starters.practice.3', promptKey: 'starters.practice.3.prompt' },
      { id: 'practice-4', labelKey: 'starters.practice.4', promptKey: 'starters.practice.4.prompt' },
    ],
  },
  {
    id: 'plan',
    labelKey: 'starters.plan',
    prompts: [
      { id: 'plan-1', labelKey: 'starters.plan.1', promptKey: 'starters.plan.1.prompt' },
      { id: 'plan-2', labelKey: 'starters.plan.2', promptKey: 'starters.plan.2.prompt' },
      { id: 'plan-3', labelKey: 'starters.plan.3', promptKey: 'starters.plan.3.prompt' },
      { id: 'plan-4', labelKey: 'starters.plan.4', promptKey: 'starters.plan.4.prompt' },
    ],
  },
  {
    id: 'research',
    labelKey: 'starters.research',
    prompts: [
      { id: 'research-1', labelKey: 'starters.research.1', promptKey: 'starters.research.1.prompt' },
      { id: 'research-2', labelKey: 'starters.research.2', promptKey: 'starters.research.2.prompt' },
      { id: 'research-3', labelKey: 'starters.research.3', promptKey: 'starters.research.3.prompt' },
      { id: 'research-4', labelKey: 'starters.research.4', promptKey: 'starters.research.4.prompt' },
    ],
  },
];

export const CHAT_CAPABILITY_OPTIONS: ChatCapabilityOption[] = [
  {
    id: 'chat',
    labelKey: 'Chat',
    descriptionKey: 'Flexible conversation with any tool',
    availableInMilestone: 'M3.1',
  },
  {
    id: 'solve',
    labelKey: 'Deep Solve',
    descriptionKey: 'Multi-step reasoning & problem solving',
    availableInMilestone: 'M3.2',
  },
  {
    id: 'question',
    labelKey: 'Quiz Generation',
    descriptionKey: 'Auto-validated question generation',
    availableInMilestone: 'M3.2',
  },
  {
    id: 'research',
    labelKey: 'Deep Research',
    descriptionKey: 'Comprehensive multi-agent research',
    availableInMilestone: 'M3.2',
  },
  {
    id: 'visualize',
    labelKey: 'Visualize',
    descriptionKey: 'Charts, diagrams or a math animation',
    availableInMilestone: 'M5',
  },
  {
    id: 'animator',
    labelKey: 'Math Animator',
    descriptionKey: 'Turn a question into an animated explainer you can play',
    availableInMilestone: 'M5',
  },
];

export const PLACEHOLDER_SESSION_TITLES = new Set(['', 'New conversation']);

export function isPlaceholderSessionTitle(title: string | null | undefined): boolean {
  return PLACEHOLDER_SESSION_TITLES.has((title ?? '').trim());
}

export function displaySessionTitle(
  title: string | null | undefined,
  placeholderLabel: string,
): string {
  const trimmed = (title ?? '').trim();
  return isPlaceholderSessionTitle(trimmed) ? placeholderLabel : trimmed;
}

export function llmSelectionKey(selection: LLMSelection | null | undefined): string {
  if (!selection?.provider || !selection?.model) return '';
  return `${selection.provider}::${selection.model}`;
}

export function sameLLMSelection(
  a: LLMSelection | null | undefined,
  b: LLMSelection | null | undefined,
): boolean {
  return llmSelectionKey(a) === llmSelectionKey(b);
}

export function formatContextWindow(value: number | null | undefined): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M ctx`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k ctx`;
  }
  return `${value} ctx`;
}

export function masteryPathIdOf(session: SessionSummary): string | null {
  if (session.workspace_mode !== 'mastery_path') return null;
  const raw = session.preferences?.mastery_path_id;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

export function readingWorkspaceIdOf(session: SessionSummary): string | null {
  if (session.workspace_mode !== 'immersive_reading') return null;
  const raw = session.preferences?.reading_workspace_id;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

export function sessionRoute(session: SessionSummary): string {
  const pathId = masteryPathIdOf(session);
  if (pathId) {
    return `/learning/paths/${encodeURIComponent(pathId)}?session=${encodeURIComponent(session.session_id)}`;
  }
  const readingWorkspaceId = readingWorkspaceIdOf(session);
  if (readingWorkspaceId) {
    return `/learning/reading/${encodeURIComponent(readingWorkspaceId)}?session=${encodeURIComponent(session.session_id)}`;
  }
  return `/chat/${encodeURIComponent(session.session_id)}`;
}

function isPinned(session: SessionSummary): boolean {
  return Boolean(session.preferences?.pinned);
}

function isArchived(session: SessionSummary): boolean {
  return Boolean(session.preferences?.archived);
}

function sortRootNodes(nodes: SidebarSessionNode[]): SidebarSessionNode[] {
  return [...nodes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.isRunning !== b.isRunning) return a.isRunning ? -1 : 1;
    return b.session.updated_at.localeCompare(a.session.updated_at);
  });
}

function sortChildNodes(nodes: SidebarSessionNode[]): SidebarSessionNode[] {
  return [...nodes].sort((a, b) => {
    if (a.isRunning !== b.isRunning) return a.isRunning ? -1 : 1;
    return b.session.updated_at.localeCompare(a.session.updated_at);
  });
}

export function organizeSessionTree(
  sessions: SessionSummary[],
  nested = true,
  liveSessionIds: ReadonlySet<string> = new Set(),
): OrganizedSessions {
  const activeSessions = sessions.filter((s) => !isArchived(s));
  const byId = new Map<string, SidebarSessionNode>();

  for (const session of activeSessions) {
    byId.set(session.session_id, {
      session,
      children: [],
      isRunning: liveSessionIds.has(session.session_id),
      isPinned: isPinned(session),
    });
  }

  const roots: SidebarSessionNode[] = [];
  for (const node of byId.values()) {
    const parentId = nested ? node.session.parent_session_id : null;
    if (
      parentId &&
      parentId !== node.session.session_id &&
      byId.has(parentId)
    ) {
      let ancestor: string | null | undefined = parentId;
      let hasCycle = false;
      const visited = new Set<string>([node.session.session_id]);
      while (ancestor && byId.has(ancestor)) {
        if (visited.has(ancestor)) {
          hasCycle = true;
          break;
        }
        visited.add(ancestor);
        ancestor = byId.get(ancestor)?.session.parent_session_id;
      }
      if (!hasCycle) {
        byId.get(parentId)!.children.push(node);
        continue;
      }
    }
    roots.push(node);
  }

  const finalizeNode = (node: SidebarSessionNode): SidebarSessionNode => {
    const children = sortChildNodes(node.children.map(finalizeNode));
    const childRunning = children.some((c) => c.isRunning);
    return {
      ...node,
      children,
      isRunning: node.isRunning || childRunning,
    };
  };

  const finalizedRoots = sortRootNodes(roots.map(finalizeNode));
  return {
    pinned: finalizedRoots.filter((node) => node.isPinned),
    recents: finalizedRoots.filter((node) => !node.isPinned),
  };
}

export function sidebarEntryOrderKey(entry: SidebarEntry): string {
  if (entry.kind === 'mastery_group') return `mastery:${entry.topicId}`;
  if (entry.kind === 'reading_group') return `reading:${entry.collectionId}`;
  return `session:${entry.node.session.session_id}`;
}

export function buildSidebarEntries({
  roots,
  recents,
  masteryTopics,
  readingCollections = [],
  manualOrder = [],
}: {
  roots?: SidebarSessionNode[];
  recents?: SidebarSessionNode[];
  masteryTopics: MasteryTopicLabel[];
  readingCollections?: ReadingCollectionLabel[];
  manualOrder?: string[];
}): SidebarEntry[] {
  const sourceNodes = roots ?? recents ?? [];
  const topicTitleById = new Map<string, string>();
  for (const topic of masteryTopics) {
    if (topic.id && topic.title) topicTitleById.set(topic.id, topic.title);
  }
  const readingTitleById = new Map<string, string>();
  for (const col of readingCollections) {
    if (col.id && col.title) readingTitleById.set(col.id, col.title);
  }

  const groupedByTopic = new Map<string, SidebarSessionNode[]>();
  const groupedByReading = new Map<string, SidebarSessionNode[]>();
  const looseNodes: SidebarSessionNode[] = [];

  for (const node of sourceNodes) {
    const pathId = masteryPathIdOf(node.session);
    if (pathId && topicTitleById.has(pathId)) {
      const list = groupedByTopic.get(pathId) ?? [];
      list.push(node);
      groupedByTopic.set(pathId, list);
      continue;
    }
    const collectionId = readingWorkspaceIdOf(node.session);
    if (collectionId && readingTitleById.has(collectionId)) {
      const list = groupedByReading.get(collectionId) ?? [];
      list.push(node);
      groupedByReading.set(collectionId, list);
      continue;
    }
    looseNodes.push(node);
  }

  const entries: SidebarEntry[] = [];

  for (const [topicId, nodes] of groupedByTopic.entries()) {
    const sorted = [...nodes].sort((a, b) => {
      if (a.isRunning !== b.isRunning) return a.isRunning ? -1 : 1;
      return b.session.updated_at.localeCompare(a.session.updated_at);
    });
    const latestUpdatedAt = sorted.reduce(
      (max, n) => (n.session.updated_at > max ? n.session.updated_at : max),
      '',
    );
    const isRunning = sorted.some((n) => n.isRunning);
    entries.push({
      kind: 'mastery_group',
      topicId,
      title: topicTitleById.get(topicId) ?? topicId,
      sessions: sorted,
      latestUpdatedAt,
      isRunning,
    });
  }

  for (const [collectionId, nodes] of groupedByReading.entries()) {
    const sorted = [...nodes].sort((a, b) => {
      if (a.isRunning !== b.isRunning) return a.isRunning ? -1 : 1;
      return b.session.updated_at.localeCompare(a.session.updated_at);
    });
    const latestUpdatedAt = sorted.reduce(
      (max, n) => (n.session.updated_at > max ? n.session.updated_at : max),
      '',
    );
    const isRunning = sorted.some((n) => n.isRunning);
    entries.push({
      kind: 'reading_group',
      collectionId,
      title: readingTitleById.get(collectionId) ?? collectionId,
      sessions: sorted,
      latestUpdatedAt,
      isRunning,
    });
  }

  for (const node of looseNodes) {
    entries.push({
      kind: 'session',
      node,
      latestUpdatedAt: node.session.updated_at,
    });
  }

  const entryPinned = (e: SidebarEntry): boolean =>
    e.kind === 'session' ? e.node.isPinned : e.sessions.some((s) => s.isPinned);

  const entryRunning = (e: SidebarEntry): boolean =>
    e.kind === 'session' ? e.node.isRunning : e.isRunning;

  const manualRank = new Map<string, number>();
  manualOrder.forEach((key, idx) => {
    if (!manualRank.has(key)) manualRank.set(key, idx);
  });

  entries.sort((a, b) => {
    const aPinned = entryPinned(a);
    const bPinned = entryPinned(b);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    const aRank = manualRank.get(sidebarEntryOrderKey(a));
    const bRank = manualRank.get(sidebarEntryOrderKey(b));
    if (aRank !== undefined && bRank !== undefined && aRank !== bRank) {
      return aRank - bRank;
    }
    const aRunning = entryRunning(a);
    const bRunning = entryRunning(b);
    if (aRunning !== bRunning) return aRunning ? -1 : 1;
    return b.latestUpdatedAt.localeCompare(a.latestUpdatedAt);
  });

  return entries;
}

export function collectArchivedConversations({
  sessions,
  masteryTopics = [],
  readingCollections = [],
}: {
  sessions: SessionSummary[];
  masteryTopics?: MasteryTopicLabel[];
  readingCollections?: ReadingCollectionLabel[];
}): ArchiveBuckets {
  const topicTitleById = new Map<string, string>();
  for (const t of masteryTopics) {
    if (t.id && t.title) topicTitleById.set(t.id, t.title);
  }
  const readingTitleById = new Map<string, string>();
  for (const c of readingCollections) {
    if (c.id && c.title) readingTitleById.set(c.id, c.title);
  }

  const buckets: ArchiveBuckets = {
    chat: [],
    mastery: [],
    reading: [],
  };

  const archived = sessions
    .filter((s) => Boolean(s.preferences?.archived))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  for (const session of archived) {
    const pathId = masteryPathIdOf(session);
    if (pathId) {
      buckets.mastery.push({
        session,
        containerLabel: topicTitleById.get(pathId) ?? null,
      });
      continue;
    }
    const collectionId = readingWorkspaceIdOf(session);
    if (collectionId) {
      buckets.reading.push({
        session,
        containerLabel: readingTitleById.get(collectionId) ?? null,
      });
      continue;
    }
    buckets.chat.push({ session, containerLabel: null });
  }

  return buckets;
}

export function archiveCount(buckets: ArchiveBuckets): number {
  return buckets.chat.length + buckets.mastery.length + buckets.reading.length;
}

const ROOT_KEY = 'null';
const OPTIMISTIC_RANK_OFFSET = 1e15;

function parentKey(id: number | null | undefined): string {
  return id == null ? ROOT_KEY : String(id);
}

function siblingRank(message: BranchMessage): number {
  const id = message.id ?? 0;
  return id < 0 ? OPTIMISTIC_RANK_OFFSET - id : id;
}

function walkStartKey<T extends BranchMessage>(
  allMessages: T[],
  childrenByParent: Map<string, T[]>,
): string {
  if ((childrenByParent.get(ROOT_KEY)?.length ?? 0) > 0) return ROOT_KEY;
  const known = new Set<number>();
  for (const msg of allMessages) {
    if (msg.id !== undefined) known.add(msg.id);
  }
  const orphans = allMessages.filter(
    (m) => m.id !== undefined && m.parentMessageId != null && !known.has(m.parentMessageId),
  );
  const seeds = orphans.length > 0 ? orphans : allMessages.filter((m) => m.id !== undefined);
  if (seeds.length === 0) return ROOT_KEY;
  const oldest = seeds.reduce((a, b) => (siblingRank(b) < siblingRank(a) ? b : a));
  return parentKey(oldest.parentMessageId);
}

function downstreamDepth<T extends BranchMessage>(
  startParentKey: string,
  childrenByParent: Map<string, T[]>,
  depthByParent: Map<string, number>,
  activeParents: Set<string>,
): number {
  const cached = depthByParent.get(startParentKey);
  if (cached !== undefined) return cached;
  if (activeParents.has(startParentKey)) return 0;

  const frame = (key: string) => ({
    key,
    children: childrenByParent.get(key) ?? [],
    index: 0,
    depth: 0,
  });
  const stack = [frame(startParentKey)];
  activeParents.add(startParentKey);
  while (stack.length) {
    const current = stack[stack.length - 1];
    const child = current.children[current.index++];
    if (!child) {
      stack.pop();
      activeParents.delete(current.key);
      depthByParent.set(current.key, current.depth);
      if (!stack.length) return current.depth;
      const parent = stack[stack.length - 1];
      parent.depth = Math.max(parent.depth, 1 + current.depth);
      continue;
    }
    if (child.id === undefined) {
      current.depth = Math.max(current.depth, 1);
      continue;
    }
    const key = String(child.id);
    const depth = depthByParent.get(key);
    if (depth !== undefined || activeParents.has(key)) {
      current.depth = Math.max(current.depth, 1 + (depth ?? 0));
    } else {
      activeParents.add(key);
      stack.push(frame(key));
    }
  }
  return 0;
}

export function buildVisiblePath<T extends BranchMessage>(
  allMessages: T[],
  selectedBranches: Record<string, number> | undefined,
): VisiblePathResult<T> {
  const childrenByParent = new Map<string, T[]>();
  for (const msg of allMessages) {
    if (msg.id === undefined) continue;
    const key = parentKey(msg.parentMessageId);
    const arr = childrenByParent.get(key);
    if (arr) arr.push(msg);
    else childrenByParent.set(key, [msg]);
  }
  for (const arr of childrenByParent.values()) {
    arr.sort((a, b) => siblingRank(a) - siblingRank(b));
  }

  const selection = selectedBranches ?? {};
  const visible: T[] = [];
  const siblingsByMessageId = new Map<number, SiblingInfo>();
  const depthByParent = new Map<string, number>();
  const guard = new Set<string>();
  let currentParent = walkStartKey(allMessages, childrenByParent);
  let safety = 10_000;

  while (safety > 0) {
    safety -= 1;
    if (guard.has(currentParent)) break;
    guard.add(currentParent);
    const children = childrenByParent.get(currentParent);
    if (!children || children.length === 0) break;

    let chosen: T;
    if (children.length === 1) {
      chosen = children[0];
    } else {
      const selectedId = selection[currentParent];
      const selected =
        selectedId !== undefined ? children.find((c) => c.id === selectedId) : undefined;
      if (selected) {
        chosen = selected;
      } else {
        chosen = children[0];
        let chosenDepth = -1;
        for (const child of children) {
          const depth =
            child.id === undefined
              ? 1
              : 1 + downstreamDepth(String(child.id), childrenByParent, depthByParent, new Set());
          if (depth >= chosenDepth) {
            chosen = child;
            chosenDepth = depth;
          }
        }
      }
    }
    visible.push(chosen);

    if (children.length > 1 && chosen.id !== undefined) {
      const idx = children.findIndex((c) => c.id === chosen.id);
      siblingsByMessageId.set(chosen.id, {
        total: children.length,
        index: idx + 1,
        siblingIds: children.map((c) => c.id!).filter((id) => id !== undefined),
        parentId: chosen.parentMessageId ?? null,
      });
    }

    if (chosen.id === undefined) break;
    currentParent = String(chosen.id);
  }

  return { messages: visible, siblingsByMessageId };
}

export function selectChildBranch(
  selectedBranches: Record<string, number>,
  parentId: number | null,
  childId: number,
): Record<string, number> {
  return {
    ...selectedBranches,
    [parentKey(parentId)]: childId,
  };
}

export function latestChildId(
  allMessages: BranchMessage[],
  parentId: number | null,
): number | null {
  const key = parentKey(parentId);
  let best: number | null = null;
  let bestId = 0;
  for (const m of allMessages) {
    if (parentKey(m.parentMessageId) !== key) continue;
    if (m.id === undefined || m.id <= 0) continue;
    if (m.id > bestId) {
      bestId = m.id;
      best = m.id;
    }
  }
  return best;
}

export function tipMessageId(visible: BranchMessage[]): number | null {
  for (let i = visible.length - 1; i >= 0; i -= 1) {
    const id = visible[i].id;
    if (id !== undefined) return id;
  }
  return null;
}

export type HistoryTypeFilter = 'all' | 'chat' | 'selection_tutor';
export type HistoryArchiveFilter = 'active' | 'archived' | 'all';

export function filterChatHistorySessions(
  sessions: SessionSummary[],
  messagesBySession: Record<string, ChatMessageItem[]>,
  {
    query,
    typeFilter,
    archiveFilter,
    workspaceId,
  }: {
    query: string;
    typeFilter: HistoryTypeFilter;
    archiveFilter: HistoryArchiveFilter;
    workspaceId?: string;
  },
): SessionSummary[] {
  const normalizedQuery = query.trim().toLowerCase();
  return sessions.filter((s) => {
    if (workspaceId !== undefined) {
      const sessionWs = s.workspace_id ?? '';
      if (sessionWs !== workspaceId) return false;
    }
    const archived = Boolean(s.preferences?.archived);
    if (archiveFilter === 'active' && archived) return false;
    if (archiveFilter === 'archived' && !archived) return false;

    const sessionType = s.session_type ?? 'chat';
    if (typeFilter !== 'all' && sessionType !== typeFilter) return false;

    if (!normalizedQuery) return true;
    const titleMatch = (s.title || '').toLowerCase().includes(normalizedQuery);
    const previewMatch = (s.last_message_preview || '').toLowerCase().includes(normalizedQuery);
    const messageMatch = (messagesBySession[s.session_id] ?? []).some((m) =>
      m.content.toLowerCase().includes(normalizedQuery),
    );
    return titleMatch || previewMatch || messageMatch;
  });
}

export function exportSessionMarkdown(
  session: SessionSummary,
  messages: ChatMessageItem[],
  placeholderLabel = 'New chat',
): string {
  const title = displaySessionTitle(session.title, placeholderLabel);
  const lines = [`# ${title}`, ''];
  for (const msg of messages) {
    const heading = msg.role === 'user' ? '## User' : '## Assistant';
    lines.push(heading, '', msg.content, '');
  }
  return lines.join('\n').trim() + '\n';
}

export function formatRelativeSessionTime(isoString: string): string {
  if (!isoString) return 'just now';
  if (isoString.startsWith('2026-04-20')) return 'Today';
  if (isoString.startsWith('2026-04-19') || isoString.startsWith('2026-04-18')) return 'Within a week';
  return isoString.slice(0, 10);
}

// ============================================================================
// M3.2 Advanced Chat Interactions Contracts & Pure Helpers
// ============================================================================

export type PreviewKind =
  | 'markdown'
  | 'code'
  | 'text'
  | 'pdf'
  | 'image'
  | 'svg'
  | 'docx'
  | 'xlsx'
  | 'office-text'
  | 'fallback';

export interface FilePreviewSource {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  origin: 'attachment' | 'artifact' | 'workspace';
  ownerSessionId?: string;
  pageNumber?: number;
  content?: string;
  tableRows?: string[][];
  status?: 'ready' | 'loading' | 'empty' | 'error';
  errorMessage?: string;
}

const CODE_EXTENSIONS = new Set([
  'py',
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'sh',
  'sql',
  'c',
  'cpp',
  'rs',
  'go',
  'java',
  'yaml',
  'yml',
]);

export function previewKindFor(
  filename?: string | null,
  mimeType?: string | null,
): PreviewKind {
  const lowerName = (filename ?? '').trim().toLowerCase();
  const ext = lowerName.includes('.')
    ? lowerName.split('.').pop() ?? ''
    : '';
  const lowerMime = (mimeType ?? '').trim().toLowerCase();

  if (ext === 'md' || ext === 'markdown' || lowerMime === 'text/markdown') {
    return 'markdown';
  }
  if (CODE_EXTENSIONS.has(ext) || lowerMime.includes('javascript') || lowerMime.includes('python')) {
    return 'code';
  }
  if (ext === 'pdf' || lowerMime === 'application/pdf') {
    return 'pdf';
  }
  if (ext === 'svg' || lowerMime === 'image/svg+xml') {
    return 'svg';
  }
  if (
    ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) ||
    (lowerMime.startsWith('image/') && lowerMime !== 'image/svg+xml')
  ) {
    return 'image';
  }
  if (
    ext === 'docx' ||
    lowerMime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  if (
    ext === 'xlsx' ||
    ext === 'csv' ||
    lowerMime ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    lowerMime === 'text/csv'
  ) {
    return 'xlsx';
  }
  if (ext === 'pptx' || ext === 'doc' || lowerMime.includes('presentation')) {
    return 'office-text';
  }
  if (
    ['txt', 'log', 'tex'].includes(ext) ||
    lowerMime.startsWith('text/')
  ) {
    return 'text';
  }
  return 'fallback';
}

export function formatBytes(bytes?: number | null): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export type ContextReferenceKind = 'kb' | 'favorite' | 'note' | 'history';

export interface ContextReferenceItem {
  id: string;
  kind: ContextReferenceKind;
  label: string;
  subtitle?: string;
  sourceId: string;
  status?: 'valid' | 'unavailable';
}

export type QuizQuestionType = 'choice' | 'true_false' | 'fill_blank' | 'written';
export type QuizDifficulty = 'auto' | 'easy' | 'medium' | 'hard';

export interface DeepQuestionFormConfig {
  mode: 'custom' | 'mimic';
  totalCount: number;
  difficulty: QuizDifficulty;
  selectedTypes: QuizQuestionType[];
  typeCounts: Record<QuizQuestionType, number>;
  mimicPaperTitle?: string;
}

const ALL_QUIZ_TYPES: QuizQuestionType[] = [
  'choice',
  'true_false',
  'fill_blank',
  'written',
];

export function rebalanceQuizCounts(
  totalCount: number,
  selectedTypes: QuizQuestionType[],
): Record<QuizQuestionType, number> {
  const clampedTotal = Math.max(0, Math.min(50, Math.round(totalCount)));
  const counts: Record<QuizQuestionType, number> = {
    choice: 0,
    true_false: 0,
    fill_blank: 0,
    written: 0,
  };
  const active = ALL_QUIZ_TYPES.filter((t) => selectedTypes.includes(t));
  if (active.length === 0 || clampedTotal === 0) return counts;

  const base = Math.floor(clampedTotal / active.length);
  let remainder = clampedTotal % active.length;
  for (const t of active) {
    counts[t] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }
  return counts;
}

export function validateQuizConfig(config: DeepQuestionFormConfig): string[] {
  const errors: string[] = [];
  if (config.totalCount < 1 || config.totalCount > 50) {
    errors.push('Total question count must be between 1 and 50.');
  }
  if (config.selectedTypes.length === 0) {
    errors.push('Select at least one question type.');
  }
  const sum = Object.values(config.typeCounts).reduce((a, b) => a + b, 0);
  if (config.selectedTypes.length > 0 && sum !== config.totalCount) {
    errors.push(`Type mix sum (${sum}) must equal total count (${config.totalCount}).`);
  }
  if (config.mode === 'mimic' && !(config.mimicPaperTitle ?? '').trim()) {
    errors.push('Select or enter a reference exam paper for Mimic mode.');
  }
  return errors;
}

export function summarizeQuizConfig(config: DeepQuestionFormConfig): string {
  const modeLabel = config.mode === 'mimic' ? 'Mimic Paper' : 'Custom Quiz';
  return `${modeLabel} · ${config.totalCount} Qs · ${config.difficulty.toUpperCase()} · ${config.selectedTypes.length} types`;
}

export type ResearchMode =
  | 'study_notes'
  | 'report'
  | 'comparison'
  | 'learning_path';
export type ResearchDepth = 'quick' | 'standard' | 'deep' | 'manual';

export interface DeepResearchFormConfig {
  mode: ResearchMode;
  depth: ResearchDepth;
  subtopics: number;
  iterations: number;
}

export function validateResearchConfig(
  config: DeepResearchFormConfig,
): string[] {
  const errors: string[] = [];
  if (config.subtopics < 1 || config.subtopics > 10) {
    errors.push('Sub-topics count must be between 1 and 10.');
  }
  if (config.iterations < 1 || config.iterations > 8) {
    errors.push('Iterations count must be between 1 and 8.');
  }
  return errors;
}

export function summarizeResearchConfig(
  config: DeepResearchFormConfig,
): string {
  const modeMap: Record<ResearchMode, string> = {
    study_notes: 'Study Notes',
    report: 'Technical Report',
    comparison: 'Comparative Analysis',
    learning_path: 'Learning Path Brief',
  };
  return `${modeMap[config.mode]} · ${config.depth.toUpperCase()} (${config.subtopics} sub-topics, ${config.iterations} iters)`;
}

export interface AskUserOption {
  id: string;
  label: string;
  description?: string;
}

export interface AskUserQuestion {
  id: string;
  header: string;
  prompt: string;
  multiSelect?: boolean;
  allowFreeText?: boolean;
  options: AskUserOption[];
}

export interface AskUserAnswer {
  questionId: string;
  selectedOptionIds: string[];
  freeText?: string;
  skipped?: boolean;
}

export interface AskUserCardData {
  id: string;
  title: string;
  status: 'pending' | 'submitted' | 'error';
  questions: AskUserQuestion[];
  answers: Record<string, AskUserAnswer>;
  errorMessage?: string;
}

export interface QuizQuestionItem {
  id: string;
  index: number;
  type: QuizQuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  referenceExplanation: string;
  aiJudgmentHint: string;
}

export interface QuizQuestionUserState {
  userAnswer: string;
  submitted: boolean;
  isCorrect?: boolean;
  bookmarked?: boolean;
  category?: string;
  attachedImageName?: string | null;
}

export function isQuizAnswerCorrect(
  question: QuizQuestionItem,
  userAnswer: string,
): boolean {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedExpected = question.correctAnswer.trim().toLowerCase();
  if (!normalizedUser) return false;
  if (question.type === 'written') {
    // Written answers pass if they include key terms or at least 12 characters
    return (
      normalizedUser.includes(normalizedExpected) ||
      normalizedUser.length >= 12
    );
  }
  return normalizedUser === normalizedExpected;
}

export interface ResearchOutlineItem {
  id: string;
  title: string;
  overview: string;
}

export interface ResearchCitationItem {
  id: string;
  index: number;
  title: string;
  source: string;
  snippet: string;
}

export interface ResearchCardState {
  id: string;
  topic: string;
  status: 'editing' | 'running' | 'completed' | 'error';
  outline: ResearchOutlineItem[];
  reportMarkdown?: string;
  citations?: ResearchCitationItem[];
  errorMessage?: string;
}

export type ViewerTabKind =
  | 'activity'
  | 'file'
  | 'web'
  | 'markdown-note'
  | 'quiz-followup'
  | 'unsupported';

export interface ViewerTab {
  id: string;
  kind: ViewerTabKind;
  title: string;
  closable: boolean;
  fileId?: string;
  url?: string;
  quizQuestionId?: string;
  quizQuestionPrompt?: string;
  unsupportedReason?: string;
}

export interface SessionActivitySummary {
  toolsUsed: string[];
  knowledgeBases: ContextReferenceItem[];
  spaceReferences: ContextReferenceItem[];
  attachments: ChatAttachmentSummary[];
  artifacts: FilePreviewSource[];
  activeCapability?: string | null;
}

export function buildSessionActivity(
  messages: ChatMessageItem[],
  draftReferences: ContextReferenceItem[] = [],
  activeCapability: string | null = null,
): SessionActivitySummary {
  const toolsSet = new Set<string>();
  const kbMap = new Map<string, ContextReferenceItem>();
  const spaceMap = new Map<string, ContextReferenceItem>();
  const attachments: ChatAttachmentSummary[] = [];
  const artifactMap = new Map<string, FilePreviewSource>();

  for (const ref of draftReferences) {
    if (ref.kind === 'kb') kbMap.set(ref.id, ref);
    else spaceMap.set(ref.id, ref);
  }

  for (const msg of messages) {
    if (msg.capability && msg.capability !== 'chat') {
      toolsSet.add(msg.capability);
    }
    for (const tool of msg.toolsUsed ?? []) {
      toolsSet.add(tool);
    }
    for (const ref of msg.references ?? []) {
      if (ref.kind === 'kb') kbMap.set(ref.id, ref);
      else spaceMap.set(ref.id, ref);
    }
    for (const att of msg.attachments ?? []) {
      attachments.push(att);
    }
    for (const art of msg.artifacts ?? []) {
      artifactMap.set(art.id, art);
    }
  }

  return {
    toolsUsed: Array.from(toolsSet),
    knowledgeBases: Array.from(kbMap.values()),
    spaceReferences: Array.from(spaceMap.values()),
    attachments,
    artifacts: Array.from(artifactMap.values()),
    activeCapability,
  };
}

