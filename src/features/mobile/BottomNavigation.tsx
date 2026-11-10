import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { BookOpen, Calendar, Folder, MessageCircle } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { useMobileCopy } from './copy';

export const mobileTabs = [
  { number: 1, label: 'Learn', path: '/learning', Icon: BookOpen },
  { number: 12, label: 'Tutor', path: '/chat', Icon: MessageCircle },
  { number: 26, label: 'Library', path: '/library', Icon: Folder },
  { number: 52, label: 'Plan', path: '/plan', Icon: Calendar },
] as const;

export function BottomNavigation({ activeScreen }: { activeScreen: number }) {
  const { colors } = useDesign();
  const t = useMobileCopy();

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
      <View accessibilityRole="tablist" style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 32, padding: 6, flexDirection: 'row', gap: 4, backgroundColor: colors.card }}>
        {mobileTabs.map(({ number, label, path, Icon }) => {
          const selected = activeScreen === number;
          const color = selected ? colors.primary : colors.mutedForeground;
          return (
            <Pressable
              key={number}
              accessibilityRole="tab"
              accessibilityLabel={t(label)}
              accessibilityState={{ selected }}
              onPress={() => { if (!selected) router.navigate(path as Href); }}
              style={{ flex: 1, minHeight: 52, paddingVertical: 4, gap: 3, borderRadius: 28, backgroundColor: selected ? colors.secondary : colors.card, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon size={20} color={color} />
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: '500', color }}>{t(label)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
