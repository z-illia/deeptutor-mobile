import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { readRemote, writeRemote } from './api';
import { MobileAction, MobileField, MobilePage, MobileText } from '@/features/mobile/ScreenLayout';
import { Toggle } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { useCopy } from '@/features/entry/copy';
import { conversationError } from '@/features/chat/live/repository';

export type RecordData = Record<string, unknown>;
export const isRecord = (value: unknown): value is RecordData => !!value && typeof value === 'object' && !Array.isArray(value);
export const humanize = (value: string) => value.replace(/[_-]/g, ' ').replace(/^./, letter => letter.toUpperCase());

// Used for server status and catalogs. Never render credential fields, even when
// a future server adds them to a response.
export function DataDetails({ value, label = '' }: { value: unknown; label?: string }) {
  if (/password|secret|api.key|access.token|refresh.token|authorization|cookie/i.test(label)) return null;
  if (value == null) return null;
  if (typeof value !== 'object') return <MobileText selectable>{label ? `${humanize(label)}: ` : ''}{String(value)}</MobileText>;
  return <View style={{ gap: 8 }}>{label && <MobileText style={{ fontWeight: '600' }}>{humanize(label)}</MobileText>}{Object.entries(value).map(([key, item]) => <DataDetails key={key} label={Array.isArray(value) ? '' : key} value={item} />)}</View>;
}

export function useRemoteData(path: string) {
  const [result, setResult] = useState<{ key: string; data: unknown; error: string }>({ key: '', data: null, error: '' });
  const [revision, setRevision] = useState(0);
  const key = JSON.stringify([path, revision]);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController(); request.current = controller;
    void readRemote(path, controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({ key, data, error: '' });
    }).catch(cause => { if (!controller.signal.aborted) setResult({ key, data: null, error: conversationError(cause) }); });
    return () => controller.abort();
  }, [path, key]);
  const refresh = useCallback(() => { request.current?.abort(); setRevision(old => old + 1); }, []);
  return { data: result.key === key ? result.data : null, error: result.key === key ? result.error : '', loading: result.key !== key, refresh };
}

type FieldSpec = { key: string; label: string; type?: 'number' | 'boolean' | 'lines'; min?: number; max?: number };
type SettingsSpec = { title: string; path: string; envelope?: string; fields?: FieldSpec[] };
export const remoteSettings: Record<number, SettingsSpec> = {
  88: { title: 'Usage statistics', path: '/settings/usage' },
  97: { title: 'Attachments', path: '/settings/chat-attachments', envelope: 'settings', fields: [
    { key: 'max_file_mb', label: 'Maximum file size (MB)', type: 'number', min: 1 },
    { key: 'max_total_mb', label: 'Maximum total size (MB)', type: 'number', min: 1 },
    { key: 'max_chars_per_doc', label: 'Characters per document', type: 'number', min: 1 },
    { key: 'max_chars_total', label: 'Total characters', type: 'number', min: 1 },
  ] },
  100: { title: 'Document parsing', path: '/settings/document-parsing', fields: [
    { key: 'engine', label: 'Parsing engine' }, { key: 'image_caption', label: 'Image captions', type: 'boolean' },
  ] },
  101: { title: 'Conversation', path: '/settings/chat-starters', envelope: 'settings', fields: [
    { key: 'trace_count', label: 'Recent activity count', type: 'number', min: 0 },
    { key: 'ask_hint_enabled', label: 'Suggest the next message', type: 'boolean' },
  ] },
  105: { title: 'Network', path: '/settings/network', envelope: 'settings', fields: [
    { key: 'backend_port', label: 'Backend port', type: 'number', min: 1, max: 65535 },
    { key: 'frontend_port', label: 'Frontend port', type: 'number', min: 1, max: 65535 },
    { key: 'public_api_base', label: 'Public API URL' }, { key: 'cors_origins', label: 'Allowed origins (one per line)', type: 'lines' },
  ] },
  106: { title: 'Runtime status', path: '/system/status' },
  107: { title: 'About DeepTutor', path: '/system/update' },
  121: { title: 'Modules', path: '/modules' },
};

export function RemoteSettingsScreen({ number }: { number: number }) {
  const spec = remoteSettings[number]; const t = useCopy();
  const remote = useRemoteData(number === 88 ? `${spec.path}?year=${new Date().getFullYear()}&timezone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')}` : spec.path);
  const [draft, setDraft] = useState<Record<string, string | boolean>>({});
  const [saving, setSaving] = useState(false); const lock = useRef(false);
  const [error, setError] = useState(''); const [saved, setSaved] = useState(false);
  const source = spec.envelope && isRecord(remote.data) ? remote.data[spec.envelope] : remote.data;
  const value = (field: FieldSpec): string | boolean => {
    if (field.key in draft) return draft[field.key];
    const item = isRecord(source) ? source[field.key] : undefined;
    return field.type === 'boolean' ? item === true : Array.isArray(item) ? item.join('\n') : String(item ?? '');
  };
  const save = async () => {
    if (lock.current || !isRecord(source)) return;
    setError(''); setSaved(false);
    const payload: RecordData = {};
    for (const field of spec.fields ?? []) {
      const raw = value(field);
      if (field.type === 'number') {
        const numberValue = Number(raw);
        if (!String(raw).trim() || !Number.isSafeInteger(numberValue) || numberValue < (field.min ?? 0) || numberValue > (field.max ?? Number.MAX_SAFE_INTEGER)) { setError(`${field.label}: enter a valid number.`); return; }
        payload[field.key] = numberValue;
      } else payload[field.key] = field.type === 'lines' ? String(raw).split('\n').map(line => line.trim()).filter(Boolean) : raw;
    }
    lock.current = true; setSaving(true);
    try { await writeRemote(spec.path, 'put', payload); setDraft({}); setSaved(true); remote.refresh(); }
    catch (cause) { setError(conversationError(cause)); }
    finally { lock.current = false; setSaving(false); }
  };
  return <MobilePage title={t(spec.title)}>
    {remote.loading && <LoadingState />}
    {!!(error || remote.error) && <InlineAlert tone="danger">{t(error || remote.error)}</InlineAlert>}
    {saved && <InlineAlert>{t('Changes saved')}</InlineAlert>}
    {!remote.loading && source != null && (spec.fields ? spec.fields.map(field => <View key={field.key}>{field.type === 'boolean'
      ? <Toggle label={t(field.label)} value={value(field) === true} disabled={saving} onChange={next => { setSaved(false); setDraft(old => ({ ...old, [field.key]: next })); }} />
      : <MobileField label={t(field.label)} editable={!saving} value={String(value(field))} multiline={field.type === 'lines'} keyboardType={field.type === 'number' ? 'number-pad' : 'default'} onChangeText={next => { setSaved(false); setDraft(old => ({ ...old, [field.key]: next })); }} />}</View>) : <DataDetails value={remote.data} />)}
    {spec.fields && <MobileAction disabled={remote.loading || !isRecord(source) || !Object.keys(draft).length} loading={saving} onPress={() => void save()}>{t('Save changes')}</MobileAction>}
    <MobileAction variant="secondary" disabled={saving} onPress={() => { setDraft({}); setSaved(false); remote.refresh(); }}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
