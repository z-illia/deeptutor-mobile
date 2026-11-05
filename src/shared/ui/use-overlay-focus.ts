import type { ElementRef, RefObject } from 'react';
import type { View } from 'react-native';

// Native Modal supplies the accessibility boundary; onShow focuses the safe action.
export function useOverlayFocus(_open: boolean, _root: RefObject<ElementRef<typeof View> | null>, _onClose: () => void, _busy: boolean) {}
