import type { Href } from 'expo-router';
import { useState } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, Field } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { Surface } from '@/shared/ui/Layout';
import { ErrorState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { useFixtures } from './FixtureProvider';
import { normalizeDestination, principalFor } from './model';
import { useCopy } from './copy';
export function AuthScreen({ register = false }: { register?: boolean }) {
  const f = useFixtures(); const t = useCopy(); const { colors } = useDesign();
  const params = useLocalSearchParams<{ next?: string; registered?: string }>();
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [error, setError] = useState('');
  const next = normalizeDestination(params.next);
  if (f.mode === 'disabled' || f.profile) return <Redirect href={(f.profile?.mustChange ? '/profile?change=1' : next) as Href} />;
  if (f.mode === 'loading') return <LoadingState />;
  if (f.mode === 'unavailable') return <ErrorState message={t('Login failed')} onRetry={() => f.resetMode('signed-out')} />;
  if (!register && f.mode === 'first-user') return <Redirect href="/register" />;
  const submit = async () => {
    setError('');
    if (!username.trim() || !password) { setError(t('Email or username') + ' · ' + t('Password')); return; }
    if (register && password !== confirm) { setError(t('Passwords do not match')); return; }
    if (register && password.length < 8) { setError(t('Password must be at least 8 characters')); return; }
    const valid = register ? f.mode !== 'closed' : password === (f.registered?.username === username ? f.registered.password : 'fixture-password') && (['fixture-admin', 'fixture-standard', 'fixture-learner', 'fixture-temporary'].includes(username) || f.registered?.username === username);
    const ok = await f.run(register ? 'register' : 'login', () => {
      if (register) { const first = f.mode === 'first-user'; f.resetMode('signed-out'); f.setRegistered({ username: username.trim(), password, first }); router.replace({ pathname: '/login', params: { registered: '1', next } }); }
      else { const role = f.registered?.first || username === 'fixture-admin' ? 'admin' : username === 'fixture-learner' ? 'learner' : username === 'fixture-temporary' ? 'temporary' : 'standard'; f.resetMode(role); f.setProfile({ ...principalFor(role)!, username }); f.setPassword(password); router.replace((role === 'temporary' ? '/profile?change=1' : next) as Href); }
    }, !valid);
    setPassword(''); setConfirm('');
    if (!ok) setError(t(register ? 'Registration failed' : 'Login failed'));
  };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <View style={{ width: '100%', maxWidth: 384, gap: 24 }}>
      <View style={{ alignItems: 'center', gap: 4, marginBottom: 8 }}><DText accessibilityRole="header" style={{ fontFamily: 'LoraSemiBold', fontSize: 24, lineHeight: 32 }}>DeepTutor</DText><DText muted>{t(register ? 'Create your account' : 'Sign in to your account')}</DText></View>
      {!register && params.registered === '1' && <InlineAlert tone="success">{t('Account created! Sign in to continue.')}</InlineAlert>}
      {register && f.mode === 'first-user' && <InlineAlert>{t('First user:')} {t('You will be granted admin privileges and can manage other users from the admin dashboard.')}</InlineAlert>}
      <Surface style={{ padding: 32, gap: 20 }}>
        <Field label={t('Email or username')} value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" placeholder="you@example.com" editable={!f.busy} />
        <Field label={t('Password')} value={password} onChangeText={setPassword} secureTextEntry autoComplete={register ? 'new-password' : 'current-password'} editable={!f.busy} hint={register ? t('At least 8 characters') : undefined} onSubmitEditing={() => { if (!register) void submit(); }} />
        {register && <Field label={t('Confirm password')} value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" editable={!f.busy} onSubmitEditing={() => void submit()} />}
        {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
        <Button loading={!!f.busy} onPress={() => void submit()}>{t(f.busy ? register ? 'Creating account…' : 'Signing in…' : register ? 'Create account' : 'Sign in')}</Button>
      </Surface>
      <View style={{ alignItems: 'center', gap: 4 }}><DText muted>{t(register ? 'Already have an account?' : "Don't have an account?")}</DText><Button variant="ghost" onPress={() => router.replace({ pathname: register ? '/login' : '/register', params: { next } })}>{t(register ? 'Sign in' : 'Create one')}</Button><DText role="caption" muted>{t('DeepTutor · Agent-Native Learning')}</DText></View>
    </View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
