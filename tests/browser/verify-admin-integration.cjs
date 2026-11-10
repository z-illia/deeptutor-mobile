const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.ADMIN_BASE_URL || 'http://localhost:8101';
const mock = process.env.ADMIN_SIM_URL || 'http://localhost:4517/backend';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(server => localStorage.setItem('deeptutor-api-server', server), base);
    const errors = [], uncovered = [];
    await context.route('**/api/**', async route => {
      const req = route.request(), url = new URL(req.url());
      const response = await context.request.fetch(`${mock}${url.pathname}${url.search}`, { method: req.method(), data: req.postDataBuffer() ?? undefined, headers: { 'content-type': req.headers()['content-type'] || 'application/json' } });
      if (response.status() === 501) uncovered.push(`${req.method()} ${url.pathname}`);
      await route.fulfill({ response });
    });
    await context.routeWebSocket(url => new URL(url).pathname === '/ws', socket => socket.onMessage(raw => {
      const command = JSON.parse(String(raw));
      if (command.type === 'check_active_turn') socket.send(JSON.stringify({ protocol_version: '2.0', type: 'active_turn_info', status: 'idle' }));
    }));
    const page = await context.newPage(); page.setDefaultTimeout(20000);
    page.on('pageerror', error => errors.push(error.message));
    const button = name => page.getByRole('button', { name, exact: true });
    const field = name => page.getByRole('textbox', { name, exact: true });
    const state = async () => (await context.request.get(`${mock}/__test/state`)).json();
    await context.request.post(`${mock}/__test/reset`);
    const config = failure => context.request.post(`${mock}/__test/config`, { data: { failure } });
    const visit = async path => { await page.goto(`${base}${path}`); await page.getByRole('button', { name: 'Back', exact: true }).waitFor({ timeout: 90000 }); };
    const choose = async (label, value) => { await button(label).click(); await button(value).click(); };

    await visit('/mobile/97');
    await field('Maximum file size (MB)').fill('27');
    await config('PUT /api/settings/chat-attachments'); await button('Save changes').click();
    await page.getByText('Injected API failure', { exact: true }).waitFor();
    assert.equal((await state()).attachments.max_file_mb, 20);
    assert.equal(await field('Maximum file size (MB)').inputValue(), '27');
    await config(''); await button('Save changes').click();
    await page.getByText('Changes saved', { exact: true }).waitFor();
    assert.equal((await state()).attachments.max_file_mb, 27);

    await visit('/mobile/85?workspaceId=w1');
    await field('Name').fill('Biology updated'); await button('Save changes').click();
    await page.waitForURL('**/mobile/84');
    assert.equal((await state()).workspaces[0].instructions, 'Keep this instruction');
    assert.equal((await state()).workspaces[0].display_name, 'Biology updated');
    await button('New workspace').click(); await field('Name').fill('Chemistry'); await button('Save changes').click();
    await page.waitForURL('**/mobile/84'); assert.ok((await state()).workspaces.some(row => row.display_name === 'Chemistry'));

    await visit('/mobile/74'); await field('Name').fill('study'); await field('Content').fill('Explain step by step'); await button('Save changes').click();
    await page.waitForURL('**/mobile/73'); assert.equal((await state()).skills[0].content, 'Explain step by step');
    await button('study').click(); await field('Content').fill('Use examples'); await button('Save changes').click();
    await page.waitForURL('**/mobile/73'); assert.equal((await state()).skills[0].content, 'Use examples');

    await visit('/mobile/76'); await field('Name').fill('notes'); await field('API URL').fill('https://mcp.example.test/mcp');
    await Promise.all([page.waitForResponse(response => response.url().includes('/api/space/mcp/servers/notes') && response.request().method() === 'PUT'), button('Save changes').click()]);
    assert.equal((await state()).servers.notes.url, 'https://mcp.example.test/mcp');

    await visit('/mobile/90'); await field('Name').fill('Test connection'); await field('API URL').fill('https://api.example.test/v1'); await field('API key').fill('temporary-test-key');
    await Promise.all([page.waitForResponse(response => response.url().includes('/api/settings/apply/registry') && response.request().method() === 'POST'), button('Save changes').click()]);
    const connection = (await state()).catalog.connections[0]; assert.equal(connection.name, 'Test connection');
    await visit('/mobile/92'); await choose('Provider', 'Test connection'); await field('Model name').fill('test-new-model'); await field('Display name').fill('New model');
    await Promise.all([page.waitForResponse(response => response.url().includes('/api/settings/apply/registry') && response.request().method() === 'POST'), button('Save changes').click()]);
    assert.ok((await state()).catalog.services.llm.profiles.some(row => row.models.some(model => model.model === 'test-new-model')));

    await visit('/mobile/67'); await field('Name').fill('Ada'); await button('Save changes').click();
    await page.waitForURL(/partnerId=/); const partnerId = new URL(page.url()).searchParams.get('partnerId');
    assert.ok(partnerId); assert.equal((await state()).partners[0].start, false);
    await visit(`/mobile/68?partnerId=${partnerId}`); await field('Content').fill('Teach with examples'); await button('Save changes').click();
    await page.getByText('Changes saved', { exact: true }).waitFor(); assert.equal((await state()).partners[0].soul, 'Teach with examples');
    await visit(`/mobile/69?partnerId=${partnerId}`); await choose('Model', 'Test model');
    await button('Save changes').first().click();
    await page.getByText('Changes saved', { exact: true }).waitFor(); assert.equal((await state()).partners[0].llm_selection.model_id, 'm1');
    await visit(`/mobile/70?partnerId=${partnerId}`); await button('Save changes').waitFor();

    await visit('/mobile/86');
    await choose('Target workspace', 'Biology updated');
    await page.getByRole('switch', { name: 'Conversations', exact: true }).click();
    await button('Review migration').click(); await button('Confirm migration').waitFor();
    assert.equal((await state()).requests.filter(req => req.path.endsWith('/data/migrate')).length, 0);
    await button('Confirm migration').click();
    await page.getByText('Status: completed', { exact: true }).waitFor();
    assert.equal((await state()).requests.filter(req => req.path.endsWith('/data/migrate')).length, 1);

    await visit('/mobile/104');
    await Promise.all([page.waitForResponse(response => response.url().endsWith('/api/settings/enabled-tools')), page.getByRole('switch', { name: 'web_search' }).click()]);
    assert.ok((await state()).requests.some(req => req.path === '/api/settings/enabled-tools' && req.body.enabled_tools.includes('web_search')));

    await visit('/mobile/110'); await field('Username or email').fill('student'); await field('Password').fill('test-password'); await button('Save changes').click();
    await page.waitForURL('**/mobile/109');
    assert.ok((await state()).requests.some(req => req.path === '/api/auth/users' && req.method === 'POST' && req.body.preset === 'standard'));

    await visit('/mobile/139'); await field('Public origin').fill('https://public.example.test'); await button('Save changes').click();
    await page.getByText('https://public.example.test/handoff?code=one-time', { exact: true }).waitFor();

    await visit('/chat/s1'); await button('Conversation actions').click(); await button('Rename chat').click();
    await field('Session title').fill('Renamed through API'); await button('Save').click();
    await page.getByRole('heading', { name: 'Renamed through API' }).waitFor();
    assert.equal((await state()).session.title, 'Renamed through API');
    await button('Conversation actions').click();
    await Promise.all([page.waitForResponse(response => response.url().includes('/organization')), button('Pin').click()]);
    assert.equal((await state()).session.preferences.pinned, true);
    await button('Conversation actions').click(); await button('Archive').click();
    await page.waitForURL('**/mobile/27'); assert.equal((await state()).session.preferences.archived, true);
    await visit('/chat/s1'); await button('Conversation actions').click(); await button('Delete chat').click();
    await button('Delete').click(); await page.waitForURL('**/mobile/27');
    assert.ok((await state()).requests.some(req => req.method === 'DELETE' && req.path === '/api/sessions/s1' && req.query.dt_workspace === ''));
    await page.goto(`${base}/mobile/16`); await page.getByRole('button', { name: 'Explain', exact: true }).last().waitFor();
    await page.goto(`${base}/mobile/18`); await page.getByText('Test model', { exact: true }).last().waitFor();
    await page.goto(`${base}/mobile/17`); await page.getByText('No resources selected.', { exact: true }).waitFor();

    for (const screen of [61, 66, 72, 73, 75, 77, 81, 84, 88, 89, 91, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 109, 113, 114, 116, 118, 119, 120, 121, 122, 141, 142, 143, 144, 145, 146]) {
      await visit(`/mobile/${screen}`);
      await page.waitForTimeout(150);
      assert.ok(!await page.getByText('Unmodeled:', { exact: false }).count(), `Unmodeled screen ${screen}`);
    }
    await visit('/mobile/88'); await page.getByText('Total tokens: 452', { exact: true }).waitFor();
    assert.ok((await state()).requests.some(req => req.path === '/api/settings/usage' && req.query.year));
    assert.deepEqual(errors, []); assert.deepEqual(uncovered, []);
    console.log('PASS: mobile settings failures/retry, workspace writes, playbook create/edit, MCP, providers, migration review/confirm, tools, users, handoff and direct routes');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
