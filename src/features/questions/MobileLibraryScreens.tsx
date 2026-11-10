import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useCopy } from '@/features/entry/copy';
import { commandId } from '@/features/chat/live/protocol';
import { ChatMarkdown } from '@/features/chat/ChatMarkdown';
import { MobileAction, MobileChoice, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { ErrorState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import {
  checkPracticeAnswer,
  commitQuestionImport,
  createQuestionCategory,
  deleteQuestionCategory,
  deleteQuestionEntry,
  fetchQuestionTemplate,
  getLearningJournal,
  getPracticeQuestionById,
  getPracticeQueue,
  getQuestionStats,
  libraryError,
  linkQuestionCategory,
  listQuestionCategories,
  listQuestionEntries,
  pickAndPreviewQuestionImport,
  readImportCommitResult,
  readPracticeReviewOutcome,
  readStagedImportPreview,
  renameQuestionCategory,
  saveImportCommitResult,
  savePracticeReviewOutcome,
  stageImportPreview,
  submitPracticeReview,
  unlinkQuestionCategory,
  updateQuestionEntry,
  type LearningJournal,
  type PracticeItem,
  type QuestionBankStats,
  type QuestionCategory,
  type QuestionEntry,
} from './repository';

function useScopeOwner() {
  const auth = useAuth();
  const workspaces = useWorkspaces();
  const workspace = workspaces.selectedWorkspaceId;
  const workspaceName = workspaces.workspaces.find(w => w.workspace_id === workspace)?.display_name ?? '';
  const scopeKey = JSON.stringify([auth.serverUrl, auth.session?.profile?.id ?? null, workspace]);
  return { workspace, workspaceName, scopeKey };
}

export function QuestionBankScreen({ mistakes = false }: { mistakes?: boolean }) {
  const params = useLocalSearchParams<{ filter?: string; categoryId?: string }>();
  const { workspace, workspaceName } = useScopeOwner();
  const t = useCopy();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>(params.categoryId ? `cat:${params.categoryId}` : params.filter === 'untagged' ? 'untagged' : params.filter === 'marked' ? 'marked' : 'all');
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');
  const [entries, setEntries] = useState<QuestionEntry[]>([]);
  const [stats, setStats] = useState<QuestionBankStats>({ total: 0, wrong: 0, unresolved: 0, bookmarked: 0, uncategorized: 0 });
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<QuestionEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);
  const seq = useRef(0);

  const selectedCategoryId = filter.startsWith('cat:') ? Number(filter.slice(4)) : undefined;
  const load = useCallback(async (signal?: AbortSignal) => {
    const current = ++seq.current;
    setLoading(true);
    setError('');
    try {
      const [listRes, statsRes, catsRes] = await Promise.all([
        listQuestionEntries(workspace, {
          mistakesOnly: mistakes,
          categoryId: selectedCategoryId,
          uncategorized: filter === 'untagged' || undefined,
          bookmarked: filter === 'marked' ? true : undefined,
          search,
          sort,
        }, signal),
        getQuestionStats(workspace, signal),
        listQuestionCategories(workspace, signal),
      ]);
      if (signal?.aborted || current !== seq.current) return;
      setEntries(listRes.items);
      setStats(statsRes);
      setCategories(catsRes);
    } catch (cause) {
      if (signal?.aborted || current !== seq.current) return;
      setError(libraryError(cause));
    } finally {
      if (!signal?.aborted && current === seq.current) setLoading(false);
    }
  }, [workspace, mistakes, selectedCategoryId, filter, search, sort]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]));

  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try {
      await work();
      setNotice('Saved');
      await load();
    } catch (cause) {
      setError(libraryError(cause));
    } finally {
      lock.current = false; setBusy(false);
    }
  };

  const filterOptions = [
    { value: 'all', label: t('All') },
    { value: 'marked', label: `${t('Marked')} (${stats.bookmarked})` },
    { value: 'untagged', label: `${t('Untagged')} (${stats.uncategorized})` },
    ...categories.map(cat => ({ value: `cat:${cat.id}`, label: `${cat.name} (${cat.entry_count})` })),
  ];

  return <MobilePage title={t(mistakes ? 'Mistakes' : 'Question bank')} fallback={mistakes ? '/space/questions' : '/library'} tab={26}>
    <MobileText muted>{mistakes ? t('Mistakes remain after review. Resolve one to pause its daily reviews.') : workspaceName || t('General workspace')}</MobileText>
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {!!notice && <InlineAlert tone="success">{t(notice)}</InlineAlert>}
    <MobileField label={t(mistakes ? 'Search mistakes' : 'Search')} value={search} onChangeText={setSearch} />
    {!mistakes && <MobileRow title={t('Mistakes')} description={`${stats.wrong}`} onPress={() => router.push('/space/questions/mistakes')} />}
    <MobileChoice label={t(mistakes ? 'Filters' : 'Filters & sorting')} value={filter} disabled={busy} options={filterOptions} onChange={setFilter} />
    <MobileChoice label={t('Newest first')} value={sort} disabled={busy} options={[{ value: 'recent', label: t('Newest first') }, { value: 'oldest', label: 'oldest' }]} onChange={setSort} />
    <MobileAction variant="secondary" disabled={busy || loading} onPress={() => void load()}>{t('Refresh')}</MobileAction>
    {loading && <LoadingState />}
    {!loading && !error && entries.length === 0 && (mistakes ? <>
      <MobileText style={{ fontSize: 22, fontWeight: '600' }}>{t('No mistakes yet')}</MobileText>
      <MobileText muted>{t('Wrong answers from practice will appear here.')}</MobileText>
    </> : <>
      <MobileText style={{ fontSize: 28, lineHeight: 39, fontWeight: '600' }}>{t('Turn questions\ninto understanding.')}</MobileText>
      <MobileText muted>{t('Questions from quizzes appear here. You can also import a question file.')}</MobileText>
    </>)}
    {entries.map(entry => {
      const open = expandedId === entry.id;
      const tagNames = entry.categories.map(c => c.name).join(' · ');
      const subtitle = [entry.is_correct ? t('Correct') : t('Mistakes'), entry.bookmarked ? t('Bookmarked') : '', entry.resolved ? t('Marked as known') : '', tagNames].filter(Boolean).join(' · ');
      return <View key={entry.id} style={{ gap: 10 }}>
        <MobileRow title={entry.question} description={subtitle} onPress={() => setExpandedId(open ? null : entry.id)} />
        {open && <View style={{ gap: 10, paddingLeft: 8 }}>
          {Object.entries(entry.options).map(([key, val]) => <MobileText key={key} muted>{`${key}. ${val}`}</MobileText>)}
          {!!entry.correct_answer && <MobileText>{`${t('Correct')}: ${entry.correct_answer}`}</MobileText>}
          {!!entry.explanation && <ChatMarkdown content={entry.explanation} />}
          <MobileAction onPress={() => router.push({ pathname: "/space/questions/practice", params: { entryId: String(entry.id) } })}>{t('Practice question')}</MobileAction>
          <MobileAction variant="secondary" disabled={busy} onPress={() => void run(() => updateQuestionEntry(workspace, entry.id, { bookmarked: !entry.bookmarked }))}>{t(entry.bookmarked ? 'Bookmarked' : 'Bookmark')}</MobileAction>
          {(!entry.is_correct || mistakes) && <MobileAction variant="secondary" disabled={busy} onPress={() => void run(() => updateQuestionEntry(workspace, entry.id, { resolved: !entry.resolved }))}>{t(entry.resolved ? 'Marked as known' : 'Resolve a mistake')}</MobileAction>}
          {categories.length > 0 && <MobileChoice label={t('Manage tags')} value={entry.categories[0] ? String(entry.categories[0].id) : ''} disabled={busy} options={[{ value: '', label: t('Untagged') }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]} onChange={val => {
            const targetId = val ? Number(val) : null;
            void run(async () => {
              for (const existing of entry.categories) if (existing.id !== targetId) await unlinkQuestionCategory(workspace, entry.id, existing.id);
              if (targetId !== null && !entry.categories.some(c => c.id === targetId)) await linkQuestionCategory(workspace, entry.id, targetId);
            });
          }} />}
          <MobileAction variant="secondary" disabled={busy} onPress={() => setDeleting(entry)}>{t('Delete')}</MobileAction>
        </View>}
      </View>;
    })}
    {mistakes ? (
      <MobileAction variant="secondary" onPress={() => router.push('/space/questions')}>{t('Open question bank')}</MobileAction>
    ) : <>
      <MobileAction onPress={() => router.push('/space/questions/import')}>{t('Import questions')}</MobileAction>
      <MobileRow title={t('Manage tags')} description={t('Create and organize question tags')} onPress={() => router.push('/space/questions/tags')} />
      <MobileRow title={t('Practice this view')} description={t('Available when questions are present')} onPress={() => router.push(selectedCategoryId !== undefined ? { pathname: "/space/questions/practice", params: { categoryId: String(selectedCategoryId) } } : '/space/questions/practice')} />
    </>}
    <ConfirmDialog open={!!deleting} title={t('Delete permanently')} confirmLabel={t('Delete')} busy={busy} onCancel={() => setDeleting(null)} onConfirm={() => {
      if (!deleting) return;
      const id = deleting.id;
      void run(async () => { await deleteQuestionEntry(workspace, id); setDeleting(null); });
    }}>{!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}</ConfirmDialog>
  </MobilePage>;
}

