/* Run against Expo web with a contract-based browser stand-in; no live inference. */
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || undefined, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(() => localStorage.setItem('deeptutor-mobile-local-v1', JSON.stringify({ state: { theme: 'dark', language: 'en', layout: 'modern' }, version: 1 })));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let saved = { session_id: 'chat-network-check', title: 'Network integration', messages: [], preferences: {} };
    const commands = [];
    let turn = 0;
    let seq = 0;
    let currentSocket;
    let pending;
    let recovering = false;
    const emit = (type, content = '', metadata = {}) => currentSocket.send(JSON.stringify({ protocol_version: '2.0', type, content, metadata, session_id: saved.session_id, turn_id: `turn-${turn}`, seq: ++seq }));
    await page.route('**/api/**', async route => {
      const url = new URL(route.request().url());
      let body;
      if (url.pathname === '/api/auth/status') body = { enabled: false, authenticated: false };
      else if (url.pathname === '/api/settings/llm-options') body = { options: [{ profile_id: 'profile-1', model_id: 'model-1', model_name: 'Contract test model', is_active_default: true }], active: { profile_id: 'profile-1', model_id: 'model-1' } };
      else if (url.pathname === '/api/skills/list') body = { skills: [{ name: 'pdf', description: 'Document skill' }] };
      else if (url.pathname === '/api/personas') body = { personas: [{ name: 'teacher' }] };
      else if (url.pathname === '/api/settings/mcp') body = { servers: { docs: { enabled: true } }, status: [] };
      else if (url.pathname === '/api/partners') body = [{ id: 'p1', name: 'Study partner' }];
      else if (url.pathname === '/api/sessions') body = { sessions: saved.messages.length ? [{ ...saved, messages: undefined }] : [] };
      else if (url.pathname === `/api/sessions/${saved.session_id}`) body = saved;
      else return route.fulfill({ status: 501, json: { detail: `Unmodelled request: ${url.pathname}` } });
      await route.fulfill({ status: 200, json: body });
    });
    await page.routeWebSocket('**/ws', socket => {
      currentSocket = socket;
      socket.onMessage(raw => {
        const command = JSON.parse(String(raw)); commands.push(command);
        assert.equal(command.protocol_version, '2.0');
        if (command.type === 'check_active_turn') socket.send(JSON.stringify({ protocol_version: '2.0', type: 'active_turn_info', turn_id: recovering ? `turn-${turn}` : '', status: recovering ? 'running' : 'none' }));
        else if (command.type === 'subscribe_turn') {
          assert.equal(command.turn_id, `turn-${turn}`);
          emit('content', pending.content); saved.messages.push(pending); pending = null; recovering = false; emit('done', '', { status: 'completed' });
        }
        else if (command.type === 'start_turn') {
          turn++; seq = 0;
          if (turn === 1) {
            assert.equal(command.capability, 'solve');
            assert.deepEqual(command.skills, ['pdf']);
            assert.deepEqual(command.mcp, ['docs']);
            assert.equal(command.persona, 'teacher');
            assert.equal(command.answer_by, 'partner:p1');
            assert.equal(command.create_target, 'skill');
          }
          saved.preferences = { ...saved.preferences, ...Object.fromEntries(['capability', 'skills', 'mcp', 'persona', 'answer_by', 'create_target', 'llm_selection'].filter(key => key in command).map(key => [key, command[key]])) };
          assert.deepEqual(command.llm_selection, { profile_id: 'profile-1', model_id: 'model-1' });
          assert.equal(command.session_id, turn === 1 ? null : saved.session_id);
          if (turn > 1) assert.equal(command.parent_message_id, saved.messages.at(-1).id);
          const userId = saved.messages.length + 1;
          saved.messages.push({ id: userId, parent_message_id: command.parent_message_id ?? null, role: 'user', content: command.content });
          emit('session'); emit('content', 'Streaming');
          pending = { id: userId + 1, parent_message_id: userId, role: 'assistant', content: 'Streaming response from server' };
        } else if (command.type === 'cancel_turn') {
          assert.equal(command.turn_id, `turn-${turn}`);
          saved.messages.push({ ...pending, content: 'Streaming' }); pending = null;
          emit('done', '', { status: 'cancelled' });
        }
      });
    });
    await page.goto(`${process.env.BASE_URL || 'http://localhost:8102'}/chat`);
    const input = page.getByLabel('Message', { exact: true });
    await input.waitFor({ timeout: 90000 });
    await page.getByRole('button', { name: 'Contract test model', exact: true }).waitFor();
    await page.screenshot({ path: '/tmp/deeptutor-tutor-empty.png' });
    await page.getByRole('button', { name: 'Contract test model', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Contract test model', exact: true }).click();
    for (const name of ['Explain', 'Solve', 'Practice', 'Plan', 'Research']) {
      await page.getByRole('button', { name, exact: true }).click();
      await page.getByRole('dialog').getByRole('button').nth(1).click();
      assert.ok((await input.inputValue()).length > 30);
      await input.fill('');
    }
    await page.getByRole('button', { name: 'Mode', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Solve', exact: true }).click();
    for (const [name, option] of [['Skills', 'pdf'], ['Connections', 'docs']]) {
      await page.getByRole('button', { name, exact: true }).click();
      await page.getByRole('button', { name: option, exact: true }).click();
      await page.getByRole('button', { name: 'Apply choices', exact: true }).click();
    }
    for (const [name, option] of [['Preferences', 'teacher'], ['Partners', 'Study partner'], ['Create', 'Skill']]) {
      await page.getByRole('button', { name: 'More tools', exact: true }).click();
      await page.getByRole('button', { name, exact: true }).click();
      await page.getByRole('button', { name: option, exact: true }).click();
      if (name !== 'Create') await page.getByRole('button', { name: 'Apply choices', exact: true }).click();
    }
    await input.fill('One\nTwo\nThree\nFour\nFive');
    const growing = await input.boundingBox();
    assert.ok(growing.height > 64 && growing.height <= 160);
    await input.press('Enter');
    assert.equal(commands.length, 0, 'Enter inserts a newline without sending');
    await page.setViewportSize({ width: 390, height: 540 });
    const sendBounds = await page.getByRole('button', { name: 'Send', exact: true }).boundingBox();
    assert.ok(sendBounds.y + sendBounds.height <= 540);
    await page.setViewportSize({ width: 390, height: 844 });
    await input.fill('Explain the event loop');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await page.getByText('Streaming', { exact: true }).waitFor();
    emit('content', ' response from server');
    saved.messages.push(pending); pending = null;
    emit('done', '', { status: 'completed' });
    await page.waitForURL('**/chat/chat-network-check');
    await page.getByText('Streaming response from server', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Recent conversations', exact: true }).click();
    await page.getByRole('button', { name: 'Network integration', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await input.fill('Continue and stop');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await page.getByRole('button', { name: 'Stop response', exact: true }).click();
    await page.getByRole('button', { name: 'Stop response', exact: true }).waitFor({ state: 'hidden' });
    await page.reload();
    await page.getByText('Continue and stop', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Contract test model', exact: true }).waitFor();
    await input.fill('Recover after disconnect');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await page.getByRole('button', { name: 'Stop response', exact: true }).waitFor();
    recovering = true; currentSocket.close({ code: 1011, reason: 'Test disconnect' });
    await page.getByText('Connection lost. Reopen the conversation to recover the response.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Reload conversation', exact: true }).click();
    await page.getByRole('button', { name: 'Stop response', exact: true }).waitFor({ state: 'hidden' });
    await page.getByText('Streaming response from server', { exact: true }).nth(1).waitFor();
    await page.screenshot({ path: process.env.SCREENSHOT_PATH || '/tmp/deeptutor-live-chat.png', fullPage: true });
    assert.equal(commands.filter(command => command.type === 'start_turn').length, 3);
    assert.equal(commands.filter(command => command.type === 'cancel_turn').length, 1);
    assert.deepEqual(errors, []);
    console.log('PASS: mobile viewport streamed response, model IDs, persisted branch parent, history, cancellation, reload, disconnect/replay without resending; browser stand-in, no live inference');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
