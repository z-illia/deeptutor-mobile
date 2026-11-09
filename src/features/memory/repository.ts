import { isAxiosError } from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { api } from '@/api/client';

export type MemoryLayer = 'L1' | 'L2' | 'L3';
export type MemoryDocLayer = 'L2' | 'L3';
export type MemorySurface =
  | 'chat'
  | 'notebook'
  | 'quiz'
  | 'kb'
  | 'book'
  | 'partner'
  | 'cowriter';
export type MemoryL3Slot = 'recent' | 'profile' | 'scope' | 'preferences';
export type MemoryRunMode = 'update' | 'audit' | 'dedup';
export type MemoryRunStatus = 'queued' | 'running' | 'cancelled' | 'done' | 'error';

export const MEMORY_SURFACES: readonly MemorySurface[] = [
  'chat',
  'notebook',
  'quiz',
  'kb',
  'book',
  'partner',
  'cowriter',
] as const;

export const MEMORY_L3_SLOTS: readonly MemoryL3Slot[] = [
  'recent',
  'profile',
  'scope',
  'preferences',
] as const;

export type MemoryDocOverview = {
  layer: MemoryDocLayer;
  key: string;
  exists: boolean;
  updated_at: string | null;
  entry_count: number;
  backlog: number;
};

export type MemoryOverview = {
  docs: MemoryDocOverview[];
  backups: string[];
};

export type MemoryL1Entity = {
  id: string;
  label: string;
  ts: string;
  content: string;
  metadata: Record<string, unknown>;
  fingerprint: string;
};

export type MemoryL1Change = {
  ts: string;
  kind: 'added' | 'modified' | 'removed';
  entity_id: string;
  label: string;
};

export type MemorySnapshot = {
  surface: MemorySurface;
  entities: MemoryL1Entity[];
  last_refresh: string | null;
  pending_changes: MemoryL1Change[];
};

export type MemoryDocLine = {
  number: number;
  kind: 'title' | 'blank' | 'section' | 'bullet';
  text: string;
  entry_id: string | null;
  section: string | null;
};

export type MemorySettings = {
  update: { l2_budget: number; l3_budget: number };
  audit: { l2_budget: number; l3_budget: number };
  dedup: { iterations: number; auto_after_update: boolean };
};

export type MemoryRunHandle = {
  id: string;
  layer: MemoryDocLayer;
  key: string;
  mode: MemoryRunMode;
  status: MemoryRunStatus;
  started_at: string;
  ended_at: string | null;
  error: string | null;
  event_count: number;
  undo_count: number;
};

export type ParsedMemoryEntry = {
  id: string;
  section: string;
  text: string;
  refs: string[];
};

export type ParsedMemoryDoc = {
  title: string;
  entries: ParsedMemoryEntry[];
};

export type MemoryEvidenceItem = {
  id: string;
  layer: MemoryLayer;
  key: string;
  title: string;
  preview: string;
  section?: string;
  entryId?: string;
  inwardIds: string[];
  outwardIds: string[];
};

export type MemoryEvidenceBundle = {
  items: MemoryEvidenceItem[];
  byId: Record<string, MemoryEvidenceItem>;
  l1Counts: Record<MemorySurface, number>;
  l2Counts: Record<MemorySurface, number>;
  l3Counts: Record<MemoryL3Slot, number>;
};

export type ImportSource = 'chatgpt' | 'claude_code' | 'codex';

export type NormalizedImportedMessage = {
  role: 'user' | 'assistant';
  content: string;
  created_at?: number;
  metadata?: Record<string, unknown>;
};

export type NormalizedImportedSession = {
  external_id: string;
  title: string;
  source_cwd: string;
  created_at: number;
  updated_at: number;
  messages: NormalizedImportedMessage[];
};

export type ImportedSessionSummary = {
  session_id: string;
  title: string;
  created_at: number;
  updated_at: number;
  message_count: number;
  source?: string;
  source_cwd?: string;
  agent_name?: string;
};

export type ImportResult = {
  imported: number;
  skipped: number;
  sessions: {
    external_id: string;
    session_id?: string;
    imported: boolean;
    reason?: string;
  }[];
};

export type SubagentBackend = {
  kind: string;
  display_name: string;
  available: boolean;
  version: string;
  detail: string;
};

export type SubagentConnection = {
  name: string;
  agent_kind: string;
  cwd: string;
  description: string;
};

