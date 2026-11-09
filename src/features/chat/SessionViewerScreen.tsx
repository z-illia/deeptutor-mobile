import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BookMarked,
  Cpu,
  Database,
  ExternalLink,
  FileCode,
  FileText,
  Globe,
  HelpCircle,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useI18n } from '../../i18n';
import { useFavorites } from '../favorites/FavoritesProvider';
import { CapabilityConfigCard } from './CapabilityConfigCard';
import { ChatMarkdown } from './ChatMarkdown';
import { useChat } from './ChatProvider';
import {
  buildSessionActivity,
  buildVisiblePath,
  formatBytes,
  previewKindFor,
} from './model';

export function SessionViewerScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string; state?: string }>();

  const {
    messagesBySession,
    getSelectedBranches,
    getReferences,
    getActiveCapability,
    setActiveCapability,
    getViewerTabs,
    getActiveViewerTabId,
    getClosedViewerTabs,
    openViewerTab,
    closeViewerTab,
    selectViewerTab,
    reopenClosedViewerTab,
    getMarkdownScratchpad,
    setMarkdownScratchpad,
    quizFollowupByQuestion,
    sendQuizFollowup,
    previewFiles,
  } = useChat();
  const { openSaveModal } = useFavorites();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    params.sessionId !== undefined ? params.sessionId : 'session-general-1',
  );
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [simulateEmptyActivity, setSimulateEmptyActivity] = useState(
    params.state === 'empty',
  );
  const [scratchpadPreviewMode, setScratchpadPreviewMode] = useState(false);
  const [webUrlDraft, setWebUrlDraft] = useState(
    'https://ocw.mit.edu/courses/18-06-linear-algebra/',
  );
  const [committedWebUrl, setCommittedWebUrl] = useState(
    'https://ocw.mit.edu/courses/18-06-linear-algebra/',
  );
  const [followupDraft, setFollowupDraft] = useState('');

  const tabs = getViewerTabs(selectedSessionId);
  const activeTabId = getActiveViewerTabId(selectedSessionId);
  const closedTabs = getClosedViewerTabs(selectedSessionId);
  const activeTab =
    tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  const visibleMessages = useMemo(() => {
    if (!selectedSessionId || simulateEmptyActivity) return [];
    const list = messagesBySession[selectedSessionId] ?? [];
    const branches = getSelectedBranches(selectedSessionId);
    return buildVisiblePath(list, branches).messages;
  }, [
    getSelectedBranches,
    messagesBySession,
    selectedSessionId,
    simulateEmptyActivity,
  ]);

  const activitySummary = useMemo(
    () =>
      buildSessionActivity(
        visibleMessages,
        simulateEmptyActivity ? [] : getReferences(selectedSessionId),
        getActiveCapability(selectedSessionId),
      ),
    [
      getActiveCapability,
      getReferences,
      selectedSessionId,
      simulateEmptyActivity,
      visibleMessages,
    ],
  );

  const isEmptyActivity =
    activitySummary.toolsUsed.length === 0 &&
    activitySummary.knowledgeBases.length === 0 &&
    activitySummary.spaceReferences.length === 0 &&
    activitySummary.artifacts.length === 0 &&
    activitySummary.attachments.length === 0;

  const handleBackToChat = () => {
    if (selectedSessionId) {
      router.push(`/chat/${encodeURIComponent(selectedSessionId)}` as never);
    } else {
      router.push('/chat' as never);
    }
  };

  const handleSaveScratchpadToFavorites = () => {
    const text = getMarkdownScratchpad(selectedSessionId);
    openSaveModal({
      payload: {
        recordType: 'chat',
        title: 'Session Scratchpad Snapshot',
        userQuery: 'Markdown scratchpad note',
        summary: 'Captured from Session Viewer scratchpad',
        output: text,
        metadata: {
          session_id: selectedSessionId ?? undefined,
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
          accessibilityLabel={t('Back to Chat from Session Viewer')}
          onPress={handleBackToChat}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} color={colors.foreground} />
          <Text style={[styles.backBtnText, { color: colors.foreground }]}>
            {t('Back to Chat')}
          </Text>
        </Pressable>

        <View style={styles.titleRow}>
          <Activity size={17} color={colors.primary} />
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>
            {t('Session Viewer')}
          </Text>
        </View>

        <View style={styles.sessionSwitchRow}>
          {[
            { id: 'session-general-1', label: 'Fourier Session' },
            { id: 'session-general-2', label: 'Eigenvalues Session' },
          ].map((item) => {
            const active = selectedSessionId === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t("Switch Session Viewer to {value1}", { value1: t(item.label) })}
                onPress={() => {
                  setSelectedSessionId(item.id);
                  setSimulateEmptyActivity(false);
                }}
                style={[
                  styles.sessionPill,
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
                    styles.sessionPillText,
                    { color: active ? colors.primary : colors.foreground },
                  ]}
                >
                  {t(item.label)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Browser-Style Viewer Tab Bar */}
      <View
        style={[
          styles.tabStrip,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabStripContent}
        >
          {tabs.map((tab) => {
            const active = tab.id === activeTab.id;
            return (
              <View
                key={tab.id}
                style={[
                  styles.tabItem,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active
                      ? colors.secondary
                      : colors.background,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={t("Select viewer tab {value1}", { value1: tab.kind === 'activity' ? t(tab.title) : tab.title })}
                  onPress={() => selectViewerTab(selectedSessionId, tab.id)}
                  style={styles.tabMain}
                >
                  <Text
                    style={[
                      styles.tabTitle,
                      { color: active ? colors.primary : colors.foreground },
                    ]}
                  >
                    {tab.kind === 'activity' ? t(tab.title) : tab.title}
                  </Text>
                </Pressable>
                {tab.closable ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("Close viewer tab {value1}", { value1: tab.kind === 'activity' ? t(tab.title) : tab.title })}
                    onPress={() => closeViewerTab(selectedSessionId, tab.id)}
                    style={styles.tabCloseBtn}
                  >
                    <X size={12} color={colors.mutedForeground} />
                  </Pressable>
                ) : null}
              </View>
            );
          })}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Open viewer tab launcher')}
            onPress={() => setLauncherOpen((v) => !v)}
            style={[styles.addTabBtn, { borderColor: colors.border }]}
          >
            <Plus size={14} color={colors.foreground} />
            <Text style={[styles.addTabText, { color: colors.foreground }]}>
              {t('Open tab')}
            </Text>
          </Pressable>

          {closedTabs.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Reopen closed tab')}
              onPress={() => reopenClosedViewerTab(selectedSessionId)}
              style={[styles.reopenBtn, { borderColor: colors.primary }]}
            >
              <RotateCcw size={12} color={colors.primary} />
              <Text style={[styles.reopenBtnText, { color: colors.primary }]}>
                {t("Reopen ({value1})", { value1: String(closedTabs[0].title) })}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>

      {/* Viewer Launcher Menu */}
      {launcherOpen ? (
        <View
          style={[
            styles.launcherMenu,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.launcherHeader, { color: colors.foreground }]}>
            {t('Launch Viewer Surface')}
          </Text>
          <View style={styles.launcherGrid}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Launch Markdown Scratchpad tab')}
              onPress={() => {
                openViewerTab(selectedSessionId, {
                  id: 'tab-markdown-note',
                  kind: 'markdown-note',
                  title: 'Scratchpad.md',
                  closable: true,
                });
                setLauncherOpen(false);
              }}
              style={[styles.launcherOption, { borderColor: colors.border }]}
            >
              <FileText size={14} color={colors.primary} />
              <Text
                style={[styles.launcherOptionText, { color: colors.foreground }]}
              >
                {t('Markdown Scratchpad')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Launch File tab')}
              onPress={() => {
                openViewerTab(selectedSessionId, {
                  id: 'tab-file-fourier',
                  kind: 'file',
                  title: 'fourier_derivation.md',
                  closable: true,
                  fileId: 'file-fourier-md',
                });
                setLauncherOpen(false);
              }}
              style={[styles.launcherOption, { borderColor: colors.border }]}
            >
              <FileCode size={14} color={colors.primary} />
              <Text
                style={[styles.launcherOptionText, { color: colors.foreground }]}
              >
                {t('File Tab (fourier_derivation.md)')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Launch Web Reference tab')}
              onPress={() => {
                openViewerTab(selectedSessionId, {
                  id: 'tab-web-ref',
                  kind: 'web',
                  title: 'MIT 18.06 Web Reference',
                  closable: true,
                  url: committedWebUrl,
                });
                setLauncherOpen(false);
              }}
              style={[styles.launcherOption, { borderColor: colors.border }]}
            >
              <Globe size={14} color={colors.primary} />
              <Text
                style={[styles.launcherOptionText, { color: colors.foreground }]}
              >
                {t('Web Reference Tab')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Launch Quiz Follow-up tab')}
              onPress={() => {
                openViewerTab(selectedSessionId, {
                  id: 'tab-quiz-followup-quiz-q1',
                  kind: 'quiz-followup',
                  title: 'Quiz Q1 Follow-up',
                  closable: true,
                  quizQuestionId: 'quiz-q1',
                  quizQuestionPrompt:
                    'For the matrix A = [[4, 1], [2, 3]], what is the sum of its eigenvalues λ₁ + λ₂?',
                });
                setLauncherOpen(false);
              }}
              style={[styles.launcherOption, { borderColor: colors.border }]}
            >
              <MessageSquare size={14} color={colors.primary} />
              <Text
                style={[styles.launcherOptionText, { color: colors.foreground }]}
              >
                {t('Quiz Follow-up Tab')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Launch Unsupported Partner tab')}
              onPress={() => {
                openViewerTab(selectedSessionId, {
                  id: 'tab-unsupported-partner',
                  kind: 'unsupported',
                  title: 'Partner Subagent',
                  closable: true,
                  unsupportedReason:
                    'Partner consultation and subagent management tabs are desktop-only in DeepTutor Mobile.',
                });
                setLauncherOpen(false);
              }}
              style={[styles.launcherOption, { borderColor: colors.border }]}
            >
              <AlertTriangle size={14} color={colors.destructive} />
              <Text
                style={[styles.launcherOptionText, { color: colors.foreground }]}
              >
                {t('Partner Tab (Unsupported State)')}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Active Tab Content */}
      <ScrollView contentContainerStyle={styles.bodyScroll}>
        {activeTab.kind === 'activity' ? (
          <View style={styles.activityBody}>
            {/* Capability Switcher & Embedded CapabilityConfigCard */}
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Sparkles size={15} color={colors.primary} />
                  <Text
                    style={[styles.sectionTitle, { color: colors.foreground }]}
                  >
                    {t('Active Capability & Parameters')}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    simulateEmptyActivity
                      ? t('Show Populated Activity')
                      : t('Simulate Empty Activity')
                  }
                  onPress={() => setSimulateEmptyActivity((v) => !v)}
                  style={[
                    styles.miniToggleBtn,
                    {
                      borderColor: simulateEmptyActivity
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniToggleText,
                      {
                        color: simulateEmptyActivity
                          ? colors.primary
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {simulateEmptyActivity
                      ? t('Show Populated Activity')
                      : t('Simulate Empty Activity')}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.capSwitchRow}>
                {[
                  { id: 'chat', label: 'Standard Chat' },
                  { id: 'question', label: 'Quiz Generation' },
                  { id: 'research', label: 'Deep Research' },
                ].map((cap) => {
                  const active =
                    getActiveCapability(selectedSessionId) === cap.id;
                  return (
                    <Pressable
                      key={cap.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={t("Select capability {value1}", { value1: String(cap.label) })}
                      onPress={() =>
                        setActiveCapability(selectedSessionId, cap.id)
                      }
                      style={[
                        styles.capPill,
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
                          styles.capPillText,
                          {
                            color: active
                              ? colors.primaryForeground
                              : colors.foreground,
                          },
                        ]}
                      >
                        {cap.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <CapabilityConfigCard sessionId={selectedSessionId} />
            </View>

            {isEmptyActivity ? (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Activity size={24} color={colors.mutedForeground} />
                <Text
                  style={[styles.emptyTitle, { color: colors.foreground }]}
                >
                  {t('No session activity recorded yet')}
                </Text>
                <Text
                  style={[
                    styles.emptySub,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {t(
                    'Tools, Knowledge Bases, @mention references, and generated artifacts appear here as the conversation progresses.',
                  )}
                </Text>
              </View>
            ) : (
              <>
                {/* Tools Used */}
                <View
                  style={[
                    styles.sectionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.sectionTitleGroup}>
                    <Cpu size={15} color={colors.primary} />
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: colors.foreground },
                      ]}
                    >
                      {t("Tools & Capabilities Used ({value1})", { value1: String(activitySummary.toolsUsed.length) })}
                    </Text>
                  </View>
                  <View style={styles.badgeWrap}>
                    {activitySummary.toolsUsed.map((tool) => (
                      <View
                        key={tool}
                        style={[
                          styles.toolBadge,
                          {
                            backgroundColor: colors.secondary,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.toolBadgeText,
                            { color: colors.foreground },
                          ]}
                        >
                          {tool}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Knowledge Bases & Space References */}
                <View
                  style={[
                    styles.sectionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.sectionTitleGroup}>
                    <Database size={15} color={colors.primary} />
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: colors.foreground },
                      ]}
                    >
                      {t("Referenced Context ({value1})", { value1: String(activitySummary.knowledgeBases.length + activitySummary.spaceReferences.length) })}
                    </Text>
                  </View>
                  {[
                    ...activitySummary.knowledgeBases,
                    ...activitySummary.spaceReferences,
                  ].map((ref) => (
                    <View
                      key={ref.id}
                      style={[
                        styles.refRow,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.refTextCol}>
                        <Text
                          style={[
                            styles.refLabel,
                            { color: colors.foreground },
                          ]}
                        >
                          {ref.label}
                        </Text>
                        {ref.subtitle ? (
                          <Text
                            style={[
                              styles.refSub,
                              { color: colors.mutedForeground },
                            ]}
                          >
                            {ref.subtitle}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.kindBadge,
                          { backgroundColor: colors.secondary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.kindBadgeText,
                            { color: colors.primary },
                          ]}
                        >
                          {ref.kind.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Generated Artifacts & Attachments */}
                <View
                  style={[
                    styles.sectionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.sectionTitleGroup}>
                    <FileCode size={15} color={colors.primary} />
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: colors.foreground },
                      ]}
                    >
                      {t("Session Artifacts & Files ({value1})", { value1: String(activitySummary.artifacts.length) })}
                    </Text>
                  </View>
                  {activitySummary.artifacts.map((art) => {
                    const pKind = previewKindFor(art.filename, art.mimeType);
                    return (
                      <View
                        key={art.id}
                        style={[
                          styles.artifactRow,
                          {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.refTextCol}>
                          <Text
                            style={[
                              styles.refLabel,
                              { color: colors.foreground },
                            ]}
                          >
                            {art.filename}
                          </Text>
                          <Text
                            style={[
                              styles.refSub,
                              { color: colors.mutedForeground },
                            ]}
                          >
                            {`${pKind.toUpperCase()} · ${formatBytes(art.sizeBytes)}`}
                          </Text>
                        </View>
                        <View style={styles.artifactBtns}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("Open {value1} in tab", { value1: String(art.filename) })}
                            onPress={() =>
                              openViewerTab(selectedSessionId, {
                                id: `tab-file-${art.id}`,
                                kind: 'file',
                                title: art.filename,
                                closable: true,
                                fileId: art.id,
                              })
                            }
                            style={[
                              styles.smallActionBtn,
                              { borderColor: colors.border },
                            ]}
                          >
                            <Text
                              style={[
                                styles.smallActionText,
                                { color: colors.foreground },
                              ]}
                            >
                              {t('Open Tab')}
                            </Text>
                          </Pressable>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("Preview {value1}", { value1: String(art.filename) })}
                            onPress={() =>
                              router.push(
                                `/ui/file-preview?fileId=${encodeURIComponent(art.id)}&sessionId=${encodeURIComponent(selectedSessionId ?? '')}` as never,
                              )
                            }
                            style={[
                              styles.smallActionBtn,
                              { borderColor: colors.primary },
                            ]}
                          >
                            <ExternalLink size={12} color={colors.primary} />
                            <Text
                              style={[
                                styles.smallActionText,
                                { color: colors.primary },
                              ]}
                            >
                              {t('File Preview')}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        ) : activeTab.kind === 'markdown-note' ? (
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <FileText size={15} color={colors.primary} />
                <Text
                  style={[styles.sectionTitle, { color: colors.foreground }]}
                >
                  {t('Session Markdown Scratchpad')}
                </Text>
              </View>
              <View style={styles.artifactBtns}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Toggle scratchpad preview')}
                  onPress={() => setScratchpadPreviewMode((v) => !v)}
                  style={[
                    styles.smallActionBtn,
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.smallActionText,
                      { color: colors.foreground },
                    ]}
                  >
                    {scratchpadPreviewMode ? t('Edit') : t('Preview')}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Save scratchpad to Favorites')}
                  onPress={handleSaveScratchpadToFavorites}
                  style={[
                    styles.smallActionBtn,
                    { borderColor: colors.primary },
                  ]}
                >
                  <BookMarked size={12} color={colors.primary} />
                  <Text
                    style={[
                      styles.smallActionText,
                      { color: colors.primary },
                    ]}
                  >
                    {t('Save to Favorites')}
                  </Text>
                </Pressable>
              </View>
            </View>

            {scratchpadPreviewMode ? (
              <View
                style={[
                  styles.scratchpadPreviewBox,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ChatMarkdown
                  content={getMarkdownScratchpad(selectedSessionId)}
                />
              </View>
            ) : (
              <TextInput
                value={getMarkdownScratchpad(selectedSessionId)}
                onChangeText={(val) =>
                  setMarkdownScratchpad(selectedSessionId, val)
                }
                accessibilityLabel={t('Markdown scratchpad editor')}
                multiline
                style={[
                  styles.scratchpadInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              />
            )}
          </View>
        ) : activeTab.kind === 'file' ? (
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {(() => {
              const targetFile =
                previewFiles.find((f) => f.id === activeTab.fileId) ??
                previewFiles[0];
              return (
                <>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionTitleGroup}>
                      <FileCode size={15} color={colors.primary} />
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: colors.foreground },
                        ]}
                      >
                        {targetFile.filename}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('Open full file preview screen')}
                      onPress={() =>
                        router.push(
                          `/ui/file-preview?fileId=${encodeURIComponent(targetFile.id)}` as never,
                        )
                      }
                      style={[
                        styles.smallActionBtn,
                        { borderColor: colors.primary },
                      ]}
                    >
                      <ExternalLink size={12} color={colors.primary} />
                      <Text
                        style={[
                          styles.smallActionText,
                          { color: colors.primary },
                        ]}
                      >
                        {t('Full Preview')}
                      </Text>
                    </Pressable>
                  </View>
                  <ChatMarkdown
                    content={
                      targetFile.content ??
                      `Binary artifact \`${targetFile.filename}\``
                    }
                  />
                </>
              );
            })()}
          </View>
        ) : activeTab.kind === 'web' ? (
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.webAddressRow}>
              <Globe size={15} color={colors.primary} />
              <TextInput
                value={webUrlDraft}
                onChangeText={setWebUrlDraft}
                accessibilityLabel={t('Web reference URL')}
                style={[
                  styles.webUrlInput,
                  {
                    color: colors.foreground,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Navigate web reference tab')}
                onPress={() => setCommittedWebUrl(webUrlDraft.trim())}
                style={[styles.goBtn, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={[
                    styles.goBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {t('Go')}
                </Text>
              </Pressable>
            </View>
            <View
              style={[
                styles.webBodyBox,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.refLabel, { color: colors.foreground }]}>
                {t("Offline Study Reference Snapshot: {value1}", { value1: String(committedWebUrl) })}
              </Text>
              <Text
                style={[styles.refSub, { color: colors.mutedForeground }]}
              >
                {t(
                  'MIT 18.06 Lecture Summary — Orthogonal Projections, Eigenvalues, and Singular Value Decomposition.',
                )}
              </Text>
            </View>
          </View>
        ) : activeTab.kind === 'quiz-followup' ? (
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionTitleGroup}>
              <HelpCircle size={15} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {activeTab.title}
              </Text>
            </View>
            <View
              style={[
                styles.webBodyBox,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.refLabel, { color: colors.foreground }]}>
                {activeTab.quizQuestionPrompt ??
                  'For the matrix A = [[4, 1], [2, 3]], what is the sum of its eigenvalues?'}
              </Text>
            </View>

            <View style={styles.followupThread}>
              {(
                quizFollowupByQuestion[activeTab.quizQuestionId ?? 'quiz-q1'] ??
                []
              ).map((msg, idx) => (
                <View
                  key={`qf-${idx}`}
                  style={[
                    styles.followupBubble,
                    {
                      backgroundColor:
                        msg.role === 'user'
                          ? colors.secondary
                          : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.followupRole,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {msg.role === 'user' ? t('You') : t('Tutor')}
                  </Text>
                  <ChatMarkdown content={msg.content} />
                </View>
              ))}
            </View>

            <View style={styles.webAddressRow}>
              <TextInput
                value={followupDraft}
                onChangeText={setFollowupDraft}
                placeholder={t('Ask a follow-up question about this quiz item...')}
                placeholderTextColor={colors.mutedForeground}
                accessibilityLabel={t('Quiz follow-up input')}
                style={[
                  styles.webUrlInput,
                  {
                    color: colors.foreground,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Send quiz follow-up')}
                onPress={() => {
                  sendQuizFollowup(
                    activeTab.quizQuestionId ?? 'quiz-q1',
                    followupDraft,
                    activeTab.quizQuestionPrompt ?? 'Eigenvalues trace check',
                  );
                  setFollowupDraft('');
                }}
                style={[styles.goBtn, { backgroundColor: colors.primary }]}
              >
                <Send size={13} color={colors.primaryForeground} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.destructive,
              },
            ]}
          >
            <AlertTriangle size={24} color={colors.destructive} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {t('Unsupported Viewer Tab on Mobile')}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {activeTab.unsupportedReason ??
                t(
                  'Partner consultation and subagent management tabs are desktop-only in DeepTutor Mobile.',
                )}
            </Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sessionSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  sessionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabStrip: {
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabStripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  tabMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabCloseBtn: {
    padding: 2,
  },
  addTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  addTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reopenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  reopenBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  launcherMenu: {
    marginHorizontal: 14,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  launcherHeader: {
    fontSize: 12,
    fontWeight: '700',
  },
  launcherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  launcherOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  launcherOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bodyScroll: {
    padding: 14,
    paddingBottom: 36,
  },
  activityBody: {
    gap: 12,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  miniToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  capSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  capPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  capPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  toolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  toolBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  refTextCol: {
    flex: 1,
    gap: 2,
  },
  refLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  refSub: {
    fontSize: 11,
  },
  kindBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  kindBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  artifactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  artifactBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scratchpadInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 160,
    fontSize: 13,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  scratchpadPreviewBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  webAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  webUrlInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
  },
  goBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  webBodyBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  followupThread: {
    gap: 8,
  },
  followupBubble: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  followupRole: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
