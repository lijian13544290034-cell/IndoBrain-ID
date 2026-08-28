import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

const indexSource = read('lib/micro-scenes.ts');
const sceneMapSource = read('lib/scene-map-v2.ts');
const realUseSource = read('lib/basic-real-use.ts');
const essentialsSource = read('lib/essentials.ts');
const pageSource = read('app/micro-scenes/page.tsx');
const librarySource = read('components/MicroSceneLibrary.tsx');
const sessionSource = read('components/MicroSceneLearningSession.tsx');
const homeSource = read('components/V2HomeDashboard.tsx');

const canonicalLevel1 = ['life-home', 'transport', 'work-business', 'social-relationship', 'public-service', 'travel-emergency'];
const sceneMapLevel1 = [...sceneMapSource.matchAll(/\{ slug: '(life-home|transport|work-business|social-relationship|public-service|travel-emergency)'/g)].map((match) => match[1]);
if (new Set(sceneMapLevel1).size !== 6) failures.push(`Expected 6 canonical Scene Map level-1 domains, found ${new Set(sceneMapLevel1).size}`);

const topicIds = new Set([...sceneMapSource.matchAll(/\{ slug: '([^']+)', title:/g)].map((match) => match[1]).filter((slug) => !canonicalLevel1.includes(slug)));
if (topicIds.size !== 36) failures.push(`Expected 36 Scene Map level-2 topics, found ${topicIds.size}`);

for (const match of indexSource.matchAll(/level1: '([^']+)', level2: '([^']+)'/g)) {
  if (!canonicalLevel1.includes(match[1])) failures.push(`Invalid canonical level-1 mapping: ${match[1]}`);
  if (!topicIds.has(match[2])) failures.push(`Missing Scene Map level-2 mapping: ${match[1]}/${match[2]}`);
}

const requiredIndexFields = ['assetId', 'sourceType', 'sourceId', 'primaryMapping', 'secondaryMappings', 'difficulty', 'priority', 'tags', 'enabled', 'reviewStatus'];
for (const field of requiredIndexFields) if (!indexSource.includes(`${field}:`)) failures.push(`MicroSceneIndexItem is missing ${field}`);
if (!indexSource.includes("export type MicroSceneDifficulty = 1 | 2 | 3")) failures.push('Difficulty model must be exactly 1 | 2 | 3');
if (!indexSource.includes("item.enabled && item.reviewStatus === 'READY'")) failures.push('Visible content must require enabled READY status');
if (!indexSource.includes('seenContent.has(contentKey)')) failures.push('Visible content exact-deduplication gate is missing');
if (!indexSource.includes("const progressKey = (assetId: string) => `micro:${assetId}`")) failures.push('Stable asset-based progress key is missing');

const sourceIds = [
  ...realUseSource.matchAll(/id:\s*["'](real-use-be-v1-g\d{3})["']/g),
  ...essentialsSource.matchAll(/(?:item\(|id:\s*)["'](ESS-[A-Z-]+-\d{3})["']/g),
].map((match) => match[1]);
if (!sourceIds.length) failures.push('No stable Real Use or Essentials source IDs found');
if (new Set(sourceIds).size !== sourceIds.length) failures.push('Duplicate stable source IDs found in Real Use or Essentials');

for (const required of [
  'buildQuickIndex()', 'buildEssentialIndex()', 'buildRealUseIndex()',
  'resolveMicroScene(indexItem', 'indonesian:', 'chinese:', 'ttsText:',
]) if (!indexSource.includes(required)) failures.push(`Required resolver contract missing: ${required}`);

if (indexSource.includes('BASIC_ESSENTIALS_MICRO_SCENE_GROUP_MAP_V1')) failures.push('Historical planning-only map must not be imported by runtime');
if (!pageSource.includes('MicroSceneLibrary')) failures.push('Micro Scene route does not render the library');
if (!librarySource.includes('getMicroSceneDomains') || !librarySource.includes('getMicroScenesForTopic')) failures.push('Micro Scene level-1/level-2 navigation is incomplete');
if (!sessionSource.includes('IndonesianSpeechButton')) failures.push('Indonesian TTS action is missing');
if (!sessionSource.includes('completeExperience(current.progressKey)')) failures.push('Stable completion tracking is missing');
if (!sessionSource.includes('下一个')) failures.push('Continuous next-item learning is missing');
if (!homeSource.includes("href: '/micro-scenes'") || !homeSource.includes("label: '微场景'")) failures.push('Independent homepage Micro Scene entry is missing');
if (!homeSource.includes("label: '基础必会'") || !homeSource.includes("label: '黄金场景'")) failures.push('Three-layer learning hierarchy is incomplete');

if (failures.length) {
  console.error('MICRO SCENES VERIFY: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('MICRO SCENES VERIFY: PASS');
console.log('Canonical level-1: 6');
console.log(`Level-2 topics: ${topicIds.size}`);
console.log('Source resolution: generated from stable source IDs');
console.log('Visible content gate: enabled + READY + exact-content dedupe');
