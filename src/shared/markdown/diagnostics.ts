/** Development-only metadata: never retain message text, TeX, user IDs or credentials. */
export const RICH_RENDERER_VERSION = 'rich-math-runtime-3';
type Diagnostic = { stage: string; version: string; [key: string]: string | number | boolean };
export function contentFingerprint(source: string) {
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}
export function richDiagnostic(stage: string, details: Record<string, string | number | boolean> = {}) {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  const record: Diagnostic = { ...details, stage, version: RICH_RENDERER_VERSION };
  const runtime = globalThis as typeof globalThis & { __DEEPTUTOR_RICH_CONTENT__?: { version: string; events: Diagnostic[] } };
  const state = runtime.__DEEPTUTOR_RICH_CONTENT__ ??= { version: RICH_RENDERER_VERSION, events: [] };
  state.events.push(record);
  if (state.events.length > 64) state.events.shift();
  if (stage.endsWith('failed')) console.warn('deeptutor-rich-content', record);
}