export function ManageTagsScreen() {
  const { workspace } = useScopeOwner();
  const t = useCopy();
  const [search, setSearch] = useState('');
  const [newTag, setNewTag] = useState('');
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [stats, setStats] = useState<QuestionBankStats>({ total: 0, wrong: 0, unresolved: 0, bookmarked: 0, uncategorized: 0 });
  const [editing, setEditing] = useState<QuestionCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [deleting, setDeleting] = useState<QuestionCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const [cats, st] = await Promise.all([listQuestionCategories(workspace, signal), getQuestionStats(workspace, signal)]);
      if (signal?.aborted) return;
      setCategories(cats);
      setStats(st);
    } catch (cause) {
      if (!signal?.aborted) setError(libraryError(cause));
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
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try {
      await work();
      setNotice('Saved');
      await load();
    } catch (cause) {
      setError(libraryError(cause));
    } finally {
      lock.current = false; setBusy(false);
    }
  };

  const visible = categories.filter(c => !search.trim() || c.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));

  return <MobilePage title={t('Manage tags')} fallback="/space/questions">
    <MobileText muted>{t('Question bank / Skill library')}</MobileText>
    {!!error && !editing && !deleting && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {!!notice && <InlineAlert tone="success">{t(notice)}</InlineAlert>}
    <MobileField label={t('Search tags')} value={search} onChangeText={setSearch} />
    <MobileRow title={t('All tags')} description={`${t('Show every item')} · ${stats.total}`} onPress={() => router.push('/space/questions')} />
    <MobileRow title={t('Untagged')} description={`${t('Items without a tag')} · ${stats.uncategorized}`} onPress={() => router.push({ pathname: "/space/questions", params: { filter: 'untagged' } })} />
    {loading && <LoadingState />}
    {visible.map(cat => <View key={cat.id} style={{ gap: 8 }}>
      <MobileRow title={cat.name} description={String(cat.entry_count)} onPress={() => router.push({ pathname: "/space/questions", params: { categoryId: String(cat.id) } })} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <MobileAction variant="secondary" disabled={busy} onPress={() => { setEditing(cat); setEditName(cat.name); setError(''); }}>{t('Edit')}</MobileAction>
        <MobileAction variant="secondary" disabled={busy} onPress={() => { setDeleting(cat); setError(''); }}>{t('Delete')}</MobileAction>
      </View>
    </View>)}
    <MobileField label={t('New tag')} value={newTag} onChangeText={setNewTag} editable={!busy} />
    <MobileAction disabled={busy || !newTag.trim()} loading={busy} onPress={() => void run(async () => {
      await createQuestionCategory(workspace, newTag.trim());
      setNewTag('');
    })}>{t('Add tag')}</MobileAction>
    <FullScreenModal open={!!editing} title={t('Tag actions')} onClose={() => { if (!busy) setEditing(null); }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 20 }}>
        {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
        <MobileField label={t('New tag')} value={editName} onChangeText={setEditName} editable={!busy} />
        <MobileAction disabled={busy || !editName.trim()} loading={busy} onPress={() => {
          if (!editing) return;
          const id = editing.id;
          void run(async () => { await renameQuestionCategory(workspace, id, editName.trim()); setEditing(null); });
        }}>{t('Save')}</MobileAction>
      </ScrollView>
    </FullScreenModal>
    <ConfirmDialog open={!!deleting} title={t('Delete permanently')} confirmLabel={t('Delete')} busy={busy} onCancel={() => setDeleting(null)} onConfirm={() => {
      if (!deleting) return;
      const id = deleting.id;
      void run(async () => { await deleteQuestionCategory(workspace, id); setDeleting(null); });
    }}>{!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}</ConfirmDialog>
  </MobilePage>;
}

