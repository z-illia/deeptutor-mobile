import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { BookOpen, Database, FileText, History, Paperclip, Star, Upload, X } from 'lucide-react-native';
import type { TutorConfiguration } from '@/features/chat/live/configuration';
import type { OutgoingAttachment } from '@/features/chat/live/protocol';
import { chatError } from '@/features/chat/live/useLiveChat';
import { useDesign } from '@/shared/design/DesignProvider';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button, Field, IconButton } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { DText, ListRow } from './LearningText';
import { get, type MaterialDetail, type Source } from './repository';
import { useLearningData } from './useLearningData';
import { activeResourceCount, loadResourceOptions, resourceTypes, resolveResourceLabels, selectedResourceIds, toggleResource, type ResourceKind, type ResourceOption } from './study-resources';
import { pickStudyFiles, type AttachmentPolicy } from './study-files';

export function StudyResourcesSheet({ open, onClose, workspace, sessionId, configuration, onConfigure, files, onFiles, pathSources, savedFiles, disabled }: {
  open: boolean; onClose: () => void; workspace: string; sessionId: string | null; configuration: TutorConfiguration;
  onConfigure: Dispatch<SetStateAction<TutorConfiguration>>; files: OutgoingAttachment[]; onFiles: Dispatch<SetStateAction<OutgoingAttachment[]>>;
  pathSources: Source[]; savedFiles: OutgoingAttachment[]; disabled: boolean;
}) {
  const { colors } = useDesign();
  const [category, setCategory] = useState<ResourceKind | null>(null);
  const [query, setQuery] = useState('');
  const [failure, setFailure] = useState('');
  const [picking, setPicking] = useState(false);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const lifetime = useRef<AbortController | null>(null);
  useEffect(() => {
    const abort = new AbortController(); lifetime.current = abort;
    return () => abort.abort();
  }, [open]);
  const options = useLearningData(useCallback((signal: AbortSignal) => open ? loadResourceOptions(category, workspace, sessionId, signal) : Promise.resolve([]), [open, category, workspace, sessionId]));
  const resolved = useLearningData(useCallback((signal: AbortSignal) => open ? resolveResourceLabels(configuration, workspace, signal) : Promise.resolve<Record<string, string>>({}), [open, configuration, workspace]));
  const labelOf = (kind: ResourceKind, id: string) => labels[`${kind}:${id}`] ?? resolved.data?.[`${kind}:${id}`] ?? id;
  const policy = useLearningData(useCallback((signal: AbortSignal) => open && category === 'files' ? get<AttachmentPolicy>('/settings/chat-attachments', workspace, signal) : Promise.resolve(undefined), [open, category, workspace]));
  const close = () => { setCategory(null); setQuery(''); setFailure(''); setPicking(false); onClose(); };
  const toggle = async (kind: ResourceKind, option: ResourceOption) => {
    setFailure('');
    const abort = lifetime.current;
    try {
      let selected = option;
      if (kind === 'reading' && !selectedResourceIds(configuration, kind).includes(option.id)) {
        const detail = await get<MaterialDetail>(`/reading/materials/${encodeURIComponent(option.id)}`, workspace, abort?.signal);
        selected = { ...option, revision: detail.revision };
      }
      if (abort?.signal.aborted) return;
      const patch = selected;
      onConfigure(previous => toggleResource(previous, kind, patch));
      setLabels(previous => ({ ...previous, [`${kind}:${option.id}`]: option.label }));
    } catch (cause) { if (!abort?.signal.aborted) setFailure(chatError(cause)); }
  };
  const pick = async () => {
    if (!policy.data || picking) return;
    const abort = lifetime.current; setPicking(true); setFailure('');
    try { const chosen = await pickStudyFiles(policy.data, files); if (!abort?.signal.aborted) onFiles(previous => [...previous, ...chosen]); }
    catch (cause) { if (!abort?.signal.aborted) setFailure(chatError(cause)); }
    finally { if (!abort?.signal.aborted) setPicking(false); }
  };
  const iconFor = (kind: ResourceKind) => kind === 'history' ? History : kind === 'books' || kind === 'reading' ? BookOpen : kind === 'favorites' ? Star : kind === 'knowledge' ? Database : kind === 'files' ? Upload : FileText;
  const attachedRow = (key: string, name: string, kind: ResourceKind, remove?: () => void) => {
    const Icon = iconFor(kind);
    return <View key={key} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon size={18} color={colors.primary} /><DText numberOfLines={1} style={{ flex: 1, fontSize: 14 }}>{name}</DText>{remove && <IconButton label={`Remove ${name}`} disabled={disabled || picking} onPress={remove}><X size={16} color={colors.mutedForeground} /></IconButton>}</View>;
  };
  return <BottomSheet open={open} title={`Resources · ${activeResourceCount(configuration, pathSources, files)} attached`} onClose={close}>
    <Field label={category ? 'Search resources' : 'Search resource types'} labelStyle={{ display: 'none' }} value={query} onChangeText={setQuery} placeholder={category ? 'Search resources' : 'Search resource types'} style={{ minHeight: 40, paddingHorizontal: 12 }} />
    <ScrollView keyboardShouldPersistTaps="handled" style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
      {!!failure && <InlineAlert tone="danger">{failure}</InlineAlert>}
      {!category ? <>
        <DText muted>Attached resources</DText>
        {pathSources.filter(source => source.kind !== 'goal').map(source => <View key={source.id}>{attachedRow(source.id, source.label, 'knowledge')}<DText muted style={{ fontSize: 11 }}>Path context · {source.available ? 'available' : 'unavailable'} · revise with your tutor</DText></View>)}
        {resourceTypes.filter(kind => kind.id !== 'files').flatMap(kind => selectedResourceIds(configuration, kind.id).map(id => attachedRow(`${kind.id}:${id}`, labelOf(kind.id, id), kind.id, () => onConfigure(previous => toggleResource(previous, kind.id, { id, label: labelOf(kind.id, id), available: true })))))}
        {files.map((file, index) => attachedRow(`pending:${index}`, file.filename || 'File', 'files', () => onFiles(previous => previous.filter((_, i) => i !== index))))}
        {activeResourceCount(configuration, pathSources, files) === 0 && <DText muted>No resources selected.</DText>}
        <DText muted>Add resources</DText>
        {resourceTypes.filter(kind => kind.label.toLowerCase().includes(query.toLowerCase())).map(kind => { const Icon = iconFor(kind.id); return <Pressable key={kind.id} accessibilityRole="button" accessibilityLabel={kind.label} onPress={() => { setCategory(kind.id); setQuery(''); setFailure(''); }} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8 }}><Icon size={18} color={colors.primary} /><DText style={{ fontSize: 14 }}>{kind.label}</DText></Pressable>; })}
        {!!savedFiles.length && <><DText muted>Files already saved in conversation messages</DText>{savedFiles.map((file, index) => attachedRow(`saved:${index}`, file.filename || 'File', 'files'))}<DText muted style={{ fontSize: 11 }}>Message files remain in history; removing a pending file does not delete past messages.</DText></>}
        <DText muted style={{ fontSize: 11 }}>Reference selections are saved with your next message. Pending files belong to that message. Unsent selections stay in memory until the app closes.</DText>
      </> : <>
        <Button variant="ghost" onPress={() => { setCategory(null); setQuery(''); }}>Back to resources</Button>
        {category === 'files' ? <>
          {policy.loading && <LoadingState />}{!!policy.error && <><InlineAlert tone="danger">{policy.error}</InlineAlert><Button onPress={policy.refresh}>Retry</Button></>}
          <DText muted>Choose text, PDF or image files. Mobile limits: up to 4 MB per file, 8 MB total, within the server policy.</DText>
          <Button disabled={disabled || !policy.data} loading={picking} icon={<Paperclip size={18} color={colors.primaryForeground} />} onPress={() => void pick()}>Choose files</Button>
          {files.map((file, index) => attachedRow(`file:${index}`, file.filename || 'File', 'files', () => onFiles(previous => previous.filter((_, i) => i !== index))))}
        </> : <>
          {options.loading && <LoadingState />}{!!options.error && <><InlineAlert tone="danger">{options.error}</InlineAlert><Button onPress={options.refresh}>Retry</Button></>}
          {options.data?.filter(item => item.label.toLowerCase().includes(query.toLowerCase())).map(item => <ListRow key={item.id} title={item.label} description={item.detail} selected={selectedResourceIds(configuration, category).includes(item.id)} disabled={disabled || !item.available} onPress={() => void toggle(category, item)} />)}
          {!options.loading && !options.error && !options.data?.length && <DText muted>No available resources in this workspace.</DText>}
          <DText muted style={{ fontSize: 11 }}>Chat History and Question Bank show the 50 most recent entries. Favorites selects a saved collection.</DText>
        </>}
      </>}
    </ScrollView>
  </BottomSheet>;
}
