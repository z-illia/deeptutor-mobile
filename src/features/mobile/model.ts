export interface DesignNode {
  id: string;
  name: string;
  type: 'frame' | 'text' | 'icon' | 'ellipse';
  width?: number | string;
  height?: number | string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | { bottom?: number };
  cornerRadius?: number;
  layout?: 'vertical' | 'horizontal' | 'none';
  gap?: number;
  padding?: number | number[];
  alignItems?: 'center' | 'start' | 'end';
  justifyContent?: 'center' | 'space_between' | 'start' | 'end';
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  icon?: string;
  children?: DesignNode[];
}
export interface MobileSpec {
  number: number;
  id: string;
  name: string;
  header: DesignNode;
  content: DesignNode;
  tabs: boolean;
}
// A build-time snapshot of editable Pencil layers, never screenshots or HTML.
export const screens = require('./screens.json') as MobileSpec[];
export const screenByNumber = new Map(screens.map(screen => [screen.number, screen]));
export function textOf(node: DesignNode): string {
  return [node.content, ...(node.children ?? []).map(textOf)].filter(Boolean).join('\n');
}
export function labelOf(node: DesignNode): string {
  return textOf(node).split('\n')[0] || node.name;
}
export function allNodes(node: DesignNode): DesignNode[] {
  return [node, ...(node.children ?? []).flatMap(allNodes)];
}
export function disclosure(id: string, title: string, description: string): DesignNode {
  return { id, name: `${title} row`, type: 'frame', width: 'fill_container', gap: 12, padding: [14, 0], alignItems: 'center', stroke: '$m-line', strokeWidth: { bottom: 1 }, children: [
    { id: `${id}:text`, type: 'frame', name: 'Row text', width: 'fill_container', layout: 'vertical', gap: 4, children: [
      { id: `${id}:title`, type: 'text', name: 'Row title', content: title, fill: '$m-ink', width: 'fill_container', fontSize: 16, fontWeight: '500', lineHeight: 1.4 },
      { id: `${id}:description`, type: 'text', name: 'Row description', content: description, fill: '$m-muted', width: 'fill_container', fontSize: 14, lineHeight: 1.4 },
    ] },
    { id: `${id}:arrow`, type: 'icon', name: 'Disclosure', icon: 'chevron-right', width: 20, height: 20, fill: '$m-muted' },
  ] };
}
export const mobilePalette = {
  light: { bg: '#F5F7FA', surface: '#FFFFFF', ink: '#172C2B', muted: '#526463', accent: '#176554', soft: '#E4F1EC', line: '#D9E2E0', danger: '#AB343C', action: '#176554', 'on-action': '#FFFFFF', 'danger-action': '#AB343C', 'error-surface': '#FCEDEF', 'feature-bg': '#172C2B', 'code-bg': '#172C2B', 'code-text': '#E3F1EC', 'feature-muted': '#C8DCD7', keyboard: '#DDE3E5', 'switch-off': '#7C8D8A', 'on-feature': '#FFFFFF', 'switch-thumb': '#FFFFFF', 'on-danger': '#FFFFFF', 'field-line': '#D9E2E0' },
  dark: { bg: '#1A1918', surface: '#242220', ink: '#E8E4DE', muted: '#9B9590', accent: '#D4734B', soft: '#282523', line: '#3A3634', danger: '#EF8D7D', action: '#D4734B', 'on-action': '#1A1918', 'danger-action': '#B73F33', 'error-surface': '#382522', 'feature-bg': '#23211F', 'code-bg': '#242220', 'code-text': '#E8E4DE', 'feature-muted': '#9B9590', keyboard: '#302D2A', 'switch-off': '#746D66', 'on-feature': '#E8E4DE', 'switch-thumb': '#FFFFFF', 'on-danger': '#FFFFFF', 'field-line': '#746D66' },
} as const;
export type MobileColors = { [K in keyof typeof mobilePalette.light]: string };
export function colorOf(value: string | undefined, colors: MobileColors): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('$m-')) return colors[value.slice(3) as keyof MobileColors];
  const key = Object.entries(mobilePalette.light).find(([, color]) => color.toLowerCase() === value.toLowerCase())?.[0];
  return key ? colors[key as keyof MobileColors] : value;
}
