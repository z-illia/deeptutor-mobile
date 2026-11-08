import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  AlertTriangle,
  AtSign,
  BookMarked,
  Check,
  Database,
  FileText,
  History,
  Search,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useI18n } from '../../i18n';
import { useFavorites } from '../favorites/FavoritesProvider';
import { useChat } from './ChatProvider';
import {
  type ContextReferenceItem,
  type ContextReferenceKind,
} from './model';
import {
  WORKSPACE_KNOWLEDGE_BASES,
  WORKSPACE_NOTE_BOOK_REFS,
} from './repository';

type CategoryTab = 'all' | ContextReferenceKind;

const CATEGORY_TABS: { id: CategoryTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'kb', label: 'Knowledge Bases' },
  { id: 'favorite', label: 'Favorites' },
  { id: 'note', label: 'Notes & Books' },
  { id: 'history', label: 'Chat History' },
];

export function ComposerResourcesSheet({
  visible,
  sessionId,
  initialQuery = '',
  onClose,
}: {
  visible: boolean;
  sessionId: string | null;
  initialQuery?: string;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const {
    sessions,
    referenceCatalogState,
    setReferenceCatalogState,
    getReferences,
    addReference,
    removeReference,
  } = useChat();
  const { notebooks, recordsByNotebook } = useFavorites();

  const [category, setCategory] = useState<CategoryTab>('all');
  const [query, setQuery] = useState(initialQuery);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedRefs = getReferences(sessionId);
  const selectedIds = useMemo(
    () => new Set(selectedRefs.map((r) => r.id)),
    [selectedRefs],
  );

  const allCandidates = useMemo<ContextReferenceItem[]>(() => {
    const favoriteItems: ContextReferenceItem[] = [];
    for (const nb of notebooks) {
      if (nb.unreadable) continue;
      for (const rec of recordsByNotebook[nb.id] ?? []) {
        favoriteItems.push({
          id: `ref-fav-${rec.id}`,
          kind: 'favorite',
          label: rec.title,
          subtitle: `${nb.name} · ${rec.summary ?? 'Saved Original'}`,
          sourceId: rec.id,
          status: 'valid',
        });
      }
    }

    const historyItems: ContextReferenceItem[] = sessions
      .filter((s) => !s.preferences?.archived && s.session_id !== sessionId)
      .slice(0, 6)
      .map((s) => ({
        id: `ref-hist-${s.session_id}`,
        kind: 'history',
        label: s.title,
        subtitle: s.last_message_preview.slice(0, 72),
        sourceId: s.session_id,
        status: 'valid',
      }));

    return [
      ...WORKSPACE_KNOWLEDGE_BASES,
      ...favoriteItems,
      ...WORKSPACE_NOTE_BOOK_REFS,
      ...historyItems,
    ];
  }, [notebooks, recordsByNotebook, sessionId, sessions]);

  const filteredCandidates = useMemo(() => {
    if (referenceCatalogState === 'empty') return [];
    const needle = query.trim().toLowerCase();
    return allCandidates.filter((item) => {
      if (category !== 'all' && item.kind !== category) return false;
      if (!needle) return true;
      return `${item.label} ${item.subtitle ?? ''}`
        .toLowerCase()
        .includes(needle);
    });
  }, [allCandidates, category, query, referenceCatalogState]);

  const handleToggleItem = (item: ContextReferenceItem) => {
    setValidationError(null);
    if (selectedIds.has(item.id)) {
      removeReference(sessionId, item.id);
      return;
    }
    const res = addReference(sessionId, item);
    if (!res.ok) {
      setValidationError(res.error ?? 'Reference is unavailable.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={t('Close reference picker backdrop')}
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.header, { borderBottomColor: colors.border }]}
          >
            <View style={styles.headerTitleRow}>
              <AtSign size={18} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                {t('Reference Context (@mention)')}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text
                  style={[styles.countBadgeText, { color: colors.foreground }]}
                >
                  {t("{value1} selected", { value1: String(selectedRefs.length) })}
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Close reference picker')}
              onPress={onClose}
            >
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.toolbar}>
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Search size={15} color={colors.mutedForeground} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t(
                  'Search Knowledge Bases, Favorites, Notes, or Chat History...',
                )}
                placeholderTextColor={colors.mutedForeground}
                accessibilityLabel={t('Search context references')}
                style={[styles.searchInput, { color: colors.foreground }]}
              />
              {query ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Clear reference search')}
                  onPress={() => setQuery('')}
                >
                  <X size={14} color={colors.mutedForeground} />
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {CATEGORY_TABS.map((tab) => {
                const active = category === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={t("Filter references by {value1}", { value1: String(tab.label) })}
                    onPress={() => setCategory(tab.id)}
                    style={[
                      styles.categoryChip,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active
                          ? colors.primary
                          : colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: active
                            ? colors.primaryForeground
                            : colors.foreground,
                        },
                      ]}
                    >
                      {t(tab.label)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text
              style={[styles.scopeHint, { color: colors.mutedForeground }]}
            >
              {t(
                'Read-only reference selection — Knowledge Base creation and indexing remain on the desktop web app.',
              )}
            </Text>
          </View>

          {validationError ? (
            <View
              style={[
                styles.errorBanner,
                {
                  borderColor: colors.destructive,
                  backgroundColor: colors.secondary,
                },
              ]}
            >
              <AlertTriangle size={14} color={colors.destructive} />
              <Text
                style={[styles.errorBannerText, { color: colors.destructive }]}
              >
                {t(validationError)}
              </Text>
            </View>
          ) : null}

          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {referenceCatalogState === 'loading' ? (
              <View style={styles.stateBox}>
                <Text
                  style={[styles.stateTitle, { color: colors.foreground }]}
                >
                  {t('Loading workspace references...')}
                </Text>
              </View>
            ) : referenceCatalogState === 'error' ? (
              <View style={styles.stateBox}>
                <AlertTriangle size={22} color={colors.destructive} />
                <Text
                  style={[styles.stateTitle, { color: colors.foreground }]}
                >
                  {t('Unable to load reference catalog')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Retry loading references')}
                  onPress={() => setReferenceCatalogState('ready')}
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
                    {t('Retry')}
                  </Text>
                </Pressable>
              </View>
            ) : filteredCandidates.length === 0 ? (
              <View style={styles.stateBox}>
                <Text
                  style={[styles.stateTitle, { color: colors.foreground }]}
                >
                  {t('No matching references found')}
                </Text>
                <Text
                  style={[
                    styles.stateSubtitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {t('Try another category tab or search keyword.')}
                </Text>
              </View>
            ) : (
              filteredCandidates.map((item) => {
                const selected = selectedIds.has(item.id);
                const unavailable = item.status === 'unavailable';
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={t("Select reference {value1}", { value1: String(item.label) })}
                    onPress={() => handleToggleItem(item)}
                    style={[
                      styles.itemRow,
                      {
                        borderColor: selected
                          ? colors.primary
                          : unavailable
                            ? colors.destructive
                            : colors.border,
                        backgroundColor: selected
                          ? colors.secondary
                          : colors.background,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: colors.secondary },
                      ]}
                    >
                      {item.kind === 'kb' ? (
                        <Database size={15} color={colors.primary} />
                      ) : item.kind === 'favorite' ? (
                        <BookMarked size={15} color={colors.primary} />
                      ) : item.kind === 'history' ? (
                        <History size={15} color={colors.primary} />
                      ) : (
                        <FileText size={15} color={colors.primary} />
                      )}
                    </View>
                    <View style={styles.itemInfo}>
                      <View style={styles.itemTitleRow}>
                        <Text
                          style={[
                            styles.itemLabel,
                            { color: colors.foreground },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {unavailable ? (
                          <View
                            style={[
                              styles.unavailablePill,
                              { backgroundColor: colors.secondary },
                            ]}
                          >
                            <Text
                              style={[
                                styles.unavailablePillText,
                                { color: colors.destructive },
                              ]}
                            >
                              {t('Unavailable')}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      {item.subtitle ? (
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.itemSubtitle,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {item.subtitle}
                        </Text>
                      ) : null}
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
                        <Check size={12} color={colors.primaryForeground} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View style={styles.stateSwitchRow}>
              {(['ready', 'loading', 'empty', 'error'] as const).map((st) => (
                <Pressable
                  key={st}
                  accessibilityRole="button"
                  accessibilityLabel={t("Reference catalog state {value1}", { value1: String(st) })}
                  onPress={() => setReferenceCatalogState(st)}
                  style={[
                    styles.miniStateBtn,
                    {
                      borderColor:
                        referenceCatalogState === st
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniStateText,
                      {
                        color:
                          referenceCatalogState === st
                            ? colors.primary
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {st}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Done selecting references')}
              onPress={onClose}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
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
  sheet: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '86%',
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
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  toolbar: {
    padding: 14,
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
    fontSize: 13,
    paddingVertical: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scopeHint: {
    fontSize: 11,
    lineHeight: 15,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  listScroll: {
    maxHeight: 340,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 11,
  },
  unavailablePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  unavailablePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateBox: {
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  stateSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  stateSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniStateBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  miniStateText: {
    fontSize: 10,
    fontWeight: '600',
  },
  primaryBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
