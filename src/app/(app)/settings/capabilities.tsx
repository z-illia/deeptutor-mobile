import { ConfigurationScreen } from '@/features/settings/ConfigurationScreen';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><ConfigurationScreen number={103} /></ScreenRoute>;
}
