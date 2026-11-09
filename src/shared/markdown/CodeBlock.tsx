import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useDesign } from '@/shared/design/DesignProvider';
import { geometry } from '@/shared/design/tokens';
import { useCopy } from '@/features/entry/copy';
import { highlight } from './highlight';

export const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
export const CodeBlock = memo(function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const { colors } = useDesign();
  const t = useCopy();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(timer.current); }; }, []);
  const tokens = useMemo(() => highlight(code, language), [code, language]);
  const tokenColor = (type?: string) => type === 'comment' ? colors.mutedForeground : ['keyword', 'operator', 'boolean'].includes(type ?? '') ? colors.primary : ['string', 'char', 'attr-value'].includes(type ?? '') ? colors.success : ['number', 'function', 'class-name'].includes(type ?? '') ? colors.info : colors.foreground;
  return <View style={{ minWidth: 0, maxWidth: '100%', marginVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: geometry.radius.lg, backgroundColor: colors.card, overflow: 'hidden' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 12, borderBottomWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: colors.mutedForeground, fontFamily: mono, fontSize: 12, flexShrink: 1 }}>{language}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Copy code block')} style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' }} onPress={async () => {
        try { await Clipboard.setStringAsync(code); if (!mounted.current) return; setCopied(true); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 1600); }
        catch { Alert.alert(t('Copy'), t('Unable to copy this code. Please try again.')); }
      }}><Text accessibilityLiveRegion="polite" style={{ color: colors.primary, fontSize: 12 }}>{t(copied ? 'Copied' : 'Copy')}</Text></Pressable>
    </View>
    <ScrollView horizontal nestedScrollEnabled contentContainerStyle={{ padding: 12 }}>
      <Text selectable style={{ fontFamily: mono, fontSize: 12, lineHeight: 19, flexShrink: 0, color: colors.foreground }}>{tokens.map((token, i) => <Text key={i} style={{ color: tokenColor(token.type) }}>{token.text}</Text>)}</Text>
    </ScrollView>
  </View>;
});
