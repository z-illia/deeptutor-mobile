import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Field } from '@/shared/ui/Controls';
import { DText, ListRow } from './LearningText';
import { InlineAlert } from '@/shared/ui/Feedback';
import { ChatMarkdown } from '@/features/chat/ChatMarkdown';
import { chatError } from '@/features/chat/live/useLiveChat';
import { Heading, LearningLayout } from './LearningLayout';
import { bookBlockContent, bookOperation, get, mutate, type Book, type MaterialDetail, type Page } from './repository';
import { useLearningData } from './useLearningData';
import { learningHref } from './LiveLearningScreen';
import { LiveStudyScreen } from './LiveStudyScreen';

export function ReaderScreen({ workspace, id, book }: { workspace: string; id: string; book: boolean }) {
  const params = useLocalSearchParams<{ sessionId?: string; readerChat?: string }>();
  const operation = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => () => operation.current?.abort(), []);
  const [locator, setLocator] = useState<number>();
  const [pageId, setPageId] = useState('');
  const [selection, setSelection] = useState('');
  const [prompt, setPrompt] = useState('');
  const [failure, setFailure] = useState('');
  const [saved, setSaved] = useState(false);
  const readingChat = params.readerChat === '1';
  const [fontSize, setFontSize] = useState(18);
  const load = useCallback(async (signal: AbortSignal) => {
    if (book) {
      const detail = await get<{ book: Book; pages: Page[]; spine?: { chapters: { title: string }[] }; progress: { current_page_id: string } }>(`/books/${encodeURIComponent(id)}?include_blocks=false`, workspace, signal);
      const selectedPage = pageId || detail.progress.current_page_id;
      const page = selectedPage ? (await get<{ page: Page }>(`/books/${encodeURIComponent(id)}/pages/${encodeURIComponent(selectedPage)}`, workspace, signal)).page : undefined;
      return { book: detail, material: undefined, unit: undefined, position: undefined, page };
    }
    const material = await get<MaterialDetail>(`/reading/materials/${encodeURIComponent(id)}`, workspace, signal);
    const position = await get<{ locator: number; percentage: number }>(`/reading/materials/${encodeURIComponent(id)}/position`, workspace, signal);
    const unit = await get<{ text: string; locator: number }>(`/reading/materials/${encodeURIComponent(id)}/units/${locator ?? position.locator ?? 1}`, workspace, signal);
    return { material, position, unit, book: undefined, page: undefined };
  }, [book, workspace, id, locator, pageId]);
  const state = useLearningData(load);
  const material = state.data?.material;
  const bookAction = async (action: string) => {
    const detail = state.data?.book;
    if (!detail || operation.current) return;
    const abort = new AbortController(); operation.current = abort; setBusy(true); setFailure('');
    try {
      if (action === 'confirm_proposal') await bookOperation(workspace, { type: action, book_id: id, expected_revision: detail.book.revision }, 'confirm_proposal_result', abort.signal);
      else await mutate('post', action === 'confirm_spine' ? '/books/confirm-spine' : `/books/${action}`, workspace, { book_id: id, expected_revision: detail.book.revision, ...(action === 'confirm_spine' ? { auto_compile: true } : {}) });
      if (!abort.signal.aborted) state.refresh();
    } catch (cause) { if (!abort.signal.aborted) setFailure(chatError(cause)); }
    finally { operation.current = null; setBusy(false); }
  };
  if (readingChat && material) return <LiveStudyScreen workspace={workspace} pathId="" sessionId={params.sessionId || null} onLeave={() => router.setParams({ readerChat: '0' })} prompt={prompt} reading={{ workspace_id: workspace, workspace_mode: 'reading', reading_material_id: id, ...(material.revision ? { reading_material_revision: material.revision } : {}) }} />;
  const current = state.data?.unit?.locator ?? locator ?? 1;
  const ask = (action: string) => {
    if (!selection.trim()) { setFailure('Select or paste a passage first.'); return; }
    setPrompt(`${action}:\n\n${selection.trim()}`); router.setParams({ readerChat: '1' });
  };
  return <LearningLayout title={book ? state.data?.book?.book.title ?? 'Book' : 'Read & understand'} loading={state.loading} error={state.error} refresh={state.refresh}>
    {!!failure && <InlineAlert tone="danger">{failure}</InlineAlert>}
    {book && state.data?.book && <>
      <Heading>{state.data.book.book.title}</Heading><DText muted>{state.data.book.book.status}</DText>
      {state.data.book.book.proposal && <View style={{ gap: 12 }}><DText role="label">Book proposal</DText><DText>{state.data.book.book.proposal.description}</DText></View>}
      {state.data.book.spine?.chapters.map((chapter, index) => <DText key={index}>{`${index + 1}. ${chapter.title}`}</DText>)}
      {state.data.book.book.can_edit !== false && <>
        {state.data.book.book.status === 'draft' && <Button loading={busy} onPress={() => void bookAction('confirm_proposal')}>Approve proposal and design chapters</Button>}
        {state.data.book.book.status === 'spine_ready' && <Button loading={busy} onPress={() => void bookAction('confirm_spine')}>Compile book</Button>}
        {state.data.book.book.status === 'paused' && <Button loading={busy} onPress={() => void bookAction('resume')}>Resume compilation</Button>}
        {state.data.book.book.status === 'compiling' && <Button loading={busy} onPress={() => void bookAction('pause')}>Pause compilation</Button>}
      </>}
      <Button variant="secondary" onPress={state.refresh}>Refresh book status</Button>
      {[...state.data.book.pages].sort((a, b) => a.order - b.order).map(page => <ListRow key={page.id} title={page.title} description={page.status} selected={page.id === pageId} onPress={() => { setSaved(false); setPageId(page.id); }} />)}
      {state.data.page && <View style={{ gap: 24 }}><Heading>{state.data.page.title}</Heading>{state.data.page.blocks.map(block => <View key={block.id} style={{ gap: 8 }}><DText role="label">{block.title}</DText>{bookBlockContent(block.payload) ? <ChatMarkdown learning content={bookBlockContent(block.payload)} /> : <DText muted>{block.error || `${block.type} · ${block.status}. Open this block in DeepTutor web.`}</DText>}</View>)}</View>}
      {state.data.page && <Button variant="secondary" disabled={saved} onPress={() => { void mutate('post', '/books/progress/visit', workspace, { book_id: id, page_id: state.data!.page!.id }).then(() => setSaved(true)).catch(cause => setFailure(chatError(cause))); }}>{saved ? 'Position saved' : 'Save reading position'}</Button>}
      <DText muted>Interactive visual blocks are available in DeepTutor web.</DText>
    </>}
    {material && <>
      <DText muted>{material.title} · Section {current} of {material.unit_count}</DText>
      <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>{material.outline.map(unit => <Button key={unit.locator} variant="secondary" disabled={state.loading} onPress={() => { setSaved(false); setLocator(unit.locator); }}>{unit.title || `Section ${unit.locator}`}</Button>)}</ScrollView>
      <View style={{ flexDirection: 'row', gap: 8 }}><Button variant="secondary" disabled={current <= 1 || state.loading} onPress={() => { setSaved(false); setLocator(current - 1); }}>Previous</Button><Button variant="secondary" disabled={current >= material.unit_count || state.loading} onPress={() => { setSaved(false); setLocator(current + 1); }}>Next</Button><Button variant="ghost" accessibilityLabel="Change reading text size" onPress={() => setFontSize(value => value === 18 ? 22 : 18)}>Aa</Button></View>
      <DText selectable style={{ fontSize, lineHeight: fontSize * 1.6 }}>{state.data?.unit?.text || 'Text is unavailable for this section. Open the original material in DeepTutor web.'}</DText>
      <Button variant="secondary" disabled={state.loading || saved} onPress={() => {
        setFailure(''); void mutate('put', `/reading/materials/${encodeURIComponent(id)}/position`, workspace, { locator: current, source_anchor: '' }).then(() => setSaved(true)).catch(cause => setFailure(chatError(cause)));
      }}>{saved ? 'Position saved' : 'Save reading position'}</Button>
      <Field label="Selected passage" hint="Copy a passage from the selectable reading text and paste it here." value={selection} onChangeText={setSelection} multiline style={{ minHeight: 80 }} />
      {['Explain selection', 'Translate', 'Vocabulary help', 'Practice this passage', 'Ask tutor about this passage'].map(action => <Button key={action} variant="secondary" disabled={!selection.trim()} onPress={() => ask(action)}>{action}</Button>)}
      <DText muted>Read aloud and visual PDF/EPUB rendering are available in DeepTutor web.</DText>
    </>}
    <Button variant="ghost" onPress={() => router.replace(learningHref(book ? 'books' : 'reading', workspace))}>Back to {book ? 'Books' : 'Reading'}</Button>
  </LearningLayout>;
}
