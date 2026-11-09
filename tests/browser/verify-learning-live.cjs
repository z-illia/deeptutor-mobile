/* Authenticated, read-only by default. Screenshots may contain private learning content. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.LEARNING_BASE_URL || 'http://localhost:8096';
const output = process.env.LEARNING_OUTPUT_DIR || '/tmp/deeptutor-learning-verification';
const workspace = process.env.LEARNING_WORKSPACE_ID || '';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    if (process.env.LEARNING_COOKIE_FILE) await context.addCookies(JSON.parse(fs.readFileSync(process.env.LEARNING_COOKIE_FILE, 'utf8')));
    else {
      assert.ok(process.env.LEARNING_TEST_USERNAME && process.env.LEARNING_TEST_PASSWORD, 'Provide a test account or LEARNING_COOKIE_FILE');
      const login = await context.request.post(`${base}/api/auth/login`, { data: { username: process.env.LEARNING_TEST_USERNAME, password: process.env.LEARNING_TEST_PASSWORD } });
      assert.equal(login.status(), 200, 'Test account login failed');
    }
    await context.addInitScript(server => {
      localStorage.setItem('deeptutor-api-server', server);
      localStorage.setItem('deeptutor-mobile-local-v1', JSON.stringify({ state: { theme: 'dark', language: 'en', layout: 'modern', values: {}, tasks: {}, notes: {} }, version: 1 }));
    }, base);
    const topicsResponse = await context.request.get(`${base}/api/mastery-paths/topics?dt_workspace=${encodeURIComponent(workspace)}`);
    assert.equal(topicsResponse.status(), 200);
    const topics = (await topicsResponse.json()).topics;
    const topic = topics.find(item => item.map.modules.length);
    const page = await context.newPage();
    const errors = [], checks = [];
    page.on('pageerror', cause => errors.push(cause.message));
    page.on('console', message => { if (message.type() === 'error' && /Unexpected text node|Cannot update|Maximum update/.test(message.text())) errors.push(message.text()); });
    const visit = async (view, extra = {}, expected) => {
      console.log('Checking', view, extra.moduleId || '');
      await page.goto(`${base}/learning/live?${new URLSearchParams({ view, workspace, pathId: topic?.path_id || '', ...extra })}`);
      await page.getByRole('heading').first().waitFor({ timeout: 60000 });
      await page.getByText('Loading…', { exact: true }).waitFor({ state: 'hidden', timeout: 60000 });
      if (expected) await page.getByText(expected, { exact: true }).first().waitFor();
      assert.deepEqual(await page.getByRole('alert').allTextContents(), [], `${view} has an error`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, `${view} overflows`);
      await page.screenshot({ path: path.join(output, `${view}${extra.moduleId ? `-${encodeURIComponent(extra.moduleId)}` : ''}.png`) }); checks.push({ view, width: 390, overflow });
    };
    await visit('overview', {}, 'Your learning');
    await page.getByRole('button', { name: 'Switch workspace', exact: true }).click();
    await page.getByRole('heading', { name: 'Switch workspace', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    for (const view of ['new', 'create', 'books', 'reading', 'practice', 'progress']) await visit(view);
    if (topic) {
      for (const view of ['topic', 'review', 'profile', 'goal', 'sessions']) await visit(view);
      for (const module of topic.map.modules) await visit('module', { moduleId: module.id }, module.objective || module.name);
      const sessions = await (await context.request.get(`${base}/api/mastery-paths/topics/${topic.path_id}/sessions?dt_workspace=${encodeURIComponent(workspace)}`)).json();
      if (sessions.sessions.length) {
        await visit('study', { sessionId: sessions.sessions[0].session_id });
        const input = page.getByRole('textbox', { name: 'Your answer', exact: true });
        const compact = await input.boundingBox(); assert.ok(compact.height <= 64, 'Empty composer must be compact');
        await input.fill('Line one\nLine two\nLine three\nLine four\nLine five\nLine six\nLine seven\nLine eight');
        await page.waitForTimeout(100); const expanded = await input.boundingBox(); assert.ok(expanded.height <= 160, 'Composer must be bounded');
        await input.fill('');
        await page.getByRole('button', { name: /Resources, \d+ attached/ }).click();
        await page.getByText('Additional knowledge bases', { exact: true }).waitFor();
        await page.screenshot({ path: path.join(output, 'resources.png') });
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        await page.getByRole('button', { name: 'More tools', exact: true }).click();
        await page.getByRole('button', { name: 'Ask for a hint', exact: true }).click();
        assert.ok((await input.inputValue()).includes('hint'));
        await input.fill('');
        await page.reload(); await input.waitFor();
        checks.push({ view: 'study-history-reopened', compactHeight: compact.height, expandedHeight: expanded.height });
      }
    }
    const goalWithoutOutline = topics.find(item => !item.map.modules.length);
    if (goalWithoutOutline) {
      const sessions = await (await context.request.get(`${base}/api/mastery-paths/topics/${goalWithoutOutline.path_id}/sessions?dt_workspace=${encodeURIComponent(workspace)}`)).json();
      if (sessions.sessions.length) {
        await visit('study', { pathId: goalWithoutOutline.path_id, sessionId: sessions.sessions[0].session_id });
        await page.getByRole('button', { name: /Resources, \d+ attached/ }).click();
        await page.getByText('Additional knowledge bases', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        checks.push({ view: 'study-without-outline' });
      }
    }
    for (const width of [320, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`${base}/learning`); await page.getByText('Your learning', { exact: true }).waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false); checks.push({ view: 'overview', width, overflow });
    }
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ checks, errors, mutations: 'none' }, null, 2));
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ checks: checks.length, errors: errors.length, output }));
  } finally { await browser.close(); }
})().catch(cause => { console.error(cause.message); process.exitCode = 1; });
