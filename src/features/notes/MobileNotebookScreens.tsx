import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useCopy } from '@/features/entry/copy';
import { ChatMarkdown } from '@/features/chat/ChatMarkdown';
import { MobileAction, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { ErrorState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import {
  createNote,
  deleteNote,
  getActiveNoteId,
  getNote,
  listNotes,
  listNoteSuggestions,
  noteError,
  pickAndImportDocx,
  readStagedNoteReview,
  requestDitoEdit,
  reviewNoteSuggestion,
  saveNote,
  setActiveNoteId,
  stageNoteReview,
  type NoteSuggestion,
  type NoteSummary,
} from './repository';

function useNoteScope() {
  const auth = useAuth();
  const workspaces = useWorkspaces();
  const workspace = workspaces.selectedWorkspaceId;
  const workspaceName = workspaces.workspaces.find(w => w.workspace_id === workspace)?.display_name ?? '';
  const scopeKey = JSON.stringify([auth.serverUrl, auth.session?.profile?.id ?? null, workspace]);
  return { workspace, workspaceName, scopeKey };
}

export function NotebookListScreen() {
  const { workspace, workspaceName, scopeKey } = useNoteScope();
  const t = useCopy();
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const items = await listNotes(workspace, signal);
      if (!signal?.aborted) setNotes(items);
    } catch (cause) {
      if (!signal?.aborted) setError(noteError(cause));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [workspace]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]));

  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (cause) {
      setError(noteError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const query = search.trim().toLocaleLowerCase();
  const visible = notes.filter(note => {
    if (!query) return true;
    return `${note.title} ${note.preview}`.toLocaleLowerCase().includes(query);
  });

  return <MobilePage title={t('Notebook')} fallback="/library" tab={26}>
    <MobileText muted>{`${notes.length} · ${workspaceName || t('General workspace')}`}</MobileText>
    {!!error && <ErrorState message={t(error)} onRetry={() => void load()} />}
    <MobileField label={t('Search pages')} placeholder={t('Search titles and notes')} value={search} onChangeText={setSearch} />
    {loading && <LoadingState />}
    {!loading && visible.map(note => (
      <MobileRow
        key={note.id}
        title={note.title || t('Untitled draft')}
        description={note.preview || t('Empty page')}
        onPress={() => {
          setActiveNoteId(scopeKey, note.id);
          router.push({ pathname: "/notes/edit", params: { docId: note.id } });
        }}
      />
    ))}
    <MobileAction
      disabled={busy}
      onPress={() => {
        setActiveNoteId(scopeKey, null);
        stageNoteReview(scopeKey, null);
        router.push('/notes/edit');
      }}
    >
      {t('New page')}
    </MobileAction>
    <MobileAction
      variant="secondary"
      disabled={busy}
      loading={busy}
      onPress={() => void run(async () => {
        const imported = await pickAndImportDocx(workspace);
        if (!imported) return;
        setActiveNoteId(scopeKey, imported.id);
        router.push({ pathname: "/notes/edit", params: { docId: imported.id } });
      })}
    >
      {t('Import Word document')}
    </MobileAction>
    <MobileAction variant="secondary" disabled={busy || loading} onPress={() => void load()}>
      {t('Refresh')}
    </MobileAction>
  </MobilePage>;
}

export function EditNoteScreen({ conversationNote = false }: { conversationNote?: boolean }) {
  const { docId: paramDocId } = useLocalSearchParams<{ docId?: string }>();
  const { workspace, scopeKey } = useNoteScope();
  const t = useCopy();
  const initialDocId = conversationNote ? null : (paramDocId ?? getActiveNoteId(scopeKey));
  const [docId, setDocId] = useState<string | null>(initialDocId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [revision, setRevision] = useState<number | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<NoteSuggestion[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(Boolean(initialDocId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);

  useFocusEffect(useCallback(() => {
    const targetId = conversationNote ? null : (paramDocId ?? getActiveNoteId(scopeKey));
    setDocId(targetId);
    if (!targetId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const signal = controller.signal;
    setLoading(true);
    setError('');
    void Promise.all([
      getNote(workspace, targetId, signal),
      listNoteSuggestions(workspace, targetId, signal).catch(() => [] as NoteSuggestion[]),
    ])
      .then(([page, pageSuggestions]) => {
        if (signal.aborted) return;
        setTitle(page.title);
        setContent(page.content);
        setRevision(page.revision);
        setSuggestions(pageSuggestions.filter(s => s.status === 'pending'));
      })
      .catch(cause => {
        if (!signal.aborted) setError(noteError(cause));
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [conversationNote, paramDocId, scopeKey, workspace]));

  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setSavedNotice(false);
    try {
      await work();
    } catch (cause) {
      setError(noteError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const persistNote = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      throw new Error('Enter a note title.');
    }
    if (docId) {
      const updated = await saveNote(workspace, docId, {
        title: cleanTitle,
        content,
        expected_revision: revision,
      });
      setRevision(updated.revision);
      return updated;
    }
    const created = await createNote(workspace, { title: cleanTitle, content });
    setDocId(created.id);
    setRevision(created.revision);
    setActiveNoteId(scopeKey, created.id);
    return created;
  };

  const openDitoReview = async () => {
    const pending = suggestions[0];
    if (pending && docId) {
      stageNoteReview(scopeKey, {
        docId,
        title: title.trim() || t('Untitled draft'),
        originalContent: pending.original_text || content,
        suggestedContent: pending.markdown,
        explanation: pending.explanation,
        suggestionId: pending.id,
        revision,
      });
      router.push('/notes/review');
      return;
    }
    const saved = await persistNote();
    const res = await requestDitoEdit(workspace, { text: saved.content || saved.title });
    stageNoteReview(scopeKey, {
      docId: saved.id,
      title: saved.title,
      originalContent: saved.content,
      suggestedContent: res.edited_text,
      revision: saved.revision,
    });
    router.push('/notes/review');
  };

  return <MobilePage title={t(conversationNote ? 'Conversation note' : 'Edit note')} fallback={conversationNote ? '/chat' : '/notes'}>
    <MobileText muted>{t(conversationNote ? 'Saving creates an authored notebook page. Favorites preserve the original conversation instead.' : 'Saved status persists per page')}</MobileText>
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {savedNotice && <InlineAlert tone="success">{`${t('Saved')} — ${t('Your latest changes are saved. Draft recovery across interruptions is proposed.')}`}</InlineAlert>}
    {loading ? <LoadingState /> : <>
      <MobileField label={t(conversationNote ? 'Title' : 'Page title')} value={title} onChangeText={setTitle} editable={!busy} />
      <MobileField label={t('Note')} value={content} onChangeText={setContent} multiline editable={!busy} />
      {!!content.trim() && <ChatMarkdown content={content} />}
      {!conversationNote && <>
        <MobileRow
          title={t('Insert content')}
          description={t('Text · heading · available editor blocks')}
          onPress={() => setContent(prev => (prev ? `${prev}\n\n## ` : '## '))}
        />
        <MobileAction
          disabled={busy}
          loading={busy}
          onPress={() => void run(openDitoReview)}
        >
          {t('Ask Dito')}
        </MobileAction>
        <MobileRow
          title={t('Suggested edit')}
          description={t('Review before applying to the note')}
          onPress={() => void run(openDitoReview)}
        />
      </>}
      <MobileAction
        disabled={busy}
        loading={busy}
        onPress={() => void run(async () => {
          await persistNote();
          setSavedNotice(true);
        })}
      >
        {t(conversationNote ? 'Save to notebook' : 'Save note')}
      </MobileAction>
      {conversationNote ? (
        <MobileAction variant="secondary" disabled={busy} onPress={() => router.replace('/chat')}>
          {t('Return to conversation')}
        </MobileAction>
      ) : (
        docId && (
          <MobileAction variant="secondary" disabled={busy} onPress={() => setConfirmDelete(true)}>
            {t('Delete')}
          </MobileAction>
        )
      )}
    </>}
    <ConfirmDialog
      open={confirmDelete}
      title={t('Delete permanently')}
      confirmLabel={t('Delete')}
      busy={busy}
      onCancel={() => setConfirmDelete(false)}
      onConfirm={() => {
        if (!docId) return;
        void run(async () => {
          await deleteNote(workspace, docId);
          setActiveNoteId(scopeKey, null);
          stageNoteReview(scopeKey, null);
          setConfirmDelete(false);
          router.replace('/notes');
        });
      }}
    >
      {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    </ConfirmDialog>
  </MobilePage>;
}

export function ReviewNoteEditScreen() {
  const { workspace, scopeKey } = useNoteScope();
  const t = useCopy();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const staged = readStagedNoteReview(scopeKey);

  useFocusEffect(useCallback(() => {
    if (staged) return;
    const activeId = getActiveNoteId(scopeKey);
    if (!activeId) return;
    const controller = new AbortController();
    const signal = controller.signal;
    void Promise.all([
      getNote(workspace, activeId, signal),
      listNoteSuggestions(workspace, activeId, signal).catch(() => [] as NoteSuggestion[]),
    ])
      .then(([page, list]) => {
        if (signal.aborted) return;
        const pending = list.find(s => s.status === 'pending');
        if (pending) {
          stageNoteReview(scopeKey, {
            docId: page.id,
            title: page.title,
            originalContent: pending.original_text || page.content,
            suggestedContent: pending.markdown,
            explanation: pending.explanation,
            suggestionId: pending.id,
            revision: page.revision,
          });
        }
      })
      .catch(cause => {
        if (!signal.aborted) setError(noteError(cause));
      });
    return () => controller.abort();
  }, [scopeKey, staged, workspace]));

  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (cause) {
      setError(noteError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return <MobilePage title={t('Review note edit')} fallback="/notes/edit">
    <MobileText muted>{t('Dito suggestion')}</MobileText>
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {!staged ? (
      <MobileAction onPress={() => router.replace('/notes/edit')}>{t('Edit note')}</MobileAction>
    ) : <>
      <MobileText muted style={{ fontSize: 12, fontWeight: '600' }}>{t('CURRENT PARAGRAPH')}</MobileText>
      <MobileText>{staged.originalContent || t('Empty page')}</MobileText>
      <View style={{ gap: 6 }}>
        <MobileText style={{ fontWeight: '600' }}>{t('Suggested revision')}</MobileText>
        <ChatMarkdown content={staged.suggestedContent} />
        {!!staged.explanation && <MobileText muted>{staged.explanation}</MobileText>}
      </View>
      <MobileAction
        disabled={busy}
        loading={busy}
        onPress={() => void run(async () => {
          if (staged.suggestionId) {
            await reviewNoteSuggestion(workspace, staged.docId, staged.suggestionId, true);
          } else {
            await saveNote(workspace, staged.docId, {
              title: staged.title,
              content: staged.suggestedContent,
              expected_revision: staged.revision,
            });
          }
          setActiveNoteId(scopeKey, staged.docId);
          stageNoteReview(scopeKey, null);
          router.replace({ pathname: "/notes/edit", params: { docId: staged.docId } });
        })}
      >
        {t('Accept suggestion')}
      </MobileAction>
      <MobileAction
        variant="secondary"
        disabled={busy}
        onPress={() => void run(async () => {
          if (staged.suggestionId) {
            await reviewNoteSuggestion(workspace, staged.docId, staged.suggestionId, false);
          }
          setActiveNoteId(scopeKey, staged.docId);
          stageNoteReview(scopeKey, null);
          router.replace({ pathname: "/notes/edit", params: { docId: staged.docId } });
        })}
      >
        {t('Keep original')}
      </MobileAction>
    </>}
  </MobilePage>;
}
