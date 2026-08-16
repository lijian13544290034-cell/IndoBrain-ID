import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const ts = require('typescript');

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveIndobrainAlias(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    return originalResolveFilename.call(this, path.join(root, request.slice(2)), parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const { getExperienceCatalog } = require(path.join(root, 'lib', 'experience-catalog.ts'));
const { harvestMeaning, harvestTerm } = require(path.join(root, 'lib', 'harvest.ts'));

const questionPattern = /\b(di mana|ke mana|dari mana|berapa|kapan|siapa|kenapa|bagaimana|gimana|ada apa|sampai kapan)\b/i;
const questionMeaningPattern = /[?？]|哪里|哪儿|多久|多远|多少|什么时候|谁|为什么|怎么|怎样|如何|什么|几/;
const chinesePattern = /[\u4e00-\u9fff]/;
const obviousWordByWordPattern = /[\u4e00-\u9fff]\s+[\u4e00-\u9fff]/;

const knownWrongMeanings = new Map([
  ['di mana', new Set(['在'])],
  ['ke mana', new Set(['去'])],
  ['dari mana', new Set(['从'])],
  ['siapa yang pegang', new Set(['的'])],
  ['jam delapan', new Set(['点钟'])],
  ['tutup hari ini', new Set(['天 这个'])],
  ['terima kasih', new Set(['收到 给'])],
  ['sudah mulai', new Set(['开始'])],
  ['mesin dihentikan', new Set(['机器'])],
]);

function isObviousWordByWord(meaning) {
  if (!obviousWordByWordPattern.test(meaning)) return false;
  if (meaning.includes('/') || /[A-Za-z0-9]/.test(meaning)) return false;
  return true;
}

function pronounSuffixIssue(term, meaning) {
  const lower = term.toLocaleLowerCase();
  if (lower.includes('-ku') && !/(我|我的)/.test(meaning)) return 'missing -ku ownership';
  if (lower.includes('-mu') && !/(你|你的)/.test(meaning)) return 'missing -mu ownership';
  if (lower === 'toiletnya' && !/(厕所|洗手间)/.test(meaning)) return 'toiletnya must be scene meaning, not literal ownership';
  return null;
}

const seenScenes = new Set();
const items = [];

for (const scene of getExperienceCatalog()) {
  if (!scene?.id || seenScenes.has(scene.id)) continue;
  seenScenes.add(scene.id);
  for (const entry of scene.harvest ?? []) {
    const term = harvestTerm(entry);
    const meaning = harvestMeaning(entry);
    items.push({
      sceneId: scene.id,
      href: scene.href,
      term,
      normalizedTerm: term.toLocaleLowerCase(),
      meaning,
      raw: entry,
    });
  }
}

const issues = [];

for (const item of items) {
  const term = item.normalizedTerm;
  const meaning = item.meaning ?? '';
  const knownWrong = knownWrongMeanings.get(term);

  if (!meaning || meaning === '印尼语短语') {
    issues.push({ ...item, issue: 'missing or placeholder meaning' });
    continue;
  }

  if (!chinesePattern.test(meaning)) {
    issues.push({ ...item, issue: 'meaning is not Chinese' });
  }

  if (knownWrong?.has(meaning)) {
    issues.push({ ...item, issue: 'known wrong meaning' });
  }

  if (questionPattern.test(item.term) && !questionMeaningPattern.test(meaning)) {
    issues.push({ ...item, issue: 'question expression lacks question meaning' });
  }

  if (item.term.trim().split(/\s+/).length >= 2 && isObviousWordByWord(meaning)) {
    issues.push({ ...item, issue: 'obvious word-by-word Chinese' });
  }

  const suffixIssue = pronounSuffixIssue(item.term, meaning);
  if (suffixIssue) issues.push({ ...item, issue: suffixIssue });
}

const highRiskItems = items.filter((item) => {
  const term = item.term;
  return questionPattern.test(term)
    || /(-ku|-mu|-nya)\b/i.test(term)
    || term.trim().split(/\s+/).length >= 2
    || /\b(sudah|belum|masih|lagi|habis|tinggal|cukup|kurang|nggak|gak|ga|udah|bentar|gimana|gapapa|hp)\b/i.test(term);
});

console.log(`TOTAL VOCAB ITEMS: ${items.length}`);
console.log(`HIGH-RISK ITEMS REVIEWED: ${highRiskItems.length}`);
console.log(`SEMANTIC ISSUES: ${issues.length}`);

if (issues.length) {
  console.error('\nCHINESE MEANING QUALITY AUDIT: FAIL');
  for (const issue of issues.slice(0, 80)) {
    console.error(`${issue.issue}\t${issue.sceneId}\t${issue.term}\t${issue.meaning}\t${issue.href}`);
  }
  if (issues.length > 80) console.error(`...and ${issues.length - 80} more`);
  process.exit(1);
}

console.log('CHINESE MEANING QUALITY AUDIT: PASS');
