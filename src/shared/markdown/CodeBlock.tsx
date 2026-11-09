import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useDesign } from '@/shared/design/DesignProvider';
import { geometry } from '@/shared/design/tokens';
import { useCopy } from '@/features/entry/copy';
import { highlight } from './highlight';
import syntax from '@/features/settings/code-preview.json';

export const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
export const CodeBlock = memo(function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const { colors, preferences } = useDesign();
  const t = useCopy();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(timer.current); }; }, []);
  const tokens = useMemo(() => highlight(code, language), [code, language]);
  const themes: Record<string, Record<string, Record<string, string | number>>> = syntax.styles;
  const theme = preferences ? themes[preferences.codeTheme] ?? themes.oneDark : {};
  const base = theme['code[class*="language-"]'] ?? {};
  const pre = theme['pre[class*="language-"]'] ?? {};
  const background = String(pre.backgroundColor ?? pre.background ?? base.background ?? colors.card);
  const foreground = String(base.color ?? colors.foreground);
  const tokenColor = (type?: string) => String(theme[type ?? '']?.color ?? (preferences ? foreground : type === 'comment' ? colors.mutedForeground : ['keyword', 'operator', 'boolean'].includes(type ?? '') ? colors.primary : ['string', 'char', 'attr-value'].includes(type ?? '') ? colors.success : ['number', 'function', 'class-name'].includes(type ?? '') ? colors.info : colors.foreground));
  const lines = useMemo(() => {
    const rows: (typeof tokens)[] = [[]];
    for (const token of tokens) token.text.split('\n').forEach((text, index) => {
      if (index) rows.push([]);
      rows[rows.length - 1].push({ ...token, text });
    });
    return rows;
  }, [tokens]);
  const tokenText = (items: typeof tokens) => items.map((token, i) => <Text key={i} style={{ color: tokenColor(token.type), fontStyle: theme[token.type ?? '']?.fontStyle === 'italic' ? 'italic' : 'normal' }}>{token.text}</Text>);
  const content = <View style={{ padding: 12, minWidth: 0, ...(preferences?.wrap ? { width: '100%' } : {}) }}>
    {preferences?.lineNumbers ? lines.map((line, index) => <View key={index} style={{ flexDirection: 'row' }}>
      <Text accessibilityLabel={String(index + 1)} style={{ fontFamily: mono, fontSize: 12, lineHeight: 19, width: Math.max(32, String(lines.length).length * 10 + 12), color: foreground, opacity: 0.6 }}>{index + 1}</Text>
      <Text selectable style={{ fontFamily: mono, fontSize: 12, lineHeight: 19, color: foreground, ...(preferences.wrap ? { flex: 1, flexShrink: 1 } : {}) }}>{line.length ? tokenText(line) : ' '}</Text>
    </View>) : <Text selectable style={{ fontFamily: mono, fontSize: 12, lineHeight: 19, flexShrink: preferences?.wrap ? 1 : 0, color: foreground }}>{tokenText(tokens)}</Text>}
  </View>;
  return <View testID="markdown-code-block" style={{ minWidth: 0, maxWidth: '100%', marginVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: geometry.radius.lg, backgroundColor: /^(#|rgb|hsl|transparent|[a-z]+$)/i.test(background) ? background : colors.card, overflow: 'hidden' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 12, borderBottomWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: colors.mutedForeground, fontFamily: mono, fontSize: 12, flexShrink: 1 }}>{language}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Copy code block')} style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' }} onPress={async () => {
        try { await Clipboard.setStringAsync(code); if (!mounted.current) return; setCopied(true); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 1600); }
        catch { Alert.alert(t('Copy'), t('Unable to copy this code. Please try again.')); }
      }}><Text accessibilityLiveRegion="polite" style={{ color: colors.primary, fontSize: 12 }}>{t(copied ? 'Copied' : 'Copy')}</Text></Pressable>
    </View>
    {preferences?.wrap ? content : <ScrollView horizontal nestedScrollEnabled>{content}</ScrollView>}
  </View>;
});
