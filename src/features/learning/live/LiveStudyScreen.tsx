import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, IconButton } from '@/shared/ui/Controls';
import { DText, ListRow } from './LearningText';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { ChatMarkdown } from '@/features/chat/ChatMarkdown';
import { ModelSelectionDialog } from '@/features/chat/ModelSelectionDialog';
import { TutorComposer } from '@/features/chat/live/TutorComposer';
import { chatError, useLiveChat, type LearningChatContext } from '@/features/chat/live/useLiveChat';
import { get, mutate, progressPath, topicPath, type Topic, type Book, type Material, type MaterialDetail } from './repository';
import { useLearningData } from './useLearningData';
import { collectMasteryGrades, collectMasteryQuestions, collectMasterySkips } from './mastery-question';
import { MasteryQuestionCard } from './MasteryQuestionCard';
import { learningHref } from './LiveLearningScreen';

export function LiveStudyScreen({ workspace, pathId, sessionId, mode, prompt, reading, onLeave }: { workspace: string; pathId: string; sessionId: string | null; mode?: string; prompt?: string; reading?: LearningChatContext; onLeave?: () => void }) {
  const { colors, language } = useDesign();
  const [sessionMode, setSessionMode] = useState<string | undefined>(mode);
  const context: LearningChatContext = reading ?? { workspace_id: workspace, workspace_mode: 'mastery_path', mastery_path_id: pathId, ...(sessionMode ? { mastery_session_mode: sessionMode } : {}) };
  const [initialSessionId] = useState(sessionId);
  const chat = useLiveChat(initialSessionId, context);
  const [resources, setResources] = useState(false);
  const [models, setModels] = useState(false);
  const [failure, setFailure] = useState('');
  const [notice, setNotice] = useState('');
  const operationLock = useRef(false);
  const [actionBusy, setActionBusy] = useState(false);
  const list = useRef<FlatList>(null);
  const follow = useRef(true);
  const initialized = useRef(false);
  const initialScroll = useRef(false);
  useEffect(() => {
    if (chat.loading || !chat.messages.length || initialScroll.current) return;
    initialScroll.current = true;
    const frame = requestAnimationFrame(() => { follow.current = true; list.current?.scrollToEnd({ animated: false }); });
    return () => cancelAnimationFrame(frame);
  }, [chat.loading, chat.messages.length]);
  const committedMessage = chat.messages.at(-1)?.id;
  const grades = collectMasteryGrades(chat.messages);
  const skipped = collectMasterySkips(chat.messages);
  const allQuestions = chat.messages.flatMap(message => [...collectMasteryQuestions(message.events).values()]);
  const latestQuestion = allQuestions.at(-1)?.questionId;
  const load = useCallback(async (signal: AbortSignal) => { void committedMessage; return pathId ? get<Topic>(topicPath(pathId), workspace, signal) : undefined; }, [pathId, workspace, committedMessage]);
  const topic = useLearningData(load);
  const catalog = useLearningData(useCallback((signal: AbortSignal) => resources ? get<{ name: string; available?: boolean; status?: string }[]>('/knowledge-bases', workspace, signal) : Promise.resolve([]), [resources, workspace]));
  useEffect(() => {
    if (!chat.loading && !topic.loading && !initialized.current) {
      initialized.current = true;
      if (!sessionId && prompt) chat.setDraft(prompt);
      else if (!sessionId && topic.data && !topic.data.map.modules.length) { chat.setDraft('Help me design a learning route for my goal.'); }
    }
  }, [chat, sessionId, prompt, topic.data, topic.loading]);
  useEffect(() => {
    if (!sessionId && chat.serverSessionId) {
      router.setParams({ sessionId: chat.serverSessionId });
    }
  }, [sessionId, chat.serverSessionId, chat.busy, chat.loading, chat.error]);
  const changeMode = async (next: string) => {
    if (actionBusy) return;
    setFailure(''); setActionBusy(true);
    try {
      if (chat.serverSessionId) await mutate('put', `${topicPath(pathId)}/sessions/${encodeURIComponent(chat.serverSessionId)}/mode`, workspace, { mode: next });
      setSessionMode(next);
    } catch (cause) { setFailure(chatError(cause)); } finally { setActionBusy(false); }
  };
  const skipQuestion = async () => {
    if (operationLock.current) return;
    operationLock.current = true; setActionBusy(true); setFailure('');
    try { await mutate('post', `${progressPath(pathId)}/skip-question`, workspace); topic.refresh(); setNotice('Question skipped. Mastery is unchanged.'); }
    catch (cause) { setFailure(chatError(cause)); }
    finally { operationLock.current = false; setActionBusy(false); }
  };
  const availableBooks = useLearningData(useCallback((signal: AbortSignal) => resources ? get<{ books: Book[] }>('/books', workspace, signal) : Promise.resolve({ books: [] }), [resources, workspace]));
  const availableReading = useLearningData(useCallback((signal: AbortSignal) => resources ? get<{ materials: Material[] }>('/reading/library/materials', workspace, signal) : Promise.resolve({ materials: [] }), [resources, workspace]));
  const pathSources = topic.data?.sources.filter(source => source.kind !== 'goal') ?? [];
  const sourceCount = pathSources.length + (chat.configuration.knowledge_bases?.length ?? 0) + (chat.configuration.book_references?.length ?? 0) + (chat.configuration.reading_references?.length ?? 0);
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 60, gap: 8 }}>
        <IconButton label="Back" onPress={() => onLeave ? onLeave() : router.canGoBack() ? router.back() : router.replace(learningHref('topic', workspace, pathId))}><ChevronLeft color={colors.foreground} size={24} /></IconButton>
        <DText accessibilityRole="header" style={{ fontSize: 22 }}>Study session</DText>
      </View>
      {(chat.loading || topic.loading) && <LoadingState />}
      {!!(chat.error || topic.error || failure) && <View style={{ padding: 20, gap: 8 }}><InlineAlert tone="danger">{chat.error || topic.error || failure}</InlineAlert><Button variant="secondary" onPress={() => { chat.reload(); topic.refresh(); setFailure(''); }}>Reload session</Button></View>}
      {!!notice && <View style={{ paddingHorizontal: 20 }}><InlineAlert>{notice}</InlineAlert></View>}
      <FlatList ref={list} data={chat.messages} keyExtractor={item => String(item.id)} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 24, flexGrow: 1 }}
        onScroll={({ nativeEvent: e }) => { follow.current = e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height < 100; }} scrollEventThrottle={100}
        onContentSizeChange={() => { if (follow.current) list.current?.scrollToEnd({ animated: false }); }}
        ListHeaderComponent={<View style={{ gap: 16, marginBottom: 24 }}><DText muted>{topic.data?.name ?? 'Read & understand'}</DText>{topic.data?.next.knowledge_point_name ? <DText style={{ fontSize: 28, lineHeight: 39 }}>{topic.data.next.knowledge_point_name}</DText> : null}{!!topic.data?.next.knowledge_point_name && <View style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 12, gap: 6 }}><DText style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>Your next knowledge point</DText><DText muted>{topic.data.next.reason || 'Path progress changes only after assessment.'}</DText></View>}{!chat.messages.length && <DText muted>{topic.data?.next.reason || 'Ask your tutor to begin. Your conversation will be saved.'}</DText>}</View>}
        renderItem={({ item }) => <View style={{ gap: 8, padding: item.role === 'user' ? 16 : 0, borderRadius: 12, backgroundColor: item.role === 'user' ? colors.secondary : 'transparent' }}><DText muted role="small">{item.role === 'user' ? 'You' : 'DeepTutor'}</DText>{item.content ? <ChatMarkdown learning content={item.content} /> : chat.busy ? <DText muted>Thinking…</DText> : null}{[...collectMasteryQuestions(item.events).values()].map(question => <MasteryQuestionCard key={question.questionId} question={question} grade={grades.get(question.questionId)} skipped={skipped.has(question.questionId)} disabled={chat.busy || chat.loading || !!chat.error || question.questionId !== latestQuestion} onAnswer={(text, answers) => { follow.current = true; void chat.send(language, { content: text, mastery_answer: { question_id: question.questionId, text, ...(answers ? { answers } : {}) } }); }} />)}</View>} />
      <TutorComposer workspace={workspace} compact resourceCount={sourceCount} onResources={() => setResources(true)}
        value={chat.draft} onChangeText={chat.setDraft} modelName={chat.model?.model_name ?? 'Server default model'} onChooseModel={() => setModels(true)} configuration={chat.configuration} onConfigure={chat.setConfiguration}
        loading={chat.loading || topic.loading || actionBusy} busy={chat.busy} waiting={chat.waiting} error={!!chat.error || !!topic.error}
        onSend={() => { follow.current = true; void chat.send(language); }} onStop={() => void chat.stop()}
        learningActions={[
          ...(!reading ? ['outline', 'study', 'review'].map(next => ({ label: `Mode: ${next}${next !== 'outline' && !topic.data?.map.modules.length ? ' · outline required' : ''}${(sessionMode ?? chat.configuration.mastery_session_mode) === next ? ' · selected' : ''}`, onPress: () => void changeMode(next), disabled: next !== 'outline' && !topic.data?.map.modules.length })) : []),
          { label: 'Ask for a hint', onPress: () => chat.setDraft('Give me a hint for the current question without revealing the answer.') },
          { label: 'Quiz or assess objective', onPress: () => chat.setDraft('Assess my understanding of the current objective.') },
          { label: 'Report a broken question', onPress: () => chat.setDraft('The current question seems broken. Help me check and repair it before grading.') },
          { label: 'Defer this objective', onPress: () => chat.setDraft('Defer this objective and help me choose what to study next.') },
          { label: 'Revise learning plan', onPress: () => chat.setDraft('Help me revise my learning plan.') },
          ...(!reading ? [{ label: 'Skip current question', onPress: () => void skipQuestion(), disabled: chat.busy }] : []),
          { label: 'Switch path or leave session', onPress: () => router.push('/learning') },
        ]} />
    </KeyboardAvoidingView>
    <FullScreenModal open={resources} title={`Resources · ${sourceCount} attached`} onClose={() => setResources(false)}><ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <DText role="label">Path resources</DText>
      {pathSources.map(source => <View key={source.id} style={{ gap: 4 }}><DText>{source.label}</DText><DText muted>{source.kind} · {source.available ? 'Available' : 'Unavailable'}</DText></View>)}
      {!pathSources.length && <DText muted>No path resources attached.</DText>}
      <DText muted>Path sources belong to the learning goal. Ask your tutor to revise them. Additional knowledge bases below apply to subsequent messages and are saved when you send.</DText>
      <DText role="label">Additional knowledge bases</DText>
      {catalog.loading && <LoadingState />}{!!catalog.error && <><InlineAlert tone="danger">{catalog.error}</InlineAlert><Button onPress={catalog.refresh}>Retry</Button></>}
      {catalog.data?.map(kb => <ListRow key={kb.name} title={kb.name} description={kb.status ?? 'Available'} disabled={chat.busy || chat.loading || kb.available === false} selected={chat.configuration.knowledge_bases?.includes(kb.name) ?? false} onPress={() => {
        const selected = chat.configuration.knowledge_bases ?? [];
        chat.setConfiguration({ ...chat.configuration, knowledge_bases: selected.includes(kb.name) ? selected.filter(name => name !== kb.name) : [...selected, kb.name] });
      }} />)}
      {!catalog.loading && !catalog.error && !catalog.data?.length && <DText muted>No knowledge bases available.</DText>}
      <DText role="label">Attached books</DText>
      {chat.configuration.book_references?.map(ref => <ListRow key={ref.book_id} title={availableBooks.data?.books.find(book => book.id === ref.book_id)?.title ?? ref.book_id} description="Remove from subsequent messages" disabled={chat.busy || chat.loading} onPress={() => chat.setConfiguration({ ...chat.configuration, book_references: chat.configuration.book_references?.filter(item => item.book_id !== ref.book_id) })} />)}
      {availableBooks.loading && <LoadingState />}{!!availableBooks.error && <InlineAlert tone="danger">{availableBooks.error}</InlineAlert>}
      {availableBooks.data?.books.filter(book => !chat.configuration.book_references?.some(ref => ref.book_id === book.id)).map(book => <ListRow key={book.id} title={book.title} description="Attach book" disabled={chat.busy || chat.loading} onPress={() => chat.setConfiguration({ ...chat.configuration, book_references: [...(chat.configuration.book_references ?? []), { book_id: book.id, page_ids: [] }] })} />)}
      {!availableBooks.loading && !availableBooks.data?.books.length && <DText muted>No books available.</DText>}
      <DText role="label">Attached reading materials</DText>
      {chat.configuration.reading_references?.map(ref => <ListRow key={ref.material_id} title={availableReading.data?.materials.find(material => material.material_id === ref.material_id)?.title ?? ref.material_id} description="Remove from subsequent messages" disabled={chat.busy || chat.loading} onPress={() => chat.setConfiguration({ ...chat.configuration, reading_references: chat.configuration.reading_references?.filter(item => item.material_id !== ref.material_id) })} />)}
      {availableReading.loading && <LoadingState />}{!!availableReading.error && <InlineAlert tone="danger">{availableReading.error}</InlineAlert>}
      {availableReading.data?.materials.filter(material => !chat.configuration.reading_references?.some(ref => ref.material_id === material.material_id)).map(material => <ListRow key={material.material_id} title={material.title || material.filename} description={material.status === 'ready' ? 'Attach reading material' : material.status} disabled={chat.busy || chat.loading || material.status !== 'ready'} onPress={() => {
        void get<MaterialDetail>(`/reading/materials/${encodeURIComponent(material.material_id)}`, workspace).then(detail => {
          if (!detail.revision) throw new Error('This material has no readable revision.');
          chat.setConfiguration(previous => ({ ...previous, reading_references: [...(previous.reading_references ?? []).filter(ref => ref.material_id !== material.material_id), { material_id: material.material_id, revision: detail.revision!, locators: [] }] }));
        }).catch(cause => setFailure(chatError(cause)));
      }} />)}
      {!availableReading.loading && !availableReading.data?.materials.length && <DText muted>No reading materials available.</DText>}
      <DText muted>Selections are saved with your next message. Removing a reference preserves the original resource and previous messages.</DText>
    </ScrollView></FullScreenModal>
    <ModelSelectionDialog fullScreen open={models} onClose={() => setModels(false)} selectedKey={chat.model ? JSON.stringify([chat.model.profile_id, chat.model.model_id]) : undefined} options={chat.models.map(model => ({ key: JSON.stringify([model.profile_id, model.model_id]), label: model.model_name, description: model.profile_name }))} onSelect={key => { const model = chat.models.find(item => JSON.stringify([item.profile_id, item.model_id]) === key); if (model) chat.setModel(model); }} />
  </SafeAreaView>;
}
