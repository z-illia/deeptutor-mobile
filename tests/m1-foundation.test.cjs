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
  const languages = ['en', 'zh', 'fr', 'de', 'uk', 'pl', 'pt', 'vi', 'ja', 'tr'];
  const messages = Object.fromEntries(languages.map(lang => [lang, JSON.parse(fs.readFileSync(path.join(root, `src/i18n/locales/${lang}.json`), 'utf8'))]));
  assert.equal(Object.keys(messages).length, 10);
  assert.equal(messages.uk.Retry, 'Повторити');
  assert.equal(messages.uk.Cancel, 'Скасувати');
  for (const bundle of Object.values(messages)) assert.deepEqual(Object.keys(bundle).sort(), Object.keys(messages.en).sort());
});
