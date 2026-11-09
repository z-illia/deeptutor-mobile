import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  AlertTriangle,
  ArrowLeft,
  BookMarked,
  BookOpen,
  Check,
  Copy,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useI18n } from '../../i18n';
import { useFavorites } from '../favorites/FavoritesProvider';
import { ChatMarkdown } from './ChatMarkdown';
import { useChat } from './ChatProvider';
import {
  formatBytes,
  previewKindFor,
  type FilePreviewSource,
} from './model';

type PreviewLoadState = 'ready' | 'loading' | 'empty' | 'error';

export function FilePreviewScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{
    fileId?: string;
    state?: string;
    sessionId?: string;
  }>();

  const { previewFiles, activePreviewFile, openFilePreview } = useChat();
  const { openSaveModal } = useFavorites();

  const [loadState, setLoadState] = useState<PreviewLoadState>(() =>
    params.state === 'loading' ||
    params.state === 'empty' ||
    params.state === 'error' ||
    params.state === 'ready'
      ? params.state
      : 'ready',
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    params.fileId ?? null,
  );
  const [zoomPercent, setZoomPercent] = useState(100);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.fileId) {
      openFilePreview(params.fileId);
    }
  }, [openFilePreview, params.fileId]);

  const currentFile: FilePreviewSource | null = useMemo(() => {
    const lookupId = selectedFileId ?? params.fileId;
    if (lookupId) {
      return (
        previewFiles.find((f) => f.id === lookupId) ??
        previewFiles.find((f) => f.filename === lookupId) ??
        activePreviewFile
      );
    }
    return activePreviewFile ?? previewFiles[0] ?? null;
  }, [activePreviewFile, params.fileId, previewFiles, selectedFileId]);

  const kind = useMemo(
    () =>
      currentFile
        ? previewKindFor(currentFile.filename, currentFile.mimeType)
        : 'fallback',
    [currentFile],
  );

  const handleBack = () => {
    if (params.sessionId) {
      router.push(`/chat/${encodeURIComponent(params.sessionId)}` as never);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/chat' as never);
    }
  };

  const handleCopyContent = async () => {
    if (!currentFile?.content) return;
    await Clipboard.setStringAsync(currentFile.content);
    setCopied(true);
    setActionNotice(`Copied ${currentFile.filename} content to clipboard.`);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!currentFile) return;
    setActionNotice(
      `Prepared local download for "${currentFile.filename}" (${formatBytes(currentFile.sizeBytes)}).`,
    );
  };

  const handleSaveToFavorites = () => {
    if (!currentFile) return;
    openSaveModal({
      payload: {
        recordType: 'chat',
        title: `File Snapshot: ${currentFile.filename}`,
        userQuery: `File preview (${currentFile.mimeType})`,
        summary: `${kind.toUpperCase()} · ${formatBytes(currentFile.sizeBytes)}`,
        output:
          currentFile.content ??
          `Binary artifact \`${currentFile.filename}\` (${formatBytes(currentFile.sizeBytes)})`,
        metadata: {
          session_id: currentFile.ownerSessionId ?? params.sessionId,
          filename: currentFile.filename,
        },
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Back from file preview')}
          onPress={handleBack}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} color={colors.foreground} />
          <Text style={[styles.backBtnText, { color: colors.foreground }]}>
            {t('Back')}
          </Text>
        </Pressable>

        <View style={styles.titleBlock}>
          <Text
            numberOfLines={1}
            style={[styles.fileTitle, { color: colors.foreground }]}
          >
            {currentFile?.filename ?? t('No file selected')}
          </Text>
          {currentFile ? (
            <View style={styles.metaBadgesRow}>
              <View
                style={[
                  styles.kindBadge,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text
                  style={[styles.kindBadgeText, { color: colors.primary }]}
                >
                  {kind.toUpperCase()}
                </Text>
              </View>
              <Text
                style={[styles.metaSubText, { color: colors.mutedForeground }]}
              >
                {`${currentFile.mimeType} · ${formatBytes(currentFile.sizeBytes)} · ${currentFile.origin}`}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.topActions}>
          {currentFile?.content ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Copy file content')}
              onPress={handleCopyContent}
              style={[styles.actionBtn, { borderColor: colors.border }]}
            >
              {copied ? (
                <Check size={14} color={colors.primary} />
              ) : (
                <Copy size={14} color={colors.foreground} />
              )}
              <Text
                style={[styles.actionBtnText, { color: colors.foreground }]}
              >
                {copied ? t('Copied') : t('Copy')}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Download file')}
            onPress={handleDownload}
            style={[styles.actionBtn, { borderColor: colors.border }]}
          >
            <Download size={14} color={colors.foreground} />
            <Text style={[styles.actionBtnText, { color: colors.foreground }]}>
              {t('Download')}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Save file to Favorites')}
            onPress={handleSaveToFavorites}
            style={[styles.actionBtn, { borderColor: colors.border }]}
          >
            <BookMarked size={14} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.foreground }]}>
              {t('Save')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* File Selector Strip & State Switcher */}
      <View
        style={[
          styles.selectorStrip,
          { borderBottomColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fileChipRow}
        >
          {previewFiles.map((f) => {
            const active = currentFile?.id === f.id;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t("Preview file {value1}", { value1: String(f.filename) })}
                onPress={() => {
                  setSelectedFileId(f.id);
                  openFilePreview(f);
                  setLoadState('ready');
                  setActionNotice(null);
                }}
                style={[
                  styles.fileChip,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active
                      ? colors.secondary
                      : colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fileChipText,
                    { color: active ? colors.primary : colors.foreground },
                  ]}
                >
                  {f.filename}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.stateRow}>
          {(['ready', 'loading', 'empty', 'error'] as const).map((st) => {
            const active = loadState === st;
            return (
              <Pressable
                key={st}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t("Preview state {value1}", { value1: String(st) })}
                onPress={() => setLoadState(st)}
                style={[
                  styles.stateChip,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active
                      ? colors.secondary
                      : colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stateChipText,
                    {
                      color: active ? colors.primary : colors.mutedForeground,
                    },
                  ]}
                >
                  {t("State: {value1}", { value1: String(st) })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {actionNotice ? (
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
            {t(actionNotice)}
          </Text>
        </View>
      ) : null}

      {/* Main Preview Body */}
      <ScrollView contentContainerStyle={styles.bodyScroll}>
        {loadState === 'loading' ? (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.stateTitle, { color: colors.foreground }]}>
              {t('Loading file preview...')}
            </Text>
            <Text
              style={[styles.stateSub, { color: colors.mutedForeground }]}
            >
              {t('Preparing structured renderer and byte stream.')}
            </Text>
          </View>
        ) : loadState === 'error' ? (
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
              {t('Failed to render file preview')}
            </Text>
            <Text
              style={[styles.stateSub, { color: colors.mutedForeground }]}
            >
              {t('The attachment stream was interrupted or corrupted.')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Retry file preview')}
              onPress={() => setLoadState('ready')}
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
        ) : loadState === 'empty' || !currentFile ? (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <FileText size={24} color={colors.mutedForeground} />
            <Text style={[styles.stateTitle, { color: colors.foreground }]}>
              {t('No file selected for preview')}
            </Text>
            <Text
              style={[styles.stateSub, { color: colors.mutedForeground }]}
            >
              {t('Choose an attachment or generated artifact from the bar above.')}
            </Text>
          </View>
        ) : kind === 'markdown' ? (
          <View
            style={[
              styles.previewSurface,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ChatMarkdown content={currentFile.content ?? ''} />
          </View>
        ) : kind === 'code' || kind === 'text' ? (
          <View
            style={[
              styles.previewSurface,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.surfaceHeaderRow}>
              <FileCode size={15} color={colors.primary} />
              <Text
                style={[styles.surfaceHeaderText, { color: colors.foreground }]}
              >
                {t("{value1} ({value2} lines)", { value1: String(currentFile.filename), value2: String((currentFile.content ?? '').split('\n').length) })}
              </Text>
            </View>
            {(currentFile.content ?? '').split('\n').map((line, idx) => (
              <View key={`line-${idx}`} style={styles.codeLineRow}>
                <Text
                  style={[styles.codeLineNum, { color: colors.mutedForeground }]}
                >
                  {String(idx + 1).padStart(2, ' ')}
                </Text>
                <Text
                  style={[styles.codeLineText, { color: colors.foreground }]}
                >
                  {line}
                </Text>
              </View>
            ))}
          </View>
        ) : kind === 'pdf' ? (
          <View
            style={[
              styles.previewSurface,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.pdfToolbar}>
              <Text
                style={[styles.surfaceHeaderText, { color: colors.foreground }]}
              >
                {t("PDF Document · Page {value1} of 32 · Zoom {value2}%", { value1: String(currentFile.pageNumber ?? 1), value2: String(zoomPercent) })}
              </Text>
              <View style={styles.pdfActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Zoom out PDF')}
                  onPress={() => setZoomPercent((z) => Math.max(50, z - 25))}
                  style={[styles.iconChip, { borderColor: colors.border }]}
                >
                  <ZoomOut size={14} color={colors.foreground} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Zoom in PDF')}
                  onPress={() => setZoomPercent((z) => Math.min(200, z + 25))}
                  style={[styles.iconChip, { borderColor: colors.border }]}
                >
                  <ZoomIn size={14} color={colors.foreground} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Open in Immersive Reading')}
                  onPress={() =>
                    setActionNotice(
                      'Immersive Reading PDF study workspace opens in M5 (MS-READING).',
                    )
                  }
                  style={[styles.actionBtn, { borderColor: colors.primary }]}
                >
                  <BookOpen size={13} color={colors.primary} />
                  <Text
                    style={[styles.actionBtnText, { color: colors.primary }]}
                  >
                    {t('Open in Immersive Reading')}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View
              style={[
                styles.pdfPageSheet,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.pdfPageText, { color: colors.foreground }]}>
                {currentFile.content}
              </Text>
            </View>
          </View>
        ) : kind === 'xlsx' ? (
          <View
            style={[
              styles.previewSurface,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.surfaceHeaderRow}>
              <FileSpreadsheet size={15} color={colors.primary} />
              <Text
                style={[styles.surfaceHeaderText, { color: colors.foreground }]}
              >
                {t("Spreadsheet Grid · {value1} rows", { value1: String(currentFile.tableRows?.length ?? 0) })}
              </Text>
            </View>
            <View
              style={[styles.tableGrid, { borderColor: colors.border }]}
            >
              {(currentFile.tableRows ?? []).map((row, rIdx) => (
                <View
                  key={`row-${rIdx}`}
                  style={[
                    styles.tableRow,
                    {
                      borderBottomColor: colors.border,
                      backgroundColor:
                        rIdx === 0 ? colors.secondary : 'transparent',
                    },
                  ]}
                >
                  {row.map((cell, cIdx) => (
                    <Text
                      key={`cell-${rIdx}-${cIdx}`}
                      style={[
                        styles.tableCell,
                        {
                          color: colors.foreground,
                          fontWeight: rIdx === 0 ? '700' : '400',
                        },
                      ]}
                    >
                      {cell}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>
        ) : kind === 'svg' || kind === 'image' ? (
          <View
            style={[
              styles.previewSurface,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.pdfToolbar}>
              <View style={styles.surfaceHeaderRow}>
                <ImageIcon size={15} color={colors.primary} />
                <Text
                  style={[
                    styles.surfaceHeaderText,
                    { color: colors.foreground },
                  ]}
                >
                  {`${kind === 'svg' ? 'Vector Diagram (SVG)' : 'Raster Image'} · ${zoomPercent}%`}
                </Text>
              </View>
              <View style={styles.pdfActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Zoom out image')}
                  onPress={() => setZoomPercent((z) => Math.max(50, z - 25))}
                  style={[styles.iconChip, { borderColor: colors.border }]}
                >
                  <ZoomOut size={14} color={colors.foreground} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Zoom in image')}
                  onPress={() => setZoomPercent((z) => Math.min(200, z + 25))}
                  style={[styles.iconChip, { borderColor: colors.border }]}
                >
                  <ZoomIn size={14} color={colors.foreground} />
                </Pressable>
              </View>
            </View>
            <View
              style={[
                styles.visualCanvas,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <ImageIcon size={36} color={colors.primary} />
              <Text
                style={[styles.canvasTitle, { color: colors.foreground }]}
              >
                {currentFile.filename}
              </Text>
              <Text
                style={[styles.canvasCaption, { color: colors.mutedForeground }]}
              >
                {currentFile.content ??
                  'Visual diagram rendered at native aspect ratio.'}
              </Text>
            </View>
          </View>
        ) : kind === 'docx' || kind === 'office-text' ? (
          <View
            style={[
              styles.previewSurface,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.surfaceHeaderRow}>
              <FileText size={15} color={colors.primary} />
              <Text
                style={[styles.surfaceHeaderText, { color: colors.foreground }]}
              >
                {t("Office Document Extract ({value1})", { value1: String(currentFile.filename) })}
              </Text>
            </View>
            <Text style={[styles.pdfPageText, { color: colors.foreground }]}>
              {currentFile.content}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.stateCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <FileText size={24} color={colors.mutedForeground} />
            <Text style={[styles.stateTitle, { color: colors.foreground }]}>
              {t('Binary Format — No Inline Preview')}
            </Text>
            <Text
              style={[styles.stateSub, { color: colors.mutedForeground }]}
            >
              {t("File \"{value1}\" ({value2}, {value3}) cannot be rendered inline. Use Download to inspect locally.", { value1: String(currentFile.filename), value2: String(currentFile.mimeType), value3: String(formatBytes(currentFile.sizeBytes)) })}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Download binary file')}
              onPress={handleDownload}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.primaryBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                {t('Download File')}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  titleBlock: {
    flex: 1,
    minWidth: 180,
    gap: 3,
  },
  fileTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  kindBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  kindBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaSubText: {
    fontSize: 11,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectorStrip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  fileChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  fileChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  stateChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  stateChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noticeBanner: {
    marginHorizontal: 14,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bodyScroll: {
    padding: 14,
    paddingBottom: 36,
  },
  previewSurface: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  surfaceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  surfaceHeaderText: {
    fontSize: 13,
    fontWeight: '700',
  },
  codeLineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  codeLineNum: {
    fontSize: 12,
    fontFamily: 'monospace',
    minWidth: 24,
  },
  codeLineText: {
    fontSize: 12,
    fontFamily: 'monospace',
    flex: 1,
  },
  pdfToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  pdfActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  iconChip: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfPageSheet: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  pdfPageText: {
    fontSize: 13,
    lineHeight: 20,
  },
  tableGrid: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
  },
  visualCanvas: {
    padding: 28,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  canvasTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  canvasCaption: {
    fontSize: 12,
    textAlign: 'center',
  },
  stateCard: {
    padding: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  stateSub: {
    fontSize: 13,
    textAlign: 'center',
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
});
