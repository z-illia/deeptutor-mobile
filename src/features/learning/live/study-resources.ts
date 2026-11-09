import type { TutorConfiguration } from '@/features/chat/live/configuration';
import type { OutgoingAttachment } from '@/features/chat/live/protocol';
import { get, type Source } from './repository';
export type ResourceKind = 'files' | 'history' | 'books' | 'favorites' | 'questions' | 'knowledge' | 'reading';
export type ResourceOption = { id: string; label: string; detail?: string; available: boolean; revision?: number };
export const resourceTypes = [
  { id: 'files', label: 'Attach files' }, { id: 'history', label: 'Chat History' },
  { id: 'books', label: 'Books' }, { id: 'favorites', label: 'Favorites' },
  { id: 'questions', label: 'Question Bank' }, { id: 'knowledge', label: 'Knowledge' },
  { id: 'reading', label: 'Reading materials' },
] as const;
export function selectedResourceIds(config: TutorConfiguration, kind: ResourceKind): string[] {
  switch (kind) {
    case 'knowledge': return config.knowledge_bases ?? [];
    case 'history': return config.history_references ?? [];
    case 'books': return (config.book_references ?? []).map(ref => ref.book_id);
    case 'favorites': return (config.notebook_references ?? []).map(ref => ref.notebook_id);
    case 'questions': return (config.question_notebook_references ?? []).map(String);
    case 'reading': return (config.reading_references ?? []).map(ref => ref.material_id);
    default: return [];
  }
}
export function toggleResource(config: TutorConfiguration, kind: ResourceKind, option: ResourceOption): TutorConfiguration {
  const remove = selectedResourceIds(config, kind).includes(option.id);
  switch (kind) {
    case 'knowledge': return { ...config, knowledge_bases: remove ? config.knowledge_bases?.filter(id => id !== option.id) : [...(config.knowledge_bases ?? []), option.id] };
    case 'history': return { ...config, history_references: remove ? config.history_references?.filter(id => id !== option.id) : [...(config.history_references ?? []), option.id] };
    case 'books': return { ...config, book_references: remove ? config.book_references?.filter(ref => ref.book_id !== option.id) : [...(config.book_references ?? []), { book_id: option.id, page_ids: [] }] };
    case 'favorites': return { ...config, notebook_references: remove ? config.notebook_references?.filter(ref => ref.notebook_id !== option.id) : [...(config.notebook_references ?? []), { notebook_id: option.id, record_ids: [] }] };
    case 'questions': {
      const id = Number(option.id);
      if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid question identifier.');
      return { ...config, question_notebook_references: remove ? config.question_notebook_references?.filter(value => value !== id) : [...(config.question_notebook_references ?? []), id] };
    }
    case 'reading': {
      if (!remove && !option.revision) throw new Error('This material has no readable revision.');
      return { ...config, reading_references: remove ? config.reading_references?.filter(ref => ref.material_id !== option.id) : [...(config.reading_references ?? []), { material_id: option.id, revision: option.revision!, locators: [] }] };
    }
    default: return config;
  }
}
export function activeResourceCount(config: TutorConfiguration, sources: Source[], files: OutgoingAttachment[] = []): number {
  return sources.filter(source => source.kind !== 'goal').length + files.length + resourceTypes.reduce((count, kind) => count + selectedResourceIds(config, kind.id).length, 0);
}
export async function loadResourceOptions(kind: ResourceKind | null, workspace: string, sessionId: string | null, signal: AbortSignal): Promise<ResourceOption[]> {
  if (!kind || kind === 'files') return [];
  if (kind === 'knowledge') return (await get<{ name: string; status?: string; available?: boolean }[]>('/knowledge-bases', workspace, signal)).map(item => ({ id: item.name, label: item.name, detail: item.status, available: item.available !== false }));
  if (kind === 'books') return (await get<{ books: { id: string; title: string; status: string }[] }>('/books', workspace, signal)).books.map(item => ({ id: item.id, label: item.title, detail: item.status, available: true }));
  if (kind === 'history') return (await get<{ sessions: { session_id: string; title: string; preferences?: { archived?: boolean } }[] }>('/sessions?limit=50&offset=0', workspace, signal)).sessions.filter(item => item.session_id !== sessionId && !item.preferences?.archived).map(item => ({ id: item.session_id, label: item.title || 'Untitled conversation', available: true }));
  if (kind === 'favorites') return (await get<{ notebooks: { id: string; name: string; record_count?: number; unreadable?: boolean }[] }>('/notebooks', workspace, signal)).notebooks.map(item => ({ id: item.id, label: item.name, detail: `${item.record_count ?? 0} saved items · entire collection`, available: !item.unreadable }));
  if (kind === 'questions') return (await get<{ items: { id: number; question: string }[] }>('/question-notebook/entries?limit=50&offset=0', workspace, signal)).items.map(item => ({ id: String(item.id), label: item.question, available: true }));
  return (await get<{ materials: { material_id: string; title: string; status: string }[] }>('/reading/library/materials', workspace, signal)).materials.map(item => ({ id: item.material_id, label: item.title, detail: item.status, available: item.status === 'ready' }));
}

export async function resolveResourceLabels(config: TutorConfiguration, workspace: string, signal: AbortSignal): Promise<Record<string, string>> {
  const requests = resourceTypes.flatMap(kind => selectedResourceIds(config, kind.id).map(async id => {
    let label = id;
    if (kind.id === 'history') label = (await get<{ title: string }>(`/sessions/${encodeURIComponent(id)}`, workspace, signal)).title;
    else if (kind.id === 'books') label = (await get<{ book: { title: string } }>(`/books/${encodeURIComponent(id)}?include_blocks=false`, workspace, signal)).book.title;
    else if (kind.id === 'favorites') label = (await get<{ name: string }>(`/notebooks/${encodeURIComponent(id)}`, workspace, signal)).name;
    else if (kind.id === 'questions') label = (await get<{ question: string }>(`/question-notebook/entries/${encodeURIComponent(id)}`, workspace, signal)).question;
    else if (kind.id === 'reading') label = (await get<{ title: string }>(`/reading/materials/${encodeURIComponent(id)}`, workspace, signal)).title;
    return [`${kind.id}:${id}`, label] as const;
  }));
  const results = await Promise.allSettled(requests);
  return Object.fromEntries(results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []));
}
