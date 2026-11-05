import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import messages from '@/i18n/foundation-messages.json';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveDesign, type LayoutChoice, type ThemeChoice } from './tokens';

export type Language = keyof typeof messages;
export type MessageKey = keyof typeof messages.en;

function useDesignState() {
  const system = useColorScheme();
  const [theme, setTheme] = useState<ThemeChoice>('system');
  const [layout, setLayout] = useState<LayoutChoice>('modern');
  const [language, setLanguage] = useState<Language>('en');
  const design = useMemo(() => resolveDesign(theme, layout, system), [theme, layout, system]);
  return { ...design, theme, setTheme, setLayout, language, setLanguage, t: (key: MessageKey) => messages[language][key] || messages.en[key] };
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
