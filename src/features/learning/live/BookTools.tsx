import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, Field } from '@/shared/ui/Controls';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { DText } from './LearningText';
import { InlineAlert } from '@/shared/ui/Feedback';
import { chatError } from '@/features/chat/live/useLiveChat';
import { bookOperation, type Book } from './repository';

export function BookTools({ workspace, onCreated, canCreate }: { workspace: string; canCreate: boolean; onCreated: (book: Book) => void }) {
  const { language } = useDesign();
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const operation = useRef<AbortController | null>(null);
  useEffect(() => () => operation.current?.abort(), []);
  const create = async () => {
    if (operation.current) return;
    const abort = new AbortController(); operation.current = abort; setBusy(true); setError('');
    try {
      const result = await bookOperation<{ type: string; book: Book }>(workspace, { type: 'create', user_intent: goal.trim(), language, fallback_language: language }, 'create_result', abort.signal);
      if (!abort.signal.aborted) { setOpen(false); onCreated(result.book); }
    } catch (cause) { if (!abort.signal.aborted) setError(chatError(cause)); }
    finally { operation.current = null; setBusy(false); }
  };
  return <>
    <Button variant="secondary" disabled={!canCreate} onPress={() => setOpen(true)}>Open book tools</Button>
    {!canCreate && <DText muted>Book creation is unavailable for this account or workspace.</DText>}
    <FullScreenModal open={open} title="Create a book" onClose={() => { if (!busy) setOpen(false); }}>
      <View style={{ padding: 20, gap: 20 }}>
        <DText>Describe the book you want. You can review its proposal before compiling chapters.</DText>
        <Field label="Book goal" value={goal} onChangeText={setGoal} multiline style={{ minHeight: 140 }} />
        {!!error && <InlineAlert tone="danger">{error}</InlineAlert>}
        <Button loading={busy} disabled={!goal.trim()} onPress={() => void create()}>Generate book proposal</Button>
        {busy && <DText muted>The server is preparing your proposal. Leaving the screen may interrupt this request; check Books before trying again.</DText>}
      </View>
    </FullScreenModal>
  </>;
}
