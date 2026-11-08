import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = 'deeptutor-api-server';
export const defaultServerUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

export function normalizeServerUrl(value: string): string {
  const url = new URL(value.trim());
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('Enter a valid HTTP or HTTPS server URL.');
  }
  const path = url.pathname.replace(/\/+$/, '').replace(/\/api$/, '');
  return `${url.origin}${path}`;
}

export async function readServerUrl() {
  return (await AsyncStorage.getItem(storageKey)) ?? defaultServerUrl;
}
export async function saveServerUrl(value: string) {
  await AsyncStorage.setItem(storageKey, value);
}