export type MemoryTarget = {
  layer: MemoryLayer;
  key: string;
  focusId?: string;
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

export function memoryError(cause: unknown): string {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (cause.response?.status === 403) return 'This page is not available for your account.';
    const detail = (cause.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (!cause.response) return "Couldn't reach the server. Please check your connection and retry.";
  }
  return cause instanceof Error ? cause.message : 'Failed to load resource counts';
}

function parseDocOverview(raw: Record<string, unknown>): MemoryDocOverview {
  const layer = raw.layer === 'L3' ? 'L3' : 'L2';
  if (typeof raw.key !== 'string' || !raw.key.trim()) throw invalid();
  return {
    layer,
    key: raw.key,
    exists: Boolean(raw.exists),
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : null,
    entry_count: typeof raw.entry_count === 'number' ? raw.entry_count : 0,
    backlog: typeof raw.backlog === 'number' ? raw.backlog : 0,
  };
}

export async function getMemoryOverview(
  workspace: string,
  signal?: AbortSignal,
): Promise<MemoryOverview> {
  const { data } = await api.get('/memory/overview', {
    params: { dt_workspace: workspace },
    signal,
  });
  const raw = record(data);
  return {
    docs: Array.isArray(raw.docs) ? raw.docs.map(item => parseDocOverview(record(item))) : [],
    backups: Array.isArray(raw.backups)
      ? raw.backups.filter((b): b is string => typeof b === 'string')
      : [],
  };
}

export async function getMemorySnapshot(
  workspace: string,
  surface: MemorySurface,
  signal?: AbortSignal,
): Promise<MemorySnapshot> {
  const { data } = await api.get(`/memory/snapshot/${encodeURIComponent(surface)}`, {
    params: { dt_workspace: workspace },
    signal,
  });
  const raw = record(data);
  const entities: MemoryL1Entity[] = Array.isArray(raw.entities)
    ? raw.entities.map(item => {
        const e = record(item);
        return {
          id: typeof e.id === 'string' ? e.id : '',
          label: typeof e.label === 'string' ? e.label : '',
          ts: typeof e.ts === 'string' ? e.ts : '',
          content: typeof e.content === 'string' ? e.content : '',
          metadata:
            e.metadata && typeof e.metadata === 'object' && !Array.isArray(e.metadata)
              ? (e.metadata as Record<string, unknown>)
              : {},
          fingerprint: typeof e.fingerprint === 'string' ? e.fingerprint : '',
        };
      })
    : [];
  const pending_changes: MemoryL1Change[] = Array.isArray(raw.pending_changes)
    ? raw.pending_changes.map(item => {
        const c = record(item);
        const kind = c.kind === 'removed' || c.kind === 'modified' ? c.kind : 'added';
        return {
          ts: typeof c.ts === 'string' ? c.ts : '',
          kind,
          entity_id: typeof c.entity_id === 'string' ? c.entity_id : '',
          label: typeof c.label === 'string' ? c.label : '',
        };
      })
    : [];
  return {
    surface,
    entities,
    last_refresh: typeof raw.last_refresh === 'string' ? raw.last_refresh : null,
    pending_changes,
  };
}

export async function refreshMemorySnapshot(
  workspace: string,
  surface: MemorySurface,
): Promise<{ surface: MemorySurface; changesCount: number; last_refresh: string | null }> {
  const { data } = await api.post(
    `/memory/snapshot/${encodeURIComponent(surface)}/refresh`,
    {},
    { params: { dt_workspace: workspace } },
  );
  const raw = record(data);
  return {
    surface,
    changesCount: Array.isArray(raw.changes) ? raw.changes.length : 0,
    last_refresh: typeof raw.last_refresh === 'string' ? raw.last_refresh : null,
  };
}

export async function refreshAllMemorySnapshots(workspace: string): Promise<number> {
  const results = await Promise.all(
    MEMORY_SURFACES.map(surface =>
      refreshMemorySnapshot(workspace, surface).catch(() => ({
        surface,
        changesCount: 0,
        last_refresh: null,
      })),
    ),
  );
  return results.reduce((sum, item) => sum + item.changesCount, 0);
}

export async function getMemoryDoc(
  workspace: string,
  layer: MemoryDocLayer,
  key: string,
  signal?: AbortSignal,
): Promise<{ layer: MemoryDocLayer; key: string; content: string }> {
  const { data } = await api.get(
    `/memory/doc/${encodeURIComponent(layer)}/${encodeURIComponent(key)}`,
    { params: { dt_workspace: workspace }, signal },
  );
  const raw = record(data);
  return {
    layer,
    key,
    content: typeof raw.content === 'string' ? raw.content : '',
  };
}

export async function getMemoryDocLines(
  workspace: string,
  layer: MemoryDocLayer,
  key: string,
  signal?: AbortSignal,
): Promise<MemoryDocLine[]> {
  const { data } = await api.get(
    `/memory/doc/${encodeURIComponent(layer)}/${encodeURIComponent(key)}/lines`,
    { params: { dt_workspace: workspace }, signal },
  );
  const raw = record(data);
  return list(raw.lines ?? []).map(item => ({
    number: typeof item.number === 'number' ? item.number : 0,
    kind:
      item.kind === 'title' || item.kind === 'blank' || item.kind === 'section'
        ? item.kind
        : 'bullet',
    text: typeof item.text === 'string' ? item.text : '',
    entry_id: typeof item.entry_id === 'string' ? item.entry_id : null,
    section: typeof item.section === 'string' ? item.section : null,
  }));
}

export async function saveMemoryDoc(
  workspace: string,
  layer: MemoryDocLayer,
  key: string,
  content: string,
): Promise<boolean> {
  const { data } = await api.put(
    `/memory/doc/${encodeURIComponent(layer)}/${encodeURIComponent(key)}`,
    { content },
    { params: { dt_workspace: workspace } },
  );
  return Boolean(record(data).saved);
}

export async function deleteMemoryEntry(
  workspace: string,
  layer: MemoryDocLayer,
  key: string,
  entryId: string,
): Promise<boolean> {
  const { data } = await api.delete(
    `/memory/doc/${encodeURIComponent(layer)}/${encodeURIComponent(key)}/entry/${encodeURIComponent(entryId)}`,
    { params: { dt_workspace: workspace } },
  );
  return typeof record(data).deleted === 'string';
}

export async function resetMemoryDoc(
  workspace: string,
  layer: MemoryDocLayer,
  key: string,
): Promise<boolean> {
  const { data } = await api.post(
    `/memory/doc/${encodeURIComponent(layer)}/${encodeURIComponent(key)}/reset`,
    {},
    { params: { dt_workspace: workspace } },
  );
  return Boolean(record(data).reset);
}

export async function getMemorySettings(
  workspace: string,
  signal?: AbortSignal,
): Promise<MemorySettings> {
  const { data } = await api.get('/memory/settings', {
    params: { dt_workspace: workspace },
    signal,
  });
  const raw = record(data);
  const update = raw.update && typeof raw.update === 'object' ? (raw.update as Record<string, unknown>) : {};
  const audit = raw.audit && typeof raw.audit === 'object' ? (raw.audit as Record<string, unknown>) : {};
  const dedup = raw.dedup && typeof raw.dedup === 'object' ? (raw.dedup as Record<string, unknown>) : {};
  return {
    update: {
      l2_budget: typeof update.l2_budget === 'number' ? update.l2_budget : 20,
      l3_budget: typeof update.l3_budget === 'number' ? update.l3_budget : 10,
    },
    audit: {
      l2_budget: typeof audit.l2_budget === 'number' ? audit.l2_budget : 20,
      l3_budget: typeof audit.l3_budget === 'number' ? audit.l3_budget : 10,
    },
    dedup: {
      iterations: typeof dedup.iterations === 'number' ? dedup.iterations : 3,
      auto_after_update: Boolean(dedup.auto_after_update),
    },
  };
}

function parseRunHandle(raw: Record<string, unknown>): MemoryRunHandle {
  if (typeof raw.id !== 'string' || !raw.id.trim()) throw invalid();
  const layer = raw.layer === 'L3' ? 'L3' : 'L2';
  const mode = raw.mode === 'audit' || raw.mode === 'dedup' ? raw.mode : 'update';
  const status =
    raw.status === 'queued' ||
    raw.status === 'running' ||
    raw.status === 'cancelled' ||
    raw.status === 'error'
      ? raw.status
      : 'done';
  return {
    id: raw.id,
    layer,
    key: typeof raw.key === 'string' ? raw.key : '',
    mode,
    status,
    started_at: typeof raw.started_at === 'string' ? raw.started_at : '',
    ended_at: typeof raw.ended_at === 'string' ? raw.ended_at : null,
    error: typeof raw.error === 'string' ? raw.error : null,
    event_count: typeof raw.event_count === 'number' ? raw.event_count : 0,
    undo_count: typeof raw.undo_count === 'number' ? raw.undo_count : 0,
  };
}

export async function listMemoryRuns(
  workspace: string,
  layer?: MemoryDocLayer,
  key?: string,
  signal?: AbortSignal,
): Promise<MemoryRunHandle[]> {
  const params: Record<string, string> = { dt_workspace: workspace };
  if (layer) params.layer = layer;
  if (key) params.key = key;
  const { data } = await api.get('/memory/runs', { params, signal });
  const raw = record(data);
  return list(raw.runs ?? []).map(parseRunHandle);
}

export async function getMemoryRun(
  workspace: string,
  runId: string,
  signal?: AbortSignal,
): Promise<MemoryRunHandle> {
  const { data } = await api.get(`/memory/runs/${encodeURIComponent(runId)}`, {
    params: { dt_workspace: workspace },
    signal,
  });
  return parseRunHandle(record(data));
}

export async function startMemoryRun(
  workspace: string,
  payload: {
    layer: MemoryDocLayer;
    key: string;
    mode: MemoryRunMode;
    language?: string;
    budget?: number | null;
    iterations?: number | null;
    llm_selection?: { profile_id: string; model_id: string } | null;
  },
): Promise<MemoryRunHandle> {
  const { data } = await api.post(
    '/memory/runs/start',
    {
      layer: payload.layer,
      key: payload.key,
      mode: payload.mode,
      language: payload.language ?? 'en',
      budget: payload.budget ?? null,
      iterations: payload.iterations ?? null,
      llm_selection: payload.llm_selection ?? null,
    },
    { params: { dt_workspace: workspace } },
  );
  return parseRunHandle(record(data));
}

export async function cancelMemoryRun(workspace: string, runId: string): Promise<boolean> {
  const { data } = await api.post(
    `/memory/runs/${encodeURIComponent(runId)}/cancel`,
    {},
    { params: { dt_workspace: workspace } },
  );
  return Boolean(record(data).cancelled);
}

export async function undoMemoryRun(
  workspace: string,
  runId: string,
): Promise<{ undone: boolean; undo_count: number }> {
  const { data } = await api.post(
    `/memory/runs/${encodeURIComponent(runId)}/undo`,
    {},
    { params: { dt_workspace: workspace } },
  );
  const raw = record(data);
  return {
    undone: Boolean(raw.undone),
    undo_count: typeof raw.undo_count === 'number' ? raw.undo_count : 0,
  };
}

const ENTRY_ID_PATTERN = 'm_[0-9A-HJKMNP-TV-Z]{26}';
const NEW_BULLET_RE = new RegExp(
  String.raw`^\s*-\s+(.*?)((?:\s*,?\s*\[\^[^\]]+\])*)\s*<!--\s*(` +
    ENTRY_ID_PATTERN +
    String.raw`)\s*-->\s*$`,
);
const OLD_BULLET_RE = new RegExp(
  String.raw`^\s*-\s+(.*?)\[\^(` + ENTRY_ID_PATTERN + String.raw`)\]\s*$`,
);
const NEW_FOOTNOTE_RE = /^\[\^([^\]]+)\]:\s*(.*?)\s*$/;
const OLD_FOOTNOTE_RE = new RegExp(
  String.raw`^\[\^(` + ENTRY_ID_PATTERN + String.raw`)\]:\s*(.*?)\s*$`,
);
const MARKER_RE = /\[\^([^\]]+)\]/g;

