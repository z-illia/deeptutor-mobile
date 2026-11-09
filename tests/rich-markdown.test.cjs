const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createLoader, root } = require('./helpers/rich-markdown.cjs');
const load = createLoader();
const { parseMarkdown, safeExternalUrl } = load('src/shared/markdown/parser.ts');
const { highlight } = load('src/shared/markdown/highlight.ts');
const fixture = fs.readFileSync(root + '/tests/fixtures/rich-response.md', 'utf8');
function all(node, type) { return [...(node.type === type ? [node] : []), ...(node.children ?? []).flatMap(child => all(child, type))]; }
test('CommonMark/GFM preserves headings, paragraphs, nested lists, references, math and Unicode', () => {
  const tree = parseMarkdown(fixture);
  assert.deepEqual(all(tree, 'heading').map(n => n.depth), [1, 2, 3, 4, 5, 6]);
  assert.ok(all(tree, 'paragraph').length > 10);
  assert.ok(all(tree, 'list').length >= 4);
  assert.ok(all(tree, 'inlineCode').some(n => n.value === 'value is None'));
  assert.equal(all(tree, 'table').length, 1);
  assert.equal(all(tree, 'blockquote').length, 1);
  assert.equal(all(tree, 'link')[0].children[0].value, 'Python Data model — Objects, values and types');
  assert.equal(all(tree, 'linkReference').length, 1);
  assert.equal(all(tree, 'inlineMath').length, 1);
  assert.equal(all(tree, 'math').length, 1);
  assert.match(all(tree, 'code')[1].value, /\n               ├──►/);
});
test('source boundaries are preserved and malformed mid-paragraph hashes are not guessed', () => {
  assert.deepEqual(parseMarkdown('Абзац.\n\n## Інтуїція').children.map(n => n.type), ['paragraph', 'heading']);
  assert.equal(parseMarkdown('Абзац.## Інтуїція').children.length, 1);
  assert.equal(all(parseMarkdown('`x.## text`\n\nhttps://example.com/a##b'), 'heading').length, 0);
});
test('every partial stream prefix parses, including unfinished code fences and links', () => {
  for (let i = 0; i < fixture.length; i += 7) assert.doesNotThrow(() => parseMarkdown(fixture.slice(0, i)));
  assert.equal(all(parseMarkdown('```python\n  print("hi")'), 'code')[0].value, '  print("hi")');
  assert.doesNotThrow(() => parseMarkdown('[unfinished](https://exa'));
  assert.ok(parseMarkdown(fixture.repeat(30)).children.length > 500);
});
test('highlighting supports requested languages without changing code or ASCII spacing', () => {
  for (const [language, code] of Object.entries({ python: 'def hello():\n  return "Привіт"', typescript: 'const n: number = 1;', javascript: 'const x = true;', json: '{"x": 1}', bash: 'echo "$HOME"', sql: 'SELECT * FROM pages;' })) {
    const tokens = highlight(code, language);
    assert.equal(tokens.map(t => t.text).join(''), code);
    assert.ok(tokens.some(t => t.type));
  }
  for (const lang of ['text', 'unknown']) assert.equal(highlight(' ──►  A\n B', lang).map(t => t.text).join(''), ' ──►  A\n B');
});
test('links allow only explicit supported schemes', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', 'file:///etc/passwd', 'intent://x', '//example.com', 'https://u:p@example.com', 'https://exa\nmple.com']) assert.equal(safeExternalUrl(url), null);
  for (const url of ['https://docs.python.org/3/#objects', 'http://example.com', 'mailto:hello@example.com']) assert.ok(safeExternalUrl(url));
});
const native = require('react-native-web');
const colors = createLoader()('src/shared/design/tokens.ts').basePalettes.dark;
const rendererLoad = createLoader({ 'react-native': { ...native, Alert: { alert() {} }, Linking: { openURL: async () => {} } }, 'expo-clipboard': { setStringAsync: async () => {} }, '@/shared/design/DesignProvider': { useDesign: () => ({ colors }) }, '@/features/entry/copy': { useCopy: () => text => text } });
const { RichMarkdownRenderer } = rendererLoad('src/shared/markdown/RichMarkdownRenderer.tsx');
test('native renderer component renders full and incomplete documents with compact typography and horizontal scroll containers', () => {
  for (const content of [fixture, '```python\nprint(1)', '[partial](https://exa']) {
    const html = renderToStaticMarkup(React.createElement(RichMarkdownRenderer, { content }));
    assert.ok(html.length > 100);
    if (content === fixture) {
      assert.match(html, /font-size:14px/); assert.match(html, /line-height:22px/);
      assert.match(html, /margin-bottom:12px/); assert.match(html, /r-overflowX-/);
      assert.match(html, /role="link"/); assert.match(html, /Copy code block/);
      assert.doesNotMatch(html, /\[Python Data model/);
    }
  }
});
test('link opening validates before dispatch and handles open failures', async () => {
  const opened = [], alerts = [];
  const linkLoad = createLoader({ 'react-native': { ...native, Alert: { alert: (...args) => alerts.push(args) }, Linking: { openURL: async url => { opened.push(url); if (url.includes('fail')) throw Error('offline'); } } }, 'expo-clipboard': {}, '@/shared/design/DesignProvider': {}, '@/features/entry/copy': {} });
  const { openMarkdownLink } = linkLoad('src/shared/markdown/RichMarkdownRenderer.tsx');
  await openMarkdownLink('javascript:alert(1)'); assert.equal(opened.length, 0);
  await openMarkdownLink('https://example.com'); assert.equal(opened.length, 1);
  await openMarkdownLink('https://fail.example.com'); assert.equal(alerts.length, 2);
});
test('copy button copies exact source, reports failure, and cleans up its feedback timer', async () => {
  let copied, fail = false, alerts = 0, cleanup;
  const copyLoad = createLoader({
    react: { ...React, useState: () => [false, () => {}], useMemo: fn => fn(), useRef: initial => ({ current: initial }), useEffect: fn => { cleanup = fn(); } },
    'react-native': { ...native, Alert: { alert() { alerts++; } } },
    'expo-clipboard': { async setStringAsync(value) { if (fail) throw Error('denied'); copied = value; } },
    '@/shared/design/DesignProvider': { useDesign: () => ({ colors }) }, '@/features/entry/copy': { useCopy: () => text => text },
  });
  const { CodeBlock } = copyLoad('src/shared/markdown/CodeBlock.tsx');
  const source = '  Привіт ──►\n\treturn x;';
  const tree = CodeBlock.type({ code: source, language: 'text' });
  const press = tree.props.children[0].props.children[1].props.onPress;
  try { await press(); assert.equal(copied, source); fail = true; await press(); assert.equal(alerts, 1); }
  finally { cleanup(); }
});
test('math typesets TeX into self-contained SVG paths and bounds large input', () => {
  const { typesetMath } = load('src/shared/markdown/math.ts');
  for (const source of ['x^2 + y^2', '\\frac{1}{2}', 'E = mc^2', '\\sum_{i=0}^n i']) {
    const result = typesetMath(source, true);
    assert.match(result.xml, /<svg/); assert.match(result.xml, /<path/);
    assert.ok(result.width > 0 && result.height > 0);
    assert.doesNotMatch(result.xml, /<script|<foreignObject|href="https/);
  }
  assert.throws(() => typesetMath('x'.repeat(2001), true));
});
