const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const { createLoader } = require('./helpers/rich-markdown.cjs');

test('MathJax metadata evaluates without Node __dirname or dynamic require in a mobile runtime', () => {
  const upstream = fs.readFileSync(require.resolve('mathjax-full/js/components/version.js'), 'utf8');
  assert.throws(() => vm.runInNewContext(upstream, { exports: {}, require }), /__dirname is not defined/);
  const output = ts.transpileModule(fs.readFileSync('src/shared/markdown/mathjax-version.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: name => {
    assert.equal(name, 'mathjax-full/package.json'); return require(name);
  } });
  assert.equal(exports.VERSION, require('mathjax-full/package.json').version);
});
test('Metro replaces only MathJax version metadata on web and Android', () => {
  const configFile = path.resolve('metro.config.js');
  const mod = { exports: {} };
  new Function('require', 'module', '__dirname', fs.readFileSync(configFile, 'utf8'))(Object.assign(name => name === 'expo/metro-config' ? { getDefaultConfig: () => ({ resolver: {} }) } : require(name), { resolve: require.resolve }), mod, path.dirname(configFile));
  const version = require.resolve('mathjax-full/js/components/version.js');
  const mathjax = require.resolve('mathjax-full/js/mathjax.js');
  for (const platform of ['android', 'web']) {
    const resolve = () => ({ type: 'sourceFile', filePath: 'default-result' });
    const context = { originModulePath: mathjax, resolveRequest: resolve };
    assert.equal(mod.exports.resolver.resolveRequest(context, './components/version.js', platform).filePath, path.resolve('src/shared/markdown/mathjax-version.ts'));
    assert.equal(mod.exports.resolver.resolveRequest(context, './core/HandlerList.js', platform).filePath, 'default-result');
    assert.notEqual(mod.exports.resolver.resolveRequest({ ...context, originModulePath: path.resolve('src/example.ts') }, version, platform).filePath, path.resolve('src/shared/markdown/mathjax-version.ts'));
  }
});
test('development diagnostics retain only bounded metadata and stay disabled in production', () => {
  const oldDev = global.__DEV__;
  try {
    global.__DEV__ = true;
    const { richDiagnostic } = createLoader()('src/shared/markdown/diagnostics.ts');
    for (let i = 0; i < 100; i++) richDiagnostic('renderer-mounted', { length: i });
    assert.equal(global.__DEEPTUTOR_RICH_CONTENT__.events.length, 64);
    global.__DEV__ = false;
    richDiagnostic('renderer-mounted', { length: 999 });
    assert.equal(global.__DEEPTUTOR_RICH_CONTENT__.events.at(-1).length, 99);
  } finally { global.__DEV__ = oldDev; delete global.__DEEPTUTOR_RICH_CONTENT__; }
});
