import { isAxiosError } from 'axios';
import { api } from '@/api/client';
import { defaultPreferences, type Preferences } from '@/features/entry/model';
import codeOptions from './code-options.json';
import responseLanguages from './response-languages.json';

export type UiSettings = Record<string, unknown>;
export async function readRemote(path: string, signal?: AbortSignal): Promise<unknown> {
  return (await api.get(path, { signal })).data;
}
export async function writeRemote(path: string, method: 'put' | 'post' | 'patch', payload: unknown, signal?: AbortSignal): Promise<unknown> {
  return (await api[method](path, payload, { signal })).data;
}
export async function importUserFile(file: { file?: File; uri: string; name: string; mimeType?: string }): Promise<unknown> {
  const form = new FormData();
  if (file.file) form.append('file', file.file, file.name);
  else form.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'text/csv' } as unknown as Blob);
  return (await api.post('/auth/users/import', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
}
export type Draft = { catalog: Record<string, unknown> | null; extensions: Record<string, unknown> };
const fields = {
  theme: 'theme', language: 'language', responseLanguage: 'response_language', scale: 'content_font_scale', spacing: 'content_line_spacing',
  codeTheme: 'code_block_theme', lineNumbers: 'code_block_show_line_numbers', wrap: 'code_block_wrap_long_lines',
} as const;
const languages = ['en', 'zh', 'fr', 'de', 'uk', 'pl', 'pt', 'vi', 'ja', 'tr'];
export const settingsOwner = (server: string, id: string) => JSON.stringify([server, id]);
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

export function settingsError(cause: unknown) {
  if (isAxiosError(cause)) {
    const detail = cause.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    return cause.response?.status === 403 ? 'This settings page is unavailable.' : 'Failed to save';
  }
  return cause instanceof Error ? cause.message : 'Failed to save';
}

export function preferencesFromUi(ui: UiSettings, layout: Preferences['layout']): Preferences {
  const theme = ui.theme === 'light' ? 'cream' : ['system', 'snow', 'dark', 'glass'].includes(String(ui.theme)) ? ui.theme as Preferences['theme'] : defaultPreferences.theme;
  const flag = (value: unknown) => value === true || (typeof value === 'string' && value.toLowerCase() === 'true');
  return {
    theme, layout,
    language: languages.includes(String(ui.language)) ? ui.language as Preferences['language'] : 'en',
    responseLanguage: responseLanguages.some(item => item.value === ui.response_language) ? ui.response_language as string : languages.includes(String(ui.language)) ? String(ui.language) : 'en',
    scale: [90, 100, 110, 125, 150].includes(ui.content_font_scale as number) ? ui.content_font_scale as number : 100,
    spacing: ['compact', 'normal', 'relaxed'].includes(String(ui.content_line_spacing)) ? ui.content_line_spacing as Preferences['spacing'] : 'normal',
    codeTheme: codeOptions.some(item => item.id === ui.code_block_theme) ? ui.code_block_theme as string : defaultPreferences.codeTheme,
    lineNumbers: flag(ui.code_block_show_line_numbers),
    wrap: flag(ui.code_block_wrap_long_lines),
  };
}
export function preferencesToUi(preferences: Preferences): UiSettings {
  return Object.fromEntries(Object.entries(fields).map(([key, field]) => [field, key === 'theme' && preferences.theme === 'cream' ? 'light' : preferences[key as keyof typeof fields]]));
}
export function uiPatch(active: Preferences, staged: Preferences): UiSettings {
  const baseline = preferencesToUi(active), next = preferencesToUi(staged);
  return Object.fromEntries(Object.entries(next).filter(([key, value]) => value !== baseline[key]));
}
export function ownedDraft(draft: Draft | null) {
  const ui = object(draft?.extensions.ui) ? draft.extensions.ui : {};
  return { ui: Object.fromEntries(Object.values(fields).filter(key => key in ui).map(key => [key, ui[key]])), layout: draft?.extensions['ui-layout'] };
}
export function restoreStaged(active: Preferences, draft: Draft | null): Preferences {
  const owned = ownedDraft(draft);
  const layout = owned.layout === 'classic' || owned.layout === 'modern' ? owned.layout : active.layout;
  return preferencesFromUi({ ...preferencesToUi(active), ...owned.ui }, layout);
}
export function hasOwnedDraft(draft: Draft | null) {
  const owned = ownedDraft(draft);
  return Object.keys(owned.ui).length > 0 || owned.layout !== undefined;
}
export function clearOwnedDraft(draft: Draft | null): Draft {
  const extensions = { ...draft?.extensions };
  const ui = object(extensions.ui) ? { ...extensions.ui } : {};
  for (const field of Object.values(fields)) delete ui[field];
  if (Object.keys(ui).length) extensions.ui = ui; else delete extensions.ui;
  delete extensions['ui-layout'];
  return { catalog: draft?.catalog ?? null, extensions };
}
export function composeDraft(current: Draft | null, active: Preferences, staged: Preferences): Draft {
  const next = clearOwnedDraft(current);
  const patch = uiPatch(active, staged);
  if (Object.keys(patch).length) next.extensions.ui = { ...(object(next.extensions.ui) ? next.extensions.ui : {}), ...patch };
  if (staged.layout !== active.layout) next.extensions['ui-layout'] = staged.layout;
  return next;
}
export function assertDraftUnchanged(expected: Draft | null, latest: Draft | null) {
  if (JSON.stringify(ownedDraft(expected)) !== JSON.stringify(ownedDraft(latest))) throw new Error('Settings changed on the server. Reload before saving.');
}

export async function getUi(signal?: AbortSignal): Promise<UiSettings> {
  const { data } = await api.get('/settings', { signal });
  if (!object(data?.ui)) throw new Error('Failed to load settings');
  return data.ui;
}
function parseDraft(data: unknown): Draft | null {
  if (!object(data) || !('draft' in data)) throw new Error('Failed to load settings');
  if (data.draft === null) return null;
  if (!object(data.draft) || !object(data.draft.extensions)) throw new Error('Failed to load settings');
  return { catalog: object(data.draft.catalog) ? data.draft.catalog : null, extensions: data.draft.extensions };
}
export async function getDraft(signal?: AbortSignal) { return parseDraft((await api.get('/settings/draft', { signal })).data); }
export async function putDraft(draft: Draft, signal?: AbortSignal) {
  return parseDraft((await api.put('/settings/draft', draft, { signal })).data);
}
export async function removeOwnedDraft(current: Draft | null, signal?: AbortSignal) {
  const remaining = clearOwnedDraft(current);
  if (remaining.catalog || Object.keys(remaining.extensions).length) return putDraft(remaining, signal);
  return parseDraft((await api.delete('/settings/draft', { signal })).data);
}
export async function putUi(patch: UiSettings, signal?: AbortSignal): Promise<UiSettings> {
  const { data } = await api.put('/settings/ui', patch, { signal });
  if (!object(data)) throw new Error('Failed to save');
  return data;
}
