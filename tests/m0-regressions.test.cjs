const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const React = require('react');
const { renderToString } = require('react-dom/server');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');

// Exercise the real source in Node while replacing only native/platform dependencies.
function loadSource(relativePath, dependencies) {
  const filename = path.join(projectRoot, relativePath);
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const module = { exports: {} };
  const loadDependency = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name === 'react' || name === 'react/jsx-runtime') return require(name);
    throw new Error(`Unexpected dependency: ${name}`);
  };
  const evaluate = vm.runInThisContext(
    `(function(require, module, exports) { ${outputText}\n})`,
    { filename },
  );
  evaluate(loadDependency, module, module.exports);
  return module.exports;
}

test('web theme SSR stays light without reading or subscribing to browser Appearance', () => {
  const browserOnly = () => {
    throw new Error('Appearance must not be accessed while rendering on the server');
  };
  const { useColorScheme } = loadSource('src/hooks/use-color-scheme.web.ts', {
    'react-native': {
      Appearance: { getColorScheme: browserOnly, addChangeListener: browserOnly },
    },
  });
  function ThemeProbe() {
    return React.createElement('span', null, useColorScheme());
  }
  assert.equal(renderToString(React.createElement(ThemeProbe)), '<span>light</span>');
});

test('custom web tab keeps the actual element ref and Router interaction props', () => {
  function Pressable() {}
  const { TabButton } = loadSource('src/components/app-tabs.web.tsx', {
    'expo-router/ui': {},
    'expo-symbols': {},
    'react-native': { Pressable, StyleSheet: { create: (styles) => styles } },
    '@/constants/theme': { Spacing: {}, Colors: {} },
    './external-link': {},
    './themed-text': {},
    './themed-view': {},
  });
  const ref = React.createRef();
  const onPress = () => {};
  const onLongPress = () => {};
  const element = TabButton({
    ref,
    isFocused: true,
    children: 'Explore',
    href: '/explore',
    onPress,
    onLongPress,
    accessibilityRole: 'tab',
    accessibilityLabel: 'Explore',
    disabled: true,
  });
  assert.equal(element.type, Pressable);
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onPress, onPress);
  assert.equal(element.props.onLongPress, onLongPress);
  assert.equal(element.props.href, '/explore');
  assert.equal(element.props.accessibilityRole, 'tab');
  assert.equal(element.props.accessibilityLabel, 'Explore');
  assert.equal(element.props.disabled, true);
  assert.equal(Object.hasOwn(element.props, 'isFocused'), false);
});

test('typecheck includes mobile sources and excludes the separate audit application', () => {
  const config = ts.readConfigFile(path.join(projectRoot, 'tsconfig.json'), ts.sys.readFile);
  assert.equal(config.error, undefined);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, projectRoot);
  assert.deepEqual(parsed.errors, []);
  const files = new Set(parsed.fileNames.map((file) => path.relative(projectRoot, file)));
  for (const filename of [
    'src/app/index.tsx',
    'src/app/explore.tsx',
    'src/components/app-tabs.tsx',
    'src/components/app-tabs.web.tsx',
    'src/hooks/use-color-scheme.ts',
    'src/hooks/use-color-scheme.web.ts',
    'src/api/client.ts',
    'src/i18n/translations.ts',
  ]) {
    assert.ok(files.has(filename), `${filename} must remain in the TypeScript program`);
  }
  assert.ok([...files].every((file) => !file.startsWith('docs/mobile-ui/audit/')));
});

test('ESLint excludes archived source without excluding native/web code or regression tests', async () => {
  const { ESLint } = require('eslint');
  const eslint = new ESLint({ cwd: projectRoot });
  assert.equal(
    await eslint.isPathIgnored(path.join(projectRoot, 'docs/mobile-ui/audit/source/web/app/layout.tsx')),
    true,
  );
  for (const filename of [
    'src/app/_layout.tsx',
    'src/components/app-tabs.tsx',
    'src/components/app-tabs.web.tsx',
    'tests/m0-regressions.test.cjs',
  ]) {
    assert.equal(await eslint.isPathIgnored(path.join(projectRoot, filename)), false, filename);
  }
});
