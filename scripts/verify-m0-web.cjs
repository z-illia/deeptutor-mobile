// Optional browser verification against a running Expo preview; no application/backend changes.
// PLAYWRIGHT_MODULE may point to an existing Playwright installation outside this project.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.M0_WEB_URL || 'http://127.0.0.1:8087';
const baselineURL = process.env.M0_BASELINE_URL;
const output = process.env.M0_OUTPUT_DIR || '/tmp/deeptutor-m0-verification';

async function verify() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}),
    headless: true,
  });
  const results = [];
  const baselineErrors = new Map();
  try {
    const previews = baselineURL
      ? [{ name: 'baseline', url: baselineURL }, { name: 'candidate', url: baseURL }]
      : [{ name: 'candidate', url: baseURL }];
    for (const preview of previews) {
      for (const viewport of [{ width: 1440, height: 1000 }, { width: 412, height: 915 }]) {
        const context = await browser.newContext({ viewport, colorScheme: 'dark', reducedMotion: 'reduce' });
        const errors = [];
        const backendRequests = [];
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (message.type() === 'error') errors.push(message.text());
        });
        // No remote provider/auth/API access is permitted during verification.
        await context.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          if (url.pathname.startsWith('/api/') || !['127.0.0.1', 'localhost'].includes(url.hostname)) {
            backendRequests.push(url.pathname);
            await route.abort();
          } else {
            await route.continue();
          }
        });
        await page.goto(preview.url, { waitUntil: 'networkidle', timeout: 120000 });
        const title = page.getByText(/Welcome to\s*Expo/);
        await title.waitFor();
        const themeColor = () => title.evaluate((node) => getComputedStyle(node).color);
        await page.waitForFunction(
          (node) => getComputedStyle(node).color === 'rgb(255, 255, 255)',
          await title.elementHandle(),
        );
        assert.equal(await themeColor(), 'rgb(255, 255, 255)');
        await page.screenshot({ path: path.join(output, `${preview.name}-starter-dark-${viewport.width}.png`) });

        await page.emulateMedia({ colorScheme: 'light' });
        await page.waitForFunction(
          (node) => getComputedStyle(node).color === 'rgb(0, 0, 0)',
          await title.elementHandle(),
        );
        assert.equal(await themeColor(), 'rgb(0, 0, 0)');
        await page.screenshot({ path: path.join(output, `${preview.name}-starter-light-${viewport.width}.png`) });

        const explore = page.locator('a[href="/explore"]').last();
        await explore.focus();
        await page.keyboard.press('Enter');
        await page.waitForURL('**/explore');
        await page.getByText('This starter app includes example', { exact: false }).waitFor();
        const disclosure = page.getByText('File-based routing', { exact: true });
        await disclosure.click();
        await page.getByText('This app has two screens:', { exact: false }).waitFor();
        await page.screenshot({ path: path.join(output, `${preview.name}-explore-expanded-${viewport.width}.png`) });
        await page.goBack();
        await title.waitFor();
        assert.equal(new URL(page.url()).pathname, '/');

        await page.goto(`${preview.url}/explore`, { waitUntil: 'networkidle' });
        await page.locator('a[href="/"]').last().click();
        await title.waitFor();
        assert.equal(new URL(page.url()).pathname, '/');
        assert.deepEqual(backendRequests, [], 'verification must not contact backend/provider endpoints');
        if (preview.name === 'baseline') baselineErrors.set(viewport.width, errors);
        const expectedErrors = baselineErrors.get(viewport.width) || [];
        const newErrors = errors.filter((error) => !expectedErrors.includes(error));
        results.push({
          preview: preview.name,
          viewport,
          passed: ['dark startup theme', 'live light theme', 'keyboard tab navigation', 'disclosure', 'browser Back', 'direct Explore entry and Home', 'no backend/provider requests'],
          observedErrors: errors,
          newErrors,
        });
        fs.writeFileSync(path.join(output, 'browser-results.json'), `${JSON.stringify(results, null, 2)}\n`);
        if (preview.name === 'candidate') {
          assert.deepEqual(newErrors, [], 'no new runtime/hydration errors compared with baseline');
          assert.ok(errors.length <= expectedErrors.length, 'no additional occurrences of baseline errors');
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(output, 'browser-results.json'), `${JSON.stringify(results, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
