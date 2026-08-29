import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
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
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  module._compile(output, filename);
};

const adapter = require(path.join(root, 'lib/quick-experience-adapter.ts'));
const micro = require(path.join(root, 'lib/micro-scenes.ts'));
const sceneMap = require(path.join(root, 'lib/scene-map-v2.ts'));

const indexSource = read('lib/micro-scenes.ts');
const adapterSource = read('lib/quick-experience-adapter.ts');
const sessionSource = read('components/MicroSceneLearningSession.tsx');
const librarySource = read('components/MicroSceneLibrary.tsx');
const homeSource = read('components/V2HomeDashboard.tsx');
const historical = adapter.getHistoricalQuickExperiences();
const historicalIds = new Set(historical.map((item) => item.sourceId));

if (historical.length !== 421) failures.push(`Expected 421 historical Quick Experience assets, found ${historical.length}`);
if (historicalIds.size !== 421) failures.push(`Expected 421 unique historical Quick Experience IDs, found ${historicalIds.size}`);

const expectedSourceCounts = { driver: 32, nanny: 49, factory: 65, life: 86, social: 70, module: 119 };
for (const [source, expected] of Object.entries(expectedSourceCounts)) {
  const actual = historical.filter((item) => item.source === source).length;
  if (actual !== expected) failures.push(`Expected ${expected} ${source} Quick assets, found ${actual}`);
}

for (const item of historical) {
  for (const field of ['sourceId', 'sceneTitle', 'indonesian', 'chinese', 'explanation']) {
    if (!item[field]?.trim()) failures.push(`${item.sourceId || 'UNKNOWN'} is missing ${field}`);
  }
  if (!Array.isArray(item.harvest) || item.harvest.length === 0) failures.push(`${item.sourceId} is missing harvest`);
}

const quickIndex = micro.microSceneIndex.filter((item) => item.sourceType === 'QUICK_EXPERIENCE');
const mappedQuick = quickIndex.filter((item) => item.enabled && item.reviewStatus === 'READY');
const unmappedQuick = quickIndex.filter((item) => !item.enabled && item.reviewStatus === 'UNMAPPED_REVIEW');
if (quickIndex.length !== 421) failures.push(`Expected all 421 Quick assets in metadata index, found ${quickIndex.length}`);
if (mappedQuick.length !== 369) failures.push(`Expected 369 mapped Quick assets, found ${mappedQuick.length}`);
if (unmappedQuick.length !== 52) failures.push(`Expected 52 UNMAPPED_REVIEW Quick assets, found ${unmappedQuick.length}`);
if (new Set(quickIndex.map((item) => item.sourceId)).size !== 421) failures.push('Quick index contains duplicate stable source IDs');
if (unmappedQuick.some((item) => item.primaryMapping)) failures.push('UNMAPPED_REVIEW assets must not be force-mapped');
if (unmappedQuick.some((item) => !historicalIds.has(item.sourceId))) failures.push('UNMAPPED_REVIEW contains an unknown source ID');
if (micro.getMicroSceneStats().visibleAssetCount !== 369) failures.push('User-facing Micro Scene count must reflect the 369 mapped Quick learning units');

const canonicalLevel1 = new Set(sceneMap.sceneMapV2.map((group) => group.slug));
const topicKeys = new Set(sceneMap.sceneMapV2.flatMap((group) => group.topics.map((topic) => `${group.slug}:${topic.slug}`)));
if (canonicalLevel1.size !== 6) failures.push(`Expected 6 canonical Scene Map level-1 domains, found ${canonicalLevel1.size}`);
if (topicKeys.size !== 36) failures.push(`Expected 36 Scene Map level-2 topics, found ${topicKeys.size}`);

for (const item of mappedQuick) {
  if (!item.primaryMapping || !topicKeys.has(`${item.primaryMapping.level1}:${item.primaryMapping.level2}`)) failures.push(`${item.sourceId} has an invalid primary mapping`);
  for (const mapping of item.secondaryMappings) if (!topicKeys.has(`${mapping.level1}:${mapping.level2}`)) failures.push(`${item.sourceId} has an invalid secondary mapping`);
  const resolved = micro.resolveQuickMicroScene(item);
  if (!resolved) {
    failures.push(`${item.sourceId} does not resolve as a rich Quick learning unit`);
    continue;
  }
  if (resolved.progressKey !== item.sourceId) failures.push(`${item.sourceId} does not use the stable Quick ID for progress`);
  if (!resolved.legacyProgressKeys.includes(`micro:${item.sourceId}`)) failures.push(`${item.sourceId} lacks backward-compatible Micro V1 progress`);
  for (const field of ['sceneTitle', 'indonesian', 'explanation']) if (!resolved[field]?.trim()) failures.push(`${item.sourceId} visible unit is missing ${field}`);
  if (!resolved.harvest.length) failures.push(`${item.sourceId} visible unit is missing harvest`);
}

const forbiddenCopiedFields = ['sceneTitle', 'momentTitle', 'indonesian', 'chinese', 'explanation', 'harvest', 'pattern', 'insight', 'content'];
for (const item of quickIndex) for (const field of forbiddenCopiedFields) if (Object.hasOwn(item, field)) failures.push(`Quick index copied source content field ${field} for ${item.sourceId}`);

for (const domain of sceneMap.sceneMapV2) {
  for (const topic of domain.topics) {
    const items = micro.getQuickMicroScenesForTopic(domain.slug, topic.slug);
    for (let index = 0; index < items.length; index += 1) {
      const next = items[(index + 1) % items.length];
      if (!next || !historicalIds.has(next.sourceId)) failures.push(`Continuous next item does not resolve for ${domain.slug}/${topic.slug}`);
      if (items.length > 1 && index > 0 && items[index - 1].indonesian.trim().toLocaleLowerCase('id-ID') === items[index].indonesian.trim().toLocaleLowerCase('id-ID')) failures.push(`Adjacent exact duplicate in ${domain.slug}/${topic.slug}: ${items[index].sourceId}`);
    }
  }
}

if (indexSource.includes('BASIC_ESSENTIALS_MICRO_SCENE_GROUP_MAP_V1')) failures.push('Planning-only Micro Scene content must not be imported by runtime');
if (!adapterSource.includes('resolveHistoricalQuickExperience')) failures.push('Stable-ID Quick Experience adapter is missing');
if (!librarySource.includes('getQuickMicroSceneDomains') || !librarySource.includes('getQuickMicroScenesForTopic')) failures.push('Primary Micro Scene navigation is not Quick Experience-only');
for (const contract of ['current.explanation', 'current.harvest', 'current.pattern', 'current.insight', 'current.content', 'IndonesianSpeechButton', 'toggleFavorite', '下一场景']) {
  if (!sessionSource.includes(contract)) failures.push(`Rich learning unit contract is missing: ${contract}`);
}
if (!homeSource.includes("href: '/micro-scenes'")) failures.push('Independent homepage Micro Scene entry is missing');

if (failures.length) {
  console.error('MICRO SCENES VERIFY: FAIL');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('MICRO SCENES VERIFY: PASS');
console.log('Historical Quick source integrity: 421');
console.log('Mapped Quick learning units: 369');
console.log('UNMAPPED_REVIEW preserved: 52');
console.log('Canonical level-1: 6');
console.log('Level-2 topics: 36');
console.log('Rich source resolution: stable IDs, no content copied into index');
console.log('Progress identity: stable Quick ID + backward-compatible micro:{id} read');
