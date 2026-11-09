import type { Href } from 'expo-router';

export function favoritesHref(notebookId?: string, recordId?: string): Href {
  const params = new URLSearchParams();
  if (notebookId) params.set('notebookId', notebookId);
  if (recordId) params.set('recordId', recordId);
  return `/mobile/31${params.size ? `?${params.toString()}` : ''}` as Href;
}
/** Presentation routes only: never apply this mapping to HTTP API paths. */
export function mobileHref(path: string): string {
  const [pathname, query] = path.split('?');
  const aliases: Record<string, string> = { '/personalization': '/mobile/65', '/settings': '/mobile/81', '/settings/overview': '/mobile/81', '/settings/general': '/mobile/82', '/settings/appearance': '/mobile/83', '/settings/archive': '/mobile/108', '/space/chat-history': '/mobile/27', '/notebooks': '/mobile/31' };
  if (pathname.startsWith('/notebooks/')) return String(favoritesHref(decodeURIComponent(pathname.slice('/notebooks/'.length)), new URLSearchParams(query).get('recordId') ?? undefined));
  return aliases[pathname] ? aliases[pathname] + (query ? `?${query}` : '') : path;
}
