// S01: local presentation data only. No endpoints, credentials, or server contracts.
export type ShelfId = 'home' | 'learning' | 'resources' | 'partners' | 'personalization';
export type ShellState = 'ready' | 'loading' | 'empty' | 'error';
export type NavigationItem = { key: string; label: string; shelf: ShelfId; route: string };
export const shelves: readonly { id: ShelfId; label: string; account?: boolean }[] = [
  { id: 'home', label: 'navigation.home' }, { id: 'learning', label: 'navigation.learning' },
  { id: 'resources', label: 'navigation.resources' }, { id: 'partners', label: 'navigation.partners', account: true },
  { id: 'personalization', label: 'navigation.personalization', account: true },
];
const entries: readonly [ShelfId, string, string][] = [
  ['home', 'Chat', '/chat'], ['home', 'Calendar', '/calendar'], ['home', 'Task Board', '/kanban'], ['home', 'Co-Writer', '/co-writer'],
  ['learning', 'navigation.createLearning', '/learning/new'], ['learning', 'navigation.allLearning', '/learning'], ['learning', 'Books', '/learning/books'], ['learning', 'Mastery Path', '/learning/mastery'], ['learning', 'Practice', '/learning/practice'], ['learning', 'Immersive Reading', '/learning/reading'],
  ['resources', 'navigation.allResources', '/mobile/26'], ['resources', 'Chat History', '/mobile/27'], ['resources', 'Favorites', '/mobile/31'], ['resources', 'Learning journal', '/space/journal'], ['resources', 'Question Bank', '/space/questions'], ['resources', 'Knowledge Center', '/knowledge-bases'],
  ['partners', 'navigation.partners', '/partners'],
  ['personalization', 'navigation.allPersonalization', '/mobile/65'], ['personalization', 'My Agents', '/agents'], ['personalization', 'Personas', '/space/personas'], ['personalization', 'Skills', '/space/skills'], ['personalization', 'MCP Services', '/space/mcp'], ['personalization', 'CLI Apps', '/space/cli-apps'], ['personalization', 'Memory', '/memory'],
];
export const shellRepository = {
  items: entries.map(([shelf, label, route]): NavigationItem => ({ key: route, shelf, label, route })),
  read(shelf: ShelfId, state: ShellState): readonly NavigationItem[] {
    return state === 'ready' ? this.items.filter((item) => item.shelf === shelf) : [];
  },
};
export function sidebarWidth(preferred: number, viewport: number) {
  return Math.max(220, Math.min(480, Math.floor(viewport * 0.45), preferred));
}
