import { Redirect, useLocalSearchParams } from 'expo-router';
import { favoritesHref } from '@/features/mobile/routes';
export default function Screen() {
  const { notebookId, recordId } = useLocalSearchParams<{ notebookId: string; recordId?: string }>();
  return <Redirect href={favoritesHref(notebookId, recordId)} />;
}
