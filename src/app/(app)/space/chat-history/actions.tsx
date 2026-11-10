import { MobileConversationLibrary } from '@/features/chat/MobileConversationLibrary';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><MobileConversationLibrary actions /></ScreenRoute>;
}