export function parseMemoryDoc(content: string): ParsedMemoryDoc {
  const lines = content.split(/\r?\n/);
  let title = '';
  let section = '';
  const entries: ParsedMemoryEntry[] = [];
  const footnotes = new Map<string, string[]>();

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) continue;
    if (line.startsWith('# ') && !title) {
      title = line.slice(2).trim();
      continue;
    }
    if (line.startsWith('## ')) {
      section = line.slice(3).trim();
      continue;
    }
    if (line === '---') continue;

    const mNew = NEW_BULLET_RE.exec(line);
    if (mNew) {
      const [, text, markersBlock, id] = mNew;
      const markerIds = Array.from(markersBlock.matchAll(MARKER_RE), m => m[1]);
      entries.push({
        id,
        section,
        text: text.trim(),
        refs: markerIds,
      });
      continue;
    }

    const mOld = OLD_BULLET_RE.exec(line);
    if (mOld) {
      const [, text, id] = mOld;
      entries.push({ id, section, text: text.trim(), refs: [id] });
      continue;
    }

    const mOldFn = OLD_FOOTNOTE_RE.exec(line);
    if (mOldFn) {
      const [, id, payload] = mOldFn;
      footnotes.set(
        id,
        payload
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      );
      continue;
    }

    const mNewFn = NEW_FOOTNOTE_RE.exec(line);
    if (mNewFn) {
      const [, label, ref] = mNewFn;
      const cur = footnotes.get(label) ?? [];
      cur.push(ref.trim());
      footnotes.set(label, cur);
    }
  }

  for (const entry of entries) {
    const resolved: string[] = [];
    for (const marker of entry.refs) {
      const refs = footnotes.get(marker);
      if (refs && refs.length) {
        for (const r of refs) {
          if (r && !resolved.includes(r)) resolved.push(r);
        }
      } else if (!marker.startsWith('m_')) {
        resolved.push(marker);
      }
    }
    entry.refs = resolved;
  }

  return { title, entries };
}

