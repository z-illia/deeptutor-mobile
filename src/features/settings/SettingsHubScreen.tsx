import { screenPath } from '@/features/navigation/paths';
import { router, type Href } from 'expo-router';
import { MobileAction, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCopy } from '@/features/entry/copy';
import { useState } from 'react';
import { InlineAlert } from '@/shared/ui/Feedback';
import { conversationError } from '@/features/chat/live/repository';
import {
  Activity, Archive, ArrowLeftRight, Blocks, BookOpen, Bot, Brain,
  ChartNoAxesCombined, ClipboardList, Cpu, Database, FileSearch, Image,
  Info, Layers, ListTree, MessageSquare, Network, Palette, Paperclip,
  Plug, Search, Settings, ShieldCheck, SlidersHorizontal, Smartphone,
  Sparkles, UserRound, Users, Video, Volume2, Wrench, type LucideIcon,
} from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';

const sectionIcons: Record<number, LucideIcon> = {
  63: UserRound,
  62: Layers,
  65: SlidersHorizontal,
  81: Settings,
  88: ChartNoAxesCombined,
  139: Smartphone,
  141: SlidersHorizontal,
  142: Database,
  143: Cpu,
  144: BookOpen,
  145: Wrench,
  146: ShieldCheck,
  82: Settings,
  83: Palette,
  84: Layers,
  86: ArrowLeftRight,
  89: Plug,
  91: Cpu,
  93: ClipboardList,
  94: Search,
  95: Volume2,
  96: Image,
  97: Paperclip,
  98: Video,
  99: Bot,
  100: FileSearch,
  101: MessageSquare,
  102: Brain,
  103: Sparkles,
  104: Wrench,
  105: Network,
  106: Activity,
  107: Info,
  109: Users,
  118: SlidersHorizontal,
  119: ListTree,
  121: Blocks,
  122: Archive,
};

const groups: Record<number, [string, number[]]> = {
  81: ['Settings', [141, 142, 143, 144, 145, 146]],
  141: ['Preferences', [82, 83, 101]],
  142: ['Workspaces & data', [84, 86, 122]],
  143: ['Models & services', [89, 91, 93, 94, 95, 96]],
  144: ['Learning tools', [97, 98, 99, 100, 102, 103, 104]],
  145: ['Advanced', [119, 118]],
  146: ['Administration', [105, 106, 107, 109, 121]],
};
const titles: Record<number, string> = { 82: 'General', 83: 'Appearance', 84: 'Workspaces', 86: 'Data migration', 89: 'Providers', 91: 'Models', 93: 'Task models', 94: 'Search service', 95: 'Voice & playback', 96: 'Media generation', 97: 'Attachments', 98: 'Video learning', 99: 'Agents', 100: 'Document parsing', 101: 'Conversation', 102: 'Memory processing', 103: 'Capabilities', 104: 'Tools', 105: 'Network', 106: 'Runtime status', 107: 'About DeepTutor', 109: 'User management', 118: 'Task overrides', 119: 'Tool directory', 121: 'Modules', 122: 'Migration bundles' };
export function SettingsHubScreen({ number }: { number: number }) {
  const auth = useAuth(); const t = useCopy();
  const { colors } = useDesign();
  const [signingOut, setSigningOut] = useState(false); const [error, setError] = useState('');
  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true); setError('');
    try { await auth.signOut(); } catch (cause) { setError(conversationError(cause)); }
    finally { setSigningOut(false); }
  };
  const [title, routes] = groups[number] ?? ['Account', [63, 62, 65, 81, 88, 139]];
  return <MobilePage title={t(title)}>
    {number === 61 && <MobileText>{auth.session?.profile?.username ?? t('Local account')}</MobileText>}
    {routes.filter(route => route !== 146 || auth.session?.profile?.role === 'admin' || !auth.session?.status.enabled).map(route => { const Icon = sectionIcons[route]; return <MobileRow key={route} icon={Icon ? <Icon size={22} color={colors.primary} /> : undefined} title={t(titles[route] ?? groups[route]?.[0] ?? ({ 63: 'My profile', 62: 'Switch workspace', 65: 'Personalization', 88: 'Usage statistics', 139: 'Device sign-in' } as Record<number, string>)[route])} onPress={() => router.push(`${screenPath(route)}` as Href)} />; })}
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {number === 61 && <MobileAction variant="secondary" loading={signingOut} onPress={() => void signOut()}>{t('Sign out')}</MobileAction>}
  </MobilePage>;
}
