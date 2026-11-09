import { isAxiosError } from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { api } from '@/api/client';

export type QuestionCategory = { id: number; name: string; entry_count: number };
export type QuestionEntry = {
  id: number;
  session_id: string;
  question: string;
  question_type: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  difficulty: string;
  user_answer: string;
  is_correct: boolean;
  resolved: boolean;
  bookmarked: boolean;
  categories: QuestionCategory[];
};
export type QuestionBankStats = { total: number; wrong: number; unresolved: number; bookmarked: number; uncategorized: number };
export type QuestionFilter = {
  mistakesOnly?: boolean;
  categoryId?: number;
  uncategorized?: boolean;
  bookmarked?: boolean;
  resolved?: boolean;
  search?: string;
  sort?: 'recent' | 'oldest';
  limit?: number;
  offset?: number;
};
export type ImportSample = { question: string; question_type: string; correct_answer: string; tags: string[] };
export type ImportPreview = {
  filename: string;
  target: 'bank' | 'mistakes';
  token: string | null;
  total: number;
  valid: number;
  errors: { row: number; message: string }[];
  samples: ImportSample[];
};
export type ImportCommitResult = { filename: string; created: number; duplicates: number };
export type PracticeItem = {
  entry: QuestionEntry;
  state: { version: number; review_count: number; is_mistake?: boolean; due_at?: number | null };
  content_workspace_id?: string;
};
export type PracticeReviewOutcome = {
  item: PracticeItem;
  answer: string;
  correct: boolean | null;
  reviewed?: boolean;
};
export type LearningJournal = {
  version: number;
  updated_at: string;
  mission: { topic: string; why: string; level: string; updated_at: string };
  last_session: { summary: string; next_focus: string; updated_at: string };
  records: { id: string; title: string; insight: string; created_at: string }[];
};

const invalid = () => new Error('Invalid resource data received from the server.');
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
  return value as Record<string, unknown>;
}
function list(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw invalid();
  return value.map(record);
}
function parseCategory(raw: Record<string, unknown>): QuestionCategory {
  if (!Number.isSafeInteger(raw.id) || typeof raw.name !== 'string' || !raw.name.trim()) throw invalid();
  return { id: Number(raw.id), name: raw.name, entry_count: typeof raw.entry_count === 'number' ? raw.entry_count : 0 };
}
function parseEntry(raw: Record<string, unknown>): QuestionEntry {
  if (!Number.isSafeInteger(raw.id) || typeof raw.question !== 'string') throw invalid();
  const options: Record<string, string> = {};
  if (raw.options && typeof raw.options === 'object' && !Array.isArray(raw.options)) {
    for (const [k, v] of Object.entries(raw.options as Record<string, unknown>)) if (typeof v === 'string') options[k] = v;
  }
  return {
    id: Number(raw.id),
    session_id: typeof raw.session_id === 'string' ? raw.session_id : '',
    question: raw.question,
    question_type: typeof raw.question_type === 'string' ? raw.question_type : '',
    options,
    correct_answer: typeof raw.correct_answer === 'string' ? raw.correct_answer : '',
    explanation: typeof raw.explanation === 'string' ? raw.explanation : '',
    difficulty: typeof raw.difficulty === 'string' ? raw.difficulty : '',
    user_answer: typeof raw.user_answer === 'string' ? raw.user_answer : '',
    is_correct: Boolean(raw.is_correct),
    resolved: Boolean(raw.resolved),
    bookmarked: Boolean(raw.bookmarked),
    categories: Array.isArray(raw.categories) ? raw.categories.map(item => parseCategory(record(item))) : [],
  };
}
export function libraryError(cause: unknown): string {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (cause.response?.status === 403) return 'This page is not available for your account.';
    const detail = (cause.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (!cause.response) return "Couldn't reach the server. Please check your connection and retry.";
  }
  return cause instanceof Error ? cause.message : 'Failed to load resource counts';
}

export async function listQuestionEntries(workspace: string, filter: QuestionFilter = {}, signal?: AbortSignal): Promise<{ items: QuestionEntry[]; total: number }> {
  const params: Record<string, string | number | boolean> = {
    dt_workspace: workspace,
    sort: filter.sort ?? 'recent',
    limit: filter.limit ?? 60,
    offset: filter.offset ?? 0,
  };
  if (filter.mistakesOnly) params.mistakes_only = true;
  if (filter.categoryId !== undefined) params.category_id = filter.categoryId;
  else if (filter.uncategorized) params.uncategorized = true;
  if (filter.bookmarked !== undefined) params.bookmarked = filter.bookmarked;
  if (filter.resolved !== undefined) params.resolved = filter.resolved;
  if (filter.search?.trim()) params.search = filter.search.trim();
  const data = record((await api.get('/question-notebook/entries', { params, signal })).data);
  if (!Number.isSafeInteger(data.total) || Number(data.total) < 0) throw invalid();
  return { items: list(data.items).map(parseEntry), total: Number(data.total) };
}

