import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { View } from 'react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { DText } from '@/shared/ui/Text';
import { Toggle } from '@/shared/ui/Controls';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { ErrorState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { MobileChoice, MobileAction, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { catalogEditable } from '@/features/entry/model';
import { useCopy } from '@/features/entry/copy';
import responseLanguages from './response-languages.json';
import codeOptions from './code-options.json';
import { CodePreview } from './CodePreview';
import { useSettings } from './SettingsProvider';

const interfaceLanguages = [{ value: 'en', label: 'English' }, { value: 'zh', label: '简体中文' }, { value: 'fr', label: 'Français' }, { value: 'de', label: 'Deutsch' }, { value: 'uk', label: 'Українська' }, { value: 'pl', label: 'Polski' }, { value: 'pt', label: 'Português' }, { value: 'vi', label: 'Tiếng Việt' }, { value: 'ja', label: '日本語' }, { value: 'tr', label: 'Türkçe' }] as const;
export function MobileSettingsScreen({ appearance = false }: { appearance?: boolean }) {
  const f = useFixtures(); const settings = useSettings(); const t = useCopy(); const { colors } = useDesign();
  const [confirmReload, setConfirmReload] = useState(false); const p = settings.state.staged;
  const { edit, save } = settings;
  const title = t(appearance ? 'Appearance' : 'General'); const disabled = !!settings.busy;
  if (settings.loading) return <MobilePage title={title} fallback="/settings/preferences"><LoadingState /></MobilePage>;
  if (!settings.loaded) return <MobilePage title={title} fallback="/settings/preferences"><ErrorState message={t(settings.error || 'Failed to load settings')} onRetry={() => void settings.refresh()} /></MobilePage>;
  return <MobilePage title={title} fallback="/settings/preferences" footer={settings.state.phase !== 'clean' ? <>
    <MobileText muted accessibilityLiveRegion="polite" testID="settings-phase">{t(settings.state.phase === 'applied' ? 'Applied' : settings.state.phase === 'saved-draft' ? 'Draft not applied yet' : 'Unsaved changes')}</MobileText>
    {settings.state.phase !== 'applied' && <>
      <MobileAction variant="secondary" disabled={disabled || settings.state.phase !== 'unsaved'} loading={settings.busy === 'save'} onPress={() => void save('save')}>{t('Save draft')}</MobileAction>
      <MobileAction disabled={disabled} loading={settings.busy === 'apply'} onPress={() => void save('apply')}>{t('Apply changes')}</MobileAction>
      <MobileAction variant="ghost" disabled={disabled} onPress={() => void save('discard')}>{t('Discard')}</MobileAction>
    </>}
  </> : undefined}>
    <MobileText muted>{t(appearance ? 'Changes preview before you apply.' : 'Choose languages and complete the required chat setup.')}</MobileText>
    {!!settings.error && <InlineAlert tone="danger">{t(settings.error)}</InlineAlert>}
    <MobileRow title={t(appearance ? 'General' : 'Appearance')} onPress={() => router.replace(appearance ? '/settings/general' : '/settings/appearance')} />
    <MobileAction variant="secondary" disabled={disabled} onPress={() => { if (settings.state.phase === 'unsaved' || settings.state.phase === 'saved-draft') setConfirmReload(true); else void settings.refresh(); }}>{t('Refresh')}</MobileAction>
    <ConfirmDialog open={confirmReload} title={t('Reload settings?')} confirmLabel={t('Refresh')} tone="default" onCancel={() => setConfirmReload(false)} onConfirm={() => { setConfirmReload(false); void settings.refresh(); }}>{t('Local edits will be replaced with the server settings and saved draft.')}</ConfirmDialog>
    {appearance ? <>
      <MobileChoice label={t('Theme')} disabled={disabled} value={p.theme} options={(['system', 'snow', 'cream', 'dark', 'glass'] as const).map((value, i) => ({ value, label: t(['System', 'Default', 'Cream', 'Dark', 'Glass'][i]) }))} onChange={theme => edit({ theme })} />
      <MobileChoice label={t('Learning text size')} value={String(p.scale)} disabled={disabled} onChange={value => edit({ scale: Number(value) })} options={[90, 100, 110, 125, 150].map(value => ({ value: String(value), label: `${value}%` }))} />
      <MobileChoice label={t('Line spacing')} value={p.spacing} disabled={disabled} onChange={spacing => edit({ spacing })} options={[{ value: 'compact', label: t('Compact') }, { value: 'normal', label: t('Normal') }, { value: 'relaxed', label: t('Relaxed') }]} />
      <View style={{ gap: 12 }}><MobileText style={{ fontSize: 18, fontWeight: '600' }}>{t('Learning text preview')}</MobileText><View testID="learning-text-preview" style={{ backgroundColor: colors.card, borderRadius: 10, padding: 16, gap: 12 }}>{['Learning starts with a question. Explore an idea, connect it to what you know, and explain it in your own words.', '学习从一个问题开始。探索新的想法，将它与已有的知识联系起来，再用自己的语言解释。'].map(text => <DText key={text} role="learning" style={{ fontSize: 16 * p.scale / 100, lineHeight: 16 * p.scale / 100 * { compact: 1.5, normal: 1.75, relaxed: 2 }[p.spacing] }}>{text}</DText>)}</View></View>
      <MobileAction variant="secondary" disabled={disabled} onPress={() => edit({ scale: 100, spacing: 'normal' })}>{t('Reset learning text')}</MobileAction>
      <MobileChoice label={t('Code syntax theme')} disabled={disabled} value={p.codeTheme} options={codeOptions.map(option => ({ value: option.id, label: option.label }))} onChange={codeTheme => edit({ codeTheme })} />
      <Toggle label={t('Show line numbers')} disabled={disabled} value={p.lineNumbers} onChange={lineNumbers => edit({ lineNumbers })} />
      <Toggle label={t('Wrap long lines')} disabled={disabled} value={p.wrap} onChange={wrap => edit({ wrap })} />
      <CodePreview preferences={p} />
    </> : <>
      <MobileChoice label={t('Interface language')} disabled={disabled} value={p.language} options={interfaceLanguages} onChange={language => edit({ language })} />
      <MobileChoice label={t('Model output language')} disabled={disabled} value={p.responseLanguage} options={responseLanguages} onChange={responseLanguage => edit({ responseLanguage })} />
      <MobileChoice label={t('Interface layout')} disabled={disabled} value={p.layout} options={[{ value: 'classic', label: t('Classic') }, { value: 'modern', label: t('Modern') }]} onChange={layout => edit({ layout })} />
      <MobileText muted>{t('Mobile · web Classic / Modern preference retained for web')}</MobileText>
      {catalogEditable(f.mode) && <View style={{ gap: 12 }}><MobileText style={{ fontSize: 18, fontWeight: '600' }}>{t('Set up chat')}</MobileText>
        {[['/settings/connections', '1 · Connect provider', 'Add credentials and test connection'], ['/settings/llm', '2 · Choose chat model', 'Test and set a default'], ['/settings/status', '3 · Check service readiness', 'Basic chat needs no optional integrations']].map(([href, label, description]) => <MobileRow key={href} title={t(label)} description={t(description)} onPress={() => router.push(href as Href)} />)}
      </View>}
      <MobileRow title={t('Optional services')} description={t('Knowledge search · Web search · Task models')} onPress={() => router.push('/settings/services')} />
    </>}
  </MobilePage>;
}
