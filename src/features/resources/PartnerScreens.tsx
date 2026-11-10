import { router, useLocalSearchParams, type Href } from 'expo-router';
import { MobileAction, MobileChoice, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { Toggle } from '@/shared/ui/Controls';
import { InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import { DataDetails, isRecord, useRemoteData } from '@/features/settings/RemoteSettingsScreen';
import { ServerForm } from '@/features/settings/ServerForm';
import { useCopy } from '@/features/entry/copy';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';

export function PartnersScreen() {
  const remote = useRemoteData('/partners'); const t = useCopy();
  const rows = Array.isArray(remote.data) ? remote.data.filter(isRecord) : [];
  return <MobilePage title={t('Partners')}>
    {remote.loading && <LoadingState />}{!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {rows.map(row => <MobileRow key={String(row.partner_id)} title={String(row.name)} description={String(row.description ?? '')} onPress={() => router.push(`/mobile/67?partnerId=${encodeURIComponent(String(row.partner_id))}` as Href)} />)}
    <MobileAction onPress={() => router.push('/mobile/67')}>{t('Create partner')}</MobileAction>
    <MobileAction variant="secondary" onPress={() => router.push('/mobile/72')}>{t('Partner group')}</MobileAction>
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
export function PartnerScreen({ number }: { number: number }) {
  const { partnerId } = useLocalSearchParams<{ partnerId?: string }>(); const t = useCopy(); const scope = useWorkspaces();
  const base = partnerId ? `/partners/${encodeURIComponent(partnerId)}` : '/partners';
  const path = base + (partnerId && number === 68 ? '/soul' : partnerId && number === 70 ? '/assets' : '');
  const remote = useRemoteData(path);
  const title = ({ 67: 'Partner identity', 68: 'Partner personality', 69: 'Partner model & tools', 70: 'Partner library', 71: 'Review partner' } as Record<number, string>)[number];
  return <MobilePage title={t(title)}>
    {remote.loading && <LoadingState />}{!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {!partnerId && <ServerForm initial={{ name: '', description: '', emoji: '', language: 'en' }} path="/partners" method="post" transform={value => {
      if (!String(value.name).trim()) throw new Error('Enter a partner name.');
      return { ...value, workspace_id: scope.selectedWorkspaceId, start: false };
    }} onSaved={data => { if (isRecord(data) && typeof data.partner_id === 'string') router.replace(`/mobile/67?partnerId=${encodeURIComponent(data.partner_id)}` as Href); else router.replace('/mobile/66'); }} />}
    {partnerId && isRecord(remote.data) && <>
      {number === 67 && remote.data.can_manage !== false && <ServerForm key={partnerId} initial={Object.fromEntries(['name', 'description', 'emoji', 'language'].map(key => [key, String(remote.data && isRecord(remote.data) ? remote.data[key] ?? '' : '')]))} path={base} method="patch" />}
      {number === 68 && <ServerForm key={partnerId} initial={{ content: String(remote.data.content ?? '') }} path={path} />}
      {number === 69 && remote.data.can_manage !== false && <PartnerModelForm path={base} config={remote.data} />}
      {[70, 71].includes(number) && <DataDetails value={remote.data} />}
      {number === 70 && <ServerForm initial={{ skills: '', knowledge_bases: '', notebooks: '' }} path={`${base}/assets`} method="post" transform={value => Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item).split(',').map(name => name.trim()).filter(Boolean)]))} onSaved={remote.refresh} />}
      {[67, 68, 69, 70, 71].filter(item => item !== number).map(item => <MobileRow key={item} title={t(({ 67: 'Identity', 68: 'Personality', 69: 'Model & tools', 70: 'Library', 71: 'Review partner' } as Record<number, string>)[item])} onPress={() => router.push(`/mobile/${item}?partnerId=${encodeURIComponent(partnerId)}` as Href)} />)}
    </>}
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}
export function PartnerGroupsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  return groupId ? <PartnerGroupDetails key={groupId} groupId={groupId} /> : <PartnerGroupsList />;
}

