const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

function load(relative, mocks = {}) {
  let file = path.resolve(__dirname, '..', relative);
  if (!path.extname(file)) file += '.ts';
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const module = { exports: {} };
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: file })(request => {
    if (request in mocks) return mocks[request];
    if (request.startsWith('@/')) return load('src/' + request.slice(2), mocks);
    if (request.startsWith('.')) return load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(file), request)), mocks);
    return require(request);
  }, module, module.exports);
  return module.exports;
}

test('mobile preferences survive rehydration and migrate the existing light theme without losing drafts', async () => {
  let saved = JSON.stringify({ state: { theme: 'light', values: { draft: 'My note' } }, version: 1 });
  const storage = {
    getItem: async () => saved,
    setItem: async (_key, value) => { saved = value; },
    removeItem: async () => { saved = null; },
  };
  const createStore = () => load('src/shared/preferences/store.ts', { '@react-native-async-storage/async-storage': storage }).usePreferencesStore;
  const store = createStore();
  await store.persist.rehydrate();
  assert.equal(store.getState().theme, 'snow');
  assert.equal(store.getState().language, 'en');
  assert.equal(store.getState().values.draft, 'My note');
  store.getState().setTheme('dark');
  store.getState().setLanguage('uk');
  store.getState().setLayout('classic');
  const restored = createStore();
  await restored.persist.rehydrate();
  assert.equal(restored.getState().theme, 'dark');
  assert.equal(restored.getState().language, 'uk');
  assert.equal(restored.getState().layout, 'classic');
  assert.equal(restored.getState().values.draft, 'My note');
});

test('mobile copy translates controls and falls back for unknown text and keeps canonical language names', () => {
  const { mobileCopy, languageNames } = load('src/features/mobile/copy.ts', { '@/shared/design/DesignProvider': {} });
  assert.equal(mobileCopy('uk')('Apply preferences'), 'Застосувати налаштування');
  assert.equal(mobileCopy('uk')('Learn'), 'Навчання');
  assert.equal(mobileCopy('pl')('Library'), 'Biblioteka');
  assert.equal(mobileCopy('zh')('Apply appearance'), '应用外观');
  assert.equal(mobileCopy('en')('Apply appearance'), 'Apply appearance');
  assert.equal(mobileCopy('uk')('My authored note 123'), 'My authored note 123');
  assert.equal(languageNames.uk, 'Українська');
});


test('shared locale lookup uses translated values across bundles without English entries masking them', () => {
  const { translateCopy } = load('src/i18n/copy.ts', {
    './locales/uk.json': { ...load('src/i18n/locales/uk.json'), 'Regression label': 'Переклад' },
  });
  assert.equal(translateCopy('uk', 'Regression label'), 'Переклад');
  assert.equal(translateCopy('uk', 'Apply appearance'), 'Застосувати оформлення');
  assert.equal(translateCopy('en', 'Apply appearance'), 'Apply appearance');
});

test('every supported locale covers the application contract and preserves interpolation placeholders', () => {
  const contract = load('src/i18n/locale-contract.json');
  const expectedLanguages = ['en', 'zh', 'fr', 'de', 'uk', 'pl', 'pt', 'vi', 'ja', 'tr'];
  const complete = Object.fromEntries(expectedLanguages.map(lang => [lang, load(`src/i18n/locales/${lang}.json`)]));
  assert.deepEqual(Object.keys(complete).sort(), expectedLanguages.slice().sort());
  for (const language of expectedLanguages) {
    for (const key of contract.keys) {
      assert.equal(typeof complete[language][key], 'string', `${language}: ${key}`);
      assert.ok(complete[language][key].trim(), `${language}: empty translation for ${key}`);
      assert.deepEqual((complete[language][key].match(/\{\w+\}/g) || []).sort(), (key.match(/\{\w+\}/g) || []).sort(), `${language}: placeholders changed in ${key}`);
    }
  }
});

test('locale templates preserve arbitrary user values and missing parameters', () => {
  const { translateCopy } = load('src/i18n/copy.ts');
  const template = 'Preview attachment {value1}';
  const name = 'My file {value2} $&.pdf';
  for (const language of ['en', 'uk', 'pl', 'fr', 'de', 'zh', 'pt', 'vi', 'ja', 'tr']) {
    const translated = translateCopy(language, template, { value1: name });
    assert.ok(translated.includes(name), language);
    assert.equal(translateCopy(language, 'Unregistered label {name}', { name: 'literal $&' }), 'Unregistered label literal $&');
    assert.equal(translateCopy(language, 'Unregistered label {name}', {}), 'Unregistered label {name}');
    assert.equal(translateCopy(language, 'My authored note 123'), 'My authored note 123');
    assert.equal(translateCopy(language, 'constructor'), 'constructor');
  }
});


test('the locale contract stays in sync with strings used by application screens', () => {
  const { keys, invariant } = require('../scripts/locale-contract.cjs');
  assert.deepEqual(load('src/i18n/locale-contract.json').keys, keys.filter(key => !invariant(key)));
});

test('authored notebook and conversation titles keep their original content and identifiers', () => {
  const { disclosure } = load('src/features/mobile/model.ts');
  const row = disclosure('note:local-1', 'General', 'My authored note 123');
  assert.equal(row.localize, false);
  assert.equal(row.id, 'note:local-1');
  const title = row.children[0].children[0];
  assert.equal(title.localize, false);
  assert.equal(title.content, 'General');
});
