import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';

import { translateCopy, type Language, type CopyValues } from '@/i18n/copy';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePreferencesStore } from '../preferences/store';
import { resolveDesign } from './tokens';

export type { Language };
export type MessageKey = string;

function useDesignState() {
  const system = useColorScheme();
  const preferences = usePreferencesStore(state => state.appliedSettings);
  const theme = usePreferencesStore(state => state.theme);
  const setTheme = usePreferencesStore(state => state.setTheme);
  const layout = usePreferencesStore(state => state.layout);
  const setLayout = usePreferencesStore(state => state.setLayout);
  const language = usePreferencesStore(state => state.language);
  const setLanguage = usePreferencesStore(state => state.setLanguage);
  const design = useMemo(() => resolveDesign(theme, layout, system), [theme, layout, system]);
  return { ...design, preferences, theme, setTheme, setLayout, language, setLanguage, t: (key: MessageKey, values?: CopyValues) => translateCopy(language, key, values) };
}

type DesignState = ReturnType<typeof useDesignState>;
const Context = createContext<DesignState | null>(null);

export function DesignProvider({ children }: PropsWithChildren) {
  const value = useDesignState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useDesign() {
  const value = useContext(Context);
  if (!value) throw new Error('DesignProvider is required');
  return value;
}
