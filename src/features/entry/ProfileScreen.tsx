import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Sparkles, Sprout, Leaf, Feather, Cloud, Droplet, Sun, Moon, Flame, Star, Heart, Lightbulb, Compass, Cherry, Cookie, Music } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { DText } from '@/shared/ui/Text';
import { Button, Field } from '@/shared/ui/Controls';
import { Dialog } from '@/shared/ui/Dialog';
import { PageScaffold, Surface } from '@/shared/ui/Layout';
import { ErrorState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { useFixtures } from './FixtureProvider';
import { AVATAR_COLORS, AVATAR_ICON_NAMES, fallbackAvatarFor, parseAvatarMarker } from './avatar';
import { avatarError, passwordError } from './model';
import { BackButton } from './Boundary';
import { useCopy } from './copy';
const icons = { sparkles: Sparkles, sprout: Sprout, leaf: Leaf, feather: Feather, cloud: Cloud, droplet: Droplet, sun: Sun, moon: Moon, flame: Flame, star: Star, heart: Heart, lightbulb: Lightbulb, compass: Compass, cherry: Cherry, cookie: Cookie, music: Music };
export function ProfileScreen() {
  const f = useFixtures(); const t = useCopy(); const { colors } = useDesign();
  const [upload, setUpload] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [current, setCurrent] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  if (f.mode === 'disabled') return <Redirect href="/chat" />;
  if (!f.profile) return <Redirect href={{ pathname: '/login', params: { next: '/profile' } }} />;
  if (f.resourceState === 'loading') return <LoadingState />;
  if (f.resourceState === 'error') return <ErrorState message={t('Failed to load profile')} onRetry={() => f.setResourceState('ready')} />;
  if (['denied', 'unavailable'].includes(f.resourceState)) return <PageScaffold title={t('My profile')}><InlineAlert tone="warning">{t('Unavailable')}</InlineAlert><BackButton /></PageScaffold>;
  const profile = f.profile; const descriptor = parseAvatarMarker(profile.avatar); const fallback = fallbackAvatarFor(profile.username);
  const name = descriptor.kind === 'icon' ? descriptor.icon : fallback.icon; const color = descriptor.kind === 'icon' ? descriptor.color : fallback.color;
  const Icon = icons[name as keyof typeof icons];
  const setMarker = async (marker: string) => { setError(''); if (!await f.run('avatar', () => f.setProfile({ ...profile, avatar: marker }))) setError(t('Failed to load profile')); };
  const uploadImage = async (size: number, decoded: boolean) => { const invalid = avatarError(size, decoded); if (invalid) { setError(t(invalid)); return; } await setMarker('img:bundled-sample'); setUpload(false); };
  const changePassword = async () => {
    setNotice(''); const invalid = passwordError(current, password, confirmation, f.password); setError(invalid ? t(invalid) : ''); if (invalid) return;
    if (await f.run('password', () => { f.setPassword(password); f.setProfile({ ...profile, mustChange: false }); })) { setNotice(t('Password updated')); setCurrent(''); setPassword(''); setConfirmation(''); }
    else setError(t('Failed to change password'));
  };
  return <PageScaffold title={t('My profile')} description={t('View your account and personalize your avatar')}><BackButton />
    <Surface><View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: AVATAR_COLORS[color], alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{descriptor.kind === 'image' ? <Image source={require('../../../assets/brand/color-logo.png')} accessibilityLabel={t('Avatar')} style={{ width: 72, height: 72 }} contentFit="cover" /> : <Icon size={32} color="#ffffff" />}</View>
      <View style={{ flex: 1 }}><DText role="label">{profile.username}</DText><DText muted>{t(profile.role === 'admin' ? 'Administrator' : profile.role === 'student' ? 'Student' : profile.role === 'teacher' ? 'Teacher' : 'User')}</DText><DText role="caption" muted>{t('Joined')}: {profile.joined}</DText></View>
    </View><Button variant="secondary" onPress={() => router.push('/session-handoff')}>{t('Public device sign-in')}</Button></Surface>
    {!!error && <InlineAlert tone="danger">{error}</InlineAlert>}
    <Surface><DText role="section">{t('Avatar')}</DText><DText muted>{t('Upload a picture or pick an icon')}</DText><Button variant="secondary" disabled={!!f.busy} onPress={() => setUpload(true)}>{t('Upload image')}</Button>
      {descriptor.kind === 'image' && <Button variant="ghost" disabled={!!f.busy} onPress={() => void setMarker('')}>{t('Remove photo')}</Button>}
      <DText role="small" muted>{t('Or pick an icon')}</DText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{AVATAR_ICON_NAMES.map((entry) => { const Glyph = icons[entry as keyof typeof icons]; return <Button key={entry} variant="ghost" accessibilityLabel={`${t('Avatar')} ${entry}`} accessibilityState={{ selected: descriptor.kind !== 'image' && name === entry }} disabled={!!f.busy} onPress={() => void setMarker(`icon:${entry}:${color}`)} style={{ width: 48, paddingHorizontal: 0, backgroundColor: name === entry && descriptor.kind !== 'image' ? AVATAR_COLORS[color] : colors.muted }}><Glyph size={18} color={name === entry && descriptor.kind !== 'image' ? '#ffffff' : colors.foreground} /></Button>; })}</View>
      <DText role="small" muted>{t('Color')}</DText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Object.entries(AVATAR_COLORS).map(([key, hex]) => <Button key={key} accessibilityLabel={`${t('Color')} ${key}`} accessibilityState={{ selected: color === key }} disabled={!!f.busy} onPress={() => void setMarker(`icon:${name}:${key}`)} style={{ backgroundColor: hex, width: 48, paddingHorizontal: 0 }}>{color === key ? '✓' : ' '}</Button>)}</View>
    </Surface>
    {profile.mustChange && <InlineAlert tone="warning">{t('You are still using the password an administrator gave you. Please set your own below.')}</InlineAlert>}
    <Surface><DText role="section">{t('Password')}</DText><DText muted>{t('Change your password')}</DText>
      <Field label={t('Current password')} secureTextEntry value={current} onChangeText={setCurrent} autoComplete="current-password" editable={!f.busy} />
      <Field label={t('New password')} secureTextEntry value={password} onChangeText={setPassword} autoComplete="new-password" editable={!f.busy} />
      <Field label={t('Confirm new password')} secureTextEntry value={confirmation} onChangeText={setConfirmation} autoComplete="new-password" editable={!f.busy} onSubmitEditing={() => void changePassword()} />
      {!!notice && <InlineAlert tone="success">{notice}</InlineAlert>}<Button loading={f.busy === 'password'} disabled={!!f.busy} onPress={() => void changePassword()}>{t('Update password')}</Button>
    </Surface>
    <Surface><DText role="section">{t('Sign out')}</DText><DText muted>{t('End your session on this device')}</DText><Button variant="danger" onPress={() => { f.signOut(); router.replace('/login'); }}>{t('Sign out')}</Button></Surface>
    <Dialog placement="bottom" open={upload} title={t('Upload image')} busy={!!f.busy} onClose={() => setUpload(false)}>
      <Button variant="secondary" disabled={!!f.busy} onPress={() => void uploadImage(18000, true)}>color-logo.png · 18 KB</Button>
      {__DEV__ && <><Button variant="ghost" onPress={() => void uploadImage(21 * 1024 * 1024, true)}>Development sample · 21 MB</Button><Button variant="ghost" onPress={() => void uploadImage(18000, false)}>Development sample · corrupt.png</Button></>}
      {!!error && <InlineAlert tone="danger">{error}</InlineAlert>}
    </Dialog>
  </PageScaffold>;
}
