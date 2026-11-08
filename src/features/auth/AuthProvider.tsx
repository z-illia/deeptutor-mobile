import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { isAxiosError } from 'axios';
import { defaultServerUrl, normalizeServerUrl, readServerUrl, saveServerUrl } from '@/api/server';
import { api } from '@/api/client';
import type { Profile } from '@/features/entry/model';

type Status = { enabled: boolean; authenticated: boolean; preset?: string };
type User = { id: string; username: string; role: Profile['role']; avatar: string; created_at: string; must_change_password: boolean };
type Session = { status: Status; profile: Profile | null; firstUser: boolean };

export function authError(error: unknown): string {
  if (!isAxiosError(error) || !error.response) return 'Unable to reach the server. Please try again.';
  const detail = error.response.data?.detail;
  return typeof detail === 'string' ? detail : 'Authentication failed. Please try again.';
}

function useSession() {
  const [serverUrl, setServerUrl] = useState(defaultServerUrl);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const { data: status } = await api.get<Status>('/auth/status');
    let profile: Profile | null = null;
    let firstUser = false;
    if (status.enabled && status.authenticated) {
      const { data: user } = await api.get<User>('/auth/profile');
      profile = { id: user.id, username: user.username, role: user.role, avatar: user.avatar, joined: user.created_at, mustChange: user.must_change_password };
    } else if (status.enabled) {
      const { data } = await api.get<{ is_first_user: boolean }>('/auth/is_first_user');
      firstUser = data.is_first_user;
    }
    const next = { status, profile, firstUser };
    return next;
  }, []);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { setSession(await load()); } catch (cause) { setSession(null); setError(authError(cause)); }
    finally { setLoading(false); }
  }, [load]);
  useEffect(() => {
    let active = true;
    const initialize = async () => {
      const stored = await readServerUrl();
      if (!stored) throw new Error('Enter the API server URL.');
      const url = normalizeServerUrl(stored);
      api.defaults.baseURL = `${url}/api`;
      if (active) setServerUrl(url);
      return load();
    };
    void initialize().then(next => { if (active) setSession(next); }).catch(cause => { if (active) setError(authError(cause)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);
  useEffect(() => {
    const interceptor = api.interceptors.response.use(response => response, cause => {
      if (isAxiosError(cause) && cause.response?.status === 401 && !/\/auth\/(login|register)$/.test(cause.config?.url ?? '')) {
        setSession({ status: { enabled: true, authenticated: false }, profile: null, firstUser: false });
      }
      return Promise.reject(cause);
    });
    return () => api.interceptors.response.eject(interceptor);
  }, []);
  const authenticate = async (username: string, password: string, register: boolean, server: string) => {
    if (lock.current) return false;
    lock.current = true; setBusy(true);
    try {
      const url = normalizeServerUrl(server);
      setError('');
      api.defaults.baseURL = `${url}/api`;
      setServerUrl(url);
      await saveServerUrl(url);
      const target = await load();
      if (!target.status.enabled || target.status.authenticated) { setSession(target); return true; }
      if (target.firstUser !== register) { setSession(target); return false; }
      await api.post(register ? '/auth/register' : '/auth/login', { username: username.trim(), password });
      if (register) await api.post('/auth/login', { username: username.trim(), password });
      const next = await load();
      if (next.status.enabled && !next.status.authenticated) throw new Error('Session cookie was not accepted');
      setSession(next);
      return true;
    } finally { lock.current = false; setBusy(false); }
  };
  const signOut = async () => {
    await api.post('/auth/logout');
    setSession({ status: { enabled: true, authenticated: false }, profile: null, firstUser: false });
    await refresh();
  };
  return { serverUrl, session, loading, error, busy, refresh, authenticate, signOut };
}
const Context = createContext<ReturnType<typeof useSession> | null>(null);
export function AuthProvider({ children }: PropsWithChildren) { return <Context.Provider value={useSession()}>{children}</Context.Provider>; }
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('AuthProvider is required'); return value; }
