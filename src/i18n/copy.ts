import foundation from './foundation-messages.json';
import entry from './m2-messages.json';
import learning from './m4-messages.json';
import mobile from './mobile-messages.json';
import runtime from './runtime-messages.json';
import complete from './complete-messages.json';

export type Language = keyof typeof foundation;
export type CopyValues = Record<string, string | number>;
export type Translate = (key: string, values?: CopyValues) => string;
const cache = new Map<Language, Record<string, string>>();

export function translateCopy(language: Language, key: string, values?: CopyValues): string {
  let bundle = cache.get(language);
  if (!bundle) {
    bundle = Object.create(null) as Record<string, string>;
    const learningBundle = language === 'uk' ? learning.uk : {};
    const sources: Record<string, string>[] = [runtime[language], foundation[language], entry[language], learningBundle, mobile[language], complete[language]];
    for (const source of sources) {
      for (const [original, translated] of Object.entries(source)) {
        // An untranslated entry must not hide a translation from another bundle.
        if (translated && (translated !== original || /[^\x00-\x7F]/.test(original))) bundle[original] = translated;
      }
    }
    cache.set(language, bundle);
  }
  const direct = bundle[key];
  const text = direct ?? key.split(/(\n+| · )/).map(part => bundle[part] || part).join('');
  return values ? text.replace(/\{(\w+)\}/g, (placeholder, name: string) => Object.hasOwn(values, name) ? String(values[name]) : placeholder) : text;
}