export async function fetchMemoryEvidence(
  workspace: string,
  signal?: AbortSignal,
): Promise<MemoryEvidenceBundle> {
  const [l1Pairs, l2Pairs, l3Pairs] = await Promise.all([
    Promise.all(
      MEMORY_SURFACES.map(async surface => {
        try {
          const snap = await getMemorySnapshot(workspace, surface, signal);
          return [surface, snap.entities] as const;
        } catch {
          return [surface, [] as MemoryL1Entity[]] as const;
        }
      }),
    ),
    Promise.all(
      MEMORY_SURFACES.map(async surface => {
        try {
          const doc = await getMemoryDoc(workspace, 'L2', surface, signal);
          return [surface, parseMemoryDoc(doc.content)] as const;
        } catch {
          return [surface, { title: '', entries: [] } as ParsedMemoryDoc] as const;
        }
      }),
    ),
    Promise.all(
      MEMORY_L3_SLOTS.map(async slot => {
        try {
          const doc = await getMemoryDoc(workspace, 'L3', slot, signal);
          return [slot, parseMemoryDoc(doc.content)] as const;
        } catch {
          return [slot, { title: '', entries: [] } as ParsedMemoryDoc] as const;
        }
      }),
    ),
  ]);

  const items: MemoryEvidenceItem[] = [];
  const byId: Record<string, MemoryEvidenceItem> = {};
  const l1Counts = {} as Record<MemorySurface, number>;
  const l2Counts = {} as Record<MemorySurface, number>;
  const l3Counts = {} as Record<MemoryL3Slot, number>;
  const l2ByEntryId = new Map<string, string>();
  const l2BySurface = new Map<string, string[]>();

  for (const [surface, entities] of l1Pairs) {
    l1Counts[surface] = entities.length;
    for (const ent of entities) {
      const id = `L1:${surface}:${ent.id}`;
      if (byId[id]) continue;
      const item: MemoryEvidenceItem = {
        id,
        layer: 'L1',
        key: surface,
        title: ent.label || ent.id,
        preview: ent.content.slice(0, 220),
        entryId: ent.id,
        inwardIds: [],
        outwardIds: [],
      };
      byId[id] = item;
      items.push(item);
    }
  }

  for (const [surface, doc] of l2Pairs) {
    l2Counts[surface] = doc.entries.length;
    const surfaceIds: string[] = [];
    for (const entry of doc.entries) {
      const id = `L2:${surface}:${entry.id}`;
      if (byId[id]) continue;
      const item: MemoryEvidenceItem = {
        id,
        layer: 'L2',
        key: surface,
        title: entry.text,
        preview: entry.section || surface,
        section: entry.section,
        entryId: entry.id,
        inwardIds: [],
        outwardIds: [],
      };
      byId[id] = item;
      items.push(item);
      l2ByEntryId.set(entry.id, id);
      surfaceIds.push(id);

      for (const ref of entry.refs) {
        const targetId = `L1:${ref}`;
        if (byId[targetId]) {
          if (!item.inwardIds.includes(targetId)) item.inwardIds.push(targetId);
          if (!byId[targetId].outwardIds.includes(id)) byId[targetId].outwardIds.push(id);
        }
      }
    }
    l2BySurface.set(surface, surfaceIds);
  }

  for (const [slot, doc] of l3Pairs) {
    l3Counts[slot] = doc.entries.length;
    for (const entry of doc.entries) {
      const id = `L3:${slot}:${entry.id}`;
      if (byId[id]) continue;
      const item: MemoryEvidenceItem = {
        id,
        layer: 'L3',
        key: slot,
        title: entry.text,
        preview: entry.section || slot,
        section: entry.section,
        entryId: entry.id,
        inwardIds: [],
        outwardIds: [],
      };
      byId[id] = item;
      items.push(item);

      for (const ref of entry.refs) {
        if (ref.startsWith('m_')) {
          const targetId = l2ByEntryId.get(ref);
          if (targetId && byId[targetId]) {
            if (!item.inwardIds.includes(targetId)) item.inwardIds.push(targetId);
            if (!byId[targetId].outwardIds.includes(id)) byId[targetId].outwardIds.push(id);
          }
        } else {
          const surfaceKey = ref.includes(':') ? ref.split(':')[0] : ref;
          const surfaceTargets = l2BySurface.get(surfaceKey) ?? [];
          for (const targetId of surfaceTargets.slice(0, 5)) {
            if (!item.inwardIds.includes(targetId)) item.inwardIds.push(targetId);
            if (!byId[targetId].outwardIds.includes(id)) byId[targetId].outwardIds.push(id);
          }
        }
      }
    }
  }

  return { items, byId, l1Counts, l2Counts, l3Counts };
}

