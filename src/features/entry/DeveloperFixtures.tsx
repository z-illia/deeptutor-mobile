import type { Href } from 'expo-router';
import { View } from 'react-native';
import { router } from 'expo-router';
import {
  useChat,
  type CatalogLoadState,
  type SessionViewState,
} from '@/features/chat/ChatProvider';
import { useFavorites } from '@/features/favorites/FavoritesProvider';
import { useLearning } from '@/features/learning/LearningProvider';
import { Button, Toggle } from '@/shared/ui/Controls';
import { Choice } from '@/shared/ui/Choice';
import { DText } from '@/shared/ui/Text';
import { Surface } from '@/shared/ui/Layout';
import { useFixtures } from './FixtureProvider';
import { entryModes, type ResourceState } from './model';
export function DeveloperFixtures() {
  const f = useFixtures();
  const chat = useChat();
  const fav = useFavorites();
  const learning = useLearning();
  if (!__DEV__) return null;
  return <Surface testID="m2-fixtures"><DText role="section">M2 / M3 / M4.1 · Development fixtures · in memory</DText><DText role="small">Synthetic sign-in: fixture-admin, fixture-standard, fixture-learner or fixture-temporary / fixture-password</DText>
    <Choice label="Fixture principal" value={f.mode} options={entryModes.map((value) => ({ value, label: value }))} onChange={f.resetMode} />
    <Choice label="Fixture resource state" value={f.resourceState} options={(['ready', 'loading', 'empty', 'error', 'denied', 'unavailable'] as ResourceState[]).map((value) => ({ value, label: value }))} onChange={f.setResourceState} />
    <Choice label="Fixture model catalog state" value={chat.modelCatalogState} options={(['ready', 'loading', 'error', 'empty'] as CatalogLoadState[]).map((value) => ({ value, label: value }))} onChange={chat.setModelCatalogState} />
    <Choice label="Fixture session view state" value={chat.sessionViewState} options={(['ready', 'loading', 'error'] as SessionViewState[]).map((value) => ({ value, label: value }))} onChange={chat.setSessionViewState} />
    <Toggle label="Fixture operation failure" value={f.failOperation} onChange={f.setFailOperation} /><Toggle label="Fixture optional Whisper" value={f.whisper} onChange={f.setWhisper} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <Button variant="secondary" onPress={() => { chat.resetChatFixtures(); fav.resetFavoritesFixtures(); learning.resetLearningFixtures(); }}>Reset chat fixtures</Button>
      {['/login', '/register', '/profile', '/library', '/personalization', '/settings/general', '/settings/appearance', '/search', '/chat', '/chat/session-general-1', '/chat/session-general-2', '/space/chat-history', '/settings/archive', '/favorites', '/notebooks/nb-linear-algebra', '/learning', '/learning/new', '/learning/mastery', '/learning/mastery/path-general', '/learning/mastery/path-general/sessions/session-general-mastery-1'].map((path) => <Button key={path} variant="secondary" onPress={() => router.push(path as Href)}>{path}</Button>)}
    </View>
  </Surface>;
}
