import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { PageScaffold, Surface } from '@/shared/ui/Layout';
import { Button } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { SessionAvatar, sessionCycle, useReducedMotion, type SessionMark } from './SessionAvatar';

// Exact demonstration titles from web/app/(utility)/avatar-preview/page.tsx, not learner data.
const titles = ['DeepTutor 模型配置工作台', 'DeepTutor 侧边栏聊天历史重组', 'Thinking-orbs 集成到 DeepTutor', 'DeepTutor 模型配置集成逻辑', 'deeptutor.info 文档审查', 'New session'];
export function AvatarGallery() {
  const { colors, t } = useDesign();
  const [phase, setPhase] = useState(0);
  const [auto, setAuto] = useState(false);
  const [size, setSize] = useState(12);
  const reduced = useReducedMotion();
  useEffect(() => { if (!auto || reduced) return; const timer = setInterval(() => setPhase((old) => old + 1), 1800); return () => clearInterval(timer); }, [auto, reduced]);
  return <PageScaffold title={t('Session avatars — states')} description={t('Avatar state preview description')}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <Button variant="secondary" onPress={() => setAuto((old) => !old)}>{t(auto ? 'Pause' : 'Play')}</Button>
      <Button variant="secondary" onPress={() => setPhase((old) => old + 1)}>{t('Step forward')}</Button>
      <DText muted>{t('Size')}</DText>{[11, 12, 13, 14].map((value) => <Button key={value} variant={value === size ? 'primary' : 'ghost'} onPress={() => setSize(value)} accessibilityLabel={`${t('Size')} ${value}`}>{String(value)}</Button>)}
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 40 }}>
      <View style={{ gap: 8, maxWidth: '100%' }}><DText role="caption" muted>{t('Sidebar 1:1')}</DText>
        <Surface style={{ width: 268, maxWidth: '100%', padding: 8, gap: 0 }}>
          {titles.map((title, i) => <View key={title} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingVertical: 7 }}><SessionAvatar mark={sessionCycle[(phase + i) % sessionCycle.length]} size={size} paused={!auto} /><DText role="small" numberOfLines={1} style={{ flex: 1 }}>{title}</DText></View>)}
        </Surface>
      </View>
      <View style={{ gap: 8, maxWidth: '100%' }}><DText role="caption" muted>{t('State snapshots · 4× zoom')}</DText>
        <Surface style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 28 }}>
          {(['running', 'unread', 'failed', 'idle'] as const).map((mark: SessionMark) => <View key={mark} accessibilityLabel={mark} style={{ alignItems: 'center', gap: 12 }}><SessionAvatar mark={mark} size={size * 4} paused={!auto} /><DText role="caption" style={{ color: colors.mutedForeground }}>{t({ running: 'Running', unread: 'Unread', failed: 'Failed', idle: 'Idle' }[mark] as 'Running')}</DText></View>)}
        </Surface>
      </View>
    </View>
  </PageScaffold>;
}
