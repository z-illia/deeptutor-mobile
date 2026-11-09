// Point WORKSPACE_SIM_URL at a local Postman simulation serving the existing
// auth/status, registrations, topics, sessions and llm-options read contracts.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.WORKSPACE_BASE_URL || 'http://localhost:8099';
const simulation = process.env.WORKSPACE_SIM_URL;
assert.ok(simulation, 'Provide WORKSPACE_SIM_URL (including its routeKey).');

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(server => {
      localStorage.setItem('deeptutor-api-server', server);
    }, base);
    let failRegistrations = false;
    const requests = [], errors = [];
    await context.route('**/api/**', async route => {
      const url = new URL(route.request().url());
      requests.push(url);
      const response = await context.request.get(`${simulation}${url.pathname}${url.search}`, {
        headers: failRegistrations && url.pathname.endsWith('/registrations') ? { 'x-mock-response-code': '503' } : {},
      });
      await route.fulfill({ response });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/mobile/62`);
    await page.getByRole('button', { name: 'Math A', exact: true }).waitFor({ timeout: 60000 });
    assert.equal(await page.getByRole('button', { name: 'Archived space', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Math A', exact: true }).click();
    await page.getByRole('button', { name: 'Use selected workspace', exact: true }).click();
    await page.waitForURL('**/learning');
    await page.getByText('Math A', { exact: true }).waitFor();
    assert.ok(requests.some(url => url.pathname.endsWith('/topics') && url.searchParams.get('dt_workspace') === 'ws-a'));

    await page.goto(`${base}/chat`);
    await page.getByRole('button', { name: 'Recent conversations', exact: true }).click();
    await page.getByText('No conversations yet', { exact: true }).waitFor();
    assert.ok(requests.some(url => url.pathname.endsWith('/sessions') && url.searchParams.get('dt_workspace') === 'ws-a'));
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByRole('button', { name: 'Switch workspace', exact: true }).click();
    await page.getByRole('button', { name: 'Physics B', exact: true }).click();
    await page.getByRole('button', { name: 'Recent conversations', exact: true }).click();
    await page.getByText('No conversations yet', { exact: true }).waitFor();
    assert.ok(requests.some(url => url.pathname.endsWith('/sessions') && url.searchParams.get('dt_workspace') === 'ws-b'));

    await page.goto(`${base}/learning`);
    await page.getByText('Physics B', { exact: true }).waitFor();
    await page.reload();
    await page.getByText('Physics B', { exact: true }).waitFor();
    failRegistrations = true;
    await page.getByRole('button', { name: 'Switch workspace', exact: true }).click();
    await page.getByText('Workspace service unavailable', { exact: true }).waitFor();
    assert.ok(await page.getByRole('button', { name: 'Physics B', exact: true }).isDisabled());
    failRegistrations = false;
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.getByRole('button', { name: 'Math A', exact: true }).click();
    await page.waitForURL(/workspace=ws-a/);
    await page.getByText('Math A', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Switch workspace', exact: true }).click();
    await page.getByRole('button', { name: 'General workspace', exact: true }).click();
    await page.waitForURL(/workspace=&/);
    await page.getByText('General workspace', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log('Passed: API list, archived filtering, learning/chat scope, persisted choice, 503 recovery, General workspace, 390px layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
