import { Redirect, useLocalSearchParams, type Href } from 'expo-router';
import { screenPath } from '@/features/navigation/paths';

/** Keep existing bookmarks and external links working. */
export default function LegacyMobileRoute() {
  const { screen, ...params } = useLocalSearchParams<{ screen: string }>();
  return <Redirect href={{ pathname: screenPath(screen), params: { ...params, ...(screen === '58' ? { view: 'progress' } : {}) } } as Href} />;
}
