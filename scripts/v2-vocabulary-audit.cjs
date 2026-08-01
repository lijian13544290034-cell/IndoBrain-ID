/* Read-only QA for V2.0B vocabulary. */
const fs = require('node:fs'); const path = require('node:path'); const ts = require('typescript');
const root = process.cwd(); const cache = new Map();
function resolveLocal(request, parent) { if (request.startsWith('@/')) return path.join(root, `${request.slice(2)}.ts`); if (!request.startsWith('.')) return null; const base = path.resolve(path.dirname(parent), request); return fs.existsSync(`${base}.ts`) ? `${base}.ts` : path.join(base, 'index.ts'); }
function loadTs(filename) { if (cache.has(filename)) return cache.get(filename).exports; const module = { exports: {} }; cache.set(filename, module); const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: filename }).outputText; const localRequire = (request) => { const resolved = resolveLocal(request, filename); return resolved ? loadTs(resolved) : require(request); }; new Function('require', 'module', 'exports', '__filename', '__dirname', code)(localRequire, module, module.exports, filename, path.dirname(filename)); return module.exports; }
const vocabulary = loadTs(path.join(root, 'lib/vocabulary-library.ts')).vocabularyLibrary;
const catalog = loadTs(path.join(root, 'lib/experience-catalog.ts')).getExperienceCatalog();
const { normalizeHarvestForAchievement } = loadTs(path.join(root, 'lib/learning-achievements.ts'));
const harvestKeys = new Set(catalog.flatMap((item) => item.harvest.map(normalizeHarvestForAchievement)).filter(Boolean));
const duplicates = vocabulary.filter((item, index) => vocabulary.findIndex((other) => other.normalizedKey === item.normalizedKey) !== index);
const missing = vocabulary.filter((item) => !item.id || !item.textId || !item.textZh || !item.normalizedKey || !item.pronunciationText);
const perCategory = Object.fromEntries([...new Set(vocabulary.map((item) => item.category))].map((category) => [category, vocabulary.filter((item) => item.category === category).length]));
const search = (query) => vocabulary.filter((item) => [item.textId, item.textZh, item.normalizedKey, ...item.tags, item.usageNoteZh ?? ''].join(' ').toLocaleLowerCase('id-ID').includes(query.toLocaleLowerCase('id-ID'))).length;
console.log(JSON.stringify({ total: vocabulary.length, perCategory, reusedExistingHarvest: vocabulary.filter((item) => harvestKeys.has(item.normalizedKey)).length, duplicates: duplicates.map((item) => item.id), missing: missing.map((item) => item.id), searchChecks: { chinese: search('厨房'), indonesian: search('bandara'), tag: search('称呼'), noResult: search('不存在的词') } }, null, 2));