export async function listImportedConversations(
  workspace: string,
  limit = 50,
  offset = 0,
  signal?: AbortSignal,
): Promise<ImportedSessionSummary[]> {
  const { data } = await api.get('/imports/chat-history', {
    params: { dt_workspace: workspace, limit: String(limit), offset: String(offset) },
    signal,
  });
  const raw = record(data);
  return list(raw.sessions ?? []).map(item => {
    const prefs =
      item.preferences && typeof item.preferences === 'object' && !Array.isArray(item.preferences)
        ? (item.preferences as Record<string, unknown>)
        : {};
    const imp =
      prefs.import && typeof prefs.import === 'object' && !Array.isArray(prefs.import)
        ? (prefs.import as Record<string, unknown>)
        : {};
    return {
      session_id: typeof item.session_id === 'string' ? item.session_id : '',
      title: typeof item.title === 'string' && item.title.trim() ? item.title : 'New conversation',
      created_at: typeof item.created_at === 'number' ? item.created_at : 0,
      updated_at: typeof item.updated_at === 'number' ? item.updated_at : 0,
      message_count: typeof item.message_count === 'number' ? item.message_count : 0,
      source: typeof imp.source === 'string' ? imp.source : undefined,
      source_cwd: typeof imp.source_cwd === 'string' ? imp.source_cwd : undefined,
      agent_name: typeof imp.agent_name === 'string' ? imp.agent_name : undefined,
    };
  });
}

