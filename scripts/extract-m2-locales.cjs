const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = 'docs/mobile-ui/audit/source/web/locales';
const en = JSON.parse(fs.readFileSync(path.join(source,'en/app.json')));
const keys = new Set(Object.keys(require('../src/i18n/foundation-messages.json').en));
function scan(dir) { for (const item of fs.readdirSync(dir,{withFileTypes:true})) { const p=path.join(dir,item.name); if(item.isDirectory()) scan(p); else if(/\.tsx?$/.test(p)) { const scanner=ts.createScanner(ts.ScriptTarget.Latest,false,ts.LanguageVariant.JSX,fs.readFileSync(p,'utf8')); let k; while((k=scanner.scan())!==ts.SyntaxKind.EndOfFileToken) if(k===ts.SyntaxKind.StringLiteral) { const value=scanner.getTokenValue();if(Object.hasOwn(en,value))keys.add(value); } } } }
scan('src/features');scan('src/app');
for(const tile of require('../src/features/resources/source-tiles.json')) for(const key of [tile.title,tile.blurb,tile.unit]) if(key)keys.add(key);
for(const key of ['General workspace','Workspace','Close','Back','Search','Color','Avatar','Current password is incorrect','Passwords do not match','Password must be at least 8 characters','Image is too large','Could not decode image','navigation.noResults','Conversations & Materials','More Projects','Personalization','Student','Teacher','User','Administrator'])keys.add(key);
const output={};
for(const language of Object.keys(require('../src/i18n/foundation-messages.json'))) {const bundle=JSON.parse(fs.readFileSync(path.join(source,language,'app.json')));output[language]=Object.fromEntries([...keys].sort().map(key=>[key,bundle[key]||en[key]||key]));}
fs.writeFileSync('src/i18n/m2-messages.json',JSON.stringify(output,null,2)+'\n');
console.log(`${keys.size} source keys across ${Object.keys(output).length} locales`);
