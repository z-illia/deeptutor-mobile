import { MemoryWorkbenchScreen } from '@/features/memory/MobileMemoryScreens';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><MemoryWorkbenchScreen /></ScreenRoute>;
}
