const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = process.cwd();
const cache = new Map();

function resolveLocal(request, parent) {
  if (request.startsWith('@/')) return path.join(root, `${request.slice(2)}.ts`);
  if (request.startsWith('.')) {
    const base = path.resolve(path.dirname(parent), request);
    return fs.existsSync(`${base}.ts`) ? `${base}.ts` : path.join(base, 'index.ts');
  }
  return null;
}

function loadTs(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const source = fs.readFileSync(filename, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const localRequire = (request) => {
    const resolved = resolveLocal(request, filename);
    return resolved ? loadTs(resolved) : require(request);
  };
  new Function('require', 'module', 'exports', '__filename', '__dirname', code)(localRequire, module, module.exports, filename, path.dirname(filename));
  return module.exports;
}

function key(value) {
  return String(value ?? '')
    .toLocaleLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, '');
}

function groups(items, field) {
  const map = new Map();
  for (const item of items) {
    const value = key(item[field]);
    if (!value) continue;
    const list = map.get(value) ?? [];
    list.push(item);
    map.set(value, list);
  }
  return [...map.values()].filter((list) => list.length > 1);
}

function displayGroups(title, groups, field) {
  const lines = [`## ${title}`, ''];
  if (!groups.length) return [...lines, 'None.', ''];
  for (const group of groups) {
    lines.push(`- \`${group.map((item) => item.id).join('`, `')}\` — ${group[0][field]}`);
  }
  lines.push('');
  return lines;
}

const driver = loadTs(path.join(root, 'lib/driver-experiences.ts')).getDriverExperiences().map((item) => ({ ...item, module: 'Driver' }));
const nanny = loadTs(path.join(root, 'lib/nanny-experiences.ts')).getNannyExperiences().map((item) => ({ ...item, module: 'Nanny' }));
const factoryManager = loadTs(path.join(root, 'lib/factory-experiences.ts')).getFactoryExperiences().map((item) => ({ ...item, chinese: item.task, module: 'Factory Manager' }));
const moduleExperiences = loadTs(path.join(root, 'lib/module-experiences.ts')).moduleExperiences;
const factoryRoles = Object.entries(moduleExperiences)
  .filter(([role]) => !['driver', 'nanny'].includes(role))
  .flatMap(([role, experiences]) => experiences.map((item) => ({ ...item, module: `Factory ${role}` })));
const social = loadTs(path.join(root, 'lib/social-experiences.ts')).getSocialExperiences().map((item) => ({ ...item, module: 'Social' }));
const all = [...driver, ...nanny, ...factoryManager, ...factoryRoles, ...social];

const sameTask = groups(all, 'chinese');
const sameIndonesian = groups(all, 'indonesian');
const sameHarvest = (() => {
  const map = new Map();
  for (const item of all) {
    const value = (item.harvest ?? []).map(key).filter(Boolean).sort().join('|');
    if (!value) continue;
    const list = map.get(value) ?? [];
    list.push(item);
    map.set(value, list);
  }
  return [...map.values()].filter((list) => list.length > 1);
})();

const placeholder = all.filter((item) => [item.task, item.indonesian, item.explanation, ...(item.harvest ?? [])]
  .some((value) => /belum tersedia|tolong bantu urus rumah/i.test(String(value)) || /^\s*--\s*$/.test(String(value))));
const missingHarvest = all.filter((item) => !(item.harvest ?? []).length);
const factoryWithoutPattern = [...factoryManager, ...factoryRoles].filter((item) => !item.pattern);
const socialWithoutInsight = social.filter((item) => !item.insight);
const patterns = fs.readFileSync(path.join(root, 'components/PatternBuilder.tsx'), 'utf8');
const patternMatches = [...patterns.matchAll(/\{ id:\s*'([^']+)',\s*sentence:\s*`([^`]+)`/g)].map((match) => `${match[1]}: ${match[2]}`);

const lines = [
  '# IndoBrain Content Inventory & Duplicate Report',
  '',
  'Scope: Driver, Nanny, Factory Manager, Factory roles, Social, Harvest, and the current Pattern page.',
  '',
  '## Inventory',
  '',
  `- Driver: ${driver.length}`,
  `- Nanny: ${nanny.length}`,
  `- Factory Manager: ${factoryManager.length}`,
  `- Factory role lessons: ${factoryRoles.length}`,
  `- Social: ${social.length}`,
  `- Total lessons: ${all.length}`,
  `- Pattern templates: ${patternMatches.length}`,
  '',
  '## Audit Result',
  '',
  `- Placeholder or fallback lessons: ${placeholder.length}`,
  `- Lessons without Harvest: ${missingHarvest.length}`,
  `- Factory lessons without reusable Pattern: ${factoryWithoutPattern.length}`,
  `- Social lessons without IndoBrain Insight: ${socialWithoutInsight.length}`,
  `- Exact duplicate Chinese titles: ${sameTask.length} groups`,
  `- Exact duplicate Indonesian lines: ${sameIndonesian.length} groups`,
  `- Exact duplicate complete Harvest sets: ${sameHarvest.length} groups`,
  '',
  ...displayGroups('Duplicate Chinese Titles', sameTask, 'chinese'),
  ...displayGroups('Duplicate Indonesian Lines', sameIndonesian, 'indonesian'),
  ...displayGroups('Duplicate Harvest Sets', sameHarvest, 'harvest'),
  '## Pattern Inventory',
  '',
  ...patternMatches.map((pattern, index) => `${index + 1}. ${pattern}`),
  '',
  '## Content Decision',
  '',
  'New lessons must not reuse an exact Chinese task, exact Indonesian line, or full Harvest set listed above. Cross-category culture examples are retained because their cultural explanation differs, but they are excluded from new-content candidates.',
];

fs.mkdirSync(path.join(root, 'docs', 'audits'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'audits', 'Sprint-2-Duplicate-Report.md'), `${lines.join('\n')}\n`);
console.log(JSON.stringify({ counts: { driver: driver.length, nanny: nanny.length, factoryManager: factoryManager.length, factoryRoles: factoryRoles.length, social: social.length, total: all.length, patterns: patternMatches.length }, duplicateChineseGroups: sameTask.length, duplicateIndonesianGroups: sameIndonesian.length, duplicateHarvestGroups: sameHarvest.length, placeholder: placeholder.map((item) => item.id), missingHarvest: missingHarvest.map((item) => item.id), factoryWithoutPattern: factoryWithoutPattern.map((item) => item.id), socialWithoutInsight: socialWithoutInsight.map((item) => item.id) }, null, 2));