export function ImportQuestionsScreen({ step }: { step: 35 | 36 | 115 }) {
  const { workspace, scopeKey } = useScopeOwner();
  const t = useCopy();
  const [target, setTarget] = useState<'bank' | 'mistakes'>('bank');
  const [, setRevision] = useState(0);
  const [templateCsv, setTemplateCsv] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);
  const preview = readStagedImportPreview(scopeKey);
  const committed = readImportCommitResult(scopeKey);

  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try { await work(); } catch (cause) { setError(libraryError(cause)); } finally { lock.current = false; setBusy(false); }
  };

  if (step === 36) {
    return <MobilePage title={t('Review import')} fallback="/space/questions/import">
      <MobileText muted>{preview?.filename || 'questions.csv'}</MobileText>
      {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
      {!preview ? <>
        <MobileText muted>{t('Choose file → Review preview → Save')}</MobileText>
        <MobileAction onPress={() => router.replace('/space/questions/import')}>{t('Choose question file')}</MobileAction>
      </> : <>
        <MobileText style={{ fontWeight: '600' }}>{`${preview.valid} / ${preview.total}`}</MobileText>
        {preview.samples.map((sample, index) => <MobileRow key={index} title={sample.question} description={`${sample.question_type} · ${sample.correct_answer}`} />)}
        {preview.errors.map((err, index) => <InlineAlert key={index} tone="warning">{`#${err.row}: ${err.message}`}</InlineAlert>)}
        {preview.token && <MobileAction disabled={busy} loading={busy} onPress={() => void run(async () => {
          const res = await commitQuestionImport(workspace, preview.token!, preview.filename);
          saveImportCommitResult(scopeKey, res);
          setRevision(v => v + 1);
          router.replace('/space/questions/import/result');
        })}>{t('Save')}</MobileAction>}
        <MobileAction variant="secondary" disabled={busy} onPress={() => router.replace('/space/questions/import')}>{t('Choose question file')}</MobileAction>
      </>}
    </MobilePage>;
  }

  if (step === 115) {
    return <MobilePage title={t('Questions imported')} fallback="/space/questions">
      <MobileText muted>{committed?.filename || 'questions.csv'}</MobileText>
      {committed ? <InlineAlert tone="success">{`${committed.created} (${committed.duplicates})`}</InlineAlert> : <MobileText muted>{t('Changes saved')}</MobileText>}
      <MobileAction onPress={() => router.replace('/space/questions')}>{t('Open question bank')}</MobileAction>
      <MobileAction variant="secondary" onPress={() => router.replace('/space/questions/practice')}>{t('Practice imported questions')}</MobileAction>
    </MobilePage>;
  }

  return <MobilePage title={t('Import questions')} fallback="/space/questions">
    <MobileText muted>XLSX · CSV · TSV · JSON</MobileText>
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {!!notice && <InlineAlert tone="success">{t(notice)}</InlineAlert>}
    <MobileText style={{ fontWeight: '600' }}>{t('Prepare your file')}</MobileText>
    <MobileText muted>{t('Up to 500 questions and 5 MB. Question and answer are required. XLSX uses the active sheet; English and Chinese column names are supported.')}</MobileText>
    <MobileChoice label={t('Import into')} value={target} disabled={busy} options={[{ value: 'bank', label: t('Question bank') }, { value: 'mistakes', label: t('Mistakes') }]} onChange={setTarget} />
    <MobileAction disabled={busy} loading={busy} onPress={() => void run(async () => {
      const staged = await pickAndPreviewQuestionImport(workspace, target);
      if (!staged) return;
      stageImportPreview(scopeKey, staged);
      setRevision(v => v + 1);
      router.push('/space/questions/import/review');
    })}>{t('Choose question file')}</MobileAction>
    <MobileRow title={t('Download template')} description="CSV" onPress={() => void run(async () => {
      const csv = await fetchQuestionTemplate(workspace);
      setTemplateCsv(csv);
      await Clipboard.setStringAsync(csv).catch(() => {});
      setNotice('Copied');
    })} />
    {!!templateCsv && <MobileText selectable muted>{templateCsv}</MobileText>}
    <MobileText muted>{t('Choose file → Review preview → Save')}</MobileText>
  </MobilePage>;
}

