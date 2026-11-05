import { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  Calculator,
  Compass,
  Lightbulb,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  X,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useDesign } from '@/shared/design/DesignProvider';
import { geometry } from '@/shared/design/tokens';
import { IconButton } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { STARTER_GROUPS, type StarterGroupId } from './model';

export interface StarterSuggestionsProps {
  onPickPrompt: (prompt: string) => void;
  personalSuggestions: string[];
  personalLoading: boolean;
  onRefreshPersonal: () => void;
}

export function StarterSuggestions({
  onPickPrompt,
  personalSuggestions,
  personalLoading,
  onRefreshPersonal,
}: StarterSuggestionsProps) {
  const { colors } = useDesign();
  const t = useCopy();
  const [activeGroupId, setActiveGroupId] = useState<StarterGroupId | null>(
    null,
  );

  const activeGroup =
    STARTER_GROUPS.find((g) => g.id === activeGroupId) ?? null;

  const renderGroupIcon = (id: StarterGroupId, active: boolean) => {
    const color = active ? colors.foreground : colors.mutedForeground;
    switch (id) {
      case 'explain':
        return <Lightbulb size={15} color={color} />;
      case 'solve':
        return <Calculator size={15} color={color} />;
      case 'practice':
        return <Target size={15} color={color} />;
      case 'plan':
        return <Compass size={15} color={color} />;
      case 'research':
        return <Search size={15} color={color} />;
    }
  };

  return (
    <View style={{ width: '100%', gap: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {STARTER_GROUPS.map((group) => {
          const isOpen = activeGroupId === group.id;
          return (
            <Pressable
              key={group.id}
              accessibilityRole="button"
              accessibilityLabel={t(group.labelKey)}
              accessibilityState={{ expanded: isOpen, selected: isOpen }}
              onPress={() =>
                setActiveGroupId((prev) => (prev === group.id ? null : group.id))
              }
              style={({ pressed }) => ({
                minHeight: 36,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: isOpen ? colors.ring : colors.border,
                backgroundColor: isOpen
                  ? colors.secondary
                  : pressed
                    ? colors.accent
                    : colors.card,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              })}
            >
              {renderGroupIcon(group.id, isOpen)}
              <DText role={isOpen ? 'section' : 'small'}>
                {t(group.labelKey)}
              </DText>
            </Pressable>
          );
        })}
      </View>

      {activeGroup ? (
        <View
          style={{
            borderRadius: geometry.radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
              paddingTop: 6,
              paddingBottom: 4,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              {renderGroupIcon(activeGroup.id, true)}
              <DText role="section">{t(activeGroup.labelKey)}</DText>
            </View>
            <IconButton
              label={t('Close')}
              onPress={() => setActiveGroupId(null)}
            >
              <X size={16} color={colors.mutedForeground} />
            </IconButton>
          </View>

          {activeGroup.prompts.map((item, idx) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={t(item.labelKey)}
              onPress={() => {
                onPickPrompt(t(item.promptKey));
                setActiveGroupId(null);
              }}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: colors.border,
                backgroundColor: pressed ? colors.secondary : colors.card,
              })}
            >
              <DText role="body">{t(item.labelKey)}</DText>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 4, gap: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 8,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Sparkles size={13} color={colors.mutedForeground} />
              <DText role="small" muted>
                {t('navigation.ideasForYou')}
              </DText>
            </View>
            <Pressable
              disabled={personalLoading}
              accessibilityRole="button"
              accessibilityLabel={t('Suggest something else')}
              onPress={onRefreshPersonal}
              style={({ pressed }) => ({
                minHeight: 32,
                paddingHorizontal: 8,
                borderRadius: geometry.radius.sm,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                opacity: personalLoading ? 0.5 : pressed ? 0.75 : 1,
              })}
            >
              <RefreshCw size={13} color={colors.mutedForeground} />
              <DText role="small" muted>
                {personalLoading
                  ? t('Finding what to explore next...')
                  : t('Suggest something else')}
              </DText>
            </Pressable>
          </View>

          {personalSuggestions.map((prompt, index) => (
            <Pressable
              key={`${index}-${prompt}`}
              accessibilityRole="button"
              accessibilityLabel={prompt}
              onPress={() => onPickPrompt(prompt)}
              style={({ pressed }) => ({
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: geometry.radius.md,
                backgroundColor: pressed ? colors.secondary : 'transparent',
              })}
            >
              <DText
                role="small"
                muted
                numberOfLines={2}
                style={{ color: colors.mutedForeground }}
              >
                {prompt}
              </DText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
