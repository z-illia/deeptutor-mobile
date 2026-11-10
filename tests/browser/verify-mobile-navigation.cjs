const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const { screenPath } = require('../helpers/rich-markdown.cjs').createLoader()('src/features/navigation/paths.ts');
const base = process.env.MOBILE_BASE_URL || 'http://localhost:8099';
const simulation = process.env.MOBILE_SIM_URL;
const settingsSimulation = process.env.MOBILE_SETTINGS_SIM_URL || 'http://localhost:4121/settings';
assert.ok(simulation);
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(server => localStorage.setItem('deeptutor-api-server', server), base);
    await context.route('**/api/**', async route => {
      const req = route.request(), url = new URL(req.url());
      const response = await context.request.fetch(`${['/api/settings', '/api/settings/draft'].includes(url.pathname) ? settingsSimulation : simulation}${url.pathname}${url.search}`, { method: req.method(), data: req.postDataBuffer() ?? undefined, headers: req.postDataBuffer() ? { 'content-type': 'application/json' } : {} });
      await route.fulfill({ response });
    });
    const page = await context.newPage(); page.setDefaultTimeout(20000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (/cannot (?:be a descendant|contain)|hydration failed/i.test(message.text())) errors.push(message.text()); });
    const routes = [['/personalization', 65, 'Personalization'], ['/settings', 81, 'Settings'], ['/settings/overview', 81, 'Settings'], ['/settings/general', 82, 'General'], ['/settings/appearance', 83, 'Appearance'], ['/space/chat-history', 27, 'Conversations'], ['/settings/archive', 108, 'Archived conversations'], ['/notebooks', 31, 'Favorites']];
    for (const [legacy, number, title] of routes) {
      await page.goto(base + legacy);
      await page.waitForURL(`**${screenPath(number)}`);
      await page.getByRole('heading', { name: title, exact: true }).waitFor();
      if (number === 82) await page.getByRole('button', { name: 'Interface language', exact: true }).waitFor();
      if (number === 83) await page.getByRole('button', { name: 'Theme', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Open navigation', exact: true }).count(), 0);
      assert.equal(await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `/tmp/mobile-migration-${number}.png` });
    }
    await page.goto(base + '/settings/archive');
    const restore = page.getByRole('button', { name: 'Restore', exact: true });
    await restore.first().waitFor();
    const archived = await restore.count();
    await restore.first().click();
    await page.waitForFunction(expected => [...document.querySelectorAll('[role="button"]')].filter(node => node.textContent === 'Restore').length === expected, archived - 1);
    await page.getByRole('button', { name: 'Delete all archived chats', exact: true }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByText('Nothing archived yet', { exact: true }).waitFor();
    await page.goto(base + '/workspaces/switch');
    await page.getByRole('button', { name: 'Workspace B', exact: true }).waitFor();
    await page.screenshot({ path: '/tmp/mobile-migration-62.png' });
    await page.getByRole('button', { name: 'Workspace B', exact: true }).click();
    assert.equal(new URL(page.url()).pathname, '/workspaces/switch');
    await page.getByRole('button', { name: 'Use selected workspace', exact: true }).click();
    await page.waitForURL('**/learning');
    await page.goto(base + '/favorites');
    await page.getByRole('button', { name: 'Create first collection', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Create first collection', exact: true }).click();
    await page.waitForURL('**/favorites/new');
    await page.getByRole('textbox', { name: 'Collection Name', exact: true }).waitFor();
    await page.waitForTimeout(500); // Wait for the native modal slide before visual capture.
    await page.screenshot({ path: '/tmp/mobile-migration-32.png' });
    await page.setViewportSize({ width: 320, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log('Passed: eight compatibility routes, mobile headings, no web shell, 390px layouts, local archive restore/delete, staged workspace confirmation and mobile create form at 390px/320px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
