const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const languages = ['en', 'zh', 'fr', 'de', 'uk', 'pl', 'pt', 'vi', 'ja', 'tr'];
const screens = read('src/features/mobile/screens.json');
const keys = new Set();
const authored = new Set();
const internalNames = new Set();
const seedEntities = new Set([
  'Software Development', 'Senior Backend Engineer', 'Backend engineering', 'Node.js & TypeScript',
  'Software Architecture', 'System Design & Distributed Systems', 'Practical Challenges & Engineering Exercises',
  'Production Engineering, Reliability & Security', 'Databases', 'The Art of PostgreSQL', 'Database Internals',
  'Mastering Domain-Driven Design', 'Fundamentals of Software Architecture', 'Designing Data-Intensive Applications',
  'Mastering Site Reliability Engineering in Enterprise', 'Isolation levels', 'Explain database isolation levels briefly.',
  'Event loop & latency', 'Streams & backpressure', 'Types & boundaries', 'Study event loop & latency',
  'Next · Diagnose blocking in a service', 'Choose concurrency limits for a busy API',
  'Find risky assumptions in module contracts', 'Next · Diagnose the Node.js event loop', 'Backend reference',
  'distributed transactions worksheet', 'November 2026', 'Friday, 6 Nov', 'Friday, 6 November', '1–7 November',
  '6 November · Footprints', 'Sunday 1', 'Monday 2', 'Tuesday 3', 'Wednesday 4', 'Thursday 5', 'Friday 6',
  'Saturday 7', 'Sunday 8', 'Row 1 · Isolation levels', 'Row 2 · Transaction snapshot', 'A · At transaction start',
  'B · At each statement', 'C · After every row',
  'Read committed takes a new snapshot at each statement. Two statements can see different committed data.',
  'Characteristic polynomial & eigenspace geometry', 'Orthogonal complex exponential basis',
  'Column space & rank-nullity theorem', 'Balanced FSRS', 'Balanced FSRS copy', 'Foundations & Core Principles',
  'Establish the fundamental concepts and vocabulary.', 'Core definitions and geometric intuition',
  'First waypoint on your route.',
  'Ask me anything about why the trace equals the sum of eigenvalues or how to factor the characteristic polynomial.',
  'Explain the geometric meaning of the determinant of a 2×2 matrix.',
  'Fourier Session', 'Eigenvalues Session', 'MIT 18.06 Web Reference', 'Quiz Q1 Follow-up',
  'MIT 18.06 Lecture Summary — Orthogonal Projections, Eigenvalues, and Singular Value Decomposition.',
  'For the matrix A = [[4, 1], [2, 3]], what is the sum of its eigenvalues?', 'Eigenvalues trace check',
  'LlamaIndex · text-embedding-3-small · 1536d', 'Default embedding · OpenRouter', 'Default · OpenAI Codex',
  'Embedding · OpenRouter', 'LlamaIndex · change engine',
  'brainstorm · web_search · reason · paper_search · zotero_search · geogebra_analysis · imagegen · videogen',
]);
function isSeedText(text) {
  if (seedEntities.has(text)) return true;
  if (/^(?:#{1,4}\s|- \*\*|- (?:Anti-causal|Balanced|Causal|Fast Fourier|Let |Orthogonal|Verified)|[12]\.\s+\*\*|[123]\.\s+(?:Characteristic|Spectral|Subtract)|Because \$1|When we solve|I organized your route|Let[’']s (?:study|review) "|Let's design the learning outline together from|Ready for your spaced review|Structured an initial 2-module route|Mastery Path · 0\/4|Learning starts with a question\.)/.test(text)) return true;
  if (/^\d[\d,]*\s*(?:\/|of\b|files\b|chunks\b|documents\b|modules\b|pages\b|knowledge bases\b|traces\b|versions\b|sources\b|configured\b|active days\b|facts\b|propositions\b|due\b|selected\b|tracked\b|engines\b|worker\b|path\b|search\b|spaced\b|conversations\b|messages\b|calls\b|tokens\b|questions\b|rows\b|KB\b|MB\b|B\b|·\s*(?:Next|L[123]|recall|curate|choose|range))|^0[1-7]\s{2}/.test(text)) return true;
  if (/\b(?:PDF|EPUB)\s*·\s*\d+(?:\.\d+)?\s*(?:MB|KB)\b|\b(?:MB|KB|B)\s*·\s*(?:web source|learn\/)|\b(?:500K|272K)\s+context\b|\bTTFT\s+\d+|\b\d+%\s+of\s+\d+(?:\.\d+)?\s*GB\b|^Source installation:|^2026 · Reference installation/.test(text)) return true;
  if (/(?:Software Development|Senior Backend Engineer|Isolation levels|Databases|The Art of PostgreSQL)/.test(text) && text !== 'Type Databases to confirm.') return true;
  return false;
}
function isSeedNode(node, screen) {
  const c = node.content || '';
  if (!c) return false;
  if (node.localize === false || node.fontFamily === 'IBM Plex Mono' || isSeedText(c)) return true;
  if (/^(Full original learning goal|Assistant response|Learner question|Question|Last response excerpt|Reading excerpt|Selected passage body|Reading position|Reading heading|Soul draft|Editor content|Markdown draft|Draft note|Original paragraph|Tutor explanation|Understanding check|Review explanation|Suggested revision body|Preview paragraph|Practice prompt|Correct · At each statement label|Correct · At each statement body|Module description|Module objective|Module introduction|Objective|Your next knowledge point body|Pick up where you left off body|Already knows value|Wants to reach value|Time available value|Teaching approach value|Last session body|Current mission content|Last-session handoff content|Confirmed learning records content|Path title|Goal title|Mastery count|Source progress|Module progress|Next objective|KB heading|Document title|Document metadata|13:40 · Footprints label|13:40 · Footprints body|Extension purpose|Tool name|Tool purpose|Token total label|Turn runtime healthy body|Backend online body|2 rows ready · 1 needs attention label|2 rows ready · 1 needs attention body|Row 3 · Missing answer label|Row 3 · Missing answer body|2 questions saved label|2 questions saved body|Delete Databases permanently\? label|Delete Databases permanently\? body|Delete conversation body|Reset path progress body|Delete learning path body|\d+ (documents|modules) heading)$/.test(node.name)) return true;
  if (node.name === 'Input value' && !/…|\.\.\.|\/|^Choose |^Type |^Enter |^Search |^Find |^Ask |^Explain |^Provider |^Configure |^Question or |^Tool name |^Model or /i.test(c)) return true;
  if (screen && screen.number >= 131 && screen.number <= 136 && (node.name === 'Context' || node.name === 'Row title' || node.name === 'Screen title')) return true;
  return false;
}
function visitNode(node, screen) {
  internalNames.add(node.name);
  if (node.content) {
    if (isSeedNode(node, screen)) authored.add(node.content);
    keys.add(node.content);
  }
  (node.children || []).forEach(child => visitNode(child, screen));
}
for (const screen of screens) {
  const title = screen.name.split(' / ')[1];
  if (isSeedText(title) || /^Module \d+$/.test(title)) authored.add(title);
  keys.add(title);
  visitNode(screen.header, screen); visitNode(screen.content, screen);
}
const snapshotKeys = new Set([...keys].filter(k => !authored.has(k)));
const existing = Object.fromEntries(languages.map(language => [language, {}]));
for (const language of languages) {
  const bundle = read(`src/i18n/locales/${language}.json`);
  for (const [key, translated] of Object.entries(bundle)) {
    if (isSeedText(key)) authored.add(key);
    keys.add(key);
    if (translated && translated !== key) existing[language][key] = translated;
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
  const isSeedFile = /(?:^|\/)(?:repository\.ts|navigation\.ts)$/.test(file);
  const sf = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function scan(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const text = node.text;
      // Include runtime errors, option labels and labels stored in data arrays, as well as direct t() calls.
      if (text.trim() && (/^[A-ZА-ЯІЇЄҐ]/.test(text) || /\s/.test(text)) && (!internalNames.has(text) || snapshotKeys.has(text))) {
        if ((isSeedFile && !existing.en[text] && !existing.uk[text] && !snapshotKeys.has(text)) || isSeedText(text)) authored.add(text);
        keys.add(text);
      }
    }
    ts.forEachChild(node, scan);
  }
  scan(sf);
}
const brands = new Set([
  'DeepTutor', 'DEEPTUTOR', 'Dito', 'Ada', 'OpenAI', 'OpenAI Codex', 'OpenRouter', 'GitHub', 'ChatGPT', 'Claude Code', 'Codex', 'Grok', 'Antigravity', 'Kimi', 'opencode', 'MiMo', 'Hermes', 'OpenClaw', 'DeepSeek',
  'LlamaIndex', 'GraphRAG', 'LightRAG', 'LightRAG Server', 'PageIndex OSS', 'PageIndex Cloud', 'Tencent IMA', 'WeKnora', 'Obsidian', 'MarginNote 4', 'Kiwix / ZIM', 'MinerU', 'Docling', 'markitdown', 'PyMuPDF4LLM', 'LiteParse', 'Tika', 'alphaXiv Research', 'Zotero', 'CLI', 'MCP', 'API', 'SSE', 'Streamable HTTP', 'HTTP', 'HTTPS', 'PDF', 'JSON', 'Markdown', 'Word', 'XLSX', 'CSV', 'TSV', 'XLSX · CSV · TSV · JSON', 'docx · pdf · pptx · xlsx',
  'English', 'Українська', 'Polski', '中文', '简体中文', 'Français', 'Deutsch', 'Português', 'Tiếng Việt', '日本語', 'Türkçe',
  'Geist', 'GeistMedium', 'GeistSemiBold', 'LoraSemiBold', 'IBM Plex Mono', 'Inter', 'Escape',
  'Compass', 'Mountain', 'Sprout', 'Telescope', 'FlaskConical', 'Brain', 'Ruler', 'Orbit',
]);
function invariant(text) {
  return text !== text.trim() || authored.has(text) || isSeedText(text) || brands.has(text) || !/[A-Za-z\u0400-\u04ff]/.test(text)
    || /^(?:https?:\/\/|@\/|\.\.?\/|\/|--|#[0-9a-f]{3,8}\b)/i.test(text)
    || /^(?:M[0-9](?:\.[0-9])?(?:\s+[-\d.,a-zA-Z]+)?|rgba?\(|radial-gradient\(|0 \d+px|\d+ \d+ \d+ \d+px|\w+Provider is required|use\w+ must be used within|Session cookie was not accepted)/.test(text)
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
    const complete = Object.fromEntries(languages.map(language => [language, read(`src/i18n/locales/${language}.json`)]));
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
