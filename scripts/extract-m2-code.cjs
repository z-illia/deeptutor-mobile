// Build-time extraction from the pinned audit only; not an application dependency.
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve('docs/mobile-ui/audit/source/web');
const source = fs.readFileSync(path.join(base, 'features/settings/sections/AppearanceSettingsSection.tsx'), 'utf8');
const raw = source.match(/const CODE_BLOCK_PREVIEW_SNIPPET = `([\s\S]*?)`;/)[1];
const Prism = require(path.join(base, 'node_modules/prismjs'));
require(path.join(base, 'node_modules/prismjs/components/prism-python'));
function flatten(tokens, type = 'plain') { return tokens.flatMap(token => typeof token === 'string' ? [{ type, text: token }] : flatten(Array.isArray(token.content) ? token.content : [token.content], token.type)); }
const lines = [[]];
for (const token of flatten(Prism.tokenize(raw, Prism.languages.python))) token.text.split('\n').forEach((text, i) => { if(i) lines.push([]); lines.at(-1).push({type:token.type,text}); });
const declarations = fs.readFileSync(path.join(base, 'components/common/code-block-themes.ts'), 'utf8');
const styles = {};
for(const option of require('../src/features/settings/code-options.json')) {
 const file = declarations.match(new RegExp('import '+option.file+' from "react-syntax-highlighter/dist/esm/styles/prism/([^";]+)'))[1];
 styles[option.id] = require(path.join(base,'node_modules/react-syntax-highlighter/dist/cjs/styles/prism',file)).default;
}
fs.writeFileSync('src/features/settings/code-preview.json', JSON.stringify({raw,lines,styles}));
