// Local test double of deeptutor/api/routers/auth.py. All identities/passwords
// here are synthetic. Test control endpoints are never part of the app API.
const http = require('node:http');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
const initialProfile = { id: 'test-user', username: 'profile-test', role: 'user', avatar: '', created_at: '2026-01-01', must_change_password: true, can_change_password: true };
let profile = { ...initialProfile };
let authenticated = true;
let password = 'original-password';
let failure = '';
let version = 0;
let passwordWrites = 0;
let avatarWrites = 0;
http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const reply = (code, data) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const bytes = Buffer.concat(chunks);
  let body = {};
  if (String(req.headers['content-type']).startsWith('application/json') && bytes.length) body = JSON.parse(bytes.toString());
  if (path === '/__test/reset' && req.method === 'POST') {
    profile = { ...initialProfile }; authenticated = true; password = 'original-password';
    failure = ''; version = 0; passwordWrites = 0; avatarWrites = 0;
    return reply(200, { ok: true });
  }
  if (path === '/__test/config' && req.method === 'POST') {
    if ('can_change_password' in body) profile.can_change_password = body.can_change_password;
    failure = body.failure ?? '';
    return reply(200, { ok: true });
  }
  if (path === '/__test/state') return reply(200, { profile, avatarWrites, passwordWrites });
  if (path === '/api/auth/status') return reply(200, { enabled: true, authenticated });
  if (path === '/api/auth/is_first_user') return reply(200, { is_first_user: false });
  if (path === '/api/auth/logout') {
    if (failure === 'logout') return reply(503, { detail: 'Authentication failed. Please try again.' });
    authenticated = false; return reply(200, { ok: true });
  }
  if (!authenticated) return reply(401, { detail: 'Your session has expired. Please sign in again.' });
  if (path === '/api/settings/workspace/registrations') return reply(200, { workspaces: [] });
  if (path === '/api/auth/profile' && req.method === 'GET') return reply(200, profile);
  if (path === '/api/auth/profile' && req.method === 'PUT') {
    if (failure === 'avatar') return reply(503, { detail: 'Failed to load profile' });
    if (body.avatar !== '' && !/^icon:[a-z0-9-]+:[a-z0-9-]+$/.test(body.avatar)) return reply(422, { detail: 'Invalid avatar' });
    profile.avatar = body.avatar; avatarWrites++; return reply(200, { ok: true, avatar: profile.avatar });
  }
  if (path === '/api/auth/profile/avatar' && req.method === 'PUT') {
    if (failure === 'avatar') return reply(503, { detail: 'Failed to load profile' });
    if (!String(req.headers['content-type']).includes('multipart/form-data; boundary=') || !bytes.includes(Buffer.from('name="file"'))) return reply(422, { detail: 'Invalid multipart body' });
    if (bytes.length > 1024 * 1024 + 4096) return reply(413, { detail: 'Avatar image is too large (max 1 MB).' });
    if (!bytes.includes(png.subarray(0, 8))) return reply(415, { detail: 'Avatar must be a PNG, JPEG or WebP image.' });
    profile.avatar = `img:${++version}`; avatarWrites++;
    return reply(200, { ok: true, avatar: profile.avatar });
  }
  if (path === '/api/auth/profile/avatar' && req.method === 'DELETE') {
    profile.avatar = ''; avatarWrites++; return reply(200, { ok: true, avatar: '' });
  }
  if (path === '/api/auth/avatar/test-user') {
    if (failure === 'image') return reply(503, { detail: 'Failed to load profile' });
    res.writeHead(200, { 'content-type': 'image/png' }); return res.end(png);
  }
  if (path === '/api/auth/profile/password' && req.method === 'PUT') {
    if (!profile.can_change_password) return reply(400, { detail: 'Password changes are only available for local authenticated accounts.' });
    if (failure === 'password') return reply(503, { detail: 'Failed to change password' });
    if (body.current_password !== password) return reply(400, { detail: 'Current password is incorrect' });
    if (body.new_password.length < 8) return reply(422, { detail: 'Password must be at least 8 characters' });
    if (body.current_password === body.new_password) return reply(400, { detail: 'New password must differ from the current password' });
    password = body.new_password; profile.must_change_password = false; passwordWrites++;
    return reply(200, { ok: true });
  }
  reply(501, { detail: 'Not covered by the profile test double' });
}).listen(process.env.PORT || 4500, '127.0.0.1');
