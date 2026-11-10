const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const languages = ['en', 'zh', 'fr', 'de', 'uk', 'pl', 'pt', 'vi', 'ja', 'tr'];
const contract = read('src/i18n/locale-contract.json');
const unchanged = new Set([...contract.invariants, ...contract.authored]);
const entries = [];
const dynamicLookups = [];
const sourceKeys = new Set();
// Product names, the text-size glyph and a required CSV header are not prose.
const literalExceptions = new Map([
  ['Expo Starter', 'Starter product name'],
  ['Aa', 'Text-size control glyph'],
  [': username,password,preset', 'Required CSV schema'],
]);
function files(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(item => {
    const file = path.join(dir, item.name);
    return item.isDirectory() ? files(file) : /\.tsx?$/.test(file) ? [file] : [];
  });
}
for (const file of files('src')) {
  if (/src\/legacy\/|features\/foundation\/|DeveloperFixtures|src\/i18n\//.test(file)) continue;
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function add(node, key, kind) {
    if (!/[a-zA-Z]{2}/.test(key)) return;
    entries.push({ file, line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, key, kind });
  }
  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) sourceKeys.add(node.text);
    if (ts.isCallExpression(node) && node.expression.getText(sf) === 't' && node.arguments[0]) {
      function argument(arg) {
        if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) add(arg, arg.text, 'localized');
        else if (ts.isConditionalExpression(arg)) { argument(arg.whenTrue); argument(arg.whenFalse); }
        else dynamicLookups.push({ file, line: sf.getLineAndCharacterOfPosition(arg.getStart(sf)).line + 1, expression: arg.getText(sf) });
      }
      argument(node.arguments[0]);
    }
    if (ts.isJsxText(node) && node.text.trim() && !/^(DeepTutor|DEEPTUTOR)$/.test(node.text.trim())) add(node, node.text.replace(/\s+/g, ' ').trim(), 'unwrapped');
    if (ts.isJsxAttribute(node) && ['accessibilityLabel', 'accessibilityHint', 'placeholder', 'title', 'label', 'description', 'message', 'hint'].includes(node.name.getText(sf)) && node.initializer && ts.isStringLiteral(node.initializer)) add(node.initializer, node.initializer.text, 'literal-prop');
    ts.forEachChild(node, visit);
  }
  visit(sf);
}
const screens = read('src/features/mobile/screens.json');
function texts(node) { return [node.content, ...(node.children || []).flatMap(texts)].filter(Boolean); }
for (const screen of screens) for (const key of [screen.name.split(' / ')[1], ...texts(screen.header), ...texts(screen.content)].filter(Boolean)) {
  sourceKeys.add(key);
  entries.push({ file: `/mobile/${screen.number}`, key, kind: 'snapshot-text' });
}
for (const entry of entries) sourceKeys.add(entry.key);
if (process.argv.includes('--extract')) {
  for (const language of languages) {
    const source = read(`docs/mobile-ui/audit/source/web/locales/${language}/app.json`);
    const target = read(`src/i18n/locales/${language}.json`);
    for (const key of [...sourceKeys].sort()) {
      if (source[key] && source[key] !== key && !target[key]) target[key] = source[key];
    }
    fs.writeFileSync(path.join(root, `src/i18n/locales/${language}.json`), JSON.stringify(target, null, 2) + '\n');
  }
}
const merged = Object.fromEntries(languages.map(language => [language, read(`src/i18n/locales/${language}.json`)]));
const report = {
  note: 'Static coverage of localized calls and all mobile specifications. Technical strings, code and authored content are explicit invariants. Dynamic lookups require interaction testing; see scripts/verify-locales.cjs.',
  mobileScreens: screens.length,
  routes: files('src/app').filter(file => file.endsWith('.tsx')),
  dynamicLookups,
  unwrapped: entries.filter(entry => entry.kind === 'unwrapped' && !unchanged.has(entry.key) && !literalExceptions.has(entry.key)),
  intentionalLiterals: entries.filter(entry => entry.kind === 'unwrapped' && (unchanged.has(entry.key) || literalExceptions.has(entry.key))),
  literalProps: entries.filter(entry => entry.kind === 'literal-prop'),
  locales: Object.fromEntries(languages.filter(language => language !== 'en').map(language => {
    const missing = entries.filter(entry => entry.key.trim() && !unchanged.has(entry.key) && !merged[language][entry.key]);
    return [language, {
      missingUniqueKeys: new Set(missing.map(entry => entry.key)).size,
      missingLocalizedCalls: missing.filter(entry => entry.kind === 'localized'),
      mobileScreens: screens.map(screen => ({ route: `/mobile/${screen.number}`, name: screen.name, missing: [...new Set(missing.filter(entry => entry.file === `/mobile/${screen.number}`).map(entry => entry.key))] })),
    }];
  })),
};
// A nonempty English placeholder in every locale is still an untranslated UI label.
report.englishPlaceholders = entries.filter(entry => entry.kind === 'localized' && !unchanged.has(entry.key) &&
  languages.every(language => merged[language][entry.key] === (merged.en[entry.key] ?? entry.key)));
fs.writeFileSync(path.join(root, 'docs/localization-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Audited ${report.routes.length} route files and ${screens.length} mobile screens.`);
console.log(`Unwrapped UI text: ${report.unwrapped.length}; intentional technical/product literals: ${report.intentionalLiterals.length}.`);
console.log(`English placeholders across all locales: ${report.englishPlaceholders.length}.`);
for (const [language, locale] of Object.entries(report.locales)) console.log(`${language}: ${locale.missingLocalizedCalls.length} localized call sites without a translated value; ${locale.mobileScreens.filter(screen => screen.missing.length).length} mobile screens contain untranslated snapshot text.`);
if (process.argv.includes('--check') && (report.unwrapped.length || report.englishPlaceholders.length ||
  Object.values(report.locales).some(locale => locale.missingLocalizedCalls.length || locale.mobileScreens.some(screen => screen.missing.length)))) process.exitCode = 1;
module.exports = report;
