import { CalendarScreen } from '@/features/plan/MobilePlanScreens';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><CalendarScreen view="month" /></ScreenRoute>;
}
