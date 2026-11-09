import { useState, type ComponentProps, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, type TextInputProps, type TextProps } from 'react-native';
import { router, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { Dialog } from '@/shared/ui/Dialog';
import { Button, Field } from '@/shared/ui/Controls';
import { useCopy } from '@/features/entry/copy';
import { BottomNavigation } from './BottomNavigation';

export function MobileText({ muted, style, ...props }: TextProps & { muted?: boolean }) {
  const { colors } = useDesign();
  return <Text {...props} style={[{ fontFamily: 'Inter', fontSize: muted ? 14 : 16, lineHeight: muted ? 20 : 23, color: muted ? colors.mutedForeground : colors.foreground }, style]} />;
}
export function MobilePage({ title, children, footer, fallback = '/mobile/61', tab }: { title: string; children: ReactNode; footer?: ReactNode; fallback?: Href; tab?: number }) {
  const { colors } = useDesign(); const t = useCopy();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingLeft: 12, paddingRight: 20, paddingBottom: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Back')} onPress={() => router.canGoBack() ? router.back() : router.replace(fallback)} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={24} color={colors.foreground} /></Pressable>
        <MobileText accessibilityRole="header" style={{ flex: 1, fontSize: 22, lineHeight: 31, fontWeight: '600' }}>{title}</MobileText>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 24 }}>{children}</ScrollView>
      {footer && <View style={{ padding: 20, gap: 12, borderTopWidth: 1, borderColor: colors.border }}>{footer}</View>}
      {tab !== undefined && <BottomNavigation activeScreen={tab} />}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function MobileRow({ title, description, selected, children, ...props }: Omit<ComponentProps<typeof Pressable>, 'children'> & { title: string; description?: string; selected?: boolean; children?: ReactNode }) {
  const { colors } = useDesign();
  return <Pressable {...props} accessibilityRole={props.accessibilityRole ?? 'button'} accessibilityLabel={props.accessibilityLabel ?? title} aria-selected={selected} accessibilityState={{ ...props.accessibilityState, selected }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, opacity: props.disabled ? 0.5 : pressed ? 0.65 : 1 })}>
    <View style={{ flex: 1, gap: 4 }}><MobileText style={{ fontWeight: '500' }}>{title}</MobileText>{!!description && <MobileText muted>{description}</MobileText>}</View>{children ?? (selected ? <Check size={20} color={colors.primary} /> : <ChevronRight size={20} color={colors.mutedForeground} />)}
  </Pressable>;
}
export function MobileField(props: TextInputProps & { label: string }) {
  const { colors } = useDesign();
  return <Field {...props} labelStyle={{ fontFamily: 'Inter', fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.mutedForeground }} style={[{ fontFamily: 'Inter', fontSize: 16, lineHeight: 23, minHeight: 52, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.card }, props.style]} />;
}
export function MobileAction({ children, ...props }: ComponentProps<typeof Button>) {
  const { colors } = useDesign();
  return <Button {...props} style={[{ minHeight: 52, borderRadius: 12, backgroundColor: props.variant === 'secondary' ? colors.card : props.variant === 'ghost' ? 'transparent' : props.variant === 'danger' ? colors.destructive : colors.primary }, typeof props.style !== 'function' ? props.style : undefined]}><MobileText style={{ textAlign: 'center', fontWeight: '600', color: props.variant === 'primary' || !props.variant ? colors.primaryForeground : props.variant === 'danger' ? colors.destructiveForeground : colors.primary }}>{children}</MobileText></Button>;
}

export function MobileChoice<T extends string>({ label, value, options, onChange, disabled = false }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(''); const { colors } = useDesign(); const t = useCopy();
  return <View style={{ gap: 8 }}><MobileText muted style={{ fontWeight: '600' }}>{label}</MobileText>
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, expanded: open }} disabled={disabled} onPress={() => { setQuery(''); setOpen(true); }} style={{ minHeight: 52, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.input, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}><MobileText style={{ flex: 1 }}>{options.find(option => option.value === value)?.label ?? value}</MobileText><ChevronRight size={20} color={colors.mutedForeground} /></Pressable>
    <Dialog placement="bottom" open={open} title={label} onClose={() => setOpen(false)}>
      {options.length > 10 && <MobileField label={t('Search')} value={query} onChangeText={setQuery} />}
      {options.filter(option => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(option => <MobileRow key={option.value} title={option.label} selected={value === option.value} onPress={() => { onChange(option.value); setOpen(false); }} />)}
    </Dialog>
  </View>;
}
