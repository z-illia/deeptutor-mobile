import { AppShell } from '@/features/shell/AppShell';
import { ComponentPreview } from '@/features/foundation/ComponentPreview';

export default function DevelopmentPreview() {
  return <AppShell>{__DEV__ ? <ComponentPreview /> : null}</AppShell>;
}
