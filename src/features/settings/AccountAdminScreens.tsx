import { useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { importUserFile } from './api';
import { MobileAction, MobileChoice, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { conversationError } from '@/features/chat/live/repository';
import { useAuth } from '@/features/auth/AuthProvider';
import { DataDetails, isRecord, useRemoteData } from './RemoteSettingsScreen';
import { ServerForm } from './ServerForm';
import { useCopy } from '@/features/entry/copy';

export function UsersScreen() {
  const remote = useRemoteData('/auth/users'); const t = useCopy(); const [query, setQuery] = useState('');
  const users = Array.isArray(remote.data) ? remote.data.filter(isRecord) : [];
  return <MobilePage title={t('User management')}>
    <MobileField label={t('Search users')} value={query} onChangeText={setQuery} />
    {remote.loading && <LoadingState />}{!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {users.filter(row => String(row.username).toLowerCase().includes(query.toLowerCase())).map(row => <MobileRow key={String(row.id)} title={String(row.username)} description={`${row.role} · ${row.created_at}`} disabled />)}
    <MobileAction onPress={() => router.push('/admin/users/new')}>{t('Add user')}</MobileAction>
    <MobileAction variant="secondary" onPress={() => router.push('/admin/users/import')}>{t('Import users')}</MobileAction>
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
export function AddUserScreen() {
  const t = useCopy();
  return <MobilePage title={t('Add user')}><ServerForm initial={{ username: '', password: '', preset: 'standard' }} path="/auth/users" method="post" transform={value => {
    if (!String(value.username).trim() || String(value.password).length < 8) throw new Error('Enter a username and a password with at least 8 characters.');
    return value;
  }} onSaved={() => router.replace('/admin/users')}>
    {(value, setValue) => <><MobileField label={t('Username or email')} value={String(value.username)} autoCapitalize="none" onChangeText={username => setValue({ ...value, username })} />
      <MobileField label={t('Password')} secureTextEntry value={String(value.password)} onChangeText={password => setValue({ ...value, password })} />
      <MobileChoice label={t('Account preset')} value={String(value.preset)} options={['standard', 'learner', 'custom'].map(item => ({ value: item, label: t(item) }))} onChange={preset => setValue({ ...value, preset })} /></>}
  </ServerForm></MobilePage>;
}
export function ImportUsersScreen() {
  const t = useCopy(); const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [busy, setBusy] = useState(false); const lock = useRef(false); const [error, setError] = useState(''); const [result, setResult] = useState<unknown>(null);
  const pick = async () => {
    setError('');
    try {
      const selection = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'], multiple: false, copyToCacheDirectory: true });
      if (!selection.canceled) { setFile(selection.assets[0]); setResult(null); }
    } catch (cause) { setError(conversationError(cause)); }
  };
  const upload = async () => {
    if (!file || lock.current) return;
    if ((file.size ?? 0) > 2 * 1024 * 1024) { setError('User import file exceeds 2 MB.'); return; }
    lock.current = true; setBusy(true); setError('');
    try {
      setResult(await importUserFile(file)); setFile(null);
    } catch (cause) { setError(conversationError(cause)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <MobilePage title={t('Import users')}>
    <MobileText>{t('Required header')}: username,password,preset</MobileText>
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    <MobileAction variant="secondary" disabled={busy} onPress={() => void pick()}>{t('Choose CSV file')}</MobileAction>
    {file && <MobileText>{file.name}</MobileText>}
    <MobileAction disabled={!file} loading={busy} onPress={() => void upload()}>{t('Import users')}</MobileAction>
    <DataDetails value={result} />
  </MobilePage>;
}
export function DeviceHandoffScreen() {
  const t = useCopy(); const [handoff, setHandoff] = useState<{ url: string; expires: string } | null>(null);
  return <MobilePage title={t('Device sign-in')}>
    <ServerForm initial={{ public_origin: 'https://' }} path="/auth/session-handoff" method="post" transform={value => {
      const url = new URL(String(value.public_origin));
      if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('Enter a valid HTTPS public origin.');
      return { public_origin: url.origin };
    }} onSaved={data => { if (isRecord(data) && typeof data.handoff_url === 'string') setHandoff({ url: data.handoff_url, expires: String(data.expires_at ?? '') }); }} />
    {handoff && <><MobileText selectable>{handoff.url}</MobileText><MobileText muted>{t('Expires at')}: {handoff.expires}</MobileText></>}
  </MobilePage>;
}
export function AuxiliaryStateScreen({ number }: { number: number }) {
  const auth = useAuth(); const t = useCopy();
  return <MobilePage title={t(number === 114 ? 'Connection unavailable' : number === 116 ? 'No search results' : 'Settings')}>
    {number === 114 ? <><InlineAlert tone="danger">{t(auth.error || 'Check the connection and retry.')}</InlineAlert><MobileAction onPress={() => void auth.refresh()}>{t('Retry')}</MobileAction></>
      : number === 116 ? <MobileAction onPress={() => router.replace('/search')}>{t('Search')}</MobileAction>
        : <MobileAction onPress={() => router.replace('/settings')}>{t('Return to settings')}</MobileAction>}
  </MobilePage>;
}
