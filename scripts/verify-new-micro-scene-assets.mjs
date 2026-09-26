import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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

const { newMicroSceneAssets, newMicroScenePlacements } = require(path.join(root, 'lib/new-micro-scene-assets.ts'));
const adapter = require(path.join(root, 'lib/quick-experience-adapter.ts'));
const navigation = require(path.join(root, 'lib/historical-micro-navigation.ts'));
const sessionSource = fs.readFileSync(path.join(root, 'components/MicroSceneLearningSession.tsx'), 'utf8');
const expectedIds = Array.from({ length: 50 }, (_, index) => `N${String(index + 1).padStart(2, '0')}`);
const ids = newMicroSceneAssets.map((scene) => scene.id);
const digest = crypto.createHash('sha256').update(JSON.stringify(newMicroSceneAssets)).digest('hex');

if (digest !== '16b07e7412c5740c18ef1ddb250e84c2bdc6680b8b1a5fdbfb4882e2fadabcfd') failures.push(`Human-approved N01-N50 package digest changed: ${digest}`);
if (newMicroSceneAssets.length !== 50) failures.push(`Expected 50 source scenes, found ${newMicroSceneAssets.length}`);
if (ids.join('|') !== expectedIds.join('|')) failures.push(`Expected continuous N01-N50 IDs, found ${ids.join(', ')}`);
if (new Set(ids).size !== 50) failures.push('N01-N50 contains duplicate IDs');
if (Object.keys(newMicroScenePlacements).sort().join('|') !== [...expectedIds].sort().join('|')) failures.push('N01-N50 placement map is incomplete or malformed');

