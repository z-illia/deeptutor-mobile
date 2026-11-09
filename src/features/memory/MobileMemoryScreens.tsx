import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useDesign } from '@/shared/design/DesignProvider';
import { useCopy } from '@/features/entry/copy';
import { Dialog } from '@/shared/ui/Dialog';
import { InlineAlert } from '@/shared/ui/Feedback';
import {
  MobileAction,
  MobileField,
  MobilePage,
  MobileRow,
  MobileText,
} from '@/features/mobile/ScreenLayout';
import {
  cancelMemoryRun,
  connectSubagentFolder,
  deleteMemoryEntry,
  detectSubagentBackends,
  disconnectSubagentFolder,
  fetchMemoryEvidence,
  getMemoryDoc,
  getMemoryDocLines,
  getMemoryOverview,
  getMemoryRun,
  getMemorySettings,
  getMemorySnapshot,
  getMemoryTarget,
  importConversations,
  listImportedConversations,
  listMemoryRuns,
  listSubagentConnections,
  MEMORY_L3_SLOTS,
  MEMORY_SURFACES,
  memoryError,
  parseMemoryDoc,
  pickAndParseImportFile,
  refreshAllMemorySnapshots,
  refreshMemorySnapshot,
  resetMemoryDoc,
  saveMemoryDoc,
  setMemoryTarget,
  startMemoryRun,
  undoMemoryRun,
  type ImportedSessionSummary,
  type ImportSource,
  type MemoryDocLayer,
  type MemoryDocLine,
  type MemoryEvidenceBundle,
  type MemoryEvidenceItem,
  type MemoryL3Slot,
  type MemoryLayer,
  type MemoryOverview,
  type MemoryRunHandle,
  type MemoryRunMode,
  type MemorySettings,
  type MemorySnapshot,
  type MemorySurface,
  type SubagentBackend,
  type SubagentConnection,
} from './repository';

const SURFACE_TITLES: Record<MemorySurface, string> = {
  chat: 'Chat',
  notebook: 'Notebook',
  quiz: 'Quiz',
  kb: 'Knowledge bases',
  book: 'Book',
  partner: 'Partner',
  cowriter: 'Co-writer',
};

const SLOT_TITLES: Record<MemoryL3Slot, string> = {
  recent: 'Recent summary · L3',
  profile: 'Cross-surface knowledge · L3',
  scope: 'Scope',
  preferences: 'Preferences',
};

function MobileCard({ children }: { children: ReactNode }) {
  const { colors } = useDesign();
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        gap: 8,
      }}
    >
      {children}
    </View>
  );
}

function MobileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <MobileText accessibilityRole="header" style={{ fontSize: 18, fontWeight: '600' }}>
        {title}
      </MobileText>
      {children}
    </View>
  );
}

function useScopeKey() {
  const auth = useAuth();
  const workspaces = useWorkspaces();
  const workspace = workspaces.selectedWorkspaceId || 'default';
  const scopeKey = `${auth.serverUrl}:${auth.session?.profile?.id ?? 'anon'}:${workspace}`;
  return { workspace, scopeKey };
}

