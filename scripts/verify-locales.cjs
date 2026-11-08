const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const base = process.env.BASE_URL || 'http://localhost:8099';
const output = process.env.OUTPUT_DIR || '/tmp/deeptutor-locale-verification';
fs.mkdirSync(output, { recursive: true });
const compiled = ts.transpileModule(fs.readFileSync(path.join(root, 'src/i18n/copy.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const copyModule = { exports: {} };
new Function('require', 'module', 'exports', compiled)(request => require(path.join(root, 'src/i18n', request)), copyModule, copyModule.exports);
const { translateCopy } = copyModule.exports;
const languageNames = { en: 'English', zh: '中文', fr: 'Français', de: 'Deutsch', uk: 'Українська', pl: 'Polski', pt: 'Português', vi: 'Tiếng Việt', ja: '日本語', tr: 'Türkçe' };
const specs = require('../src/features/mobile/screens.json');

let activeBrowser;
let activePage;
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  activeBrowser = browser;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const routesOnly = process.argv.includes('--routes-only');
  if (routesOnly) await context.addInitScript(() => { if (!localStorage.getItem('deeptutor-mobile-local-v1')) localStorage.setItem('deeptutor-mobile-local-v1', JSON.stringify({ state: { language: 'tr', theme: 'system' }, version: 1 })); });
  const page = await context.newPage();
  activePage = page;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const results = routesOnly ? JSON.parse(fs.readFileSync(path.join(output, 'report.json'), 'utf8')).results : [];
  let current = routesOnly ? 'tr' : 'en';
  const text = key => translateCopy(current, key);
  const heading = async (number, target = page) => {
    const spec = specs.find(item => item.number === number);
    await target.getByTestId('mobile-ready').waitFor();
    await target.getByRole('heading', { name: text(spec.name.split(' / ')[1]), exact: true }).first().waitFor();
  };
  const go = async (number, target = page) => {
    await target.goto(`${base}/mobile/${number}`);
    try { await heading(number, target); }
    catch (firstError) {
      await target.reload();
      try { await heading(number, target); }
      catch (error) {
        await target.screenshot({ path: path.join(output, `failure-route-${number}.png`) });
        fs.writeFileSync(path.join(output, `failure-route-${number}.html`), await target.content());
        throw new Error(`/mobile/${number}: ${error.message}; browser errors: ${errors.join('; ')}`);
      }
      console.log('Verified after reload:', number);
    }
  };
  for (const language of routesOnly ? [] : Object.keys(languageNames)) {
    await go(82);
    if (language !== current) {
      await page.getByRole('button', { name: text('Interface language'), exact: true }).click();
      await page.getByRole('button', { name: text(languageNames[language]), exact: true }).click();
      await page.getByRole('button', { name: text('Apply preferences'), exact: true }).click();
      current = language;
      await page.getByRole('heading', { name: text('Preferences applied'), exact: true }).waitFor();
      await page.getByRole('button', { name: text('Done'), exact: true }).click();
    }
    await page.reload();
    await heading(82);
    await page.getByRole('button', { name: text('Interface language'), exact: true }).waitFor();
    for (const number of [1, 26, 37, 52, 81, 83]) {
      await go(number);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) throw new Error(`Horizontal overflow: ${language} /mobile/${number}`);
      results.push({ language, route: `/mobile/${number}` });
    }
    await page.goto(`${base}/settings/general`);
    await page.getByRole('heading', { name: text('General'), exact: true }).first().waitFor();
    await page.getByText(text('Interface language'), { exact: true }).first().waitFor();
    results.push({ language, route: '/settings/general' });
    await page.screenshot({ path: path.join(output, `${language}-settings.png`) });
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ results, errors }, null, 2));
    console.log('Verified switching, persistence and both route families:', language);
  }
  await go(29);
  await page.getByRole('textbox', { name: text('Page title'), exact: true }).fill('General');
  await page.getByRole('textbox', { name: text('Note body'), exact: true }).fill('const locale = "en";');
  await page.getByRole('button', { name: text('Save note'), exact: true }).click();
  await page.getByRole('button', { name: text('Done'), exact: true }).click();
  await go(28);
  await page.getByRole('button', { name: 'General', exact: true }).click();
  await heading(29);
  if (await page.getByRole('textbox', { name: text('Page title'), exact: true }).inputValue() !== 'General') throw new Error('Authored title was translated');
  if (await page.getByRole('textbox', { name: text('Note body'), exact: true }).inputValue() !== 'const locale = "en";') throw new Error('Authored code was translated');
  console.log('Verified authored note title and code remain unchanged.');
  if (process.argv.includes('--all')) {
    let cursor = 0;
    const checked = new Set(results.filter(item => item.language === current).map(item => item.route));
    const remaining = specs.filter(spec => !checked.has(`/mobile/${spec.number}`));
    await Promise.all(Array.from({ length: 2 }, async () => {
      const target = await page.context().newPage();
      target.on('pageerror', error => errors.push(error.message));
      try {
        while (cursor < remaining.length) {
          const spec = remaining[cursor++];
          await go(spec.number, target);
          results.push({ language: current, route: `/mobile/${spec.number}` });
          fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ results, errors }, null, 2));
          if (spec.number % 20 === 0) console.log('Verified localized route:', spec.number);
        }
      } finally { await target.close(); }
    }));
  }
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ results, errors }, null, 2));
  await browser.close();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Passed ${results.length} route checks across all ${Object.keys(languageNames).length} languages.`);
})().catch(async error => {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
  if (activeBrowser) await activeBrowser.close();
  console.error(error); process.exitCode = 1;
});
