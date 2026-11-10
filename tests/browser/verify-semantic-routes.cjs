const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.MOBILE_BASE_URL || 'http://localhost:8099';
const mock = process.env.MOBILE_ADMIN_MOCK_URL || 'http://localhost:4500';

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(server => localStorage.setItem('deeptutor-api-server', server), base);
    const groupRequests = [];
    await context.route('**/api/**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname.startsWith('/api/partner-groups/')) {
        groupRequests.push(url.pathname);
        return route.fulfill({ json: { group_id: 'group-real', name: 'Specific group', member_ids: ['partner-a', 'partner-b'] } });
      }
      const response = await context.request.fetch(`${mock}${url.pathname}${url.search}`, { method: request.method(), data: request.postDataBuffer() ?? undefined, headers: { 'content-type': 'application/json' } });
      await route.fulfill({ response });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const cases = [
      ['/library', '/library', 'Library'],
      ['/settings', '/settings', 'Settings'],
      ['/settings/appearance', '/settings/appearance', 'Appearance'],
      ['/mobile/27?filter=archived', '/space/chat-history?filter=archived', 'Conversations'],
      ['/space/chat-history', '/space/chat-history', 'Conversations'],
      ['/mobile/84?workspaceId=w1', '/settings/workspace?workspaceId=w1', 'Workspaces'],
      ['/partners/groups/group-real', '/partners/groups/group-real', 'Specific group'],
      ['/mobile/72?groupId=group-real', '/partners/groups?groupId=group-real', 'Specific group'],
    ];
    for (const [previous, next, title] of cases) {
      console.log(`Checking ${previous} → ${next}`);
      await page.goto(base + previous);
      await page.waitForURL(base + next);
      await page.getByRole('heading', { name: title, exact: true }).first().waitFor();
      assert.equal(await page.getByRole('button', { name: 'Open navigation', exact: true }).count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.goto(base + '/library');
    await page.getByRole('button', { name: /^Conversations/ }).click();
    await page.waitForURL(base + '/space/chat-history');
    await page.getByRole('heading', { name: 'Conversations', exact: true }).first().waitFor();
    assert.ok(groupRequests.every(path => path === '/api/partner-groups/group-real'));
    assert.ok(groupRequests.length >= 2);
    assert.deepEqual(errors, []);
    console.log('Verified semantic pages, numeric redirects with query params, group deep links, library navigation and mobile layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
