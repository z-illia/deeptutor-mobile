import type { ComponentProps, ReactNode } from 'react';
import { Pressable, View, type StyleProp, type TextStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { useDesign } from '../design/DesignProvider';
import { DText } from './Text';

export function ListRow({ title, description, badge, selected, style, titleStyle, descriptionStyle, ...props }: Omit<ComponentProps<typeof Pressable>, 'children'> & { title: string; description?: ReactNode; badge?: ReactNode; selected?: boolean; titleStyle?: StyleProp<TextStyle>; descriptionStyle?: StyleProp<TextStyle> }) {
  const { colors } = useDesign();
  return <Pressable {...props} accessibilityRole={props.accessibilityRole ?? 'button'} accessibilityState={{ ...props.accessibilityState, ...(selected === undefined ? {} : { selected }) }} style={state => [{ minHeight: 52, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.accent : state.pressed ? colors.secondary : colors.card, flexDirection: 'row', alignItems: 'center', gap: 8 }, typeof style === 'function' ? style(state) : style]}>
    <View style={{ flex: 1, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}><DText role="label" style={[{ flexShrink: 1 }, titleStyle]}>{title}</DText>{badge}</View>
      {typeof description === 'string' ? <DText role="small" muted style={descriptionStyle}>{description}</DText> : description}
    </View>
    {selected && <Check size={16} color={colors.primary} />}
  </Pressable>;
}
