/** Fields from deeptutor/core/turn_request.py; omitted fields inherit server state. */
export interface TutorConfiguration {
  capability?: string;
  persona?: string | null;
  skills?: string[];
  mcp?: string[];
  answer_by?: string;
  create_target?: string | null;
}

export function configurationFromPreferences(preferences: Record<string, unknown> = {}): TutorConfiguration {
  const result: TutorConfiguration = {};
  for (const key of ['capability', 'persona', 'answer_by', 'create_target'] as const) {
    const value = preferences[key];
    if (typeof value === 'string') result[key] = value;
  }
  for (const key of ['skills', 'mcp'] as const) {
    const value = preferences[key];
    if (Array.isArray(value) && value.every(item => typeof item === 'string')) result[key] = value;
  }
  return result;
}
