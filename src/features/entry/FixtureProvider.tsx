import { createContext, useContext, useRef, useState, type PropsWithChildren } from 'react';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSettings } from '@/features/settings/SettingsProvider';
import { principalFor, type EntryMode, type ResourceState } from './model';

function useFixtureState() {
  const liveSettings = useSettings();
  const auth = useAuth();
  const session = auth.session;
  const initialMode: EntryMode = !session?.status.enabled ? 'disabled' : !session.profile ? 'signed-out' : session.profile.mustChange ? 'temporary' : session.profile.role === 'admin' ? 'admin' : session.status.preset === 'learner' ? 'learner' : 'standard';
  const [mode, setMode] = useState<EntryMode>(initialMode);
  const [profile, setProfile] = useState(session?.profile ?? principalFor(initialMode));
  const { selectedWorkspaceId: workspace, selectWorkspace } = useWorkspaces();
  const setWorkspace = (id: string) => { void selectWorkspace(id); };
  const [resourceState, setResourceState] = useState<ResourceState>('ready');
  const [whisper, setWhisper] = useState(false);
  const [failOperation, setFailOperation] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [password, setPassword] = useState('fixture-password');
  const [registered, setRegistered] = useState<{ username: string; password: string; first: boolean } | null>(null);
  const lock = useRef(false);
  const generation = useRef(0);
  const resetMode = (next: EntryMode) => {
    generation.current++; lock.current = false; setBusy(null); setMode(next); setProfile(principalFor(next)); setWorkspace(''); setPassword('fixture-password'); setRegistered(null);
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
  return { mode: session?.profile ? initialMode : mode, resetMode, profile: session?.profile ?? profile, setProfile, workspace, setWorkspace, resourceState, setResourceState, whisper, setWhisper, failOperation, setFailOperation, settings: liveSettings.state, edit: liveSettings.edit, save: liveSettings.save, busy, run, password, setPassword, registered, setRegistered, signOut: () => { void auth.signOut().catch(() => { void auth.refresh(); }); } };
}
type FixtureState = ReturnType<typeof useFixtureState>;
const Context = createContext<FixtureState | null>(null);
function FixtureSession({ children }: PropsWithChildren) { return <Context.Provider value={useFixtureState()}>{children}</Context.Provider>; }
export function FixtureProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const identity = [auth.serverUrl, auth.session?.status.enabled, auth.session?.status.authenticated, auth.session?.profile?.id];
  return <FixtureSession key={JSON.stringify(identity)}>{children}</FixtureSession>;
}
export function useFixtures() { const value = useContext(Context); if (!value) throw new Error('FixtureProvider is required'); return value; }
