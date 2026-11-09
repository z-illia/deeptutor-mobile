import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, PanelLeft, CircleUserRound } from 'lucide-react-native';
import { BottomNavigation } from '@/features/mobile/BottomNavigation';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, IconButton } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { DText } from './LearningText';

export function LearningLayout({ title, children, root, loading, error, refresh, onWorkspace }: { title: string; children: ReactNode; root?: boolean; loading?: boolean; error?: string; refresh?: () => void; onWorkspace?: () => void }) {
  const { colors } = useDesign();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ paddingHorizontal: 12, minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {root && <IconButton label="Switch workspace" onPress={onWorkspace}><PanelLeft size={22} color={colors.foreground} /></IconButton>}
        {!root && <IconButton label="Back" onPress={() => router.canGoBack() ? router.back() : router.replace('/learning')}><ChevronLeft color={colors.foreground} size={24} /></IconButton>}
        <DText accessibilityRole="header" style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: 22, flex: 1, paddingLeft: 0 }}>{title}</DText>
        {root && <IconButton label="Account" onPress={() => router.push('/mobile/61')}><CircleUserRound size={24} color={colors.foreground} /></IconButton>}
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 24 }}>
        {loading && <LoadingState />}
        {!!error && <View style={{ gap: 12 }}><InlineAlert tone="danger">{error}</InlineAlert><Button variant="secondary" onPress={refresh}>Retry</Button></View>}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
    {root && <BottomNavigation activeScreen={1} />}
  </SafeAreaView>;
}
export function Heading({ children }: { children: ReactNode }) { return <DText accessibilityRole="header" style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: 28, lineHeight: 39 }}>{children}</DText>; }
