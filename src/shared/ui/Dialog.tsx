import { useRef, type ElementRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useDesign } from '../design/DesignProvider';
import { Button, IconButton } from './Controls';
import { DText } from './Text';
import { useOverlayFocus } from './use-overlay-focus';

export function Dialog({ open, title, children, onClose, busy = false, size = 'md', footer, onShow, placement = 'center' }: { open: boolean; title: string; children: ReactNode; onClose: () => void; busy?: boolean; size?: 'sm' | 'md' | 'lg' | 'xl'; footer?: ReactNode; onShow?: () => void; placement?: 'center' | 'bottom' }) {
  const { colors, t } = useDesign();
  const root = useRef<ElementRef<typeof View>>(null);
  useOverlayFocus(open, root, onClose, busy);
  return <Modal visible={open} transparent animationType="none" onRequestClose={() => { if (!busy) onClose(); }} onShow={onShow} statusBarTranslucent>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.overlay }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: placement === 'bottom' ? 'flex-end' : 'center' }}>
        <Pressable accessibilityLabel={t('Close')} disabled={busy} onPress={onClose} accessible={false} style={{ position: 'absolute', inset: 0 }} />
        <View ref={root} testID="shared-dialog" accessibilityViewIsModal role="dialog" accessibilityLabel={title} style={{ width: '100%', maxWidth: { sm: 384, md: 512, lg: 672, xl: 896 }[size], maxHeight: '90%', borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, boxShadow: colors.shadowRaised, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border, paddingLeft: 20, paddingRight: 8, paddingVertical: 8, gap: 12 }}><DText accessibilityRole="header" role="label" style={{ flex: 1, fontSize: 16, fontFamily: 'GeistSemiBold' }}>{title}</DText><IconButton label={t('Close')} disabled={busy} onPress={onClose}><X size={18} color={colors.mutedForeground} /></IconButton></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16 }}>{children}</ScrollView>
          {footer && <View style={{ borderTopWidth: 1, borderColor: colors.border, padding: 16, gap: 8 }}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}

export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onCancel, busy = false, tone = 'danger' }: { open: boolean; title: string; children?: ReactNode; confirmLabel: string; onConfirm: () => void; onCancel: () => void; busy?: boolean; tone?: 'default' | 'danger' }) {
  const { t } = useDesign();
  const cancel = useRef<ElementRef<typeof View>>(null);
  return <Dialog open={open} title={title} busy={busy} onClose={onCancel} size="sm" onShow={() => cancel.current?.focus()} footer={
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 }}>
      <Button ref={cancel} variant="ghost" disabled={busy} onPress={onCancel}>{t('Cancel')}</Button>
      <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={busy} onPress={onConfirm}>{confirmLabel}</Button>
    </View>
  }>{typeof children === 'string' ? <DText muted>{children}</DText> : children}</Dialog>;
}
