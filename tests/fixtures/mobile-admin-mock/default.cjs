const http = require('node:http');
let requests = [], failure = '', counter = 0;
let workspaces = [{ workspace_id: 'w1', display_name: 'Biology', instructions: 'Keep this instruction', archived: false }];
let skills = [], personas = [], partners = [], groups = [], servers = {}, connections = [];
let attachments = { max_file_mb: 20, max_total_mb: 50, max_chars_per_doc: 12000, max_chars_total: 30000 };
let catalog = { connections: [], services: Object.fromEntries(['llm', 'task', 'embedding', 'search', 'tts', 'stt', 'imagegen', 'videogen'].map(key => [key, { profiles: [{ id: 'p1', name: 'Test provider', models: [{ id: 'm1', model: 'test-model', display_name: 'Test model' }] }] }])) };
const session = { session_id: 's1', title: 'Existing conversation', content_workspace_id: '', preferences: {}, messages: [], created_at: 1730000000 };
const ui = { language: 'en', theme: 'snow' };
const seed = JSON.stringify({ workspaces, skills, personas, partners, groups, servers, connections, attachments, catalog, session, ui });
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost'), path = url.pathname, method = req.method;
  const chunks = []; for await (const chunk of req) chunks.push(chunk);
  let body = req.body ?? (chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {});
  const reply = (status, data) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
  if (path === '/__test/reset') {
    const initial = JSON.parse(seed);
    ({ workspaces, skills, personas, partners, groups, servers, connections, attachments, catalog } = initial);
    Object.keys(session).forEach(key => delete session[key]); Object.assign(session, initial.session);
    Object.keys(ui).forEach(key => delete ui[key]); Object.assign(ui, initial.ui);
    requests = []; failure = ''; counter = 0;
    return reply(200, {});
  }
  if (path === '/__test/state') return reply(200, { requests, attachments, workspaces, skills, personas, partners, groups, servers, connections, catalog, session });
  if (path === '/__test/config') { failure = body.failure || ''; return reply(200, {}); }
  requests.push({ method, path, query: Object.fromEntries(url.searchParams), body });
  if (`${method} ${path}` === failure) return reply(503, { detail: 'Injected API failure' });
  if (path === '/api/auth/status') return reply(200, { enabled: true, authenticated: true });
  if (path === '/api/auth/profile') return reply(200, { id: 'admin', username: 'Administrator', role: 'admin', avatar: '', created_at: '', must_change_password: false });
  if (path === '/api/settings') return reply(200, { ui, catalog, task_kinds: [{ id: 'title_generation', group: 'chat' }] });
  if (path === '/api/settings/draft') return reply(200, { draft: null });
  if (path === '/api/settings/workspace/registrations') {
    if (method === 'POST') { const workspace = { workspace_id: `w${++counter + 1}`, display_name: body.name, instructions: body.instructions, archived: false }; workspaces.push(workspace); return reply(200, { workspace }); }
    return reply(200, { workspaces });
  }
  if (path.startsWith('/api/settings/workspace/registrations/')) {
    const workspace = workspaces.find(row => row.workspace_id === decodeURIComponent(path.split('/').at(-1)));
    if (!workspace) return reply(404, { detail: 'Workspace not found' });
    Object.assign(workspace, body, body.name ? { display_name: body.name } : {}); return reply(200, { workspace });
  }
  if (path === '/api/settings/chat-attachments') {
    if (method === 'PUT') { if (Object.keys(body).length !== 4 || Object.values(body).some(value => !Number.isInteger(value) || value < 1)) return reply(422, { detail: 'Invalid limits' }); attachments = body; }
    return reply(200, { settings: attachments });
  }
  if (path === '/api/settings/network') return reply(200, { settings: { backend_port: 8001, frontend_port: 3000, public_api_base: '', cors_origins: ['https://example.test'] } });
  if (path === '/api/settings/chat-starters') return reply(200, { settings: { trace_count: 3, ask_hint_enabled: true } });
  if (path === '/api/settings/document-parsing') return reply(200, { engine: 'mineru', image_caption: true });
  if (path === '/api/settings/video-learning') return reply(200, { version: 1, default_provider: 'youtube', youtube: { transcript_provider: 'youtube_transcript_api' }, invidious: { api_base_url: '', public_base_url: '' } });
  if (path === '/api/settings/usage') return reply(url.searchParams.has('year') ? 200 : 422, { total_tokens: 452, year: Number(url.searchParams.get('year')) });
  if (path === '/api/settings/llm-options') return reply(200, { options: [{ profile_id: 'p1', model_id: 'm1', model_name: 'Test model' }], active: { profile_id: 'p1', model_id: 'm1' } });
  if (path === '/api/settings/apply/registry') {
    if (body.kind === 'provider') { const row = catalog.connections.find(row => row.id === body.ref.connection_id); if (row) Object.assign(row, body.fields); else catalog.connections.push({ id: body.ref.connection_id, ...body.fields }); }
    if (body.kind === 'model') {
      if (!body.profile_id || !body.service) return reply(422, { detail: 'Missing model scope' });
      const service = catalog.services[body.service]; let profile = service.profiles.find(row => row.id === body.profile_id);
      if (!profile) { profile = { id: body.profile_id, name: 'Added provider', models: [] }; service.profiles.push(profile); }
      profile.models.push(body.model);
    }
    return reply(200, { catalog, draft: null });
  }
  if (path === '/api/settings/workspace/data/discover') return reply(200, { features: [{ feature: 'chat', label: 'Conversations', files: 1 }] });
  if (path === '/api/settings/workspace/data/operations') return reply(200, { operations: [] });
  if (/^\/api\/settings\/workspace\/data\/(preview|migrate|export)$/.test(path)) {
    if (!body.features?.length || (path.endsWith('migrate') && body.source_workspace_id === body.target_workspace_id)) return reply(422, { detail: 'Invalid migration selection' });
    return reply(200, { features: body.features, status: path.endsWith('preview') ? 'review' : 'completed' });
  }
  if (path === '/api/skills/list') return reply(200, { skills });
  if (path === '/api/skills/create') { skills.push({ ...body, source: 'user', read_only: false }); return reply(200, body); }
  if (path === '/api/skills/hub/catalog') return reply(200, { skills: [{ slug: 'study', name: 'Study skill', description: 'A study playbook' }] });
  if (path === '/api/skills/hub/detail') return reply(200, { slug: 'study', name: 'Study skill', content: 'Study instructions' });
  if (path === '/api/skills/install') return reply(200, { name: body.ref });
  if (path.startsWith('/api/skills/')) { const row = skills.find(row => row.name === decodeURIComponent(path.split('/').at(-1))); if (!row) return reply(404, { detail: 'Skill not found' }); if (method === 'PUT') Object.assign(row, body); return reply(200, row); }
  if (path === '/api/personas') { if (method === 'POST') personas.push(body); return reply(200, { personas }); }
  if (path.startsWith('/api/personas/')) { const row = personas.find(row => row.name === decodeURIComponent(path.split('/').at(-1))); if (!row) return reply(404, { detail: 'Persona not found' }); if (method === 'PUT') Object.assign(row, body); return reply(200, row); }
  if (path === '/api/partners') { if (method === 'POST') { const partner = { ...body, partner_id: `partner-${++counter}`, can_manage: true }; partners.push(partner); return reply(200, partner); } return reply(200, partners); }
  if (/^\/api\/partners\/[^/]+$/.test(path)) { const row = partners.find(row => row.partner_id === path.split('/').at(-1)); if (!row) return reply(404, { detail: 'Partner not found' }); if (method === 'PATCH') Object.assign(row, body); return reply(200, row); }
  if (/^\/api\/partners\/[^/]+\/soul$/.test(path)) { const row = partners.find(row => row.partner_id === path.split('/').at(-2)); if (!row) return reply(404, { detail: 'Partner not found' }); if (method === 'PUT') row.soul = body.content; return reply(200, { content: row.soul || '' }); }
  if (/^\/api\/partners\/[^/]+\/assets$/.test(path)) return reply(200, { knowledge_bases: [], skills: [], notebooks: [] });
  if (path === '/api/partner-groups') { if (method === 'POST') groups.push(body); return reply(200, { groups }); }
  if (path === '/api/space/mcp/servers') return reply(200, { servers, deployment: { servers: [] } });
  if (path.startsWith('/api/space/mcp/servers/')) { if (!body.config?.url) return reply(422, { detail: 'Missing config envelope' }); servers[decodeURIComponent(path.split('/').at(-1))] = body.config; return reply(200, { servers }); }
  if (path === '/api/subagents/connections') { if (method === 'POST') connections.push(body); return reply(200, { connections }); }
  if (path === '/api/subagents/detect') return reply(200, { backends: [{ kind: 'codex', display_name: 'Codex', available: true }] });
  if (path === '/api/subagents/settings') return reply(200, { consult_budget: 3, backends: { codex: { enabled: true } } });
  if (path === '/api/memory/settings') return reply(200, { enabled: true, extraction: { max_tokens: 2000 } });
  if (path === '/api/capabilities/settings') return reply(200, { solve: { temperature: 0.5, max_tokens: 4096 } });
  if (path === '/api/tools') return reply(200, { tools: [{ name: 'web_search', description: 'Search the web', toggleable: true, enabled: ui.enabled_optional_tools?.includes('web_search') ?? false }], enabled_optional_tools: ui.enabled_optional_tools || [] });
  if (path === '/api/settings/enabled-tools') { ui.enabled_optional_tools = body.enabled_tools; return reply(200, ui); }
  if (path === '/api/auth/users') return reply(200, method === 'POST' ? { id: 'added', ...body } : [{ id: 'admin', username: 'Administrator', role: 'admin', created_at: '2026-11-09' }]);
  if (path === '/api/auth/session-handoff') return reply(200, { handoff_url: `${body.public_origin}/handoff?code=one-time`, expires_at: '2026-11-09T23:59:59Z' });
  if (path === '/api/system/status') return reply(200, { status: 'healthy' });
  if (path === '/api/system/update') return reply(200, { current_version: '1.0' });
  if (path === '/api/modules') return reply(200, { modules: [{ id: 'knowledge', installed: true }] });
  if (path === '/api/sessions') return reply(200, { sessions: [session] });
  if (path === '/api/sessions/s1') { if (method === 'PATCH') Object.assign(session, body); if (method === 'DELETE') return reply(200, { deleted: true }); return reply(200, session); }
  if (path === '/api/sessions/s1/organization') { Object.assign(session.preferences, body); return reply(200, session); }
  if (path === '/api/mastery-paths/topics') return reply(200, { topics: [] });
  return reply(501, { detail: `Unmodeled: ${method} ${path}` });
}).listen(process.env.PORT || 4500);
