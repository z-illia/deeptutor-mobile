import type { ComponentProps } from 'react';
import { DText as SharedText } from '@/shared/ui/Text';
import { ListRow as SharedRow } from '@/shared/ui/ListRow';

export function DText({ style, ...props }: ComponentProps<typeof SharedText>) {
  return <SharedText {...props} style={[{ fontFamily: 'Inter', fontSize: props.muted ? 14 : 16, lineHeight: props.muted ? 20 : 23, fontWeight: props.role === 'label' ? '600' : '400' }, style]} />;
}
export function ListRow(props: ComponentProps<typeof SharedRow>) {
  return <SharedRow {...props} titleStyle={[{ fontFamily: 'Inter', fontSize: 16, lineHeight: 23 }, props.titleStyle]} descriptionStyle={[{ fontFamily: 'Inter', fontSize: 14, lineHeight: 20 }, props.descriptionStyle]} />;
}
