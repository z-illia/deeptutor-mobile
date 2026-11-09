import type { Topic } from './repository';
export type StudyStrategy = 'quick-check' | 'teach-me' | 'challenge';
export const studyStrategies = [
  { id: 'quick-check', title: 'Quick Check', subtitle: 'Check what you know', icon: 'check' },
  { id: 'teach-me', title: 'Teach Me', subtitle: 'Explain + example', icon: 'lightbulb' },
  { id: 'challenge', title: 'Challenge', subtitle: 'Solve a scenario', icon: 'challenge' },
] as const;

/** No strategy REST endpoint exists: mastery tools interpret this turn in the current session. */
export function studyPrompt(strategy: StudyStrategy | 'hint' | 'defer', topic: Topic): string {
  const objective = topic.next.knowledge_point_name;
  const point = topic.map.modules.flatMap(module => module.knowledge_points).find(item => item.id === topic.next.knowledge_point_id);
  const context = `Current objective: ${objective} (ID: ${topic.next.knowledge_point_id}). Learning path: ${topic.name}.`;
  const instructions = {
    'quick-check': 'Assess what I already know about this objective. Ask a short diagnostic question and wait for my answer before grading; do not claim mastery without evidence.',
    'teach-me': 'Teach me this objective intuitively, with one concrete worked example, before quizzing me. Adapt to my recorded learning profile.',
    challenge: 'Give me one practical, challenging scenario for this objective, adapted to my current mastery. Let me attempt it before showing a solution.',
    hint: 'Give me a hint for the current question without revealing the answer.',
    defer: 'Defer this objective using the learning tools and help me choose what to study next. Preserve earned mastery.',
  };
  return `${instructions[strategy]}\n\n${context}${point ? ` Current mastery status: ${point.status}.` : ''} Preserve this session, learner context, and selected resources.`;
}

/** Only split an exact backend-supplied question; never guess where prose becomes an assessment. */
export function splitCurrentQuestion(content: string, prompt?: string): { explanation: string; question: string } {
  const question = prompt?.trim();
  const text = content.trimEnd();
  if (question && text.endsWith(question)) return { explanation: text.slice(0, -question.length).trimEnd(), question };
  return { explanation: content, question: '' };
}
