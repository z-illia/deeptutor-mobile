import { useSyncExternalStore } from 'react';
import { Dimensions } from 'react-native';
const serverDimensions = Object.freeze({ width: 0, height: 0, scale: 1, fontScale: 1 });
function subscribe(onChange: () => void) {
  const subscription = Dimensions.addEventListener('change', onChange);
  return () => subscription.remove();
}
function getSnapshot() { return Dimensions.get('window'); }
function getServerSnapshot() { return serverDimensions; }
/** Hydrate the same compact layout as SSR, then subscribe to the real viewport. */
export function useLayoutDimensions() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
