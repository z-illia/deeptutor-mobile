import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { api } from '@/api/client';
import { answerChunk, ChatConnection, commandId, visibleMessages, websocketUrl, type ChatEvent, type ChatModel, type ChatRow, type Conversation, type OutgoingAttachment } from './protocol';
import { configurationFromPreferences, type TutorConfiguration } from './configuration';
import { getConversation, listChatModels, listConversations } from './repository';

export function chatError(cause: unknown): string {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 403) return 'Your account cannot access this learning content.';
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    const detail = cause.response?.data?.detail;
    return typeof detail === 'string' ? detail : cause.response ? `The server could not complete this request (HTTP ${cause.response.status}).` : 'Unable to reach the server. Please try again.';
  }
  return cause instanceof Error ? cause.message : 'Unable to reach the server. Please try again.';
}

export type LearningChatContext = { mastery_path_id?: string; mastery_session_mode?: string; workspace_id: string; workspace_mode?: string; reading_material_id?: string; reading_material_revision?: number; reading_workspace_id?: string };

export type ChatDraft = { text: string; configuration?: TutorConfiguration; attachments?: OutgoingAttachment[] };
export function useLiveChat(initialId: string | null, learning?: LearningChatContext, initialDraft?: ChatDraft) {
  const workspaceId = learning?.workspace_id;
  const [restoredConfiguration] = useState(initialDraft?.configuration);
  const [configuration, setConfiguration] = useState<TutorConfiguration>(initialDraft?.configuration ?? {});
  const [configurationEdited, setConfigurationEdited] = useState(!!initialDraft?.configuration);
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [model, setModel] = useState<ChatModel | null>(null);
  const [title, setTitle] = useState('New chat');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [draft, setDraft] = useState(initialDraft?.text ?? '');
  const [pendingAttachments, setPendingAttachments] = useState<OutgoingAttachment[]>(initialDraft?.attachments ?? []);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [serverSessionId, setServerSessionId] = useState(initialId);
  const connection = useRef<ChatConnection | null>(null);
  const sessionId = useRef(initialId);
  const turnId = useRef('');
  const assistantId = useRef(-2);
  const localId = useRef(-2);
  const lock = useRef(false);
  const replyLock = useRef(false);
  const mounted = useRef(true);
  const historyLock = useRef(false);
  const cancelRequested = useRef(false);
  const parentId = useRef<number | null>(null);
  const [revision, setRevision] = useState(0);
  const failedDraft = useRef('');
  const turnFailed = useRef(false);
  const sentFiles = useRef(false);
  const finish = () => { lock.current = false; replyLock.current = false; setBusy(false); setWaiting(false); };

  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    let active = true;
    const targetId = sessionId.current;
    let activeReply: (() => void) | undefined;
    const activeCheck = targetId ? new Promise<void>(resolve => { activeReply = resolve; }) : Promise.resolve();
    let checkTimer: ReturnType<typeof setTimeout> | undefined;
    let savedModel: { profile_id: string; model_id: string } | undefined;
    const onEvent = (event: ChatEvent) => {
      if (!active) return;
      const boundId = event.session_id || (typeof event.metadata?.session_id === 'string' ? event.metadata.session_id : '');
      if (boundId) { sessionId.current = boundId; setServerSessionId(boundId); }
      if (event.turn_id) turnId.current = event.turn_id;
      if (cancelRequested.current && turnId.current) {
        cancelRequested.current = false;
        void connection.current?.send({ type: 'cancel_turn', turn_id: turnId.current, command_id: commandId() }).catch(cause => { if (active) setError(chatError(cause)); });
      }
      if (event.type === 'active_turn_info') {
        clearTimeout(checkTimer); activeReply?.();
        if (event.turn_id && ['running', 'queued', 'waiting_input', 'recovering'].includes(event.status ?? '')) {
          lock.current = true; setBusy(true); setWaiting(event.status === 'waiting_input');
          assistantId.current = --localId.current;
          setMessages(old => [...old, { id: assistantId.current, role: 'assistant', content: '' }]);
          void connection.current?.send({ type: 'subscribe_turn', turn_id: event.turn_id, after_seq: 0 }).catch(cause => { if (active) { setError(chatError(cause)); finish(); } });
        }
        return;
      }
      if (event.type === 'tool_result') setMessages(old => old.map(row => row.id === assistantId.current ? { ...row, events: [...(row.events ?? []), event] } : row));
      const chunk = answerChunk(event);
      if (chunk) setMessages(old => old.map(row => row.id === assistantId.current ? { ...row, content: row.content + chunk } : row));
      if (event.type === 'session_meta' && typeof event.metadata?.title === 'string') setTitle(event.metadata.title);
      if (event.type === 'wait_for_input') {
        replyLock.current = false; setWaiting(true);
        if (event.content) setMessages(old => old.map(row => row.id === assistantId.current ? { ...row, content: row.content + '\n\n' + event.content } : row));
      }
      // Cancellation is followed by `done`, which refreshes the persisted conversation.
      // Treat it as a normal end of the turn so the composer remains usable.
      if (event.type === 'error' && !/^Turn cancel(?:led|ed)[.!]?$/i.test(event.content?.trim() ?? '')) {
        turnFailed.current = true; setDraft(value => value || failedDraft.current);
        setError(event.content || 'The response failed. Reopen the conversation before trying again.');
      }
      if (event.type === 'protocol_error' || (event.type === 'command_ack' && event.accepted === false)) {
        turnFailed.current = true; setDraft(value => value || failedDraft.current);
        setError(event.message || 'The server rejected this chat command.'); finish();
      }
      if (event.type === 'done') {
        if (!turnFailed.current) { setConfigurationEdited(false); if (sentFiles.current) setPendingAttachments([]); }
        finish();
        // Read persisted IDs and the server-selected branch before the next turn.
        if (sessionId.current) {
          setLoading(true);
          void getConversation(sessionId.current, abort.signal, workspaceId).then(data => {
            if (!active) return;
            const rows = visibleMessages(data);
            parentId.current = rows.at(-1)?.id ?? null;
            setMessages(rows); setTitle(data.title || 'New chat');
          }).catch(cause => { if (active) setError(chatError(cause)); }).finally(() => { if (active) setLoading(false); });
        }
      }
    };
    const socket = new ChatConnection(websocketUrl(String(api.defaults.baseURL)) + (workspaceId !== undefined ? `?dt_workspace=${encodeURIComponent(workspaceId)}` : ''), onEvent, message => {
      if (active) { clearTimeout(checkTimer); activeReply?.(); if (lock.current || replyLock.current) { turnFailed.current = true; setDraft(value => value || failedDraft.current); } setError(message); finish(); }
    });
    connection.current = socket;
    void Promise.all([
      listChatModels(abort.signal).then(catalog => {
        if (!active) return;
        setModels(catalog.options);
        setModel(catalog.options.find(option => option.profile_id === catalog.active?.profile_id && option.model_id === catalog.active?.model_id) ?? catalog.options[0] ?? null);
        return catalog;
      }),
      targetId ? getConversation(targetId, abort.signal, workspaceId).then(async data => {
        if (!active) return;
        const rows = visibleMessages(data);
        savedModel = data.preferences?.llm_selection;
        setConfiguration({ ...configurationFromPreferences(data.preferences), ...restoredConfiguration });
        setMessages(rows); setTitle(data.title || 'New chat'); parentId.current = rows.at(-1)?.id ?? null;
        await socket.connect();
        if (!active) return;
        checkTimer = setTimeout(() => { if (active) { setError('The server did not report the active response. Reload the conversation.'); activeReply?.(); } }, 15000);
        await socket.send({ type: 'check_active_turn', session_id: targetId });
        await activeCheck;
      }) : Promise.resolve(),
    ]).then(([catalog]) => {
      const selection = savedModel;
      if (active && selection && catalog) setModel(catalog.options.find(option => option.profile_id === selection.profile_id && option.model_id === selection.model_id) ?? null);
    }).catch(cause => { if (active) { clearTimeout(checkTimer); setError(chatError(cause)); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; clearTimeout(checkTimer); mounted.current = false; abort.abort(); socket.close(); connection.current = null; };
  }, [initialId, revision, workspaceId, restoredConfiguration]);

  const refreshHistory = async (more = false) => {
    if (historyLock.current) return;
    historyLock.current = true; setHistoryLoading(true); setHistoryError('');
    try {
      const rows = await listConversations(undefined, more ? sessions.length : 0, workspaceId);
      if (mounted.current) { setSessions(old => more ? [...old, ...rows] : rows); setHasMore(rows.length === 50); }
    } catch (cause) { if (mounted.current) setHistoryError(chatError(cause)); }
    finally { historyLock.current = false; if (mounted.current) setHistoryLoading(false); }
  };
  const send = async (language: string, submission?: { content: string; preserveDraft?: boolean; mastery_session_mode?: 'study'; mastery_answer?: { question_id: string; text: string; answers?: Record<string, string> }; mastery_skip?: { question_id: string } }) => {
    const content = (submission?.content ?? draft).trim();
    if (!content || replyLock.current || error || loading || (lock.current && !waiting) || !connection.current) return false;
    const replying = waiting;
    if (replying) replyLock.current = true;
    if (!replying) { lock.current = true; turnId.current = ''; cancelRequested.current = false; }
    turnFailed.current = false; failedDraft.current = submission?.preserveDraft ? draft : content; sentFiles.current = !replying && pendingAttachments.length > 0;
    setBusy(true); setWaiting(false); setError('');
    const userId = --localId.current;
    assistantId.current = --localId.current;
    setMessages(old => [...old, { id: userId, role: 'user', content, ...(sentFiles.current ? { attachments: pendingAttachments } : {}) }, { id: assistantId.current, role: 'assistant', content: '' }]);
    if (!submission?.preserveDraft) setDraft('');
    try {
      await connection.current.send(replying ? {
        type: 'submit_user_reply', turn_id: turnId.current, text: content, command_id: commandId(),
      } : {
        type: 'start_turn', content, session_id: sessionId.current, capability: 'chat', ...configuration, language, workspace_id: workspaceId,
        ...(pendingAttachments.length ? { attachments: pendingAttachments } : {}),
        ...(submission?.mastery_answer ? { mastery_answer: submission.mastery_answer } : {}),
        ...(submission?.mastery_skip ? { mastery_skip: submission.mastery_skip } : {}),
        ...(learning ? { ...learning, capability: learning.mastery_path_id ? 'mastery_path' : 'chat' } : {}),
        ...(submission?.mastery_session_mode ? { mastery_session_mode: submission.mastery_session_mode } : {}),
        client_submission_id: commandId(),
        ...(sessionId.current ? { parent_message_id: parentId.current } : {}),
        ...(model ? { llm_selection: { profile_id: model.profile_id, model_id: model.model_id } } : {}),
      });
      return true;
    } catch (cause) {
      if (mounted.current) { turnFailed.current = true; setError(chatError(cause)); setDraft(value => value || failedDraft.current); finish(); }
      return false;
    }
  };
  const stop = async () => {
    if (!turnId.current) { cancelRequested.current = true; return; }
    try { await connection.current?.send({ type: 'cancel_turn', turn_id: turnId.current, command_id: commandId() }); }
    catch (cause) { if (mounted.current) setError(chatError(cause)); }
  };
  return { pendingAttachments, setPendingAttachments, configurationEdited, configuration, setConfiguration: (update: TutorConfiguration | ((previous: TutorConfiguration) => TutorConfiguration)) => { setConfiguration(update); setConfigurationEdited(true); }, messages, sessions, models, model, setModel, title, loading, busy, waiting, draft, setDraft, error, historyError, historyLoading, hasMore, serverSessionId, refreshHistory, send, stop, reload: () => { lock.current = false; setBusy(false); setWaiting(false); setLoading(true); setError(''); setRevision(old => old + 1); } };
}
