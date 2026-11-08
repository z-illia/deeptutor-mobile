import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useCopy } from '@/features/entry/copy';
import { Dialog } from '@/shared/ui/Dialog';
import { FullScreenModal } from '@/shared/ui/FullScreenModal';
import { ListRow } from '@/shared/ui/ListRow';
import { DText } from '@/shared/ui/Text';

export type ModelChoice = { key: string; label: string; description?: ReactNode; badge?: ReactNode };

export function ModelSelectionDialog({ open, options, selectedKey, onSelect, onClose, fullScreen = false }: { open: boolean; options: ModelChoice[]; selectedKey?: string; onSelect: (key: string) => void; onClose: () => void; fullScreen?: boolean }) {
  const t = useCopy();
  const rows = <View style={{ gap: 6 }}>
    {options.length === 0 && <DText>{t('Server default model')}</DText>}
    {options.map(option => <ListRow key={option.key} title={option.label} description={option.description} badge={option.badge} selected={option.key === selectedKey} accessibilityLabel={t('Model {value1}', { value1: option.label })} onPress={() => { onSelect(option.key); onClose(); }} />)}
  </View>;
  if (fullScreen) return <FullScreenModal open={open} title={t('Choose a model')} onClose={onClose}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16 }}>{rows}</ScrollView></FullScreenModal>;
  return <Dialog open={open} title={t('Choose a model')} onClose={onClose}>{rows}</Dialog>;
}
