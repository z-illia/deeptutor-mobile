import { useCopy } from '@/features/entry/copy';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { WorkspaceList } from '@/features/workspaces/WorkspaceList';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { chatError } from '@/features/chat/live/useLiveChat';
import { commandId } from '@/features/chat/live/protocol';
import { Button, Field } from '@/shared/ui/Controls';
import { InlineAlert } from '@/shared/ui/Feedback';
import { DText, ListRow } from './LearningText';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { Heading, LearningLayout } from './LearningLayout';
import { continuationSessionId, getTopicWithSessions, get, listTopics, mutate, progressPath, topicPath, type Book, type Material, type StudySession, type Topic } from './repository';
import { useLearningData } from './useLearningData';
import { learningHref } from './routes';
import { LearningOverview } from './LearningOverview';
import { ReaderScreen } from './ReaderScreen';
import { BookTools } from './BookTools';
import { PracticeScreen } from './PracticeScreen';
import { LiveStudyScreen } from './LiveStudyScreen';

export function LiveLearningScreen({ view: fixedView }: { view?: string }) {
  const params = useLocalSearchParams<{ view?: string; workspace?: string; pathId?: string; moduleId?: string; sessionId?: string; id?: string; mode?: string; prompt?: string; new?: string }>();
  const view = fixedView ?? params.view ?? 'overview';
  const auth = useAuth();
  const workspaceState = useWorkspaces();
  const workspace = params.workspace ?? workspaceState.selectedWorkspaceId;
  const pathId = params.pathId ?? '';
  const { loaded, selectWorkspace } = workspaceState;
  // Only the focused route may adopt a workspace from a deep link. Screens
  // retained in the navigation stack must not overwrite the active selection.
  useFocusEffect(useCallback(() => {
    if (loaded && params.workspace !== undefined) void selectWorkspace(params.workspace);
  }, [loaded, params.workspace, selectWorkspace]));
  if (view === 'study') return <LiveStudyScreen key={`${auth.serverUrl}:${workspace}:${pathId}:${params.new ?? params.sessionId ?? 'new'}`} workspace={workspace} pathId={pathId} sessionId={params.sessionId ?? null} mode={params.mode} prompt={params.prompt} />;
  if (view === 'reader' || view === 'book') return <ReaderScreen key={`${workspace}:${view}:${params.id}`} workspace={workspace} id={params.id ?? ''} book={view === 'book'} />;
  if (view === 'practice') return <PracticeScreen workspace={workspace} />;
  return <LearningContent key={`${auth.serverUrl}:${auth.session?.profile?.id}:${workspace}:${view}:${pathId}:${params.moduleId}`} view={view} workspace={workspace} pathId={pathId} moduleId={params.moduleId} />;
}
function LearningContent({ view, workspace, pathId, moduleId }: { view: string; workspace: string; pathId: string; moduleId?: string }) {
  const t = useCopy();
  const [confirmation, setConfirmation] = useState<'reset' | 'delete' | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const workspaceState = useWorkspaces();
  const [goal, setGoal] = useState('');
  const [name, setName] = useState('');
  const [target, setTarget] = useState<number>();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [failure, setFailure] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async (signal: AbortSignal) => {
    if (['topic', 'module', 'review', 'profile', 'goal', 'sessions', 'strategies'].includes(view)) {
      const { topic, sessions } = view === 'topic' || view === 'sessions'
        ? await getTopicWithSessions(pathId, workspace, signal)
        : { topic: await get<Topic>(topicPath(pathId), workspace, signal), sessions: [] as StudySession[] };
      const strategies = view === 'strategies' || view === 'review' ? (await get<{ strategies: { template_id: string; name: string }[] }>('/mastery-paths/review-strategies', workspace, signal)).strategies : [];
      return { topics: [] as Topic[], topic, sessions, strategies, books: [] as Book[], materials: [] as Material[], canCreate: undefined as boolean | undefined };
    }
    const topics = ['overview', 'paths', 'progress'].includes(view) ? await listTopics(workspace, signal) : [];
    const bookData = view === 'books' ? await get<{ books: Book[]; can_create: boolean }>('/books', workspace, signal) : undefined;
    const books = bookData?.books ?? [];
    const materials = view === 'reading' ? (await get<{ materials: Material[] }>('/reading/library/materials', workspace, signal)).materials : [];
    return { topics, books, materials, canCreate: bookData?.can_create, sessions: [] as StudySession[], strategies: [] as { template_id: string; name: string }[], topic: undefined };
  }, [workspace, view, pathId]);
  const state = useLearningData(load);
  const topic = state.data?.topic;
  const nav = (next: string, extra: Record<string, string> = {}) => router.push(learningHref(next, workspace, pathId, extra));
  const act = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setFailure(''); setNotice('');
    try { await work(); } catch (cause) { setFailure(chatError(cause)); } finally { lock.current = false; setBusy(false); }
  };
  const study = (prompt?: string, mode?: string, sessionId?: string) => nav('study', { ...(prompt ? { prompt } : {}), ...(!sessionId || mode ? { mode: mode ?? (topic?.map.modules.length ? 'study' : 'outline') } : {}), ...(sessionId ? { sessionId } : {}), new: commandId() });
  const titles: Record<string, string> = { overview: 'Learn', progress: 'Learning progress', paths: 'Mastery paths', new: 'New activity', create: 'Learning goal', topic: topic?.name ?? 'Mastery path', module: topic?.map.modules.find(m => m.id === moduleId)?.name ?? 'Module', review: 'Review plan', strategies: 'Review strategies', profile: 'Learning profile', goal: 'Learning goal', sessions: 'Path sessions', books: 'Books', reading: 'Immersive reading' };
  const row = (title: string, description: string, onPress: () => void) => <ListRow key={title} title={title} description={description} onPress={onPress} style={{ borderWidth: 0, padding: 16 }} />;
  return <LearningLayout title={view === 'topic' && topic ? topic.name : view === 'module' && topic ? topic.map.modules.find(module => module.id === moduleId)?.name ?? t('Module') : t(titles[view] ?? 'Learning')} root={view === 'overview'} loading={state.loading} error={state.error} refresh={state.refresh} onWorkspace={() => setWorkspaceOpen(true)}>
    {!!failure && <InlineAlert tone="danger">{t(failure)}</InlineAlert>}
    {!!notice && <InlineAlert>{t(notice)}</InlineAlert>}
    {view === 'overview' && <>
      <DText muted>{workspaceState.workspaces.find(item => item.workspace_id === workspace)?.display_name ?? (workspace || t('General workspace'))}</DText>
      <Heading>{t('Build understanding,\none step at a time.')}</Heading>
      <LearningOverview topics={state.data?.topics ?? []} workspace={workspace} loading={state.loading} error={state.error} />
    </>}
    {view === 'progress' && <>
      <DText muted>{t("Your reading and learning activity")}</DText>
      {state.data?.topics.map(item => row(item.name, t('{mastered} / {total} knowledge points mastered', { mastered: item.map.counts.mastered, total: item.map.counts.total }), () => router.push(learningHref('topic', workspace, item.path_id))))}
      {!state.loading && !state.error && !state.data?.topics.length && <Heading>{t("No learning activity yet")}</Heading>}
      <DText muted>{t("Mastery values come from assessed learning progress. Conversation counts do not imply completion.")}</DText>
      <Button onPress={() => nav('overview')}>{t("Explore learning")}</Button>
    </>}
    {(view === 'new' || view === 'paths') && <>
      {view === 'new' && <DText muted>{t("Choose a method. Materials and progress stay in this workspace.")}</DText>}
      {view === 'paths' && state.data?.topics.map(item => row(item.name, t('{mastered} / {total} mastered', { mastered: item.map.counts.mastered, total: item.map.counts.total }), () => router.push(learningHref('topic', workspace, item.path_id))))}
      {row(t('Mastery path'), t('Build a route toward a learning goal'), () => nav('create'))}
      {view === 'new' && <>{row(t('Book'), t('Browse existing AI-authored books'), () => nav('books'))}{row(t('Practice'), t('Use your question bank'), () => nav('practice'))}{row(t('Immersive reading'), t('Read with a tutor'), () => nav('reading'))}</>}
    </>}
    {view === 'create' && <>
      <Heading>{t("What do you want to learn?")}</Heading>
      <Field label={t("Name (optional)")} maxLength={120} value={name} onChangeText={setName} />
      <Field label={t("Learning goal")} multiline value={goal} onChangeText={setGoal} maxLength={2000} style={{ minHeight: 140 }} />
      <DText muted>{t("Your tutor will help design the outline in your first session. You can add knowledge bases in the study composer.")}</DText>
      <Button loading={busy} disabled={!goal.trim()} onPress={() => void act(async () => {
        const created = await mutate<Topic>('post', '/mastery-paths/topics', workspace, { name: name.trim(), goal: goal.trim(), sources: [], modules: [] });
        router.replace(learningHref('topic', workspace, created.path_id));
      })}>{t("Create learning goal")}</Button>
    </>}
    {topic && view === 'topic' && <>
      <DText muted>{t("Mastery path")}</DText><Heading>{topic.name}</Heading>
      <DText>{t('{mastered} / {total} knowledge points mastered', { mastered: topic.map.counts.mastered, total: topic.map.counts.total })}</DText>
      <View style={{ gap: 12 }}><DText role="label">{t("Pick up where you left off")}</DText><DText muted>{topic.next.reason || topic.metadata.description || topic.metadata.goal}</DText><Button disabled={state.loading || !!state.error} onPress={() => study(undefined, undefined, continuationSessionId(topic.next, state.data?.sessions ?? []))}>{t("Continue current session")}</Button></View>
      <DText role="label">{t('{count} modules', { count: topic.map.modules.length })}</DText>
      {!topic.map.modules.length && <DText muted>{t("Your outline will be designed with the tutor.")}</DText>}
      {topic.map.modules.map((module, index) => row(`${String(index + 1).padStart(2, '0')}  ${module.name}`, t('{mastered} / {total} knowledge points', { mastered: module.mastered, total: module.total }), () => nav('module', { moduleId: module.id })))}
      {row(t('Review plan'), t('{count} due · recall target and strategies', { count: topic.reviews.filter(r => r.due).length }), () => nav('review'))}
      {row(t('Learning profile'), t('Experience, goal, time and teaching style'), () => nav('profile'))}
      {row(t('Sessions'), t('Reopen a session or start a fresh angle'), () => nav('sessions'))}
    </>}
    {topic && view === 'module' && topic.map.modules.filter(m => m.id === moduleId).map(module => <View key={module.id} style={{ gap: 24 }}>
      <DText muted>{t('{mastered} of {total} knowledge points mastered', { mastered: module.mastered, total: module.total })}</DText><Heading>{module.objective || module.name}</Heading>
      {module.knowledge_points.map(point => row(point.name, t(point.status), () => study(`Let’s study ${point.name}.`, 'study')))}
      <Button onPress={() => study(`Help me understand the module ${module.name}.`, 'study')}>{t("Ask about this module")}</Button>
    </View>)}
    {topic && (view === 'review' || view === 'strategies') && <>
      <DText muted>{topic.name}</DText><Heading>{t(topic.reviews.some(r => r.due) ? 'Time to review' : 'Nothing due today')}</Heading>
      {topic.reviews.filter(r => r.due).map(review => row(review.knowledge_point_name, review.reason, () => study(`Review ${review.knowledge_point_name} with me.`, 'review')))}
      <DText role="label">{t("Recall target")}</DText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{[0.8, 0.9, 0.95].map(value => <Button key={value} variant="secondary" accessibilityState={{ selected: value === (target ?? topic.review_settings?.desired_retention) }} onPress={() => setTarget(value)}>{`${value * 100}%`}</Button>)}</View>
      <Button loading={busy} onPress={() => void act(async () => { await mutate('put', `${topicPath(pathId)}/review-settings`, workspace, { desired_retention: target ?? topic.review_settings?.desired_retention ?? 0.9 }); setNotice('Review plan saved.'); state.refresh(); })}>{t("Save review plan")}</Button>
      <DText role="label">{t("Review strategies")}</DText>
      {state.data?.strategies?.map(strategy => <Button key={strategy.template_id} variant="secondary" loading={busy} onPress={() => void act(async () => { await mutate('put', `${topicPath(pathId)}/review-strategy`, workspace, { template_id: strategy.template_id }); state.refresh(); setNotice('Review strategy saved.'); })}>{strategy.name}{topic.review_settings?.strategy?.template_id === strategy.template_id ? ` · ${t('Current strategy')}` : ''}</Button>)}
      <Button variant="secondary" onPress={() => study('Help me design a review strategy for this path.')}>{t("Discuss a review strategy")}</Button>
    </>}
    {topic && view === 'profile' && <>
      <DText muted>{topic.name}</DText>
      {topic.learner_profile ? [['Already knows', topic.learner_profile.prior_knowledge], ['Wants to reach', topic.learner_profile.target_level], ['Time available', topic.learner_profile.time_budget], ['Teaching approach', topic.learner_profile.preferences]].map(([label, value]) => <View key={label} style={{ gap: 12 }}><DText role="label">{t(label)}</DText><DText>{value || t('Not recorded yet')}</DText></View>) : <DText muted>{t("Your tutor has not recorded a learning profile yet.")}</DText>}
      <Button onPress={() => study('Help me update my learning profile.')}>{t("Discuss my profile")}</Button>
      {row(t('Full learning goal'), t('View original goal and requirements'), () => nav('goal'))}
    </>}
    {topic && view === 'goal' && <><DText muted>{topic.name}</DText><DText selectable>{topic.metadata.goal}</DText><Button onPress={() => study('I would like to discuss or revise my learning goal.', 'outline')}>{t("Discuss or revise this goal")}</Button></>}
    {topic && view === 'sessions' && <>
      <DText muted>{topic.name}</DText>
      {state.data?.sessions.map(session => row(session.title || t('Study session'), `${t('{count} messages', { count: session.message_count })} · ${t(session.status)}`, () => study(undefined, undefined, session.session_id)))}
      {!state.data?.sessions.length && <DText muted>{t("No sessions yet.")}</DText>}
      <Button onPress={() => study()}>{t("Start from a fresh angle")}</Button>
      <Button variant="secondary" onPress={() => { setConfirmText(''); setConfirmation('reset'); }}>{t("Reset progress")}</Button>
      <Button variant="danger" onPress={() => { setConfirmText(''); setConfirmation('delete'); }}>{t("Delete topic")}</Button>
    </>}
    {view === 'books' && <>
      <Heading>{t(state.data?.books.length ? 'Your books' : 'Your next book starts here.')}</Heading>
      {state.data?.books.map(book => row(book.title, `${t(book.status)} · ${t('{count} chapters', { count: book.chapter_count })}`, () => nav('book', { id: book.id })))}
      {!state.loading && !state.error && !state.data?.books.length && <DText muted>{t("No books yet. Describe a goal to generate your first book.")}</DText>}
    </>}
    {view === 'books' && <BookTools canCreate={state.data?.canCreate === true} workspace={workspace} onCreated={book => nav('book', { id: book.id })} />}
    {view === 'reading' && <>
      <Heading>{t('Bring a source.\nRead with a tutor.')}</Heading>
      {state.data?.materials.map(material => row(material.title || material.filename, `${t(material.status)}${material.error_detail ? ` · ${material.error_detail}` : ''}${typeof material.progress === 'number' ? ` · ${t('{percent}% read', { percent: Math.round(material.progress * 100) })}` : ''}`, () => nav('reader', { id: material.material_id })))}
      {!state.loading && !state.error && !state.data?.materials.length && <DText muted>{t("No reading materials yet. Import a source to begin.")}</DText>}
      <Field label={t("Source URL")} value={importUrl} onChangeText={setImportUrl} autoCapitalize="none" keyboardType="url" placeholder="https://…" />
      <Button loading={busy} disabled={!importUrl.trim()} onPress={() => void act(async () => {
        const url = new URL(importUrl.trim());
        if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Enter a valid HTTP or HTTPS source URL.');
        await mutate('post', '/reading/library/import-urls', workspace, { urls: [url.toString()] });
        setImportUrl(''); setNotice('Source queued for import. Refresh to check its status.'); state.refresh();
      })}>{t("Import reading source")}</Button>
      <Button variant="secondary" onPress={state.refresh}>{t("Refresh materials")}</Button>
    </>}
    <FullScreenModal open={confirmation !== null} title={t(confirmation === 'delete' ? 'Delete topic' : 'Reset progress')} onClose={() => { if (!busy) setConfirmation(null); }}>
      <View style={{ padding: 20, gap: 16 }}>
        <InlineAlert tone="warning">{t(confirmation === 'delete' ? 'The map, evidence, review schedule, and linked records will be deleted. This cannot be undone.' : 'This clears earned mastery and review evidence while keeping the learning outline.')}</InlineAlert>
        <Field label={t("Type the topic name to confirm")} value={confirmText} onChangeText={setConfirmText} />
        {!!failure && <InlineAlert tone="danger">{t(failure)}</InlineAlert>}
        <Button variant="danger" loading={busy} disabled={confirmText !== topic?.name} onPress={() => void act(async () => {
          if (confirmation === 'delete') { await mutate('delete', progressPath(pathId), workspace); router.replace(learningHref('overview', workspace)); }
          else { await mutate('post', `${progressPath(pathId)}/redo`, workspace); setConfirmation(null); state.refresh(); }
        })}>{t(confirmation === 'delete' ? 'Delete permanently' : 'Reset progress')}</Button>
      </View>
    </FullScreenModal>
    <FullScreenModal open={workspaceOpen} title={t("Switch workspace")} onClose={() => setWorkspaceOpen(false)}>
      <View style={{ padding: 20, gap: 12 }}>
        <WorkspaceList open={workspaceOpen} currentId={workspace} onSelected={id => { setWorkspaceOpen(false); router.replace(learningHref('overview', id)); }} />
      </View>
    </FullScreenModal>
  </LearningLayout>;
}
