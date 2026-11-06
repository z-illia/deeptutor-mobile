import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EntryBoundary } from '@/features/entry/Boundary';
import { FilePreviewScreen } from '@/features/chat/FilePreviewScreen';
import { useDesign } from '@/shared/design/DesignProvider';

export default function FilePreviewRoute() {
  const { colors } = useDesign();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <EntryBoundary>
        <FilePreviewScreen />
      </EntryBoundary>
    </SafeAreaView>
  );
}
