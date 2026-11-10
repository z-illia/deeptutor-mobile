import type { Href } from 'expo-router';
import { router, usePathname } from 'expo-router';
import { View } from 'react-native';
import { useDesign } from '@/shared/design/DesignProvider';
import { Dialog } from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Controls';
import { DText } from '@/shared/ui/Text';
import { useFixtures } from './FixtureProvider';
import { switchDestination } from './model';
import { WorkspaceList } from '@/features/workspaces/WorkspaceList';
import { useCopy } from './copy';
export function WorkspaceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const f = useFixtures(); const t = useCopy(); const { colors } = useDesign(); const path = usePathname();
  const go = (href: string) => { onClose(); router.push(href as Href); };
  return <Dialog placement="bottom" open={open} title={t('Workspace')} onClose={onClose}>
    <WorkspaceList open={open} onSelected={() => { onClose(); router.replace(switchDestination(path) as Href); }} />
    <Button variant="ghost" onPress={() => go('/settings/workspace')}>{t('Manage workspaces')}</Button>
    <View style={{ height: 1, backgroundColor: colors.border }} />
    <Button variant="ghost" onPress={() => go('/settings')}>{t('Settings')}</Button>
    {f.profile && <><DText role="small" muted>{f.profile.username}</DText><Button variant="ghost" onPress={() => go('/profile')}>{t('My profile')}</Button>{f.profile.role === 'admin' && <Button variant="ghost" onPress={() => go('/admin/users')}>{t('Admin')}</Button>}<Button variant="ghost" onPress={() => go('/session-handoff')}>{t('Public device sign-in')}</Button><Button variant="ghost" onPress={() => { f.signOut(); onClose(); router.replace('/login'); }}>{t('Sign out')}</Button></>}
  </Dialog>;
}
