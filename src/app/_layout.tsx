import { useEffect, useState, type PropsWithChildren } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { loadAsync, useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { ChatProvider } from '@/features/chat/ChatProvider';
import { FavoritesProvider } from '@/features/favorites/FavoritesProvider';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { FixtureProvider } from '@/features/entry/FixtureProvider';
import { LearningProvider } from '@/features/learning/LearningProvider';
import { DesignProvider, useDesign } from '@/shared/design/DesignProvider';
import { fontAssets } from '@/shared/design/fonts';
import { Button } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { FeedbackProvider } from '@/shared/ui/Feedback';

void SplashScreen.preventAutoHideAsync();

function FontGate({ children }: PropsWithChildren) {
  const [loaded, error] = useFonts(fontAssets);
  const [recovered, setRecovered] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const { colors, t } = useDesign();
  useEffect(() => { if (loaded || error || recovered) void SplashScreen.hideAsync(); }, [loaded, error, recovered]);
  if (!loaded && !recovered && !error) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  if (error && !recovered) return <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16, backgroundColor: colors.background }}><DText accessibilityRole="alert">{t("Font assets could not be loaded.")}</DText><Button loading={retrying} onPress={() => { setRetrying(true); void loadAsync(fontAssets).then(() => setRecovered(true)).catch(() => {}).finally(() => setRetrying(false)); }}>{t('Retry')}</Button></View>;
  return children;
}

function RootNavigation() {
  const { colors, dark } = useDesign();
  const theme = dark ? DarkTheme : DefaultTheme;
  return <ThemeProvider value={{ ...theme, colors: { ...theme.colors, primary: colors.primary, background: colors.background, card: colors.card, text: colors.foreground, border: colors.border, notification: colors.destructive } }}>
    <StatusBar style={dark ? 'light' : 'dark'} />
    <FontGate><FeedbackProvider><AuthProvider><FixtureProvider><FavoritesProvider><ChatProvider><LearningProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'none' }}><Stack.Screen name="ui/search" options={{ presentation: 'modal' }} /><Stack.Screen name="ui/session-viewer" options={{ presentation: 'modal' }} /><Stack.Screen name="ui/file-preview" options={{ presentation: 'modal' }} /></Stack></LearningProvider></ChatProvider></FavoritesProvider></FixtureProvider></AuthProvider></FeedbackProvider></FontGate>
  </ThemeProvider>;
}

export default function RootLayout() {
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}><DesignProvider><RootNavigation /></DesignProvider></SafeAreaProvider>;
}
