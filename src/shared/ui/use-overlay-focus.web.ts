import { useEffect, type ElementRef, type RefObject } from 'react';
import type { View } from 'react-native';

export function useOverlayFocus(open: boolean, root: RefObject<ElementRef<typeof View> | null>, onClose: () => void, busy: boolean) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); if (!busy) onClose(); }
      if (event.key !== 'Tab') return;
      const host = root.current;
      if (!(host instanceof HTMLElement)) return;
      const items = [...host.querySelectorAll<HTMLElement>('button:not(:disabled),[role="button"][tabindex="0"],a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[role="tab"][tabindex="0"]')];
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('keydown', handler); if (previous instanceof HTMLElement) previous.focus(); };
  }, [open, root, busy, onClose]);
}
