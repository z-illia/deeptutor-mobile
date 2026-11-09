import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCopy } from '@/features/entry/copy';
import { MobileAction, MobileField, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { favoritesHref } from '@/features/mobile/routes';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { favoritesError } from './api';
import { type SaveModalRequest, useFavorites } from './FavoritesProvider';
import { buildTranscriptFromMessages, buildUserQueryFromMessages, DEFAULT_NOTEBOOK_COLOR, deriveSaveTitle, FAVORITE_KIND_LABELS, favoriteKind, indexesForLastTurns, type NotebookSavePayload } from './model';
export function MobileSaveFavorite() {
  const { activeSaveModal, closeSaveModal } = useFavorites();
  if (!activeSaveModal) return null;
  return (
    <MobileSaveFavoriteContent
      key={`${activeSaveModal.payload.title}-${activeSaveModal.messages?.length ?? 0}`}
      request={activeSaveModal}
      onClose={closeSaveModal}
    />
  );
}

function MobileSaveFavoriteContent({
  request,
  onClose,
}: {
  request: SaveModalRequest;
  onClose: () => void;
}) {
  const t = useCopy();
  const router = useRouter();
  const { notebooks, createNotebook, saveRecordToNotebooks, refresh, libraryState, error, busy } = useFavorites();
  const lock = useRef(false);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const snapshot = useRef<NotebookSavePayload | null>(null);
  useEffect(() => { void refresh(); }, [refresh]);

  const readableNotebooks = useMemo(
    () => notebooks.filter((nb) => !nb.unreadable),
    [notebooks],
  );

  const { payload, messages } = request;

  const [customTitle, setCustomTitle] = useState(
    payload.title || 'Saved session',
  );
  const [titleEdited, setTitleEdited] = useState(false);
  const [summary, setSummary] = useState(payload.summary ?? '');
  const [selectedNotebookIds, setSelectedNotebookIds] = useState<string[]>(() =>
    readableNotebooks[0]?.id ? [readableNotebooks[0].id] : [],
  );
  const [selectedMsgIndexes, setSelectedMsgIndexes] = useState<number[]>(() =>
    messages && messages.length > 0 ? messages.map((_, idx) => idx) : [],
  );
  const [creatingInline, setCreatingInline] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedDestinationId, setSavedDestinationId] = useState<string | null>(
    null,
  );

  const selectedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    const sorted = [...selectedMsgIndexes].sort((a, b) => a - b);
    return sorted.map((idx) => messages[idx]).filter(Boolean);
  }, [messages, selectedMsgIndexes]);

  const title = useMemo(() => {
    if (titleEdited || !messages || messages.length === 0) {
      return customTitle;
    }
    return deriveSaveTitle(selectedMessages, payload.title || 'Saved session');
  }, [customTitle, messages, payload.title, selectedMessages, titleEdited]);

  const kindLabel =
    FAVORITE_KIND_LABELS[favoriteKind(payload.recordType, payload.metadata)];

  const toggleNotebookSelection = (id: string) => {
    setErrorMessage(null);
    if (confirmedIds.includes(id)) return;
    setSelectedNotebookIds((prev) => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleMessageIndex = (idx: number) => {
    if (confirmedIds.length) return;
    setErrorMessage(null);
    setSelectedMsgIndexes((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx],
    );
  };

  const handleSelectMessagesPreset = (preset: 'all' | 'last1' | 'last3') => {
    if (confirmedIds.length) return;
    if (!messages) return;
    setErrorMessage(null);
    if (preset === 'all') {
      setSelectedMsgIndexes(messages.map((_, idx) => idx));
    } else if (preset === 'last1') {
      setSelectedMsgIndexes(indexesForLastTurns(messages, 1));
    } else {
      setSelectedMsgIndexes(indexesForLastTurns(messages, 3));
    }
  };

  const handleCreateInlineNotebook = async () => {
    if (lock.current) return;
    const trimmed = newCollectionName.trim();
    if (!trimmed) {
      setErrorMessage('Enter a collection name.');
      return;
    }
    lock.current = true;
    try {
    const created = await createNotebook({
      name: trimmed,
      color: DEFAULT_NOTEBOOK_COLOR,
    });
    setSelectedNotebookIds((prev) =>
      prev.includes(created.id) ? prev : [created.id, ...prev],
    );
    setNewCollectionName('');
    setCreatingInline(false);
    setErrorMessage(null);
    } catch (cause) { setErrorMessage(favoritesError(cause)); }
    finally { lock.current = false; }
  };

  const handleSave = async () => {
    if (lock.current || busy || libraryState === 'loading' || libraryState === 'error') return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Title cannot be empty.');
      return;
    }
    if (messages && messages.length > 0 && selectedMessages.length === 0) {
      setErrorMessage('Select at least one message to save.');
      return;
    }
    if (selectedNotebookIds.length === 0) {
      setErrorMessage('Select at least one collection.');
      return;
    }

    const finalOutput =
      messages && messages.length > 0
        ? buildTranscriptFromMessages(selectedMessages)
        : payload.output;
    const finalQuery =
      messages && messages.length > 0
        ? buildUserQueryFromMessages(selectedMessages) || payload.userQuery
        : payload.userQuery;

    lock.current = true; setErrorMessage(null);
    try {
    const savePayload = snapshot.current ?? {
      ...payload,
      title: trimmedTitle,
      summary: summary.trim() || payload.summary,
      userQuery: finalQuery,
      output: finalOutput,
      metadata: {
        ...(payload.metadata ?? {}),
        saved_message_count:
          messages && messages.length > 0 ? selectedMessages.length : undefined,
      },
    };
    const result = await saveRecordToNotebooks(selectedNotebookIds.filter(id => !confirmedIds.includes(id)), savePayload);
    if (result.savedNotebookIds.length) snapshot.current = savePayload;
    const allConfirmed = [...new Set([...confirmedIds, ...result.savedNotebookIds])];
    setConfirmedIds(allConfirmed);
    if (result.failedNotebookIds.length) {
      setSelectedNotebookIds(result.failedNotebookIds);
      setErrorMessage('Some collections were not saved. Retry the remaining selections.');
      return;
    }
    if (!allConfirmed.length) { setErrorMessage('Select at least one collection.'); return; }
    setSavedDestinationId(allConfirmed[0]);
    } catch (cause) { setErrorMessage(favoritesError(cause)); }
    finally { lock.current = false; }
  };

  const frozen = busy || confirmedIds.length > 0;
  return <FullScreenModal open title={t('Save to Favorites')} onClose={() => { if (!busy) onClose(); }}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 24 }}>
      <MobileText muted>{t(kindLabel)}</MobileText>
      {libraryState === 'loading' && <LoadingState />}
      {!!error && <><InlineAlert tone="danger">{t(error)}</InlineAlert><MobileAction onPress={() => void refresh()}>{t('Retry')}</MobileAction></>}
      {!!errorMessage && <InlineAlert tone="danger">{t(errorMessage)}</InlineAlert>}
      {savedDestinationId ? <>
        <MobileText>{t('Saved')}</MobileText>
        <MobileAction accessibilityLabel={t('Done saving favorite')} onPress={onClose}>{t('Done')}</MobileAction>
        <MobileAction variant="secondary" onPress={() => { onClose(); router.push(favoritesHref(savedDestinationId)); }}>{t('Open collection')}</MobileAction>
      </> : <>
        <MobileField label={t('Snapshot Title')} value={title} editable={!frozen} onChangeText={value => { setCustomTitle(value); setTitleEdited(true); }} />
        <MobileField label={t('Snapshot Summary')} value={summary} editable={!frozen} onChangeText={setSummary} multiline />
        {!!messages?.length && <>
          <MobileAction variant="secondary" disabled={frozen} accessibilityLabel={t('Select all messages')} onPress={() => handleSelectMessagesPreset('all')}>{t('All')}</MobileAction>
          <MobileAction variant="secondary" disabled={frozen} accessibilityLabel={t('Select last turn')} onPress={() => handleSelectMessagesPreset('last1')}>{t('Last turn')}</MobileAction>
          <MobileAction variant="secondary" disabled={frozen} accessibilityLabel={t('Select last 3 turns')} onPress={() => handleSelectMessagesPreset('last3')}>{t('Last 3 turns')}</MobileAction>
          {messages.map((message, index) => <MobileRow key={index} title={t(message.role === 'user' ? 'User' : message.role === 'assistant' ? 'Assistant' : 'System')} description={message.content} accessibilityRole="checkbox" accessibilityState={{ checked: selectedMsgIndexes.includes(index) }} selected={selectedMsgIndexes.includes(index)} disabled={frozen} onPress={() => toggleMessageIndex(index)} />)}
        </>}
        {readableNotebooks.map(notebook => <MobileRow key={notebook.id} title={notebook.name} accessibilityRole="checkbox" accessibilityLabel={t('Select collection {value1}', { value1: notebook.name })} accessibilityState={{ checked: selectedNotebookIds.includes(notebook.id) || confirmedIds.includes(notebook.id) }} selected={selectedNotebookIds.includes(notebook.id) || confirmedIds.includes(notebook.id)} disabled={busy || confirmedIds.includes(notebook.id)} onPress={() => toggleNotebookSelection(notebook.id)} />)}
        <MobileAction accessibilityLabel={t('Create new collection inline')} variant="secondary" disabled={busy} onPress={() => setCreatingInline(!creatingInline)}>{t('New collection')}</MobileAction>
        {creatingInline && <><MobileField label={t('New collection name')} value={newCollectionName} onChangeText={setNewCollectionName} editable={!busy} /><MobileAction accessibilityLabel={t('Confirm create collection')} disabled={busy} onPress={() => void handleCreateInlineNotebook()}>{t('Create collection')}</MobileAction></>}
        <MobileText muted>{t('Saved Original')}</MobileText>
        <MobileAction accessibilityLabel={t('Confirm Save to Favorites')} disabled={busy || libraryState === 'loading' || libraryState === 'error'} loading={busy} onPress={() => void handleSave()}>{t('Save favorite')}</MobileAction>
      </>}
    </ScrollView>
  </FullScreenModal>;
}
