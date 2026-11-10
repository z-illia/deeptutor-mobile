import { RemoteSettingsScreen } from '@/features/settings/RemoteSettingsScreen';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><RemoteSettingsScreen number={97} /></ScreenRoute>;
}
