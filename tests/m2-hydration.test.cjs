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

test('viewport SSR is deterministic without browser Dimensions access', () => {
  const fail = () => { throw new Error('Browser Dimensions accessed during SSR'); };
  const { useLayoutDimensions } = loadSource('src/hooks/use-layout-dimensions.web.ts', { 'react-native': { Dimensions: { get: fail, addEventListener: fail } } });
  function Probe() { const d = useLayoutDimensions(); return React.createElement('span', null, `${d.width}:${d.height}:${d.scale}:${d.fontScale}`); }
  assert.equal(renderToString(React.createElement(Probe)), '<span>0:0:1:1</span>');
});

test('shared selected and loading buttons expose web accessibility state during SSR', () => {
  const { Button } = loadSource('src/shared/ui/Controls.tsx', {
    'react-native': require('react-native-web'),
    '../design/DesignProvider': { useDesign: () => ({ colors: { primary: '#000000', primaryForeground: '#ffffff' } }) },
    '../design/tokens': { geometry: { touch: 48 }, alpha: value => value },
    './Text': { DText: ({ children }) => React.createElement('span', null, children) },
  });
  const html = renderToString(React.createElement(Button, { accessibilityState: { selected: true }, loading: true }, 'Saving'));
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /aria-disabled="true"/);
});
