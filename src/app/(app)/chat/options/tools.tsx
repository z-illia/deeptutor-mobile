import { LiveChatScreen } from '@/features/chat/live/LiveChatScreen';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><LiveChatScreen initialPanel="More tools" /></ScreenRoute>;
}
