// In-process presentation projections only; never server/auth contracts.
import { normalizeInternalReturnPath } from './return-path';
export type Principal = 'admin' | 'standard' | 'learner';
export type EntryMode = Principal | 'disabled' | 'signed-out' | 'first-user' | 'closed' | 'temporary' | 'loading' | 'unavailable';
export type ResourceState = 'ready' | 'loading' | 'empty' | 'error' | 'denied' | 'unavailable';
export type WorkspaceId = '' | 'fixture-ws-a' | 'fixture-ws-b';
export const workspaces: readonly { id: WorkspaceId; name: string }[] = [{ id: '', name: 'General workspace' }, { id: 'fixture-ws-a', name: 'Mathematics · A' }, { id: 'fixture-ws-b', name: 'Mathematics · B' }];
export const entryModes: readonly EntryMode[] = ['disabled', 'admin', 'standard', 'learner', 'signed-out', 'first-user', 'closed', 'temporary', 'loading', 'unavailable'];
export type Profile = { id: string; username: string; role: 'admin' | 'user' | 'teacher' | 'student'; avatar: string; mustChange: boolean; joined: string };
export function principalFor(mode: EntryMode): Profile | null {
  const role: Principal | null = mode === 'temporary' ? 'standard' : ['admin', 'standard', 'learner'].includes(mode) ? mode as Principal : null;
  return role ? { id: `fixture-${role}`, username: `fixture-${role}`, role: role === 'admin' ? 'admin' : 'user', avatar: '', mustChange: mode === 'temporary', joined: '2026-01-15' } : null;
}
export function canSettings(mode: EntryMode) { return !['loading', 'unavailable', 'signed-out', 'first-user', 'closed'].includes(mode); }
export function catalogEditable(mode: EntryMode) { return mode === 'admin' || mode === 'disabled'; }
export function normalizeDestination(raw?: string | null) {
  const safe = normalizeInternalReturnPath(raw, '/chat');
  const parsed = new URL(safe, 'https://deeptutor.invalid');
  if (['/login', '/register', '/'].includes(parsed.pathname)) return '/chat';
  const aliases: Record<string, string> = { '/settings': '/settings/general', '/settings/overview': '/settings/general' };
  parsed.pathname = aliases[parsed.pathname] || parsed.pathname;
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
export function switchDestination(path: string) {
  if (/^\/(partners|personalization|agents|profile|settings|memory)(\/|$)/.test(path) || /^\/space\/(personas|skills|mcp|cli-apps)(\/|$)/.test(path)) return path;
  if (/^\/chat\//.test(path)) return '/chat';
  if (/^\/learning\/mastery\//.test(path)) return '/learning/mastery';
  if (/^\/learning\/books\//.test(path)) return '/learning/books';
  if (/^\/learning\/reading\//.test(path)) return '/learning/reading';
  if (/^\/notebooks\//.test(path)) return '/notebooks';
  return path;
}
export type Preferences = { language: 'en' | 'zh' | 'fr' | 'de' | 'uk' | 'pl' | 'pt' | 'vi' | 'ja' | 'tr'; responseLanguage: string; layout: 'classic' | 'modern'; theme: 'system' | 'snow' | 'cream' | 'dark' | 'glass'; scale: number; spacing: 'compact' | 'normal' | 'relaxed'; codeTheme: string; lineNumbers: boolean; wrap: boolean };
export const defaultPreferences: Preferences = { language: 'en', responseLanguage: 'en', layout: 'modern', theme: 'system', scale: 100, spacing: 'normal', codeTheme: 'oneDark', lineNumbers: true, wrap: false };
export type SettingsState = { active: Preferences; staged: Preferences; saved: Preferences | null; phase: 'clean' | 'unsaved' | 'saved-draft' | 'applied' };
export function settingsTransition(state: SettingsState, action: { type: 'edit'; patch: Partial<Preferences> } | { type: 'save' | 'apply' | 'discard' }) : SettingsState {
  if (action.type === 'edit') return { ...state, staged: { ...state.staged, ...action.patch }, phase: 'unsaved' };
  if (action.type === 'save') return { ...state, saved: { ...state.staged }, phase: 'saved-draft' };
  if (action.type === 'discard') return { ...state, staged: { ...state.active }, saved: null, phase: 'clean' };
  return { active: { ...state.staged }, staged: { ...state.staged }, saved: null, phase: 'applied' };
}
export function passwordError(current: string, next: string, confirmation: string, expected: string) {
  if (next.length < 8) return 'Password must be at least 8 characters';
  if (next !== confirmation) return 'Passwords do not match';
  if (current !== expected) return 'Current password is incorrect';
  return null;
}
export function avatarError(size: number, decoded: boolean) { return size > 20 * 1024 * 1024 ? 'Image is too large' : !decoded ? 'Could not decode image' : null; }

// Source nav-entries policy + account admin elevation. Fixture learner has chat/reading surfaces.
export function allowedDestination(mode: EntryMode, path: string) {
  if (path.startsWith('/admin/')) return mode === 'admin';
  if (mode === 'learner' && /^\/(agents|co-writer|learning\/(books|mastery|practice))(\/|$)/.test(path)) return false;
  return true;
}
