/** Fields from deeptutor/core/turn_request.py; omitted fields inherit server state. */
export interface TutorConfiguration {
  capability?: string;
  mastery_session_mode?: string;
  knowledge_bases?: string[];
  history_references?: string[];
  notebook_references?: { notebook_id: string; record_ids: string[] }[];
  question_notebook_references?: number[];
  book_references?: { book_id: string; page_ids: string[] }[];
  reading_references?: { material_id: string; revision: number; locators: number[] }[];
  persona?: string | null;
  skills?: string[];
  mcp?: string[];
  answer_by?: string;
  create_target?: string | null;
}

export function configurationFromPreferences(preferences: Record<string, unknown> = {}): TutorConfiguration {
  const result: TutorConfiguration = {};
  for (const key of ['mastery_session_mode', 'capability', 'persona', 'answer_by', 'create_target'] as const) {
    const value = preferences[key];
    if (typeof value === 'string') result[key] = value;
  }
  for (const key of ['skills', 'mcp', 'history_references', 'knowledge_bases'] as const) {
    const value = preferences[key];
    if (Array.isArray(value) && value.every(item => typeof item === 'string')) result[key] = value;
  }
  if (Array.isArray(preferences.book_references)) result.book_references = preferences.book_references.filter((ref): ref is { book_id: string; page_ids: string[] } => !!ref && typeof ref === 'object' && 'book_id' in ref && typeof ref.book_id === 'string' && 'page_ids' in ref && Array.isArray(ref.page_ids));
  if (Array.isArray(preferences.reading_references)) result.reading_references = preferences.reading_references.filter((ref): ref is { material_id: string; revision: number; locators: number[] } => !!ref && typeof ref === 'object' && 'material_id' in ref && typeof ref.material_id === 'string' && 'revision' in ref && typeof ref.revision === 'number' && 'locators' in ref && Array.isArray(ref.locators));
  if (Array.isArray(preferences.notebook_references)) result.notebook_references = preferences.notebook_references.filter((ref): ref is { notebook_id: string; record_ids: string[] } => !!ref && typeof ref === 'object' && 'notebook_id' in ref && typeof ref.notebook_id === 'string' && 'record_ids' in ref && Array.isArray(ref.record_ids) && ref.record_ids.every((id: unknown) => typeof id === 'string'));
  if (Array.isArray(preferences.question_notebook_references)) result.question_notebook_references = preferences.question_notebook_references.filter((id): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0);
  return result;
}
