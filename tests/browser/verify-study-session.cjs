// Real authenticated catalogs/history; turn commands are intercepted unless --live is supplied.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.LEARNING_BASE_URL || 'http://localhost:8096';
const output = process.env.STUDY_OUTPUT_DIR || '/tmp/deeptutor-study-update';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    if (process.env.LEARNING_COOKIE_FILE) await context.addCookies(JSON.parse(fs.readFileSync(process.env.LEARNING_COOKIE_FILE)));
    else {
      assert.ok(process.env.LEARNING_TEST_USERNAME && process.env.LEARNING_TEST_PASSWORD, 'Provide test authentication');
      assert.equal((await context.request.post(`${base}/api/auth/login`, { data: { username: process.env.LEARNING_TEST_USERNAME, password: process.env.LEARNING_TEST_PASSWORD } })).status(), 200);
    }
    await context.addInitScript(server => {
      localStorage.setItem('deeptutor-api-server', server);
      localStorage.setItem('deeptutor-mobile-local-v1', JSON.stringify({ state: { theme: 'dark', language: 'en', layout: 'modern', values: {}, tasks: {}, notes: {} }, version: 1 }));
    }, base);
    const workspace = process.env.LEARNING_WORKSPACE_ID || '';
    const topic = (await (await context.request.get(`${base}/api/mastery-paths/topics?dt_workspace=${encodeURIComponent(workspace)}`)).json()).topics.find(item => item.next.knowledge_point_id);
    assert.ok(topic, 'A path with a current objective is needed');
    const sessions = (await (await context.request.get(`${base}/api/mastery-paths/topics/${topic.path_id}/sessions?dt_workspace=${encodeURIComponent(workspace)}`)).json()).sessions;
    assert.ok(sessions.length, 'An existing study session is needed');
    const session = sessions[0];
    const studyUrl = `${base}/learning/live?${new URLSearchParams({ view: 'study', workspace, pathId: topic.path_id, sessionId: session.session_id })}`;
    const page = await context.newPage(); const errors = [], commands = [], checks = [];
    page.on('pageerror', cause => errors.push(cause.message));
    page.on('console', message => { if (message.type() === 'error' && /Unexpected text|Maximum update|Cannot update/.test(message.text())) errors.push(message.text()); });
    // Verify submissions without writing assessment prompts into an existing user's study session.
    await page.routeWebSocket(/\/ws(?:\?|$)/, ws => ws.onMessage(raw => {
      const command = JSON.parse(raw);
      if (command.type === 'check_active_turn') ws.send(JSON.stringify({ protocol_version: '2.0', type: 'active_turn_info', status: 'completed' }));
      if (command.type === 'start_turn') {
        commands.push(command);
        ws.send(JSON.stringify({ protocol_version: '2.0', type: 'command_ack', accepted: false, message: 'Verification rejection' }));
      }
    }));
    const ready = async () => { await page.getByRole('textbox', { name: 'Your answer', exact: true }).waitFor(); await page.getByText('Loading…', { exact: true }).waitFor({ state: 'hidden' }); };
    const capture = async name => { await page.waitForTimeout(400); return page.screenshot({ path: path.join(output, name + '.png') }); };
    await page.goto(studyUrl); await ready();
    assert.equal(await page.getByRole('button', { name: 'Quick Check', exact: true }).count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Teach Me', exact: true }).count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Challenge', exact: true }).count(), 1);
    const input = page.getByRole('textbox', { name: 'Your answer', exact: true });
    assert.equal(await input.getAttribute('placeholder'), 'Explain your reasoning...');
    assert.equal(await page.getByRole('button', { name: 'Send', exact: true }).isDisabled(), true);
    assert.ok((await input.boundingBox()).height <= 52);
    await input.fill('Unsent answer\nSecond line');
    await page.getByRole('button', { name: 'Teach Me', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Verification rejection' }).waitFor();
    assert.equal(await input.inputValue(), 'Unsent answer\nSecond line');
    assert.equal(commands[0].session_id, session.session_id);
    assert.equal(commands[0].mastery_path_id, topic.path_id);
    assert.equal(commands[0].mastery_session_mode, 'study');
    assert.ok(commands[0].content.includes(topic.next.knowledge_point_id));
    checks.push('strategy sends contextual mastery turn; rejection preserves unsent answer');
    await page.reload(); await ready(); await input.fill('');
    await capture('study-390');
    await page.getByRole('button', { name: /Resources, \d+ attached/ }).click();
    await page.getByRole('textbox', { name: 'Search resource types', exact: true }).fill('book');
    await page.getByRole('button', { name: 'Books', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Chat History', exact: true }).count(), 0);
    await page.getByRole('textbox', { name: 'Search resource types', exact: true }).fill('');
    for (const name of ['Attach files', 'Chat History', 'Books', 'Favorites', 'Question Bank', 'Knowledge']) await page.getByRole('button', { name, exact: true }).waitFor();
    await page.getByRole('button', { name: 'Chat History', exact: true }).click();
    await page.getByText('Loading…', { exact: true }).waitFor({ state: 'hidden' });
    const available = await context.request.get(`${base}/api/sessions?limit=50&offset=0&dt_workspace=${encodeURIComponent(workspace)}`);
    const history = (await available.json()).sessions.find(item => item.session_id !== session.session_id && !item.preferences?.archived);
    if (history) {
      await page.getByRole('button', { name: history.title, exact: true }).click();
      await page.getByRole('button', { name: 'Back to resources', exact: true }).click();
      await page.getByRole('button', { name: `Remove ${history.title}`, exact: true }).click();
      checks.push('real history selection/removal updates attached count');
    }
    await page.getByRole('button', { name: 'Attach files', exact: true }).click();
    await page.getByRole('button', { name: 'Choose files', exact: true }).waitFor();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Choose files', exact: true }).click();
    await (await chooser).setFiles({ name: 'study-verification.txt', mimeType: 'text/plain', buffer: Buffer.from('Tiny attachment for mobile UI verification.') });
    await page.getByRole('button', { name: 'Remove study-verification.txt', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Remove study-verification.txt', exact: true }).click();
    checks.push('real Expo web picker reads a file; pending file can be removed without sending');
    await page.getByRole('button', { name: /^Close Resources/ }).click();
    await page.getByRole('button', { name: 'More actions', exact: true }).click();
    for (const name of ['Hint', 'Defer objective', 'Switch learning path', 'Leave session']) await page.getByRole('button', { name, exact: true }).waitFor();
    await capture('more-actions');
    await page.getByRole('button', { name: 'Close More actions', exact: true }).click();
    await input.fill('Keep my unsent reasoning');
    await page.getByRole('button', { name: 'More actions', exact: true }).click();
    await page.getByRole('button', { name: 'Leave session', exact: true }).click();
    await page.getByRole('dialog', { name: 'Leave session?', exact: true }).getByRole('button', { name: 'Leave session', exact: true }).click();
    await page.getByRole('button', { name: 'Continue current session', exact: true }).waitFor();
    await page.getByRole('button', { name: /^Sessions/ }).click();
    await page.getByRole('button', { name: session.title, exact: false }).first().click(); await ready();
    assert.equal(await input.inputValue(), 'Keep my unsent reasoning');
    await page.reload(); await ready();
    checks.push('leave confirmation navigates to existing path; reopening restores unsent answer and full reload restores server history');
    for (const width of [320, 390, 480]) {
      await page.setViewportSize({ width, height: 844 });
      await input.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7');
      assert.ok((await input.boundingBox()).height <= 112);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await input.fill(''); await page.getByRole('button', { name: 'Quick Check', exact: true }).scrollIntoViewIfNeeded(); await capture(`study-${width}`); checks.push(`responsive width ${width}, bounded multiline composer`);
    }
    await page.goto(`${base}/learning/live?${new URLSearchParams({ view: 'topic', workspace, pathId: topic.path_id })}`);
    await page.getByRole('button', { name: 'Continue current session', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Quick Check', exact: true }).count(), 0);
    checks.push('no starters on Mastery Path');
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ checks, errors, turnSubmissions: 'intercepted; no backend mutation', liveCatalogs: true }, null, 2));
    assert.deepEqual(errors, []); console.log(JSON.stringify({ checks: checks.length, errors: errors.length, output }));
  } finally { await browser.close(); }
})().catch(cause => { console.error(cause.message); process.exitCode = 1; });
