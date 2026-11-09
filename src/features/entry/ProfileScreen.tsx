import { useState, type ReactNode } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Check, Sparkles, Sprout, Leaf, Feather, Cloud, Droplet, Sun, Moon, Flame, Star, Heart, Lightbulb, Compass, Cherry, Cookie, Music } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, Field } from '@/shared/ui/Controls';
import { InlineAlert } from '@/shared/ui/Feedback';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfileActions } from '@/features/profile/useProfileActions';
import { ProfilePhoto } from '@/features/profile/ProfilePhoto';
import { validatePassword } from '@/features/profile/repository';
import { AVATAR_COLORS, AVATAR_ICON_NAMES, fallbackAvatarFor, parseAvatarMarker } from './avatar';
import { useCopy } from './copy';
const icons = { sparkles: Sparkles, sprout: Sprout, leaf: Leaf, feather: Feather, cloud: Cloud, droplet: Droplet, sun: Sun, moon: Moon, flame: Flame, star: Star, heart: Heart, lightbulb: Lightbulb, compass: Compass, cherry: Cherry, cookie: Cookie, music: Music };
type ProfileView = 'profile' | 'password' | 'avatar';

// Mobile layouts 63, 64 and 138 share API actions, but have separate navigation and forms.
export function ProfileScreen({ view = 'profile' }: { view?: ProfileView }) {
  const auth = useAuth(); const actions = useProfileActions(); const t = useCopy(); const { colors } = useDesign();
  const { change } = useLocalSearchParams<{ change?: string }>();
  const [current, setCurrent] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  const [selection, setSelection] = useState<{ icon: string; color: string } | null>(null);
  const [showColors, setShowColors] = useState(false);
  const [showAllIcons, setShowAllIcons] = useState(false);
  if (!auth.session?.status.enabled) return <Redirect href="/chat" />;
  if (!auth.session.profile) return <Redirect href={{ pathname: '/login', params: { next: '/profile' } }} />;
  const profile = auth.session.profile;
  if (view === 'profile' && change === '1' && profile.canChangePassword) return <Redirect href="/profile/password" />;
  if (view === 'password' && !profile.canChangePassword) return <Redirect href="/profile" />;
  const descriptor = parseAvatarMarker(profile.avatar); const fallback = fallbackAvatarFor(profile.username);
  const saved = descriptor.kind === 'icon' ? descriptor : fallback;
  const { icon, color } = selection ?? saved;
  const Icon = icons[icon as keyof typeof icons];
  const busy = !!actions.busy;
  const textStyle = { fontFamily: 'Inter', fontSize: 16, lineHeight: 22.4, color: colors.foreground };
  const mutedStyle = { ...textStyle, fontSize: 14, lineHeight: 19.6, color: colors.mutedForeground };
  const back = () => router.canGoBack() ? router.back() : router.replace(view === 'profile' ? '/mobile/61' : '/profile');
  const action = (label: string, onPress: () => void, secondary = false) => <Button disabled={busy} loading={busy} onPress={onPress} variant={secondary ? 'secondary' : 'primary'} style={{ minHeight: 52, borderRadius: 12, backgroundColor: secondary ? colors.card : colors.primary }}><Text style={{ ...textStyle, fontWeight: '600', color: secondary ? colors.primary : colors.primaryForeground }}>{t(label)}</Text></Button>;
  const row = (label: string, description: string, onPress: () => void, selected?: boolean, leading?: ReactNode) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={t(label)} aria-selected={selected} accessibilityState={{ selected, disabled: busy }} disabled={busy} onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 })}>
    {leading}<View style={{ flex: 1, gap: 4 }}><Text style={{ ...textStyle, fontWeight: '500' }}>{t(label)}</Text>{!!description && <Text style={mutedStyle}>{t(description)}</Text>}</View>{selected ? <Check size={20} color={colors.primary} /> : <ChevronRight size={20} color={colors.mutedForeground} />}
  </Pressable>;
  const changePassword = async () => {
    if (busy) return;
    const invalid = validatePassword(current, password, confirmation);
    actions.setNotice(''); actions.setError(invalid ?? '');
    if (invalid) return;
    if (await actions.changePassword(current, password)) { setCurrent(''); setPassword(''); setConfirmation(''); }
  };
  const title = view === 'profile' ? 'My profile' : view === 'password' ? 'Change password' : 'Avatar';
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: 20, paddingBottom: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Back')} onPress={back} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={24} color={colors.foreground} /></Pressable>
        <Text accessibilityRole="header" style={{ ...textStyle, flex: 1, fontSize: 22, lineHeight: 31, fontWeight: '600' }}>{t(title)}</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 24 }}>
        <Text style={mutedStyle}>{view === 'profile' ? `${profile.username} · ${t(profile.role === 'admin' ? 'Administrator' : profile.role === 'student' ? 'Student' : profile.role === 'teacher' ? 'Teacher' : 'User')} · ${t('Joined')} ${profile.joined}` : t(view === 'password' ? 'Account security' : 'Personalize your profile')}</Text>
        {!!actions.error && <InlineAlert tone="danger">{t(actions.error)}</InlineAlert>}
        {view === 'profile' && <>
          {row('Avatar', 'Upload picture · choose icon · color', () => router.push('/profile/avatar'))}
          {profile.canChangePassword && row('Change password', 'Current, new and confirm password', () => router.push('/profile/password'))}
          {row('Public device sign-in', 'Create a link using a public HTTPS origin', () => router.push('/mobile/139'))}
          {action('Sign out of this device', () => void actions.signOut(), true)}
        </>}
        {view === 'password' && <>
          {profile.mustChange && <InlineAlert tone="warning">{t('You are still using the password an administrator gave you. Please set your own below.')}</InlineAlert>}
          {[
            { label: 'Current password', value: current, onChangeText: setCurrent, autoComplete: 'current-password' as const },
            { label: 'New password', value: password, onChangeText: setPassword, autoComplete: 'new-password' as const },
            { label: 'Confirm new password', value: confirmation, onChangeText: setConfirmation, autoComplete: 'new-password' as const },
          ].map(field => <Field key={field.label} {...field} label={t(field.label)} secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!busy} labelStyle={{ ...mutedStyle, fontWeight: '600' }} style={{ ...textStyle, backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 10, minHeight: 52 }} onSubmitEditing={field.label === 'Confirm new password' ? () => void changePassword() : undefined} />)}
          {!!actions.notice && <InlineAlert tone="success">{t(actions.notice)}</InlineAlert>}
          {action('Update password', () => void changePassword())}
        </>}
        {view === 'avatar' && <>
          {action('Upload image', () => { setSelection(null); void actions.uploadPhoto(); })}
          <Text style={mutedStyle}>{t('PNG, JPEG or WebP · up to 1 MB')}</Text>
          {descriptor.kind === 'image' && !selection ? <View style={{ gap: 12 }}><ProfilePhoto userId={profile.id} marker={profile.avatar} />{action('Remove photo', () => void actions.removePhoto(), true)}</View> : <View accessibilityLabel={t('Avatar')} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: AVATAR_COLORS[color], alignItems: 'center', justifyContent: 'center' }}><Icon size={32} color="#ffffff" /></View>}
          <View style={{ gap: 12 }}><Text style={{ ...textStyle, fontSize: 18, fontWeight: '600' }}>{t('Choose an icon')}</Text>
            {(showAllIcons ? AVATAR_ICON_NAMES : ['sprout', 'compass', 'leaf', 'sparkles']).map(name => { const Glyph = icons[name as keyof typeof icons]; return row(name[0].toUpperCase() + name.slice(1), name === 'compass' ? 'Curiosity and exploration' : name === 'leaf' ? 'Growth' : name === 'sparkles' ? 'Discovery' : '', () => setSelection({ icon: name, color }), (descriptor.kind !== 'image' || !!selection) && icon === name, <Glyph size={24} color={colors.primary} />); })}
            {!showAllIcons && <Button variant="ghost" disabled={busy} onPress={() => setShowAllIcons(true)}>{t('More')}</Button>}
          </View>
          <View style={{ gap: 8 }}><Text style={{ ...mutedStyle, fontWeight: '600' }}>{t('Avatar color')}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('Choose color')} accessibilityState={{ expanded: showColors, disabled: busy }} disabled={busy} onPress={() => setShowColors(!showColors)} style={{ minHeight: 52, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: colors.input, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: AVATAR_COLORS[color] }} /><Text style={textStyle}>{t('Choose color')}</Text></Pressable>
            {showColors && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Object.entries(AVATAR_COLORS).map(([key, hex]) => <Pressable key={key} accessibilityRole="button" accessibilityLabel={`${t('Color')} ${key}`} accessibilityState={{ selected: color === key, disabled: busy }} disabled={busy} onPress={() => { setSelection({ icon, color: key }); setShowColors(false); }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: hex, alignItems: 'center', justifyContent: 'center' }}>{color === key && <Check size={24} color="#ffffff" />}</Pressable>)}</View>}
          </View>
          {action('Save avatar', () => { if (descriptor.kind === 'image' && !selection) { back(); return; } void actions.setMarker(`icon:${icon}:${color}`).then(ok => { if (ok) back(); }); })}
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
