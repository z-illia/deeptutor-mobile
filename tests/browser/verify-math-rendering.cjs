// Compare actual web KaTeX output with the native SVG typesetter output; no API mocks or app routes.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { createLoader, root } = require('../helpers/rich-markdown.cjs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const webRoot = process.env.DEEPTUTOR_WEB_ROOT;
assert.ok(webRoot, 'Set DEEPTUTOR_WEB_ROOT to the web checkout');
const webRequire = createRequire(path.join(webRoot, 'package.json'));
const katex = webRequire('katex');
const load = createLoader();
const { parseMarkdown } = load('src/shared/markdown/parser.ts');
const { typesetMath } = load('src/shared/markdown/math.ts');
const fixture = fs.readFileSync(path.join(root, 'tests/fixtures/math-response.md'), 'utf8');
const webNormalize = load(path.join(webRoot, 'lib/latex-normalize.ts')).normalizeMathMarkup;
const all = (node, type) => [...(node.type === type ? [node] : []), ...(node.children ?? []).flatMap(child => all(child, type))];
const equations = all(parseMarkdown(fixture), 'math');
const output = process.env.MATH_OUTPUT_DIR || '/tmp/deeptutor-math-rendering';
fs.mkdirSync(output, { recursive: true });
const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rows = equations.map((node, i) => {
 // Use the production web normalizer with explicit display delimiters to compare the same equation.
 const normalized = webNormalize('$$\n' + node.value + '\n$$');
 assert.equal(all(parseMarkdown(normalized), 'math')[0].value.trim(), node.value.trim());
 const native = typesetMath(node.value, true);
 const desktop = katex.renderToString(node.value, { displayMode: true, throwOnError: true, strict: false, trust: false });
 return `<section><h2>Expression ${i + 1}</h2><p>Web · KaTeX</p><div class="equation web">${desktop}</div><p>Mobile · native SVG</p><div class="equation native">${native.xml.replace(/width="[^"]*"/, `width="${native.width}"`).replace(/height="[^"]*"/, `height="${native.height}"`)}</div></section>`;
});
const css = fs.readFileSync(webRequire.resolve('katex/dist/katex.min.css'), 'utf8').replace(/url\(([^)]+)\)/g, (_, url) => `url(file://${path.join(path.dirname(webRequire.resolve('katex/dist/katex.min.css')), url)})`);
fs.writeFileSync(path.join(output, 'comparison.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}body{margin:0;padding:20px;background:#1a1918;color:#e8e4de;font:14px/22px Arial}h1{font-size:21px}h2{font-size:16px}section{margin-bottom:24px}.equation{max-width:100%;overflow-x:auto;overflow-y:hidden;padding:8px 0}.katex{font-size:1em}.katex-display{margin:0;text-align:left;width:max-content}p{color:#9b9590}.native svg{display:block;flex:none}</style><h1>Math rendering comparison</h1>${rows.join('')}`);
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
 try {
  const page = await browser.newPage(); const report = [];
  for (const width of [320, 390, 1024]) {
   await page.setViewportSize({ width, height: 844 });
   await page.goto('file://' + path.join(output, 'comparison.html'));
   await page.evaluate(() => document.fonts.ready);
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `page overflow at ${width}`);
   assert.equal(await page.locator('.katex').count(), equations.length);
   assert.equal(await page.locator('.native svg').count(), equations.length);
   assert.equal(await page.locator('[data-mml-node="merror"], .katex-error').count(), 0);
   assert.ok((await page.locator('.web').first().innerText()).includes('health-check'));
   const scrolls = await page.locator('.native').first().evaluate(node => node.scrollWidth > node.clientWidth);
   if (width < 600) assert.ok(scrolls, 'health-check equation must scroll at narrow widths');
   await page.screenshot({ path: path.join(output, `comparison-${width}.png`), fullPage: true });
   report.push({ width, equations: equations.length, pageOverflow: false, healthEquationScrolls: scrolls });
  }
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report));
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
