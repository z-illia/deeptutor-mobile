import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useCopy } from '@/features/entry/copy';
import { useFavorites } from './FavoritesProvider';
import { favoritesError } from './api';
import { DEFAULT_NOTEBOOK_COLOR, FAVORITE_KIND_LABELS, SWATCHES, favoriteKind, filterNotebooks, filterNotebookRecords, type NotebookRecordItem, type NotebookSummary } from './model';
import { MobileChoice as Choice, MobileAction, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { favoritesHref } from '@/features/mobile/routes';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { ErrorState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { ChatMarkdown } from '@/features/chat/ChatMarkdown';

export function MobileFavoritesScreen({ create = false }: { create?: boolean }) {
  const params = useLocalSearchParams<{ notebookId?: string; recordId?: string }>();
  const notebookId = params.notebookId;
  const library = useFavorites(); const t = useCopy(); const { refresh, resolveRecord } = library;
  const [query, setQuery] = useState(''); const [kind, setKind] = useState('all');
  const [expanded, setExpanded] = useState<string[]>(params.recordId ? [params.recordId] : []);
  const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [meta, setMeta] = useState<NotebookSummary | 'new' | null>(create ? 'new' : null);
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [color, setColor] = useState(DEFAULT_NOTEBOOK_COLOR);
  const [record, setRecord] = useState<NotebookRecordItem | null>(null); const [title, setTitle] = useState(''); const [summary, setSummary] = useState('');
  const [discard, setDiscard] = useState(false);
  const [relocate, setRelocate] = useState<{ mode: 'move' | 'copy'; record: NotebookRecordItem } | null>(null); const [target, setTarget] = useState('');
  const [deleting, setDeleting] = useState<'notebook' | NotebookRecordItem | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const lock = useRef(false);
  useFocusEffect(useCallback(() => { void refresh(notebookId); }, [notebookId, refresh]));
  useEffect(() => {
    if (!notebookId || !params.recordId) return;
    const controller = new AbortController();
    void resolveRecord(params.recordId, notebookId, controller.signal).then(id => {
      if (!controller.signal.aborted && id !== notebookId) router.replace(favoritesHref(id, params.recordId));
    }).catch(cause => { if (!controller.signal.aborted) setError(favoritesError(cause)); });
    return () => controller.abort();
  }, [notebookId, params.recordId, resolveRecord]);
  const perform = async (action: () => Promise<unknown>, success?: () => void) => {
    if (lock.current) return;
    lock.current = true; setError(''); setNotice('');
    try { await action(); success?.(); setNotice('Saved'); } catch (cause) { setError(favoritesError(cause)); } finally { lock.current = false; }
  };
  const busy = library.busy; const disabled = busy || library.libraryState === 'loading';
  const notebook = library.notebooks.find(item => item.id === notebookId);
  const records = notebookId ? library.recordsByNotebook[notebookId] : undefined;
  const openMeta = (item: NotebookSummary | 'new') => { setMeta(item); setName(item === 'new' ? '' : item.name); setDescription(item === 'new' ? '' : item.description ?? ''); setColor(item === 'new' ? DEFAULT_NOTEBOOK_COLOR : item.color); setError(''); };
  const editRecord = (item: NotebookRecordItem) => { setRecord(item); setTitle(item.title); setSummary(item.summary ?? ''); setError(''); };
  const closeRecord = () => { if (busy) return; if (record && (title !== record.title || summary !== (record.summary ?? ''))) setDiscard(true); else setRecord(null); };
  const modal = (open: boolean, label: string, close: () => void, children: ReactNode) => <FullScreenModal open={open} title={t(label)} onClose={() => { if (!busy) close(); }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 24 }}>{!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}{children}</ScrollView></FullScreenModal>;
  const otherNotebooks = library.notebooks.filter(item => item.id !== notebookId && !item.unreadable);
  const startRelocate = (mode: 'move' | 'copy', item: NotebookRecordItem) => { setRelocate({ mode, record: item }); setTarget(otherNotebooks[0]?.id ?? ''); setError(''); };
  return <MobilePage title={notebook?.name ?? t('Favorites')} fallback="/library" tab={notebookId ? undefined : 26}>
    <MobileText muted>{notebook?.description || t('Keep original conversations and sources, ready to use in your notes.')}</MobileText>
    {!!error && !meta && !record && !relocate && !deleting && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {!!notice && <InlineAlert tone="success">{t(notice)}</InlineAlert>}
    {library.libraryState === 'loading' && <LoadingState />}
    {library.libraryState === 'error' && <ErrorState message={t(library.error)} onRetry={() => void refresh(notebookId)} />}
    <MobileAction accessibilityLabel={t('Retry loading Favorites')} variant="secondary" disabled={disabled} onPress={() => void refresh(notebookId)}>{t('Refresh')}</MobileAction>
    {notebookId ? <>
      <MobileRow title={t('All Favorites')} onPress={() => router.replace(favoritesHref())} />
      {notebook && <>
        <MobileAction accessibilityLabel={t('Edit collection metadata')} variant="secondary" disabled={disabled} onPress={() => openMeta(notebook)}>{t('Edit collection metadata')}</MobileAction>
        <MobileAction variant="secondary" disabled={disabled || notebook.unreadable} onPress={() => void perform(async () => setMarkdown(await library.exportNotebook(notebookId)))}>{t('Export Markdown')}</MobileAction>
        <MobileAction variant="secondary" accessibilityLabel={t('Delete collection')} disabled={disabled} onPress={() => setDeleting('notebook')}>{t('Delete collection')}</MobileAction>
      </>}
      {records && <>
        <MobileField label={t('Search collection records')} value={query} onChangeText={setQuery} />
        <Choice label={t('Type')} value={kind} disabled={busy} onChange={setKind} options={[{ value: 'all', label: t('All') }, ...Object.entries(FAVORITE_KIND_LABELS).map(([value, label]) => ({ value, label: t(label) }))]} />
        {filterNotebookRecords(records, query, kind).map(item => <View key={item.id} style={{ gap: 12 }}>
          <MobileRow accessibilityLabel={t('Toggle favorite record {value1}', { value1: item.title })} title={item.title} description={item.summary || t(FAVORITE_KIND_LABELS[favoriteKind(item.type, item.metadata)])} onPress={() => setExpanded(previous => previous.includes(item.id) ? previous.filter(id => id !== item.id) : [...previous, item.id])} />
          {expanded.includes(item.id) && <>
            {!!item.user_query && <MobileText selectable>{item.user_query}</MobileText>}
            <ChatMarkdown content={item.output} />
            {typeof item.metadata?.session_id === 'string' && <MobileAction variant="secondary" onPress={() => router.push(`/chat/${encodeURIComponent(String(item.metadata?.session_id))}`)}>{t('Open original session')}</MobileAction>}
            <MobileAction accessibilityLabel={t('Use {value1} in Chat', { value1: item.title })} variant="secondary" onPress={() => router.push({ pathname: '/chat', params: { favoriteNotebookId: notebookId, attachFavoriteId: item.id } })}>{t('Use in Chat')}</MobileAction>
            <MobileAction accessibilityLabel={t('Edit details for {value1}', { value1: item.title })} variant="secondary" disabled={disabled} onPress={() => editRecord(item)}>{t('Edit details')}</MobileAction>
            <MobileAction accessibilityLabel={t('Move {value1}', { value1: item.title })} variant="secondary" disabled={disabled || !otherNotebooks.length} onPress={() => startRelocate('move', item)}>{t('Move')}</MobileAction>
            <MobileAction accessibilityLabel={t('Copy {value1}', { value1: item.title })} variant="secondary" disabled={disabled || !otherNotebooks.length} onPress={() => startRelocate('copy', item)}>{t('Copy')}</MobileAction>
            <MobileAction accessibilityLabel={t('Delete {value1}', { value1: item.title })} variant="secondary" disabled={disabled} onPress={() => setDeleting(item)}>{t('Delete')}</MobileAction>
          </>}
        </View>)}
        {filterNotebookRecords(records, query, kind).length === 0 && <MobileText muted>{t('No matching records')}</MobileText>}
      </>}
      {!notebook && library.libraryState !== 'loading' && <MobileText muted>{t('Unavailable')}</MobileText>}
    </> : <>
      <MobileField label={t('Search collections')} value={query} onChangeText={setQuery} />
      {!library.notebooks.length && library.libraryState === 'empty' && <><MobileText style={{ fontSize: 28, lineHeight: 39, fontWeight: '600' }}>{t('Keep the sources\nyou want to return to.')}</MobileText><MobileText muted>{t('Save a conversation, research report or question from its actions menu, then file it in a collection.')}</MobileText></>}
      {filterNotebooks(library.notebooks, {}, query).map(item => <View key={item.id} style={{ gap: 8 }}>
        <MobileRow title={item.name} description={item.description || String(item.record_count)} accessibilityLabel={t('Open collection {value1}', { value1: item.name })} onPress={() => router.push(favoritesHref(item.id))} />
        <MobileAction variant="ghost" accessibilityLabel={t('Edit collection {value1}', { value1: item.name })} disabled={disabled} onPress={() => openMeta(item)}>{t('Edit')}</MobileAction>
      </View>)}
      <MobileAction accessibilityLabel={t(library.notebooks.length ? 'New notebook' : 'Create first collection')} disabled={disabled} onPress={() => router.push('/favorites/new')}>{t('New collection')}</MobileAction>
    </>}
    {modal(!!meta, meta === 'new' ? 'New collection' : 'Edit collection metadata', () => { setMeta(null); if (create) router.replace(favoritesHref()); }, <>
      <MobileField label={t('Collection Name')} value={name} onChangeText={setName} editable={!busy} />
      <MobileField label={t('Description')} value={description} onChangeText={setDescription} editable={!busy} multiline />
      <Choice label={t('Color')} value={color} disabled={busy} onChange={setColor} options={SWATCHES.map(value => ({ value, label: value }))} />
      <MobileAction accessibilityLabel={t('Save collection metadata')} disabled={disabled} loading={busy} onPress={() => {
        if (!name.trim()) { setError('Collection name is required.'); return; }
        void perform(() => meta && meta !== 'new' ? library.updateNotebook(meta.id, { name: name.trim(), description, color }) : library.createNotebook({ name: name.trim(), description, color }), () => { setMeta(null); if (create) router.replace(favoritesHref()); });
      }}>{t('Save')}</MobileAction>
    </>)}
    {modal(!!record, 'Edit details', closeRecord, <>
      <MobileField label={t('Favorite Title')} value={title} onChangeText={setTitle} editable={!busy} />
      <MobileField label={t('Summary / Annotation')} value={summary} onChangeText={setSummary} editable={!busy} multiline />
      <MobileAction accessibilityLabel={t('Save favorite details')} disabled={disabled} loading={busy} onPress={() => {
        if (!title.trim()) { setError('Title cannot be empty.'); return; }
        if (record && notebookId) void perform(() => library.updateRecord(notebookId, record.id, { title: title.trim(), summary }), () => setRecord(null));
      }}>{t('Save')}</MobileAction>
      <ConfirmDialog open={discard} title={t('Discard changes?')} confirmLabel={t('Discard')} onCancel={() => setDiscard(false)} onConfirm={() => { setDiscard(false); setRecord(null); }} />
    </>)}
    {modal(!!relocate, relocate?.mode === 'move' ? 'Move' : 'Copy', () => setRelocate(null), <>
      {otherNotebooks.map(item => <MobileRow key={item.id} title={item.name} accessibilityRole="radio" accessibilityLabel={t('Select target collection {value1}', { value1: item.name })} selected={target === item.id} disabled={busy} onPress={() => setTarget(item.id)} />)}
      <MobileAction accessibilityLabel={t('Confirm relocate favorite')} disabled={disabled || !target} loading={busy} onPress={() => { if (relocate && notebookId) void perform(() => library.relocateRecord(relocate.mode, notebookId, relocate.record.id, target), () => setRelocate(null)); }}>{t('Confirm')}</MobileAction>
    </>)}
    <ConfirmDialog open={!!deleting} title={t(deleting === 'notebook' ? 'Delete collection' : 'Delete permanently')} confirmLabel={t('Delete')} busy={busy} onCancel={() => setDeleting(null)} onConfirm={() => {
      if (!notebookId || !deleting) return;
      void perform(() => deleting === 'notebook' ? library.deleteNotebook(notebookId) : library.deleteRecord(notebookId, deleting.id), () => { setDeleting(null); if (deleting === 'notebook') router.replace(favoritesHref()); });
    }}>{!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}</ConfirmDialog>
    {modal(markdown !== null, 'Export Markdown', () => setMarkdown(null), <><MobileText selectable>{markdown}</MobileText><MobileAction onPress={() => { void Clipboard.setStringAsync(markdown ?? ''); }}>{t('Copy')}</MobileAction></>)}
  </MobilePage>;
}
