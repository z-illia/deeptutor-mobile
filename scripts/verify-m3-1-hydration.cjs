const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);

const out = '/tmp/m3-1-hydration';
const baseUrl = process.env.BASE_URL || 'http://localhost:8093';
const routes = [
  '/chat',
  '/chat/session-general-1',
  '/space/chat-history',
  '/settings/archive',
  '/ui/search',
  '/explore',
  '/space',
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_EXECUTABLE,
  });
  const results = [];
  try {
    for (let repeat = 0; repeat < 2; repeat++) {
      for (const width of [412, 768, 1440]) {
        for (const colorScheme of ['light', 'dark']) {
          const context = await browser.newContext({
            viewport: { width, height: 1000 },
            colorScheme,
            reducedMotion: 'reduce',
          });
          const page = await context.newPage();
          let active;
          page.on('pageerror', (e) =>
            active?.errors.push({ message: e.message, stack: e.stack }),
          );
          page.on('console', (m) => {
            if (['error', 'warning'].includes(m.type())) {
              active?.console.push({ type: m.type(), text: m.text() });
            }
          });
          for (const route of routes) {
            active = {
              repeat,
              width,
              colorScheme,
              route,
              errors: [],
              console: [],
            };
            results.push(active);
            await page.goto(baseUrl + route, {
              waitUntil: 'networkidle',
              timeout: 120000,
            });
            active.finalURL = page.url();
            fs.writeFileSync(
              out + '/results.json',
              JSON.stringify(results, null, 2),
            );
          }
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  const failures = results.filter(
    (r) => r.errors.length || r.console.length,
  );
  if (failures.length > 0) {
    console.error('Hydration failures:', JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  }
  console.log(
    JSON.stringify({
      runs: results.length,
      failures: failures.length,
    }),
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
