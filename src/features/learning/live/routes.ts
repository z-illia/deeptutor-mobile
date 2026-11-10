import type { Href } from 'expo-router';

export function learningHref(view: string, workspace = '', pathId = '', extra: Record<string, string> = {}): Href {
  return `/learning/live?${new URLSearchParams({ view, workspace, pathId, ...extra })}` as Href;
}
