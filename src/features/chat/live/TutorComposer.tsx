import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { ArrowUp, CalendarCheck2, ChevronDown, Dumbbell, Ellipsis, Lightbulb, Paperclip, Plug, Search, SlidersHorizontal, Sparkles, Square, Wrench } from 'lucide-react-native';
import { api } from '@/api/client';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, Field } from '@/shared/ui/Controls';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { ListRow } from '@/shared/ui/ListRow';
import { DText } from '@/shared/ui/Text';
import type { TutorConfiguration } from './configuration';
import prompts from './learning-prompts.json';

type Action = keyof typeof prompts;
type Panel = 'Mode' | 'Skills' | 'Connections' | 'More tools' | 'Partners' | 'Preferences' | 'Create' | 'Attachments' | Action;
type Option = { id: string; label: string; description?: string };
const actions = [ ['explain', 'Explain', Lightbulb], ['solve', 'Solve', Wrench], ['practice', 'Practice', Dumbbell], ['plan', 'Plan', CalendarCheck2], ['research', 'Research', Search] ] as const;
const modes = [ ['chat', 'Explain'], ['solve', 'Solve'] ] as const;

export interface TutorComposerProps {
  compact?: boolean;
  workspace?: string;
  resourceCount?: number;
  onResources?: () => void;
  learningActions?: { label: string; onPress: () => void; disabled?: boolean }[];
  value: string;
  onChangeText: (value: string) => void;
  modelName: string;
  onChooseModel: () => void;
  configuration: TutorConfiguration;
  onConfigure: (value: TutorConfiguration) => void;
  loading: boolean;
  busy: boolean;
  waiting: boolean;
  error: boolean;
  onSend: () => void;
  onStop: () => void;
}

