import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Switch, TextInput, View, type TextInputProps, type StyleProp, type TextStyle } from 'react-native';
import { useDesign } from '../design/DesignProvider';
import { alpha, geometry } from '../design/tokens';
import { DText } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export function Button({ children, variant = 'primary', size = 'md', loading = false, icon, style, disabled, ...props }: ComponentProps<typeof Pressable> & { children: ReactNode; variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg'; loading?: boolean; icon?: ReactNode }) {
  const { colors } = useDesign();
  const [focused, setFocused] = useState(false);
  const foreground = variant === 'primary' ? colors.primaryForeground : variant === 'danger' ? colors.destructiveForeground : variant === 'ghost' ? colors.mutedForeground : colors.secondaryForeground;
  const background = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.destructive : variant === 'secondary' ? colors.secondary : 'transparent';
  return <Pressable {...props} aria-selected={props['aria-selected'] ?? props.accessibilityState?.selected} aria-busy={loading || props['aria-busy']} aria-disabled={!!disabled || loading} disabled={disabled || loading} accessibilityRole={props.accessibilityRole ?? 'button'} accessibilityState={{ ...props.accessibilityState, disabled: !!disabled || loading, busy: loading }}
    onFocus={(event) => { setFocused(true); props.onFocus?.(event); }} onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
    style={(state) => [{ minHeight: geometry.touch, minWidth: geometry.touch, paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 20 : 16, paddingVertical: 8, borderRadius: size === 'sm' ? 8 : 12, borderWidth: 1, borderColor: focused ? colors.ring : variant === 'secondary' ? colors.border : 'transparent', backgroundColor: state.pressed && variant === 'ghost' ? colors.accent : background, opacity: disabled || loading ? 0.5 : state.pressed ? 0.9 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: focused ? `0 0 0 2px ${alpha(colors.ring, 0.3)}` : undefined }, typeof style === 'function' ? style(state) : style]}>
    {loading ? <ActivityIndicator color={foreground} size="small" /> : icon}
    {typeof children === 'string' || typeof children === 'number' || (Array.isArray(children) && children.every(child => child == null || typeof child === 'string' || typeof child === 'number' || child === false)) ? <DText style={{ color: foreground, fontFamily: 'GeistMedium', fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14 }}>{children}</DText> : children}
  </Pressable>;
}

export function IconButton({ label, children, ...props }: Omit<ComponentProps<typeof Pressable>, 'children'> & { label: string; children: ReactNode }) {
  return <Button {...props} accessibilityLabel={label} variant="ghost" style={[{ width: geometry.touch, height: geometry.touch, paddingHorizontal: 0 }, typeof props.style !== 'function' ? props.style : undefined]}>{children}</Button>;
}

export function Field({ label, labelStyle, hint, error, optional, trailing, style, ...props }: TextInputProps & { label: string; labelStyle?: StyleProp<TextStyle>; hint?: string; error?: string; optional?: boolean; trailing?: ReactNode }) {
  const { colors, t } = useDesign();
  const id = useId();
  const [focused, setFocused] = useState(false);
  return <View style={{ gap: 6, minWidth: 0 }}>
    <DText role="label" style={labelStyle} nativeID={`${id}-label`}>{label}{optional ? ` (${t('Optional')})` : ''}</DText>
    <View style={{ position: 'relative', justifyContent: 'center' }}>
      <TextInput {...props} accessibilityLabel={label} accessibilityHint={error || hint} aria-invalid={!!error}
        placeholderTextColor={colors.mutedForeground} onFocus={(event) => { setFocused(true); props.onFocus?.(event); }} onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
        style={[{ minHeight: 48, borderWidth: 1, borderColor: error ? colors.destructive : focused ? colors.ring : colors.input, borderRadius: 8, paddingHorizontal: 24, paddingRight: trailing ? 56 : 12, paddingVertical: 10, fontFamily: 'Geist', fontSize: 14, color: colors.foreground, backgroundColor: colors.background, boxShadow: focused ? `0 0 0 2px ${alpha(colors.ring, 0.15)}` : undefined }, style]} />
      {!!trailing && <View style={{ position: 'absolute', right: 8, top: 8, bottom: 8, justifyContent: 'center', alignItems: 'center' }}>{trailing}</View>}
    </View>
    {!!hint && <DText role="caption" muted>{hint}</DText>}
    {!!error && <DText role="caption" accessibilityRole="alert" style={{ color: colors.destructive }}>{t(error)}</DText>}
  </View>;
}

export function Toggle({ label, value, onChange, disabled = false }: { label: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  const { colors } = useDesign();
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 48 }}>
    <DText style={{ flex: 1 }}>{label}</DText><Switch accessibilityLabel={label} value={value} onValueChange={onChange} disabled={disabled} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.primaryForeground} ios_backgroundColor={colors.muted} />
  </View>;
}

export function Tabs<T extends string>({ options, value, onChange, label }: { options: readonly { value: T; label: string }[]; value: T; onChange: (value: T) => void; label: string }) {
  const { colors } = useDesign();
  return <View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
    {options.map((option) => <Button key={option.value} accessibilityRole="tab" accessibilityState={{ selected: value === option.value }} variant="ghost" onPress={() => onChange(option.value)} style={{ backgroundColor: value === option.value ? colors.accent : 'transparent' }}>{option.label}</Button>)}
  </View>;
}
