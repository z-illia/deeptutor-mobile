// Stateful local double of the existing notebook router. No real user data.
const http = require('node:http');
const original = { id: 'r1', type: 'chat', title: 'Seed favorite', summary: 'Seed summary', user_query: 'Question', output: '**Original snapshot**', created_at: 1, metadata: { session_id: 'seed-session' }, kb_name: 'Knowledge' };
const make = (id, name, records = []) => ({ id, name, description: '', color: '#6366F1', updated_at: 1, records });
let stores, options, sequence, saves;
function reset() {
  stores = { '': { source: make('source', 'Source', [{ ...original }]), target: make('target', 'Target'), broken: { ...make('broken', 'Broken'), unreadable: true } }, 'workspace-b': {} };
  options = {}; sequence = 1; saves = [];
}
reset();
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost'); const path = url.pathname;
  const reply = (status, data) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
  const chunks = []; for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
  if (path === '/__test/reset') { reset(); return reply(200, { ok: true }); }
  if (path === '/__test/config') { options = body; return reply(200, { ok: true }); }
  if (path === '/__test/state') return reply(200, { stores, saves });
  if (path === '/api/auth/status') return reply(200, { enabled: false, authenticated: false });
  if (path === '/api/settings/workspace/registrations') return reply(200, { workspaces: [{ workspace_id: 'workspace-b', display_name: 'Workspace B', archived: false }] });
  if (path === '/api/settings/llm-options') return reply(200, { options: [], active: null });
  if (path === '/api/sessions/seed-session') return reply(200, { session_id: 'seed-session', title: 'Seed conversation', messages: [{ id: 1, role: 'user', content: 'Question', parent_message_id: null }, { id: 2, role: 'assistant', content: '**Original snapshot**', parent_message_id: 1 }] });
  if (path === '/api/mastery-paths/topics') return reply(200, { topics: [] });
  const workspace = url.searchParams.get('dt_workspace');
  if (workspace === null) return reply(400, { detail: 'Missing dt_workspace' });
  const store = stores[workspace] ??= {};
  const fail = operation => options.failure === operation;
  const failed = () => reply(503, { detail: 'Test service unavailable' });
  const summary = item => ({ ...item, records: undefined, record_count: item.records.length });
  if (path === '/api/notebooks' && req.method === 'GET') {
    if (fail('list')) return failed();
    return reply(200, { notebooks: Object.values(store).map(summary) });
  }
  if (path === '/api/notebooks' && req.method === 'POST') {
    if (fail('create')) return failed();
    const notebook = { ...make(`server-nb-${++sequence}`, body.name), ...body }; store[notebook.id] = notebook;
    return reply(200, { success: true, notebook });
  }
  if (path === '/api/notebooks/actions/add-record') {
    if (fail('save')) return failed();
    const record = { id: `server-record-${++sequence}`, type: body.record_type, title: body.title, summary: body.summary || 'Generated summary', user_query: body.user_query, output: body.output, metadata: body.metadata, kb_name: body.kb_name, created_at: sequence };
    const eligible = body.notebook_ids.filter(id => store[id] && !store[id].unreadable);
    const added = options.partial ? eligible.slice(0, 1) : eligible;
    for (const id of added) { store[id].records.push(structuredClone(record)); store[id].updated_at = sequence; }
    saves.push({ notebook_ids: body.notebook_ids, added_to_notebooks: added, record });
    return reply(200, { success: true, summary: record.summary, record, added_to_notebooks: added });
  }
  const location = path.match(/^\/api\/notebooks\/records\/([^/]+)\/location$/);
  if (location) {
    const id = decodeURIComponent(location[1]); const preferred = url.searchParams.get('notebook_id');
    const found = [store[preferred], ...Object.values(store)].find(item => item?.records.some(record => record.id === id));
    return found ? reply(200, { notebook_id: found.id, record_id: id }) : reply(404, { detail: 'Favorite not found' });
  }
  const match = path.match(/^\/api\/notebooks\/([^/]+)(?:\/records\/([^/]+)(?:\/actions\/(move|copy))?|\/(export))?$/);
  if (!match) return reply(501, { detail: 'Not covered by the favorites double' });
  const id = decodeURIComponent(match[1]); const notebook = store[id];
  if (!notebook) return reply(404, { detail: 'Notebook not found' });
  if (req.method === 'DELETE' && !match[2]) {
    if (fail('delete')) return failed(); delete store[id]; return reply(200, { success: true });
  }
  if (notebook.unreadable) return reply(409, { detail: { code: 'notebook_unreadable', notebook_id: id, message: 'Unreadable' } });
  if (match[4]) {
    if (fail('export')) return failed();
    res.writeHead(200, { 'content-type': 'text/plain' }); return res.end(`# ${notebook.name}\n\n${notebook.records.map(item => item.output).join('\n\n')}`);
  }
  if (match[2]) {
    const rid = decodeURIComponent(match[2]); const record = notebook.records.find(item => item.id === rid);
    if (!record) return reply(404, { detail: 'Record not found' });
    if (fail('record')) return failed();
    if (match[3]) {
      const target = store[body.target_notebook_id]; if (!target) return reply(404, { detail: 'Record or target notebook not found' });
      const next = structuredClone(record);
      if (match[3] === 'move') notebook.records = notebook.records.filter(item => item.id !== rid);
      else next.id = `copied-${++sequence}`;
      target.records.push(next); return reply(200, { success: true, record: next });
    }
    if (req.method === 'DELETE') { notebook.records = notebook.records.filter(item => item.id !== rid); return reply(200, { success: true }); }
    if (req.method === 'PUT') {
      if ('output' in body || 'user_query' in body) return reply(400, { detail: 'Favorites preserve their original content.' });
      Object.assign(record, body); return reply(200, { success: true, record });
    }
  }
  if (req.method === 'PUT') { if (fail('update')) return failed(); Object.assign(notebook, body); return reply(200, { success: true, notebook }); }
  return reply(200, notebook);
}).listen(process.env.PORT || 4500, '127.0.0.1');
