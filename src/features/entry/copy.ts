import { useCallback } from 'react';
import { useDesign } from '@/shared/design/DesignProvider';
import { translateCopy, type CopyValues } from '@/i18n/copy';

export function useCopy() {
  const { language } = useDesign();
  return useCallback((key: string, values?: CopyValues) => translateCopy(language, key, values), [language]);
}
