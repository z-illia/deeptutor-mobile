import { useCopy } from '@/features/entry/copy';
import { memo, useDeferredValue, useMemo, useEffect, type ReactNode } from 'react';
import { Alert, Linking, ScrollView, Text, View, type TextStyle } from 'react-native';
import type { Root, RootContent, Definition } from 'mdast';
import { useDesign } from '@/shared/design/DesignProvider';
import { geometry } from '@/shared/design/tokens';
import { contentFingerprint, richDiagnostic } from './diagnostics';
import { MathExpression } from './MathExpression';
import { CodeBlock, mono } from './CodeBlock';
import { parseMarkdown, safeExternalUrl } from './parser';

type Node = RootContent | Root;
export async function openMarkdownLink(value: string, t: (key: string) => string = key => key) {
  const url = safeExternalUrl(value);
  if (!url) { Alert.alert(t('Unable to open link'), t('This link uses an unsupported address.')); return; }
  try { await Linking.openURL(url); }
  catch { Alert.alert(t('Unable to open link'), t('Please check your connection or installed apps and try again.')); }
}

export const RichMarkdownRenderer = memo(function RichMarkdownRenderer({ content }: { content: string }) {
  const { colors } = useDesign();
  const t = useCopy();
  const deferred = useDeferredValue(content);
  const tree = useMemo(() => parseMarkdown(deferred), [deferred]);
  useEffect(() => {
    if (typeof __DEV__ === 'undefined' || !__DEV__) return;
    let mathNodes = 0;
    const count = (node: Node) => { if (node.type === 'math' || node.type === 'inlineMath') mathNodes++; if ('children' in node) node.children.forEach(child => count(child as Node)); };
    count(tree);
    richDiagnostic('renderer-mounted', { fingerprint: contentFingerprint(deferred), length: deferred.length, mathNodes });
  }, [tree, deferred]);
  const definitions = useMemo(() => {
    const result = new Map<string, Definition>();
    const visit = (node: Node) => { if (node.type === 'definition') result.set(node.identifier.toUpperCase(), node); if ('children' in node) node.children.forEach(child => visit(child as Node)); };
    visit(tree); return result;
  }, [tree]);
  const body: TextStyle = { fontFamily: 'Inter', fontSize: 14, lineHeight: 22, color: colors.foreground, flexShrink: 1 };
  const children = (node: Node, compact = false): ReactNode => 'children' in node ? node.children.map((child, i) => render(child as Node, String(i), compact)) : null;
  const render = (node: Node, key: string, compact = false): ReactNode => {
    switch (node.type) {
      case 'root': return children(node);
      case 'text': return node.value;
      case 'paragraph': return <Text key={key} selectable style={[body, { marginBottom: compact ? 6 : 12 }]}>{children(node)}</Text>;
      case 'heading': {
        const sizes = [21, 18, 16, 15, 14, 14], heights = [27, 24, 22, 21, 21, 21];
        return <Text key={key} accessibilityRole="header" selectable style={[body, { fontSize: sizes[node.depth - 1], lineHeight: heights[node.depth - 1], fontWeight: '600', marginTop: key === '0' ? 0 : 10, marginBottom: 10 }]}>{children(node)}</Text>;
      }
      case 'strong': return <Text key={key} style={{ fontWeight: '600' }}>{children(node)}</Text>;
      case 'emphasis': return <Text key={key} style={{ fontStyle: 'italic' }}>{children(node)}</Text>;
      case 'delete': return <Text key={key} style={{ textDecorationLine: 'line-through' }}>{children(node)}</Text>;
      case 'inlineCode': return <Text key={key} style={{ fontFamily: mono, fontSize: 13, backgroundColor: colors.secondary, paddingHorizontal: 3, borderRadius: geometry.radius.sm }}>{node.value}</Text>;
      case 'code': return <CodeBlock key={key} code={node.value} language={node.lang || 'text'} />;
      case 'link': case 'linkReference': {
        const url = node.type === 'link' ? node.url : definitions.get(node.identifier.toUpperCase())?.url;
        return <Text key={key} accessibilityRole="link" style={{ color: colors.primary, textDecorationLine: 'underline' }} onPress={() => void openMarkdownLink(url ?? '', t)}>{children(node)}</Text>;
      }
      case 'break': return '\n';
      case 'list': return <View key={key} style={{ marginBottom: compact ? 4 : 12, gap: 4 }}>{node.children.map((item, i) => <View key={i} style={{ flexDirection: 'row', gap: 8 }}><Text style={[body, { minWidth: 18 }]}>{item.checked != null ? item.checked ? '☑' : '☐' : node.ordered ? `${(node.start ?? 1) + i}.` : '•'}</Text><View style={{ flex: 1, minWidth: 0 }}>{children(item, true)}</View></View>)}</View>;
      case 'listItem': return <View key={key}>{children(node)}</View>;
      case 'blockquote': return <View key={key} style={{ borderLeftWidth: 3, borderColor: colors.primary, backgroundColor: colors.secondary, padding: 12, marginVertical: 10, borderRadius: geometry.radius.sm }}>{children(node, true)}</View>;
      case 'thematicBreak': return <View key={key} style={{ height: 1, backgroundColor: colors.border, marginVertical: 18 }} />;
      case 'table': return <ScrollView key={key} horizontal nestedScrollEnabled style={{ maxWidth: '100%', marginVertical: 12 }}><View accessibilityLabel={t('Table')} style={{ borderWidth: 1, borderColor: colors.border }}>{node.children.map((row, ri) => <View key={ri} style={{ flexDirection: 'row', backgroundColor: ri === 0 ? colors.secondary : colors.background }}>{row.children.map((cell, ci) => <Text key={ci} selectable style={[body, { width: 160, padding: 10, borderWidth: 0.5, borderColor: colors.border, fontWeight: ri === 0 ? '600' : '400', textAlign: node.align?.[ci] ?? 'left' }]}>{children(cell)}</Text>)}</View>)}</View></ScrollView>;
      case 'image': case 'imageReference': return <Text key={key} style={body}>{node.alt}</Text>;
      case 'html': return <Text key={key} style={body}>{node.value}</Text>;
      case 'definition': return null;
      default: {
        // remark-math adds these nodes to the CommonMark tree.
        const value = node as { type: string; value?: string; data?: { pendingMath?: boolean } };
        if (value.type === 'math') return <MathExpression key={key} display pending={!!value.data?.pendingMath} source={value.value ?? ''} />;
        if (value.type === 'inlineMath') return <MathExpression key={key} source={value.value ?? ''} />;
        return 'children' in node ? <View key={key}>{children(node)}</View> : null;
      }
    }
  };
  return <View style={{ minWidth: 0, maxWidth: '100%' }}>{render(tree, 'root')}</View>;
});
