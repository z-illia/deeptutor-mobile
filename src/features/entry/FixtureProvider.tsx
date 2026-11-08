import { createContext, useContext, useRef, useState, type PropsWithChildren } from 'react';
import { useDesign } from '@/shared/design/DesignProvider';
import { defaultPreferences, principalFor, settingsTransition, type EntryMode, type Preferences, type ResourceState, type SettingsState, type WorkspaceId } from './model';

function useFixtureState() {
  const design = useDesign();
  const [mode, setMode] = useState<EntryMode>('disabled');
  const [profile, setProfile] = useState(principalFor('disabled'));
  const [workspace, setWorkspace] = useState<WorkspaceId>('');
  const [resourceState, setResourceState] = useState<ResourceState>('ready');
  const [settingsState, setSettingsState] = useState<ResourceState>('ready');
  const [whisper, setWhisper] = useState(false);
  const [failOperation, setFailOperation] = useState(false);
  const [storedSettings, setSettings] = useState<SettingsState>({ active: { ...defaultPreferences, theme: design.theme, language: design.language, layout: design.layout }, staged: { ...defaultPreferences, theme: design.theme, language: design.language, layout: design.layout }, saved: null, phase: 'clean' });
  const [busy, setBusy] = useState<string | null>(null);
  const [password, setPassword] = useState('fixture-password');
  const [registered, setRegistered] = useState<{ username: string; password: string; first: boolean } | null>(null);
  const syncSettings = (old: SettingsState): SettingsState => {
    const active = { ...old.active, theme: design.theme, language: design.language, layout: design.layout };
    return { ...old, active, staged: old.phase === 'clean' || old.phase === 'applied' ? active : old.staged };
  };
  const settings = syncSettings(storedSettings);
  const lock = useRef(false);
  const generation = useRef(0);
  const resetMode = (next: EntryMode) => {
    generation.current++; lock.current = false; setBusy(null); setMode(next); setProfile(principalFor(next)); setWorkspace(''); setPassword('fixture-password'); setRegistered(null);
    setSettings({ active: { ...defaultPreferences, theme: design.theme, language: design.language, layout: design.layout }, staged: { ...defaultPreferences, theme: design.theme, language: design.language, layout: design.layout }, saved: null, phase: 'clean' });
  };
  const run = async (name: string, commit: () => void, forceFailure = false) => {
    if (lock.current) return false;
    lock.current = true; setBusy(name); const version = generation.current;
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    if (version !== generation.current) return false;
    const ok = !failOperation && !forceFailure;
    if (ok) commit();
    lock.current = false; setBusy(null); return ok;
  };
  const edit = (patch: Partial<Preferences>) => setSettings(old => settingsTransition(syncSettings(old), { type: 'edit', patch }));
  const save = (operation: 'save' | 'apply' | 'discard') => {
    if (operation === 'discard' && !lock.current) { setSettings(old => settingsTransition(syncSettings(old), { type: 'discard' })); return Promise.resolve(true); }
    return run(operation, () => {
    setSettings(old => settingsTransition(syncSettings(old), { type: operation }));
    if (operation === 'apply') { design.setTheme(settings.staged.theme); design.setLayout(settings.staged.layout); design.setLanguage(settings.staged.language); }
  }); };
  return { mode, resetMode, profile, setProfile, workspace, setWorkspace, resourceState, setResourceState, settingsState, setSettingsState, whisper, setWhisper, failOperation, setFailOperation, settings, edit, save, busy, run, password, setPassword, registered, setRegistered, signOut: () => resetMode('signed-out') };
}
type FixtureState = ReturnType<typeof useFixtureState>;
const Context = createContext<FixtureState | null>(null);
export function FixtureProvider({ children }: PropsWithChildren) { return <Context.Provider value={useFixtureState()}>{children}</Context.Provider>; }
export function useFixtures() { const value = useContext(Context); if (!value) throw new Error('FixtureProvider is required'); return value; }