export function MemoryOverviewScreen() {
  const t = useCopy();
  const { colors } = useDesign();
  const { workspace, scopeKey } = useScopeKey();
  const [overview, setOverview] = useState<MemoryOverview | null>(null);
  const [l1Count, setL1Count] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      try {
        const [ov, ...snaps] = await Promise.all([
          getMemoryOverview(workspace, signal),
          ...MEMORY_SURFACES.map(surface =>
            getMemorySnapshot(workspace, surface, signal).catch(() => null),
          ),
        ]);
        if (signal?.aborted) return;
        setOverview(ov);
        setL1Count(
          snaps.reduce((sum, item) => sum + (item ? item.entities.length : 0), 0),
        );
      } catch (cause) {
        if (!signal?.aborted) setError(memoryError(cause));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [workspace],
  );

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void load(controller.signal);
      return () => controller.abort();
    }, [load]),
  );

  const l2Docs = useMemo(
    () => (overview?.docs ?? []).filter(doc => doc.layer === 'L2'),
    [overview],
  );
  const l3Docs = useMemo(
    () => (overview?.docs ?? []).filter(doc => doc.layer === 'L3' && doc.key !== 'preferences'),
    [overview],
  );
  const l2Facts = useMemo(
    () => l2Docs.reduce((sum, doc) => sum + doc.entry_count, 0),
    [l2Docs],
  );
  const l3Propositions = useMemo(
    () => l3Docs.reduce((sum, doc) => sum + doc.entry_count, 0),
    [l3Docs],
  );

  const openWorkbench = (layer: MemoryLayer, key: string) => {
    setMemoryTarget(scopeKey, { layer, key });
    router.push('/mobile/79');
  };

  const handleRefreshTraces = async () => {
    setBusy(true);
    setError('');
    setStatusMessage('');
    try {
      await refreshAllMemorySnapshots(workspace);
      await load();
      setStatusMessage(t('Changes saved'));
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage title={t('Memory')} fallback="/mobile/65">
      <MobileText muted>
        {t('Review what the tutor retains and the evidence behind it.')}
      </MobileText>
      {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
      {!!statusMessage && <InlineAlert tone="info">{statusMessage}</InlineAlert>}

      <MobileRow
        title={t('Workspace traces · L1')}
        description={
          loading
            ? t('Loading…')
            : `${l1Count} tracked · ${MEMORY_SURFACES.length} surfaces`
        }
        onPress={() => openWorkbench('L1', 'chat')}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Surface summaries · L2')}
        description={
          loading
            ? t('Loading…')
            : `${l2Facts} facts · curate with evidence`
        }
        onPress={() => openWorkbench('L2', 'chat')}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Cross-surface knowledge · L3')}
        description={
          loading
            ? t('Loading…')
            : `${l3Propositions} propositions`
        }
        onPress={() => openWorkbench('L3', 'recent')}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Explore evidence connections')}
        description={t('Touch-based list replaces hover-only graph')}
        onPress={() => router.push('/mobile/80')}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Memory processing settings')}
        description={t('Budgets, chunking and reference checks')}
        onPress={() => router.push('/mobile/102')}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileAction
        variant="secondary"
        loading={busy}
        onPress={() => void handleRefreshTraces()}
      >
        {t('Refresh workspace traces')}
      </MobileAction>
    </MobilePage>
  );
}

type WorkbenchViewMode = 'rendered' | 'lines' | 'raw';

export function MemoryWorkbenchScreen() {
  const t = useCopy();
  const { colors } = useDesign();
  const { workspace, scopeKey } = useScopeKey();
  const initialTarget = getMemoryTarget(scopeKey);

  const [layer, setLayer] = useState<MemoryLayer>(initialTarget.layer);
  const [selectedKey, setSelectedKey] = useState<string>(initialTarget.key);
  const [viewMode, setViewMode] = useState<WorkbenchViewMode>('rendered');
  const [operation, setOperation] = useState<MemoryRunMode>('update');
  const [budgetInput, setBudgetInput] = useState<string>('');

  const [overview, setOverview] = useState<MemoryOverview | null>(null);
  const [snapshot, setSnapshot] = useState<MemorySnapshot | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [rawDraft, setRawDraft] = useState<string>('');
  const [docLines, setDocLines] = useState<MemoryDocLine[]>([]);
  const [settings, setSettings] = useState<MemorySettings | null>(null);
  const [activeRun, setActiveRun] = useState<MemoryRunHandle | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [pickerDialog, setPickerDialog] = useState<'target' | 'view' | 'op' | 'reset' | null>(null);

  const loadData = useCallback(
    async (targetLayer: MemoryLayer, targetKey: string, signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      try {
        const [ov, cfg] = await Promise.all([
          getMemoryOverview(workspace, signal),
          getMemorySettings(workspace, signal).catch(() => null),
        ]);
        if (signal?.aborted) return;
        setOverview(ov);
        if (cfg) setSettings(cfg);

        if (targetLayer === 'L1') {
          const surface = (MEMORY_SURFACES.includes(targetKey as MemorySurface)
            ? targetKey
            : 'chat') as MemorySurface;
          const snap = await getMemorySnapshot(workspace, surface, signal);
          if (signal?.aborted) return;
          setSnapshot(snap);
        } else {
          const docLayer: MemoryDocLayer = targetLayer;
          const [doc, lines, runs] = await Promise.all([
            getMemoryDoc(workspace, docLayer, targetKey, signal),
            getMemoryDocLines(workspace, docLayer, targetKey, signal).catch(() => []),
            listMemoryRuns(workspace, docLayer, targetKey, signal).catch(() => []),
          ]);
          if (signal?.aborted) return;
          setDocContent(doc.content);
          setRawDraft(doc.content);
          setDocLines(lines);
          setActiveRun(runs[0] ?? null);
        }
      } catch (cause) {
        if (!signal?.aborted) setError(memoryError(cause));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [workspace],
  );

  useFocusEffect(
    useCallback(() => {
      const target = getMemoryTarget(scopeKey);
      setLayer(target.layer);
      setSelectedKey(target.key);
      const controller = new AbortController();
      void loadData(target.layer, target.key, controller.signal);
      return () => controller.abort();
    }, [loadData, scopeKey]),
  );

  useEffect(() => {
    if (!activeRun || (activeRun.status !== 'queued' && activeRun.status !== 'running')) {
      return;
    }
    const timer = setInterval(() => {
      void (async () => {
        try {
          const updated = await getMemoryRun(workspace, activeRun.id);
          setActiveRun(updated);
          if (updated.status !== 'queued' && updated.status !== 'running') {
            if (layer !== 'L1') {
              await loadData(layer, selectedKey);
            }
          }
        } catch {
          // ignore transient poll errors
        }
      })();
    }, 1500);
    return () => clearInterval(timer);
  }, [activeRun, layer, loadData, selectedKey, workspace]);

  const parsedDoc = useMemo(() => parseMemoryDoc(docContent), [docContent]);

  const currentDocOverview = useMemo(
    () =>
      overview?.docs.find(d => d.layer === layer && d.key === selectedKey) ?? null,
    [layer, overview, selectedKey],
  );

  const defaultBudget = useMemo(() => {
    if (operation === 'dedup') return settings?.dedup.iterations ?? 3;
    if (operation === 'audit') {
      return layer === 'L3'
        ? settings?.audit.l3_budget ?? 10
        : settings?.audit.l2_budget ?? 20;
    }
    return layer === 'L3'
      ? settings?.update.l3_budget ?? 10
      : settings?.update.l2_budget ?? 20;
  }, [layer, operation, settings]);

  const selectTarget = (nextLayer: MemoryLayer, nextKey: string) => {
    setLayer(nextLayer);
    setSelectedKey(nextKey);
    setMemoryTarget(scopeKey, { layer: nextLayer, key: nextKey });
    setPickerDialog(null);
    void loadData(nextLayer, nextKey);
  };

  const handleSaveRaw = async () => {
    if (layer === 'L1') return;
    setBusy(true);
    setError('');
    setStatusMessage('');
    try {
      await saveMemoryDoc(workspace, layer, selectedKey, rawDraft);
      await loadData(layer, selectedKey);
      setViewMode('rendered');
      setStatusMessage(t('Changes saved'));
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (layer === 'L1') return;
    setBusy(true);
    setError('');
    try {
      await deleteMemoryEntry(workspace, layer, selectedKey, entryId);
      await loadData(layer, selectedKey);
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  const handleRunOperation = async () => {
    if (layer === 'L1') {
      setBusy(true);
      setError('');
      try {
        const surface = (MEMORY_SURFACES.includes(selectedKey as MemorySurface)
          ? selectedKey
          : 'chat') as MemorySurface;
        await refreshMemorySnapshot(workspace, surface);
        await loadData('L1', surface);
        setStatusMessage(t('Changes saved'));
      } catch (cause) {
        setError(memoryError(cause));
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    setError('');
    setStatusMessage('');
    try {
      const numericBudget = Number(budgetInput);
      const validNumber =
        budgetInput.trim() && Number.isFinite(numericBudget) && numericBudget > 0
          ? Math.round(numericBudget)
          : defaultBudget;
      const run = await startMemoryRun(workspace, {
        layer,
        key: selectedKey,
        mode: operation,
        budget: operation === 'dedup' ? null : validNumber,
        iterations: operation === 'dedup' ? validNumber : null,
      });
      setActiveRun(run);
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  const handleCancelRun = async () => {
    if (!activeRun) return;
    setBusy(true);
    try {
      await cancelMemoryRun(workspace, activeRun.id);
      const refreshed = await getMemoryRun(workspace, activeRun.id);
      setActiveRun(refreshed);
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  const handleUndoRun = async () => {
    if (!activeRun || layer === 'L1') return;
    setBusy(true);
    setError('');
    try {
      await undoMemoryRun(workspace, activeRun.id);
      await loadData(layer, selectedKey);
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmReset = async () => {
    setPickerDialog(null);
    if (layer === 'L1') return;
    setBusy(true);
    setError('');
    setStatusMessage('');
    try {
      await resetMemoryDoc(workspace, layer, selectedKey);
      await loadData(layer, selectedKey);
      setStatusMessage(t('Changes saved'));
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  const contextLabel =
    layer === 'L1'
      ? `L1 · ${t(SURFACE_TITLES[selectedKey as MemorySurface] ?? 'Chat')} · ${snapshot?.entities.length ?? 0} traces`
      : `${layer} · ${t(SURFACE_TITLES[selectedKey as MemorySurface] ?? SLOT_TITLES[selectedKey as MemoryL3Slot] ?? 'Chat')} · ${currentDocOverview?.entry_count ?? parsedDoc.entries.length} ${layer === 'L3' ? 'propositions' : 'facts'}`;

  return (
    <MobilePage title={t('Memory workbench')} fallback="/mobile/78">
      <MobileText muted>{contextLabel}</MobileText>
      {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
      {!!statusMessage && <InlineAlert tone="info">{statusMessage}</InlineAlert>}

      <MobileRow
        title={t('Layer & surface')}
        description={`${layer} · ${t(SURFACE_TITLES[selectedKey as MemorySurface] ?? SLOT_TITLES[selectedKey as MemoryL3Slot] ?? 'L1 / L2 / L3 · select surface or slot')}`}
        onPress={() => setPickerDialog('target')}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      {layer !== 'L1' && (
        <MobileRow
          title={t('View mode')}
          description={t('Rendered / Line numbers / Edit raw')}
          onPress={() => setPickerDialog('view')}
        >
          <ChevronRight size={20} color={colors.mutedForeground} />
        </MobileRow>
      )}

      {loading ? (
        <MobileText muted>{t('Loading…')}</MobileText>
      ) : layer === 'L1' ? (
        <View style={{ gap: 12 }}>
          {(snapshot?.entities ?? []).length === 0 ? (
            <MobileCard>
              <MobileText style={{ fontWeight: '600', color: colors.accent }}>
                {t('No summary yet')}
              </MobileText>
              <MobileText muted style={{ fontSize: 14 }}>
                {t('Refresh workspace traces')}
              </MobileText>
            </MobileCard>
          ) : (
            (snapshot?.entities ?? []).map(entity => (
              <MobileCard key={entity.id}>
                <MobileText style={{ fontWeight: '600' }}>
                  {entity.label || entity.id}
                </MobileText>
                {!!entity.content && (
                  <MobileText muted style={{ fontSize: 14 }}>
                    {entity.content.slice(0, 240)}
                  </MobileText>
                )}
              </MobileCard>
            ))
          )}
        </View>
      ) : viewMode === 'raw' ? (
        <View style={{ gap: 12 }}>
          <TextInput
            accessibilityLabel={t('Layer & surface')}
            multiline
            value={rawDraft}
            onChangeText={setRawDraft}
            style={{
              minHeight: 180,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 12,
              color: colors.foreground,
              fontFamily: 'IBM Plex Mono',
              fontSize: 14,
              textAlignVertical: 'top',
            }}
          />
          <MobileAction loading={busy} onPress={() => void handleSaveRaw()}>
            {t('Save')}
          </MobileAction>
        </View>
      ) : viewMode === 'lines' ? (
        <View style={{ gap: 8 }}>
          {docLines.length === 0 ? (
            <MobileCard>
              <MobileText style={{ fontWeight: '600', color: colors.accent }}>
                {t('No summary yet')}
              </MobileText>
              <MobileText muted style={{ fontSize: 14 }}>
                {t(
                  'Update to extract facts from traces. Audit checks evidence; Dedup merges repeated facts.',
                )}
              </MobileText>
            </MobileCard>
          ) : (
            docLines.map(line => (
              <View
                key={line.number}
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  paddingVertical: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <MobileText muted style={{ fontFamily: 'IBM Plex Mono', fontSize: 13 }}>
                  {String(line.number).padStart(2, '0')}
                </MobileText>
                <MobileText style={{ flex: 1, fontSize: 14 }}>{line.text}</MobileText>
              </View>
            ))
          )}
        </View>
      ) : parsedDoc.entries.length === 0 ? (
        <MobileCard>
          <MobileText style={{ fontWeight: '600', color: colors.accent }}>
            {t('No summary yet')}
          </MobileText>
          <MobileText muted style={{ fontSize: 14 }}>
            {t(
              'Update to extract facts from traces. Audit checks evidence; Dedup merges repeated facts.',
            )}
          </MobileText>
        </MobileCard>
      ) : (
        <View style={{ gap: 12 }}>
          {parsedDoc.entries.map(entry => (
            <MobileCard key={entry.id}>
              {!!entry.section && (
                <MobileText muted style={{ fontSize: 13 }}>
                  {entry.section}
                </MobileText>
              )}
              <MobileText>{entry.text}</MobileText>
              {entry.refs.length > 0 && (
                <MobileText muted style={{ fontFamily: 'IBM Plex Mono', fontSize: 12 }}>
                  {entry.refs.join(' · ')}
                </MobileText>
              )}
              <MobileAction
                variant="secondary"
                disabled={busy}
                onPress={() => void handleDeleteEntry(entry.id)}
              >
                {t('Delete')}
              </MobileAction>
            </MobileCard>
          ))}
        </View>
      )}

      {layer !== 'L1' && (
        <>
          <MobileRow
            title={t('Operation')}
            description={`${operation.toUpperCase()} · ${t('Update / Audit / Dedup')}`}
            onPress={() => setPickerDialog('op')}
          >
            <ChevronRight size={20} color={colors.mutedForeground} />
          </MobileRow>

          <MobileField
            label={t('Budget')}
            value={budgetInput}
            placeholder={t('20 · L2 / 10 · L3')}
            onChangeText={setBudgetInput}
          />

          <MobileRow
            title={t('Model')}
            description={t('Configured language model')}
            onPress={() => router.push('/mobile/18')}
          >
            <ChevronRight size={20} color={colors.mutedForeground} />
          </MobileRow>

          {activeRun && (activeRun.status === 'queued' || activeRun.status === 'running') ? (
            <MobileAction
              variant="secondary"
              loading={busy}
              onPress={() => void handleCancelRun()}
            >
              {t('Cancel')}
            </MobileAction>
          ) : (
            <MobileAction loading={busy} onPress={() => void handleRunOperation()}>
              {t('Run selected operation')}
            </MobileAction>
          )}

          {activeRun && activeRun.undo_count > 0 && (
            <MobileAction
              variant="secondary"
              disabled={busy}
              onPress={() => void handleUndoRun()}
            >
              {t('Reset')}
            </MobileAction>
          )}

          <MobileRow
            title={t('Run trace')}
            description={t('System prompt, user prompt and response')}
            onPress={() => router.push('/mobile/80')}
          >
            <ChevronRight size={20} color={colors.mutedForeground} />
          </MobileRow>

          <MobileAction
            variant="secondary"
            disabled={busy}
            onPress={() => setPickerDialog('reset')}
          >
            {t('Reset workbench')}
          </MobileAction>
        </>
      )}

      {layer === 'L1' && (
        <MobileAction loading={busy} onPress={() => void handleRunOperation()}>
          {t('Refresh workspace traces')}
        </MobileAction>
      )}

      <Dialog
        open={pickerDialog !== null}
        title={
          pickerDialog === 'target'
            ? t('Layer & surface')
            : pickerDialog === 'view'
              ? t('View mode')
              : pickerDialog === 'op'
                ? t('Operation')
                : t('Confirm reset')
        }
        onClose={() => setPickerDialog(null)}
      >
        {pickerDialog === 'target' && (
          <View style={{ gap: 8 }}>
            {MEMORY_SURFACES.map(surface => (
              <MobileAction
                key={`L1:${surface}`}
                variant="secondary"
                onPress={() => selectTarget('L1', surface)}
              >
                {`L1 · ${t(SURFACE_TITLES[surface])}`}
              </MobileAction>
            ))}
            {MEMORY_SURFACES.map(surface => (
              <MobileAction
                key={`L2:${surface}`}
                variant="secondary"
                onPress={() => selectTarget('L2', surface)}
              >
                {`L2 · ${t(SURFACE_TITLES[surface])}`}
              </MobileAction>
            ))}
            {MEMORY_L3_SLOTS.map(slot => (
              <MobileAction
                key={`L3:${slot}`}
                variant="secondary"
                onPress={() => selectTarget('L3', slot)}
              >
                {`L3 · ${t(SLOT_TITLES[slot])}`}
              </MobileAction>
            ))}
          </View>
        )}
        {pickerDialog === 'view' && (
          <View style={{ gap: 8 }}>
            <MobileAction
              variant="secondary"
              onPress={() => {
                setViewMode('rendered');
                setPickerDialog(null);
              }}
            >
              {t('Preview')}
            </MobileAction>
            <MobileAction
              variant="secondary"
              onPress={() => {
                setViewMode('lines');
                setPickerDialog(null);
              }}
            >
              {t('Rendered / Line numbers / Edit raw')}
            </MobileAction>
            <MobileAction
              variant="secondary"
              onPress={() => {
                setViewMode('raw');
                setPickerDialog(null);
              }}
            >
              {t('Edit')}
            </MobileAction>
          </View>
        )}
        {pickerDialog === 'op' && (
          <View style={{ gap: 8 }}>
            {(['update', 'audit', 'dedup'] as const).map(mode => (
              <MobileAction
                key={mode}
                variant="secondary"
                onPress={() => {
                  setOperation(mode);
                  setPickerDialog(null);
                }}
              >
                {mode.toUpperCase()}
              </MobileAction>
            ))}
          </View>
        )}
        {pickerDialog === 'reset' && (
          <View style={{ gap: 8 }}>
            <MobileAction onPress={() => void handleConfirmReset()}>
              {t('Reset workbench')}
            </MobileAction>
          </View>
        )}
        <MobileAction variant="secondary" onPress={() => setPickerDialog(null)}>
          {t('Close')}
        </MobileAction>
      </Dialog>
    </MobilePage>
  );
}

export function MemoryEvidenceScreen() {
  const t = useCopy();
  const { colors } = useDesign();
  const { workspace, scopeKey } = useScopeKey();
  const [bundle, setBundle] = useState<MemoryEvidenceBundle | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<{
    layer: MemoryLayer;
    key: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchMemoryEvidence(workspace, signal);
        if (!signal?.aborted) setBundle(data);
      } catch (cause) {
        if (!signal?.aborted) setError(memoryError(cause));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [workspace],
  );

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void load(controller.signal);
      return () => controller.abort();
    }, [load]),
  );

  const selectedItem: MemoryEvidenceItem | null = useMemo(
    () => (selectedItemId && bundle ? bundle.byId[selectedItemId] ?? null : null),
    [bundle, selectedItemId],
  );

  const clusterItems = useMemo(() => {
    if (!bundle || !selectedCluster) return [];
    return bundle.items.filter(
      item => item.layer === selectedCluster.layer && item.key === selectedCluster.key,
    );
  }, [bundle, selectedCluster]);

  const openInWorkbench = (layer: MemoryLayer, key: string, focusId?: string) => {
    setMemoryTarget(scopeKey, { layer, key, focusId });
    router.push('/mobile/79');
  };

  return (
    <MobilePage title={t('Memory evidence')} fallback="/mobile/78">
      <MobileText muted>{t('L1 → L2 → L3 · tap to follow references')}</MobileText>
      {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}

      <MobileRow
        title={t('Recent summary · L3')}
        description={
          loading
            ? t('Loading…')
            : `${bundle?.l3Counts.recent ?? 0} propositions`
        }
        onPress={() => {
          setSelectedCluster({ layer: 'L3', key: 'recent' });
          setSelectedItemId(null);
        }}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Chat summary · L2')}
        description={
          loading ? t('Loading…') : `${bundle?.l2Counts.chat ?? 0} facts`
        }
        onPress={() => {
          setSelectedCluster({ layer: 'L2', key: 'chat' });
          setSelectedItemId(null);
        }}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Chat traces · L1')}
        description={
          loading ? t('Loading…') : `${bundle?.l1Counts.chat ?? 0} traces`
        }
        onPress={() => {
          setSelectedCluster({ layer: 'L1', key: 'chat' });
          setSelectedItemId(null);
        }}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Knowledge base traces · L1')}
        description={
          loading ? t('Loading…') : `${bundle?.l1Counts.kb ?? 0} traces`
        }
        onPress={() => {
          setSelectedCluster({ layer: 'L1', key: 'kb' });
          setSelectedItemId(null);
        }}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Co-writer traces · L1')}
        description={
          loading ? t('Loading…') : `${bundle?.l1Counts.cowriter ?? 0} traces`
        }
        onPress={() => {
          setSelectedCluster({ layer: 'L1', key: 'cowriter' });
          setSelectedItemId(null);
        }}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Other surfaces')}
        description={t('Favorites · Quiz · Book · Partner')}
        onPress={() => openInWorkbench('L2', 'notebook')}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      {selectedItem ? (
        <MobileCard>
          <MobileText style={{ fontWeight: '600' }}>{selectedItem.title}</MobileText>
          {!!selectedItem.preview && (
            <MobileText muted style={{ fontSize: 14 }}>
              {selectedItem.preview}
            </MobileText>
          )}
          {selectedItem.inwardIds.map(refId => {
            const refItem = bundle?.byId[refId];
            if (!refItem) return null;
            return (
              <MobileRow
                key={`in:${refId}`}
                title={refItem.title}
                description={`${refItem.layer} · ${refItem.key}`}
                onPress={() => setSelectedItemId(refId)}
              />
            );
          })}
          {selectedItem.outwardIds.map(refId => {
            const refItem = bundle?.byId[refId];
            if (!refItem) return null;
            return (
              <MobileRow
                key={`out:${refId}`}
                title={refItem.title}
                description={`${refItem.layer} · ${refItem.key}`}
                onPress={() => setSelectedItemId(refId)}
              />
            );
          })}
          <MobileAction
            onPress={() =>
              openInWorkbench(selectedItem.layer, selectedItem.key, selectedItem.entryId)
            }
          >
            {t('Memory workbench')}
          </MobileAction>
        </MobileCard>
      ) : selectedCluster ? (
        <MobileSection
          title={`${selectedCluster.layer} · ${selectedCluster.key}`}
        >
          {clusterItems.length === 0 ? (
            <MobileCard>
              <MobileText style={{ fontWeight: '600', color: colors.accent }}>
                {t('No summary yet')}
              </MobileText>
              <MobileAction
                variant="secondary"
                onPress={() => openInWorkbench(selectedCluster.layer, selectedCluster.key)}
              >
                {t('Memory workbench')}
              </MobileAction>
            </MobileCard>
          ) : (
            clusterItems.map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => setSelectedItemId(item.id)}
              >
                <MobileCard>
                  <MobileText style={{ fontWeight: '600' }}>{item.title}</MobileText>
                  {!!item.preview && (
                    <MobileText muted style={{ fontSize: 14 }}>
                      {item.preview}
                    </MobileText>
                  )}
                </MobileCard>
              </Pressable>
            ))
          )}
        </MobileSection>
      ) : (
        <MobileCard>
          <MobileText style={{ fontWeight: '600', color: colors.accent }}>
            {t('No hover required')}
          </MobileText>
          <MobileText muted style={{ fontSize: 14 }}>
            {t(
              'Choose an item to inspect its source, then follow inward or outward evidence links.',
            )}
          </MobileText>
        </MobileCard>
      )}
    </MobilePage>
  );
}

export function ImportConversationsScreen() {
  const t = useCopy();
  const { colors } = useDesign();
  const { workspace } = useScopeKey();
  const [importedSessions, setImportedSessions] = useState<ImportedSessionSummary[]>([]);
  const [backends, setBackends] = useState<SubagentBackend[]>([]);
  const [connections, setConnections] = useState<SubagentConnection[]>([]);
  const [folderDialogKind, setFolderDialogKind] = useState<'claude_code' | 'codex' | null>(null);
  const [folderPath, setFolderPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      try {
        const [sessions, detected, connected] = await Promise.all([
          listImportedConversations(workspace, 50, 0, signal),
          detectSubagentBackends(workspace, signal).catch(() => []),
          listSubagentConnections(workspace, signal).catch(() => []),
        ]);
        if (signal?.aborted) return;
        setImportedSessions(sessions);
        setBackends(detected);
        setConnections(connected);
      } catch (cause) {
        if (!signal?.aborted) setError(memoryError(cause));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [workspace],
  );

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void load(controller.signal);
      return () => controller.abort();
    }, [load]),
  );

  const handlePickImportFile = async (source: ImportSource) => {
    setBusy(true);
    setError('');
    setStatusMessage('');
    try {
      const picked = await pickAndParseImportFile(source);
      if (!picked) return;
      const result = await importConversations(
        workspace,
        picked.source,
        picked.sessions,
        picked.source !== 'chatgpt'
          ? {
              id: `${picked.source}-mobile`,
              name: picked.source === 'codex' ? 'Codex' : 'Claude Code',
            }
          : undefined,
      );
      await load();
      setStatusMessage(`${result.imported} conversations`);
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  const handleConnectFolder = async () => {
    if (!folderDialogKind) return;
    setBusy(true);
    setError('');
    setStatusMessage('');
    try {
      const label = folderDialogKind === 'codex' ? 'Codex' : 'Claude Code';
      await connectSubagentFolder(workspace, {
        name: label,
        agent_kind: folderDialogKind,
        cwd: folderPath.trim(),
      });
      setFolderDialogKind(null);
      setFolderPath('');
      await load();
      setStatusMessage(t('Saved'));
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async (name: string) => {
    setBusy(true);
    setError('');
    try {
      await disconnectSubagentFolder(workspace, name);
      await load();
    } catch (cause) {
      setError(memoryError(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobilePage title={t('Import conversations')} fallback="/mobile/77">
      <MobileText muted>{t('Continue existing conversations in DeepTutor.')}</MobileText>
      {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
      {!!statusMessage && <InlineAlert tone="info">{statusMessage}</InlineAlert>}

      <MobileRow
        title={t('ChatGPT data export')}
        description={t('Choose an exported archive')}
        onPress={() => void handlePickImportFile('chatgpt')}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Claude Code folder')}
        description={
          backends.find(b => b.kind === 'claude_code')?.detail ||
          t('Connect a folder on the server')
        }
        onPress={() => {
          setFolderPath('');
          setFolderDialogKind('claude_code');
        }}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      <MobileRow
        title={t('Codex folder')}
        description={
          backends.find(b => b.kind === 'codex')?.detail ||
          t('Connect a folder on the server')
        }
        onPress={() => {
          setFolderPath('');
          setFolderDialogKind('codex');
        }}
      >
        <ChevronRight size={20} color={colors.mutedForeground} />
      </MobileRow>

      {connections.length > 0 && (
        <MobileSection title={t('Connected agents')}>
          {connections.map(conn => (
            <MobileCard key={conn.name}>
              <MobileText style={{ fontWeight: '600' }}>{conn.name}</MobileText>
              <MobileText muted style={{ fontSize: 14 }}>
                {conn.cwd || conn.agent_kind}
              </MobileText>
              <MobileAction
                variant="secondary"
                disabled={busy}
                onPress={() => void handleDisconnect(conn.name)}
              >
                {t('Delete')}
              </MobileAction>
            </MobileCard>
          ))}
        </MobileSection>
      )}

      {loading ? (
        <MobileText muted>{t('Loading…')}</MobileText>
      ) : importedSessions.length === 0 ? (
        <MobileCard>
          <MobileText style={{ fontWeight: '600', color: colors.accent }}>
            {t('No imported agents yet')}
          </MobileText>
          <MobileText muted style={{ fontSize: 14 }}>
            {t(
              'Open an imported conversation to continue it. Local server paths are different from device files.',
            )}
          </MobileText>
        </MobileCard>
      ) : (
        <MobileSection title={t('Imported conversations')}>
          {importedSessions.map(session => (
            <MobileRow
              key={session.session_id}
              title={session.title}
              description={`${session.message_count} messages${session.agent_name ? ` · ${session.agent_name}` : ''}`}
              onPress={() =>
                router.push({
                  pathname: '/(app)/chat/[sessionId]',
                  params: { sessionId: session.session_id },
                })
              }
            >
              <ChevronRight size={20} color={colors.mutedForeground} />
            </MobileRow>
          ))}
        </MobileSection>
      )}

      <MobileAction
        loading={busy}
        onPress={() => void handlePickImportFile('chatgpt')}
      >
        {t('Choose import source')}
      </MobileAction>

      <Dialog
        open={folderDialogKind !== null}
        title={
          folderDialogKind === 'codex'
            ? t('Codex folder')
            : t('Claude Code folder')
        }
        onClose={() => setFolderDialogKind(null)}
      >
        <MobileField
          label={t('Server folder path')}
          value={folderPath}
          placeholder="/home/user/project"
          onChangeText={setFolderPath}
        />
        <MobileAction loading={busy} onPress={() => void handleConnectFolder()}>
          {t('Save connection')}
        </MobileAction>
        <MobileAction
          variant="secondary"
          disabled={busy}
          onPress={() => {
            const kind = folderDialogKind ?? 'claude_code';
            setFolderDialogKind(null);
            void handlePickImportFile(kind);
          }}
        >
          {t('Choose files from this device')}
        </MobileAction>
        <MobileAction variant="secondary" onPress={() => setFolderDialogKind(null)}>
          {t('Cancel')}
        </MobileAction>
      </Dialog>
    </MobilePage>
  );
}