export async function importConversations(
  workspace: string,
  source: ImportSource,
  sessions: NormalizedImportedSession[],
  agent?: { id: string; name: string },
): Promise<ImportResult> {
  if (!sessions.length) throw new Error('No readable conversations found in the selected file.');
  const { data } = await api.post(
    '/imports/chat-history',
    {
      source,
      sessions,
      agent_id: agent?.id ?? '',
      agent_name: agent?.name ?? '',
    },
    { params: { dt_workspace: workspace } },
  );
  const raw = record(data);
  return {
    imported: typeof raw.imported === 'number' ? raw.imported : 0,
    skipped: typeof raw.skipped === 'number' ? raw.skipped : 0,
    sessions: list(raw.sessions ?? []).map(item => ({
      external_id: typeof item.external_id === 'string' ? item.external_id : '',
      session_id: typeof item.session_id === 'string' ? item.session_id : undefined,
      imported: Boolean(item.imported),
      reason: typeof item.reason === 'string' ? item.reason : undefined,
    })),
  };
}

export async function detectSubagentBackends(
  workspace: string,
  signal?: AbortSignal,
): Promise<SubagentBackend[]> {
  const { data } = await api.get('/subagents/detect', {
    params: { dt_workspace: workspace },
    signal,
  });
  const raw = record(data);
  return list(raw.backends ?? []).map(item => ({
    kind: typeof item.kind === 'string' ? item.kind : '',
    display_name: typeof item.display_name === 'string' ? item.display_name : '',
    available: Boolean(item.available),
    version: typeof item.version === 'string' ? item.version : '',
    detail: typeof item.detail === 'string' ? item.detail : '',
  }));
}

export async function listSubagentConnections(
  workspace: string,
  signal?: AbortSignal,
): Promise<SubagentConnection[]> {
  const { data } = await api.get('/subagents/connections', {
    params: { dt_workspace: workspace },
    signal,
  });
  const raw = record(data);
  return list(raw.connections ?? []).map(item => ({
    name: typeof item.name === 'string' ? item.name : '',
    agent_kind: typeof item.agent_kind === 'string' ? item.agent_kind : '',
    cwd: typeof item.cwd === 'string' ? item.cwd : '',
    description: typeof item.description === 'string' ? item.description : '',
  }));
}

