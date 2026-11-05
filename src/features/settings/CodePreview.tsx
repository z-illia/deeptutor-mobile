import { ScrollView, View } from 'react-native';
import { DText } from '@/shared/ui/Text';
import fixture from './code-preview.json';
import type { Preferences } from '../entry/model';
// Fixed source Python preview, tokenized at extraction time; no code execution.
export function CodePreview({ preferences }: { preferences: Preferences }) {
  const themes: Record<string, Record<string, Record<string, string | number>>> = fixture.styles;
  const theme = themes[preferences.codeTheme] || themes.oneDark;
  const base = theme['code[class*="language-"]'] || {};
  const pre = theme['pre[class*="language-"]'] || {};
  const background = String(pre.backgroundColor || pre.background || base.background || 'transparent');
  const content = <View style={{ padding: 16, borderRadius: 8, backgroundColor: /^(#|rgb|hsl|transparent|[a-z]+$)/i.test(background) ? background : 'transparent' }} testID="code-preview">
    {fixture.lines.map((line, i) => <View key={i} style={{ flexDirection: 'row' }}>
      {preferences.lineNumbers && <DText role="code" muted style={{ width: 32, flexShrink: 0, color: String(base.color || '#abb2bf') }}>{String(i + 1)}</DText>}
      <DText role="code" style={{ flex: preferences.wrap ? 1 : undefined, color: String(base.color || '#abb2bf'), fontSize: 13 }}>{line.map((token, j) => {
        const style = theme[token.type] || {};
        return <DText key={j} role="code" style={{ fontSize: 13, color: String(style.color || base.color || '#abb2bf'), fontStyle: style.fontStyle === 'italic' ? 'italic' : 'normal', fontWeight: style.fontWeight === 'bold' ? 'bold' : 'normal' }}>{token.text}</DText>;
      })}{line.length === 0 ? ' ' : ''}</DText>
    </View>)}
  </View>;
  return preferences.wrap ? content : <ScrollView horizontal keyboardShouldPersistTaps="handled">{content}</ScrollView>;
}
