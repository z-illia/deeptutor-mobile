import { SettingsHubScreen } from '@/features/settings/SettingsHubScreen';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><SettingsHubScreen number={145} /></ScreenRoute>;
}
