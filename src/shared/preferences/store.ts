import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeChoice, LayoutChoice } from '../design/tokens';
import type messages from '@/i18n/foundation-messages.json';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LocalTask { id: string; title: string; status: string }
interface PreferencesState {
  workspace: string;
  theme: ThemeChoice;
  language: keyof typeof messages;
  layout: LayoutChoice;
  setLanguage: (language: keyof typeof messages) => void;
  setLayout: (layout: LayoutChoice) => void;
  values: Record<string, string>;
  tasks: Record<string, LocalTask[]>;
  notes: Record<string, { title: string; body: string }>;
  setWorkspace: (workspace: string) => void;
  setTheme: (theme: PreferencesState['theme']) => void;
  setValue: (key: string, value: string) => void;
  saveTask: (workspace: string, task: LocalTask) => void;
  saveNote: (key: string, title: string, body: string) => void;
}
// Device preferences are shared by every route. Keep credentials out of persisted drafts.
export const usePreferencesStore = create<PreferencesState>()(persist((set) => ({
  workspace: 'Software Development', theme: 'system', language: 'en', layout: 'modern', values: {}, tasks: {}, notes: {},
  setWorkspace: workspace => set({ workspace }),
  setTheme: theme => set({ theme }),
  setLanguage: language => set({ language }),
  setLayout: layout => set({ layout }),
  setValue: (key, value) => set(state => ({ values: { ...state.values, [key]: value } })),
  saveTask: (workspace, task) => set(state => ({ tasks: { ...state.tasks, [workspace]: [...(state.tasks[workspace] ?? []).filter(row => row.id !== task.id), task] } })),
  saveNote: (key, title, body) => set(state => ({ notes: { ...state.notes, [key]: { title, body } } })),
}), { name: 'deeptutor-mobile-local-v1', storage: createJSONStorage(() => AsyncStorage), version: 1, merge: (persisted, current) => {
  const saved = persisted as Omit<Partial<PreferencesState>, 'theme'> & { theme?: ThemeChoice | 'light' };
  return { ...current, ...saved, theme: saved?.theme === 'light' ? 'snow' : saved?.theme ?? current.theme };
} }));
