import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { api } from '@/api/client';
import { answerChunk, ChatConnection, commandId, visibleMessages, websocketUrl, type ChatEvent, type ChatModel, type ChatRow, type Conversation } from './protocol';
import { configurationFromPreferences, type TutorConfiguration } from './configuration';
import { getConversation, listChatModels, listConversations } from './repository';

export function chatError(cause: unknown): string {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    const detail = cause.response?.data?.detail;
    return typeof detail === 'string' ? detail : 'Unable to reach the server. Please try again.';
  }
  return cause instanceof Error ? cause.message : 'Unable to reach the server. Please try again.';
}

export function useLiveChat(initialId: string | null) {
  const [configuration, setConfiguration] = useState<TutorConfiguration>({});
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [model, setModel] = useState<ChatModel | null>(null);
  const [title, setTitle] = useState('New chat');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [draft, setDraft] = useState('');
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
        setError(event.content || 'The response failed. Reopen the conversation before trying again.');
      }
      if (event.type === 'protocol_error' || (event.type === 'command_ack' && event.accepted === false)) {
        setError(event.message || 'The server rejected this chat command.'); finish();
      }
      if (event.type === 'done') {
        finish();
        // Read persisted IDs and the server-selected branch before the next turn.
        if (sessionId.current) {
          setLoading(true);
          void getConversation(sessionId.current, abort.signal).then(data => {
            if (!active) return;
            const rows = visibleMessages(data);
            parentId.current = rows.at(-1)?.id ?? null;
            setMessages(rows); setTitle(data.title || 'New chat');
          }).catch(cause => { if (active) setError(chatError(cause)); }).finally(() => { if (active) setLoading(false); });
        }
      }
    };
    const socket = new ChatConnection(websocketUrl(String(api.defaults.baseURL)), onEvent, message => {
      if (active) { clearTimeout(checkTimer); activeReply?.(); setError(message); finish(); }
    });
    connection.current = socket;
    void Promise.all([
      listChatModels(abort.signal).then(catalog => {
        if (!active) return;
        setModels(catalog.options);
        setModel(catalog.options.find(option => option.profile_id === catalog.active?.profile_id && option.model_id === catalog.active?.model_id) ?? catalog.options[0] ?? null);
        return catalog;
      }),
      targetId ? getConversation(targetId, abort.signal).then(async data => {
        if (!active) return;
        const rows = visibleMessages(data);
        savedModel = data.preferences?.llm_selection;
        setConfiguration(configurationFromPreferences(data.preferences));
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
  }, [initialId, revision]);

  const refreshHistory = async (more = false) => {
    if (historyLock.current) return;
    historyLock.current = true; setHistoryLoading(true); setHistoryError('');
    try {
      const rows = await listConversations(undefined, more ? sessions.length : 0);
      if (mounted.current) { setSessions(old => more ? [...old, ...rows] : rows); setHasMore(rows.length === 50); }
    } catch (cause) { if (mounted.current) setHistoryError(chatError(cause)); }
    finally { historyLock.current = false; if (mounted.current) setHistoryLoading(false); }
  };
  const send = async (language: string) => {
    const content = draft.trim();
    if (!content || replyLock.current || error || loading || (lock.current && !waiting) || !connection.current) return;
    const replying = waiting;
    if (replying) replyLock.current = true;
    if (!replying) { lock.current = true; turnId.current = ''; cancelRequested.current = false; }
    setBusy(true); setWaiting(false); setError('');
    const userId = --localId.current;
    assistantId.current = --localId.current;
    setMessages(old => [...old, { id: userId, role: 'user', content }, { id: assistantId.current, role: 'assistant', content: '' }]);
    setDraft('');
    try {
      await connection.current.send(replying ? {
        type: 'submit_user_reply', turn_id: turnId.current, text: content, command_id: commandId(),
      } : {
        type: 'start_turn', content, session_id: sessionId.current, capability: 'chat', ...configuration, language,
        client_submission_id: commandId(),
        ...(sessionId.current ? { parent_message_id: parentId.current } : {}),
        ...(model ? { llm_selection: { profile_id: model.profile_id, model_id: model.model_id } } : {}),
      });
    } catch (cause) {
      if (mounted.current) { setError(chatError(cause)); setDraft(content); finish(); }
    }
  };
  const stop = async () => {
    if (!turnId.current) { cancelRequested.current = true; return; }
    try { await connection.current?.send({ type: 'cancel_turn', turn_id: turnId.current, command_id: commandId() }); }
    catch (cause) { if (mounted.current) setError(chatError(cause)); }
  };
  return { configuration, setConfiguration, messages, sessions, models, model, setModel, title, loading, busy, waiting, draft, setDraft, error, historyError, historyLoading, hasMore, serverSessionId, refreshHistory, send, stop, reload: () => { lock.current = false; setBusy(false); setWaiting(false); setLoading(true); setError(''); setRevision(old => old + 1); } };
}
