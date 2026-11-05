import { DeveloperFixtures } from '@/features/entry/DeveloperFixtures';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, Info, X } from 'lucide-react-native';
import { useDesign, type Language } from '@/shared/design/DesignProvider';
import { type ThemeChoice } from '@/shared/design/tokens';
import { Button, Field, IconButton, Tabs, Toggle, type ButtonVariant } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { PageScaffold, Surface } from '@/shared/ui/Layout';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { EmptyState, ErrorState, InlineAlert, LoadingState, Skeleton, StatusChip, useFeedback, type Tone } from '@/shared/ui/Feedback';

// Development harness for M1 controls, not a learner Settings or feature screen.
export function ComponentPreview() {
  const { colors, theme, setTheme, layout, setLayout, language, setLanguage, t } = useDesign();
  const { notify } = useFeedback();
  const [name, setName] = useState('');
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState('first');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState('ready');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const confirm = () => {
    if (busy) return;
    setBusy(true); setError('');
    timer.current = setTimeout(() => {
      setBusy(false);
      if (failure) setError('Development fixture: action failed.');
      else { setOpen(false); notify(t('Saved'), 'success'); }
    }, 600);
  };
  return <PageScaffold title="DeepTutor · M1" description="Development component preview · S01 / S80 / S134 / S135">
    <DeveloperFixtures /><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}><Button variant="secondary" onPress={() => router.replace('/')}>{t('navigation.home')}</Button><Button variant="secondary" onPress={() => router.push('/avatar-preview')}>{t('Session avatars — states')}</Button></View>
    <Surface><DText role="section">Theme · source palettes</DText><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{(['system', 'snow', 'cream', 'dark', 'glass'] as ThemeChoice[]).map((choice) => <Button key={choice} variant={choice === theme ? 'primary' : 'secondary'} onPress={() => setTheme(choice)} accessibilityLabel={`Theme ${choice}`}>{choice}</Button>)}</View>
      <Tabs label="Source layout" value={layout} onChange={setLayout} options={[{ value: 'modern', label: 'Modern' }, { value: 'classic', label: 'Classic' }]} />
      <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>{(['en', 'zh', 'fr', 'de', 'uk', 'pl', 'pt', 'vi', 'ja', 'tr'] as Language[]).map((locale) => <Button key={locale} variant={locale === language ? 'primary' : 'ghost'} onPress={() => setLanguage(locale)} accessibilityLabel={`Language ${locale}`}>{locale}</Button>)}</View>
    </Surface>
    <Surface><DText role="title">DeepTutor</DText><DText role="section">Geist · Lora</DText><DText role="learning">Learn through a living mastery map.</DText><DText role="small" muted>{t('General workspace')}</DText><DText role="code">--primary: {colors.primary}</DText></Surface>
    <Surface><DText role="section">Buttons · primary / secondary / danger / ghost</DText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{(['primary', 'secondary', 'danger', 'ghost'] as ButtonVariant[]).map((variant) => <Button key={variant} variant={variant} onPress={() => notify(variant)}>{variant}</Button>)}</View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{(['sm', 'md', 'lg'] as const).map((size) => <Button key={size} size={size} onPress={() => notify(size)}>{size}</Button>)}<Button disabled>{t('Delete')}</Button><Button loading>{t('Loading…')}</Button><IconButton label={t('Close')} onPress={() => notify(t('Close'))}><X size={18} color={colors.mutedForeground} /></IconButton></View>
    </Surface>
    <Surface><Field label={t('Name')} value={name} onChangeText={setName} optional hint="Development input fixture" error={name.length > 40 ? 'Maximum 40 characters in this fixture.' : undefined} /><Toggle label="Development switch" value={checked} onChange={setChecked} /><Tabs label="Development tabs" value={tab} onChange={setTab} options={[{ value: 'first', label: 'First' }, { value: 'second', label: 'Second' }]} /><DText>{tab}</DText></Surface>
    <Surface><DText role="section">Feedback · semantic source tones</DText>{(['info', 'success', 'warning', 'danger'] as Tone[]).map((tone) => <View key={tone} style={{ gap: 8 }}><StatusChip tone={tone}>{tone}</StatusChip><InlineAlert title={tone} tone={tone} action={<Button variant="ghost" onPress={() => notify(tone, tone)} icon={tone === 'success' ? <Check size={16} color={colors.success} /> : <Info size={16} color={colors.info} />}>{tone}</Button>}>{t('General workspace')}</InlineAlert></View>)}</Surface>
    <Surface><DText role="section">Shared content states</DText><Tabs label="Development content state" value={state} onChange={setState} options={['ready', 'loading', 'empty', 'error'].map((value) => ({ value, label: value }))} />
      {state === 'loading' ? <><LoadingState /><Skeleton /><Skeleton width="70%" /></> : state === 'empty' ? <EmptyState title={t('No conversations yet')} /> : state === 'error' ? <ErrorState message="Development fixture: content unavailable." onRetry={() => setState('ready')} /> : <InlineAlert tone="success">{t('Saved')}</InlineAlert>}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{['ready', 'loading', 'empty', 'error'].map((scenario) => <Button key={scenario} size="sm" variant="secondary" onPress={() => router.replace({ pathname: '/', params: { scenario } })}>{`Shell ${scenario}`}</Button>)}</View>
    </Surface>
    <Surface><DText role="section">Confirmation · local-only fixture</DText><Toggle label="Simulate failure" value={failure} onChange={setFailure} /><Button variant="danger" onPress={() => { setError(''); setOpen(true); }}>{t('Delete')}</Button></Surface>
    <ConfirmDialog open={open} title={t('Delete')} confirmLabel={t('Delete')} busy={busy} onConfirm={confirm} onCancel={() => { setOpen(false); setError(''); }}><DText muted>Development confirmation fixture. No records will be deleted.</DText>{!!error && <InlineAlert tone="danger">{error}</InlineAlert>}</ConfirmDialog>
  </PageScaffold>;
}
