import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LocalTask { id: string; title: string; status: string }
interface MobileState {
  workspace: string;
  theme: 'system' | 'light' | 'dark';
  values: Record<string, string>;
  tasks: Record<string, LocalTask[]>;
  notes: Record<string, { title: string; body: string }>;
  setWorkspace: (workspace: string) => void;
  setTheme: (theme: MobileState['theme']) => void;
  setValue: (key: string, value: string) => void;
  saveTask: (workspace: string, task: LocalTask) => void;
  saveNote: (key: string, title: string, body: string) => void;
}
// This store contains local drafts and preview data only. Never persist credentials.
export const useMobileStore = create<MobileState>()(persist((set) => ({
  workspace: 'Software Development', theme: 'system', values: {}, tasks: {}, notes: {},
  setWorkspace: workspace => set({ workspace }),
  setTheme: theme => set({ theme }),
  setValue: (key, value) => set(state => ({ values: { ...state.values, [key]: value } })),
  saveTask: (workspace, task) => set(state => ({ tasks: { ...state.tasks, [workspace]: [...(state.tasks[workspace] ?? []).filter(row => row.id !== task.id), task] } })),
  saveNote: (key, title, body) => set(state => ({ notes: { ...state.notes, [key]: { title, body } } })),
}), { name: 'deeptutor-mobile-local-v1', storage: createJSONStorage(() => AsyncStorage), version: 1 }));
