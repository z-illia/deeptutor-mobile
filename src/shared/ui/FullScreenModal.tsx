import { useRef, type ElementRef, type ReactNode } from 'react';
import { Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useDesign } from '../design/DesignProvider';
import { IconButton } from './Controls';
import { DText } from './Text';
import { useOverlayFocus } from './use-overlay-focus';

export function FullScreenModal({ open, title, onClose, onShow, children }: { open: boolean; title: string; onClose: () => void; onShow?: () => void; children: ReactNode }) {
  const { colors, t } = useDesign();
  const root = useRef<ElementRef<typeof View>>(null);
  useOverlayFocus(open, root, onClose, false);
  return <Modal visible={open} animationType="slide" onRequestClose={onClose} onShow={onShow}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View ref={root} accessibilityViewIsModal role="dialog" accessibilityLabel={title} style={{ flex: 1 }}>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <DText accessibilityRole="header" style={{ flex: 1, fontSize: 22 }}>{title}</DText>
          <IconButton label={t('Close')} onPress={onClose}><X size={22} color={colors.foreground} /></IconButton>
        </View>
        {children}
      </View>
    </SafeAreaView>
  </Modal>;
}
