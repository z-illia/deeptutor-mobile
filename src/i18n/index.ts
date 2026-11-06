import { useCopy } from '@/features/entry/copy';

export function useI18n() {
  const t = useCopy();
  return { t };
}
