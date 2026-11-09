import { isAxiosError } from 'axios';
import { api } from '@/api/client';

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskColors = Record<TaskStatus, string>;

export const DEFAULT_TASK_COLORS: TaskColors = {
  todo: '#2563eb',
  doing: '#a16207',
  done: '#15803d',
};

export type TaskCard = {
  id: string;
  title: string;
  note: string;
  status: TaskStatus;
  archived: boolean;
  created_at: string;
  updated_at: string;
  workspace_id: string | null;
  due_date: string | null;
};

export type SessionTaskLinks = {
  workspace_id: string;
  session_id: string;
  task_ids: string[];
  status_link_enabled: boolean;
};

export type TaskBoard = {
  cards: TaskCard[];
  colors: TaskColors;
  session_links: SessionTaskLinks[];
  revision: number;
};

export type CalendarEntry = {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  position: number;
  is_default: boolean;
};

export type CalendarOccurrence = {
  id: string;
  event_id: string;
  calendar_id: string;
  title: string;
  notes: string;
  location: string;
  all_day: boolean;
  start: string;
  end: string;
  tzid: string;
  color: string | null;
  task_id: string | null;
};

export type ReviewDay = {
  date: string;
  mastery: number;
  practice: number;
  paths: { id: string; title: string; count: number }[];
};

export type AutomationRun = {
  id: string;
  job_id: string;
  name: string;
  message: string;
  at: string;
  kind: string;
  enabled: boolean;
};

export type FootprintDay = {
  date: string;
  session_count: number;
  sessions: { id: string; title: string }[];
  practice_reviews: number;
  mastery_evidence: number;
};

