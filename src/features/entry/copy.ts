import { useDesign } from '@/shared/design/DesignProvider';
import messages from '@/i18n/m2-messages.json';
export function useCopy() {
  const { language } = useDesign();
  const bundle: Record<string, string> = messages[language];
  return (key: string) => bundle[key] || key;
}
