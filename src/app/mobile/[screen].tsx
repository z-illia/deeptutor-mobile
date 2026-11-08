import { useLocalSearchParams } from 'expo-router';
import { EntryBoundary } from '@/features/entry/Boundary';
import { MobileScreen } from '@/features/mobile/MobileScreen';

export default function MobileRoute() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  return <EntryBoundary><MobileScreen key={screen} number={Number(screen)} /></EntryBoundary>;
}
