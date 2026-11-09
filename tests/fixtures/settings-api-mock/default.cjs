// Client verification double of settings.py. No real accounts or credentials.
const http = require('node:http');
const baseline = { theme: 'snow', language: 'en', response_language: 'pl', content_font_scale: 100, content_line_spacing: 'normal', code_block_theme: 'oneDark', code_block_show_line_numbers: false, code_block_wrap_long_lines: false, sidebar_description: 'Keep live sidebar' };
let users, user, options, uiWrites, draftWrites;
function reset() { users = {}; user = 'settings-user'; options = {}; uiWrites = []; draftWrites = []; }
reset();
http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const reply = (code, data) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
  const chunks = []; for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
  if (path === '/__test/reset') { reset(); return reply(200, { ok: true }); }
  const account = () => users[user] ??= { ui: { ...baseline }, draft: { catalog: null, extensions: { tools: { enabled: ['search'] }, ui: { sidebar_description: 'Keep draft sidebar' } } } };
  if (path === '/__test/config') {
    options = body;
    if (body.user) user = body.user;
    if (body.externalDraft) account().draft.extensions.ui.theme = 'glass';
    return reply(200, { ok: true });
  }
  if (path === '/__test/state') return reply(200, { user, ...account(), uiWrites, draftWrites });
  if (path === '/api/auth/status') return reply(200, { enabled: true, authenticated: true });
  if (path === '/api/auth/profile') return reply(200, { id: user, username: user, role: 'user', avatar: '', created_at: '', must_change_password: false, can_change_password: false });
  if (path === '/api/settings/workspace/registrations') return reply(200, { workspaces: [{ workspace_id: 'workspace-b', display_name: 'Workspace B', archived: false }] });
  if (path === '/api/settings/llm-options') return reply(200, { options: [], active: null });
  if (path === '/api/sessions/seed-session') return reply(200, { session_id: 'seed-session', title: 'Settings sample', messages: [{ id: 1, role: 'user', content: 'Show sample', parent_message_id: null }, { id: 2, role: 'assistant', content: 'Learning sample\n\n```js\nconst message = "A long line to verify wrapping across the mobile code block and preserve the original source";\nconsole.log(message);\n```', parent_message_id: 1 }] });
  if (path === '/api/mastery-paths/topics') return reply(200, { topics: [] });
  const fail = () => reply(503, { detail: 'Test settings unavailable' });
  if (path === '/api/settings' && req.method === 'GET') { if (options.failure === 'load') return fail(); return reply(200, { ui: account().ui }); }
  if (path === '/api/settings/draft') {
    if (req.method === 'GET') return reply(200, { draft: account().draft });
    if (options.failure === 'save' || (options.failure === 'clear' && !body.extensions?.ui?.theme)) return fail();
    if (req.method === 'DELETE') { account().draft = null; return reply(200, { draft: null }); }
    if (req.method === 'PUT') {
      // Personal preferences must work for a non-admin without a model catalog.
      if (body.catalog) return reply(403, { detail: 'Catalog changes require admin' });
      draftWrites.push(structuredClone(body));
      account().draft = body.catalog || Object.keys(body.extensions).length ? body : null;
      return reply(200, { draft: account().draft });
    }
  }
  if (path === '/api/settings/ui' && req.method === 'PUT') {
    if (options.failure === 'ui') return fail();
    if ('layout' in body || 'cream' === body.theme) return reply(422, { detail: 'Invalid UI contract' });
    uiWrites.push(structuredClone(body)); Object.assign(account().ui, body);
    return reply(200, account().ui);
  }
  if (path === '/api/settings/apply') return reply(403, { detail: 'Personal settings must not apply the catalog' });
  return reply(501, { detail: 'Not covered by settings verification' });
}).listen(process.env.PORT || 4500, '127.0.0.1');