export async function getQuestionStats(workspace: string, signal?: AbortSignal): Promise<QuestionBankStats> {
  const data = record((await api.get('/question-notebook/stats', { params: { dt_workspace: workspace }, signal })).data);
  return {
    total: typeof data.total === 'number' ? data.total : 0,
    wrong: typeof data.wrong === 'number' ? data.wrong : 0,
    unresolved: typeof data.unresolved === 'number' ? data.unresolved : 0,
    bookmarked: typeof data.bookmarked === 'number' ? data.bookmarked : 0,
    uncategorized: typeof data.uncategorized === 'number' ? data.uncategorized : 0,
  };
}

export async function listQuestionCategories(workspace: string, signal?: AbortSignal): Promise<QuestionCategory[]> {
  const { data } = await api.get('/question-notebook/categories', { params: { dt_workspace: workspace }, signal });
  return list(data).map(parseCategory);
}

export async function createQuestionCategory(workspace: string, name: string): Promise<QuestionCategory> {
  const { data } = await api.post('/question-notebook/categories', { name: name.trim() }, { params: { dt_workspace: workspace } });
  return parseCategory(record(data));
}

export async function renameQuestionCategory(workspace: string, categoryId: number, name: string): Promise<void> {
  await api.patch(`/question-notebook/categories/${encodeURIComponent(String(categoryId))}`, { name: name.trim() }, { params: { dt_workspace: workspace } });
}

export async function deleteQuestionCategory(workspace: string, categoryId: number): Promise<void> {
  await api.delete(`/question-notebook/categories/${encodeURIComponent(String(categoryId))}`, { params: { dt_workspace: workspace } });
}

export async function updateQuestionEntry(workspace: string, entryId: number, patch: { bookmarked?: boolean; resolved?: boolean }): Promise<void> {
  await api.patch(`/question-notebook/entries/${encodeURIComponent(String(entryId))}`, patch, { params: { dt_workspace: workspace } });
}

export async function deleteQuestionEntry(workspace: string, entryId: number): Promise<void> {
  await api.delete(`/question-notebook/entries/${encodeURIComponent(String(entryId))}`, { params: { dt_workspace: workspace } });
}

export async function linkQuestionCategory(workspace: string, entryId: number, categoryId: number): Promise<void> {
  await api.post(`/question-notebook/entries/${encodeURIComponent(String(entryId))}/categories`, { category_id: categoryId }, { params: { dt_workspace: workspace } });
}

export async function unlinkQuestionCategory(workspace: string, entryId: number, categoryId: number): Promise<void> {
  await api.delete(`/question-notebook/entries/${encodeURIComponent(String(entryId))}/categories/${encodeURIComponent(String(categoryId))}`, { params: { dt_workspace: workspace } });
}

export async function pickAndPreviewQuestionImport(workspace: string, target: 'bank' | 'mistakes'): Promise<ImportPreview | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['text/csv', 'text/tab-separated-values', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '*/*'],
    copyToCacheDirectory: true,
  });
  if (picked.canceled || !picked.assets?.[0]) return null;
  const asset = picked.assets[0];
  if (typeof asset.size === 'number' && asset.size > 5 * 1024 * 1024) throw new Error('Image is too large');
  const form = new FormData();
  if (Platform.OS === 'web' && asset.file) {
    form.append('file', asset.file, asset.name);
  } else {
    form.append('file', { uri: asset.uri, name: asset.name || 'questions.csv', type: asset.mimeType || 'text/csv' } as unknown as Blob);
  }
  form.append('target', target);
  const { data } = await api.post('/question-notebook/practice/import/preview', form, {
    params: { dt_workspace: workspace },
    headers: { 'Content-Type': undefined },
  });
  const raw = record(data);
  return {
    filename: asset.name || 'questions.csv',
    target,
    token: typeof raw.token === 'string' && raw.token ? raw.token : null,
    total: typeof raw.total === 'number' ? raw.total : 0,
    valid: typeof raw.valid === 'number' ? raw.valid : 0,
    errors: Array.isArray(raw.errors) ? raw.errors.map(item => {
      const row = record(item);
      return { row: typeof row.row === 'number' ? row.row : 0, message: typeof row.message === 'string' ? row.message : '' };
    }) : [],
    samples: Array.isArray(raw.samples) ? raw.samples.map(item => {
      const sample = record(item);
      return {
        question: typeof sample.question === 'string' ? sample.question : '',
        question_type: typeof sample.question_type === 'string' ? sample.question_type : '',
        correct_answer: typeof sample.correct_answer === 'string' ? sample.correct_answer : '',
        tags: Array.isArray(sample.tags) ? sample.tags.filter((t): t is string => typeof t === 'string') : [],
      };
    }) : [],
  };
}

export async function commitQuestionImport(workspace: string, token: string, filename: string): Promise<ImportCommitResult> {
  const { data } = await api.post('/question-notebook/practice/import/commit', { token }, { params: { dt_workspace: workspace } });
  const raw = record(data);
  return {
    filename,
    created: typeof raw.created === 'number' ? raw.created : 0,
    duplicates: typeof raw.duplicates === 'number' ? raw.duplicates : 0,
  };
}

