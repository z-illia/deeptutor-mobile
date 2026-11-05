import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  BookMarked,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Folder,
  FolderInput,
  FolderPlus,
  Info,
  MessageSquarePlus,
  Search,
  Trash2,
  X,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme';
import { useI18n } from '../../i18n';
import { ChatMarkdown } from '../chat/ChatMarkdown';
import { useFavorites } from './FavoritesProvider';
import {
  DEFAULT_NOTEBOOK_COLOR,
  exportNotebookAsMarkdown,
  FAVORITE_KIND_LABELS,
  favoriteKind,
  filterNotebookRecords,
  filterNotebooks,
  type NotebookRecordItem,
  type NotebookSummary,
  SWATCHES,
} from './model';

const KIND_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chat', label: 'Chat' },
  { id: 'question', label: 'Question' },
  { id: 'research', label: 'Research' },
  { id: 'solve', label: 'Solution' },
  { id: 'reading', label: 'Reading' },
];

export function FavoritesScreen({ notebookId }: { notebookId?: string }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ recordId?: string; state?: string }>();

  const {
    notebooks,
    recordsByNotebook,
    libraryState,
    setLibraryState,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    updateRecord,
    deleteRecord,
    relocateRecord,
    locateRecord,
    resetFavoritesFixtures,
  } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Collection create/edit modal state
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] =
    useState<NotebookSummary | null>(null);
  const [metaName, setMetaName] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaColor, setMetaColor] = useState<string>(DEFAULT_NOTEBOOK_COLOR);
  const [metaError, setMetaError] = useState<string | null>(null);

  // Record edit modal state (with dirty-discard check)
  const [editingRecord, setEditingRecord] = useState<NotebookRecordItem | null>(
    null,
  );
  const [recordTitleDraft, setRecordTitleDraft] = useState('');
  const [recordSummaryDraft, setRecordSummaryDraft] = useState('');
  const [recordEditError, setRecordEditError] = useState<string | null>(null);
  const [confirmDiscardRecordEdit, setConfirmDiscardRecordEdit] =
    useState(false);

  // Relocate modal state
  const [relocatingState, setRelocatingState] = useState<{
    mode: 'move' | 'copy';
    record: NotebookRecordItem;
  } | null>(null);
  const [targetNotebookId, setTargetNotebookId] = useState<string>('');

  // Export markdown modal
  const [exportMarkdownText, setExportMarkdownText] = useState<string | null>(
    null,
  );
  const [confirmDeleteNotebook, setConfirmDeleteNotebook] = useState(false);

  useEffect(() => {
    if (
      params.state === 'loading' ||
      params.state === 'empty' ||
      params.state === 'error' ||
      params.state === 'ready'
    ) {
      setLibraryState(params.state);
    }
  }, [params.state, setLibraryState]);

  const activeNotebook = useMemo(
    () =>
      notebookId ? notebooks.find((nb) => nb.id === notebookId) ?? null : null,
    [notebookId, notebooks],
  );

  const rawRecords = useMemo(
    () => (notebookId ? recordsByNotebook[notebookId] ?? [] : []),
    [notebookId, recordsByNotebook],
  );

  const filteredNotebooks = useMemo(
    () => filterNotebooks(notebooks, recordsByNotebook, searchQuery),
    [notebooks, recordsByNotebook, searchQuery],
  );

  const filteredRecords = useMemo(
    () => filterNotebookRecords(rawRecords, searchQuery, kindFilter),
    [rawRecords, searchQuery, kindFilter],
  );

  const totalRecordCount = useMemo(
    () =>
      notebooks.reduce(
        (acc, nb) => acc + (recordsByNotebook[nb.id]?.length ?? 0),
        0,
      ),
    [notebooks, recordsByNotebook],
  );

  // Deep-link ?recordId=... resolution
  const focusedRecordStatus = useMemo(() => {
    if (!notebookId || !params.recordId) return null;
    const inCurrent = rawRecords.find((r) => r.id === params.recordId);
    if (inCurrent) {
      return { status: 'found' as const, record: inCurrent };
    }
    const relocated = locateRecord(params.recordId);
    if (relocated) {
      return {
        status: 'relocated' as const,
        notebook: relocated.notebook,
        record: relocated.record,
      };
    }
    return { status: 'missing' as const };
  }, [locateRecord, notebookId, params.recordId, rawRecords]);

  useEffect(() => {
    if (
      focusedRecordStatus?.status === 'found' &&
      !expandedRecordIds.includes(focusedRecordStatus.record.id)
    ) {
      setExpandedRecordIds((prev) => [...prev, focusedRecordStatus.record.id]);
    }
  }, [expandedRecordIds, focusedRecordStatus]);

  useEffect(() => {
    if (
      notebookId &&
      rawRecords.length > 0 &&
      expandedRecordIds.length === 0 &&
      !params.recordId
    ) {
      setExpandedRecordIds([rawRecords[0].id]);
    }
  }, [expandedRecordIds.length, notebookId, params.recordId, rawRecords]);

  const openCreateNotebookModal = () => {
    setEditingNotebook(null);
    setMetaName('');
    setMetaDescription('');
    setMetaColor(DEFAULT_NOTEBOOK_COLOR);
    setMetaError(null);
    setMetaModalOpen(true);
  };

  const openEditNotebookModal = (nb: NotebookSummary) => {
    setEditingNotebook(nb);
    setMetaName(nb.name);
    setMetaDescription(nb.description ?? '');
    setMetaColor(nb.color || DEFAULT_NOTEBOOK_COLOR);
    setMetaError(null);
    setMetaModalOpen(true);
  };

  const handleSaveNotebookMeta = () => {
    const trimmed = metaName.trim();
    if (!trimmed) {
      setMetaError('Collection name is required.');
      return;
    }
    if (editingNotebook) {
      updateNotebook(editingNotebook.id, {
        name: trimmed,
        description: metaDescription,
        color: metaColor,
      });
      setStatusNotice(`Updated collection "${trimmed}".`);
    } else {
      createNotebook({
        name: trimmed,
        description: metaDescription,
        color: metaColor,
      });
      setStatusNotice(`Created collection "${trimmed}".`);
    }
    setMetaModalOpen(false);
  };

  const openEditRecordModal = (rec: NotebookRecordItem) => {
    setEditingRecord(rec);
    setRecordTitleDraft(rec.title);
    setRecordSummaryDraft(rec.summary ?? '');
    setRecordEditError(null);
    setConfirmDiscardRecordEdit(false);
  };

  const isRecordEditDirty = Boolean(
    editingRecord &&
      (recordTitleDraft.trim() !== editingRecord.title ||
        recordSummaryDraft.trim() !== (editingRecord.summary ?? '')),
  );

  const handleRequestCloseRecordEdit = () => {
    if (isRecordEditDirty && !confirmDiscardRecordEdit) {
      setConfirmDiscardRecordEdit(true);
      return;
    }
    setEditingRecord(null);
    setConfirmDiscardRecordEdit(false);
  };

  const handleSaveRecordEdit = () => {
    if (!editingRecord || !notebookId) return;
    const trimmedTitle = recordTitleDraft.trim();
    if (!trimmedTitle) {
      setRecordEditError('Title cannot be empty.');
      return;
    }
    updateRecord(notebookId, editingRecord.id, {
      title: trimmedTitle,
      summary: recordSummaryDraft.trim(),
    });
    setStatusNotice(`Updated favorite "${trimmedTitle}".`);
    setEditingRecord(null);
    setConfirmDiscardRecordEdit(false);
  };

  const openRelocateModal = (
    mode: 'move' | 'copy',
    record: NotebookRecordItem,
  ) => {
    const otherNotebooks = notebooks.filter(
      (nb) => nb.id !== notebookId && !nb.unreadable,
    );
    setRelocatingState({ mode, record });
    setTargetNotebookId(otherNotebooks[0]?.id ?? '');
  };

  const handleConfirmRelocate = () => {
    if (!relocatingState || !notebookId || !targetNotebookId) return;
    const res = relocateRecord(
      relocatingState.mode,
      notebookId,
      relocatingState.record.id,
      targetNotebookId,
    );
    const destName =
      notebooks.find((n) => n.id === targetNotebookId)?.name ?? 'collection';
    if (res) {
      setStatusNotice(
        relocatingState.mode === 'move'
          ? `Moved "${relocatingState.record.title}" to ${destName}.`
          : `Copied "${relocatingState.record.title}" to ${destName}.`,
      );
    }
    setRelocatingState(null);
  };

  const toggleExpandRecord = (id: string) => {
    setExpandedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Render Collection Detail (`MS-FAVORITES-DETAIL`, `/notebooks/[notebookId]`)
  if (notebookId) {
    if (!activeNotebook) {
      return (
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.detailHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Back to all Favorites')}
              onPress={() => router.push('/notebooks' as never)}
              style={styles.backBtn}
            >
              <ArrowLeft size={16} color={colors.foreground} />
              <Text style={[styles.backBtnText, { color: colors.foreground }]}>
                {t('All Favorites')}
              </Text>
            </Pressable>
          </View>
          <View
            style={[
              styles.stateCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <AlertTriangle size={24} color={colors.destructive} />
            <Text style={[styles.stateTitle, { color: colors.foreground }]}>
              {t('Collection not found')}
            </Text>
            <Text
              style={[styles.stateBody, { color: colors.mutedForeground }]}
            >
              {t('This Favorites collection may have been deleted.')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Return to Favorites')}
              onPress={() => router.push('/notebooks' as never)}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.primaryBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                {t('Return to Favorites')}
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Breadcrumb & Collection Actions */}
          <View style={styles.detailTopRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Back to all Favorites')}
              onPress={() => router.push('/notebooks' as never)}
              style={styles.backBtn}
            >
              <ArrowLeft size={16} color={colors.foreground} />
              <Text style={[styles.backBtnText, { color: colors.foreground }]}>
                {t('All Favorites')}
              </Text>
            </Pressable>

            <View style={styles.detailHeaderActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Edit collection metadata')}
                onPress={() => openEditNotebookModal(activeNotebook)}
                style={[styles.actionChip, { borderColor: colors.border }]}
              >
                <Edit3 size={14} color={colors.foreground} />
                <Text
                  style={[styles.actionChipText, { color: colors.foreground }]}
                >
                  {t('Edit')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Export Markdown')}
                onPress={() =>
                  setExportMarkdownText(
                    exportNotebookAsMarkdown(activeNotebook, rawRecords),
                  )
                }
                style={[styles.actionChip, { borderColor: colors.border }]}
              >
                <Download size={14} color={colors.foreground} />
                <Text
                  style={[styles.actionChipText, { color: colors.foreground }]}
                >
                  {t('Export Markdown')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Delete collection')}
                onPress={() => setConfirmDeleteNotebook(true)}
                style={[styles.actionChip, { borderColor: colors.border }]}
              >
                <Trash2 size={14} color={colors.destructive} />
                <Text
                  style={[
                    styles.actionChipText,
                    { color: colors.destructive },
                  ]}
                >
                  {t('Delete')}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Collection Banner */}
          <View
            style={[
              styles.collectionBanner,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.collectionBannerHeader}>
              <View
                style={[
                  styles.colorSwatchLarge,
                  { backgroundColor: activeNotebook.color },
                ]}
              />
              <View style={styles.collectionBannerInfo}>
                <Text
                  style={[styles.collectionTitle, { color: colors.foreground }]}
                >
                  {activeNotebook.name}
                </Text>
                {activeNotebook.description ? (
                  <Text
                    style={[
                      styles.collectionDescription,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {activeNotebook.description}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.countPill,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text
                  style={[styles.countPillText, { color: colors.foreground }]}
                >
                  {`${rawRecords.length} saved original${rawRecords.length === 1 ? '' : 's'}`}
                </Text>
              </View>
            </View>
          </View>

          {statusNotice ? (
            <View
              style={[
                styles.noticeBanner,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[styles.noticeText, { color: colors.foreground }]}
              >
                {statusNotice}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Dismiss notice')}
                onPress={() => setStatusNotice(null)}
              >
                <X size={15} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ) : null}

          {focusedRecordStatus?.status === 'relocated' ? (
            <View
              style={[
                styles.noticeBanner,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.noticeText, { color: colors.foreground }]}>
                {`Record "${focusedRecordStatus.record.title}" was moved to ${focusedRecordStatus.notebook.name}.`}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Open relocated record')}
                onPress={() =>
                  router.push(
                    `/notebooks/${focusedRecordStatus.notebook.id}?recordId=${focusedRecordStatus.record.id}` as never,
                  )
                }
                style={[
                  styles.primaryBtnSmall,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {t('Open relocated record')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {focusedRecordStatus?.status === 'missing' ? (
            <View
              style={[
                styles.noticeBanner,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.destructive,
                },
              ]}
            >
              <Text style={[styles.noticeText, { color: colors.destructive }]}>
                {t('Requested favorite record is no longer available.')}
              </Text>
            </View>
          ) : null}

          {activeNotebook.unreadable ? (
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.destructive,
                },
              ]}
            >
              <AlertTriangle size={24} color={colors.destructive} />
              <Text style={[styles.stateTitle, { color: colors.foreground }]}>
                {t('Unreadable Collection')}
              </Text>
              <Text
                style={[styles.stateBody, { color: colors.mutedForeground }]}
              >
                {t(
                  'This collection metadata or storage index could not be parsed. Restore or delete this collection.',
                )}
              </Text>
            </View>
          ) : (
            <>
              {/* Search & Kind Filters */}
              <View style={styles.filterToolbar}>
                <View
                  style={[
                    styles.searchBox,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Search size={15} color={colors.mutedForeground} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('Search saved originals in this collection...')}
                    placeholderTextColor={colors.mutedForeground}
                    accessibilityLabel={t('Search collection records')}
                    style={[styles.searchInput, { color: colors.foreground }]}
                  />
                  {searchQuery ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Clear search')}
                      onPress={() => setSearchQuery('')}
                    >
                      <X size={15} color={colors.mutedForeground} />
                    </Pressable>
                  ) : null}
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.kindFilterRow}
                >
                  {KIND_FILTERS.map((kf) => {
                    const active = kindFilter === kf.id;
                    return (
                      <Pressable
                        key={kf.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={`Filter by ${kf.label}`}
                        onPress={() => setKindFilter(kf.id)}
                        style={[
                          styles.kindChip,
                          {
                            borderColor: active
                              ? colors.primary
                              : colors.border,
                            backgroundColor: active
                              ? colors.primary
                              : colors.card,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.kindChipText,
                            {
                              color: active
                                ? colors.primaryForeground
                                : colors.foreground,
                            },
                          ]}
                        >
                          {t(kf.label)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {filteredRecords.length === 0 ? (
                <View
                  style={[
                    styles.stateCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <BookMarked size={24} color={colors.mutedForeground} />
                  <Text
                    style={[styles.stateTitle, { color: colors.foreground }]}
                  >
                    {rawRecords.length === 0
                      ? t('No saved items yet')
                      : t('No matching favorites')}
                  </Text>
                  <Text
                    style={[
                      styles.stateBody,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {rawRecords.length === 0
                      ? t(
                          'Save chat replies, quiz items, or research reports from Chat to build this collection.',
                        )
                      : t('Try clearing your search query or kind filter.')}
                  </Text>
                </View>
              ) : (
                <View style={styles.recordList}>
                  {filteredRecords.map((rec) => {
                    const kind = favoriteKind(rec.type, rec.metadata);
                    const kindLabel = FAVORITE_KIND_LABELS[kind];
                    const expanded = expandedRecordIds.includes(rec.id);
                    const isFocused = params.recordId === rec.id;
                    const sessionId =
                      typeof rec.metadata?.session_id === 'string'
                        ? rec.metadata.session_id
                        : undefined;

                    return (
                      <View
                        key={rec.id}
                        style={[
                          styles.recordCard,
                          {
                            backgroundColor: colors.card,
                            borderColor: isFocused
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      >
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Toggle favorite record ${rec.title}`}
                          onPress={() => toggleExpandRecord(rec.id)}
                          style={styles.recordHeader}
                        >
                          <View style={styles.recordHeaderMain}>
                            <View style={styles.recordTitleRow}>
                              <View
                                style={[
                                  styles.kindBadge,
                                  { backgroundColor: colors.secondary },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.kindBadgeText,
                                    { color: colors.foreground },
                                  ]}
                                >
                                  {kindLabel}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.recordTitle,
                                  { color: colors.foreground },
                                ]}
                              >
                                {rec.title}
                              </Text>
                            </View>
                            {rec.summary ? (
                              <Text
                                style={[
                                  styles.recordSummary,
                                  { color: colors.mutedForeground },
                                ]}
                              >
                                {rec.summary}
                              </Text>
                            ) : null}
                          </View>
                          {expanded ? (
                            <ChevronDown
                              size={18}
                              color={colors.mutedForeground}
                            />
                          ) : (
                            <ChevronRight
                              size={18}
                              color={colors.mutedForeground}
                            />
                          )}
                        </Pressable>

                        {expanded ? (
                          <View
                            style={[
                              styles.recordBody,
                              { borderTopColor: colors.border },
                            ]}
                          >
                            <View style={styles.immutableMetaRow}>
                              <View
                                style={[
                                  styles.immutableBadge,
                                  { backgroundColor: colors.secondary },
                                ]}
                              >
                                <Info size={12} color={colors.primary} />
                                <Text
                                  style={[
                                    styles.immutableBadgeText,
                                    { color: colors.foreground },
                                  ]}
                                >
                                  {t('Immutable Saved Original')}
                                </Text>
                              </View>
                              {sessionId ? (
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`Open original session for ${rec.title}`}
                                  onPress={() =>
                                    router.push(
                                      `/chat?sessionId=${sessionId}` as never,
                                    )
                                  }
                                  style={styles.originLinkBtn}
                                >
                                  <ExternalLink
                                    size={12}
                                    color={colors.primary}
                                  />
                                  <Text
                                    style={[
                                      styles.originLinkText,
                                      { color: colors.primary },
                                    ]}
                                  >
                                    {t('Open original session')}
                                  </Text>
                                </Pressable>
                              ) : null}
                            </View>

                            {rec.user_query ? (
                              <View
                                style={[
                                  styles.promptBox,
                                  {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.promptLabel,
                                    { color: colors.mutedForeground },
                                  ]}
                                >
                                  {t('Original Prompt')}
                                </Text>
                                <Text
                                  style={[
                                    styles.promptText,
                                    { color: colors.foreground },
                                  ]}
                                >
                                  {rec.user_query}
                                </Text>
                              </View>
                            ) : null}

                            <View
                              style={[
                                styles.snapshotBox,
                                {
                                  backgroundColor: colors.background,
                                  borderColor: colors.border,
                                },
                              ]}
                            >
                              <ChatMarkdown content={rec.output} />
                            </View>

                            {/* Record Action Bar */}
                            <View style={styles.recordActionsRow}>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Use ${rec.title} in Chat`}
                                onPress={() =>
                                  router.push(
                                    `/chat?attachFavoriteId=${rec.id}` as never,
                                  )
                                }
                                style={[
                                  styles.recordActionBtn,
                                  { borderColor: colors.border },
                                ]}
                              >
                                <MessageSquarePlus
                                  size={13}
                                  color={colors.primary}
                                />
                                <Text
                                  style={[
                                    styles.recordActionText,
                                    { color: colors.foreground },
                                  ]}
                                >
                                  {t('Use in Chat')}
                                </Text>
                              </Pressable>

                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Edit details for ${rec.title}`}
                                onPress={() => openEditRecordModal(rec)}
                                style={[
                                  styles.recordActionBtn,
                                  { borderColor: colors.border },
                                ]}
                              >
                                <Edit3 size={13} color={colors.foreground} />
                                <Text
                                  style={[
                                    styles.recordActionText,
                                    { color: colors.foreground },
                                  ]}
                                >
                                  {t('Edit details')}
                                </Text>
                              </Pressable>

                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Move ${rec.title}`}
                                onPress={() => openRelocateModal('move', rec)}
                                style={[
                                  styles.recordActionBtn,
                                  { borderColor: colors.border },
                                ]}
                              >
                                <FolderInput
                                  size={13}
                                  color={colors.foreground}
                                />
                                <Text
                                  style={[
                                    styles.recordActionText,
                                    { color: colors.foreground },
                                  ]}
                                >
                                  {t('Move to')}
                                </Text>
                              </Pressable>

                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Copy ${rec.title}`}
                                onPress={() => openRelocateModal('copy', rec)}
                                style={[
                                  styles.recordActionBtn,
                                  { borderColor: colors.border },
                                ]}
                              >
                                <Copy size={13} color={colors.foreground} />
                                <Text
                                  style={[
                                    styles.recordActionText,
                                    { color: colors.foreground },
                                  ]}
                                >
                                  {t('Copy to')}
                                </Text>
                              </Pressable>

                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Delete ${rec.title}`}
                                onPress={() => {
                                  deleteRecord(notebookId, rec.id);
                                  setStatusNotice(`Deleted "${rec.title}".`);
                                }}
                                style={[
                                  styles.recordActionBtn,
                                  { borderColor: colors.border },
                                ]}
                              >
                                <Trash2 size={13} color={colors.destructive} />
                                <Text
                                  style={[
                                    styles.recordActionText,
                                    { color: colors.destructive },
                                  ]}
                                >
                                  {t('Delete')}
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {renderSharedModals()}
      </View>
    );
  }

  // Render Collection List (`MS-FAVORITES`, `/notebooks`)
  function renderSharedModals() {
    const otherNotebooks = notebooks.filter(
      (nb) => nb.id !== notebookId && !nb.unreadable,
    );

    return (
      <>
        {/* Create / Edit Collection Metadata Modal */}
        <Modal
          visible={metaModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMetaModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.modalTitle, { color: colors.foreground }]}
                >
                  {editingNotebook
                    ? t('Edit Collection')
                    : t('New Favorites Collection')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Close collection dialog')}
                  onPress={() => setMetaModalOpen(false)}
                >
                  <X size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                  {t('Collection Name')}
                </Text>
                <TextInput
                  value={metaName}
                  onChangeText={(val) => {
                    setMetaName(val);
                    setMetaError(null);
                  }}
                  placeholder={t('e.g., Linear Algebra Exam Prep')}
                  placeholderTextColor={colors.mutedForeground}
                  accessibilityLabel={t('Collection Name')}
                  style={[
                    styles.textInput,
                    {
                      color: colors.foreground,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                />

                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                  {t('Description')}
                </Text>
                <TextInput
                  value={metaDescription}
                  onChangeText={setMetaDescription}
                  placeholder={t('Optional summary of saved items...')}
                  placeholderTextColor={colors.mutedForeground}
                  accessibilityLabel={t('Collection Description')}
                  style={[
                    styles.textInput,
                    {
                      color: colors.foreground,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                />

                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                  {t('Folder Color')}
                </Text>
                <View style={styles.swatchesRow}>
                  {SWATCHES.map((swatch) => {
                    const selected = metaColor === swatch;
                    return (
                      <Pressable
                        key={swatch}
                        accessibilityRole="button"
                        accessibilityLabel={`Select color ${swatch}`}
                        onPress={() => setMetaColor(swatch)}
                        style={[
                          styles.swatchOption,
                          {
                            backgroundColor: swatch,
                            borderColor: selected
                              ? colors.foreground
                              : 'transparent',
                          },
                        ]}
                      >
                        {selected ? <Check size={14} color="#FFFFFF" /> : null}
                      </Pressable>
                    );
                  })}
                </View>

                {metaError ? (
                  <Text
                    style={[styles.errorText, { color: colors.destructive }]}
                  >
                    {metaError}
                  </Text>
                ) : null}
              </View>

              <View
                style={[styles.modalFooter, { borderTopColor: colors.border }]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Cancel collection dialog')}
                  onPress={() => setMetaModalOpen(false)}
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
                  accessibilityRole="button"
                  accessibilityLabel={t('Save collection metadata')}
                  onPress={handleSaveNotebookMeta}
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
                    {t('Save Collection')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Favorite Record Details Modal */}
        <Modal
          visible={Boolean(editingRecord)}
          transparent
          animationType="fade"
          onRequestClose={handleRequestCloseRecordEdit}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.modalTitle, { color: colors.foreground }]}
                >
                  {t('Edit Favorite Details')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Close edit favorite dialog')}
                  onPress={handleRequestCloseRecordEdit}
                >
                  <X size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                  {t('Favorite Title')}
                </Text>
                <TextInput
                  value={recordTitleDraft}
                  onChangeText={(val) => {
                    setRecordTitleDraft(val);
                    setRecordEditError(null);
                    setConfirmDiscardRecordEdit(false);
                  }}
                  accessibilityLabel={t('Favorite Title')}
                  style={[
                    styles.textInput,
                    {
                      color: colors.foreground,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                />

                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                  {t('Summary / Annotation')}
                </Text>
                <TextInput
                  value={recordSummaryDraft}
                  onChangeText={(val) => {
                    setRecordSummaryDraft(val);
                    setConfirmDiscardRecordEdit(false);
                  }}
                  accessibilityLabel={t('Summary / Annotation')}
                  style={[
                    styles.textInput,
                    {
                      color: colors.foreground,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                />

                {recordEditError ? (
                  <Text
                    style={[styles.errorText, { color: colors.destructive }]}
                  >
                    {recordEditError}
                  </Text>
                ) : null}

                {confirmDiscardRecordEdit ? (
                  <View
                    style={[
                      styles.discardConfirmBox,
                      {
                        borderColor: colors.destructive,
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.errorText,
                        { color: colors.destructive },
                      ]}
                    >
                      {t('You have unsaved changes. Discard edits?')}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Discard unsaved favorite changes')}
                      onPress={() => {
                        setEditingRecord(null);
                        setConfirmDiscardRecordEdit(false);
                      }}
                      style={[
                        styles.primaryBtnSmall,
                        { backgroundColor: colors.destructive },
                      ]}
                    >
                      <Text
                        style={[
                          styles.primaryBtnText,
                          { color: colors.primaryForeground },
                        ]}
                      >
                        {t('Discard')}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>

              <View
                style={[styles.modalFooter, { borderTopColor: colors.border }]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Cancel edit favorite')}
                  onPress={handleRequestCloseRecordEdit}
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
                  accessibilityRole="button"
                  accessibilityLabel={t('Save favorite details')}
                  onPress={handleSaveRecordEdit}
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
                    {t('Save Changes')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Move / Copy Record Modal */}
        <Modal
          visible={Boolean(relocatingState)}
          transparent
          animationType="fade"
          onRequestClose={() => setRelocatingState(null)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.modalTitle, { color: colors.foreground }]}
                >
                  {relocatingState?.mode === 'move'
                    ? t('Move Favorite to Collection')
                    : t('Copy Favorite to Collection')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Close relocate dialog')}
                  onPress={() => setRelocatingState(null)}
                >
                  <X size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                {otherNotebooks.map((nb) => {
                  const selected = targetNotebookId === nb.id;
                  return (
                    <Pressable
                      key={nb.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Select target collection ${nb.name}`}
                      onPress={() => setTargetNotebookId(nb.id)}
                      style={[
                        styles.targetCollectionOption,
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
                      <Text
                        style={[
                          styles.targetCollectionName,
                          { color: colors.foreground },
                        ]}
                      >
                        {nb.name}
                      </Text>
                      {selected ? (
                        <Check size={15} color={colors.primary} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <View
                style={[styles.modalFooter, { borderTopColor: colors.border }]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Cancel relocate')}
                  onPress={() => setRelocatingState(null)}
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
                  accessibilityRole="button"
                  accessibilityLabel={t('Confirm relocate favorite')}
                  onPress={handleConfirmRelocate}
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
                    {relocatingState?.mode === 'move'
                      ? t('Move Here')
                      : t('Copy Here')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Export Markdown Modal */}
        <Modal
          visible={Boolean(exportMarkdownText)}
          transparent
          animationType="fade"
          onRequestClose={() => setExportMarkdownText(null)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.modalTitle, { color: colors.foreground }]}
                >
                  {t('Export Collection as Markdown')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Close export dialog')}
                  onPress={() => setExportMarkdownText(null)}
                >
                  <X size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
              <ScrollView style={styles.exportScroll}>
                <Text
                  style={[styles.exportPreview, { color: colors.foreground }]}
                >
                  {exportMarkdownText}
                </Text>
              </ScrollView>
              <View
                style={[styles.modalFooter, { borderTopColor: colors.border }]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Copy exported Markdown')}
                  onPress={async () => {
                    if (exportMarkdownText) {
                      await Clipboard.setStringAsync(exportMarkdownText);
                      setStatusNotice('Copied exported Markdown to clipboard.');
                      setExportMarkdownText(null);
                    }
                  }}
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
                    {t('Copy Markdown')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Notebook Confirmation Modal */}
        <Modal
          visible={confirmDeleteNotebook}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmDeleteNotebook(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.modalTitle, { color: colors.foreground }]}
                >
                  {t('Delete Collection?')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Close delete collection dialog')}
                  onPress={() => setConfirmDeleteNotebook(false)}
                >
                  <X size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
              <View style={styles.modalBody}>
                <Text
                  style={[styles.stateBody, { color: colors.mutedForeground }]}
                >
                  {`Delete "${activeNotebook?.name ?? ''}" and its saved snapshots? Original chat sessions remain intact.`}
                </Text>
              </View>
              <View
                style={[styles.modalFooter, { borderTopColor: colors.border }]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Cancel delete collection')}
                  onPress={() => setConfirmDeleteNotebook(false)}
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
                  accessibilityRole="button"
                  accessibilityLabel={t('Confirm delete collection')}
                  onPress={() => {
                    if (activeNotebook) {
                      deleteNotebook(activeNotebook.id);
                    }
                    setConfirmDeleteNotebook(false);
                    router.push('/notebooks' as never);
                  }}
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: colors.destructive },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryBtnText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    {t('Delete Collection')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.topHeaderText}>
            <View style={styles.titleRow}>
              <BookMarked size={22} color={colors.primary} />
              <Text style={[styles.screenTitle, { color: colors.foreground }]}>
                {t('Favorites')}
              </Text>
              <View
                style={[
                  styles.countPill,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text
                  style={[styles.countPillText, { color: colors.foreground }]}
                >
                  {`${notebooks.length} folders · ${totalRecordCount} items`}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.screenSubtitle, { color: colors.mutedForeground }]}
            >
              {t(
                'Saved Originals — immutable snapshots of chat replies, quiz items, research reports, and reading highlights.',
              )}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('New notebook')}
            onPress={openCreateNotebookModal}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          >
            <View style={styles.btnIconRow}>
              <FolderPlus size={15} color={colors.primaryForeground} />
              <Text
                style={[
                  styles.primaryBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                {t('New notebook')}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Scope Distinction Notice (Saved Originals vs Editable Co-Writer Notes) */}
        <View
          style={[
            styles.scopeBanner,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Info size={16} color={colors.primary} />
          <View style={styles.scopeBannerTextCol}>
            <Text
              style={[styles.scopeBannerTitle, { color: colors.foreground }]}
            >
              {t('Saved Originals vs. Editable Notes')}
            </Text>
            <Text
              style={[
                styles.scopeBannerDesc,
                { color: colors.mutedForeground },
              ]}
            >
              {t(
                'Favorites stores read-only original snapshots captured from Chat, Quiz, Research, and Reading. Editable Markdown study notes live in Co-Writer (M7).',
              )}
            </Text>
          </View>
        </View>

        {statusNotice ? (
          <View
            style={[
              styles.noticeBanner,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.noticeText, { color: colors.foreground }]}>
              {statusNotice}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Dismiss notice')}
              onPress={() => setStatusNotice(null)}
            >
              <X size={15} color={colors.mutedForeground} />
            </Pressable>
          </View>
        ) : null}

        {/* Search & State Switcher Bar */}
        <View style={styles.filterToolbar}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Search size={15} color={colors.mutedForeground} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('Search folders, titles, or summaries...')}
              placeholderTextColor={colors.mutedForeground}
              accessibilityLabel={t('Search Favorites collections')}
              style={[styles.searchInput, { color: colors.foreground }]}
            />
            {searchQuery ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Clear search')}
                onPress={() => setSearchQuery('')}
              >
                <X size={15} color={colors.mutedForeground} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statePillsRow}
          >
            {(['ready', 'loading', 'empty', 'error'] as const).map((st) => {
              const active = libraryState === st;
              return (
                <Pressable
                  key={st}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Switch Favorites state to ${st}`}
                  onPress={() => setLibraryState(st)}
                  style={[
                    styles.statePill,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active
                        ? colors.secondary
                        : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statePillText,
                      {
                        color: active
                          ? colors.primary
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {`State: ${st}`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {libraryState === 'loading' ? (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.stateTitle, { color: colors.foreground }]}>
              {t('Loading Favorites collections...')}
            </Text>
            <Text
              style={[styles.stateBody, { color: colors.mutedForeground }]}
            >
              {t('Reading local Saved Originals index and record counts.')}
            </Text>
          </View>
        ) : libraryState === 'error' ? (
          <View
            style={[
              styles.stateCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.destructive,
              },
            ]}
          >
            <AlertTriangle size={24} color={colors.destructive} />
            <Text style={[styles.stateTitle, { color: colors.foreground }]}>
              {t('Unable to load Favorites')}
            </Text>
            <Text
              style={[styles.stateBody, { color: colors.mutedForeground }]}
            >
              {t(
                'Local Favorites index encountered a read error. Retry to reload collections.',
              )}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Retry loading Favorites')}
              onPress={() => resetFavoritesFixtures()}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.primaryBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                {t('Retry')}
              </Text>
            </Pressable>
          </View>
        ) : libraryState === 'empty' || filteredNotebooks.length === 0 ? (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Folder size={24} color={colors.mutedForeground} />
            <Text style={[styles.stateTitle, { color: colors.foreground }]}>
              {searchQuery
                ? t('No collections match your search')
                : t('No Favorites collections yet')}
            </Text>
            <Text
              style={[styles.stateBody, { color: colors.mutedForeground }]}
            >
              {searchQuery
                ? t('Try another search keyword or clear the filter.')
                : t(
                    'Create a collection or save any assistant reply from Chat.',
                  )}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Create first collection')}
              onPress={() => {
                setLibraryState('ready');
                openCreateNotebookModal();
              }}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.primaryBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                {t('Create Collection')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.collectionGrid}>
            {filteredNotebooks.map((nb) => {
              const records = recordsByNotebook[nb.id] ?? [];
              const peekRecords = records.slice(0, 3);
              return (
                <View
                  key={nb.id}
                  style={[
                    styles.collectionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: nb.unreadable
                        ? colors.destructive
                        : colors.border,
                    },
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Open collection ${nb.name}`}
                    onPress={() => router.push(`/notebooks/${nb.id}` as never)}
                    style={styles.collectionCardPressable}
                  >
                    <View style={styles.collectionCardTop}>
                      <View
                        style={[
                          styles.colorSwatchLarge,
                          { backgroundColor: nb.color },
                        ]}
                      />
                      <View style={styles.collectionCardHeaderInfo}>
                        <View style={styles.collectionNameRow}>
                          <Text
                            style={[
                              styles.collectionCardTitle,
                              { color: colors.foreground },
                            ]}
                          >
                            {nb.name}
                          </Text>
                          {nb.unreadable ? (
                            <View
                              style={[
                                styles.unreadableBadge,
                                { backgroundColor: colors.secondary },
                              ]}
                            >
                              <AlertTriangle
                                size={11}
                                color={colors.destructive}
                              />
                              <Text
                                style={[
                                  styles.unreadableBadgeText,
                                  { color: colors.destructive },
                                ]}
                              >
                                {t('Unreadable')}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        {nb.description ? (
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.collectionCardDesc,
                              { color: colors.mutedForeground },
                            ]}
                          >
                            {nb.description}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.countPill,
                          { backgroundColor: colors.secondary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countPillText,
                            { color: colors.foreground },
                          ]}
                        >
                          {`${records.length} item${records.length === 1 ? '' : 's'}`}
                        </Text>
                      </View>
                    </View>

                    {/* 3-record peek */}
                    {peekRecords.length > 0 ? (
                      <View
                        style={[
                          styles.peekList,
                          { borderTopColor: colors.border },
                        ]}
                      >
                        {peekRecords.map((rec) => {
                          const kind = favoriteKind(rec.type, rec.metadata);
                          return (
                            <View key={rec.id} style={styles.peekItem}>
                              <View
                                style={[
                                  styles.peekKindBadge,
                                  { backgroundColor: colors.secondary },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.peekKindText,
                                    { color: colors.mutedForeground },
                                  ]}
                                >
                                  {FAVORITE_KIND_LABELS[kind]}
                                </Text>
                              </View>
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.peekTitle,
                                  { color: colors.foreground },
                                ]}
                              >
                                {rec.title}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : null}
                  </Pressable>

                  <View
                    style={[
                      styles.collectionCardFooter,
                      { borderTopColor: colors.border },
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Edit collection ${nb.name}`}
                      onPress={() => openEditNotebookModal(nb)}
                      style={styles.footerLinkBtn}
                    >
                      <Edit3 size={13} color={colors.mutedForeground} />
                      <Text
                        style={[
                          styles.footerLinkText,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {t('Edit metadata')}
                      </Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`View items in ${nb.name}`}
                      onPress={() =>
                        router.push(`/notebooks/${nb.id}` as never)
                      }
                      style={styles.footerLinkBtn}
                    >
                      <Text
                        style={[
                          styles.footerLinkText,
                          { color: colors.primary },
                        ]}
                      >
                        {t('Open collection')}
                      </Text>
                      <ChevronRight size={14} color={colors.primary} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {renderSharedModals()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  topHeaderText: {
    flex: 1,
    minWidth: 240,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  screenSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  btnIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scopeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  scopeBannerTextCol: {
    flex: 1,
    gap: 2,
  },
  scopeBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  scopeBannerDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  filterToolbar: {
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  statePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kindFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kindChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  kindChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stateCard: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  stateBody: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  collectionGrid: {
    gap: 12,
  },
  collectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  collectionCardPressable: {
    padding: 14,
    gap: 12,
  },
  collectionCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  colorSwatchLarge: {
    width: 14,
    height: 36,
    borderRadius: 6,
  },
  collectionCardHeaderInfo: {
    flex: 1,
    gap: 3,
  },
  collectionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  collectionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  collectionCardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  unreadableBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  peekList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    gap: 6,
  },
  peekItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  peekKindBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  peekKindText: {
    fontSize: 10,
    fontWeight: '600',
  },
  peekTitle: {
    fontSize: 12,
    flex: 1,
  },
  collectionCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailHeader: {
    padding: 16,
  },
  detailTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  collectionBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  collectionBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collectionBannerInfo: {
    flex: 1,
    gap: 2,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  collectionDescription: {
    fontSize: 13,
  },
  recordList: {
    gap: 12,
  },
  recordCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 10,
  },
  recordHeaderMain: {
    flex: 1,
    gap: 4,
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  kindBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  recordSummary: {
    fontSize: 12,
    lineHeight: 17,
  },
  recordBody: {
    borderTopWidth: 1,
    padding: 14,
    gap: 12,
  },
  immutableMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  immutableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  immutableBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  originLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  originLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  promptBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  promptText: {
    fontSize: 13,
  },
  snapshotBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  recordActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  recordActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  recordActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
    gap: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  swatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatchOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  discardConfirmBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  targetCollectionOption: {
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
  targetCollectionName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  exportScroll: {
    maxHeight: 320,
    padding: 16,
  },
  exportPreview: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  modalFooter: {
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
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  primaryBtnSmall: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
