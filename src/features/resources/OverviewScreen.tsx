import type { Href } from 'expo-router';
import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { History, Bookmark, NotebookPen, ClipboardList, BookOpen, Bot, UserRound, WandSparkles, Plug, Terminal, Brain, Ear, ArrowUpRight } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha } from '@/shared/design/tokens';
import { DText } from '@/shared/ui/Text';
import { Button } from '@/shared/ui/Controls';
import { PageScaffold } from '@/shared/ui/Layout';
import { InlineAlert, Skeleton } from '@/shared/ui/Feedback';
import { useFixtures } from '../entry/FixtureProvider';
import { useCopy } from '../entry/copy';
import { readTiles } from './repository';
import tints from './source-tints.json';
const icons = { History, Bookmark, NotebookPen, ClipboardList, BookOpen, Bot, UserRound, Wand2: WandSparkles, Plug, Terminal, Brain, Ear };
export function OverviewScreen({ account = false }: { account?: boolean }) {
  const f = useFixtures(); const t = useCopy(); const { colors, dark, layout } = useDesign(); const [contentWidth, setContentWidth] = useState(0);
  const tiles = readTiles(account, f.workspace, f.resourceState, f.whisper); const twoColumns = contentWidth >= 520;
  return <PageScaffold title={t(account ? 'navigation.personalization' : layout === 'modern' ? 'navigation.resources' : 'Learning Space')} description={t(account ? 'navigation.personalizationIntro' : 'Your conversations, agents, notebooks, and questions in one place — enter from here.')}>
    {['denied', 'unavailable'].includes(f.resourceState) ? <InlineAlert tone="warning">{t('This page is not available for your account.')}</InlineAlert> : <View onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)} style={{ gap: 36 }}>
      {[false, true].map((optional) => { const items = tiles.filter((tile) => (tile.key === 'whisper') === optional); if (!items.length) return null;
        return <View key={String(optional)} style={{ gap: 12 }}><DText role="section">{t(account ? 'Personalization' : optional ? 'More Projects' : 'Conversations & Materials')}</DText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {items.map((tile) => { const Icon = icons[tile.icon as keyof typeof icons]; const tint = tints[tile.key as keyof typeof tints]; return <View key={tile.key} style={{ width: twoColumns ? (contentWidth - 12) / 2 : '100%', minWidth: 0 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={t(tile.title)} onPress={() => router.push(tile.href as Href)} style={({ pressed }) => ({ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, backgroundColor: pressed ? colors.accent : colors.card, gap: 12, minHeight: 132 })}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}><View style={{ width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(tint.background, 0.1) }}><Icon size={18} strokeWidth={1.7} color={dark ? tint.dark : tint.light} /></View><View style={{ flex: 1, minWidth: 0 }}><DText style={{ fontSize: 14.5, fontFamily: 'GeistMedium' }}>{t(tile.title)}</DText>
                {tile.count?.status === 'loading' && <Skeleton width={48} height={14} />}{tile.count?.status === 'ready' && <DText testID={`count-${tile.key}`} role="small" muted><DText style={{ fontSize: 20, fontFamily: 'GeistSemiBold' }}>{tile.count.value}</DText> {t(tile.unit!)}</DText>}
                {tile.count?.status === 'error' && <DText role="caption" muted>{t('Unavailable')}</DText>}
              </View><ArrowUpRight size={16} color={colors.mutedForeground} /></View><DText role="small" muted>{t(tile.blurb)}</DText>{tile.key === 'whisper' && <DText role="caption" muted>alanguan73</DText>}
            </Pressable>{tile.count?.status === 'error' && <Button variant="ghost" onPress={() => f.setResourceState('ready')}>{t('Retry')}</Button>}
          </View>; })}
        </View></View>;
      })}
    </View>}
  </PageScaffold>;
}
