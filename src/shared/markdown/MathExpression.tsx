import { memo, useEffect, useState } from 'react';
import { ScrollView, Text, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDesign } from '@/shared/design/DesignProvider';
import { mono } from './CodeBlock';
import type { typesetMath } from './math';

export const MathExpression = memo(function MathExpression({ source, display = false }: { source: string; display?: boolean }) {
  const { colors } = useDesign();
  const { fontScale } = useWindowDimensions();
  const [result, setResult] = useState<ReturnType<typeof typesetMath>>();
  useEffect(() => {
    let active = true;
    setResult(undefined);
    void import('./math').then(module => {
      const equation = module.typesetMath(source, display);
      if (active) setResult(equation);
    }).catch(() => { /* Preserve readable source for incomplete or invalid equations. */ });
    return () => { active = false; };
  }, [source, display]);
  const content = result ? <SvgXml xml={result.xml} color={colors.foreground} width={result.width * fontScale} height={result.height * fontScale} accessibilityLabel={source} /> : <Text selectable style={{ color: colors.foreground, fontFamily: mono, fontSize: 14 }}>{source}</Text>;
  return display ? <ScrollView horizontal nestedScrollEnabled style={{ maxWidth: '100%', marginVertical: 12 }} contentContainerStyle={{ paddingVertical: 4 }}>{content}</ScrollView> : content;
});
