import { SafeAreaView } from 'react-native-safe-area-context';
import { EntryBoundary } from '@/features/entry/Boundary';
import { SearchScreen } from '@/features/search/SearchScreen';
import { useDesign } from '@/shared/design/DesignProvider';
export default function Screen() { const { colors } = useDesign(); return <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}><EntryBoundary><SearchScreen /></EntryBoundary></SafeAreaView>; }
