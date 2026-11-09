import { MobileRow } from './ScreenLayout';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { ChevronLeft, Layers, UserRound } from 'lucide-react-native';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useChat } from '@/features/chat/ChatProvider';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { Button } from '@/shared/ui/Controls';
import { Dialog as SharedDialog } from '@/shared/ui/Dialog';
import { allNodes, disclosure, labelOf, mobilePalette, screenByNumber, textOf, type DesignNode } from './model';
import { destination, selectionScreens } from './navigation';
import { NativeLayer, type LayerContext } from './NativeLayers';
import { useDesign, type Language } from '@/shared/design/DesignProvider';
import { languageNames, useMobileCopy } from './copy';
import { useMobileStore } from './local-store';
import { BottomNavigation, mobileTabs } from './BottomNavigation';

type Dialog = { title: string; message?: string; choices?: string[]; choose?: (value: string) => void; input?: string; submit?: (value: string) => void };
const route = (number: number): Href => `/mobile/${number}` as Href;
const placeholder = (value: string) => /…|^Choose |^Type |^Enter |^Search |^Find /.test(value);
const subscribeClient = () => () => {};

export function MobileScreen({ number }: { number: number }) {
  const clientReady = useSyncExternalStore(subscribeClient, () => true, () => false);
  const spec = screenByNumber.get(number);
  const localState = useMobileStore();
  const workspaceState = useWorkspaces();
  const state = { ...localState, workspace: workspaceState.selectedWorkspaceId };
  const design = useDesign();
  const t = useMobileCopy();
  const { dark } = design;
  const colors = { ...mobilePalette[dark ? 'dark' : 'light'], bg: design.colors.background, surface: design.colors.card, ink: design.colors.foreground, muted: design.colors.mutedForeground, accent: design.colors.primary, action: design.colors.primary, 'on-action': design.colors.primaryForeground, soft: design.colors.secondary, line: design.colors.border, 'field-line': design.colors.input };
  const fixtures = useFixtures();
  const chat = useChat();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [dialogValue, setDialogValue] = useState('');
  const [transient, setTransient] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const scope = `${state.workspace}:${number}:`;
  const values = useMemo(() => Object.fromEntries(Object.entries(state.values).filter(([key]) => key.startsWith(scope)).map(([key, value]) => [key.slice(scope.length), value])), [scope, state.values]);
  const mergedValues: Record<string, string> = { ...values, ...(number === 82 ? { 'Interface language field': languageNames[design.language] } : {}), ...(number === 83 ? { 'Theme field': { system: 'System', snow: 'Light', cream: 'Cream', dark: 'Dark', glass: 'Glass' }[design.theme] } : {}), ...transient };
  const selected = mergedValues.__selected ?? (number === 37 ? spec && allNodes(spec.content).find(node => / row$/.test(node.name) && textOf(node).split('\n').includes('Selected'))?.name : undefined);
  const query = Object.entries(mergedValues).find(([key]) => /Search.*field/.test(key))?.[1] ?? '';
  const currentSessionId = state.values[`${state.workspace}:chat-session`];
  const sessionId = chat.sessions.some(s => s.session_id === currentSessionId) ? currentSessionId : null;
  const draftKey = `${state.workspace}:${number === 12 ? 'new' : sessionId ?? 'new'}:chat-draft`;
  const messages = sessionId ? chat.messagesBySession[sessionId] ?? [] : [];
  const localTasks = state.tasks[state.workspace] ?? [];
  const localNotes = Object.entries(state.notes).filter(([key]) => key.startsWith(`${state.workspace}:`));
  const open = (next: number) => router.push(route(next));
  const back = () => router.canGoBack() ? router.back() : router.replace(route(1));
  const notify = (title: string, message: string) => setDialog({ title, message });
  const setValue = (node: DesignNode, value: string) => {
    setError('');
    if (/password|credential|headers/i.test(node.name) || node.name === 'Theme field' || node.name === 'Interface language field') setTransient(old => ({ ...old, [node.name]: value }));
    else state.setValue(scope + node.name, value);
    if ([12, 13, 25].includes(number) && /Ask DeepTutor|Message.*field/.test(node.name)) state.setValue(draftKey, value);
  };
  const sourceValue = (name: string) => {
    const node = spec && allNodes(spec.content).find(n => n.name === name);
    const initial = node?.content ?? (node ? textOf(node).split('\n').slice(1).join('\n') : '');
    return mergedValues[name] ?? (placeholder(initial) ? '' : initial);
  };
  const validate = () => {
    for (const node of spec ? allNodes(spec.content).filter(n => / field$/.test(n.name)) : []) {
      const value = sourceValue(node.name);
      if (/origin|URL/.test(node.name) && value && !/^https?:\/\/[^\s/]+/.test(value)) { setError(t("{value1} must be a valid HTTP or HTTPS URL.", { value1: t(labelOf(node)) })); return false; }
      if (/seconds|tokens|characters|size|rounds|port|TTL|depth/i.test(node.name) && value && !/^\d+(\.\d+)?$/.test(value)) { setError(t("{value1} must be a positive number.", { value1: t(labelOf(node)) })); return false; }
    }
    return true;
  };
  const send = () => {
    const draft = state.values[draftKey] ?? '';
    if (!draft.trim()) { setError('Write a message before sending.'); return; }
    const result = chat.sendMessage(number === 12 ? null : sessionId, draft);
    if (!result.ok || !result.sessionId) { setError(result.error ?? 'Could not send the message. Your draft is preserved.'); return; }
    state.setValue(`${state.workspace}:chat-session`, result.sessionId);
    state.setValue(draftKey, '');
    state.setValue(`${state.workspace}:13:Message field`, '');
    router.replace(route(13));
  };
  const act = (node: DesignNode) => {
    const label = labelOf(node);
    setError('');
    if (node.id.startsWith('session:')) { state.setValue(`${state.workspace}:chat-session`, node.id.slice(8)); open(13); return; }
    if (node.id.startsWith('note:')) {
      const key = node.id.slice(5); const note = state.notes[key];
      if (!note) return;
      state.setValue(`${state.workspace}:editing-note`, key);
      state.setValue(`${state.workspace}:29:Page title field`, note.title);
      state.setValue(`${state.workspace}:29:Editor content`, note.body);
      open(29); return;
    }
    if (number === 28 && label === 'New page') {
      state.setValue(`${state.workspace}:editing-note`, '');
      state.setValue(`${state.workspace}:29:Page title field`, ''); state.setValue(`${state.workspace}:29:Editor content`, '');
      open(29); return;
    }
    if ([52, 56].includes(number) && /Add a?\s?task/.test(label)) {
      state.setValue(`${state.workspace}:editing-task`, ''); state.setValue(`${state.workspace}:57:Task field`, ''); state.setValue(`${state.workspace}:57:Status field`, 'To do');
      open(57); return;
    }
    if (node.name === 'Workspace switch') { open(62); return; }
    if (node.name === 'Account and settings') { open(61); return; }
    if (/Back button/.test(node.name)) { back(); return; }
    if (/More actions/.test(node.name)) { open(number === 13 ? 22 : number <= 8 ? 126 : 61); return; }
    if (node.name === 'copy response action') {
      const response = [...messages].reverse().find(message => message.role === 'assistant')?.content ?? textOf(screenByNumber.get(13)!.content.children!.find(child => child.name === 'Assistant response')!);
      void Clipboard.setStringAsync(response).then(() => notify('Copied', 'Response copied to clipboard.')).catch(() => setError('Clipboard access failed. Select and copy the response text instead.')); return;
    }
    if (node.name === 'bookmark response action') { open(32); return; }
    if (node.name === 'notebook-pen response action') { open(21); return; }
    if (number === 22 && label === 'Rename' && sessionId) {
      setDialogValue(chat.sessions.find(session => session.session_id === sessionId)?.title ?? '');
      setDialog({ title: 'Rename conversation', input: '', submit: title => {
        const result = chat.renameSession(sessionId, title);
        if (!result.ok) setError(result.error ?? 'Could not rename conversation.');
      } }); return;
    }
    if (number === 22 && ['Pin', 'Archive'].includes(label) && sessionId) {
      const result = chat.organizeSession(sessionId, label === 'Pin' ? { pinned: true } : { archived: true });
      if (!result.ok) setError(result.error ?? 'Could not update conversation.');
      else router.replace(route(label === 'Archive' ? 27 : 13)); return;
    }
    if (number === 152 && label === 'Delete conversation' && sessionId) {
      const result = chat.deleteSession(sessionId);
      if (!result.ok) setError(result.error ?? 'Could not delete conversation.');
      else { state.setValue(`${state.workspace}:chat-session`, ''); router.replace(route(27)); } return;
    }
    if (/^Date /.test(node.name)) { state.setValue(`${state.workspace}:selected-date`, node.name.replace('Date ', '')); open(54); return; }
    if (number === 37 && / row$/.test(node.name)) { state.setValue(scope + '__selected', node.name); return; }
    if (number === 62 && /workspace row|selected row/.test(node.name)) { state.setValue(scope + '__selected', node.name); return; }
    if (selectionScreens.has(number) && / row$/.test(node.name) && !destination(number, node)) { state.setValue(scope + '__selected', node.name); return; }
    if (/Start conversation|Send message/.test(label) && [12, 13, 25].includes(number)) { send(); return; }
    if (number === 12 && ['Explain', 'Solve', 'Practice', 'Research'].includes(label)) {
      state.setValue(`${state.workspace}:mode`, label); open(label === 'Research' ? 124 : 25); return;
    }
    if (number === 37 && label === 'Check answer') {
      if (!selected) { setError('Choose an answer first.'); return; }
      state.setValue(`${state.workspace}:practice-correct`, String(selected.startsWith('B ·'))); open(38); return;
    }
    if (number === 62 && label === 'Use selected workspace') {
      if (!selected) { setError('Choose a workspace first.'); return; }
      const workspace = selected.startsWith('General') ? 'General workspace' : 'Software Development';
      state.setWorkspace(workspace);
      router.replace(route(1)); return;
    }
    if (/^Use selected|^Apply choices|^Apply to message|^Attach selected/.test(label)) {
      if ([16, 18, 62, 124, 125].includes(number) && !selected) { setError('Choose an option first.'); return; }
      state.setValue(`${state.workspace}:selection:${number}`, selected ?? JSON.stringify(mergedValues));
      back(); return;
    }
    if (number === 82 && label === 'Apply preferences') {
      const language = (Object.keys(languageNames) as Language[]).find(key => languageNames[key] === sourceValue('Interface language field'));
      if (language) design.setLanguage(language);
      setTransient({});
      notify('Preferences applied', 'Saved on this device.'); return;
    }
    if (number === 83 && label === 'Apply appearance') {
      const theme = sourceValue('Theme field').toLowerCase();
      design.setTheme(theme === 'dark' ? 'dark' : theme === 'light' ? 'snow' : theme === 'cream' ? 'cream' : theme === 'glass' ? 'glass' : 'system');
      setTransient({});
      notify('Appearance applied', 'Saved on this device.'); return;
    }
    if (number === 83 && label === 'Reset learning text') {
      state.setValue(scope + 'Learning text size field', '16'); state.setValue(scope + 'Line spacing field', '1.5'); return;
    }
    if (number === 57 && label === 'Save task') {
      const title = sourceValue('Task field').trim();
      if (!title) { setError('Enter a task title.'); return; }
      state.saveTask(state.workspace, { id: state.values[`${state.workspace}:editing-task`] || `local-task-${localTasks.length + 1}`, title, status: sourceValue('Status field') || 'To do' });
      state.setValue(`${state.workspace}:editing-task`, '');
      router.replace(route(56)); return;
    }
    if ((number === 21 && label === 'Save to notebook') || (number === 29 && label === 'Save note')) {
      const title = sourceValue(number === 21 ? 'Title field' : 'Page title field').trim();
      if (!title) { setError('Enter a note title.'); return; }
      const body = sourceValue(number === 21 ? 'Note section' : 'Editor content');
      const key = number === 29 && state.values[`${state.workspace}:editing-note`] || `${state.workspace}:note-${localNotes.length + 1}`;
      state.saveNote(key, title, body);
      state.setValue(`${state.workspace}:editing-note`, key);
      state.setValue(`${state.workspace}:29:Page title field`, title); state.setValue(`${state.workspace}:29:Editor content`, body);
      notify('Note saved on this device', 'Your authored note is available in Notebook. Server sync is not connected.'); return;
    }
    if (number === 30 && label === 'Accept suggestion') {
      const suggestion = spec?.content.children?.find(n => n.name === 'Suggested revision notice');
      state.setValue(`${state.workspace}:29:Editor content`, suggestion ? textOf(suggestion).split('\n').slice(1).join('\n') : ''); open(29); return;
    }
    if (/^Sign out/.test(label)) { fixtures.signOut(); router.replace('/login'); return; }
    if (/^Cancel$|^Keep |^Return to/.test(label) && !destination(number, node)) { back(); return; }
    if (label === 'Task actions' && number === 57) {
      setDialog({ title: 'Task status', choices: ['To do', 'In progress', 'Done', 'Archived'], choose: status => state.setValue(scope + 'Status field', status) }); return;
    }
    if (number === 112 && label === 'Delete knowledge base' && sourceValue('Confirm knowledge base name field') !== 'Databases') { setError('Type Databases to confirm.'); return; }
    if (/^Save|^Apply|^Update/.test(label) && !/Save to favorites/.test(label)) {
      if (!validate()) return;
      notify('Draft kept on this device', t("{value1} is not connected to a server. Your non-secret form values are preserved locally.", { value1: t(label) })); return;
    }
    const next = destination(number, node);
    if (next && next !== number) { open(next); return; }
    if (number >= 41 && number <= 42 && /\.pdf|\.md|\.txt/.test(label)) { open(42); return; }
    if (number >= 147 && number <= 151 && / row$/.test(node.name)) { open(42); return; }
    if (/^Filters|^Filters & sorting|^View mode/.test(label)) {
      setDialog({ title: label, choices: ['All', 'Marked', 'Untagged', 'Newest first'], choose: value => state.setValue(scope + '__filter', value) }); return;
    }
    if (number === 28 && label === 'New page') { open(29); return; }
    setDialog({ title: label, message: t("{value1}\n\nThis control is not integrated with a backend yet. No server action has been performed.", { value1: t(textOf(node).split('\n').slice(1).join('\n') || 'This action requires a connected service.') }), choices: /tutor|book|reading|learning/i.test(label) ? ['Open existing learning tools'] : undefined, choose: () => router.push('/learning') });
  };
  const ctx: LayerContext = { colors, values: mergedValues, query, selected, selection: selectionScreens.has(number), setValue, act, chooseField: (node, choices) => setDialog({ title: labelOf(node), choices, choose: value => setValue(node, value) }) };
  if ([12, 13, 25].includes(number)) {
    for (const key of ['Ask DeepTutor field', 'Message field', 'Message in progress field']) ctx.values[key] = state.values[draftKey] ?? '';
  }
  if (!spec) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 20, gap: 24 }}><Text style={{ color: colors.ink, fontFamily: 'Inter', fontSize: 22 }}>{t("Screen unavailable")}</Text><Button onPress={() => router.replace(route(1))} style={{ minHeight: 52 }}>{t("Back to Learn")}</Button></SafeAreaView>;
  const title = number === 13 && sessionId ? chat.sessions.find(session => session.session_id === sessionId)?.title || spec.name.split(' / ')[1] : spec.name.split(' / ')[1];
  const isRoot = mobileTabs.some(tab => tab.number === number);
  const body = spec.content.children ?? [];
  const context = body.find(node => node.name === 'Context');
  const contents = number === 13 && sessionId ? body.filter(node => !['Learner question', 'Assistant identity', 'Assistant response', 'Response controls'].includes(node.name)) : body;
  let visible = contents.filter(node => node.name !== 'Software keyboard illustration' && !(number === 29 && node.name === 'Saved notice'));
  if ([27, 108].includes(number)) {
    const rows = chat.sessions.filter(session => Boolean(session.preferences?.archived) === (number === 108)).map(session => disclosure(`session:${session.session_id}`, session.title || 'New conversation', t('Messages: {count}{pinned}', { count: session.message_count, pinned: session.preferences?.pinned ? ` · ${t('Pinned')}` : '' })));
    visible = visible.filter(node => !['New chat row', 'New conversation row'].includes(node.name));
    visible.splice(2, 0, ...rows);
  }
  if (number === 28 && localNotes.length) {
    visible = visible.filter(node => node.name !== 'Untitled draft row');
    visible.splice(2, 0, ...localNotes.map(([key, note]) => disclosure(`note:${key}`, note.title, `${note.body.slice(0, 90) || t('Empty page')} · ${t('On this device')}`)));
  }
  const paragraph = (text: string) => <Text style={{ color: colors.ink, fontFamily: 'Inter', fontSize: 16, lineHeight: 24 }}>{text}</Text>;
  const taskCards = <View style={{ gap: 12 }}>{localTasks.filter(task => (!query || task.title.toLowerCase().includes(query.toLowerCase())) && (number !== 56 || !values['View status field'] || values['View status field'] === 'All' || task.status === values['View status field'])).map(task => <Pressable key={task.id} accessibilityRole="button" accessibilityLabel={t("Edit {value1}", { value1: String(task.title) })} onPress={() => { state.setValue(`${state.workspace}:editing-task`, task.id); state.setValue(`${state.workspace}:57:Task field`, task.title); state.setValue(`${state.workspace}:57:Status field`, task.status); open(57); }} style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: 6 }}>{paragraph(task.title)}<Text style={{ fontFamily: 'Inter', color: colors.muted, fontSize: 14 }}>{t(task.status)} {t("· Saved on this device")}</Text></Pressable>)}</View>;
  return <SafeAreaView testID={clientReady ? 'mobile-ready' : 'mobile-loading'} edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
    <StatusBar style={dark ? 'light' : 'dark'} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingRight: 20, paddingBottom: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t(isRoot ? 'Switch workspace' : 'Back')} onPress={() => isRoot ? open(62) : back()} style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>{isRoot ? <Layers size={22} color={colors.ink} /> : <ChevronLeft size={22} color={colors.ink} />}</Pressable>
        <Text accessibilityRole="header" style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: 22, lineHeight: 31, color: colors.ink, flex: 1 }}>{number === 13 && sessionId ? title : t(title)}</Text>
        {isRoot ? <Pressable accessibilityRole="button" accessibilityLabel={t('Account and settings')} onPress={() => open(61)} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' }}><UserRound size={22} color={colors.accent} /></Pressable> : spec.header.children?.some(node => /More actions/.test(node.name)) ? <Button variant="secondary" onPress={() => open(number === 13 ? 22 : 126)} style={{ minHeight: 52 }}>···</Button> : null}
      </View>
      <FlatList key={number} data={visible} keyExtractor={node => node.id} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 24, gap: 24 }} initialNumToRender={12} windowSize={5}
        ListHeaderComponent={error ? <Text accessibilityRole="alert" style={{ fontFamily: 'Inter', color: colors.danger, fontSize: 16, lineHeight: 24 }}>{t(error)}</Text> : undefined}
        renderItem={({ item }) => {
          if (number === 26 && item.name === 'Search library field') return <MobileRow title={t('Search library')} description={t('navigation.searchEverything')} onPress={() => router.push('/search')} />;
          if (item.name === 'Context' && context && textOf(context) === 'Software Development') return <Text style={{ color: colors.muted, fontFamily: 'Inter', fontSize: 14, lineHeight: 20 }}>{workspaceState.workspaces.find(item => item.workspace_id === state.workspace)?.display_name ?? (state.workspace || t('General workspace'))}</Text>;
          if (number === 13 && item.name === 'Sources & session activity row' && sessionId) return <View style={{ gap: 20 }}><Text style={{ fontFamily: 'Inter', color: colors.muted, fontSize: 12 }}>{t("DEMO CONVERSATION · replies are simulated")}</Text>{messages.map(message => <View key={message.id} style={{ padding: message.role === 'user' ? 16 : 0, borderRadius: 12, backgroundColor: message.role === 'user' ? colors.soft : 'transparent', gap: 8 }}>{message.role === 'assistant' && <Text style={{ color: colors.accent, fontFamily: 'Inter', fontSize: 12, fontWeight: '600' }}>DEEPTUTOR</Text>}{paragraph(message.content)}{!!message.error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{t(message.error)}</Text>}</View>)}<NativeLayer node={item} ctx={ctx} /></View>;
          if (number === 38 && item.name === 'Correct · At each statement notice' && state.values[`${state.workspace}:practice-correct`] === 'false') return <View style={{ padding: 16, borderRadius: 12, backgroundColor: colors['error-surface'], gap: 8 }}><Text accessibilityRole="alert" style={{ color: colors.danger, fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>{t("Not quite. Try the example again.")}</Text>{paragraph(t('Read committed takes a new snapshot at each statement. Two statements can see different committed data.'))}</View>;
          if (number === 52 && item.name === 'Tasks section' && localTasks.length > 0) return <View style={{ gap: 12 }}><Text accessibilityRole="header" style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: 18, color: colors.ink }}>{t("Tasks")}</Text>{taskCards}<Button onPress={() => act({ id: 'add-task', type: 'text', name: 'Add a task', content: 'Add a task' })} style={{ minHeight: 52 }}>{t("Add a task")}</Button><Button variant="secondary" onPress={() => open(56)} style={{ minHeight: 52 }}>{t("Task board")}</Button></View>;
          if (number === 56 && /Empty|No tasks/.test(item.name) && localTasks.length) return null;
          return <NativeLayer node={item} ctx={ctx} />;
        }}
        ListFooterComponent={<View style={{ gap: 16 }}>{number === 56 && localTasks.length > 0 && taskCards}{number === 29 && <Button onPress={() => act({ id: 'save-note', type: 'frame', name: 'Save note', children: [{ id: 'save-note-label', type: 'text', name: 'Label', content: 'Save note' }] })} style={{ minHeight: 52 }}>{t("Save note")}</Button>}{!!query && !allNodes(spec.content).some(node => / row$/.test(node.name) && [textOf(node), ...textOf(node).split('\n').map(text => t(text))].join('\n').toLowerCase().includes(query.toLowerCase())) && <Text accessibilityRole="status" style={{ fontFamily: 'Inter', color: colors.muted, fontSize: 16 }}>{t("No results. Try a different search.")}</Text>}</View>}
      />
      {spec.tabs && <BottomNavigation activeScreen={number} />}
    </KeyboardAvoidingView>
    <SharedDialog open={dialog !== null} title={t(dialog?.title ?? '')} onClose={() => setDialog(null)}>
          {!!dialog?.message && paragraph(t(dialog.message))}
          {dialog?.input !== undefined && <TextInput autoFocus accessibilityLabel={t(dialog.title)} multiline value={dialogValue} onChangeText={setDialogValue} style={{ minHeight: 120, color: colors.ink, fontFamily: 'Inter', fontSize: 16, padding: 12, borderWidth: 1, borderColor: colors.line }} />}
          {dialog?.choices?.map(choice => <Button key={choice} variant="secondary" onPress={() => { dialog.choose?.(choice); setDialog(null); }} style={{ minHeight: 52 }}>{t(choice)}</Button>)}
          {dialog?.submit && <Button onPress={() => { dialog.submit?.(dialogValue); setDialog(null); }} style={{ minHeight: 52 }}>{t("Save")}</Button>}
          <Button onPress={() => setDialog(null)} style={{ minHeight: 52 }}>{t("Done")}</Button>
    </SharedDialog>
  </SafeAreaView>;
}
