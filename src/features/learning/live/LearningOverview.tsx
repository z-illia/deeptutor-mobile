import { useCopy } from '@/features/entry/copy';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { BookOpen, BookOpenText, ChevronDown, ListChecks, Plus, Route } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button } from '@/shared/ui/Controls';
import { Dialog } from '@/shared/ui/Dialog';
import { DText, ListRow } from './LearningText';
import { learningHref } from './routes';
import type { Topic } from './repository';

const activities = [
  { title: 'Mastery paths', description: 'Build a route toward a learning goal', view: 'paths', icon: Route },
  { title: 'Books', description: 'Generate, browse and study AI-authored books', view: 'books', icon: BookOpen },
  { title: 'Immersive reading', description: 'Read materials with a tutor beside you', view: 'reading', icon: BookOpenText },
  { title: 'Practice', description: 'Review questions from your question bank', view: 'practice', icon: ListChecks },
  { title: 'New learning activity', description: 'Choose a method. Materials and progress stay in this workspace.', view: 'new', icon: Plus },
];

export function LearningOverview({ topics, workspace, loading, error }: { topics: Topic[]; workspace: string; loading: boolean; error?: string }) {
  const t = useCopy();
  const { colors } = useDesign();
  const [selectedId, setSelectedId] = useState('');
  const [open, setOpen] = useState(false);
  const selected = topics.find(item => item.path_id === selectedId) ?? topics[0];
  return <>
    {selected && <View style={{ gap: 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Mastery paths')} accessibilityState={{ expanded: open, disabled: loading || !!error }} disabled={loading || !!error} onPress={() => setOpen(true)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 })}>
        <View style={{ flex: 1, gap: 4 }}>
          <DText role="label">{selected.name}</DText>
          <DText muted>{t('{mastered} / {total} knowledge points mastered', { mastered: selected.map.counts.mastered, total: selected.map.counts.total })}</DText>
        </View>
        <ChevronDown size={20} color={colors.mutedForeground} />
      </Pressable>
      <Button disabled={loading || !!error} onPress={() => router.push(learningHref('topic', workspace, selected.path_id))}>{t('Continue learning')}</Button>
      <Dialog open={open} title={t('Mastery paths')} placement="bottom" onClose={() => setOpen(false)}>
        {topics.map(item => <ListRow key={item.path_id} title={item.name} description={t('{mastered} / {total} knowledge points mastered', { mastered: item.map.counts.mastered, total: item.map.counts.total })} selected={selected.path_id === item.path_id} onPress={() => { setSelectedId(item.path_id); setOpen(false); }} />)}
      </Dialog>
    </View>}
    {!loading && !error && !topics.length && <DText muted>{t("No learning paths yet. Start with a goal.")}</DText>}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {activities.map(({ title, description, view, icon: Icon }, index) => <Pressable key={view} accessibilityRole="button" accessibilityLabel={t(title)} onPress={() => router.push(learningHref(view, workspace, ''))} style={({ pressed }) => ({ flexBasis: index === activities.length - 1 ? '100%' : '45%', flexGrow: 1, minWidth: 0, padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: pressed ? colors.secondary : colors.card })}>
        <View aria-hidden><Icon size={26} color={colors.primary} /></View>
        <DText role="label">{t(title)}</DText>
        <DText muted>{t(description)}</DText>
      </Pressable>)}
    </View>
  </>;
}
