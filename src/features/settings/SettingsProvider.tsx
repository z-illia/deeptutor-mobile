import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePreferencesStore } from '@/shared/preferences/store';
import { defaultPreferences, type Preferences, type SettingsState } from '@/features/entry/model';
import * as repository from './api';

function useSettingsState(owner: string, enabled: boolean) {
  const [state, setState] = useState<SettingsState>(() => {
    const device = usePreferencesStore.getState();
    const active = { ...(device.settingsOwner === owner ? device.appliedSettings ?? defaultPreferences : defaultPreferences), layout: device.layout };
    return { active, staged: active, saved: null, phase: 'clean' };
  });
  const current = useRef(state);
  const stored = useRef<repository.Draft | null>(null);
  const read = useRef<AbortController | null>(null);
  const write = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'save' | 'apply' | 'discard' | null>(null);
  const update = useCallback((next: SettingsState) => { current.current = next; setState(next); }, []);
  const publish = useCallback((preferences: Preferences) => usePreferencesStore.getState().applySettings(preferences, owner), [owner]);

  const refresh = useCallback(async () => {
    if (!enabled || write.current) return;
    read.current?.abort();
    const controller = new AbortController(); read.current = controller;
    setLoading(true); setError('');
    try {
      const [ui, draft] = await Promise.all([repository.getUi(controller.signal), repository.getDraft(controller.signal)]);
      if (controller.signal.aborted) return;
      const active = repository.preferencesFromUi(ui, usePreferencesStore.getState().layout);
      const staged = repository.restoreStaged(active, draft);
      const hasDraft = repository.hasOwnedDraft(draft);
      stored.current = draft;
      publish(active); update({ active, staged, saved: hasDraft ? staged : null, phase: hasDraft ? 'saved-draft' : 'clean' });
      setLoaded(true);
    } catch (cause) { if (!controller.signal.aborted) setError(repository.settingsError(cause)); }
    finally {
      if (read.current === controller) read.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [enabled, publish, update]);

  useEffect(() => {
    let active = true;
    if (enabled) {
      // Never carry another account's response language or display preferences
      // into requests while its replacement is being loaded.
      publish(current.current.active);
      void Promise.resolve().then(() => { if (active) return refresh(); });
    }
    return () => { active = false; read.current?.abort(); write.current?.abort(); };
  }, [enabled, publish, refresh]);

  const edit = useCallback((patch: Partial<Preferences>) => {
    if (write.current || read.current) return;
    const previous = current.current;
    const staged = { ...previous.staged, ...patch };
    const same = (a: Preferences, b: Preferences) => JSON.stringify(a) === JSON.stringify(b);
    const phase = previous.saved && same(staged, previous.saved) ? 'saved-draft' : !previous.saved && same(staged, previous.active) ? 'clean' : 'unsaved';
    update({ ...previous, staged, phase }); setError('');
  }, [update]);

  const save = useCallback(async (operation: 'save' | 'apply' | 'discard') => {
    if (!enabled || !loaded || write.current || read.current) return false;
    const controller = new AbortController(); write.current = controller;
    const snapshot = current.current;
    setBusy(operation); setError('');
    let uiCommitted = false;
    try {
      const latest = await repository.getDraft(controller.signal);
      if (controller.signal.aborted) return false;
      repository.assertDraftUnchanged(stored.current, latest);
      if (operation === 'discard') {
        const ui = await repository.getUi(controller.signal);
        const remaining = await repository.removeOwnedDraft(latest, controller.signal);
        if (controller.signal.aborted) return false;
        const active = repository.preferencesFromUi(ui, snapshot.active.layout);
        stored.current = remaining; publish(active); update({ active, staged: active, saved: null, phase: 'clean' });
      } else {
        const parked = await repository.putDraft(repository.composeDraft(latest, snapshot.active, snapshot.staged), controller.signal);
        if (controller.signal.aborted) return false;
        stored.current = parked;
        update({ ...snapshot, saved: snapshot.staged, phase: 'saved-draft' });
        if (operation === 'apply') {
          const patch = repository.uiPatch(snapshot.active, snapshot.staged);
          let applied = snapshot.active;
          if (Object.keys(patch).length) {
            const response = await repository.putUi(patch, controller.signal);
            if (controller.signal.aborted) return false;
            applied = repository.preferencesFromUi(response, snapshot.active.layout);
            // The server write has happened even if the later draft cleanup
            // fails. Reflect that truth and keep Apply available for recovery.
            uiCommitted = true; publish(applied);
            update({ active: applied, staged: { ...applied, layout: snapshot.staged.layout }, saved: snapshot.staged, phase: 'saved-draft' });
          }
          const latestDraft = await repository.getDraft(controller.signal);
          if (controller.signal.aborted) return false;
          repository.assertDraftUnchanged(parked, latestDraft);
          const remaining = await repository.removeOwnedDraft(latestDraft, controller.signal);
          if (controller.signal.aborted) return false;
          const active = { ...applied, layout: snapshot.staged.layout };
          stored.current = remaining; publish(active); update({ active, staged: active, saved: null, phase: 'applied' });
        }
      }
      return true;
    } catch (cause) {
      if (!controller.signal.aborted) setError(uiCommitted ? 'Settings applied, but the draft could not be cleared. Retry Apply.' : repository.settingsError(cause));
      return false;
    } finally {
      if (write.current === controller) write.current = null;
      if (!controller.signal.aborted) setBusy(null);
    }
  }, [enabled, loaded, publish, update]);
  return { state, edit, save, refresh, loading, loaded, busy, error };
}

const Context = createContext<ReturnType<typeof useSettingsState> | null>(null);
function SettingsSession({ children, owner, enabled }: PropsWithChildren<{ owner: string; enabled: boolean }>) {
  return <Context.Provider value={useSettingsState(owner, enabled)}>{children}</Context.Provider>;
}
export function SettingsProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const owner = repository.settingsOwner(auth.serverUrl, auth.session?.profile?.id ?? (auth.session?.status.enabled ? 'signed-out' : 'local'));
  const enabled = !auth.loading && !!auth.session && (!auth.session.status.enabled || auth.session.status.authenticated);
  return <SettingsSession key={owner} owner={owner} enabled={enabled}>{children}</SettingsSession>;
}
export function useSettings() {
  const value = useContext(Context);
  if (!value) throw new Error('SettingsProvider is required');
  return value;
}
