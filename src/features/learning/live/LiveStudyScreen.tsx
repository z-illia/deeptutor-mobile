import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeftRight, ChevronLeft, Clock3, Lightbulb, LogOut } from 'lucide-react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, IconButton } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { ChatMarkdown } from '@/features/chat/ChatMarkdown';
import { ModelSelectionDialog } from '@/features/chat/ModelSelectionDialog';
import { TutorComposer } from '@/features/chat/live/TutorComposer';
import { chatError, useLiveChat, type ChatDraft, type LearningChatContext } from '@/features/chat/live/useLiveChat';
import { DText } from './LearningText';
import { get, mutate, topicPath, type Topic } from './repository';
import { useLearningData } from './useLearningData';
import { collectMasteryGrades, collectMasteryQuestions, collectMasterySkips } from './mastery-question';
import { MasteryQuestionCard } from './MasteryQuestionCard';
import { learningHref } from './LiveLearningScreen';
import { StudyActionRow } from './StudyActionRow';
import { splitCurrentQuestion, studyPrompt, type StudyStrategy } from './study-actions';
import { activeResourceCount } from './study-resources';
import { StudyResourcesSheet } from './StudyResourcesSheet';
import { readStudyDraft, saveStudyDraft } from './study-drafts';

export function LiveStudyScreen({ workspace, pathId, sessionId, mode, prompt, reading, onLeave }: { workspace: string; pathId: string; sessionId: string | null; mode?: string; prompt?: string; reading?: LearningChatContext; onLeave?: () => void }) {
  const { colors, language } = useDesign();
  const auth = useAuth();
  const key = `${auth.serverUrl}:${auth.session?.profile?.id ?? 'local'}:${workspace}:${pathId}:${sessionId ?? 'new'}`;
  const [restored] = useState(() => readStudyDraft(key));
  const [sessionMode, setSessionMode] = useState<string | undefined>(mode);
  const [initialSessionId] = useState(sessionId);
  const context: LearningChatContext = reading ?? { workspace_id: workspace, workspace_mode: 'mastery_path', mastery_path_id: pathId, ...(sessionMode ? { mastery_session_mode: sessionMode } : {}) };
  const chat = useLiveChat(initialSessionId, context, restored);
  const [resources, setResources] = useState(false);
  const [more, setMore] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<'switch' | 'leave' | null>(null);
  const [models, setModels] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<{ id: StudyStrategy; objectiveId: string }>();
  const [failure, setFailure] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const openSetup = useRef<() => void>(() => {});
  const list = useRef<FlatList>(null);
  const follow = useRef(true);
  const initialized = useRef(false);
  const initialScroll = useRef(false);
  const latestDraft = useRef<ChatDraft>({ text: '' });
  useEffect(() => { latestDraft.current = { text: chat.draft, configuration: chat.configurationEdited ? chat.configuration : undefined, attachments: chat.pendingAttachments }; }, [chat.draft, chat.configuration, chat.configurationEdited, chat.pendingAttachments]);
  useEffect(() => () => saveStudyDraft(key, latestDraft.current), [key]);
  useEffect(() => {
    if (chat.loading || !chat.messages.length || initialScroll.current) return;
    initialScroll.current = true;
    const frame = requestAnimationFrame(() => { follow.current = true; list.current?.scrollToEnd({ animated: false }); });
    return () => cancelAnimationFrame(frame);
  }, [chat.loading, chat.messages.length]);
  const committedMessage = chat.messages.at(-1)?.id;
  const load = useCallback(async (signal: AbortSignal) => { void committedMessage; return pathId ? get<Topic>(topicPath(pathId), workspace, signal) : undefined; }, [pathId, workspace, committedMessage]);
  const topic = useLearningData(load);
  const grades = collectMasteryGrades(chat.messages);
  const skipped = collectMasterySkips(chat.messages);
  const latestQuestion = chat.messages.flatMap(message => [...collectMasteryQuestions(message.events).values()]).at(-1)?.questionId;
  const lastAssistantId = chat.messages.filter(message => message.role === 'assistant').at(-1)?.id;
  useEffect(() => {
    if (!chat.loading && !topic.loading && !initialized.current) {
      initialized.current = true;
      if (!sessionId && !restored?.text && prompt) chat.setDraft(prompt);
      else if (!sessionId && !restored?.text && topic.data && !topic.data.map.modules.length) chat.setDraft('Help me design a learning route for my goal.');
    }
  }, [chat, sessionId, prompt, topic.data, topic.loading, restored]);
  useEffect(() => { if (!sessionId && chat.serverSessionId) router.setParams({ sessionId: chat.serverSessionId }); }, [sessionId, chat.serverSessionId]);
  const changeMode = async (next: string) => {
    if (actionBusy) return;
    setFailure(''); setActionBusy(true);
    try {
      if (chat.serverSessionId) await mutate('put', `${topicPath(pathId)}/sessions/${encodeURIComponent(chat.serverSessionId)}/mode`, workspace, { mode: next });
      setSessionMode(next);
    } catch (cause) { setFailure(chatError(cause)); } finally { setActionBusy(false); }
  };
  const locked = chat.loading || topic.loading || actionBusy || chat.busy || !!chat.error || !!topic.error;
  const objectiveReady = !!topic.data?.next.knowledge_point_id;
  const startStrategy = async (strategy: StudyStrategy | 'hint' | 'defer') => {
    if (!topic.data || locked || !objectiveReady) return;
    setMore(false); setFailure(''); follow.current = true;
    const replaceQuestion = strategy !== 'hint' && strategy !== 'defer' && latestQuestion && !grades.has(latestQuestion) && !skipped.has(latestQuestion);
    const sent = await chat.send(language, { content: studyPrompt(strategy, topic.data), preserveDraft: true, mastery_session_mode: 'study', ...(replaceQuestion ? { mastery_skip: { question_id: latestQuestion } } : {}) });
    if (sent) { setSessionMode('study'); if (strategy !== 'hint' && strategy !== 'defer') setSelectedStrategy({ id: strategy, objectiveId: topic.data.next.knowledge_point_id }); }
  };
  const leave = (destination: 'switch' | 'leave') => {
    saveStudyDraft(key, { text: chat.draft, configuration: chat.configurationEdited ? chat.configuration : undefined, attachments: chat.pendingAttachments });
    setConfirmLeave(null);
    if (destination === 'switch') router.push(learningHref('paths', workspace));
    else if (onLeave) onLeave();
    else router.replace(learningHref('topic', workspace, pathId));
  };
  const starters = !reading ? <View style={{ gap: 8 }}><StudyActionRow selected={selectedStrategy?.objectiveId === topic.data?.next.knowledge_point_id ? selectedStrategy?.id : undefined} disabled={locked || !objectiveReady} onSelect={strategy => void startStrategy(strategy)} />{!objectiveReady && !topic.loading && <DText muted style={{ fontSize: 12 }}>Learning actions become available when your route has a current objective.</DText>}</View> : null;
  const sourceCount = activeResourceCount(chat.configuration, topic.data?.sources ?? [], chat.pendingAttachments);
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 60, gap: 8 }}>
        <IconButton label="Back" onPress={() => chat.busy ? setConfirmLeave('leave') : onLeave ? leave('leave') : router.canGoBack() ? router.back() : leave('leave')}><ChevronLeft color={colors.foreground} size={24} /></IconButton>
        <DText accessibilityRole="header" style={{ fontSize: 22, fontWeight: '600' }}>Study session</DText>
      </View>
      {(chat.loading || topic.loading) && <LoadingState />}
      {!!(chat.error || topic.error || failure) && <View style={{ padding: 20, gap: 8 }}><InlineAlert tone="danger">{chat.error || topic.error || failure}</InlineAlert><Button variant="secondary" onPress={() => { chat.reload(); topic.refresh(); setFailure(''); }}>Reload session</Button></View>}
      <FlatList ref={list} data={chat.messages} keyExtractor={item => String(item.id)} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 24, flexGrow: 1 }}
        onScroll={({ nativeEvent: e }) => { follow.current = e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height < 100; }} scrollEventThrottle={100}
        onContentSizeChange={() => { if (follow.current) list.current?.scrollToEnd({ animated: false }); }}
        ListHeaderComponent={<View style={{ gap: 16, marginBottom: 24 }}><DText muted>{topic.data?.name ?? 'Read & understand'}</DText>{!!topic.data?.next.knowledge_point_name && <><DText style={{ fontSize: 28, lineHeight: 39, fontWeight: '600' }}>{topic.data.next.knowledge_point_name}</DText><View style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 12, gap: 6 }}><DText style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>Your next knowledge point</DText><DText muted>{topic.data.next.reason || 'Path progress changes only after assessment.'}</DText></View></>}{!chat.messages.length && <DText muted>{topic.data?.next.reason || 'Ask your tutor to begin. Your conversation will be saved.'}</DText>}</View>}
        ListFooterComponent={!lastAssistantId && starters ? starters : undefined}
        renderItem={({ item }) => {
          const activeAssistant = item.role === 'assistant' && item.id === lastAssistantId;
          const parts = activeAssistant ? splitCurrentQuestion(item.content, topic.data?.next.pending_prompt) : { explanation: item.content, question: '' };
          return <View style={{ gap: 16, padding: item.role === 'user' ? 16 : 0, borderRadius: 12, backgroundColor: item.role === 'user' ? colors.secondary : 'transparent' }}>
            <DText muted role="small">{item.role === 'user' ? 'You' : 'DeepTutor'}</DText>
            {!!parts.explanation && <ChatMarkdown learning content={parts.explanation} />}
            {!item.content && chat.busy && <DText muted>Thinking…</DText>}
            {activeAssistant && starters}
            {!!parts.question && <ChatMarkdown learning content={parts.question} />}
            {[...collectMasteryQuestions(item.events).values()].map(question => <MasteryQuestionCard key={question.questionId} question={question} grade={grades.get(question.questionId)} skipped={skipped.has(question.questionId)} disabled={locked || question.questionId !== latestQuestion} onAnswer={(text, answers) => { follow.current = true; void chat.send(language, { content: text, mastery_answer: { question_id: question.questionId, text, ...(answers ? { answers } : {}) } }); }} />)}
          </View>;
        }} />
      <TutorComposer workspace={workspace} compact resourceCount={sourceCount} onResources={() => setResources(true)} moreActionsOpen={more} onMoreActions={setup => { openSetup.current = setup; setMore(true); }}
        value={chat.draft} onChangeText={chat.setDraft} modelName={chat.model?.model_name ?? 'Server default model'} onChooseModel={() => setModels(true)} configuration={chat.configuration} onConfigure={chat.setConfiguration}
        loading={chat.loading || topic.loading || actionBusy} busy={chat.busy} waiting={chat.waiting} error={!!chat.error || !!topic.error} onSend={() => { follow.current = true; void chat.send(language); }} onStop={() => void chat.stop()}
        learningActions={!reading ? ['outline', 'study', 'review'].map(next => ({ label: `Mode: ${next}${next !== 'outline' && !topic.data?.map.modules.length ? ' · outline required' : ''}${(sessionMode ?? chat.configuration.mastery_session_mode) === next ? ' · selected' : ''}`, onPress: () => void changeMode(next), disabled: next !== 'outline' && !topic.data?.map.modules.length })) : []} />
    </KeyboardAvoidingView>
    <StudyResourcesSheet open={resources} onClose={() => setResources(false)} workspace={workspace} sessionId={chat.serverSessionId} configuration={chat.configuration} onConfigure={chat.setConfiguration} files={chat.pendingAttachments} onFiles={chat.setPendingAttachments} pathSources={topic.data?.sources ?? []} savedFiles={chat.messages.flatMap(message => message.attachments ?? [])} disabled={chat.busy || chat.loading} />
    <BottomSheet open={more} title="More actions" onClose={() => setMore(false)}><ScrollView contentContainerStyle={{ gap: 8 }}>
      <Button variant="ghost" style={{ justifyContent: 'flex-start', minHeight: 44, paddingHorizontal: 8 }} icon={<Lightbulb size={18} color={colors.primary} />} disabled={locked || !objectiveReady} onPress={() => void startStrategy('hint')}><DText style={{ color: colors.foreground, fontSize: 14 }}>Hint</DText></Button>
      <Button variant="ghost" style={{ justifyContent: 'flex-start', minHeight: 44, paddingHorizontal: 8 }} icon={<Clock3 size={18} color={colors.primary} />} disabled={locked || !objectiveReady} onPress={() => void startStrategy('defer')}><DText style={{ color: colors.foreground, fontSize: 14 }}>Defer objective</DText></Button>
      <Button variant="ghost" style={{ justifyContent: 'flex-start', minHeight: 44, paddingHorizontal: 8 }} icon={<ArrowLeftRight size={18} color={colors.primary} />} onPress={() => { setMore(false); setConfirmLeave('switch'); }}><DText style={{ color: colors.foreground, fontSize: 14 }}>Switch learning path</DText></Button>
      <Button variant="ghost" style={{ justifyContent: 'flex-start', minHeight: 44, paddingHorizontal: 8 }} icon={<LogOut size={18} color={colors.primary} />} onPress={() => { setMore(false); setConfirmLeave('leave'); }}><DText style={{ color: colors.foreground, fontSize: 14 }}>Leave session</DText></Button>
      {!objectiveReady && <DText muted>A current objective is required for Hint and Defer objective.</DText>}
      <Button variant="ghost" onPress={() => { setMore(false); openSetup.current(); }}>Session setup</Button>
    </ScrollView></BottomSheet>
    <BottomSheet open={confirmLeave !== null} title={confirmLeave === 'switch' ? 'Switch learning path?' : 'Leave session?'} onClose={() => setConfirmLeave(null)}>
      <DText>Your session is saved on the server. Unsent answers and selections are kept in memory until the app closes. A running response continues on the server.</DText>
      <Button variant="secondary" onPress={() => setConfirmLeave(null)}>Stay here</Button>
      <Button onPress={() => leave(confirmLeave ?? 'leave')}>{confirmLeave === 'switch' ? 'Switch learning path' : 'Leave session'}</Button>
    </BottomSheet>
    <ModelSelectionDialog fullScreen open={models} onClose={() => setModels(false)} selectedKey={chat.model ? JSON.stringify([chat.model.profile_id, chat.model.model_id]) : undefined} options={chat.models.map(model => ({ key: JSON.stringify([model.profile_id, model.model_id]), label: model.model_name, description: model.profile_name }))} onSelect={key => { const model = chat.models.find(item => JSON.stringify([item.profile_id, item.model_id]) === key); if (model) chat.setModel(model); }} />
  </SafeAreaView>;
}
