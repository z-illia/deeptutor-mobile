const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const languages = Object.keys(read('src/i18n/foundation-messages.json'));
const screens = read('src/features/mobile/screens.json');
const keys = new Set();
const authored = new Set();
const internalNames = new Set();
function visitNode(node) {
  internalNames.add(node.name);
  if (node.content) {
    if (node.name === 'Full original learning goal' || node.fontFamily === 'IBM Plex Mono') authored.add(node.content);
    else keys.add(node.content);
  }
  (node.children || []).forEach(visitNode);
}
for (const screen of screens) {
  keys.add(screen.name.split(' / ')[1]);
  visitNode(screen.header); visitNode(screen.content);
}
const snapshotKeys = new Set(keys);
const existing = Object.fromEntries(languages.map(language => [language, {}]));
for (const name of ['runtime', 'foundation', 'm2', 'm4', 'mobile']) {
  for (const [language, bundle] of Object.entries(read(`src/i18n/${name}-messages.json`))) {
    for (const [key, translated] of Object.entries(bundle)) {
      keys.add(key);
      if (translated && translated !== key) existing[language][key] = translated;
    }
  }
}
function files(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? files(file) : /\.tsx?$/.test(file) ? [file] : [];
  });
}
for (const file of [...files('src/app'), ...files('src/features'), ...files('src/shared')]) {
  if (/foundation|DeveloperFixtures/.test(file)) continue;
  const sf = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function scan(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const text = node.text;
      // Include runtime errors, option labels and labels stored in data arrays, as well as direct t() calls.
      if (text.trim() && (/^[A-ZА-ЯІЇЄҐ]/.test(text) || /\s/.test(text)) && (!internalNames.has(text) || snapshotKeys.has(text))) keys.add(text);
    }
    ts.forEachChild(node, scan);
  }
  scan(sf);
}
const brands = new Set([
  'DeepTutor', 'DEEPTUTOR', 'Dito', 'Ada', 'OpenAI', 'OpenAI Codex', 'OpenRouter', 'GitHub', 'ChatGPT', 'Claude Code', 'Codex', 'Grok', 'Antigravity', 'Kimi', 'opencode', 'MiMo', 'Hermes', 'OpenClaw', 'DeepSeek',
  'LlamaIndex', 'GraphRAG', 'LightRAG', 'LightRAG Server', 'PageIndex OSS', 'PageIndex Cloud', 'Tencent IMA', 'WeKnora', 'Obsidian', 'MarginNote 4', 'Kiwix / ZIM', 'MinerU', 'Docling', 'markitdown', 'PyMuPDF4LLM', 'LiteParse', 'Tika', 'alphaXiv Research', 'Zotero', 'CLI', 'MCP', 'API', 'SSE', 'Streamable HTTP', 'HTTP', 'HTTPS', 'PDF', 'JSON', 'Markdown', 'Word', 'XLSX', 'CSV', 'TSV', 'XLSX · CSV · TSV · JSON', 'docx · pdf · pptx · xlsx',
  'English', 'Українська', 'Polski', '中文', '简体中文', 'Français', 'Deutsch', 'Português', 'Tiếng Việt', '日本語', 'Türkçe',
]);
function invariant(text) {
  return text !== text.trim() || authored.has(text) || brands.has(text) || !/[A-Za-z\u0400-\u04ff]/.test(text)
    || /^(?:https?:\/\/|@\/|\.\.?\/|\/|--|#[0-9a-f]{3,8}\b)/i.test(text)
    || /(?:\n|^)(?:import |export |const |function |app\.get\(|def |    |```)/.test(text)
    || /^[\w.-]+\.(?:md|png|jpg|svg|csv|json|pdf|tsx?|cjs|epub|xlsx)\b/i.test(text)
    || /^(?:GPT-|gpt-|openai\/|text-embedding-|Q W E R|A S D F|↑ Z X C|Claude Code · Codex ·)/.test(text)
    || /^[a-z0-9_-]+$/.test(text)
    || /^(?:[\w.-]+\/)+[\w.*-]*$/.test(text)
    || /^[*\w]+(?:,\w+)+$/.test(text);
}
const allKeys = [...keys].filter(key => key && key.trim()).sort();
module.exports = { languages, keys: allKeys, existing, invariant, authored: [...authored], screens };
if (require.main === module) {
  const required = allKeys.filter(key => !invariant(key));
  const manifest = { keys: required, invariants: allKeys.filter(invariant), authored: [...authored] };
  if (process.argv.includes('--check')) {
    const committed = read('src/i18n/locale-contract.json');
    const complete = read('src/i18n/complete-messages.json');
    const added = required.filter(key => !committed.keys.includes(key));
    const missing = languages.flatMap(language => required.filter(key => !complete[language]?.[key]).map(key => ({ language, key })));
    if (added.length || missing.length) {
      console.error(JSON.stringify({ added, missing }, null, 2));
      process.exitCode = 1;
    }
  } else {
    fs.writeFileSync(path.join(root, 'src/i18n/locale-contract.json'), JSON.stringify(manifest, null, 2) + '\n');
    fs.writeFileSync('/tmp/localization-work.json', JSON.stringify({ languages, required, existing }));
  }
  console.log(`${required.length} translatable keys; ${manifest.invariants.length} technical/unchanged strings`);
}
