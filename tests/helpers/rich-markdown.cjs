const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
function createLoader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    const full = path.resolve(root, file);
    if (cache.has(full)) return cache.get(full).exports;
    const mod = { exports: {} }; cache.set(full, mod);
    const js = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    new Function('require', 'module', 'exports', js)(name => {
      if (name in overrides) return overrides[name];
      if (name === 'react-native-svg') return { SvgXml: () => null };
      if (name.startsWith('.') || name.startsWith('@/')) {
        const base = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(full), name);
        const target = ['.ts', '.tsx'].map(ext => base + ext).find(fs.existsSync);
        return load(target);
      }
      return require(name);
    }, mod, mod.exports);
    return mod.exports;
  }
  return load;
}
module.exports = { createLoader, root };
