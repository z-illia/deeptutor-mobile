import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FavoritesScreen } from '@/features/favorites/FavoritesScreen';

export default function NotebookDetailRoute() {
  const { notebookId } = useLocalSearchParams<{ notebookId: string }>();
  const resolvedId = Array.isArray(notebookId) ? notebookId[0] : notebookId;
  return <FavoritesScreen notebookId={resolvedId} />;
}
