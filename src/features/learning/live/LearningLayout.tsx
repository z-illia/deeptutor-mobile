import { useCopy } from '@/features/entry/copy';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '@/features/mobile/BottomNavigation';
import { MobileHeader } from '@/features/mobile/ScreenLayout';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { DText } from './LearningText';

export function LearningLayout({ title, children, root, loading, error, refresh, onWorkspace }: { title: string; children: ReactNode; root?: boolean; loading?: boolean; error?: string; refresh?: () => void; onWorkspace?: () => void }) {
  const t = useCopy();
  const { colors } = useDesign();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <MobileHeader title={title} root={root} fallback="/learning" onWorkspace={onWorkspace} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 24 }}>
        {loading && <LoadingState />}
        {!!error && <View style={{ gap: 12 }}><InlineAlert tone="danger">{t(error)}</InlineAlert><Button variant="secondary" onPress={refresh}>{t("Retry")}</Button></View>}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
    {root && <BottomNavigation activeScreen={1} />}
  </SafeAreaView>;
}
export function Heading({ children }: { children: ReactNode }) { return <DText accessibilityRole="header" style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: 28, lineHeight: 39 }}>{children}</DText>; }
