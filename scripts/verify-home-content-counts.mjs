import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const failures = [];
const require = createRequire(import.meta.url);
const Module = require('node:module');
const ts = require('typescript');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveFilename(request, parent, ...rest) {
  const resolvedRequest = request.startsWith('@/') ? path.join(root, request.slice(2)) : request;
  return originalResolveFilename.call(this, resolvedRequest, parent, ...rest);
};
require.extensions['.ts'] = function loadTypeScript(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  module._compile(output, filename);
};

const { getContentStats } = require(path.join(root, 'lib/content-stats.ts'));
const { getMicroSceneStats } = require(path.join(root, 'lib/micro-scenes.ts'));
const { loveScenes } = require(path.join(root, 'lib/love-indonesian-content.ts'));
const contentStats = getContentStats();
const microSceneStats = getMicroSceneStats();
const homeSource = fs.readFileSync(path.join(root, 'components/V2HomeDashboard.tsx'), 'utf8');

const counts = {
  vocabulary: contentStats.vocabularyCount,
  basicEssentials: contentStats.basicEssentialsConceptCount,
  microScenes: microSceneStats.visibleAssetCount,
  goldenScenes: contentStats.goldenSceneCount,
  love: contentStats.loveSceneCount,
};

for (const [category, count] of Object.entries(counts)) {
  if (!Number.isInteger(count) || count <= 0) failures.push(`${category} count is invalid: ${count}`);
}
if (contentStats.loveSceneCount !== loveScenes.length) failures.push('Love count is not derived from the canonical scene array');

for (const binding of [
  'contentStats.vocabularyCount',
  'contentStats.basicEssentialsConceptCount',
  'microSceneStats.visibleAssetCount',
  'contentStats.goldenSceneCount',
  'contentStats.loveSceneCount',
]) {
  if (!homeSource.includes(binding)) failures.push(`Homepage count binding missing: ${binding}`);
}
for (const label of ['生词', '基础必会', '微场景', '黄金场景', '印尼语恋爱大全']) {
  if (!homeSource.includes(`label: '${label}'`)) failures.push(`Homepage learning category missing: ${label}`);
}
if (!homeSource.includes('items-baseline') || !homeSource.includes('tabular-nums')) failures.push('Homepage count display is not attached to the category title');
if (/hidden[^"']*\{link\.count\}/.test(homeSource)) failures.push('Homepage counts remain hidden on mobile');

if (failures.length) {
  console.error(`HOME CONTENT COUNTS: FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('HOME CONTENT COUNTS: PASS');
console.log(JSON.stringify(counts, null, 2));