export type CalendarLayers = {
  workspace_id: string;
  reviews: ReviewDay[];
  automations: AutomationRun[];
  footprints: FootprintDay[];
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

export function planError(cause: unknown): string {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (cause.response?.status === 403) return 'This page is not available for your account.';
    const detail = (cause.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (!cause.response) return "Couldn't reach the server. Please check your connection and retry.";
  }
  return cause instanceof Error ? cause.message : 'Failed to load resource counts';
}

function parseTaskCard(raw: Record<string, unknown>): TaskCard {
  if (typeof raw.id !== 'string' || !raw.id.trim() || typeof raw.title !== 'string') throw invalid();
  const status = raw.status;
  return {
    id: raw.id,
    title: raw.title,
    note: typeof raw.note === 'string' ? raw.note : '',
    status: status === 'doing' || status === 'done' ? status : 'todo',
    archived: Boolean(raw.archived),
    created_at: typeof raw.created_at === 'string' ? raw.created_at : '',
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : '',
    workspace_id: typeof raw.workspace_id === 'string' ? raw.workspace_id : null,
    due_date: typeof raw.due_date === 'string' ? raw.due_date : null,
  };
}

function parseTaskBoard(value: unknown): TaskBoard {
  const raw = record(value);
  const rawColors = raw.colors && typeof raw.colors === 'object' && !Array.isArray(raw.colors)
    ? (raw.colors as Record<string, unknown>)
    : {};
  return {
    cards: Array.isArray(raw.cards) ? raw.cards.map(item => parseTaskCard(record(item))) : [],
    colors: {
      todo: typeof rawColors.todo === 'string' ? rawColors.todo : DEFAULT_TASK_COLORS.todo,
      doing: typeof rawColors.doing === 'string' ? rawColors.doing : DEFAULT_TASK_COLORS.doing,
      done: typeof rawColors.done === 'string' ? rawColors.done : DEFAULT_TASK_COLORS.done,
    },
    session_links: Array.isArray(raw.session_links)
      ? raw.session_links.map(item => {
          const link = record(item);
          return {
            workspace_id: typeof link.workspace_id === 'string' ? link.workspace_id : '',
            session_id: typeof link.session_id === 'string' ? link.session_id : '',
            task_ids: Array.isArray(link.task_ids) ? link.task_ids.filter((id): id is string => typeof id === 'string') : [],
            status_link_enabled: Boolean(link.status_link_enabled),
          };
        })
      : [],
    revision: typeof raw.revision === 'number' ? raw.revision : 0,
  };
}

export async function getTaskBoard(workspace: string, signal?: AbortSignal): Promise<TaskBoard> {
  const { data } = await api.get('/task-board', { params: { dt_workspace: workspace }, signal });
  return parseTaskBoard(data);
}

export async function createTaskCard(
  workspace: string,
  title: string,
  dueDate?: string | null,
): Promise<TaskBoard> {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('Enter a task title.');
  const { data } = await api.post(
    '/task-board/cards',
    dueDate !== undefined ? { title: trimmed, due_date: dueDate } : { title: trimmed },
    { params: { dt_workspace: workspace } },
  );
  return parseTaskBoard(data);
}

export async function updateTaskCard(
  workspace: string,
  cardId: string,
  changes: Partial<Pick<TaskCard, 'title' | 'note' | 'status' | 'archived' | 'workspace_id' | 'due_date'>>,
): Promise<TaskBoard> {
  const { data } = await api.patch(`/task-board/cards/${encodeURIComponent(cardId)}`, changes, {
    params: { dt_workspace: workspace },
  });
  return parseTaskBoard(data);
}

export async function updateTaskColors(workspace: string, colors: TaskColors): Promise<TaskBoard> {
  const { data } = await api.put('/task-board/colors', colors, {
    params: { dt_workspace: workspace },
  });
  return parseTaskBoard(data);
}

export async function linkSessionTasks(
  workspace: string,
  sessionId: string,
  taskIds: string[],
): Promise<TaskBoard> {
  const { data } = await api.put(
    `/task-board/sessions/${encodeURIComponent(sessionId)}`,
    { workspace_id: workspace, task_ids: taskIds },
    { params: { dt_workspace: workspace } },
  );
  return parseTaskBoard(data);
}

export async function setTaskStatusLink(
  workspace: string,
  sessionId: string,
  enabled: boolean,
): Promise<TaskBoard> {
  const { data } = await api.patch(
    `/task-board/sessions/${encodeURIComponent(sessionId)}/status`,
    { workspace_id: workspace, enabled },
    { params: { dt_workspace: workspace } },
  );
  return parseTaskBoard(data);
}

function parseOccurrence(raw: Record<string, unknown>): CalendarOccurrence {
  if (typeof raw.id !== 'string' || typeof raw.start !== 'string' || typeof raw.end !== 'string') {
    throw invalid();
  }
  return {
    id: raw.id,
    event_id: typeof raw.event_id === 'string' ? raw.event_id : raw.id,
    calendar_id: typeof raw.calendar_id === 'string' ? raw.calendar_id : '',
    title: typeof raw.title === 'string' ? raw.title : '',
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    location: typeof raw.location === 'string' ? raw.location : '',
    all_day: Boolean(raw.all_day),
    start: raw.start,
    end: raw.end,
    tzid: typeof raw.tzid === 'string' ? raw.tzid : '',
    color: typeof raw.color === 'string' ? raw.color : null,
    task_id: typeof raw.task_id === 'string' ? raw.task_id : null,
  };
}

export async function listCalendars(workspace: string, signal?: AbortSignal): Promise<CalendarEntry[]> {
  const data = record((await api.get('/calendar/calendars', { params: { dt_workspace: workspace }, signal })).data);
  return list(data.calendars).map(raw => ({
    id: typeof raw.id === 'string' ? raw.id : '',
    name: typeof raw.name === 'string' ? raw.name : '',
    color: typeof raw.color === 'string' ? raw.color : '#2f6fde',
    visible: raw.visible !== false,
    position: typeof raw.position === 'number' ? raw.position : 0,
    is_default: Boolean(raw.is_default),
  }));
}

export async function listCalendarOccurrences(
  workspace: string,
  range: { start: string; end: string; tz?: string },
  signal?: AbortSignal,
): Promise<CalendarOccurrence[]> {
  const tz = range.tz || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const params: Record<string, string> = {
    start: range.start,
    end: range.end,
    dt_workspace: workspace,
  };
  if (tz) params.tz = tz;
  const data = record((await api.get('/calendar/events', { params, signal })).data);
  return list(data.occurrences).map(parseOccurrence);
}

export async function getCalendarLayers(
  workspace: string,
  range: { start: string; end: string; tz?: string },
  signal?: AbortSignal,
): Promise<CalendarLayers> {
  const tz = range.tz || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const params: Record<string, string> = {
    start: range.start,
    end: range.end,
    dt_workspace: workspace,
  };
  if (tz) params.tz = tz;
  const raw = record((await api.get('/calendar/layers', { params, signal })).data);
  return {
    workspace_id: typeof raw.workspace_id === 'string' ? raw.workspace_id : workspace,
    reviews: Array.isArray(raw.reviews)
      ? raw.reviews.map(item => {
          const r = record(item);
          return {
            date: typeof r.date === 'string' ? r.date : '',
            mastery: typeof r.mastery === 'number' ? r.mastery : 0,
            practice: typeof r.practice === 'number' ? r.practice : 0,
            paths: Array.isArray(r.paths)
              ? r.paths.map(p => {
                  const pr = record(p);
                  return {
                    id: typeof pr.id === 'string' ? pr.id : '',
                    title: typeof pr.title === 'string' ? pr.title : '',
                    count: typeof pr.count === 'number' ? pr.count : 0,
                  };
                })
              : [],
          };
        })
      : [],
    automations: Array.isArray(raw.automations)
      ? raw.automations.map(item => {
          const a = record(item);
          return {
            id: typeof a.id === 'string' ? a.id : '',
            job_id: typeof a.job_id === 'string' ? a.job_id : '',
            name: typeof a.name === 'string' ? a.name : '',
            message: typeof a.message === 'string' ? a.message : '',
            at: typeof a.at === 'string' ? a.at : '',
            kind: typeof a.kind === 'string' ? a.kind : 'at',
            enabled: a.enabled !== false,
          };
        })
      : [],
    footprints: Array.isArray(raw.footprints)
      ? raw.footprints.map(item => {
          const f = record(item);
          return {
            date: typeof f.date === 'string' ? f.date : '',
            session_count: typeof f.session_count === 'number' ? f.session_count : 0,
            sessions: Array.isArray(f.sessions)
              ? f.sessions.map(s => {
                  const sr = record(s);
                  return {
                    id: typeof sr.id === 'string' ? sr.id : '',
                    title: typeof sr.title === 'string' ? sr.title : '',
                  };
                })
              : [],
            practice_reviews: typeof f.practice_reviews === 'number' ? f.practice_reviews : 0,
            mastery_evidence: typeof f.mastery_evidence === 'number' ? f.mastery_evidence : 0,
          };
        })
      : [],
  };
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const dt = parseDateKey(dateKey);
  dt.setDate(dt.getDate() + deltaDays);
  return formatDateKey(dt);
}

export function shiftMonthDateKey(dateKey: string, deltaMonths: number): string {
  const dt = parseDateKey(dateKey);
  dt.setDate(1);
  dt.setMonth(dt.getMonth() + deltaMonths);
  return formatDateKey(dt);
}

export function monthGridForDate(dateKey: string) {
  const dt = parseDateKey(dateKey);
  const year = dt.getFullYear();
  const month = dt.getMonth();
  const first = new Date(year, month, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = first.getDay();
  const start = new Date(year, month, 1 - firstWeekday);
  const end = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 7);
  return {
    year,
    month,
    daysInMonth,
    firstWeekday,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export function weekDatesForDate(dateKey: string): { dates: string[]; startIso: string; endIso: string } {
  const dt = parseDateKey(dateKey);
  const sunday = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - dt.getDay());
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    dates.push(formatDateKey(day));
  }
  const end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 7);
  return {
    dates,
    startIso: sunday.toISOString(),
    endIso: end.toISOString(),
  };
}

export function dayRangeForDate(dateKey: string): { startIso: string; endIso: string } {
  const start = parseDateKey(dateKey);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

const selectedDates = new Map<string, string>();
const activeTaskIds = new Map<string, string>();

export function getSelectedPlanDate(scopeKey: string): string {
  return selectedDates.get(scopeKey) ?? formatDateKey(new Date());
}

export function setSelectedPlanDate(scopeKey: string, dateKey: string) {
  selectedDates.set(scopeKey, dateKey);
}

export function getActiveTaskId(scopeKey: string): string | null {
  return activeTaskIds.get(scopeKey) ?? null;
}

export function setActiveTaskId(scopeKey: string, taskId: string | null) {
  if (taskId) activeTaskIds.set(scopeKey, taskId);
  else activeTaskIds.delete(scopeKey);
}
