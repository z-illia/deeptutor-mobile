import { useLayoutDimensions } from '@/hooks/use-layout-dimensions';
import { useState } from 'react';
import { Platform, Text, type TextProps, type TextStyle } from 'react-native';
import { useDesign } from '../design/DesignProvider';

export type TextRole = 'body' | 'small' | 'caption' | 'label' | 'title' | 'section' | 'learning' | 'code';
const roles: Record<TextRole, TextStyle> = {
  body: { fontSize: 14, lineHeight: 22.4 },
  small: { fontSize: 12.5, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 18 },
  label: { fontSize: 14, lineHeight: 20, fontFamily: 'GeistMedium' },
  title: { fontSize: 27, lineHeight: 32.4, letterSpacing: -0.675, fontFamily: 'GeistBold' },
  section: { fontSize: 13.5, lineHeight: 20, fontFamily: 'GeistSemiBold' },
  learning: { fontSize: 16, lineHeight: 28, fontFamily: 'Lora' },
  code: { fontSize: 14, lineHeight: 23.8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
};

export function DText({ role = 'body', muted = false, style, ...props }: Omit<TextProps, 'role'> & { role?: TextRole; muted?: boolean }) {
  const { colors, layout, preferences } = useDesign();
  const { width } = useLayoutDimensions();
  const [contentWidth, setContentWidth] = useState<number | null>(null);
  const titleSize = (contentWidth ?? width) >= 640 ? (layout === 'modern' ? 32 : 30) : 27;
  return <Text {...props} onLayout={(event) => { props.onLayout?.(event); if (role === 'title') setContentWidth(event.nativeEvent.layout.width); }} style={[
    { fontFamily: 'Geist', color: muted ? colors.mutedForeground : colors.foreground },
    roles[role],
    role === 'learning' && preferences && { fontSize: 16 * preferences.scale / 100, lineHeight: 16 * preferences.scale / 100 * { compact: 1.5, normal: 1.75, relaxed: 2 }[preferences.spacing] },
    role === 'title' && { fontSize: titleSize, lineHeight: titleSize * (layout === 'modern' ? 1.2 : 1.5), letterSpacing: titleSize * (layout === 'modern' ? -0.025 : -0.02), fontFamily: layout === 'classic' ? 'LoraSemiBold' : 'GeistBold' },
    style,
  ]} />;
}