export function TutorComposer(props: TutorComposerProps) {
  const { colors, dark } = useDesign();
  const t = useCopy();
  const [height, setHeight] = useState(64);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [fetching, setFetching] = useState(false);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);
  const locked = props.loading || props.busy;
  const config = props.configuration;
  const configure = (patch: TutorConfiguration) => props.onConfigure({ ...config, ...patch });
  const openPanel = (next: Panel) => {
    setOptions([]); setFailure(''); setFetching(['Skills', 'Preferences', 'Connections', 'Partners'].includes(next)); setPanel(next);
  };
  useEffect(() => {
    const abort = new AbortController();
    const paths: Partial<Record<Panel, string>> = { Skills: '/skills/list', Preferences: '/personas', Connections: '/settings/mcp', Partners: '/partners' };
    const path = panel ? paths[panel] : undefined;
    if (path) void api.get(path, { signal: abort.signal, ...(props.workspace !== undefined ? { params: { dt_workspace: props.workspace } } : {}) }).then(({ data }) => {
      let rows: Option[];
      if (panel === 'Connections') {
        if (!data.servers || typeof data.servers !== 'object') throw new Error('Invalid connection catalog.');
        rows = Object.entries(data.servers as Record<string, { enabled?: boolean }>).filter(([, server]) => server.enabled).map(([name]) => ({ id: name, label: name }));
      } else {
        const items = panel === 'Skills' ? data.skills : panel === 'Preferences' ? data.personas : data;
        if (!Array.isArray(items)) throw new Error('Invalid configuration catalog.');
        rows = items.map(item => {
          const id = panel === 'Partners' ? item.id : item.name;
          if (typeof id !== 'string') throw new Error('Invalid configuration identifier.');
          return { id, label: item.name || id, description: item.description };
        });
      }
      if (!abort.signal.aborted) setOptions(rows);
    }).catch(cause => { if (!abort.signal.aborted) setFailure(cause.response?.status === 403 ? 'Your account cannot access these settings.' : 'Unable to load settings. Please try again.'); }).finally(() => { if (!abort.signal.aborted) setFetching(false); });
    return () => abort.abort();
  }, [panel, retry, props.workspace]);
  const toggle = (key: 'skills' | 'mcp', id: string) => configure({ [key]: (config[key] ?? []).includes(id) ? config[key]!.filter(value => value !== id) : [...(config[key] ?? []), id] });
  const selectionStyle = (selected: boolean) => ({ borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.accent : colors.card });
  const toolBackground = dark ? '#282523' : colors.secondary;
  const toolStyle = { width: 34, height: 34, borderRadius: 12, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: toolBackground };
  const isAction = panel !== null && panel in prompts;
  const stop = props.busy && (!props.waiting || !props.value.trim());
  return <View>
    <View style={{ padding: props.compact ? 20 : 16, gap: 8, minHeight: props.compact ? undefined : 204, borderTopWidth: 1, borderColor: colors.border }}>
      {props.waiting && <InlineAlert>{t('Your tutor is waiting for your reply.')}</InlineAlert>}
      <Field label={t(props.compact ? 'Your answer' : 'Message')} labelStyle={{ fontFamily: 'Geist', fontSize: 14 }} placeholder={t(props.compact ? 'Explain your reasoning…' : 'Ask DeepTutor…')} value={props.value} onChangeText={props.onChangeText} multiline submitBehavior="newline"
        editable={!props.loading && (!props.busy || props.waiting)}
        onContentSizeChange={event => setHeight(Math.min(props.compact ? 140 : 160, Math.max(props.compact ? 52 : 64, event.nativeEvent.contentSize.height + 12)))}
        style={{ borderColor: dark ? '#746D66' : colors.input, height: props.value ? Math.max(props.compact ? 52 : 64, height) : props.compact ? 52 : 64, maxHeight: props.compact ? 140 : 160, minHeight: props.compact ? 52 : 64, paddingVertical: 12, textAlignVertical: 'top' }}
        trailing={<Button accessibilityLabel={t(stop ? 'Stop response' : 'Send')} disabled={!stop && (!props.value.trim() || props.loading || props.error || (props.busy && !props.waiting))} onPress={stop ? props.onStop : props.onSend} style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, paddingHorizontal: 0, paddingVertical: 0, borderRadius: 999 }}>{stop ? <Square size={16} color={colors.primaryForeground} fill={colors.primaryForeground} /> : <ArrowUp size={18} color={colors.primaryForeground} />}</Button>}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: props.compact ? 44 : 36, justifyContent: 'flex-end' }}>
        {props.compact && <Pressable accessibilityRole="button" accessibilityLabel={`Resources, ${props.resourceCount ?? 0} attached`} onPress={props.onResources} style={[toolStyle, { width: 44, height: 44, position: 'relative' }]}><Paperclip size={18} color={colors.primary} />{(props.resourceCount ?? 0) > 0 && <View style={{ position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><DText style={{ fontSize: 10, lineHeight: 14, color: colors.primaryForeground }}>{props.resourceCount}</DText></View>}</Pressable>}
        {(!props.compact ? ([['Mode', SlidersHorizontal, 15], ['Skills', Sparkles, 15], ['Connections', Plug, 17], ['More tools', Ellipsis, 18]] as const) : ([['More tools', Ellipsis, 18]] as const)).map(([name, Icon, size]) => <Pressable key={name} accessibilityRole="button" accessibilityLabel={t(name)} disabled={locked} accessibilityState={{ disabled: locked, expanded: panel === name }} onPress={() => openPanel(name)} style={({ pressed }) => [toolStyle, { width: props.compact ? 44 : 34, height: props.compact ? 44 : 34, backgroundColor: name === 'More tools' && !props.compact ? colors.primary : toolBackground, opacity: locked ? 0.5 : pressed ? 0.7 : 1 }]}><Icon size={size} color={name === 'More tools' && !props.compact ? colors.primaryForeground : colors.primary} /></Pressable>)}
        {!props.compact && <Pressable accessibilityRole="button" accessibilityLabel={props.modelName} accessibilityHint={t('Choose model')} disabled={locked} onPress={props.onChooseModel} style={[toolStyle, { width: undefined, flex: 1, minWidth: 0, paddingHorizontal: 8, flexDirection: 'row', gap: 4, opacity: locked ? 0.5 : 1 }]}>
          <DText numberOfLines={1} style={{ flex: 1, fontSize: 11, color: colors.mutedForeground }}>{props.modelName}</DText><ChevronDown size={14} color={colors.mutedForeground} />
        </Pressable>}
      </View>
    </View>
    {!props.compact && <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4, gap: 4 }}>
      {actions.map(([id, label, Icon]) => <Pressable key={id} accessibilityRole="button" accessibilityLabel={t(label)} disabled={locked} onPress={() => openPanel(id)} style={({ pressed }) => ({ minWidth: 68, height: 36, borderRadius: 12, paddingHorizontal: 7, backgroundColor: toolBackground, flexDirection: 'row', gap: 4, alignItems: 'center', opacity: locked ? 0.5 : pressed ? 0.7 : 1 })}><Icon size={14} color={colors.primary} /><DText style={{ fontSize: 10, fontFamily: 'GeistBold' }}>{t(label)}</DText></Pressable>)}
    </ScrollView>}
    <FullScreenModal open={panel !== null} title={t(isAction ? actions.find(([id]) => id === panel)![1] : panel === 'Mode' ? 'Choose a mode' : panel === 'More tools' ? 'Message tools' : panel ?? '')} onClose={() => setPanel(null)}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16 }}>
        {fetching && <LoadingState />}
        {!!failure && <><InlineAlert tone="danger">{t(failure)}</InlineAlert><Button onPress={() => { setFailure(''); setFetching(true); setRetry(value => value + 1); }}>{t('Retry')}</Button></>}
        {panel === 'More tools' && props.compact && <>
          <ListRow title={props.modelName} description={t('Choose model')} onPress={() => { setPanel(null); props.onChooseModel(); }} />
          {(['Skills', 'Connections'] as const).map(name => <ListRow key={name} title={t(name)} onPress={() => openPanel(name)} />)}
          {props.learningActions?.map(action => <Button key={action.label} variant="secondary" disabled={action.disabled || locked} onPress={() => { setPanel(null); action.onPress(); }}>{t(action.label)}</Button>)}
          {actions.map(([id, label]) => <ListRow key={id} title={t(label)} onPress={() => openPanel(id)} />)}
        </>}
        {panel === 'More tools' && (['Preferences', 'Create', 'Partners', ...(props.compact ? [] : ['Attachments'])] as const).map(name => <ListRow key={name} title={t(name)} onPress={() => openPanel(name as Panel)} />)}
        {panel === 'Mode' && <>
          {modes.map(([id, label]) => <Button key={id} variant="secondary" style={selectionStyle((config.capability ?? 'chat') === id)} accessibilityState={{ selected: (config.capability ?? 'chat') === id }} onPress={() => { configure({ capability: id }); setPanel(null); }}>{t(label)}</Button>)}
          <InlineAlert>{t('Additional modes require mobile support for configuration and response cards. Use Explain or Solve for text conversations.')}</InlineAlert>
        </>}
        {isAction && prompts[panel as Action].map(item => <ListRow key={item.label} title={t(item.label)} description={t(item.prompt)} onPress={() => { props.onChangeText(props.value.trim() ? `${props.value}\n\n${t(item.prompt)}` : t(item.prompt)); setPanel(null); }} />)}
        {(panel === 'Skills' || panel === 'Connections') && !fetching && !failure && <>
          <Button variant="secondary" style={selectionStyle(!(panel === 'Skills' ? config.skills : config.mcp)?.length)} accessibilityState={{ selected: !(panel === 'Skills' ? config.skills : config.mcp)?.length }} onPress={() => configure(panel === 'Skills' ? { skills: [] } : { mcp: [] })}>{t('Auto')}</Button>
          {options.map(option => <Button key={option.id} variant="secondary" style={selectionStyle(!!(panel === 'Skills' ? config.skills : config.mcp)?.includes(option.id))} accessibilityState={{ selected: (panel === 'Skills' ? config.skills : config.mcp)?.includes(option.id) }} onPress={() => toggle(panel === 'Skills' ? 'skills' : 'mcp', option.id)}>{option.label}</Button>)}
          {!options.length && <DText muted>{t('No available options')}</DText>}
          {panel === 'Connections' && <DText muted>{t('Select existing enabled services. Add or test connections in DeepTutor web settings.')}</DText>}
        </>}
        {(panel === 'Preferences' || panel === 'Partners') && !fetching && !failure && <>
          <Button variant="secondary" style={selectionStyle(panel === 'Preferences' ? !config.persona : !config.answer_by)} accessibilityState={{ selected: panel === 'Preferences' ? !config.persona : !config.answer_by }} onPress={() => configure(panel === 'Preferences' ? { persona: null } : { answer_by: '' })}>{t('DeepTutor')}</Button>
          {options.map(option => <Button key={option.id} variant="secondary" style={selectionStyle(panel === 'Preferences' ? config.persona === option.id : config.answer_by === `partner:${option.id}`)} accessibilityState={{ selected: panel === 'Preferences' ? config.persona === option.id : config.answer_by === `partner:${option.id}` }} onPress={() => configure(panel === 'Preferences' ? { persona: option.id } : { answer_by: `partner:${option.id}` })}>{option.label}</Button>)}
          {!options.length && <DText muted>{t('No available options')}</DText>}
          <DText muted>{t('Choices apply to subsequent turns in this conversation.')}</DText>
          {panel === 'Partners' && <DText muted>{t('Create partners and partner groups in DeepTutor web.')}</DText>}
        </>}
        {panel === 'Create' && <>
          <DText muted>{t('Ask the tutor to author a playbook. Review and save the result in DeepTutor web.')}</DText>
          {(['skill', 'persona'] as const).map(kind => <Button key={kind} variant="secondary" style={selectionStyle(config.create_target === kind)} accessibilityState={{ selected: config.create_target === kind }} onPress={() => { configure({ create_target: kind }); setPanel(null); }}>{t(kind === 'skill' ? 'Skill' : 'Persona')}</Button>)}
          <Button variant="ghost" onPress={() => { configure({ create_target: null }); setPanel(null); }}>{t('Clear')}</Button>
        </>}
        {panel === 'Attachments' && <InlineAlert>{t('File upload is not available in mobile Tutor yet. Use DeepTutor web to attach files.')}</InlineAlert>}
        {(panel === 'Skills' || panel === 'Connections' || panel === 'Preferences' || panel === 'Partners') && <Button onPress={() => setPanel(null)}>{t('Apply choices')}</Button>}
      </ScrollView>
    </FullScreenModal>
  </View>;
}
