/**
 * M3.2 Favorites / Saved Originals domain model (`MS-FAVORITES`, `MS-FAVORITES-DETAIL`, `UI-FAVORITES-SAVE`).
 * Mirrors audited web source:
 * - `web/components/notebook/NotebookConsole.tsx`
 * - `web/components/notebook/NotebookRecordRow.tsx`
 * - `web/components/notebook/SaveToNotebookModal.tsx`
 * - `web/lib/favorite-content.ts`
 *
 * Pure TypeScript module with zero React Native or network imports.
 */

export const SWATCHES: readonly string[] = [
  '#6366F1',
  '#4F86F7',
  '#1FB5A8',
  '#43B05C',
  '#EAA221',
  '#F07B3F',
  '#E8577A',
  '#8E6CF0',
  '#6B7A90',
];

export const DEFAULT_NOTEBOOK_COLOR = SWATCHES[0];

export type FavoriteRecordType =
  | 'solve'
  | 'question'
  | 'research'
  | 'chat'
  | 'reading'
  | 'co_writer'
  | 'tutorbot';

export type FavoriteKind =
  | 'chat'
  | 'question'
  | 'solve'
  | 'research'
  | 'reading'
  | 'co_writer'
  | 'tutorbot';

export interface NotebookSummary {
  id: string;
  name: string;
  description?: string;
  color: string;
  record_count: number;
  updated_at: number;
  unreadable?: boolean;
  workspace_id?: string;
}

export interface NotebookRecordItem {
  id: string;
  notebook_id: string;
  type: FavoriteRecordType;
  title: string;
  user_query: string;
  summary?: string;
  output: string;
  created_at: number;
  metadata?: Record<string, unknown>;
}

export interface NotebookSavePayload {
  recordType: FavoriteRecordType;
  title: string;
  userQuery: string;
  output: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  kbName?: string | null;
}

export interface NotebookSaveMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  capability?: string;
}

export const FAVORITE_KIND_LABELS: Record<FavoriteKind, string> = {
  chat: 'Chat',
  question: 'Question',
  solve: 'Solution',
  research: 'Research',
  reading: 'Reading',
  co_writer: 'Learning notebook',
  tutorbot: 'Partner',
};

export function favoriteKind(
  type: FavoriteRecordType | string,
  metadata?: Record<string, unknown>,
): FavoriteKind {
  if (metadata?.source_surface === 'reading' || type === 'reading') {
    return 'reading';
  }
  if (
    type === 'question' ||
    type === 'solve' ||
    type === 'research' ||
    type === 'chat' ||
    type === 'co_writer' ||
    type === 'tutorbot'
  ) {
    return type;
  }
  return 'chat';
}

export function filterNotebooks(
  notebooks: readonly NotebookSummary[],
  recordsByNotebook: Record<string, readonly NotebookRecordItem[]>,
  query: string,
): NotebookSummary[] {
  const needle = query.trim().toLowerCase();
  const sorted = [...notebooks].sort(
    (a, b) => (b.updated_at ?? 0) - (a.updated_at ?? 0),
  );
  if (!needle) return sorted;
  return sorted.filter((nb) => {
    const records = recordsByNotebook[nb.id] ?? [];
    const haystack = [
      nb.name,
      nb.description ?? '',
      ...records.map((r) => `${r.title} ${r.summary ?? ''}`),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function filterNotebookRecords(
  records: readonly NotebookRecordItem[],
  query: string,
  kindFilter: string,
): NotebookRecordItem[] {
  const needle = query.trim().toLowerCase();
  return [...records]
    .sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))
    .filter((rec) => {
      if (kindFilter && kindFilter !== 'all') {
        if (favoriteKind(rec.type, rec.metadata) !== kindFilter) {
          return false;
        }
      }
      if (!needle) return true;
      const haystack = [
        rec.title,
        rec.summary ?? '',
        rec.user_query,
        rec.output,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
}

export function buildTranscriptFromMessages(
  messages: readonly NotebookSaveMessage[],
): string {
  return messages
    .map((msg) => {
      const role =
        msg.role === 'user'
          ? 'User'
          : msg.role === 'assistant'
            ? 'Assistant'
            : 'System';
      return `## ${role}\n${msg.content}`;
    })
    .join('\n\n');
}

export function buildUserQueryFromMessages(
  messages: readonly NotebookSaveMessage[],
): string {
  return messages
    .filter((msg) => msg.role === 'user')
    .map((msg) => msg.content)
    .join('\n\n');
}

export function deriveSaveTitle(
  messages: readonly NotebookSaveMessage[],
  fallback: string,
): string {
  const firstUser = messages.find((msg) => msg.role === 'user');
  const candidate = firstUser?.content.trim();
  if (!candidate) return fallback;
  return candidate.slice(0, 80);
}

export function indexesForLastTurns(
  messages: readonly NotebookSaveMessage[],
  turnCount: number,
): number[] {
  if (messages.length === 0 || turnCount <= 0) return [];
  const userPositions: number[] = [];
  messages.forEach((msg, idx) => {
    if (msg.role === 'user') userPositions.push(idx);
  });
  if (userPositions.length === 0) {
    return messages.map((_, idx) => idx);
  }
  const startUserIdx = Math.max(0, userPositions.length - turnCount);
  const startMessageIdx = userPositions[startUserIdx];
  const result: number[] = [];
  for (let i = startMessageIdx; i < messages.length; i += 1) {
    result.push(i);
  }
  return result;
}

export function exportNotebookAsMarkdown(
  notebook: NotebookSummary,
  records: readonly NotebookRecordItem[],
): string {
  const header = [
    `# ${notebook.name}`,
    notebook.description ? `\n> ${notebook.description}` : '',
    `\nExported items: ${records.length}`,
    '',
  ]
    .filter(Boolean)
    .join('\n');

  const body = records
    .map((rec, idx) => {
      const kindLabel =
        FAVORITE_KIND_LABELS[favoriteKind(rec.type, rec.metadata)];
      return [
        `## ${idx + 1}. [${kindLabel}] ${rec.title}`,
        rec.summary ? `\n*Summary:* ${rec.summary}` : '',
        rec.user_query ? `\n### Prompt\n${rec.user_query}` : '',
        `\n### Saved Original Snapshot\n${rec.output}`,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n---\n\n');

  return body ? `${header}\n\n${body}\n` : `${header}\n`;
}
