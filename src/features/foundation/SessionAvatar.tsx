import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useDesign } from '@/shared/design/DesignProvider';
import { frameRibbon } from '@/shared/design/orb/ribbon';
import { resolvePreset } from '@/shared/design/orb/presets';

export type SessionMark = 'running' | 'unread' | 'failed' | 'idle';
export const sessionCycle: readonly SessionMark[] = ['idle', 'running', 'unread', 'idle', 'running', 'failed'];

export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReduced(value); });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; listener.remove(); };
  }, []);
  return reduced;
}

// Source geometry and composing preset are reused verbatim. SVG replaces browser canvas.
export function SessionAvatar({ mark = 'idle', size = 12, kind = 'chat', paused = false }: { mark?: SessionMark; size?: number; kind?: 'chat' | 'reading'; paused?: boolean }) {
  const { colors, dark } = useDesign();
  const reduced = useReducedMotion();
  const [time, setTime] = useState(0);
  const preset = resolvePreset('composing', 20);
  useEffect(() => {
    if (mark !== 'running' || reduced || paused) return;
    const start = Date.now();
    const timer = setInterval(() => setTime((Date.now() - start) / 1000), 80);
    return () => clearInterval(timer);
  }, [mark, reduced, paused]);
  const ink = mark === 'failed' ? (dark ? '#fbbf24' : '#f59e0b') : mark === 'unread' || mark === 'running' ? (dark ? '#60a5fa' : '#2563eb') : colors.mutedForeground;
  if (mark === 'running') {
    const frame = frameRibbon(20, time * preset.speed * 1.3, preset.opts);
    return <Svg accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true} width={size} height={size} viewBox="0 0 20 20">{frame.dots.map((dot, i) => <Circle key={i} cx={dot.x} cy={dot.y} r={dot.r} fill={ink} opacity={(dot.a ?? 1) * (1 - dot.white)} />)}</Svg>;
  }
  const ring = Math.round(size * 0.58);
  return <Svg accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true} width={size} height={size} viewBox="0 0 12 12">
    <Svg x={(12 - ring * 12 / size) / 2} y={(12 - ring * 12 / size) / 2} width={ring * 12 / size} height={ring * 12 / size} viewBox="0 0 12 12">
      {kind === 'reading' ? <Rect x={1.9} y={0.9} width={8.2} height={10.2} rx={2.4} stroke={ink} strokeWidth={1.25} fill={mark === 'idle' ? 'none' : ink} opacity={mark === 'idle' ? 0.45 : 1} /> : <Circle cx={6} cy={6} r={5.1} stroke={ink} strokeWidth={1.25} fill={mark === 'idle' ? 'none' : ink} opacity={mark === 'idle' ? 0.45 : 1} />}
    </Svg>
  </Svg>;
}
