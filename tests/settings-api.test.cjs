const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers/rich-markdown.cjs');
const clone = value => structuredClone(value);
const tick = () => new Promise(resolve => setImmediate(resolve));
const liveUi = { theme: 'dark', language: 'en', response_language: 'pl', content_font_scale: 110, content_line_spacing: 'normal', code_block_theme: 'oneDark', code_block_show_line_numbers: false, code_block_wrap_long_lines: true };
const baseRepo = createLoader({ '@/api/client': { api: {} } })('src/features/settings/api.ts');

test('settings map the actual theme and boolean domains and send only changed UI fields', () => {
  const active = baseRepo.preferencesFromUi({ ...liveUi, theme: 'light' }, 'modern');
  assert.equal(active.theme, 'cream');
  assert.equal(active.lineNumbers, false);
  assert.equal(active.responseLanguage, 'pl');
  assert.equal(baseRepo.preferencesToUi(active).theme, 'light');
  assert.deepEqual(baseRepo.uiPatch(active, { ...active, layout: 'classic', wrap: false }), { code_block_wrap_long_lines: false });
  assert.equal(baseRepo.preferencesFromUi({ ...liveUi, content_font_scale: '150' }, 'modern').scale, 100);
  const legacy = baseRepo.preferencesFromUi({ ...liveUi, code_block_show_line_numbers: 'true', code_block_wrap_long_lines: 'false' }, 'modern');
  assert.equal(legacy.lineNumbers, true);
  assert.equal(legacy.wrap, false);
});

test('draft editing preserves catalog secrets and unrelated extension/UI fields', () => {
  const draft = { catalog: { masked: '********' }, extensions: { ui: { theme: 'glass', sidebar_description: 'Keep this' }, tools: { enabled: ['search'] }, 'ui-layout': 'classic' } };
  const active = baseRepo.preferencesFromUi(liveUi, 'modern');
  const next = baseRepo.composeDraft(draft, active, { ...active, theme: 'cream' });
  assert.deepEqual(next.catalog, draft.catalog);
  assert.deepEqual(next.extensions.tools, draft.extensions.tools);
  assert.deepEqual(next.extensions.ui, { sidebar_description: 'Keep this', theme: 'light' });
  assert.equal('ui-layout' in next.extensions, false);
  assert.deepEqual(baseRepo.clearOwnedDraft(draft), { catalog: draft.catalog, extensions: { ui: { sidebar_description: 'Keep this' }, tools: draft.extensions.tools } });
  assert.doesNotThrow(() => baseRepo.assertDraftUnchanged(draft, { ...draft, extensions: { ...draft.extensions, tools: {} } }));
  assert.throws(() => baseRepo.assertDraftUnchanged(draft, null), /changed on the server/);
});