export async function fetchQuestionTemplate(workspace: string): Promise<string> {
  const { data } = await api.get('/question-notebook/practice/import/template', {
    params: { format: 'csv', dt_workspace: workspace },
    responseType: 'text',
  });
  if (typeof data !== 'string' || !data.trim()) throw invalid();
  return data;
}

function parsePracticeItem(raw: Record<string, unknown>): PracticeItem {
  const entry = parseEntry(record(raw.entry));
  const state = record(raw.state);
  return {
    entry,
    state: {
      version: typeof state.version === 'number' ? state.version : 0,
      review_count: typeof state.review_count === 'number' ? state.review_count : 0,
      is_mistake: typeof state.is_mistake === 'boolean' ? state.is_mistake : undefined,
      due_at: typeof state.due_at === 'number' ? state.due_at : null,
    },
    content_workspace_id: typeof raw.content_workspace_id === 'string' ? raw.content_workspace_id : undefined,
  };
}

export async function getPracticeQueue(workspace: string, categoryId?: number, signal?: AbortSignal): Promise<PracticeItem[]> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const params: Record<string, string | number> = { dt_workspace: workspace };
  if (timezone) params.timezone = timezone;
  if (categoryId !== undefined) params.category_id = categoryId;
  const { data } = await api.get('/question-notebook/practice/queue', { params, signal });
  return list(data).map(parsePracticeItem);
}

export async function getPracticeQuestionById(workspace: string, entryId: number, signal?: AbortSignal): Promise<PracticeItem> {
  const { data } = await api.get(`/question-notebook/practice/questions/${encodeURIComponent(String(entryId))}`, {
    params: { dt_workspace: workspace },
    signal,
  });
  return parsePracticeItem(record(data));
}

export async function checkPracticeAnswer(workspace: string, entryId: number, answer: string): Promise<boolean | null> {
  const { data } = await api.post(`/question-notebook/practice/questions/${encodeURIComponent(String(entryId))}/check`, { answer }, { params: { dt_workspace: workspace } });
  const raw = record(data);
  return typeof raw.correct === 'boolean' ? raw.correct : null;
}

export async function submitPracticeReview(
  workspace: string,
  entryId: number,
  body: { request_id: string; version: number; rating: 'again' | 'hard' | 'good' | 'easy'; answer: string; self_report?: boolean },
): Promise<void> {
  await api.post(`/question-notebook/practice/questions/${encodeURIComponent(String(entryId))}/review`, body, { params: { dt_workspace: workspace } });
}

export async function getLearningJournal(workspace: string, signal?: AbortSignal): Promise<LearningJournal> {
  const data = record((await api.get('/learning-journal', { params: { dt_workspace: workspace }, signal })).data);
  const mission = data.mission && typeof data.mission === 'object' ? record(data.mission) : {};
  const last = data.last_session && typeof data.last_session === 'object' ? record(data.last_session) : {};
  return {
    version: typeof data.version === 'number' ? data.version : 1,
    updated_at: typeof data.updated_at === 'string' ? data.updated_at : '',
    mission: {
      topic: typeof mission.topic === 'string' ? mission.topic : '',
      why: typeof mission.why === 'string' ? mission.why : '',
      level: typeof mission.level === 'string' ? mission.level : '',
      updated_at: typeof mission.updated_at === 'string' ? mission.updated_at : '',
    },
    last_session: {
      summary: typeof last.summary === 'string' ? last.summary : '',
      next_focus: typeof last.next_focus === 'string' ? last.next_focus : '',
      updated_at: typeof last.updated_at === 'string' ? last.updated_at : '',
    },
    records: Array.isArray(data.records) ? data.records.map(item => {
      const r = record(item);
      return {
        id: typeof r.id === 'string' ? r.id : String(r.id ?? ''),
        title: typeof r.title === 'string' ? r.title : '',
        insight: typeof r.insight === 'string' ? r.insight : '',
        created_at: typeof r.created_at === 'string' ? r.created_at : '',
      };
    }) : [],
  };
}

const stagedImports = new Map<string, ImportPreview>();
const committedImports = new Map<string, ImportCommitResult>();
const reviewOutcomes = new Map<string, PracticeReviewOutcome>();

export function stageImportPreview(scopeKey: string, preview: ImportPreview) { stagedImports.set(scopeKey, preview); }
export function readStagedImportPreview(scopeKey: string) { return stagedImports.get(scopeKey) ?? null; }
export function saveImportCommitResult(scopeKey: string, result: ImportCommitResult) { committedImports.set(scopeKey, result); stagedImports.delete(scopeKey); }
export function readImportCommitResult(scopeKey: string) { return committedImports.get(scopeKey) ?? null; }
export function savePracticeReviewOutcome(scopeKey: string, outcome: PracticeReviewOutcome) { reviewOutcomes.set(scopeKey, outcome); }
export function readPracticeReviewOutcome(scopeKey: string) { return reviewOutcomes.get(scopeKey) ?? null; }
