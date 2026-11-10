import { useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { MobileAction, MobileChoice, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { DataDetails, isRecord, useRemoteData, type RecordData } from './RemoteSettingsScreen';
import { ServerForm } from './ServerForm';
import { useCopy } from '@/features/entry/copy';

const services = ['llm', 'task', 'embedding', 'search', 'tts', 'stt', 'imagegen', 'videogen'];
const array = (value: unknown) => Array.isArray(value) ? value.filter(isRecord) : [];
export function ServicesScreen({ number }: { number: number }) {
  const params = useLocalSearchParams<{ service?: string; profileId?: string; connectionId?: string; modelId?: string }>(); const t = useCopy();
  const [service, setService] = useState(params.service && services.includes(params.service) ? params.service : number === 93 || number === 118 ? 'task' : number === 94 ? 'search' : number === 95 ? 'tts' : number === 96 ? 'imagegen' : 'llm');
  const remote = useRemoteData('/settings');
  const catalog = isRecord(remote.data) && isRecord(remote.data.catalog) ? remote.data.catalog : null;
  const buckets = catalog && isRecord(catalog.services) ? catalog.services : {};
  const bucket = isRecord(buckets[service]) ? buckets[service] : {};
  const profiles = array(bucket.profiles); const connections = array(catalog?.connections);
  const profile = profiles.find(row => row.id === params.profileId);
  const connection = connections.find(row => row.id === params.connectionId);
  const models = profile ? array(profile.models) : [];
  const model = models.find(row => row.id === params.modelId);
  const titles: Record<number, string> = { 89: 'Providers', 90: 'Provider connection', 91: 'Models', 92: 'Model configuration', 93: 'Task models', 94: 'Search service', 95: 'Voice & playback', 96: 'Media generation', 118: 'Task overrides' };
  const href = (screen: number, extra: string) => `/mobile/${screen}?service=${service}${extra}` as Href;
  return <MobilePage title={t(titles[number])}>
    {remote.loading && <LoadingState />}{!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {!remote.loading && !remote.error && !catalog && <InlineAlert>{t('This page is not available for your account.')}</InlineAlert>}
    {catalog && <>
      <MobileChoice label={t('Service')} value={service} options={services.map(value => ({ value, label: value.toUpperCase() }))} onChange={setService} />
      {number === 90 ? <ProviderForm key={`${service}:${params.connectionId ?? params.profileId ?? 'new'}`} service={service} profile={profile} connection={connection} onSaved={remote.refresh} />
        : number === 92 ? <><ModelForm key={`${service}:${params.profileId}:${params.modelId}`} service={service} profile={profile} model={model} profiles={profiles} connections={connections} onSaved={remote.refresh} />
          {profile && (model || service === 'search') && <ServerForm initial={{}} path="/settings/apply/registry" method="post" submitLabel="Use as default" transform={() => ({ kind: 'default', service, profile_id: profile.id, ...(model ? { model_id: model.id } : {}) })} onSaved={remote.refresh} />}</>
        : <>
          {number === 89 && connections.map(row => <MobileRow key={String(row.id)} title={String(row.name ?? row.id)} onPress={() => router.push(href(90, `&connectionId=${encodeURIComponent(String(row.id))}`))} />)}
          {profiles.filter(row => number !== 89 || !row.provider_ref).map(row => <ViewProfile key={String(row.id)} row={row} service={service} providers={number === 89} navigate={router.push} />)}
          {number === 89 && <MobileAction onPress={() => router.push(href(90, ''))}>{t('Add provider')}</MobileAction>}
          {[91, 94, 95, 96].includes(number) && <MobileAction onPress={() => router.push(href(92, ''))}>{t('Add model')}</MobileAction>}
          {[93, 118].includes(number) && <TaskChoice key={service} kinds={isRecord(remote.data) ? array(remote.data.task_kinds) : []} overrides={number === 118} />}
        </>}
    </>}
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
function ViewProfile({ row, service, providers, navigate }: { row: RecordData; service: string; providers: boolean; navigate: (href: Href) => void }) {
  const t = useCopy(); const profile = encodeURIComponent(String(row.id));
  return <>
    <MobileRow title={String(row.name ?? row.id)} onPress={() => navigate(`/mobile/${providers ? 90 : 92}?service=${service}&profileId=${profile}` as Href)} />
    {!providers && array(row.models).map(model => <MobileRow key={String(model.id)} title={String(model.display_name ?? model.model ?? model.id)} onPress={() => navigate(`/mobile/92?service=${service}&profileId=${profile}&modelId=${encodeURIComponent(String(model.id))}` as Href)} />)}
    {!providers && service === 'search' && <DataDetails value={{ provider: row.binding, max_results: row.max_results }} />}
    {!providers && !array(row.models).length && service !== 'search' && <MobileText muted>{t('No models configured')}</MobileText>}
  </>;
}
function ProviderForm({ service, profile, connection, onSaved }: { service: string; profile?: RecordData; connection?: RecordData; onSaved: () => void }) {
  const t = useCopy(); const source = connection ?? profile; const [credential, setCredential] = useState('');
  const [newId] = useState(() => `mobile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  const initial = { name: String(source?.name ?? ''), provider: String(source?.provider ?? source?.binding ?? 'openai'), base_url: String(source?.base_url ?? ''), api_format: String(source?.api_format ?? 'auto') };
  return <ServerForm initial={initial} path="/settings/apply/registry" method="post" transform={value => {
    if (!String(value.name).trim()) throw new Error('Enter a name.');
    return { kind: 'provider', ref: connection || !source ? { connection_id: connection?.id ?? newId } : { service, profile_id: profile?.id }, fields: { ...value, ...(credential ? { api_key: credential } : {}) } };
  }} onSaved={() => { setCredential(''); onSaved(); }}>
    {(value, setValue) => <>
      {Object.keys(value).map(key => <MobileField key={key} label={t(({ id: 'Unique ID', name: 'Name', provider: 'Provider', base_url: 'API URL', api_format: 'API format' } as Record<string, string>)[key])} value={String(value[key])} autoCapitalize="none" onChangeText={next => setValue({ ...value, [key]: next })} />)}
      <MobileField label={t('API key')} secureTextEntry value={credential} onChangeText={setCredential} /><MobileText muted>{t('Leave empty to keep the saved key.')}</MobileText>
    </>}
  </ServerForm>;
}
function ModelForm({ service, profile, model, profiles, connections, onSaved }: { service: string; profile?: RecordData; model?: RecordData; profiles: RecordData[]; connections: RecordData[]; onSaved: () => void }) {
  const t = useCopy();
  return <ServerForm initial={{ provider: profile ? `profile:${profile.id}` : '', model: String(model?.model ?? ''), display_name: String(model?.display_name ?? '') }} path="/settings/apply/registry" method="post" transform={value => {
    const selected = String(value.provider); const isConnection = selected.startsWith('connection:');
    const id = selected.slice(selected.indexOf(':') + 1);
    if (!id || (service !== 'search' && !value.model)) throw new Error('Choose a provider and enter a model name.');
    const ref = isConnection ? { provider_ref: { connection_id: id } } : {};
    const profile_id = isConnection ? `mobile-${service}-${id}` : id;
    const model_id = model?.id ?? String(value.model);
    const fields = { id: model_id, model: value.model, display_name: value.display_name };
    return { kind: 'model', service, profile_id, model_id, ...(service === 'search' ? { config: { ...ref, display_name: value.display_name } } : { model: { ...fields, ...ref } }) };
  }} onSaved={onSaved}>
    {(value, setValue) => <><MobileChoice label={t('Provider')} value={String(value.provider)} options={[...profiles.map(row => ({ value: `profile:${row.id}`, label: String(row.name ?? row.id) })), ...connections.map(row => ({ value: `connection:${row.id}`, label: String(row.name ?? row.id) }))]} onChange={provider => setValue({ ...value, provider })} />
      {service !== 'search' && <MobileField label={t('Model name')} value={String(value.model)} autoCapitalize="none" onChangeText={next => setValue({ ...value, model: next })} />}
      <MobileField label={t('Display name')} value={String(value.display_name)} onChangeText={next => setValue({ ...value, display_name: next })} /></>}
  </ServerForm>;
}
function TaskChoice({ kinds, overrides }: { kinds: RecordData[]; overrides: boolean }) {
  const t = useCopy(); const models = useRemoteData('/settings/llm-options');
  const options = isRecord(models.data) ? array(models.data.options) : [];
  return <>{!!models.error && <InlineAlert tone="danger">{t(models.error)}</InlineAlert>}<ServerForm initial={{ task_kind: '', mode: 'inherit', selection: '' }} path="/settings/apply/registry" method="post" transform={value => {
    const selected = options.find(row => JSON.stringify([row.profile_id, row.model_id]) === value.selection);
    if (overrides && !kinds.some(row => row.id === value.task_kind)) throw new Error('Choose a task.');
    if (value.mode === 'reference' && !selected) throw new Error('Choose a model.');
    return { kind: 'task_choice', task: {
    mode: value.mode, ...(overrides ? { task_kind: value.task_kind } : {}),
    ...(value.mode === 'reference' ? { selection: { profile_id: selected?.profile_id, model_id: selected?.model_id } } : {}),
  } }; }}>
    {(value, setValue) => <>
      {overrides && <MobileChoice label={t('Task')} value={String(value.task_kind)} options={kinds.map(row => ({ value: String(row.id), label: String(row.id) }))} onChange={next => setValue({ ...value, task_kind: next })} />}
      <MobileChoice label={t('Mode')} value={String(value.mode)} options={[{ value: 'inherit', label: t('Use main model') }, { value: 'reference', label: t('Choose model') }, ...(overrides ? [{ value: 'global', label: t('Use global task model') }] : [])]} onChange={next => setValue({ ...value, mode: next })} />
      {value.mode === 'reference' && <MobileChoice label={t('Model')} value={String(value.selection)} options={options.map(row => ({ value: JSON.stringify([row.profile_id, row.model_id]), label: String(row.model_name) }))} onChange={selection => setValue({ ...value, selection })} />}
    </>}
  </ServerForm></>;
}
