import type { Href } from 'expo-router';
import { useState } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesign } from '@/shared/design/DesignProvider';
import { Button, Field } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { Surface } from '@/shared/ui/Layout';
import { InlineAlert } from '@/shared/ui/Feedback';
import { authError, useAuth } from '@/features/auth/AuthProvider';
import { normalizeServerUrl } from '@/api/server';
import { normalizeDestination } from './model';
import { useCopy } from './copy';
export function AuthScreen({ register = false }: { register?: boolean }) {
  const f = useAuth(); const t = useCopy(); const { colors } = useDesign();
  const params = useLocalSearchParams<{ next?: string; registered?: string }>();
  const [serverInput, setServerInput] = useState<string | null>(null);
  const serverUrl = serverInput ?? f.serverUrl;
  const [serverError, setServerError] = useState('');
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [error, setError] = useState('');
  const next = normalizeDestination(params.next ?? '/learning');
  if (f.session && (!f.session.status.enabled || f.session.status.authenticated)) return <Redirect href={(f.session.profile?.mustChange ? '/profile?change=1' : next) as Href} />;
  if (!f.loading && f.session && register && !f.session.firstUser) return <Redirect href={{ pathname: '/login', params: { next } }} />;
  if (!register && f.session?.firstUser) return <Redirect href={{ pathname: '/register', params: { next } }} />;
  const submit = async () => {
    setError(''); setServerError('');
    try { normalizeServerUrl(serverUrl); } catch { setServerError(t('Enter a valid HTTP or HTTPS server URL.')); return; }
    if (!username.trim() || !password) { setError(t('Email or username') + ' · ' + t('Password')); return; }
    if (register && password !== confirm) { setError(t('Passwords do not match')); return; }
    if (register && password.length < 8) { setError(t('Password must be at least 8 characters')); return; }
    if (f.busy) return;
    try {
      if (await f.authenticate(username, password, register, serverUrl)) setPassword('');
    } catch (cause) {
      setPassword(''); setConfirm(''); setError(t(authError(cause)));
    }

  };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <View style={{ width: '100%', maxWidth: 384, gap: 24 }}>
      <View style={{ alignItems: 'center', gap: 4, marginBottom: 8 }}><DText accessibilityRole="header" style={{ fontFamily: 'LoraSemiBold', fontSize: 24, lineHeight: 32 }}>DeepTutor</DText><DText muted>{t(register ? 'Create your account' : 'Sign in to your account')}</DText></View>
      {!register && params.registered === '1' && <InlineAlert tone="success">{t('Account created! Sign in to continue.')}</InlineAlert>}
      {register && f.session?.firstUser && <InlineAlert>{t('First user:')} {t('You will be granted admin privileges and can manage other users from the admin dashboard.')}</InlineAlert>}
      <Surface style={{ padding: 32, gap: 20 }}>
        <Field label={t('Email or username')} value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" placeholder="you@example.com" editable={!f.busy && !f.loading} />
        <Field label={t('Password')} value={password} onChangeText={setPassword} secureTextEntry autoComplete={register ? 'new-password' : 'current-password'} editable={!f.busy && !f.loading} hint={register ? t('At least 8 characters') : undefined} onSubmitEditing={() => { if (!register) void submit(); }} />
        <Field label={t('API server URL')} value={serverUrl} onChangeText={value => { setServerInput(value); setServerError(''); }} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="http://deeptutor.local:8001" editable={!f.busy} error={serverError} hint={t('Server address, for example https://your-server.com')} />
        {register && <Field label={t('Confirm password')} value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" editable={!f.busy && !f.loading} onSubmitEditing={() => void submit()} />}
        {!!f.error && <InlineAlert tone="danger">{t(f.error)}</InlineAlert>}
        {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
        <Button disabled={f.loading} loading={f.busy || f.loading} onPress={() => void submit()}>{t(f.busy ? register ? 'Creating account…' : 'Signing in…' : register ? 'Create account' : 'Sign in')}</Button>
      </Surface>
      <View style={{ alignItems: 'center', gap: 4 }}><DText muted>{t(register ? 'Already have an account?' : 'Contact your administrator to create an account.')}</DText>{(register || f.session?.firstUser) && <Button variant="ghost" disabled={f.busy} onPress={() => router.replace({ pathname: register ? '/login' : '/register', params: { next } })}>{t(register ? 'Sign in' : 'Create one')}</Button>}<DText role="caption" muted>{t('DeepTutor · Agent-Native Learning')}</DText></View>
    </View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
