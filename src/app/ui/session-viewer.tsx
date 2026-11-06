import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EntryBoundary } from '@/features/entry/Boundary';
import { SessionViewerScreen } from '@/features/chat/SessionViewerScreen';
import { useDesign } from '@/shared/design/DesignProvider';

export default function SessionViewerRoute() {
  const { colors } = useDesign();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <EntryBoundary>
        <SessionViewerScreen />
      </EntryBoundary>
    </SafeAreaView>
  );
}
