import { memo, useState, type ReactNode } from 'react';
import { Pressable, Switch, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { BatteryFull, BookOpen, Bookmark, Calendar, ChevronLeft, ChevronRight, Copy, Ellipsis, Folder, Layers, MessageCircle, NotebookPen, Signal, UserRound, Volume2, Wifi } from 'lucide-react-native';
import { colorOf, labelOf, textOf, type DesignNode, type MobileColors } from './model';

const icons = { 'battery-full': BatteryFull, 'book-open': BookOpen, bookmark: Bookmark, calendar: Calendar, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight, copy: Copy, ellipsis: Ellipsis, folder: Folder, layers: Layers, 'message-circle': MessageCircle, 'notebook-pen': NotebookPen, signal: Signal, 'user-round': UserRound, 'volume-2': Volume2, wifi: Wifi };
export interface LayerContext {
  colors: MobileColors;
  values: Record<string, string>;
  query: string;
  selected: string | undefined;
  selection: boolean;
  setValue: (node: DesignNode, value: string) => void;
  act: (node: DesignNode) => void;
  chooseField: (node: DesignNode, options: string[]) => void;
}
export const fieldOptions: Record<string, string[]> = {
  Theme: ['System', 'Light', 'Dark'], Status: ['To do', 'In progress', 'Done', 'Archived'],
  Workspace: ['Software Development', 'General workspace'], 'Destination workspace': ['Software Development', 'General workspace'],
  'Source workspace': ['Software Development', 'General workspace'],
  'Recall target': ['70%', '80%', '90%'], 'Apply choices': ['This turn only', 'Every turn'],
  'Choice duration': ['This turn only', 'Every turn'],
  'Interface language': ['English', 'Українська', 'Polski', '中文'], 'Model output language': ['Automatic', 'English', 'Українська', 'Polski', '中文'],
  'Reply language': ['Automatic', 'English', 'Українська'], 'Learning text size': ['16', '18', '20', '24'],
  'Line spacing': ['1.4', '1.5', '1.75', '2'], 'Code syntax theme': ['Default', 'Light', 'Dark'],
  Transport: ['Streamable HTTP', 'SSE'], Engine: ['LlamaIndex', 'PageIndex', 'RAGAnything'],
  'Retrieval profile': ['Hybrid', 'Semantic', 'Keyword'], 'Account preset': ['User', 'Administrator'],
  Type: ['Persona', 'Skill'], 'Model type': ['Language', 'Embedding'],
  View: ['Agenda', 'Month', 'Week', 'Day'], 'View status': ['All', 'To do', 'In progress', 'Done'],
  'Import into': ['All questions', 'Mistakes'], 'Reasoning effort': ['Low', 'Medium', 'High'],
  'Avatar color': ['Green', 'Orange', 'Blue', 'Purple'],
};
export function paddingStyle(value: DesignNode['padding']): ViewStyle {
  if (typeof value === 'number') return { padding: value };
  if (!value?.length) return {};
  if (value.length === 2) return { paddingVertical: value[0], paddingHorizontal: value[1] };
  return { paddingTop: value[0], paddingRight: value[1], paddingBottom: value[2], paddingLeft: value[3] };
}
export function layerStyle(node: DesignNode, colors: MobileColors, horizontal = false): ViewStyle {
  const fill = node.width === 'fill_container';
  const border = typeof node.strokeWidth === 'number' ? { borderWidth: node.strokeWidth } : { borderBottomWidth: node.strokeWidth?.bottom };
  return {
    minWidth: 0, flexShrink: 1,
    ...(fill ? horizontal ? { flex: 1 } : { alignSelf: 'stretch' as const } : typeof node.width === 'number' ? { width: node.width } : {}),
    // Text and controls grow with Dynamic Type. Canvas heights describe minimums.
    ...(typeof node.height === 'number' ? { minHeight: node.height } : {}),
    flexDirection: node.layout === 'vertical' ? 'column' : 'row',
    alignItems: node.alignItems === 'start' ? 'flex-start' : node.alignItems === 'end' ? 'flex-end' : node.alignItems,
    justifyContent: node.justifyContent === 'space_between' ? 'space-between' : node.justifyContent === 'start' ? 'flex-start' : node.justifyContent === 'end' ? 'flex-end' : node.justifyContent,
    gap: node.gap, borderRadius: node.type === 'ellipse' ? 999 : node.cornerRadius,
    backgroundColor: node.type === 'text' ? undefined : colorOf(node.fill, colors), borderColor: colorOf(node.stroke, colors),
    ...border, ...paddingStyle(node.padding),
  };
}
function NativeField({ node, ctx }: { node: DesignNode; ctx: LayerContext }) {
  const label = labelOf(node);
  const surface = node.children?.[1];
  const source = surface ? textOf(surface) : '';
  const isSearch = /search|find a setting/i.test(label + source);
  const placeholder = isSearch || /…|\.\.\.|^Choose |^Type |^Enter |^https:\/\/$/.test(source);
  const value = ctx.values[node.name] ?? (placeholder ? '' : source);
  const options = fieldOptions[label];
  const secret = /password|credential|headers/i.test(label);
  const [focused, setFocused] = useState(false);
  const style: TextStyle = { fontFamily: 'Inter', fontSize: 16, lineHeight: 23, color: ctx.colors.ink, minHeight: 52, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, backgroundColor: ctx.colors.surface, borderWidth: focused ? 2 : 1, borderColor: focused ? ctx.colors.accent : ctx.colors['field-line'] };
  return <View style={{ alignSelf: 'stretch', gap: 8 }}>
    <Text style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: 14, lineHeight: 20, color: ctx.colors.muted }}>{label}</Text>
    {options ? <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint="Choose a value" onPress={() => ctx.chooseField(node, options)} style={[style, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}><Text style={{ color: ctx.colors.ink, fontFamily: 'Inter', fontSize: 16, flex: 1 }}>{value || source}</Text><ChevronRight color={ctx.colors.muted} size={20} /></Pressable>
      : <TextInput accessibilityLabel={label} value={value} placeholder={placeholder ? source : undefined} placeholderTextColor={ctx.colors.muted} secureTextEntry={secret} autoCapitalize={/url|origin|email|password|credential/i.test(label) ? 'none' : 'sentences'} autoCorrect={!/url|origin|email|password|credential/i.test(label)} keyboardType={/url|origin/i.test(label) ? 'url' : /email/i.test(label) ? 'email-address' : /seconds|tokens|characters|size|interval|rounds|budget|port|TTL|depth|ratio/i.test(label) ? 'decimal-pad' : 'default'} multiline={!secret && /answer|message|prompt|instructions|description|note/i.test(label)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChangeText={text => ctx.setValue(node, text)} style={style} returnKeyType={isSearch ? 'search' : 'default'} />}
  </View>;
}
export const NativeLayer = memo(function NativeLayer({ node, ctx, horizontal = false, selectedRow }: { node: DesignNode; ctx: LayerContext; horizontal?: boolean; selectedRow?: boolean }) {
  const [focused, setFocused] = useState(false);
  const style = layerStyle(node, ctx.colors, horizontal);
  if (/Software keyboard illustration/.test(node.name)) return null;
  if (node.type === 'text' && node.name !== 'Editor content') {
    const heading = /heading|title|greeting|objective/i.test(node.name) && (node.fontSize ?? 0) >= 18;
    return <Text accessibilityRole={heading ? 'header' : undefined} selectable style={[style, { backgroundColor: undefined, fontFamily: node.fontFamily === 'IBM Plex Mono' ? 'monospace' : 'Inter', fontSize: node.fontSize ?? 16, lineHeight: Math.round((node.fontSize ?? 16) * (node.lineHeight ?? 1.4)), fontWeight: (node.fontWeight === 'normal' ? '400' : node.fontWeight ?? '400') as TextStyle['fontWeight'], textAlign: node.textAlign, color: colorOf(node.fill, ctx.colors) ?? ctx.colors.ink }]}>{selectedRow !== undefined && /^(Not selected|Selected)$/.test(node.content ?? '') ? selectedRow ? 'Selected' : 'Not selected' : node.content}</Text>;
  }
  if (node.type === 'icon') {
    const Icon = icons[node.icon as keyof typeof icons] ?? ChevronRight;
    return <Icon size={typeof node.width === 'number' ? node.width : 20} color={colorOf(node.fill, ctx.colors)} />;
  }
  if (/ field$/i.test(node.name)) return <NativeField node={node} ctx={ctx} />;
  if (/ switch$/i.test(node.name)) {
    const labelNode = node.children?.[0];
    const label = labelNode ? labelOf(labelNode) : node.name;
    const on = ctx.values[node.name] === undefined ? /\bOn\b/.test(textOf(node)) : ctx.values[node.name] === 'true';
    return <View style={[style, { minHeight: 48, alignItems: 'center' }]}><View style={{ flex: 1, gap: 4 }}><Text style={{ fontFamily: 'Inter', color: ctx.colors.ink, fontSize: 16, fontWeight: '500' }}>{label}</Text><Text style={{ fontFamily: 'Inter', color: ctx.colors.muted, fontSize: 14 }}>{on ? 'On' : 'Off'}</Text></View><Switch accessibilityLabel={label} value={on} onValueChange={v => ctx.setValue(node, String(v))} trackColor={{ false: ctx.colors['switch-off'], true: ctx.colors.action }} thumbColor={ctx.colors['switch-thumb']} /></View>;
  }
  if (node.name === 'Editor content' || /^(Note|Markdown body|SOUL.md · Edit \/ Preview) section$/.test(node.name)) {
    const source = node.content ?? textOf(node).split('\n').slice(1).join('\n');
    return <TextInput accessibilityLabel={node.name === 'Editor content' ? 'Note body' : node.name.replace(' section', '')} multiline value={ctx.values[node.name] ?? source} onChangeText={value => ctx.setValue(node, value)} textAlignVertical="top" style={{ minHeight: 160, padding: 16, borderWidth: 1, borderColor: ctx.colors['field-line'], borderRadius: 10, fontFamily: 'Inter', fontSize: 16, lineHeight: 25, color: ctx.colors.ink, backgroundColor: ctx.colors.surface }} />;
  }
  const row = / row$/.test(node.name);
  if (row && ctx.query && !textOf(node).toLowerCase().includes(ctx.query.toLowerCase())) return null;
  const isChoice = row && ctx.selection;
  const selected = isChoice && ctx.selected === node.name;
  const interactive = row || / action$|Date \d+|Workspace switch|Account and settings|More actions|Back button/.test(node.name);
  const children: ReactNode = <>{node.children?.map(child => <NativeLayer key={child.id} node={child} ctx={ctx} horizontal={node.layout !== 'vertical'} selectedRow={isChoice ? selected : selectedRow} />)}</>;
  if (interactive) return <Pressable accessibilityRole={isChoice ? 'radio' : 'button'} accessibilityLabel={labelOf(node)} accessibilityState={isChoice ? { selected } : undefined} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onPress={() => ctx.act(node)} style={({ pressed }) => [style, { minHeight: Math.max(typeof node.height === 'number' ? node.height : 0, 48), opacity: pressed ? 0.7 : 1, ...(selected ? { backgroundColor: ctx.colors.soft, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: ctx.colors.accent, paddingLeft: 12 } : {}), ...(focused ? { outlineWidth: 2, outlineColor: ctx.colors.accent, outlineOffset: 2 } : {}) }]}>{children}</Pressable>;
  return <View style={style}>{children}</View>;
});
