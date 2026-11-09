import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, Field } from '@/shared/ui/Controls';
import { DText } from './LearningText';
import { InlineAlert } from '@/shared/ui/Feedback';
import { chatError } from '@/features/chat/live/useLiveChat';
import { commandId } from '@/features/chat/live/protocol';
import { Heading, LearningLayout } from './LearningLayout';
import { get, mutate, type PracticeQuestion } from './repository';
import { useLearningData } from './useLearningData';
const root = '/question-notebook/practice';
export function PracticeScreen({ workspace }: { workspace: string }) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<string>();
  const [failure, setFailure] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const state = useLearningData(useCallback(async (signal: AbortSignal) => {
    const timezone = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    const summary = await get<{ total: number; due: number; reviewed_today: number }>(`${root}/summary?timezone=${timezone}`, workspace, signal);
    const queue = await get<PracticeQuestion[]>(`${root}/queue?timezone=${timezone}`, workspace, signal);
    return { summary, queue };
  }, [workspace]));
  const question = state.data?.queue[0];
  const run = async (rating?: string) => {
    if (!question || lock.current) return;
    lock.current = true; setBusy(true); setFailure('');
    try {
      const path = `${root}/questions/${question.entry.id}`;
      if (!rating) { const checked = await mutate<{ correct: boolean | null }>('post', `${path}/check`, question.content_workspace_id ?? workspace, { answer }); setResult(checked.correct === null ? 'Self assessment required. Rate your recall below.' : checked.correct ? 'Correct' : 'Try again, or rate your recall below.'); }
      else { await mutate('post', `${path}/review`, question.content_workspace_id ?? workspace, { request_id: commandId(), version: question.state.version, rating, answer }); setAnswer(''); setResult(undefined); state.refresh(); }
    } catch (cause) { setFailure(chatError(cause)); } finally { lock.current = false; setBusy(false); }
  };
  return <LearningLayout title="Practice" loading={state.loading} error={state.error} refresh={state.refresh}>
    {state.data && <DText muted>{state.data.summary.total} questions · {state.data.summary.due} due · {state.data.summary.reviewed_today} reviewed today</DText>}
    {!!failure && <InlineAlert tone="danger">{failure}</InlineAlert>}
    {question ? <View style={{ gap: 24 }} key={question.entry.id}><Heading>{question.entry.question}</Heading>
      {Object.entries(question.entry.options ?? {}).map(([key, value]) => <Button key={key} variant="secondary" accessibilityState={{ selected: answer === key }} onPress={() => { setAnswer(key); setResult(undefined); }}>{`${key}. ${value}`}</Button>)}
      <Field label="Your answer" multiline value={answer} onChangeText={value => { setAnswer(value); setResult(undefined); }} />
      <Button loading={busy} disabled={!answer.trim() || state.loading} onPress={() => void run()}>Check answer</Button>
      {!!result && <><InlineAlert>{result}</InlineAlert><DText muted>How well did you recall it?</DText>{['again', 'hard', 'good', 'easy'].map(rating => <Button key={rating} variant="secondary" disabled={busy || state.loading} onPress={() => void run(rating)}>{rating}</Button>)}</>}
    </View> : !state.loading && !state.error ? <><Heading>Nothing due right now.</Heading><DText muted>Add questions to your question bank in DeepTutor web. Practice progress here uses the server’s review schedule.</DText></> : null}
  </LearningLayout>;
}
