const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(relative) {
 const file = path.join(root,relative); if(cache.has(file)) return cache.get(file);
 if(file.endsWith('.json')) return JSON.parse(fs.readFileSync(file));
 const module={exports:{}};cache.set(file,module.exports);
 const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,resolveJsonModule:true,esModuleInterop:true}}).outputText;
 vm.runInThisContext(`(function(require,module,exports){${output}\n})`,{filename:file})((request)=>{assert.ok(request.startsWith('.'));const next=path.resolve(path.dirname(file),request);return load(path.relative(root,next.endsWith('.json')?next:next+'.ts'));},module,module.exports);
 cache.set(file,module.exports);return module.exports;
}
const model=load('src/features/entry/model.ts');
test('M2 return paths reject external, malformed and auth-loop destinations while preserving safe record/query/hash',()=>{
 for(const path of ['https://example.org','//example.org','/\\example.org','/%2f%2fexample.org','/%00bad','/%zz','/login','/register']) assert.equal(model.normalizeDestination(path),'/chat');
 assert.equal(model.normalizeDestination('/settings/overview?tab=a#section'),'/settings/general?tab=a#section');
 assert.equal(model.normalizeDestination('/chat/session-a?dt_workspace=fixture-ws-a#turn-a'),'/chat/session-a?dt_workspace=fixture-ws-a#turn-a');
});
test('M2 learner preset is not an invented account role and does not grant administrative/catalog writes',()=>{
 assert.equal(model.principalFor('learner').role,'user');assert.equal(model.principalFor('admin').role,'admin');
 for(const mode of ['standard','learner','disabled','signed-out']) assert.equal(model.allowedDestination(mode,'/admin/users'),false);
 assert.equal(model.allowedDestination('admin','/admin/users'),true);
 assert.equal(model.allowedDestination('learner','/calendar'),true);assert.equal(model.allowedDestination('learner','/co-writer'),false);
 assert.equal(model.catalogEditable('standard'),false);assert.equal(model.catalogEditable('learner'),false);assert.equal(model.catalogEditable('disabled'),true);
});
test('M2 settings keep edits, saved draft, and active configuration independent; discard restores active state',()=>{
 const active={...model.defaultPreferences}; const initial={active,staged:{...active},saved:null,phase:'clean'};
 const edited=model.settingsTransition(initial,{type:'edit',patch:{language:'uk',theme:'dark'}});
 assert.equal(edited.active.language,'en');assert.equal(edited.active.theme,'system');assert.equal(edited.phase,'unsaved');
 const saved=model.settingsTransition(edited,{type:'save'});assert.equal(saved.phase,'saved-draft');assert.equal(saved.saved.language,'uk');assert.equal(saved.active.language,'en');
 const later=model.settingsTransition(saved,{type:'edit',patch:{scale:125}});assert.equal(later.saved.scale,100);assert.equal(later.active.scale,100);
 const discarded=model.settingsTransition(later,{type:'discard'});assert.deepEqual(discarded.staged,active);assert.equal(discarded.saved,null);
 const applied=model.settingsTransition(later,{type:'apply'});assert.equal(applied.active.language,'uk');assert.equal(applied.active.scale,125);assert.equal(applied.saved,null);
});
test('M2 workspace switches return details to source indexes and preserve account-level destinations',()=>{
 for(const [from,to] of [['/chat/session-a','/chat'],['/learning/mastery/path-a','/learning/mastery'],['/learning/books/book-a','/learning/books'],['/learning/reading/collection-a/sessions/reading-session-a','/learning/reading'],['/notebooks/notebook-a','/notebooks']]) assert.equal(model.switchDestination(from),to);
 for(const path of ['/partners/partner-a','/partners/groups/group-a','/personalization','/space/skills','/memory/l2/profile','/calendar','/profile','/settings/appearance']) assert.equal(model.switchDestination(path),path);
});
test('M2 password/avatar validation preserves source thresholds and errors',()=>{
 assert.equal(model.passwordError('fixture-password','short','short','fixture-password'),'Password must be at least 8 characters');
 assert.equal(model.passwordError('fixture-password','new-password','mismatch','fixture-password'),'Passwords do not match');
 assert.equal(model.passwordError('wrong','new-password','new-password','fixture-password'),'Current password is incorrect');
 assert.equal(model.passwordError('fixture-password','new-password','new-password','fixture-password'),null);
 assert.equal(model.avatarError(20*1024*1024,true),null);assert.equal(model.avatarError(20*1024*1024+1,true),'Image is too large');assert.equal(model.avatarError(1024,false),'Could not decode image');
});
test('Navigation search contains only app pages, translated filtering and permission gating; no fixture entities',()=>{
 const {searchRecords}=load('src/features/search/repository.ts');
 assert.equal(searchRecords('Mathematics','fixture-ws-a',()=>true).length,0);
 assert.ok(searchRecords('','',()=>true).every(r=>r.kind==='page'));
 assert.equal(searchRecords('xxxxx','',()=>true).length,0);
 assert.ok(searchRecords('налаштування','',()=>true,key=>key==='Settings'?'Налаштування':key).some(r=>r.id==='settings'));
 assert.ok(searchRecords('agents','',href=>model.allowedDestination('learner',href)).every(r=>r.href!=='/agents'));
});
test('M2 appearance retains all source syntax themes and exact fixed preview text',()=>{
 const options=require('../src/features/settings/code-options.json');const fixture=require('../src/features/settings/code-preview.json');
 const original=fs.readFileSync(path.join(root,'docs/mobile-ui/audit/source/web/features/settings/sections/AppearanceSettingsSection.tsx'),'utf8').match(/const CODE_BLOCK_PREVIEW_SNIPPET = `([\s\S]*?)`;/)[1];
 assert.equal(fixture.raw,original);assert.equal(options.length,46);assert.equal(Object.keys(fixture.styles).length,options.length);
 assert.equal(fixture.lines.map(line=>line.map(token=>token.text).join('')).join('\n'),original);
});
test('M2 source copy has Ukrainian/English labels and fixture files import no live transport',()=>{
 const messages={en:require('../src/i18n/locales/en.json'),uk:require('../src/i18n/locales/uk.json')};assert.equal(messages.uk['Email or username'],require('../docs/mobile-ui/audit/source/web/locales/uk/app.json')['Email or username']);
 assert.notEqual(messages.uk['Appearance'],messages.en['Appearance']);
 for(const owner of ['entry','resources','search','settings']) for(const name of fs.readdirSync(path.join(root,'src/features',owner))) if(/\.(tsx?|json)$/.test(name)&&name!=='code-preview.json'&&!(['settings','search','resources'].includes(owner)&&name==='api.ts')) assert.doesNotMatch(fs.readFileSync(path.join(root,'src/features',owner,name),'utf8'),/from\s+['"][^'"]*(?:api\/client|axios)|\bfetch\s*\(|new WebSocket/);
});