function PartnerGroupDetails({ groupId }: { groupId: string }) {
  const remote = useRemoteData(`/partner-groups/${encodeURIComponent(groupId)}`);
  const t = useCopy();
  const group = isRecord(remote.data) ? remote.data : null;
  return <MobilePage title={group && typeof group.name === 'string' ? group.name : t('Partner group')}>
    {remote.loading && <LoadingState />}
    {!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    {!remote.loading && !remote.error && group && <DataDetails value={group} />}
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}

function PartnerGroupsList() {
  const remote = useRemoteData('/partner-groups'); const partners = useRemoteData('/partners'); const t = useCopy();
  const members = Array.isArray(partners.data) ? partners.data.filter(isRecord) : [];
  return <MobilePage title={t('Partner group')}>
    {remote.loading && <LoadingState />}{!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    <DataDetails value={remote.data} />
    {!!partners.error && <InlineAlert tone="danger">{t(partners.error)}</InlineAlert>}
    <ServerForm initial={{ name: '', description: '', member_ids: [] }} path="/partner-groups" method="post" transform={value => {
      if (!String(value.name).trim() || !Array.isArray(value.member_ids) || value.member_ids.length < 2) throw new Error('Choose at least two partners and enter a group name.');
      return value;
    }} onSaved={remote.refresh}>
      {(value, setValue) => <><MobileField label={t('Name')} value={String(value.name)} onChangeText={name => setValue({ ...value, name })} /><MobileField label={t('Description')} value={String(value.description)} onChangeText={description => setValue({ ...value, description })} />
        {members.map(row => <Toggle key={String(row.partner_id)} label={String(row.name)} value={Array.isArray(value.member_ids) && value.member_ids.includes(row.partner_id)} onChange={checked => setValue({ ...value, member_ids: checked ? [...(Array.isArray(value.member_ids) ? value.member_ids : []), row.partner_id] : (Array.isArray(value.member_ids) ? value.member_ids : []).filter(id => id !== row.partner_id) })} />)}</>}
    </ServerForm>
    <MobileAction variant="secondary" onPress={remote.refresh}>{t('Reload')}</MobileAction>
  </MobilePage>;
}

function PartnerModelForm({ path, config }: { path: string; config: Record<string, unknown> }) {
  const selection = config.llm_selection;
  const remote = useRemoteData('/settings/llm-options'); const tools = useRemoteData('/tools'); const t = useCopy();
  const options = isRecord(remote.data) && Array.isArray(remote.data.options) ? remote.data.options.filter(isRecord) : [];
  const availableTools = isRecord(tools.data) && Array.isArray(tools.data.tools) ? tools.data.tools.filter(isRecord) : [];
  return <>
    {remote.loading && <LoadingState />}{!!remote.error && <InlineAlert tone="danger">{t(remote.error)}</InlineAlert>}
    <ServerForm initial={{ model: isRecord(selection) ? JSON.stringify([selection.profile_id, selection.model_id]) : '' }} path={path} method="patch" transform={value => {
      const model = options.find(item => JSON.stringify([item.profile_id, item.model_id]) === value.model);
      if (!model) throw new Error('Choose a model.');
      return { llm_selection: { profile_id: model.profile_id, model_id: model.model_id } };
    }}>
      {(value, setValue) => <MobileChoice label={t('Model')} value={String(value.model)} options={options.map(row => ({ value: JSON.stringify([row.profile_id, row.model_id]), label: String(row.model_name) }))} onChange={model => setValue({ model })} />}
    </ServerForm>
    <MobileText style={{ fontWeight: '600' }}>{t('Available tools')}</MobileText>
    {!!tools.error && <InlineAlert tone="danger">{t(tools.error)}</InlineAlert>}
    {!tools.loading && !tools.error && <ServerForm initial={{ builtin_tools: Array.isArray(config.builtin_tools) ? config.builtin_tools : availableTools.map(row => row.name) }} path={path} method="patch">
      {(value, setValue) => <>{availableTools.map(row => <Toggle key={String(row.name)} label={String(row.name)} value={Array.isArray(value.builtin_tools) && value.builtin_tools.includes(row.name)} onChange={checked => setValue({ builtin_tools: checked ? [...(Array.isArray(value.builtin_tools) ? value.builtin_tools : []), row.name] : (Array.isArray(value.builtin_tools) ? value.builtin_tools : []).filter(name => name !== row.name) })} />)}</>}
    </ServerForm>}
  </>;
}
