import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import { Sparkles, Sprout, Leaf, Feather, Cloud, Droplet, Sun, Moon, Flame, Star, Heart, Lightbulb, Compass, Cherry, Cookie, Music } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { DText } from '@/shared/ui/Text';
import { Button, Field } from '@/shared/ui/Controls';
import { PageScaffold, Surface } from '@/shared/ui/Layout';
import { InlineAlert } from '@/shared/ui/Feedback';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfileActions } from '@/features/profile/useProfileActions';
import { ProfilePhoto } from '@/features/profile/ProfilePhoto';
import { validatePassword } from '@/features/profile/repository';
import { AVATAR_COLORS, AVATAR_ICON_NAMES, fallbackAvatarFor, parseAvatarMarker } from './avatar';
import { BackButton } from './Boundary';
import { useCopy } from './copy';
const icons = { sparkles: Sparkles, sprout: Sprout, leaf: Leaf, feather: Feather, cloud: Cloud, droplet: Droplet, sun: Sun, moon: Moon, flame: Flame, star: Star, heart: Heart, lightbulb: Lightbulb, compass: Compass, cherry: Cherry, cookie: Cookie, music: Music };
export function ProfileScreen() {
  const auth = useAuth(); const actions = useProfileActions(); const t = useCopy(); const { colors } = useDesign();
  const [current, setCurrent] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  if (!auth.session?.status.enabled) return <Redirect href="/chat" />;
  if (!auth.session.profile) return <Redirect href={{ pathname: '/login', params: { next: '/profile' } }} />;
  const profile = auth.session.profile;
  const descriptor = parseAvatarMarker(profile.avatar); const fallback = fallbackAvatarFor(profile.username);
  const name = descriptor.kind === 'icon' ? descriptor.icon : fallback.icon; const color = descriptor.kind === 'icon' ? descriptor.color : fallback.color;
  const Icon = icons[name as keyof typeof icons];
  const changePassword = async () => {
    if (actions.busy) return;
    const invalid = validatePassword(current, password, confirmation);
    actions.setNotice(''); actions.setError(invalid ?? '');
    if (invalid) return;
    if (await actions.changePassword(current, password)) { setCurrent(''); setPassword(''); setConfirmation(''); }
  };
  return <PageScaffold title={t('My profile')} description={t('View your account and personalize your avatar')}><BackButton />
    <Surface><View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: AVATAR_COLORS[color], alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{descriptor.kind === 'image' ? <ProfilePhoto userId={profile.id} marker={profile.avatar} /> : <Icon size={32} color="#ffffff" />}</View>
      <View style={{ flex: 1 }}><DText role="label">{profile.username}</DText><DText muted>{t(profile.role === 'admin' ? 'Administrator' : profile.role === 'student' ? 'Student' : profile.role === 'teacher' ? 'Teacher' : 'User')}</DText><DText role="caption" muted>{t('Joined')}: {profile.joined}</DText></View>
    </View><Button variant="secondary" onPress={() => router.push('/session-handoff')}>{t('Public device sign-in')}</Button></Surface>
    {!!actions.error && <InlineAlert tone="danger">{t(actions.error)}</InlineAlert>}
    <Surface><DText role="section">{t('Avatar')}</DText><DText muted>{t('Upload a picture or pick an icon')}</DText><DText role="small" muted>{t('PNG, JPEG or WebP · up to 1 MB')}</DText><Button variant="secondary" disabled={!!actions.busy} loading={actions.busy === 'avatar'} onPress={() => void actions.uploadPhoto()}>{t('Upload image')}</Button>
      {descriptor.kind === 'image' && <Button variant="ghost" disabled={!!actions.busy} onPress={() => void actions.removePhoto()}>{t('Remove photo')}</Button>}
      <DText role="small" muted>{t('Or pick an icon')}</DText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{AVATAR_ICON_NAMES.map((entry) => { const Glyph = icons[entry as keyof typeof icons]; return <Button key={entry} variant="ghost" accessibilityLabel={`${t('Avatar')} ${entry}`} accessibilityState={{ selected: descriptor.kind !== 'image' && name === entry }} disabled={!!actions.busy} onPress={() => void actions.setMarker(`icon:${entry}:${color}`)} style={{ width: 48, paddingHorizontal: 0, backgroundColor: name === entry && descriptor.kind !== 'image' ? AVATAR_COLORS[color] : colors.muted }}><Glyph size={18} color={name === entry && descriptor.kind !== 'image' ? '#ffffff' : colors.foreground} /></Button>; })}</View>
      <DText role="small" muted>{t('Color')}</DText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Object.entries(AVATAR_COLORS).map(([key, hex]) => <Button key={key} accessibilityLabel={`${t('Color')} ${key}`} accessibilityState={{ selected: color === key }} disabled={!!actions.busy} onPress={() => void actions.setMarker(`icon:${name}:${key}`)} style={{ backgroundColor: hex, width: 48, paddingHorizontal: 0 }}>{color === key ? '✓' : ' '}</Button>)}</View>
    </Surface>
    {profile.canChangePassword && profile.mustChange && <InlineAlert tone="warning">{t('You are still using the password an administrator gave you. Please set your own below.')}</InlineAlert>}
    {profile.canChangePassword && <Surface><DText role="section">{t('Password')}</DText><DText muted>{t('Change your password')}</DText>
      <Field label={t('Current password')} secureTextEntry value={current} onChangeText={setCurrent} autoComplete="current-password" editable={!actions.busy} />
      <Field label={t('New password')} secureTextEntry value={password} onChangeText={setPassword} autoComplete="new-password" editable={!actions.busy} />
      <Field label={t('Confirm new password')} secureTextEntry value={confirmation} onChangeText={setConfirmation} autoComplete="new-password" editable={!actions.busy} onSubmitEditing={() => void changePassword()} />
      {!!actions.notice && <InlineAlert tone="success">{t(actions.notice)}</InlineAlert>}<Button loading={actions.busy === 'password'} disabled={!!actions.busy} onPress={() => void changePassword()}>{t('Update password')}</Button>
    </Surface>}
    <Surface><DText role="section">{t('Sign out')}</DText><DText muted>{t('End your session on this device')}</DText><Button variant="danger" disabled={!!actions.busy} loading={actions.busy === 'signout'} onPress={() => void actions.signOut()}>{t('Sign out')}</Button></Surface>

  </PageScaffold>;
}