const chineseText = /[\u3400-\u9fff]/;
const placeholder = /印尼语短语|placeholder|todo|tbd/i;
const englishFallback = /\b(?:this means|this phrase|is commonly used|you can use|the speaker|the learner|in this context)\b/i;
const normalized = (value) => value.toLocaleLowerCase('id-ID').replace(/[\s“”'",，。；：、/…（）()[\]_.?!`*-]+/g, '');
const teachingBlocks = [];

for (const scene of newMicroSceneAssets) {
  for (const field of ['assetTitle', 'category', 'task', 'indonesian', 'chinese', 'explanation']) if (!scene[field]?.trim()) failures.push(`${scene.id} missing ${field}`);
  if (!chineseText.test(scene.chinese) || !chineseText.test(scene.explanation)) failures.push(`${scene.id} missing Simplified Chinese learner-facing content`);
  if (placeholder.test(JSON.stringify({ task: scene.task, indonesian: scene.indonesian, chinese: scene.chinese, explanation: scene.explanation, vocabulary: scene.vocabulary, learningTip: scene.learningTip }))) failures.push(`${scene.id} contains a placeholder`);
  if (englishFallback.test(scene.chinese) || englishFallback.test(scene.explanation) || (scene.learningTip && englishFallback.test(scene.learningTip))) failures.push(`${scene.id} contains English learner-facing fallback`);
  if (normalized(scene.chinese) === normalized(scene.explanation)) failures.push(`${scene.id} Penjelasan repeats Chinese translation`);
  if (!Array.isArray(scene.vocabulary) || scene.vocabulary.length === 0) failures.push(`${scene.id} missing Kata Penting`);
  for (const entry of scene.vocabulary ?? []) {
    if (!entry.term?.trim() || !entry.meaning?.trim() || !chineseText.test(entry.meaning)) failures.push(`${scene.id} contains a fake or incomplete vocabulary fragment`);
  }
  if (scene.learningTip && (!chineseText.test(scene.learningTip) || normalized(scene.learningTip) === normalized(scene.explanation))) failures.push(`${scene.id} has invalid or duplicate Learning Tip`);
  teachingBlocks.push(scene.explanation, ...(scene.learningTip ? [scene.learningTip] : []));

  const metadata = scene.metadata;
  for (const field of ['realNeed', 'needSource', 'validationLevel', 'publicLayer', 'paidLayer']) if (!metadata?.[field]?.trim()) failures.push(`${scene.id} missing metadata.${field}`);
  if (!Array.isArray(metadata?.relatedScenes) || metadata.relatedScenes.some((id) => !expectedIds.includes(id) || id === scene.id)) failures.push(`${scene.id} has malformed relatedScenes`);
  for (const field of ['productStoryCandidate', 'videoCandidate', 'geoPublicCandidate']) if (!Number.isInteger(metadata?.[field]) || metadata[field] < 1 || metadata[field] > 5) failures.push(`${scene.id} has invalid ${field}`);
  if (!Array.isArray(metadata?.geoQueries) || metadata.geoQueries.length !== 1 || !metadata.geoQueries[0]?.trim()) failures.push(`${scene.id} has invalid geoQueries`);
  if (!['yes', 'candidate', 'no'].includes(metadata?.freeAcquisitionCandidate)) failures.push(`${scene.id} has invalid freeAcquisitionCandidate`);
  if (!/needs-verification/.test(metadata.validationLevel) || !/scenario-expansion/.test(metadata.needSource)) failures.push(`${scene.id} fabricates or changes provenance state`);
}

if (new Set(teachingBlocks.map(normalized)).size !== teachingBlocks.length) failures.push('N01-N50 contains duplicate teaching blocks');
const expectedTips = ['N01', 'N10', 'N11', 'N16', 'N19', 'N41', 'N43', 'N44', 'N45', 'N46', 'N47', 'N48', 'N49', 'N50'];
const actualTips = newMicroSceneAssets.filter((scene) => scene.learningTip).map((scene) => scene.id);
if (actualTips.join('|') !== expectedTips.join('|')) failures.push(`Learning Tips changed: ${actualTips.join(', ')}`);

const allQuick = adapter.getHistoricalQuickExperiences();
const adapted = allQuick.filter((scene) => scene.source === 'asset-library');
if (adapted.length !== 50 || adapted.some((scene) => !scene.teachingContract)) failures.push('N01-N50 are not integrated through the canonical teaching contract');
const existing = allQuick.filter((scene) => scene.source !== 'asset-library');
const exactDuplicates = newMicroSceneAssets.flatMap((scene) => existing.filter((item) => item.indonesian === scene.indonesian).map((item) => `${scene.id}:${item.sourceId}`));
if (exactDuplicates.length !== 0) failures.push(`Unexpected exact duplicates found: ${exactDuplicates.join(', ')}`);

for (const scene of newMicroSceneAssets) {
  const placement = newMicroScenePlacements[scene.id];
  const rendered = navigation.getHistoricalMicroItems(placement.module, placement.category, placement.role);
  if (!rendered.some((item) => item.sourceId === scene.id)) failures.push(`${scene.id} is not discoverable through ${placement.module}/${placement.role ?? '-'}/${placement.category}`);
}

const reachableNew = new Set(navigation.getHistoricalMicroReachableIds().filter((id) => /^N\d{2}$/.test(id)));
if (reachableNew.size !== 50) failures.push(`Expected 50 reachable N scenes, found ${reachableNew.size}`);
const employeeCount = navigation.getHistoricalMicroItems('factory', undefined, 'employee-management').length;
const recruitmentCount = navigation.getHistoricalMicroItems('factory', undefined, 'recruitment-interview').length;
const restaurantCount = navigation.getHistoricalMicroItems('life', 'restaurant').length;
const youthCount = navigation.getHistoricalMicroItems('life', 'young-people-chat').length;
const datingCount = navigation.getHistoricalMicroItems('life', 'dating').length;
const historicalCoreCount = allQuick.filter((item) => item.source !== 'asset-library' && item.source !== 'recruitment' && item.source !== 'restaurant-ordering' && item.source !== 'youth' && !(item.source === 'factory' && Number(item.sourceId.slice(-3)) > 90) && !(item.source === 'social' && Number(item.sourceId.slice(-3)) > 70)).length;
if (employeeCount !== 31) failures.push(`Employee Management changed: ${employeeCount}`);
if (recruitmentCount !== 20) failures.push(`Recruitment changed: ${recruitmentCount}`);
if (restaurantCount !== 62) failures.push(`Restaurant Ordering changed: ${restaurantCount}`);
if (youthCount !== 50) failures.push(`Y01-Y50 changed: ${youthCount}`);
if (datingCount !== 42) failures.push(`Social/Dating changed: ${datingCount}`);
if (historicalCoreCount !== 421) failures.push(`Historical 421 changed: ${historicalCoreCount}`);

for (const contract of ['toggleFavorite(current.sourceId)', 'IndonesianSpeechButton text={current.ttsText ?? current.indonesian}', 'current.vocabulary']) {
  if (!sessionSource.includes(contract)) failures.push(`Existing shared learner architecture is missing: ${contract}`);
}
for (const internalField of ['assetMetadata', 'canonicalCategory', 'productStoryCandidate', 'geoPublicCandidate', 'freeAcquisitionCandidate']) {
  if (sessionSource.includes(internalField)) failures.push(`Internal metadata leaked into learner UI: ${internalField}`);
}
if (!sessionSource.includes('max-w-2xl') || !sessionSource.includes('break-words') || !sessionSource.includes('overflow-hidden')) failures.push('Existing mobile/responsive layout guard is missing');

if (failures.length) {
  console.error('NEW MICRO SCENE ASSET LIBRARY VERIFY: FAIL');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('NEW MICRO SCENE ASSET LIBRARY VERIFY: PASS');
console.log('N01-N50: 50/50 continuous and unique');
console.log('Human-approved package digest: LOCKED');
console.log('Exact duplicates found/reused: 0/0');
console.log('New teaching records: 50');
console.log(`Learning Tips: ${expectedTips.join(', ')}`);
console.log('Content asset metadata: PASS and internal-only');
console.log('Placeholders: 0');
console.log('English teaching fallback: 0');
console.log('Fake token fragments: 0');
console.log('Duplicate teaching blocks: 0');
console.log('Malformed references: 0');
console.log('Favorite/TTS/mobile shared architecture: PASS');
console.log('Frozen counts: 421 / Employee 31 / Recruitment 20 / Restaurant 62 / Youth 50 / Dating 42');
