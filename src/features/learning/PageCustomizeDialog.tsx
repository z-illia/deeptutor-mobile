import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SlidersHorizontal, X } from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha } from '@/shared/design/tokens';
import { Button, Toggle } from '@/shared/ui/Controls';
import { Dialog } from '@/shared/ui/Dialog';
import { InlineAlert } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { useLearning } from './LearningProvider';
import {
  CHAT_MODE_CUSTOMIZE_ITEMS,
  DEFAULT_PAGE_CUSTOMIZATION,
  LEARNING_CUSTOMIZE_ITEMS,
  LEARNING_SURFACES,
  toggleHiddenEntry,
  type PageCustomization,
} from './model';

export function PageCustomizeButton({
  onPress,
  testID = 'page-customize-btn',
}: {
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useDesign();
  const t = useCopy();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={t('Customize page')}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        minHeight: 34,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: pressed ? colors.accent : colors.card,
      })}
    >
      <SlidersHorizontal size={14} color={colors.mutedForeground} />
      <DText role="caption" style={{ fontWeight: '500' }}>
        {t('Customize')}
      </DText>
    </Pressable>
  );
}

export function PageCustomizeDialog({
  open,
  page,
  onClose,
}: {
  open: boolean;
  page: 'chat' | 'learning';
  onClose: () => void;
}) {
  const { colors } = useDesign();
  const t = useCopy();
  const { mode: entryMode } = useFixtures();
  const { customization, saveCustomization } = useLearning();

  return (
    <Dialog
      open={open}
      title={t('Customize page')}
      onClose={onClose}
    >
      {open ? (
        <PageCustomizeDialogBody
          key={`${page}:${customization.hidden_features.join(',')}:${customization.hidden_modes.join(',')}`}
          page={page}
          initial={customization}
          entryMode={entryMode}
          colors={colors}
          t={t}
          onSave={(draft) => saveCustomization(draft)}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  );
}

function PageCustomizeDialogBody({
  page,
  initial,
  entryMode,
  colors,
  t,
  onSave,
  onClose,
}: {
  page: 'chat' | 'learning';
  initial: PageCustomization;
  entryMode: ReturnType<typeof useFixtures>['mode'];
  colors: ReturnType<typeof useDesign>['colors'];
  t: (key: string) => string;
  onSave: (draft: PageCustomization) => { ok: boolean; error?: string };
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<PageCustomization>(initial);
  const [error, setError] = useState<string | null>(null);

  const eligibleLearningItems = LEARNING_CUSTOMIZE_ITEMS.filter((item) => {
    const surface = LEARNING_SURFACES.find((s) => s.kind === item.id);
    return surface ? allowedDestination(entryMode, surface.href) : true;
  });

  const handleSave = () => {
    const res = onSave(draft);
    if (!res.ok) {
      setError(res.error ?? t('Failed to save'));
      return;
    }
    setError(null);
    onClose();
  };

  return (
    <View testID="page-customize-dialog" style={{ gap: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <DText role="small" muted style={{ flex: 1 }}>
          {t('Choose which modules and controls appear on this page.')}
        </DText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Close')}
          onPress={onClose}
          style={{ padding: 6 }}
        >
          <X size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {error ? <InlineAlert tone="danger">{t(error)}</InlineAlert> : null}

      <ScrollView style={{ maxHeight: 340 }} contentContainerStyle={{ gap: 12 }}>
        {page === 'learning' ? (
          <View style={{ gap: 8 }}>
            <DText
              role="caption"
              muted
              style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
            >
              {t('Learning ways')}
            </DText>
            {eligibleLearningItems.map((item) => {
              const checked = !draft.hidden_features.includes(item.id);
              return (
                <View
                  key={item.id}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: alpha(colors.muted, 0.35),
                  }}
                >
                  <Toggle
                    label={t(item.label)}
                    value={checked}
                    onChange={(nextVisible) =>
                      setDraft((current) => ({
                        ...current,
                        hidden_features: toggleHiddenEntry(
                          current.hidden_features,
                          item.id,
                          nextVisible,
                        ),
                      }))
                    }
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <View style={{ gap: 8 }}>
              <DText
                role="caption"
                muted
                style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
              >
                {t('Chat modes')}
              </DText>
              {CHAT_MODE_CUSTOMIZE_ITEMS.map((item) => {
                const checked = !draft.hidden_modes.includes(item.id);
                return (
                  <Toggle
                    key={item.id}
                    label={t(item.label)}
                    value={checked}
                    onChange={(nextVisible) =>
                      setDraft((current) => ({
                        ...current,
                        hidden_modes: toggleHiddenEntry(
                          current.hidden_modes,
                          item.id,
                          nextVisible,
                        ),
                      }))
                    }
                  />
                );
              })}
            </View>
            <View style={{ gap: 8 }}>
              <DText
                role="caption"
                muted
                style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
              >
                {t('Composer controls')}
              </DText>
              <Toggle
                label={t('Model selector')}
                value={draft.controls.model_selector}
                onChange={(next) =>
                  setDraft((current) => ({
                    ...current,
                    controls: { ...current.controls, model_selector: next },
                  }))
                }
              />
              <Toggle
                label={t('Context picker')}
                value={draft.controls.context_picker}
                onChange={(next) =>
                  setDraft((current) => ({
                    ...current,
                    controls: { ...current.controls, context_picker: next },
                  }))
                }
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopWidth: 1,
          borderColor: colors.border,
          paddingTop: 12,
          gap: 8,
        }}
      >
        <Button
          testID="customize-reset-btn"
          variant="ghost"
          size="sm"
          onPress={() => setDraft(DEFAULT_PAGE_CUSTOMIZATION)}
        >
          {t('Reset')}
        </Button>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            testID="customize-cancel-btn"
            variant="secondary"
            size="sm"
            onPress={onClose}
          >
            {t('Cancel')}
          </Button>
          <Button
            testID="customize-save-btn"
            variant="primary"
            size="sm"
            onPress={handleSave}
          >
            {t('Save')}
          </Button>
        </View>
      </View>
    </View>
  );
}
