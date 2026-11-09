const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.FAVORITES_BASE_URL || 'http://localhost:8099';
const simulation = process.env.FAVORITES_SIM_URL;
assert.ok(simulation, 'Provide FAVORITES_SIM_URL including its routeKey.');

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(server => localStorage.setItem('deeptutor-api-server', server), base);
    const config = data => context.request.post(`${simulation}/__test/config`, { data });
    const state = async () => (await context.request.get(`${simulation}/__test/state`)).json();
    assert.equal((await context.request.post(`${simulation}/__test/reset`)).status(), 200);
    const requests = [];
    await context.route('**/api/**', async route => {
      const request = route.request(); const url = new URL(request.url()); requests.push(url);
      const response = await context.request.fetch(`${simulation}${url.pathname}${url.search}`, {
        method: request.method(), data: request.postDataBuffer() ?? undefined,
        headers: request.postDataBuffer() ? { 'content-type': 'application/json' } : {},
      });
      await route.fulfill({ response });
    });
    // The saved-session read uses the real hook; only its WebSocket peer is a
    // local protocol double. All favorites HTTP traffic reaches the simulation.
    await context.routeWebSocket(url => new URL(url).pathname === '/ws', socket => {
      socket.onMessage(raw => {
        const command = JSON.parse(String(raw));
        if (command.type === 'check_active_turn') socket.send(JSON.stringify({ protocol_version: '2.0', type: 'active_turn_info', status: 'idle' }));
      });
    });
    const page = await context.newPage(); const errors = [];
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    const copy = require('../../src/i18n/locales/en.json');
    const button = name => page.getByRole(name.startsWith('Select target collection ') ? 'radio' : name.startsWith('Select collection ') ? 'checkbox' : 'button', { name: copy[name] ?? name, exact: true });
    const input = name => page.getByLabel(copy[name] ?? name, { exact: true });
    await config({ failure: 'list' });
    await page.goto(`${base}/mobile/31`);
    await page.waitForURL('**/mobile/31');
    await page.getByText('Test service unavailable', { exact: true }).waitFor({ timeout: 60000 });
    await config({}); await button('Retry loading Favorites').click();
    await button('Open collection Source').waitFor({ timeout: 60000 });
    assert.equal(requests.filter(url => /^\/api\/notebooks\/[^/]+$/.test(url.pathname)).length, 0, 'Index must not fetch every detail');
    await button('New notebook').click();
    await input('Collection Name').fill('Created');
    await config({ failure: 'create' }); await button('Save collection metadata').click();
    await page.getByText('Test service unavailable', { exact: true }).first().waitFor();
    assert.equal(await input('Collection Name').inputValue(), 'Created');
    await config({}); await button('Save collection metadata').click();
    await button('Open collection Created').waitFor();
    await button('Edit collection Created').click();
    await input('Collection Name').fill('Renamed'); await button('Save collection metadata').click();
    await button('Open collection Renamed').waitFor();
    await page.reload(); await button('Open collection Renamed').waitFor();
    await button('Open collection Source').click();
    await button('Toggle favorite record Seed favorite').waitFor();
    await button('Toggle favorite record Seed favorite').click();
    await button('Edit details for Seed favorite').click();
    await input('Favorite Title').fill('Edited favorite'); await input('Summary / Annotation').fill('New annotation');
    await button('Save favorite details').click();
    await button('Toggle favorite record Edited favorite').waitFor();
    assert.equal((await state()).stores[''].source.records[0].output, '**Original snapshot**');
    assert.equal((await state()).stores[''].source.records[0].kb_name, 'Knowledge');
    await button('Copy Edited favorite').click(); await button('Select target collection Target').click();
    await button('Confirm relocate favorite').click();
    await button('Confirm relocate favorite').waitFor({ state: 'hidden' });
    let stored = await state();
    assert.equal(stored.stores[''].target.records.length, 1);
    assert.notEqual(stored.stores[''].target.records[0].id, 'r1');
    await button('Move Edited favorite').click(); await button('Select target collection Target').click();
    await button('Confirm relocate favorite').click();
    await button('Toggle favorite record Edited favorite').waitFor({ state: 'hidden' });
    await page.goto(`${base}/notebooks/source?recordId=r1`);
    await page.waitForURL('**/mobile/31?notebookId=target&recordId=r1');
    await button('Export Markdown').click();
    await button('Close').waitFor(); await button('Close').click();
    await button('Use Edited favorite in Chat').click();
    await page.waitForURL('**/chat?*');
    await button('Saved Original · Remove').waitFor();
    await page.goto(`${base}/chat/seed-session`);
    await button('Save to Favorites').waitFor();
    await button('Save to Favorites').click();
    await button('Create new collection inline').click();
    await input('New collection name').fill('Inline'); await button('Confirm create collection').click();
    await button('Select collection Inline').waitFor();
    await button('Select collection Source').click(); await button('Select collection Target').click();
    await input('Snapshot Title').fill('Saved transcript'); await input('Snapshot Summary').fill('Authored annotation');
    await config({ failure: 'save' }); await button('Confirm Save to Favorites').click();
    await page.getByText('Test service unavailable', { exact: true }).waitFor();
    assert.equal((await state()).saves.length, 0);
    await config({ partial: true }); await button('Confirm Save to Favorites').click();
    await page.getByText('Some collections were not saved. Retry the remaining selections.', { exact: true }).waitFor();
    await config({}); await button('Confirm Save to Favorites').click();
    await button('Done saving favorite').waitFor(); await button('Done saving favorite').click();
    stored = await state();
    assert.equal(stored.saves.length, 2);
    assert.equal(stored.saves[1].notebook_ids.some(id => stored.saves[0].added_to_notebooks.includes(id)), false);
    assert.equal(stored.saves[1].record.output, '## User\nQuestion\n\n## Assistant\n**Original snapshot**');
    await page.goto(`${base}/notebooks/target`);
    await button('Toggle favorite record Saved transcript').waitFor();
    await button('Toggle favorite record Saved transcript').click();
    await config({ failure: 'record' }); await button('Delete Saved transcript').click(); await button('Delete').click();
    await page.getByText('Test service unavailable', { exact: true }).first().waitFor();
    assert.ok((await state()).stores[''].target.records.some(item => item.title === 'Saved transcript'));
    await config({}); await button('Delete').click();
    await button('Toggle favorite record Saved transcript').waitFor({ state: 'hidden' });
    await page.reload(); await button('Delete collection').waitFor();
    assert.equal(await button('Toggle favorite record Saved transcript').count(), 0);
    await button('Delete collection').click(); await config({ failure: 'delete' });
    await button('Delete').click();
    await page.getByText('Test service unavailable', { exact: true }).first().waitFor();
    assert.ok((await state()).stores[''].target);
    await config({}); await button('Delete').click();
    await page.waitForURL('**/mobile/31');
    await page.goto(`${base}/notebooks/broken`);
    await page.getByText('This collection is unreadable. Restore a backup or delete it.', { exact: true }).waitFor();
    await button('Delete collection').click(); await button('Delete').click();
    await page.waitForURL('**/mobile/31');
    await page.goto(`${base}/mobile/62`);
    await button('Workspace B').click().catch(async error => { await page.screenshot({ path: '/tmp/favorites-workspace-failure.png' }); console.error({ url: page.url(), body: await page.locator('body').innerText(), errors }); throw error; }); await button('Use selected workspace').click(); await page.waitForURL('**/learning');
    await page.goto(`${base}/notebooks`);
    await button('Create first collection').waitFor();
    assert.equal(await button('Open collection Source').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log('Passed: server CRUD, immutable records, copy/move, moved deep links, export, chat references, saving conversations, partial retry without duplicates, failed delete recovery, corrupt collection recovery, workspace isolation, mobile layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
