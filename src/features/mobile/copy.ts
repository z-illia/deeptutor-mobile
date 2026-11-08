import { useMemo } from 'react';
import { useDesign, type Language } from '@/shared/design/DesignProvider';
import { translateCopy, type Translate, type CopyValues } from '@/i18n/copy';

export const languageNames: Record<Language, string> = {
  en: 'English', zh: '中文', fr: 'Français', de: 'Deutsch', uk: 'Українська',
  pl: 'Polski', pt: 'Português', vi: 'Tiếng Việt', ja: '日本語', tr: 'Türkçe',
};
const copies = new Map<Language, Translate>();
export function mobileCopy(language: Language) {
  const existing = copies.get(language);
  if (existing) return existing;
  const translate = (text: string, values?: CopyValues) => translateCopy(language, text, values);
  copies.set(language, translate);
  return translate;
}
export function useMobileCopy() {
  const { language } = useDesign();
  return useMemo(() => mobileCopy(language), [language]);
}
