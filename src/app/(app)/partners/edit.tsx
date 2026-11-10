import { PartnerScreen } from '@/features/resources/PartnerScreens';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><PartnerScreen number={67} /></ScreenRoute>;
}
