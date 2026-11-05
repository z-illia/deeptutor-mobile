import { useLayoutDimensions } from '@/hooks/use-layout-dimensions';
import { KeyboardAvoidingView, Platform, ScrollView, View, type ViewProps } from 'react-native';
import { useDesign } from '../design/DesignProvider';
import { geometry } from '../design/tokens';
import { DText } from './Text';

export function Surface({ raised = false, style, ...props }: ViewProps & { raised?: boolean }) {
  const { colors } = useDesign();
  return <View {...props} style={[{ backgroundColor: raised ? colors.surfaceRaised : colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 20, gap: 16, boxShadow: raised ? colors.shadowRaised : undefined }, style]} />;
}
export function PageScaffold({ children, title, description }: React.PropsWithChildren<{ title?: string; description?: string }>) {
  const { colors, layout } = useDesign();
  const { width } = useLayoutDimensions();
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ width: '100%', maxWidth: geometry.pageMax, alignSelf: 'center', paddingHorizontal: width >= geometry.tablet ? 36 : 24, paddingTop: layout === 'modern' ? (width >= geometry.desktop ? 64 : 48) : (width >= geometry.desktop ? 36 : 28), paddingBottom: 36, gap: 24 }}>
        {!!title && <View style={{ gap: 8 }}><DText role="title" accessibilityRole="header">{title}</DText>{description && <DText role={layout === 'classic' ? 'small' : 'body'} muted>{description}</DText>}</View>}
        {children}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
