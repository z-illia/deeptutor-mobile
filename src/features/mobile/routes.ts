import type { Href } from 'expo-router';
import { screenPath } from '../navigation/paths';

export function favoritesHref(notebookId?: string, recordId?: string): Href {
  const params = new URLSearchParams();
  if (notebookId) params.set('notebookId', notebookId);
  if (recordId) params.set('recordId', recordId);
  return `/favorites${params.size ? `?${params.toString()}` : ''}` as Href;
}
/** Presentation routes only: never apply this mapping to HTTP API paths. */
export function mobileHref(path: string): string {
  const match = path.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] ?? path;
  const suffix = match?.[2] ?? '';
  const legacy = pathname.match(/^\/mobile\/(\d+)$/);
  if (legacy) return screenPath(legacy[1]) + suffix;
  if (pathname.startsWith('/notebooks/')) {
    try {
      const query = new URLSearchParams(suffix.split('#')[0]);
      return String(favoritesHref(decodeURIComponent(pathname.slice('/notebooks/'.length)), query.get('recordId') ?? undefined)) + (suffix.includes('#') ? '#' + suffix.split('#').slice(1).join('#') : '');
    } catch { return path; }
  }
  const aliases: Record<string, string> = { '/settings/overview': '/settings', '/notebooks': '/favorites', '/space/skills': '/space/personas', '/space/cli-apps': '/settings/agents', '/whisper': '/settings/voice' };
  return (aliases[pathname] ?? pathname) + suffix;
}
