import { Pressable, ScrollView, View } from 'react-native';
import { CircleCheck, Lightbulb, Zap } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { DText } from './LearningText';
import { studyStrategies, type StudyStrategy } from './study-actions';

export function StudyActionRow({ selected, disabled, onSelect }: { selected?: StudyStrategy; disabled: boolean; onSelect: (strategy: StudyStrategy) => void }) {
  const { colors } = useDesign();
  const icons = { check: CircleCheck, lightbulb: Lightbulb, challenge: Zap };
  return <ScrollView horizontal accessibilityLabel="Learning strategies" showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" snapToInterval={118} decelerationRate="fast" contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
    {studyStrategies.map(action => {
      const Icon = icons[action.icon];
      return <Pressable key={action.id} accessibilityRole="button" aria-selected={selected === action.id} accessibilityLabel={action.title} accessibilityHint={disabled ? 'Available when the session and current objective are ready.' : action.subtitle} accessibilityState={{ selected: selected === action.id, disabled }} disabled={disabled} onPress={() => onSelect(action.id)} hitSlop={{ top: 2, bottom: 2 }} style={({ pressed }) => ({ width: 110, height: 40, padding: 8, justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: selected === action.id ? colors.primary : colors.border, backgroundColor: pressed ? colors.secondary : colors.card, opacity: disabled ? 0.5 : 1 })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Icon size={14} color={colors.primary} /><DText numberOfLines={1} style={{ fontSize: 12, lineHeight: 17, fontWeight: '500' }}>{action.title}</DText></View>
      </Pressable>;
    })}
  </ScrollView>;
}
