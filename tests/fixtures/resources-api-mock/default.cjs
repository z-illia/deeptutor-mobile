const http = require('node:http');
let options = {}, requests = [];
const items = n => Array.from({ length: n }, (_, i) => ({ id: String(i), name: `Item ${i}` }));
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost'), path = url.pathname;
  const chunks = []; for await (const chunk of req) chunks.push(chunk);
  const body = req.body ?? (chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {});
  const reply = (code, data) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
  if (path === '/__test/reset') { options = {}; requests = []; return reply(200, {}); }
  if (path === '/__test/config') { options = body; return reply(200, {}); }
  if (path === '/__test/state') return reply(200, { options, requests });
  if (path === '/api/auth/status') return reply(200, { enabled: true, authenticated: true });
  if (path === '/api/auth/profile') return reply(200, { id: options.user || 'resource-user', username: 'Resource user', role: 'user', avatar: '', created_at: '', must_change_password: false });
  if (path === '/api/settings') return reply(200, { ui: { language: 'en', theme: 'system' } });
  if (path === '/api/settings/draft') return reply(200, { draft: null });
  if (path === '/api/settings/workspace/registrations') return reply(200, { workspaces: [{ workspace_id: 'b', display_name: 'Workspace B', archived: false }] });
  if (path === '/api/settings/llm-options') return reply(200, { options: [], active: null });
  const settings = { ...options }, workspace = url.searchParams.get('dt_workspace');
  requests.push({ path, query: Object.fromEntries(url.searchParams) });
  if (['/api/sessions', '/api/notebooks', '/api/knowledge-bases/list', '/api/question-notebook/entries'].includes(path) && workspace === null) return reply(400, { detail: 'Missing dt_workspace' });
  if (settings.slow === path) await new Promise(resolve => setTimeout(resolve, 1200));
  if (settings.failure === path) return reply(settings.forbidden ? 403 : 503, { detail: 'Resource service unavailable' });
  if (settings.malformed === path) return reply(200, {});
  if (path === '/api/sessions') {
    const sessions = workspace ? [] : Array.from({ length: 205 }, (_, i) => ({ session_id: String(i), content_workspace_id: workspace, preferences: { archived: i === 0, parent_session_id: i === 1 ? 'root' : null } }));
    const offset = Number(url.searchParams.get('offset') || 0), limit = Number(url.searchParams.get('limit') || 50);
    return reply(200, { sessions: sessions.slice(offset, offset + limit) });
  }
  if (path === '/api/notebooks') return reply(200, { notebooks: items(workspace ? 0 : 3) });
  if (path === '/api/knowledge-bases/list') return reply(200, items(workspace ? 0 : 4));
  if (path === '/api/question-notebook/entries') return reply(200, { total: workspace ? 0 : 301, entries: [] });
  if (path === '/api/partners/navigation') return reply(200, { partners: items(4), groups: [], sessions: [], unavailable: [] });
  if (path === '/api/personas') return reply(200, { personas: items(settings.user ? 1 : settings.updated ? 9 : 7) });
  if (path === '/api/skills/list') return reply(200, { skills: items(settings.zero ? 0 : 11) });
  if (path === '/api/space/mcp/servers') return reply(200, { servers: { one: {}, two: {} }, deployment: { servers: items(20) } });
  if (path === '/api/space/cli-apps/apps') return reply(200, { apps: [{ granted: true, enabled: true }, { granted: false, enabled: true }, { granted: true, enabled: false }] });
  if (path === '/api/subagents/connections') return reply(200, { connections: items(3) });
  if (path === '/api/mastery-paths/topics') return reply(200, { topics: [] });
  return reply(501, { detail: 'Not covered by resource-counter verification' });
}).listen(process.env.PORT || 4500);
