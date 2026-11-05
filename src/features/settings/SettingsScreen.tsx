import type { Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { resolveDesign, type ThemeChoice } from '@/shared/design/tokens';
import { Button, Toggle } from '@/shared/ui/Controls';
import { Choice } from '@/shared/ui/Choice';
import { DText } from '@/shared/ui/Text';
import { PageScaffold } from '@/shared/ui/Layout';
import { ErrorState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { useFixtures } from '../entry/FixtureProvider';
import { catalogEditable, type Preferences } from '../entry/model';
import { useCopy } from '../entry/copy';
import { BackButton } from '../entry/Boundary';
import responseLanguages from './response-languages.json';
import codeOptions from './code-options.json';
import { CodePreview } from './CodePreview';
const interfaceLanguages = [{ value: 'en', label: 'English' }, { value: 'zh', label: '简体中文' }, { value: 'fr', label: 'Français' }, { value: 'de', label: 'Deutsch' }, { value: 'uk', label: 'Українська' }, { value: 'pl', label: 'Polski' }, { value: 'pt', label: 'Português' }, { value: 'vi', label: 'Tiếng Việt' }, { value: 'ja', label: '日本語' }, { value: 'tr', label: 'Türkçe' }] as const;
function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const { colors } = useDesign();
  return <View style={{ gap: 8, borderTopWidth: 1, borderColor: colors.border, paddingTop: 24 }}><DText role="section">{title}</DText>{description && <DText role="small" muted>{description}</DText>}{children}</View>;
}
function Row({ title, description, children }: { title: string; description?: string; children: ReactNode }) { return <View style={{ gap: 8, paddingVertical: 14 }}><DText role="label">{title}</DText>{description && <DText role="small" muted>{description}</DText>}{children}</View>; }
export function SettingsScreen({ appearance = false }: { appearance?: boolean }) {
  const f = useFixtures(); const t = useCopy(); const { colors } = useDesign(); const [error, setError] = useState(''); const p = f.settings.staged;
  const edit = (patch: Partial<Preferences>) => { setError(''); f.edit(patch); };
  const save = async (operation: 'save' | 'apply' | 'discard') => { setError(''); if (!await f.save(operation)) setError(t('Failed to save')); };
  if (f.settingsState === 'loading') return <LoadingState />;
  if (['denied', 'unavailable'].includes(f.settingsState)) return <PageScaffold title={t('Settings')}><BackButton /><InlineAlert tone="warning">{t('This settings page is unavailable.')}</InlineAlert></PageScaffold>;
  if (f.settingsState === 'error') return <ErrorState message={t('Failed to load settings')} onRetry={() => f.setSettingsState('ready')} />;
  const disabled = !!f.busy;
  return <View style={{ flex: 1 }}><PageScaffold title={t(appearance ? 'Appearance' : 'General')} description={t(appearance ? 'Customize the visual theme, learning text, and code blocks. Apply changes using the bar below.' : 'Make DeepTutor feel at home. Apply your preferences using the bar below.')}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><BackButton /><Button variant="ghost" accessibilityState={{ selected: !appearance }} onPress={() => router.replace('/settings/general')}>{t('General')}</Button><Button variant="ghost" accessibilityState={{ selected: appearance }} onPress={() => router.replace('/settings/appearance')}>{t('Appearance')}</Button></View>
    {!!error && <InlineAlert tone="danger">{error}</InlineAlert>}
    {appearance ? <>
      <Section title={t('Theme')} description={t('Pick the colour palette and interface style. Each tile previews the theme it applies.')}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {(['system', 'snow', 'cream', 'dark', 'glass'] as ThemeChoice[]).map((theme, i) => { const preview = resolveDesign(theme, p.layout, 'light').colors; const label = t(['System', 'Default', 'Cream', 'Dark', 'Glass'][i]); return <Button key={theme} accessibilityLabel={`${t('Theme')} ${label}`} accessibilityState={{ selected: p.theme === theme }} disabled={disabled} variant="secondary" onPress={() => edit({ theme })} style={{ flexGrow: 1, flexBasis: 120, borderColor: p.theme === theme ? colors.primary : colors.border, backgroundColor: preview.background, padding: 12 }}><View style={{ flex: 1, gap: 8 }}><View style={{ height: 46, backgroundColor: preview.secondary, borderRadius: 6, padding: 8, gap: 4 }}><View style={{ width: '55%', height: 5, backgroundColor: preview.primary, borderRadius: 6 }} /><View style={{ width: '80%', height: 5, backgroundColor: preview.mutedForeground, borderRadius: 6 }} /></View><DText style={{ color: preview.foreground }}>{label}</DText></View></Button>; })}
      </View><DText role="caption" muted>{t("System follows the device's light or dark appearance.")}</DText></Section>
      <Section title={t('Learning text')} description={t('Adjust messages, lessons, and practice text. Your changes stay in this preview until you apply them. Immersive Reading has its own display controls.')}>
        <Row title={t('Text size')} description={t('Scale learning content while keeping navigation and controls the same size.')}><Choice label={t('Learning text size')} value={String(p.scale)} onChange={(value) => edit({ scale: Number(value) })} disabled={disabled} options={[90, 100, 110, 125, 150].map((value) => ({ value: String(value), label: `${value}%` }))} /></Row>
        <Row title={t('Line spacing')} description={t('Choose the space between lines of learning text.')}><Choice label={t('Learning line spacing')} value={p.spacing} onChange={(spacing) => edit({ spacing })} disabled={disabled} options={[{ value: 'compact', label: t('Compact') }, { value: 'normal', label: t('Normal') }, { value: 'relaxed', label: t('Relaxed') }]} /></Row>
        <DText role="section">{t('Learning text preview')}</DText><View testID="learning-text-preview" style={{ backgroundColor: colors.muted, borderRadius: 8, padding: 16, gap: 12 }}>{['Learning starts with a question. Explore an idea, connect it to what you know, and explain it in your own words.', '学习从一个问题开始。探索新的想法，将它与已有的知识联系起来，再用自己的语言解释。'].map((text) => <DText key={text} role="learning" style={{ fontSize: 16 * p.scale / 100, lineHeight: 16 * p.scale / 100 * { compact: 1.5, normal: 1.75, relaxed: 2 }[p.spacing] }}>{text}</DText>)}</View>
        <Button variant="secondary" disabled={disabled} onPress={() => edit({ scale: 100, spacing: 'normal' })}>{t('Reset learning text')}</Button>
      </Section>
      <Section title={t('Code blocks')} description={t('Choose how code snippets look across the app after you apply changes.')}><DText role="section">{t('Preview')}</DText><DText role="small" muted>{t('Updates live as you change the settings below.')}</DText><CodePreview preferences={p} />
        <Row title={t('Syntax theme')}><Choice label={t('Syntax theme')} disabled={disabled} value={p.codeTheme} options={codeOptions.map((option) => ({ value: option.id, label: option.label }))} onChange={(codeTheme) => edit({ codeTheme })} /></Row>
        <Toggle label={t('Show line numbers')} disabled={disabled} value={p.lineNumbers} onChange={(lineNumbers) => edit({ lineNumbers })} /><Toggle label={t('Wrap long lines')} disabled={disabled} value={p.wrap} onChange={(wrap) => edit({ wrap })} />
      </Section>
    </> : <>
      <Section title={t('Language')}><Row title={t('Interface language')} description={t('Controls navigation, settings, and status text only.')}><Choice label={t('Interface language')} disabled={disabled} value={p.language} options={interfaceLanguages} onChange={(language) => edit({ language })} /></Row><Row title={t('Model output language')} description={t('Sets the default language for chat and capability responses.')}><Choice label={t('Model output language')} disabled={disabled} value={p.responseLanguage} options={responseLanguages} onChange={(responseLanguage) => edit({ responseLanguage })} /></Row></Section>
      <Section title={t('Layout')}><Row title={t('Interface layout')} description={t('Classic keeps the familiar navigation; Modern is the redesigned interface.')}><Choice label={t('Interface layout')} disabled={disabled} value={p.layout} options={[{ value: 'classic', label: t('Classic') }, { value: 'modern', label: t('Modern') }]} onChange={(layout) => edit({ layout })} /></Row></Section>
      {catalogEditable(f.mode) && <Section title={t('Set up chat first')} description={t('Connect a provider and choose a language model. Other services are optional.')}>
        {[['/settings/connections', '1. Connect a provider', 'Add your provider and credentials, then test the connection.'], ['/settings/llm', '2. Choose a chat model', 'Add a language model, test it, and select it as the default for conversations.'], ['/settings/status', '3. Apply and check', 'Apply your changes using the bottom bar, then check service status before starting a conversation.']].map(([href, label, description]) => <View key={href} style={{ gap: 4, paddingVertical: 12 }}><Button variant="ghost" onPress={() => router.push(href as Href)}>{t(label)}</Button><DText muted role="small">{t(description)}</DText></View>)}
      </Section>}
    </>}
  </PageScaffold>{f.settings.phase !== 'clean' && <View style={{ padding: 12, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.background, gap: 8 }}>
    <DText role="caption" accessibilityLiveRegion="polite" muted testID="settings-phase">{t(f.settings.phase === 'applied' ? 'Applied' : f.settings.phase === 'saved-draft' ? 'Draft not applied yet' : 'Unsaved changes')}</DText>
    {f.settings.phase !== 'applied' && <><DText role="caption" muted>{t('Applies pending changes across all settings pages.')}</DText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Button variant="ghost" disabled={disabled} onPress={() => void save('discard')}>{t('Discard')}</Button><Button variant="secondary" loading={f.busy === 'save'} disabled={disabled || f.settings.phase !== 'unsaved'} onPress={() => void save('save')}>{t('Save draft')}</Button><Button loading={f.busy === 'apply'} disabled={disabled} onPress={() => void save('apply')} style={{ backgroundColor: colors.foreground }}><DText style={{ color: colors.background }}>{t('Apply changes')}</DText></Button></View></>}
  </View>}</View>;
}
