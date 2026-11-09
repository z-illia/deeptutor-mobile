import { Redirect, useLocalSearchParams } from 'expo-router';
export default function Screen() {
  const { q } = useLocalSearchParams<{ q?: string | string[] }>();
  const query = Array.isArray(q) ? q[0] : q;
  return <Redirect href={{ pathname: '/search', params: query ? { q: query } : {} }} />;
}