export function PracticeQuestionScreen({ review = false }: { review?: boolean }) {
  const { entryId, categoryId } = useLocalSearchParams<{ entryId?: string; categoryId?: string }>();
  const { workspace, scopeKey } = useScopeOwner();
  const t = useCopy();
  const [queue, setQueue] = useState<PracticeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(!review);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);
  const outcome = readPracticeReviewOutcome(scopeKey);

  useFocusEffect(useCallback(() => {
    if (review) return;
    const controller = new AbortController();
    const signal = controller.signal;
    setLoading(true);
    setError('');
    const task = entryId
      ? getPracticeQuestionById(workspace, Number(entryId), signal).then(item => [item])
      : getPracticeQueue(workspace, categoryId ? Number(categoryId) : undefined, signal);
    void task
      .then(items => {
        if (signal.aborted) return;
        setQueue(items);
        setIndex(0);
        setAnswer('');
      })
      .catch(cause => {
        if (!signal.aborted) setError(libraryError(cause));
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [review, workspace, entryId, categoryId]));

  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try { await work(); } catch (cause) { setError(libraryError(cause)); } finally { lock.current = false; setBusy(false); }
  };

  if (review) {
    const active = outcome?.item;
    return <MobilePage title={t('Answer review')} fallback="/space/questions/practice">
      {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
      {!!notice && <InlineAlert tone="success">{t(notice)}</InlineAlert>}
      {!active ? (
        <MobileAction onPress={() => router.replace('/space/questions/practice')}>{t('Practice question')}</MobileAction>
      ) : <>
        <InlineAlert tone={outcome.correct === true ? 'success' : outcome.correct === false ? 'danger' : 'warning'}>
          {t(outcome.correct === true ? 'Correct' : outcome.correct === false ? 'Try again, or rate your recall below.' : 'Self assessment required. Rate your recall below.')}
        </InlineAlert>
        <MobileText style={{ fontWeight: '600' }}>{active.entry.question}</MobileText>
        {!!active.entry.correct_answer && <MobileText>{`${t('Correct')}: ${active.entry.correct_answer}`}</MobileText>}
        {!!active.entry.explanation && <ChatMarkdown content={active.entry.explanation} />}
        <MobileText muted>{t('Choose a recall target')}</MobileText>
        {(['again', 'hard', 'good', 'easy'] as const).map(rating => (
          <MobileAction key={rating} variant="secondary" disabled={busy || outcome.reviewed} onPress={() => void run(async () => {
            await submitPracticeReview(active.content_workspace_id ?? workspace, active.entry.id, {
              request_id: commandId(),
              version: active.state.version,
              rating,
              answer: outcome.answer,
              self_report: outcome.correct === null,
            });
            const updated = { ...outcome, reviewed: true };
            savePracticeReviewOutcome(scopeKey, updated);
            setRevision(revision + 1);
            setNotice('Saved');
          })}>{rating}</MobileAction>
        ))}
        <MobileRow title={t('Save or tag question')} description={t('Mark for later · add tags')} onPress={() => void run(async () => {
          const next = !active.entry.bookmarked;
          await updateQuestionEntry(workspace, active.entry.id, { bookmarked: next });
          const updated = { ...outcome, item: { ...active, entry: { ...active.entry, bookmarked: next } } };
          savePracticeReviewOutcome(scopeKey, updated);
          setRevision(revision + 1);
          setNotice('Saved');
        })} />
        <MobileRow title={t('Resolve a mistake')} description={t('Pauses daily review for that mistake')} onPress={() => void run(async () => {
          await updateQuestionEntry(workspace, active.entry.id, { resolved: true });
          setNotice('Marked as known');
        })} />
        <MobileAction onPress={() => router.replace('/space/questions/practice')}>{t('Next question')}</MobileAction>
        <MobileAction variant="secondary" onPress={() => router.push('/chat')}>{t('Ask tutor about this answer')}</MobileAction>
      </>}
    </MobilePage>;
  }

  const current = queue[index];
  const optionEntries = Object.entries(current?.entry.options ?? {});

  return <MobilePage title={t('Practice question')} fallback="/space/questions">
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {loading && <LoadingState />}
    {!loading && !error && !current && <>
      <MobileText style={{ fontSize: 22, fontWeight: '600' }}>{t('Nothing due today')}</MobileText>
      <MobileAction variant="secondary" onPress={() => router.replace('/space/questions')}>{t('Open question bank')}</MobileAction>
    </>}
    {current && <>
      <MobileText muted>{`${index + 1} / ${queue.length}`}</MobileText>
      <MobileText style={{ fontSize: 20, lineHeight: 28, fontWeight: '600' }}>{current.entry.question}</MobileText>
      {optionEntries.map(([key, value]) => (
        <MobileRow key={key} accessibilityRole="radio" title={`${key} · ${value}`} selected={answer === key} onPress={() => setAnswer(key)} />
      ))}
      <MobileField label={t('Your answer')} value={answer} onChangeText={setAnswer} multiline />
      <MobileAction disabled={busy} loading={busy} onPress={() => {
        if (!answer.trim()) { setError('Choose an answer first.'); return; }
        void run(async () => {
          const correct = await checkPracticeAnswer(current.content_workspace_id ?? workspace, current.entry.id, answer.trim());
          savePracticeReviewOutcome(scopeKey, { item: current, answer: answer.trim(), correct });
          router.push('/space/questions/practice/review');
        });
      }}>{t('Check answer')}</MobileAction>
      {queue.length > 1 && <MobileAction variant="secondary" disabled={busy} onPress={() => { setIndex((index + 1) % queue.length); setAnswer(''); setError(''); }}>{t('Skip question')}</MobileAction>}
    </>}
  </MobilePage>;
}

export function LearningJournalScreen() {
  const { workspace, workspaceName } = useScopeOwner();
  const t = useCopy();
  const [journal, setJournal] = useState<LearningJournal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const data = await getLearningJournal(workspace, signal);
      if (!signal?.aborted) setJournal(data);
    } catch (cause) {
      if (!signal?.aborted) setError(libraryError(cause));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [workspace]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]));

  return <MobilePage title={t('Learning journal')} fallback="/library" tab={26}>
    <MobileText muted>{workspaceName || t('General workspace')}</MobileText>
    {loading && <LoadingState />}
    {!!error && <ErrorState message={t(error)} onRetry={() => void load()} />}
    {journal && <>
      <View style={{ gap: 8 }}>
        <MobileText style={{ fontSize: 18, fontWeight: '600' }}>{t('Current mission')}</MobileText>
        {journal.mission.topic ? <>
          <MobileText style={{ fontWeight: '600' }}>{journal.mission.topic}</MobileText>
          {!!journal.mission.why && <MobileText>{journal.mission.why}</MobileText>}
          {!!journal.mission.level && <MobileText muted>{journal.mission.level}</MobileText>}
        </> : <MobileText muted>{t('No mission yet. Ask your tutor to set one.')}</MobileText>}
      </View>
      <View style={{ gap: 8 }}>
        <MobileText style={{ fontSize: 18, fontWeight: '600' }}>{t('Last-session handoff')}</MobileText>
        {journal.last_session.summary || journal.last_session.next_focus ? <>
          {!!journal.last_session.summary && <MobileText>{journal.last_session.summary}</MobileText>}
          {!!journal.last_session.next_focus && <MobileText muted>{journal.last_session.next_focus}</MobileText>}
        </> : <MobileText muted>{t('No handoff recorded yet.')}</MobileText>}
      </View>
      <View style={{ gap: 12 }}>
        <MobileText style={{ fontSize: 18, fontWeight: '600' }}>{t('Confirmed learning records')}</MobileText>
        {journal.records.length ? journal.records.map(rec => (
          <View key={rec.id} style={{ gap: 4 }}>
            <MobileText style={{ fontWeight: '600' }}>{rec.title}</MobileText>
            <MobileText muted>{rec.insight}</MobileText>
          </View>
        )) : <MobileText muted>{t('No confirmed records yet.')}</MobileText>}
      </View>
    </>}
    <MobileAction onPress={() => router.push('/chat')}>{t('Discuss my learning mission')}</MobileAction>
    <MobileAction variant="secondary" disabled={loading} onPress={() => void load()}>{t('Refresh journal')}</MobileAction>
  </MobilePage>;
}
