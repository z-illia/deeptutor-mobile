import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { writeRemote } from './api';
import { MobileAction, MobileField, MobileText } from '@/features/mobile/ScreenLayout';
import { Toggle } from '@/shared/ui/Controls';
import { InlineAlert } from '@/shared/ui/Feedback';
import { conversationError } from '@/features/chat/live/repository';
import { useCopy } from '@/features/entry/copy';
import { humanize, isRecord, type RecordData } from './RemoteSettingsScreen';

function NumericField({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (next: number) => void }) {
  const [text, setText] = useState(String(value));
  return <MobileField label={label} editable={!disabled} keyboardType="decimal-pad" value={text} onChangeText={raw => { setText(raw); onChange(raw.trim() ? Number(raw) : NaN); }} />;
}

export function validateNumbers(value: unknown): void {
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Enter a valid number.');
  if (value && typeof value === 'object') Object.values(value).forEach(validateNumbers);
}

export function ObjectFields({ value, onChange, disabled = false, prefix = '' }: { value: RecordData; onChange: (value: RecordData) => void; disabled?: boolean; prefix?: string }) {
  const t = useCopy();
  return <View style={{ gap: 16 }}>{Object.entries(value).map(([key, item]) => {
    const label = t(humanize(key));
    const change = (next: unknown) => onChange({ ...value, [key]: next });
    if (item == null || Array.isArray(item) || /password|secret|api.key|access.token|refresh.token|authorization|cookie/i.test(key)) return null;
    if (isRecord(item)) return <View key={key} style={{ gap: 12 }}><MobileText style={{ fontWeight: '600' }}>{label}</MobileText><ObjectFields value={item} onChange={change} disabled={disabled} prefix={`${prefix}${key}.`} /></View>;
    if (typeof item === 'boolean') return <Toggle key={key} label={label} value={item} disabled={disabled} onChange={change} />;
    if (typeof item === 'number') return <NumericField key={key} label={label} disabled={disabled} value={item} onChange={change} />;
    return <MobileField key={key} label={label} editable={!disabled} value={String(item)} multiline={/content|description|instructions/.test(key)} onChangeText={change} />;
  })}</View>;
}

export function ServerForm({ initial, path, method = 'put', transform = value => value, onSaved, children, submitLabel = 'Save changes' }: {
  initial: RecordData; path: string; method?: 'put' | 'post' | 'patch'; transform?: (value: RecordData) => unknown;
  onSaved?: (data: unknown) => void; children?: (value: RecordData, setValue: (next: RecordData) => void) => React.ReactNode; submitLabel?: string;
}) {
  const [value, setValue] = useState(initial); const [busy, setBusy] = useState(false); const lock = useRef(false);
  const active = useRef(true); const request = useRef<AbortController | null>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; request.current?.abort(); }; }, []);
  const [error, setError] = useState(''); const [saved, setSaved] = useState(false); const t = useCopy();
  const change = (next: RecordData) => { setValue(next); setSaved(false); };
  const save = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setSaved(false);
    try {
      validateNumbers(value); const payload = transform(value); const controller = new AbortController(); request.current = controller;
      const data = await writeRemote(path, method, payload, controller.signal);
      if (active.current) { setSaved(true); onSaved?.(data); }
    }
    catch (cause) { if (active.current) setError(conversationError(cause)); }
    finally { lock.current = false; if (active.current) setBusy(false); }
  };
  return <View style={{ gap: 16 }}>
    {children ? children(value, change) : <ObjectFields value={value} onChange={change} disabled={busy} />}
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {saved && <InlineAlert>{t('Changes saved')}</InlineAlert>}
    <MobileAction loading={busy} disabled={saved} onPress={() => void save()}>{t(submitLabel)}</MobileAction>
  </View>;
}
