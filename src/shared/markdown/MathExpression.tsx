import { memo, useEffect, useState } from 'react';
import { Platform, ScrollView, Text, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDesign } from '@/shared/design/DesignProvider';
import { contentFingerprint, richDiagnostic } from './diagnostics';
import type { typesetMath } from './math';

type MathResult = { source: string; display: boolean; equation?: ReturnType<typeof typesetMath>; invalid?: boolean };
export const MathExpression = memo(function MathExpression({ source, display = false, pending = false }: { source: string; display?: boolean; pending?: boolean }) {
  const { colors, preferences } = useDesign();
  const contentScale = (preferences?.scale ?? 100) / 100;
  const { fontScale, width } = useWindowDimensions();
  const [result, setResult] = useState<MathResult>();
  useEffect(() => {
    if (pending) return;
    let active = true;
    const fingerprint = contentFingerprint(source);
    richDiagnostic('math-input', { fingerprint, length: source.length, display });
    void import('./math').then(module => {
      const equation = module.typesetMath(source, display);
      if (active) { richDiagnostic('math-svg-ready', { fingerprint, width: equation.width, height: equation.height }); setResult({ source, display, equation }); }
    }).catch(error => { if (active) {
      richDiagnostic('math-render-failed', { fingerprint, errorName: error instanceof Error ? error.name : 'unknown', reason: error instanceof TypeError || error instanceof ReferenceError ? error.message : 'typesetter-rejected-expression-or-load-failed' });
      setResult({ source, display, invalid: true });
    } });
    return () => { active = false; };
  }, [source, display, pending]);
  // Never show the preceding equation after a streamed source change.
  const current = !pending && result?.source === source && result.display === display ? result : undefined;
  const equation = current?.equation;
  const scale = equation && !display ? Math.min(fontScale * contentScale, Math.max(1, width - 40) / equation.width) : fontScale * contentScale;
  const content = equation
    ? <SvgXml xml={equation.xml} color={colors.foreground} width={equation.width * scale} height={equation.height * scale} {...(Platform.OS === 'web' ? {} : { accessible: true })} accessibilityRole="image" accessibilityLabel={source} onError={() => {
      richDiagnostic('math-svg-failed', { fingerprint: contentFingerprint(source), reason: 'svg-parser-error' });
      setResult({ source, display, invalid: true });
    }} />
    : <Text selectable={!!current?.invalid} accessibilityLabel={source} style={{ color: colors.foreground, fontFamily: 'Inter', fontSize: 14 * contentScale, lineHeight: 22 * contentScale }}>{current?.invalid ? source : '…'}</Text>;
  return display
    ? <ScrollView horizontal nestedScrollEnabled style={{ maxWidth: '100%', marginVertical: 8 }} contentContainerStyle={{ paddingVertical: 4 }}>{content}</ScrollView>
    : content;
});
