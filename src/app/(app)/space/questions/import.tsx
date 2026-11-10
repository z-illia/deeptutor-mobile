import { ImportQuestionsScreen } from '@/features/questions/MobileLibraryScreens';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><ImportQuestionsScreen step={35} /></ScreenRoute>;
}
