// The real Expo app, route, hooks, Markdown parser, MathJax and react-native-svg.
// API/WebSocket fixtures are isolated to this browser context; no server data is modified.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { createLoader } = require('../helpers/rich-markdown.cjs');
const { contentFingerprint, RICH_RENDERER_VERSION } = createLoader()('src/shared/markdown/diagnostics.ts');
const conversation = require('../fixtures/study-math-conversation.json');
const source = conversation.messages[1].content;
const mathStart = source.indexOf('$$\n') + 3;
const formula = source.slice(mathStart, source.indexOf('\n$$', mathStart));
const base = process.env.STUDY_BASE_URL || 'http://expo.deeptutor.local:3000';
const output = process.env.STUDY_MATH_OUTPUT_DIR || '/tmp/deeptutor-study-math-runtime';
const topic = { path_id: 'fixture-topic', name: 'Math verification', metadata: {}, sources: [], session_count: 1, map: { counts: { mastered: 0, total: 1 }, modules: [{ id: 'fixture-module', knowledge_points: [{ id: 'fixture-point', status: 'learning' }] }] }, next: { action: 'study', knowledge_point_id: 'fixture-point', knowledge_point_name: 'Health-check latency', session_id: conversation.session_id }, reviews: [] };
(async () => {
 fs.mkdirSync(output, { recursive: true });
 const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
 const reports = [];
 try {
  for (const streaming of [false, true]) {
   const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
   await context.addInitScript(() => {
    localStorage.setItem('deeptutor-api-server', location.origin);
    localStorage.setItem('deeptutor-mobile-local-v1', JSON.stringify({ state: { theme: 'dark', language: 'en', layout: 'modern', values: {}, tasks: {}, notes: {} }, version: 1 }));
   });
   await context.route('**/api/**', route => {
    const url = new URL(route.request().url()); const endpoint = url.pathname.replace(/^\/api/, '');
    assert.equal(route.request().method(), 'GET', 'runtime verification must not mutate backend data');
    let data;
    if (endpoint === '/auth/status') data = { enabled: true, authenticated: true };
    else if (endpoint === '/auth/profile') data = { id: 'fixture-user', username: 'fixture', role: 'user', avatar: '', created_at: '', must_change_password: false };
    else if (endpoint === '/settings/llm-options') data = { options: [], active: null };
    else if (endpoint === '/sessions/' + conversation.session_id) data = streaming ? { ...conversation, messages: conversation.messages.slice(0, 1) } : conversation;
    else if (endpoint === '/mastery-paths/topics/fixture-topic') data = topic;
    else if (endpoint === '/settings/workspace/registrations') data = { workspaces: [] };
    else return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
   });
   let streamed = '';
   await context.routeWebSocket(/\/ws(?:\?|$)/, socket => socket.onMessage(raw => {
    const command = JSON.parse(String(raw));
    if (command.type === 'check_active_turn') socket.send(JSON.stringify({ protocol_version: '2.0', type: 'active_turn_info', status: streaming ? 'running' : 'completed', ...(streaming ? { turn_id: 'fixture-turn' } : {}) }));
    if (command.type === 'subscribe_turn') {
     let seq = 0;
     for (let i = 0; i < source.length; i += 13) {
      const chunk = source.slice(i, i + 13); streamed += chunk;
      socket.send(JSON.stringify({ protocol_version: '2.0', type: 'content', turn_id: 'fixture-turn', seq: ++seq, content: chunk }));
     }
    }
   }));
   const page = await context.newPage(); const errors = [];
   page.on('pageerror', error => errors.push(error.message));
   page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
   await page.goto(base + '/learning/live?view=study&workspace=fixture-workspace&pathId=fixture-topic&sessionId=' + conversation.session_id);
   await page.getByRole('textbox', { name: 'Your answer', exact: true }).waitFor({ timeout: 90000 });
   const equation = page.locator('svg[aria-label*="health-check latency"]');
   await equation.waitFor({ timeout: 30000 }).catch(async error => {
    console.error(JSON.stringify({ streaming, errors, trace: await page.evaluate(() => globalThis.__DEEPTUTOR_RICH_CONTENT__), fixtureScreen: await page.locator('body').innerText() }));
    await page.screenshot({ path: path.join(output, 'failure.png') });
    throw error;
   });
   assert.equal(await equation.getAttribute('aria-label'), formula);
   assert.ok(await equation.locator('path').count() > 0);
   assert.equal(await page.locator('body').innerText().then(text => text.includes('\\text{')), false);
   assert.equal(await page.getByRole('heading', { name: 'Latency model' }).count(), 1);
   assert.equal(await page.getByRole('link', { name: 'Documentation' }).count(), 1);
   assert.equal(await page.getByRole('button', { name: 'Copy code block' }).count(), 1);
   const trace = await page.evaluate(() => globalThis.__DEEPTUTOR_RICH_CONTENT__);
   assert.equal(trace.version, RICH_RENDERER_VERSION);
   assert.ok(trace.events.some(event => event.stage === 'renderer-mounted' && event.fingerprint === contentFingerprint(source) && event.mathNodes === 1));
   assert.ok(trace.events.some(event => event.stage === 'math-svg-ready' && event.fingerprint === contentFingerprint(formula)));
   assert.equal(trace.events.filter(event => event.stage.endsWith('failed')).length, 0);
   assert.deepEqual(errors, []);
   if (streaming) assert.equal(streamed, source);
   await equation.scrollIntoViewIfNeeded();
   await page.screenshot({ path: path.join(output, streaming ? 'study-streaming.png' : 'study-persisted.png') });
   reports.push({ streaming, version: trace.version, rendererMounted: true, mathAstNodes: 1, exactMathInput: true, svgDisplayed: true, rawLatexVisible: false, errors });
   await context.close();
  }
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(reports, null, 2));
  console.log(JSON.stringify(reports));
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
