import { ManageWorkspacesScreen } from '@/features/workspaces/ManageWorkspacesScreen';
import { ScreenRoute } from '@/features/navigation/ScreenRoute';

export default function Screen() {
  return <ScreenRoute><ManageWorkspacesScreen details /></ScreenRoute>;
}
