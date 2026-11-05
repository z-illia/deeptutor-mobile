const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(relative) {
  const filename = path.join(root, relative);
  if (cache.has(filename)) return cache.get(filename);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  cache.set(filename, module.exports);
  vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename })((request) => {
    assert.ok(request.startsWith('.'), 'pure design/fixture logic must not import native or network libraries');
    return load(path.relative(root, path.resolve(path.dirname(filename), request)) + '.ts');
  }, module, module.exports);
  cache.set(filename, module.exports);
  return module.exports;
}

test('every base palette value matches the pinned source extraction; Modern overrides resolve independently', () => {
  const { basePalettes, modernSnow, resolveDesign } = load('src/shared/design/tokens.ts');
  const extracted = JSON.parse(fs.readFileSync(path.join(root, 'docs/mobile-ui/audit/design-tokens.json')));
  const camel = (key) => key.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  for (const [name, selector] of Object.entries({ cream: ':root', snow: '.theme-snow', dark: '.dark', glass: '.theme-glass' })) {
    const original = extracted[0].blocks.find((block) => block.selector.endsWith(selector) && block.tokens['--background']);
    assert.deepEqual(basePalettes[name], Object.fromEntries(Object.entries(original.tokens).map(([k, v]) => [camel(k), v])));
  }
  assert.equal(resolveDesign('system', 'modern', 'light').colors.foreground, '#37352f');
  assert.equal(resolveDesign('system', 'classic', 'light').colors.foreground, '#0d0d0d');
  assert.equal(resolveDesign('system', 'modern', 'dark').name, 'dark');
  assert.equal(resolveDesign('glass', 'classic', 'light').dark, true);
  assert.equal(resolveDesign('snow', 'modern', 'light').colors.border, 'rgba(55, 53, 47, 0.09)');
  assert.equal(modernSnow.border, 'rgb(55 53 47 / 0.09)');
});

test('shell fixtures keep all five audited shelves, original feature boundaries and sidebar limits', () => {
  const { shelves, shellRepository, sidebarWidth } = load('src/features/shell/fixtures.ts');
  assert.deepEqual(shelves.map((s) => s.id), ['home', 'learning', 'resources', 'partners', 'personalization']);
  assert.deepEqual(shellRepository.read('learning', 'ready').map((s) => s.route), ['/learning/new', '/learning', '/learning/books', '/learning/mastery', '/learning/practice', '/learning/reading']);
  for (const state of ['empty', 'loading', 'error']) assert.deepEqual(shellRepository.read('home', state), []);
  assert.equal(sidebarWidth(272, 1440), 272);
  assert.equal(sidebarWidth(999, 1440), 480);
  assert.equal(sidebarWidth(100, 1024), 220);
  assert.equal(sidebarWidth(480, 768), 345);
});

test('all ten source UI bundles supply the foundation vocabulary, including Ukrainian', () => {
  const messages = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/foundation-messages.json')));
  assert.equal(Object.keys(messages).length, 10);
  assert.equal(messages.uk.Retry, 'Повторити');
  assert.equal(messages.uk.Cancel, 'Скасувати');
  for (const bundle of Object.values(messages)) assert.deepEqual(Object.keys(bundle).sort(), Object.keys(messages.en).sort());
});

test('the composing orb retains source geometry and licensed fonts/brand assets are bundled locally', () => {
  const { frameRibbon } = load('src/shared/design/orb/ribbon.ts');
  const { resolvePreset } = load('src/shared/design/orb/presets.ts');
  const preset = resolvePreset('composing', 20);
  const first = frameRibbon(20, 0, preset.opts);
  const later = frameRibbon(20, 1, preset.opts);
  assert.equal(preset.speed, 3.12);
  assert.ok(first.dots.length > 0);
  assert.deepEqual(first, frameRibbon(20, 0, preset.opts));
  assert.notDeepEqual(first.dots, later.dots);
  for (const dot of later.dots) assert.ok(Number.isFinite(dot.x) && Number.isFinite(dot.y) && dot.r > 0);
  for (const name of ['color-logo.png', 'color-word.png', 'black-logo.png']) {
    assert.deepEqual(fs.readFileSync(path.join(root, 'assets/brand', name)), fs.readFileSync(path.join(root, 'docs/mobile-ui/audit/source/web/public/brand', name)));
  }
  for (const name of ['Geist-Regular.ttf', 'Geist-Medium.ttf', 'Geist-SemiBold.ttf', 'Geist-Bold.ttf', 'Lora-Regular.ttf', 'Lora-SemiBold.ttf']) {
    assert.equal(fs.readFileSync(path.join(root, 'assets/fonts', name)).readUInt32BE(0), 0x00010000);
  }
});
