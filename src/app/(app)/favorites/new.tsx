import { MobileFavoritesScreen } from '@/features/favorites/MobileFavoritesScreen';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><MobileFavoritesScreen create /></ScreenRoute>;
}
