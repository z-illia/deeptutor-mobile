import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { MobileAction, MobileChoice, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { DataDetails, isRecord, useRemoteData } from '@/features/settings/RemoteSettingsScreen';
import { ServerForm } from '@/features/settings/ServerForm';
import { useCopy } from '@/features/entry/copy';

function RemoteList({ path, collection, title, edit }: { path: string; collection: string; title: string; edit: (name: string) => Href }) {
  const remote = useRemoteData(path); const t = useCopy();
  const rows = isRecord(remote.data) && Array.isArray(remote.data[collection]) ? remote.data[collection].filter(isRecord) : [];
  return <View style={{ gap: 12 }}><MobileText style={{ fontWeight: '600' }}>{t(title)}</MobileText>
    {remote.loading && <LoadingState />}{!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {rows.map(row => <MobileRow key={String(row.name)} title={String(row.name)} description={String(row.description ?? '')} onPress={() => router.push(edit(String(row.name)))} />)}
    {!remote.loading && !remote.error && !rows.length && <MobileText muted>{t('No items yet')}</MobileText>}
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </View>;
}
export function PersonasSkillsScreen() {
  const t = useCopy();
  return <MobilePage title={t('Personas & skills')}>
    <RemoteList path="/personas" collection="personas" title="Personas" edit={name => `/space/playbooks/edit?kind=persona&name=${encodeURIComponent(name)}` as Href} />
    <RemoteList path="/skills/list" collection="skills" title="Skills" edit={name => `/space/playbooks/edit?kind=skill&name=${encodeURIComponent(name)}` as Href} />
    <MobileAction onPress={() => router.push('/space/playbooks/edit')}>{t('Create a playbook')}</MobileAction>
    <MobileAction variant="secondary" onPress={() => router.push('/space/extensions')}>{t('Find extensions')}</MobileAction>
  </MobilePage>;
}
export function PlaybookScreen() {
  const { name, kind = 'skill' } = useLocalSearchParams<{ name?: string; kind?: string }>();
  const [type, setType] = useState(kind === 'persona' ? 'persona' : 'skill'); const t = useCopy();
  return <MobilePage title={t(name ? 'Edit playbook' : 'Create a playbook')}>
    {!name && <MobileChoice label={t('Type')} value={type} onChange={setType} options={[{ value: 'skill', label: t('Skill') }, { value: 'persona', label: t('Persona') }]} />}
    <PlaybookForm key={`${type}:${name ?? ''}`} name={name} kind={type} />
  </MobilePage>;
}
function PlaybookForm({ name, kind }: { name?: string; kind: string }) {
  const base = kind === 'persona' ? '/personas' : '/skills';
  const remote = useRemoteData(name ? `${base}/${encodeURIComponent(name)}` : `${base}${kind === 'persona' ? '' : '/list'}`);
  const t = useCopy();
  if (name && remote.loading) return <LoadingState />;
  if (name && remote.error) return <><InlineAlert tone="danger">{t(remote.error)}</InlineAlert><MobileAction onPress={remote.refresh}>{t('Retry')}</MobileAction></>;
  const data = name && isRecord(remote.data) ? remote.data : {};
  if (data.read_only === true) return <DataDetails value={data} />;
  return <ServerForm initial={{ ...(name ? {} : { name: '' }), description: String(data.description ?? ''), content: String(data.content ?? '') }}
    path={name ? `${base}/${encodeURIComponent(name)}` : kind === 'persona' ? base : '/skills/create'} method={name ? 'put' : 'post'}
    transform={value => { if (!name && !String(value.name).trim()) throw new Error('Enter a name.'); return value; }}
    onSaved={() => router.replace('/space/personas')} />;
}
export function ExtensionsScreen({ details = false }: { details?: boolean }) {
  const { slug } = useLocalSearchParams<{ slug?: string }>(); const [query, setQuery] = useState(''); const [search, setSearch] = useState(''); const t = useCopy();
  const remote = useRemoteData(details ? `/skills/hub/detail?slug=${encodeURIComponent(slug ?? '')}` : `/skills/hub/catalog?q=${encodeURIComponent(search)}`);
  const rows = isRecord(remote.data) && Array.isArray(remote.data.skills) ? remote.data.skills.filter(isRecord) : [];
  return <MobilePage title={t(details ? 'Extension details' : 'Find extensions')}>
    {!details && <><MobileField label={t('Search')} value={query} onChangeText={setQuery} onSubmitEditing={() => setSearch(query)} /><MobileAction onPress={() => setSearch(query)}>{t('Search')}</MobileAction></>}
    {remote.loading && <LoadingState />}{!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {!details && rows.map(row => <MobileRow key={String(row.slug)} title={String(row.name ?? row.slug)} description={String(row.description ?? '')} onPress={() => router.push(`/space/extensions/detail?slug=${encodeURIComponent(String(row.slug))}` as Href)} />)}
    {details && remote.data != null && <><DataDetails value={remote.data} /><ServerForm initial={{ ref: `eduhub:${slug}` }} path="/skills/install" method="post" onSaved={() => router.replace('/space/personas')} /></>}
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
export function McpScreen() {
  const remote = useRemoteData('/space/mcp/servers'); const t = useCopy();
  const [name, setName] = useState('');
  const servers = isRecord(remote.data) && isRecord(remote.data.servers) ? remote.data.servers : {};
  return <MobilePage title={t('Connect MCP service')}>
    {remote.loading && <LoadingState />}{!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {Object.entries(servers).map(([key, server]) => <MobileRow key={key} title={key} description={isRecord(server) ? String(server.url ?? '') : undefined} onPress={() => setName(key)} />)}
    <MobileField label={t('Name')} value={name} onChangeText={setName} />
    <McpConnection key={`${name}:${JSON.stringify(servers[name])}`} name={name} current={isRecord(servers[name]) ? servers[name] : undefined} onSaved={remote.refresh} />
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
function McpConnection({ name, current, onSaved }: { name: string; current?: Record<string, unknown>; onSaved: () => void }) {
  const t = useCopy(); const [authorization, setAuthorization] = useState('');
  return name.trim() ? <ServerForm key={name} initial={{ url: String(current?.url ?? ''), type: String(current?.type ?? 'streamableHttp') }} path={`/space/mcp/servers/${encodeURIComponent(name.trim())}`} onSaved={() => { setAuthorization(''); onSaved(); }} transform={config => {
    if (!/^https?:\/\//.test(String(config.url))) throw new Error('Enter a valid HTTP or HTTPS URL.');
    return { config: { ...current, ...config, ...(authorization ? { headers: { ...(isRecord(current?.headers) ? current.headers : {}), Authorization: authorization } } : {}) } };
  }}>
    {(value, setValue) => <><MobileField label={t('API URL')} value={String(value.url)} autoCapitalize="none" onChangeText={url => setValue({ ...value, url })} />
      <MobileChoice label={t('Transport')} value={String(value.type)} options={[{ value: 'streamableHttp', label: 'Streamable HTTP' }, { value: 'sse', label: 'SSE' }]} onChange={type => setValue({ ...value, type })} />
      <MobileField label={t('Authorization header')} secureTextEntry value={authorization} onChangeText={setAuthorization} />
      <MobileText muted>{t('Leave empty to keep the saved key.')}</MobileText></>}
  </ServerForm> : <MobileText muted>{t('Enter a name.')}</MobileText>;
}
export function SubagentsScreen() {
  const t = useCopy(); const backends = useRemoteData('/subagents/detect');
  const rows = isRecord(backends.data) && Array.isArray(backends.data.backends) ? backends.data.backends.filter(isRecord) : [];
  return <MobilePage title={t('Subagents & imports')}>
    <RemoteList path="/subagents/connections" collection="connections" title="Connected agents" edit={() => '/settings/agents'} />
    {!!backends.error && <InlineAlert tone="danger">{t(backends.error)}</InlineAlert>}
    <ServerForm initial={{ name: '', agent_kind: '', cwd: '' }} path="/subagents/connections" method="post">
      {(value, setValue) => <><MobileField label={t('Name')} value={String(value.name)} onChangeText={name => setValue({ ...value, name })} />
        <MobileChoice label={t('Agent')} value={String(value.agent_kind)} options={rows.filter(row => row.available === true).map(row => ({ value: String(row.kind), label: String(row.display_name ?? row.kind) }))} onChange={agent_kind => setValue({ ...value, agent_kind })} />
        <MobileField label={t('Working directory')} value={String(value.cwd)} onChangeText={cwd => setValue({ ...value, cwd })} /></>}
    </ServerForm>
    <MobileAction variant="secondary" onPress={() => router.push('/memory/import')}>{t('Import conversations')}</MobileAction>
  </MobilePage>;
}
