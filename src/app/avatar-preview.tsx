import { AppShell } from '@/features/shell/AppShell';
import { AvatarGallery } from '@/features/foundation/AvatarGallery';

export default function AvatarPreview() {
  return <AppShell>{__DEV__ ? <AvatarGallery /> : null}</AppShell>;
}
