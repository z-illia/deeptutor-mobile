import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { changePassword, profileError, removeAvatar, setAvatarMarker, uploadAvatar } from './repository';
import { pickAvatar } from './pick-avatar';

export function useProfileActions() {
  const auth = useAuth();
  const profile = auth.session?.profile;
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const pending = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; pending.current?.abort(); };
  }, [auth.serverUrl, profile?.id]);

  const run = async (name: string, action: (signal: AbortSignal) => Promise<void>, fallback: string) => {
    if (pending.current || !profile) return false;
    const controller = new AbortController();
    pending.current = controller; setBusy(name); setError(''); setNotice('');
    try {
      await action(controller.signal);
      return mounted.current && !controller.signal.aborted;
    } catch (cause) {
      if (mounted.current && !controller.signal.aborted) setError(profileError(cause, fallback));
      return false;
    } finally {
      if (pending.current === controller) pending.current = null;
      if (mounted.current && !controller.signal.aborted) setBusy(null);
    }
  };
  const avatar = (name: string, action: (signal: AbortSignal) => Promise<string | null>) => run(name, async signal => {
    const marker = await action(signal);
    if (marker !== null && !signal.aborted && profile) auth.patchProfile(profile.id, { avatar: marker });
  }, 'Failed to load profile');

  return {
    busy, error, notice, setError, setNotice,
    setMarker: (marker: string) => avatar('avatar', signal => setAvatarMarker(marker, signal)),
    removePhoto: () => avatar('avatar', removeAvatar),
    uploadPhoto: () => avatar('avatar', async signal => {
      const form = await pickAvatar();
      if (!form || signal.aborted) return null;
      return uploadAvatar(form, signal);
    }),
    changePassword: (current: string, next: string) => run('password', async signal => {
      if (!profile?.canChangePassword) throw new Error('Failed to change password');
      await changePassword(current, next, signal);
      if (!signal.aborted) { auth.patchProfile(profile.id, { mustChange: false }); setNotice('Password updated'); }
    }, 'Failed to change password'),
    signOut: () => run('signout', async () => { await auth.signOut(); }, 'Authentication failed. Please try again.'),
  };
}
