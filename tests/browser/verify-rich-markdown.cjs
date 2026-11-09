// Real React Native Web primitives; static rendering checks layout, not hydration or keyboard behavior.
const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const native = require('react-native-web');
const { createLoader, root } = require('../helpers/rich-markdown.cjs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const output = process.env.RICH_OUTPUT_DIR || '/tmp/deeptutor-rich-markdown';
const colors = createLoader()('src/shared/design/tokens.ts').basePalettes.dark;
const load = createLoader({ 'react-native': native, 'expo-clipboard': { setStringAsync: async () => {} }, '@/shared/design/DesignProvider': { useDesign: () => ({ colors }) }, '@/features/entry/copy': { useCopy: () => text => text } });
const { RichMarkdownRenderer } = load('src/shared/markdown/RichMarkdownRenderer.tsx');
const fixture = fs.readFileSync(root + '/tests/fixtures/rich-response.md', 'utf8') + '\n```text\n' + 'long_line '.repeat(40) + '\n```\n\nhttps://example.com/' + 'a'.repeat(300);
const App = () => React.createElement(native.View, { style: { padding: 20, backgroundColor: colors.background } }, React.createElement(RichMarkdownRenderer, { content: fixture }));
native.AppRegistry.registerComponent('RichMarkdownAudit', () => App);
const { element, getStyleElement } = native.AppRegistry.getApplication('RichMarkdownAudit');
const html = renderToStaticMarkup(element);
const css = renderToStaticMarkup(getStyleElement());
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'mobile.html'), `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">${css}<style>@font-face{font-family:Inter;src:url(file://${root}/assets/fonts/Inter-Variable.ttf)}body{margin:0;background:${colors.background}}</style>${html}`);
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
 try {
  const page = await browser.newPage();
  const checks = [];
  for (const width of [320, 390, 768]) {
   await page.setViewportSize({ width, height: 844 });
   await page.goto('file://' + path.join(output, 'mobile.html'));
   await page.evaluate(() => document.fonts.ready);
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `page overflow at ${width}`);
   const horizontal = await page.evaluate(() => [...document.querySelectorAll('div')].filter(n => ['auto', 'scroll'].includes(getComputedStyle(n).overflowX) && n.scrollWidth > n.clientWidth).length);
   assert.ok(horizontal >= (width < 500 ? 2 : 1), 'code and tables scroll independently');
   await page.screenshot({ path: path.join(output, `mobile-${width}.png`), fullPage: true });
   checks.push({ width, pageOverflow: false, horizontalScrollContainers: horizontal });
  }
  if (process.env.DEEPTUTOR_WEB_ROOT) {
   const webRequire = require('node:module').createRequire(path.join(process.env.DEEPTUTOR_WEB_ROOT, 'package.json'));
   const webReact = webRequire('react');
   const { renderToStaticMarkup: renderWeb } = webRequire('react-dom/server');
   const Markdown = webRequire('react-markdown').default;
   const gfm = webRequire('remark-gfm').default;
   const math = webRequire('remark-math').default;
   const desktop = renderWeb(webReact.createElement(Markdown, { remarkPlugins: [gfm, math] }, fixture));
   fs.writeFileSync(path.join(output, 'desktop.html'), `<!doctype html><meta charset="utf-8"><style>body{background:#1a1918;color:#e8e4de;font:16px/1.6 system-ui;max-width:800px;margin:40px auto}a{color:#d4734b}pre{overflow:auto;background:#242220;padding:16px}table{border-collapse:collapse}td,th{border:1px solid #3a3634;padding:8px}</style>${desktop}`);
   await page.setViewportSize({ width: 1024, height: 844 });
   await page.goto('file://' + path.join(output, 'desktop.html'));
   assert.equal(await page.getByRole('heading').count(), 6);
   assert.ok(await page.getByRole('link', { name: 'Python Data model — Objects, values and types' }).count());
   await page.screenshot({ path: path.join(output, 'desktop-parser-reference.png'), fullPage: true });
   checks.push({ desktopParserReference: true, sameFixture: true, headings: 6 });
  }
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(checks, null, 2));
  console.log(JSON.stringify(checks));
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
