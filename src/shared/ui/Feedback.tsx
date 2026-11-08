import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react-native';
import { useDesign } from '../design/DesignProvider';
import { alpha } from '../design/tokens';
import { DText } from './Text';
import { Button, IconButton } from './Controls';

export type Tone = 'info' | 'success' | 'warning' | 'danger';
export function useTone(tone: Tone) {
  const { colors } = useDesign();
  return { ink: tone === 'danger' ? colors.destructive : colors[`${tone}Foreground`], surface: tone === 'danger' ? alpha(colors.destructive, 0.1) : colors[`${tone}Surface`], border: tone === 'danger' ? alpha(colors.destructive, 0.2) : alpha(colors[tone], 0.2) };
}
export function InlineAlert({ tone = 'info', title, children, action }: { tone?: Tone; title?: string; children: ReactNode; action?: ReactNode }) {
  const colors = useTone(tone);
  const Icon = { info: Info, success: CheckCircle2, warning: TriangleAlert, danger: AlertCircle }[tone];
  return <View accessibilityRole={tone === 'danger' ? 'alert' : 'summary'} accessibilityLiveRegion={tone === 'danger' ? 'assertive' : 'polite'} style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
    <Icon size={16} color={colors.ink} style={{ marginTop: 3 }} /><View style={{ flex: 1, minWidth: 0 }}>{title && <DText role="label" style={{ color: colors.ink }}>{title}</DText>}<DText style={{ color: colors.ink }}>{children}</DText>{action}</View>
  </View>;
}
export function StatusChip({ tone = 'info', children }: { tone?: Tone; children: string }) {
  const colors = useTone(tone);
  return <View style={{ alignSelf: 'flex-start', borderRadius: 999, backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 4 }}><DText role="caption" style={{ color: colors.ink, fontFamily: 'GeistMedium' }}>{children}</DText></View>;
}
export function Skeleton({ height = 18, width = '100%' }: { height?: number; width?: number | `${number}%` }) {
  const { colors } = useDesign();
  return <View accessible={false} style={{ height, width, backgroundColor: colors.muted, borderRadius: 8 }} />;
}
export function LoadingState({ label }: { label?: string }) {
  const { colors, t } = useDesign();
  return <View accessibilityLiveRegion="polite" style={{ padding: 24, alignItems: 'center', gap: 12 }}><ActivityIndicator color={colors.primary} /><DText muted>{label || t('Loading…')}</DText></View>;
}
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <View style={{ paddingHorizontal: 24, paddingVertical: 48, alignItems: 'center', gap: 12 }}><DText role="section">{title}</DText>{description && <DText muted style={{ textAlign: 'center', maxWidth: 384 }}>{description}</DText>}{action}</View>;
}
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useDesign();
  return <InlineAlert tone="danger" action={<Button variant="ghost" onPress={onRetry}>{t('Retry')}</Button>}>{message}</InlineAlert>;
}

type Notice = { id: number; message: string; tone: Tone };
type Notices = { notify: (message: string, tone?: Tone, duration?: number) => void };
const FeedbackContext = createContext<Notices | null>(null);
export function FeedbackProvider({ children }: PropsWithChildren) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const ids = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const { t, colors } = useDesign();
  const insets = useSafeAreaInsets();
  useEffect(() => { const current = timers.current; return () => { current.forEach(clearTimeout); }; }, []);
  const notify: Notices['notify'] = (message, tone = 'info', duration = 4000) => {
    const id = ++ids.current;
    setNotices((old) => [...old, { id, message, tone }]);
    const timer = setTimeout(() => { setNotices((old) => old.filter((n) => n.id !== id)); timers.current.delete(timer); }, duration);
    timers.current.add(timer);
  };
  return <FeedbackContext.Provider value={{ notify }}>{children}
    {!!notices.length && <View pointerEvents="box-none" accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 24, right: 24, bottom: insets.bottom + 24, gap: 8, zIndex: 200, alignItems: 'flex-end' }}>
      {notices.map((notice) => <View key={notice.id} style={{ width: '100%', maxWidth: 384 }}><InlineAlert tone={notice.tone} action={<IconButton label={t('Dismiss')} onPress={() => setNotices((old) => old.filter((n) => n.id !== notice.id))}><X size={16} color={colors.foreground} /></IconButton>}>{t(notice.message)}</InlineAlert></View>)}
    </View>}
  </FeedbackContext.Provider>;
}
export function useFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error('FeedbackProvider is required');
  return value;
}
