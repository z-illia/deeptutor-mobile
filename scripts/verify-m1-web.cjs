const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.M1_WEB_URL || 'http://127.0.0.1:8091';
const output = process.env.M1_OUTPUT_DIR || '/tmp/deeptutor-m1-verification';

async function verify() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}) });
  const results = [];
  try {
    for (const viewport of [{ width: 412, height: 915 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce', colorScheme: 'light' });
      const page = await context.newPage();
      const errors = [];
      const remote = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
      await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname.startsWith('/api/')) { remote.push(url.pathname); await route.abort(); }
        else await route.continue();
      });
      await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 120000 });
      await page.getByRole('button', { name: 'Component preview', exact: true }).waitFor();
      const shell = page.getByTestId('app-shell').last();
      assert.equal(await shell.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
      if (viewport.width >= 768) assert.equal(await shell.locator('[style*="border-right-width"]').first().evaluate(el => getComputedStyle(el).borderRightColor), 'rgba(55, 53, 47, 0.09)');
      await page.screenshot({ path: path.join(output, `shell-snow-${viewport.width}.png`) });
      if (viewport.width < 768) {
        await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
        await page.getByRole('tab', { name: 'Learning', exact: true }).waitFor();
        await page.screenshot({ path: path.join(output, 'drawer-snow-412.png') });
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Open navigation', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
        await page.getByRole('tab', { name: 'Learning', exact: true }).click();
      } else {
        await page.getByRole('button', { name: 'Arrange sidebar', exact: true }).click();
        await page.getByRole('button', { name: 'Hide pages Calendar', exact: true }).click();
        await page.getByRole('button', { name: 'Calendar', exact: true }).waitFor({ state: 'hidden' });
        await page.getByRole('button', { name: 'Reset to defaults', exact: true }).click();
        await page.getByRole('button', { name: 'Calendar', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Move up Calendar', exact: true }).click();
        await page.getByRole('button', { name: 'Widen sidebar', exact: true }).click();
        await page.getByRole('button', { name: 'Narrow sidebar', exact: true }).click();
        await page.getByRole('button', { name: 'Arrange sidebar', exact: true }).click();
        await page.getByRole('tab', { name: 'Learning', exact: true }).click();
        await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
        await page.getByRole('button', { name: 'Expand sidebar', exact: true }).click();
      }
      assert.match(page.url(), /shelf=learning/);
      assert.equal(new URL(page.url()).pathname, '/');
      await page.getByRole('button', { name: 'Component preview', exact: true }).click();
      await page.getByText('DeepTutor · M1', { exact: true }).waitFor();
      await page.waitForFunction((expected) => getComputedStyle(Array.from(document.querySelectorAll('[role="heading"]')).find(el => el.textContent === 'DeepTutor · M1')).fontSize === expected, viewport.width === 1440 ? '32px' : '27px');
      for (const [theme, color] of [['snow', 'rgb(255, 255, 255)'], ['cream', 'rgb(253, 252, 249)'], ['dark', 'rgb(26, 25, 24)'], ['glass', 'rgb(14, 13, 26)']]) {
        await page.getByRole('button', { name: `Theme ${theme}`, exact: true }).click();
        assert.equal(await shell.evaluate((el) => getComputedStyle(el).backgroundColor), color);
        await page.screenshot({ path: path.join(output, `primitives-${theme}-${viewport.width}.png`), fullPage: true });
      }
      await page.getByRole('button', { name: 'Theme system', exact: true }).click();
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.waitForFunction(() => getComputedStyle(Array.from(document.querySelectorAll('[data-testid="app-shell"]')).at(-1)).backgroundColor === 'rgb(26, 25, 24)');
      await page.emulateMedia({ colorScheme: 'light' });
      await page.waitForFunction(() => getComputedStyle(Array.from(document.querySelectorAll('[data-testid="app-shell"]')).at(-1)).backgroundColor === 'rgb(255, 255, 255)');
      await page.getByRole('tab', { name: 'Classic', exact: true }).click();
      assert.equal(await page.getByText('DeepTutor · M1', { exact: true }).evaluate((el) => getComputedStyle(el).fontFamily), 'LoraSemiBold');
      await page.screenshot({ path: path.join(output, `classic-${viewport.width}.png`), fullPage: true });
      await page.getByRole('tab', { name: 'Modern', exact: true }).click();
      await page.getByRole('button', { name: 'Language uk', exact: true }).click();
      const input = page.getByRole('textbox');
      await input.fill('Локальний приклад');
      assert.equal(await input.inputValue(), 'Локальний приклад');
      await page.screenshot({ path: path.join(output, `ukrainian-${viewport.width}.png`), fullPage: true });
      await page.getByRole('button', { name: 'Language en', exact: true }).click();
      await page.getByRole('switch', { name: 'Development switch', exact: true }).click();
      await page.getByRole('tab', { name: 'Second', exact: true }).click();
      await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
      const dialog = page.getByTestId('shared-dialog');
      await dialog.waitFor();
      await page.screenshot({ path: path.join(output, `confirm-${viewport.width}.png`) });
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
      await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      await page.getByRole('button', { name: 'Dismiss', exact: true }).last().click();
      await page.getByRole('switch', { name: 'Simulate failure', exact: true }).click();
      await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
      await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.keyboard.press('Escape');
      await dialog.getByText('Development fixture: action failed.', { exact: true }).waitFor();
      await page.screenshot({ path: path.join(output, `confirm-failed-${viewport.width}.png`) });
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      await page.getByRole('tab', { name: 'error', exact: true }).click();
      await page.getByRole('button', { name: 'Retry', exact: true }).click();
      await page.getByRole('tab', { name: 'empty', exact: true }).click();
      await page.getByText('No conversations yet', { exact: true }).last().waitFor();
      await page.getByRole('tab', { name: 'loading', exact: true }).click();
      await page.getByText('Loading…', { exact: true }).last().waitFor();
      await page.getByRole('button', { name: 'Session avatars — states', exact: true }).click();
      await page.getByText('Session avatars — states', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Step forward', exact: true }).click();
      await page.getByRole('button', { name: 'Size 14', exact: true }).click();
      await page.screenshot({ path: path.join(output, `avatars-${viewport.width}.png`), fullPage: true });
      assert.deepEqual(remote, []);
      assert.deepEqual(errors, []);
      results.push({ viewport, passed: ['source palettes', 'system theme updates', 'Classic/Modern', 'source shelf selection', 'drawer or rail', 'desktop sidebar hide/reset/reorder/resize', 'Ukrainian field', 'switch/tabs', 'confirmation cancel and completion', 'toast dismissal', 'loading/empty/error/retry', 'avatar phase and size', 'no backend requests', 'no browser errors'] });
      fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(results, null, 2));
      await context.close();
    }
  } finally { await browser.close(); }
  console.log(JSON.stringify(results, null, 2));
}
verify().catch((e) => { console.error(e); process.exitCode = 1; });
