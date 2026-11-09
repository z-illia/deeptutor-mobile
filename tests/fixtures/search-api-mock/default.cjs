// HTTP stand-in from the sessions, mastery-paths and partner-navigation source contracts.
const http = require('node:http');
let options = {}, requests = [];
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost'), path = url.pathname;
  const reply = (status, data) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
  const chunks = []; for await (const chunk of req) chunks.push(chunk);
  const body = req.body ?? (chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {});
  if (path === '/__test/reset') { options = {}; requests = []; return reply(200, {}); }
  if (path === '/__test/config') { options = body; return reply(200, {}); }
  if (path === '/__test/state') return reply(200, { requests, options });
  if (path === '/api/auth/status') return reply(200, { enabled: true, authenticated: true });
  if (path === '/api/auth/profile') return reply(200, { id: options.user || 'search-user', username: 'Search user', role: 'user', avatar: '', created_at: '', must_change_password: false, can_change_password: false });
  if (path === '/api/settings') return reply(200, { ui: { language: 'en', theme: 'system', response_language: 'en' } });
  if (path === '/api/settings/draft') return reply(200, { draft: null });
  if (path === '/api/settings/workspace/registrations') return reply(200, { workspaces: [{ workspace_id: 'workspace-b', display_name: 'Workspace B', archived: false }] });
  if (path === '/api/settings/llm-options') return reply(200, { options: [], active: null });
  const workspace = url.searchParams.get('dt_workspace');
  if (['/api/sessions/search', '/api/sessions', '/api/mastery-paths/topics'].includes(path) && workspace === null) return reply(400, { detail: 'Missing dt_workspace' });
  requests.push({ path, query: Object.fromEntries(url.searchParams) });
  const configuration = { ...options };
  if (path === '/api/partners/navigation') {
    if (configuration.failure === 'partners') return reply(503, { detail: 'Partner service unavailable' });
    return reply(200, { partners: [{ partner_id: 'partner / real', name: 'Equation coach', description: 'Geometry' }], groups: [{ group_id: 'group-real', name: 'Equation group' }], sessions: [], unavailable: [] });
  }
  if (path === '/api/mastery-paths/topics') return reply(200, { topics: [{ path_id: workspace ? 'path-b' : 'path-real', name: workspace ? 'Workspace B path' : 'Equation learning', content_workspace_id: workspace, metadata: { goal: 'Study geometry', description: '' } }] });
  if (path === '/api/sessions/search' || path === '/api/sessions') {
    if (configuration.failure === 'sessions') return reply(503, { detail: 'Search service unavailable' });
    if (configuration.failure === 'unauthorized') return reply(401, { detail: 'Not authenticated' });
    if (configuration.failure === 'missing') return reply(404, { detail: 'Not Found' });
    if (configuration.failure === 'malformed') return reply(200, { sessions: 'invalid' });
    const q = url.searchParams.get('q') || '', offset = Number(url.searchParams.get('offset') || 0), limit = Number(url.searchParams.get('limit') || 50);
    if (q === 'slow') await new Promise(resolve => setTimeout(resolve, 900));
    if (q.length > 200) return reply(422, { detail: [] });
    if (path.endsWith('/search') && !q.trim()) return reply(400, { detail: 'Search query cannot be empty' });
    const rows = q === 'nothing-matches' ? [] : Array.from({ length: q === 'equation' ? 55 : 1 }, (_, i) => ({ session_id: `${workspace || 'general'}-${q || 'recent'}-${i}`, title: `${workspace ? 'Workspace B' : 'Server'} ${q || 'recent'} ${i}`, match_excerpt: `A remembered ${q} inside a persisted message`, content_workspace_id: workspace, preferences: {} }));
    return reply(200, path.endsWith('/search') ? { sessions: rows.slice(offset, offset + limit), total: rows.length, limit, offset } : { sessions: rows.slice(offset, offset + limit) });
  }
  if (/^\/api\/sessions\/[^/]+$/.test(path)) return reply(200, { session_id: decodeURIComponent(path.split('/').pop()), title: 'Selected search conversation', messages: [] });
  if (path === '/api/notebooks') return reply(200, { notebooks: [] });
  return reply(501, { detail: 'Not covered by search verification' });
}).listen(process.env.PORT || 4500);
