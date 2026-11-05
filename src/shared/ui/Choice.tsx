import { useState } from 'react';
import { Check } from 'lucide-react-native';
import { useDesign } from '../design/DesignProvider';
import { Button, Field } from './Controls';
import { Dialog } from './Dialog';
// PROPOSED: native choice sheet replaces source HTML selects, keeping their options.
export function Choice<T extends string>({ label, value, options, onChange, disabled = false }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { colors, t } = useDesign();
  return <><Button variant="secondary" disabled={disabled} accessibilityLabel={label} onPress={() => { setQuery(''); setOpen(true); }}>{options.find((item) => item.value === value)?.label || value}</Button>
    <Dialog placement="bottom" open={open} title={label} onClose={() => setOpen(false)}>
      {options.length > 10 && <Field label={t('Search')} value={query} onChangeText={setQuery} autoFocus />}
      {options.filter((item) => item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map((item) => <Button key={item.value} variant="ghost" accessibilityState={{ selected: value === item.value }} icon={value === item.value ? <Check size={16} color={colors.foreground} /> : undefined} onPress={() => { onChange(item.value); setOpen(false); }}>{item.label}</Button>)}
    </Dialog></>;
}
