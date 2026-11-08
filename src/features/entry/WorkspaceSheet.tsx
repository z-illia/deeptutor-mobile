import type { Href } from 'expo-router';
import { useState } from 'react';
import { router, usePathname } from 'expo-router';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { Dialog } from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { InlineAlert } from '@/shared/ui/Feedback';
import { useFixtures } from './FixtureProvider';
import { switchDestination, workspaces } from './model';
import { useCopy } from './copy';
export function WorkspaceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const f = useFixtures(); const t = useCopy(); const { colors } = useDesign(); const path = usePathname(); const [error, setError] = useState('');
  const go = (href: string) => { onClose(); router.push(href as Href); };
  return <Dialog placement="bottom" open={open} title={t('Workspace')} busy={!!f.busy} onClose={() => { setError(''); onClose(); }}>
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {workspaces.map((row) => <Button key={row.id} variant="ghost" accessibilityState={{ selected: f.workspace === row.id }} disabled={!!f.busy} loading={f.busy === `workspace:${row.id}`} icon={f.workspace === row.id ? <Check size={16} color={colors.foreground} /> : undefined} onPress={() => {
      if (row.id === f.workspace) { onClose(); return; }
      void f.run(`workspace:${row.id}`, () => { f.setWorkspace(row.id); setError(''); onClose(); router.replace(switchDestination(path) as Href); }).then((ok) => { if (!ok) setError(t('Could not save the draft. Free browser storage before switching workspaces.')); });
    }}>{t(row.name)}</Button>)}
    <Button variant="ghost" onPress={() => go('/settings/workspace')}>{t('Manage workspaces')}</Button>
    <View style={{ height: 1, backgroundColor: colors.border }} />
    <Button variant="ghost" onPress={() => go('/settings/general')}>{t('Settings')}</Button>
    {f.profile && <><DText role="small" muted>{f.profile.username}</DText><Button variant="ghost" onPress={() => go('/profile')}>{t('My profile')}</Button>{f.profile.role === 'admin' && <Button variant="ghost" onPress={() => go('/admin/users')}>{t('Admin')}</Button>}<Button variant="ghost" onPress={() => go('/session-handoff')}>{t('Public device sign-in')}</Button><Button variant="ghost" onPress={() => { f.signOut(); onClose(); router.replace('/login'); }}>{t('Sign out')}</Button></>}
  </Dialog>;
}
