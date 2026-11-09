import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCopy } from '@/features/entry/copy';
import { BackButton } from '@/features/entry/Boundary';
import { useDesign } from '@/shared/design/DesignProvider';
import { PageScaffold } from '@/shared/ui/Layout';
import { WorkspaceList } from './WorkspaceList';

export function WorkspaceScreen() {
  const t = useCopy();
  const { colors } = useDesign();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <PageScaffold title={t('Switch workspace')}>
      <BackButton />
      <WorkspaceList onSelected={() => router.replace('/learning')} />
    </PageScaffold>
  </SafeAreaView>;
}
