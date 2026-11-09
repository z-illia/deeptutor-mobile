import { useRef, type ElementRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useDesign } from '../design/DesignProvider';
import { IconButton } from './Controls';
import { DText } from './Text';
import { useOverlayFocus } from './use-overlay-focus';

export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const { colors } = useDesign();
  const insets = useSafeAreaInsets();
  const root = useRef<ElementRef<typeof View>>(null);
  useOverlayFocus(open, root, onClose, false);
  return <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16), paddingTop: insets.top + 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Dismiss ${title}`} onPress={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: colors.overlay }} />
      <View ref={root} role="dialog" accessibilityViewIsModal accessibilityLabel={title} style={{ maxHeight: '85%', width: '100%', maxWidth: 600, alignSelf: 'center', backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><DText accessibilityRole="header" style={{ flex: 1, fontSize: 16 }}>{title}</DText><IconButton label={`Close ${title}`} onPress={onClose}><X size={20} color={colors.foreground} /></IconButton></View>
        {children}
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