export async function connectSubagentFolder(
  workspace: string,
  payload: { name: string; agent_kind: string; cwd?: string },
): Promise<SubagentConnection> {
  const { data } = await api.post(
    '/subagents/connections',
    {
      name: payload.name.trim(),
      agent_kind: payload.agent_kind.trim(),
      cwd: (payload.cwd ?? '').trim(),
    },
    { params: { dt_workspace: workspace } },
  );
  const raw = record(data);
  return {
    name: typeof raw.name === 'string' ? raw.name : payload.name.trim(),
    agent_kind: typeof raw.agent_kind === 'string' ? raw.agent_kind : payload.agent_kind.trim(),
    cwd: typeof raw.cwd === 'string' ? raw.cwd : (payload.cwd ?? '').trim(),
    description: '',
  };
}

export async function disconnectSubagentFolder(
  workspace: string,
  name: string,
): Promise<boolean> {
  const { data } = await api.delete(`/subagents/connections/${encodeURIComponent(name)}`, {
    params: { dt_workspace: workspace },
  });
  return typeof record(data).status === 'string';
}

function epochSeconds(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value > 10_000_000_000 ? value / 1000 : value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed / 1000;
  }
  return fallback;
}

export function parseImportedConversationsPayload(
  rawText: string,
  fileName: string,
  preferredSource: ImportSource = 'chatgpt',
): { source: ImportSource; sessions: NormalizedImportedSession[] } {
  const nowSec = Math.floor(Date.now() / 1000);
  const trimmed = rawText.trim();
  if (!trimmed) throw new Error('No readable conversations found in the selected file.');

  // Try JSON (ChatGPT conversations.json or direct sessions array)
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const rows = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && Array.isArray((parsed as { conversations?: unknown }).conversations)
          ? ((parsed as { conversations: unknown[] }).conversations)
          : parsed && typeof parsed === 'object' && Array.isArray((parsed as { sessions?: unknown }).sessions)
            ? ((parsed as { sessions: unknown[] }).sessions)
            : null;
      if (rows) {
        const sessions: NormalizedImportedSession[] = [];
        for (const item of rows) {
          if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
          const row = item as Record<string, unknown>;
          // Direct NormalizedImportedSession shape
          if (typeof row.external_id === 'string' && Array.isArray(row.messages)) {
            const msgs = (row.messages as unknown[])
              .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === 'object'))
              .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
              .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: String(m.content).trim(),
              }));
            if (msgs.length) {
              sessions.push({
                external_id: row.external_id,
                title: typeof row.title === 'string' && row.title.trim() ? row.title.trim() : msgs[0].content.slice(0, 80),
                source_cwd: typeof row.source_cwd === 'string' ? row.source_cwd : '',
                created_at: epochSeconds(row.created_at, nowSec),
                updated_at: epochSeconds(row.updated_at, nowSec),
                messages: msgs,
              });
            }
            continue;
          }
          // Official ChatGPT mapping export shape
          const id =
            typeof row.id === 'string' && row.id.trim()
              ? row.id.trim()
              : typeof row.conversation_id === 'string' && row.conversation_id.trim()
                ? row.conversation_id.trim()
                : '';
          const mapping =
            row.mapping && typeof row.mapping === 'object' && !Array.isArray(row.mapping)
              ? (row.mapping as Record<string, unknown>)
              : null;
          if (!id || !mapping) continue;
          const msgs: NormalizedImportedMessage[] = [];
          for (const nodeVal of Object.values(mapping)) {
            if (!nodeVal || typeof nodeVal !== 'object') continue;
            const msg = (nodeVal as { message?: unknown }).message;
            if (!msg || typeof msg !== 'object') continue;
            const msgRec = msg as Record<string, unknown>;
            const author = msgRec.author && typeof msgRec.author === 'object' ? (msgRec.author as Record<string, unknown>) : null;
            const role = typeof author?.role === 'string' ? author.role.toLowerCase() : '';
            if (role !== 'user' && role !== 'assistant') continue;
            const contentObj = msgRec.content && typeof msgRec.content === 'object' ? (msgRec.content as Record<string, unknown>) : null;
            const parts = Array.isArray(contentObj?.parts) ? contentObj.parts : [];
            const text = parts
              .map(p => (typeof p === 'string' ? p.trim() : ''))
              .filter(Boolean)
              .join('\n\n')
              .trim();
            if (!text) continue;
            const created = epochSeconds(msgRec.create_time, 0);
            msgs.push({
              role,
              content: text,
              ...(created ? { created_at: created } : {}),
            });
          }
          if (msgs.length) {
            const createTime = epochSeconds(row.create_time, msgs[0]?.created_at ?? nowSec);
            const updateTime = epochSeconds(row.update_time, createTime);
            sessions.push({
              external_id: id.slice(0, 256),
              title:
                typeof row.title === 'string' && row.title.trim()
                  ? row.title.trim().slice(0, 256)
                  : msgs[0].content.slice(0, 80),
              source_cwd: '',
              created_at: createTime,
              updated_at: Math.max(createTime, updateTime),
              messages: msgs,
            });
          }
        }
        if (sessions.length) return { source: 'chatgpt', sessions };
      }
    } catch {
      // Fall through to JSONL parsing if not a single JSON value
    }
  }

  // JSONL parsing (Claude Code or Codex transcript)
  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  const messages: NormalizedImportedMessage[] = [];
  let detectedSource: ImportSource = preferredSource === 'chatgpt' ? 'claude_code' : preferredSource;
  let cwd = '';
  let externalId = fileName.replace(/\.(jsonl|json)$/i, '') || `import-${nowSec}`;

  for (const line of lines) {
    try {
      const rec = JSON.parse(line) as Record<string, unknown>;
      if (rec.type === 'session_meta' && rec.payload && typeof rec.payload === 'object') {
        detectedSource = 'codex';
        const p = rec.payload as Record<string, unknown>;
        if (typeof p.id === 'string' && p.id) externalId = p.id;
        if (typeof p.cwd === 'string' && p.cwd) cwd = p.cwd;
        continue;
      }
      if (rec.type === 'event_msg' && rec.payload && typeof rec.payload === 'object') {
        detectedSource = 'codex';
        const p = rec.payload as Record<string, unknown>;
        const role = p.type === 'user_message' ? 'user' : p.type === 'agent_message' ? 'assistant' : null;
        const text = typeof p.message === 'string' ? p.message.trim() : '';
        if (role && text) {
          messages.push({ role, content: text, created_at: epochSeconds(rec.timestamp, nowSec) });
        }
        continue;
      }
      if (rec.message && typeof rec.message === 'object') {
        const m = rec.message as Record<string, unknown>;
        const role = m.role === 'user' || m.role === 'assistant' ? m.role : null;
        if (!role) continue;
        if (!cwd && typeof rec.cwd === 'string') cwd = rec.cwd;
        const content =
          typeof m.content === 'string'
            ? m.content.trim()
            : Array.isArray(m.content)
              ? m.content
                  .map(b => (b && typeof b === 'object' && typeof (b as { text?: unknown }).text === 'string' ? String((b as { text: string }).text) : ''))
                  .filter(Boolean)
                  .join('\n')
                  .trim()
              : '';
        if (content) {
          messages.push({ role, content, created_at: epochSeconds(rec.timestamp, nowSec) });
        }
      }
    } catch {
      continue;
    }
  }

  if (!messages.length) throw new Error('No readable conversations found in the selected file.');
  const firstTs = messages[0]?.created_at ?? nowSec;
  const lastTs = messages[messages.length - 1]?.created_at ?? firstTs;
  return {
    source: detectedSource,
    sessions: [
      {
        external_id: externalId.slice(0, 256),
        title: messages[0].content.slice(0, 80),
        source_cwd: cwd,
        created_at: firstTs,
        updated_at: Math.max(firstTs, lastTs),
        messages,
      },
    ],
  };
}

export async function pickAndParseImportFile(
  preferredSource: ImportSource = 'chatgpt',
): Promise<{
  fileName: string;
  source: ImportSource;
  sessions: NormalizedImportedSession[];
} | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  let rawText = '';
  if (Platform.OS === 'web' && asset.file) {
    rawText = await asset.file.text();
  } else {
    const response = await fetch(asset.uri);
    rawText = await response.text();
  }
  const parsed = parseImportedConversationsPayload(rawText, asset.name || 'export.json', preferredSource);
  return {
    fileName: asset.name || 'export.json',
    source: parsed.source,
    sessions: parsed.sessions,
  };
}

const memoryTargetByScope = new Map<string, MemoryTarget>();

export function getMemoryTarget(scopeKey: string): MemoryTarget {
  return memoryTargetByScope.get(scopeKey) ?? { layer: 'L2', key: 'chat' };
}

export function setMemoryTarget(scopeKey: string, target: MemoryTarget): void {
  memoryTargetByScope.set(scopeKey, target);
}
