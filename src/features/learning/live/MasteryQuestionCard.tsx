import { useState } from 'react';
import { View } from 'react-native';
import { Button, Field } from '@/shared/ui/Controls';
import { InlineAlert } from '@/shared/ui/Feedback';
import { DText } from './LearningText';
import type { MasteryGradeResult, MasteryQuestion } from './mastery-question';

export function MasteryQuestionCard({ question, grade, disabled, skipped, onAnswer }: { question: MasteryQuestion; grade?: MasteryGradeResult; disabled: boolean; skipped: boolean; onAnswer: (text: string, answers?: Record<string, string>) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const items = question.questions ?? [question];
  const visual = items.some(item => !!item.visual);
  const locked = disabled || skipped || !!grade?.final || grade?.isCorrect !== undefined && grade.isCorrect !== null || visual;
  return <View style={{ gap: 16, paddingVertical: 16 }}>
    <DText role="label">Understanding check · {question.objectiveName}</DText>
    {items.map(item => <View key={item.questionId} style={{ gap: 12 }}>
      <DText>{item.prompt}</DText>
      {item.options.map(option => <Button key={option.label} variant="secondary" disabled={locked} accessibilityState={{ selected: answers[item.questionId] === option.label }} onPress={() => setAnswers(previous => ({ ...previous, [item.questionId]: option.label }))}>{`${option.label}. ${option.body}`}</Button>)}
      {(item.allowFreeText || !item.options.length) && <Field label="Assessment answer" value={answers[item.questionId] ?? ''} onChangeText={value => setAnswers(previous => ({ ...previous, [item.questionId]: value }))} multiline editable={!locked} />}
    </View>)}
    {visual && <InlineAlert>Visual assessment requires the source viewer in DeepTutor web. This card cannot be submitted here.</InlineAlert>}
    {skipped && <DText muted>Skipped without changing mastery.</DText>}
    {grade && <View style={{ gap: 8 }}><DText role="label">{grade.isCorrect === true ? 'Correct' : grade.isCorrect === false ? 'Review your answer' : 'Assessment feedback'}</DText><DText>{grade.explanation || grade.feedback}</DText>{grade.results?.map(result => <DText key={result.questionId}>{result.explanation || result.feedback}</DText>)}</View>}
    {!grade && !skipped && <Button disabled={locked || items.some(item => !answers[item.questionId]?.trim())} onPress={() => { const text = question.questions ? items.map(item => `${item.prompt}\n${answers[item.questionId]}`).join('\n\n') : answers[question.questionId].trim(); onAnswer(text, question.questions ? answers : undefined); }}>Submit assessment</Button>}
  </View>;
}
