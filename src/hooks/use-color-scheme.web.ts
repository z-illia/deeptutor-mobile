import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

function subscribe(onStoreChange: () => void) {
  const subscription = Appearance.addChangeListener(onStoreChange);
  return () => subscription.remove();
}

function getSnapshot() {
  return Appearance.getColorScheme();
}

function getServerSnapshot(): 'light' {
  return 'light';
}

/** Match the server's light render during hydration, then follow live OS changes. */
export function useColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
