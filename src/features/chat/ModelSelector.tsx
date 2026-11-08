import { useState } from 'react';
import { Pressable } from 'react-native';
import {
  AlertCircle,
  ChevronDown,
  Cpu,
  RefreshCw,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { ModelSelectionDialog } from './ModelSelectionDialog';
import { StatusChip } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import type { CatalogLoadState } from './ChatProvider';
import {
  formatContextWindow,
  llmSelectionKey,
  sameLLMSelection,
  type LLMOption,
  type LLMSelection,
} from './model';

export interface ModelSelectorProps {
  options: LLMOption[];
  selectedModel: LLMSelection;
  state: CatalogLoadState;
  disabled?: boolean;
  onSelect: (selection: LLMSelection) => void;
  onRefresh: () => void;
}

export function ModelSelector({
  options,
  selectedModel,
  state,
  disabled = false,
  onSelect,
  onRefresh,
}: ModelSelectorProps) {
  const { colors } = useDesign();
  const t = useCopy();
  const [open, setOpen] = useState(false);

  const activeOption =
    options.find((opt) => sameLLMSelection(opt, selectedModel)) ??
    options.find((opt) => opt.is_active_default) ??
    options[0] ??
    null;

  if (state === 'loading') {
    return (
      <Pressable
        disabled
        accessibilityRole="button"
        accessibilityLabel={t('Loading models')}
        style={{
          minHeight: 36,
          paddingHorizontal: 10,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.secondary,
          opacity: 0.7,
        }}
      >
        <Cpu size={14} color={colors.mutedForeground} />
        <DText role="small" muted numberOfLines={1}>
          {t('Loading models')}
        </DText>
      </Pressable>
    );
  }

  if (state === 'error') {
    return (
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t('Refresh models')}
        onPress={onRefresh}
        style={({ pressed }) => ({
          minHeight: 36,
          paddingHorizontal: 10,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.warningSurface,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        })}
      >
        <AlertCircle size={14} color={colors.warning} />
        <DText role="small" style={{ color: colors.warning }} numberOfLines={1}>
          {t('Models unavailable')}
        </DText>
        <RefreshCw size={12} color={colors.warning} />
      </Pressable>
    );
  }

  if (state === 'empty' || options.length === 0) {
    return (
      <Pressable
        disabled
        accessibilityRole="button"
        accessibilityLabel={t('No model selected')}
        style={{
          minHeight: 36,
          paddingHorizontal: 10,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.secondary,
          opacity: 0.6,
        }}
      >
        <Cpu size={14} color={colors.mutedForeground} />
        <DText role="small" muted numberOfLines={1}>
          {t('No model selected')}
        </DText>
      </Pressable>
    );
  }

  const buttonLabel =
    activeOption?.model ||
    activeOption?.model_name ||
    selectedModel.model ||
    t('Select model');

  return (
    <>
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t('Select model')}
        testID="model-selector-trigger"
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          minHeight: 36,
          maxWidth: 220,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: open ? colors.border : 'transparent',
          backgroundColor: open || pressed ? colors.secondary : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          opacity: disabled ? 0.5 : 1,
        })}
      >
        <Cpu size={14} color={colors.mutedForeground} />
        <DText
          role="small"
          numberOfLines={1}
          style={{ flexShrink: 1, color: colors.foreground, fontFamily: 'GeistMedium' }}
        >
          {buttonLabel}
        </DText>
        <ChevronDown size={13} color={colors.mutedForeground} />
      </Pressable>

      <ModelSelectionDialog
        open={open}
        onClose={() => setOpen(false)}
        selectedKey={llmSelectionKey(selectedModel)}
        options={options.map(option => ({
          key: llmSelectionKey(option),
          label: option.model || option.model_name || option.name || '',
          description: [option.provider_label || option.provider, formatContextWindow(option.context_window) ? `${t('Context')}: ${formatContextWindow(option.context_window)?.replace(/ ctx$/, '')}` : ''].filter(Boolean).join(' · '),
          badge: option.is_active_default ? <StatusChip tone="info">{t('Default')}</StatusChip> : undefined,
        }))}
        onSelect={key => {
          const option = options.find(item => llmSelectionKey(item) === key);
          if (option) onSelect({ provider: option.provider, model: option.model });
        }}
      />
    </>
  );
}
