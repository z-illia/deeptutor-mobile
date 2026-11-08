import en from './locales/en.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import uk from './locales/uk.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import vi from './locales/vi.json';
import ja from './locales/ja.json';
import tr from './locales/tr.json';

export const locales = { en, zh, fr, de, uk, pl, pt, vi, ja, tr } as const;
export type Language = keyof typeof locales;
export type CopyValues = Record<string, string | number>;
export type Translate = (key: string, values?: CopyValues) => string;
const cache = new Map<Language, Record<string, string>>();

export function translateCopy(language: Language, key: string, values?: CopyValues): string {
  let bundle = cache.get(language);
  if (!bundle) {
    bundle = Object.assign(Object.create(null) as Record<string, string>, locales[language]);
    cache.set(language, bundle);
  }
  const direct = bundle[key];
  const text = direct ?? key.split(/(\n+| · )/).map(part => bundle[part] || part).join('');
  return values ? text.replace(/\{(\w+)\}/g, (placeholder, name: string) => Object.hasOwn(values, name) ? String(values[name]) : placeholder) : text;
}
