import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookMarked,
  Check,
  FolderPlus,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react-native';
import { favoritesError } from './api';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { Button } from '@/shared/ui/Controls';
import { useTheme } from '../../theme';
import { useI18n } from '../../i18n';
import {
  type SaveModalRequest,
  useFavorites,
} from './FavoritesProvider';
import {
  buildTranscriptFromMessages,
  buildUserQueryFromMessages,
  DEFAULT_NOTEBOOK_COLOR,
  deriveSaveTitle,
  FAVORITE_KIND_LABELS,
  favoriteKind,
  indexesForLastTurns,
  type NotebookSavePayload,
} from './model';

export function SaveToNotebookModal() {
  const { activeSaveModal, closeSaveModal } = useFavorites();
  if (!activeSaveModal) return null;
  return (
    <SaveToNotebookModalContent
      key={`${activeSaveModal.payload.title}-${activeSaveModal.messages?.length ?? 0}`}
      request={activeSaveModal}
      onClose={closeSaveModal}
    />
  );
}

function SaveToNotebookModalContent({
  request,
  onClose,
}: {
  request: SaveModalRequest;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
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

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => { if (!busy) onClose(); }}
    >
      <View style={styles.backdrop}>
        <Pressable
                  disabled={busy}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={t('Close modal backdrop')}
        />
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[styles.header, { borderBottomColor: colors.border }]}
          >
            <View style={styles.headerTitleRow}>
              <BookMarked size={18} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                {t('Save to Favorites')}
              </Text>
              <View
                style={[
                  styles.kindBadge,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text
                  style={[styles.kindBadgeText, { color: colors.foreground }]}
                >
                  {kindLabel}
                </Text>
              </View>
            </View>
            <Pressable
                  disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={t('Close Save to Favorites')}
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {savedDestinationId ? (
            <View style={styles.savedConfirmation}>
              <View
                style={[
                  styles.savedIconCircle,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Check size={22} color={colors.primary} />
              </View>
              <Text style={[styles.savedTitle, { color: colors.foreground }]}>
                {t('Saved to Favorites')}
              </Text>
              <Text
                style={[
                  styles.savedSubtitle,
                  { color: colors.mutedForeground },
                ]}
              >
                {t("Immutable snapshot stored in {value1} collection{value2}.", { value1: String(confirmedIds.length), value2: String(confirmedIds.length === 1 ? '' : 's') })}
              </Text>
              <View style={styles.savedActionsRow}>
                <Pressable
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={t('Open Favorites Collection')}
                  onPress={() => {
                    const dest = savedDestinationId;
                    onClose();
                    router.push(`/notebooks/${dest}` as never);
                  }}
                  style={[
                    styles.secondaryBtn,
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryBtnText,
                      { color: colors.foreground },
                    ]}
                  >
                    {t('Open Favorites Collection')}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={t('Done saving favorite')}
                  onPress={onClose}
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryBtnText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    {t('Done')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>
                    {t('Snapshot Title')}
                  </Text>
                  <TextInput
                    editable={!busy && confirmedIds.length === 0}
                    value={title}
                    onChangeText={(val) => {
                      setCustomTitle(val);
                      setTitleEdited(true);
                      setErrorMessage(null);
                    }}
                    placeholder={t('Enter title for saved original')}
                    placeholderTextColor={colors.mutedForeground}
                    accessibilityLabel={t('Snapshot Title')}
                    style={[
                      styles.input,
                      {
                        color: colors.foreground,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>
                    {t('Note / Summary (Optional)')}
                  </Text>
                  <TextInput
                    editable={!busy && confirmedIds.length === 0}
                    value={summary}
                    onChangeText={setSummary}
                    placeholder={t('Add context note for this snapshot...')}
                    placeholderTextColor={colors.mutedForeground}
                    accessibilityLabel={t('Snapshot Summary')}
                    style={[
                      styles.input,
                      {
                        color: colors.foreground,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  />
                </View>

                {messages && messages.length > 0 ? (
                  <View style={styles.fieldGroup}>
                    <View style={styles.sectionHeaderRow}>
                      <Text
                        style={[styles.label, { color: colors.foreground }]}
                      >
                        {t("Messages ({value1}/{value2})", { value1: String(selectedMessages.length), value2: String(messages.length) })}
                      </Text>
                      <View style={styles.presetRow}>
                        <Pressable
                  disabled={busy}
                          accessibilityRole="button"
                          accessibilityLabel={t('Select all messages')}
                          onPress={() => handleSelectMessagesPreset('all')}
                          style={[
                            styles.presetChip,
                            { borderColor: colors.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              { color: colors.foreground },
                            ]}
                          >
                            {t('All')}
                          </Text>
                        </Pressable>
                        <Pressable
                  disabled={busy}
                          accessibilityRole="button"
                          accessibilityLabel={t('Select last turn')}
                          onPress={() => handleSelectMessagesPreset('last1')}
                          style={[
                            styles.presetChip,
                            { borderColor: colors.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              { color: colors.foreground },
                            ]}
                          >
                            {t('Last turn')}
                          </Text>
                        </Pressable>
                        <Pressable
                  disabled={busy}
                          accessibilityRole="button"
                          accessibilityLabel={t('Select last 3 turns')}
                          onPress={() => handleSelectMessagesPreset('last3')}
                          style={[
                            styles.presetChip,
                            { borderColor: colors.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              { color: colors.foreground },
                            ]}
                          >
                            {t('Last 3 turns')}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.messagePickerBox,
                        { borderColor: colors.border },
                      ]}
                    >
                      {messages.map((msg, idx) => {
                        const checked = selectedMsgIndexes.includes(idx);
                        return (
                          <Pressable
                  disabled={busy}
                            key={`save-msg-${idx}`}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked }}
                            accessibilityLabel={t("Toggle message {value1}", { value1: String(idx + 1) })}
                            onPress={() => toggleMessageIndex(idx)}
                            style={[
                              styles.messageOptionRow,
                              {
                                borderBottomColor: colors.border,
                                backgroundColor: checked
                                  ? colors.secondary
                                  : 'transparent',
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.checkbox,
                                {
                                  borderColor: checked
                                    ? colors.primary
                                    : colors.border,
                                  backgroundColor: checked
                                    ? colors.primary
                                    : 'transparent',
                                },
                              ]}
                            >
                              {checked ? (
                                <Check
                                  size={12}
                                  color={colors.primaryForeground}
                                />
                              ) : null}
                            </View>
                            {msg.role === 'user' ? (
                              <MessageSquare
                                size={13}
                                color={colors.mutedForeground}
                              />
                            ) : (
                              <Sparkles size={13} color={colors.primary} />
                            )}
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.messageSnippet,
                                { color: colors.foreground },
                              ]}
                            >
                              {msg.content}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                <View style={styles.fieldGroup}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.label, { color: colors.foreground }]}>
                      {t('Destination Collections')}
                    </Text>
                    <Pressable
                  disabled={busy}
                      accessibilityRole="button"
                      accessibilityLabel={t('Create new collection inline')}
                      onPress={() => setCreatingInline((v) => !v)}
                      style={styles.inlineAddBtn}
                    >
                      <FolderPlus size={14} color={colors.primary} />
                      <Text
                        style={[
                          styles.inlineAddBtnText,
                          { color: colors.primary },
                        ]}
                      >
                        {t('New collection')}
                      </Text>
                    </Pressable>
                  </View>

                  {creatingInline ? (
                    <View style={styles.inlineCreateRow}>
                      <TextInput
                    editable={!busy}
                        value={newCollectionName}
                        onChangeText={setNewCollectionName}
                        placeholder={t('New collection name...')}
                        placeholderTextColor={colors.mutedForeground}
                        accessibilityLabel={t('New collection name')}
                        style={[
                          styles.input,
                          styles.inlineCreateInput,
                          {
                            color: colors.foreground,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          },
                        ]}
                      />
                      <Pressable
                  disabled={busy}
                        accessibilityRole="button"
                        accessibilityLabel={t('Confirm create collection')}
                        onPress={() => void handleCreateInlineNotebook()}
                        style={[
                          styles.inlineCreateConfirmBtn,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.primaryBtnText,
                            { color: colors.primaryForeground },
                          ]}
                        >
                          {t('Create')}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}

                  <View style={styles.collectionList}>
                    {readableNotebooks.map((nb) => {
                      const selected = selectedNotebookIds.includes(nb.id) || confirmedIds.includes(nb.id);
                      return (
                        <Pressable
                  disabled={busy || confirmedIds.includes(nb.id)}
                          key={nb.id}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: selected }}
                          accessibilityLabel={t("Select collection {value1}", { value1: String(nb.name) })}
                          onPress={() => toggleNotebookSelection(nb.id)}
                          style={[
                            styles.collectionItem,
                            {
                              borderColor: selected
                                ? colors.primary
                                : colors.border,
                              backgroundColor: selected
                                ? colors.secondary
                                : colors.background,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.colorDot,
                              { backgroundColor: nb.color },
                            ]}
                          />
                          <View style={styles.collectionInfo}>
                            <Text
                              style={[
                                styles.collectionName,
                                { color: colors.foreground },
                              ]}
                            >
                              {nb.name}
                            </Text>
                            <Text
                              style={[
                                styles.collectionCount,
                                { color: colors.mutedForeground },
                              ]}
                            >
                              {t("{value1} saved item{value2}", { value1: String(nb.record_count), value2: String(nb.record_count === 1 ? '' : 's') })}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: selected
                                  ? colors.primary
                                  : colors.border,
                                backgroundColor: selected
                                  ? colors.primary
                                  : 'transparent',
                              },
                            ]}
                          >
                            {selected ? (
                              <Check
                                size={12}
                                color={colors.primaryForeground}
                              />
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {(busy || libraryState === 'loading') && <LoadingState />}
                {!!error && <><InlineAlert tone="danger">{t(error)}</InlineAlert><Button onPress={() => void refresh()}>{t('Retry')}</Button></>}
                {errorMessage ? (
                  <View
                    style={[
                      styles.errorBanner,
                      {
                        borderColor: colors.destructive,
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.errorText, { color: colors.destructive }]}
                    >
                      {t(errorMessage)}
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              <View
                style={[styles.footer, { borderTopColor: colors.border }]}
              >
                <Pressable
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={t('Cancel Save to Favorites')}
                  onPress={onClose}
                  style={[
                    styles.secondaryBtn,
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryBtnText,
                      { color: colors.foreground },
                    ]}
                  >
                    {t('Cancel')}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={busy || libraryState === 'loading' || libraryState === 'error'}
                  accessibilityRole="button"
                  accessibilityLabel={t('Confirm Save to Favorites')}
                  onPress={() => void handleSave()}
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryBtnText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    {t('Save Snapshot')}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  kindBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    maxHeight: 440,
  },
  bodyContent: {
    padding: 16,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  messagePickerBox: {
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: 150,
    overflow: 'hidden',
  },
  messageOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  messageSnippet: {
    fontSize: 12,
    flex: 1,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineAddBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inlineCreateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineCreateInput: {
    flex: 1,
  },
  inlineCreateConfirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  collectionList: {
    gap: 8,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  collectionCount: {
    fontSize: 12,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  savedConfirmation: {
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  savedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  savedSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  savedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
});
