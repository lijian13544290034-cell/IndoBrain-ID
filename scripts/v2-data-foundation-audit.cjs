/* Read-only inventory for V2.0A. It never writes content or user data. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = process.cwd();
const cache = new Map();

function resolveLocal(request, parent) {
  if (request.startsWith('@/')) return path.join(root, `${request.slice(2)}.ts`);
  if (!request.startsWith('.')) return null;
  const base = path.resolve(path.dirname(parent), request);
  return fs.existsSync(`${base}.ts`) ? `${base}.ts` : path.join(base, 'index.ts');
}
function loadTs(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: filename }).outputText;
  const localRequire = (request) => { const resolved = resolveLocal(request, filename); return resolved ? loadTs(resolved) : require(request); };
  new Function('require', 'module', 'exports', '__filename', '__dirname', code)(localRequire, module, module.exports, filename, path.dirname(filename));
  return module.exports;
}
const catalog = loadTs(path.join(root, 'lib/experience-catalog.ts')).getExperienceCatalog();
const { normalizeHarvestForAchievement } = loadTs(path.join(root, 'lib/learning-achievements.ts'));
const patterns = loadTs(path.join(root, 'lib/v2/patterns.ts')).legacyPatternV2Examples;
const { toExperienceV2 } = loadTs(path.join(root, 'lib/v2/content-foundation.ts'));
const { addTrialMembershipMonths, recordUniqueUsage } = loadTs(path.join(root, 'lib/v2/membership.ts'));
const { calculateIndonesiaPower, getIndonesiaLevel } = loadTs(path.join(root, 'lib/v2/indonesia-power.ts'));
const harvest = new Set(catalog.flatMap((item) => item.harvest.map(normalizeHarvestForAchievement)).filter(Boolean));
const counts = { experiences: catalog.length, uniqueHarvest: harvest.size, patterns: patterns.length };
const theoreticalMaximumIndonesiaPower = counts.experiences * 5 + counts.uniqueHarvest * 2 + counts.patterns * 3;
const first = toExperienceV2(catalog[0]);
const firstUsage = { resourceType: 'EXPERIENCE', resourceKey: first.id, firstUsedAt: '2026-08-01T00:00:00.000Z' };
const once = recordUniqueUsage([], firstUsage);
const twice = recordUniqueUsage(once.usage, firstUsage);
const expiry = addTrialMembershipMonths(new Date('2026-08-01T10:00:00.000Z'));
const validations = {
  adapterPreservesId: first.id === catalog[0].id,
  adapterPreservesRoute: first.legacy.href === catalog[0].href,
  uniqueUsageIsIdempotent: once.added && !twice.added && twice.usage.length === 1,
  naturalMonthExpiry: expiry.toISOString() === '2027-02-01T10:00:00.000Z',
  powerFormula: calculateIndonesiaPower({ newlyCompletedExperienceCount: 1, newlyMasteredHarvestCount: 2, newlyMasteredPatternCount: 1 }) === 12,
  maximumLevel: getIndonesiaLevel(theoreticalMaximumIndonesiaPower).id,
};
console.log(JSON.stringify({ counts, theoreticalMaximumIndonesiaPower, validations }, null, 2));
