const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers/rich-markdown.cjs');
const load = createLoader();
const { parseMarkdown } = load('src/shared/markdown/parser.ts');
const { typesetMath } = load('src/shared/markdown/math.ts');
const health = String.raw`\text{health-check latency}
=
\text{waiting to run}
+
\text{handler execution}
+
\text{response/network time}`;
const all = (node, type) => [...(node.type === type ? [node] : []), ...(node.children ?? []).flatMap(child => all(child, type))];
const values = (source, type) => all(parseMarkdown(source), type).map(node => node.value);

test('inline and display dollar math coexist with Markdown, headings, links, lists and quotes', () => {
  const source = '# Math\n\nUse $\\frac{1}{2}$ and **bold** [docs](https://example.com).\n\n- $\\sqrt{n}$\n\n> $x^2$\n\n$$\n\\sum_{i=0}^n i\n$$';
  const ast = parseMarkdown(source);
  assert.deepEqual(all(ast, 'inlineMath').map(n => n.value), [String.raw`\frac{1}{2}`, String.raw`\sqrt{n}`, 'x^2']);
  assert.equal(all(ast, 'math')[0].value, String.raw`\sum_{i=0}^n i`);
  for (const type of ['heading', 'strong', 'link', 'list', 'blockquote']) assert.equal(all(ast, type).length, 1);
});
test('backslash delimiters render inline and multiline display equations in nested Markdown', () => {
  assert.deepEqual(values(String.raw`Before \(\frac{1}{2}\) after`, 'inlineMath'), [String.raw`\frac{1}{2}`]);
  assert.deepEqual(values(String.raw`Before \[x=2\] after`, 'math'), ['x=2']);
  assert.deepEqual(values('> \\[\n> \\sqrt{x}\n> \\]', 'math'), ['\n\\sqrt{x}\n']);
  assert.deepEqual(values('- \\[\n  x=2\n  \\]', 'math'), ['\nx=2\n']);
  assert.equal(all(parseMarkdown(String.raw`\\(literal\\)`), 'inlineMath').length, 0);
});
test('bare health-check expression is one preserved math node rather than a setext heading', () => {
  const ast = parseMarkdown(health);
  assert.equal(ast.children.length, 1);
  assert.equal(ast.children[0].type, 'math');
  assert.equal(ast.children[0].value, health);
  assert.equal(all(ast, 'heading').length, 0);
  const svg = typesetMath(ast.children[0].value, true);
  assert.doesNotMatch(svg.xml, /data-(?:mml-node|c)=/);
  assert.match(svg.xml, /<path/);
  assert.doesNotMatch(svg.xml, /merror|\\text\{/);
  assert.ok(svg.width > 300, 'long equation retains a scrollable natural width');
});
test('AMS, common symbols, multiline aligned equations and Cyrillic text typeset without errors', () => {
  for (const source of [String.raw`\begin{aligned}a &= \frac{1}{2} \\ b &= \sqrt{n}\end{aligned}`, String.raw`\sum_{i=0}^{n} i + \alpha \leq \infty`, String.raw`\text{Час відповіді} = \text{очікування} + \frac{1}{2}`]) {
    const result = typesetMath(source, true);
    assert.ok(result.width > 0 && result.height > 0);
    assert.doesNotMatch(result.xml, /data-mml-node="merror"/);
  }
});
test('stream prefixes parse without errors or losing following content', () => {
  const source = `Before\n\n\\[\n${health}\n\\]\n\nAfter\n\n$$\n\\frac{1}{2}\n$$`;
  for (let i = 0; i <= source.length; i++) assert.doesNotThrow(() => parseMarkdown(source.slice(0, i)));
  assert.equal(all(parseMarkdown('$$\n\\frac{1}{'), 'math')[0].data.pendingMath, true);
  assert.equal(all(parseMarkdown('$$\nx\n$$'), 'math')[0].data.pendingMath, false);
  const incomplete = parseMarkdown('\\[\nx\n\n## Still here\n\nAfter');
  assert.equal(all(incomplete, 'heading')[0].children[0].value, 'Still here');
  assert.ok(all(incomplete, 'text').some(n => n.value === 'After'));
});
test('invalid and excessive TeX fail safely rather than generating a visible MathJax error', () => {
  assert.throws(() => typesetMath(String.raw`\unknownCommand{a}`, true));
  assert.throws(() => typesetMath(String.raw`\frac{1}{`, true));
  assert.throws(() => typesetMath('x'.repeat(2001), true));
});
test('currency, escaped dollars and LaTeX code examples retain their original content', () => {
  const prose = 'Costs $5 and $10, or $20 and $30. Escaped \\$5.';
  assert.equal(all(parseMarkdown(prose), 'inlineMath').length, 0);
  assert.equal(all(parseMarkdown(prose), 'text').map(n => n.value).join(''), prose.replace('\\$', '$'));
  const code = '```latex\n' + health + '\n```\n\n`$x$` and `\\(x\\)`';
  const ast = parseMarkdown(code);
  assert.equal(all(ast, 'math').length + all(ast, 'inlineMath').length, 0);
  assert.equal(all(ast, 'code')[0].value, health);
  assert.deepEqual(all(ast, 'inlineCode').map(n => n.value), ['$x$', '\\(x\\)']);
});
test('native component resolves valid math to SVG, rejects stale results, and waits for closing fences', async () => {
  let state, lastDeps, dispose;
  let platform = 'android';
  const React = require('react');
  const componentLoad = createLoader({
    react: { ...React, useState: () => [state, value => { state = value; }], useEffect: (effect, deps) => {
      if (!lastDeps || deps.some((value, i) => value !== lastDeps[i])) { dispose?.(); lastDeps = deps; dispose = effect(); }
    } },
    'react-native': { Platform: { get OS() { return platform; } }, Text: 'Text', ScrollView: 'ScrollView', useWindowDimensions: () => ({ width: 320, fontScale: 1.5 }) },
    'react-native-svg': { SvgXml: 'SvgMath' },
    '@/shared/design/DesignProvider': { useDesign: () => ({ colors: { foreground: '#e8e4de' } }) },
  });
  const { MathExpression } = componentLoad('src/shared/markdown/MathExpression.tsx');
  const render = props => MathExpression.type(props);
  try {
    assert.equal(render({ source: health, display: true }).props.children.props.children, '…');
    await new Promise(resolve => setImmediate(resolve));
    const completed = render({ source: health, display: true });
    assert.equal(completed.type, 'ScrollView');
    assert.equal(completed.props.children.type, 'SvgMath');
    assert.ok(completed.props.children.props.width > 320);
    assert.equal(completed.props.children.props.accessibilityLabel, health);
    assert.equal(completed.props.children.props.accessible, true);
    platform = 'web';
    const webSvg = render({ source: health, display: true }).props.children;
    assert.equal(webSvg.props.accessible, undefined);
    assert.equal(webSvg.props.accessibilityRole, 'image');
    assert.equal(webSvg.props.accessibilityLabel, health);
    platform = 'android';
    completed.props.children.props.onError();
    assert.equal(render({ source: health, display: true }).props.children.props.children, health);
    assert.equal(render({ source: 'x', display: false }).props.children, '…');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(render({ source: 'x', display: false }).type, 'SvgMath');
    assert.equal(render({ source: String.raw`\frac{1}{`, display: true, pending: true }).props.children.props.children, '…');
    assert.equal(render({ source: String.raw`\badCommand{x}` }).props.children, '…');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(render({ source: String.raw`\badCommand{x}` }).props.children, String.raw`\badCommand{x}`);
  } finally { dispose?.(); }
});
