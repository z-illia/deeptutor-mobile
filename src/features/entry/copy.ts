import { useDesign } from '@/shared/design/DesignProvider';
import messages from '@/i18n/m2-messages.json';
import learningMessages from '@/i18n/m4-messages.json';
export function useCopy() {
  const { language } = useDesign();
  const bundle: Record<string, string> = messages[language];
  const learning: Record<string, string> = language === 'uk' ? learningMessages.uk : {};
  return (key: string) => bundle[key] || learning[key] || key;
}