function harness(initialDraft = null, ownerId = 'user') {
  let ui = clone(liveUi), draft = clone(initialDraft), failure = '';
  const calls = [], published = [], slots = [], effects = [];
  let index = 0, cleanup;
  const device = { layout: 'modern', settingsOwner: '', appliedSettings: null, applySettings(value, owner) { published.push(clone(value)); device.appliedSettings = value; device.settingsOwner = owner; device.layout = value.layout; } };
  const fail = () => { throw new Error('Injected failure'); };
  const api = {
    get: async (url, config) => { calls.push({ method: 'get', url, config }); return { data: url === '/settings' ? { ui: clone(ui) } : { draft: clone(draft) } }; },
    put: async (url, data, config) => {
      calls.push({ method: 'put', url, data: clone(data), config });
      if (url === '/settings/draft') { if (failure === 'save' || (failure === 'clear' && !data.extensions.ui)) fail(); draft = clone(data); return { data: { draft: clone(draft) } }; }
      if (failure === 'ui') fail();
      ui = { ...ui, ...data }; return { data: clone(ui) };
    },
    delete: async (url, config) => { calls.push({ method: 'delete', url, config }); if (failure === 'clear') fail(); draft = null; return { data: { draft: null } }; },
  };
  const React = require('react');
  const load = createLoader({
    react: {
      ...React,
      useState(initial) { const i = index++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
      useRef(initial) { const i = index++; return slots[i] ??= { current: initial }; },
      useEffect(fn) { if (!effects.length) effects.push(fn); },
      useCallback(fn, deps) { const i = index++; if (!slots[i] || deps.some((value, n) => value !== slots[i].deps[n])) slots[i] = { fn, deps }; return slots[i].fn; },
    },
    '@/api/client': { api },
    '@/features/auth/AuthProvider': { useAuth: () => ({ loading: false, serverUrl: 'server', session: { status: { enabled: true, authenticated: true }, profile: { id: ownerId } } }) },
    '@/shared/preferences/store': { usePreferencesStore: { getState: () => device } },
  });
  const { SettingsProvider } = load('src/features/settings/SettingsProvider.tsx');
  const render = () => { index = 0; const element = SettingsProvider({ children: null }); return element.type(element.props).props.value; };
  return { render, calls, published, device, api,
    start: async () => { render(); cleanup = effects[0](); await tick(); return render(); },
    fail: value => { failure = value; },
    server: () => ({ ui, draft }),
    changeDraft: value => { draft = value; },
    close: () => cleanup?.(),
  };
}

test('loading restores a server draft without applying it; save/apply/discard preserve foreign settings', async () => {
  const foreign = { tools: { enabled: ['search'] } };
  const h = harness({ catalog: null, extensions: { ...foreign, ui: { theme: 'glass' } } });
  try {
    let state = await h.start();
    assert.equal(state.state.active.theme, 'dark');
    assert.equal(state.state.staged.theme, 'glass');
    assert.equal(h.device.appliedSettings.theme, 'dark');
    state.edit({ language: 'uk', layout: 'classic' });
    assert.equal(await h.render().save('save'), true);
    assert.equal(h.server().ui.language, 'en');
    assert.equal(h.device.layout, 'modern');
    assert.equal(h.server().draft.extensions.ui.language, 'uk');
    assert.equal(h.server().draft.extensions['ui-layout'], 'classic');
    assert.equal(await h.render().save('apply'), true);
    assert.equal(h.device.appliedSettings.language, 'uk');
    assert.equal(h.device.layout, 'classic');
    assert.deepEqual(h.server().draft.extensions, foreign);
    assert.equal(h.calls.some(call => call.url === '/settings/apply'), false);
    h.render().edit({ wrap: false });
    assert.equal(await h.render().save('save'), true);
    assert.equal(await h.render().save('discard'), true);
    assert.equal(h.render().state.staged.wrap, true);
    assert.deepEqual(h.server().draft.extensions, foreign);
  } finally { h.close(); }
});

test('failed UI apply retains the saved draft, and cleanup retry does not repeat a committed UI write', async () => {
  const h = harness();
  try {
    await h.start(); h.render().edit({ theme: 'cream' }); h.fail('ui');
    assert.equal(await h.render().save('apply'), false);
    assert.equal(h.server().ui.theme, 'dark');
    assert.equal(h.device.appliedSettings.theme, 'dark');
    assert.equal(h.render().state.phase, 'saved-draft');
    h.fail('clear');
    assert.equal(await h.render().save('apply'), false);
    assert.equal(h.device.appliedSettings.theme, 'cream');
    assert.equal(h.server().ui.theme, 'light');
    assert.match(h.render().error, /could not be cleared/);
    const writes = h.calls.filter(call => call.url === '/settings/ui').length;
    h.fail(''); assert.equal(await h.render().save('apply'), true);
    assert.equal(h.calls.filter(call => call.url === '/settings/ui').length, writes);
    assert.equal(h.server().draft, null);
  } finally { h.close(); }
});

test('settings refuse concurrent draft replacement and stale account completions', async () => {
  const h = harness();
  try {
    await h.start(); h.render().edit({ language: 'uk' });
    h.changeDraft({ catalog: null, extensions: { ui: { language: 'pl' } } });
    assert.equal(await h.render().save('save'), false);
    assert.match(h.render().error, /changed on the server/);
    assert.equal(h.server().draft.extensions.ui.language, 'pl');
    assert.equal(h.render().state.staged.language, 'uk');
  } finally { h.close(); }
  const old = harness(null, 'old-user'); await old.start(); old.render().edit({ theme: 'glass' });
  let release, signal;
  const get = old.api.get;
  old.api.get = (url, config) => { signal = config.signal; return new Promise(resolve => { release = () => resolve(get(url, config)); }); };
  const pending = old.render().save('save');
  assert.equal(await old.render().save('apply'), false);
  old.close(); assert.equal(signal.aborted, true); release();
  assert.equal(await pending, false);
  assert.equal(old.calls.filter(call => call.method === 'put').length, 0);
  const next = harness(null, 'new-user');
  try { await next.start(); assert.equal(next.device.appliedSettings.theme, 'dark'); } finally { next.close(); }
});
