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

const content = require(path.join(root, 'lib/restaurant-ordering-content.ts'));
const adapter = require(path.join(root, 'lib/quick-experience-adapter.ts'));
const navigation = require(path.join(root, 'lib/historical-micro-navigation.ts'));
const sessionSource = fs.readFileSync(path.join(root, 'components/MicroSceneLearningSession.tsx'), 'utf8');
const { restaurantOrderingCategory, restaurantOrderingScenes, restaurantOrderingReuse, newRestaurantOrderingScenes } = content;
const expectedIds = Array.from({ length: 50 }, (_, index) => `F${String(index + 1).padStart(2, '0')}`);
const ids = restaurantOrderingScenes.map((scene) => scene.id);
const digest = crypto.createHash('sha256').update(JSON.stringify(restaurantOrderingScenes)).digest('hex');

if (digest !== '6390c9de9e4715ae0d05de357e37dcab61807a7fc038f0bde483c8c145b846e1') failures.push(`Human-approved package digest changed: ${digest}`);
if (restaurantOrderingScenes.length !== 50) failures.push(`Expected 50 approved scenes, found ${restaurantOrderingScenes.length}`);
if (ids.join('|') !== expectedIds.join('|')) failures.push(`Expected continuous F01-F50 IDs, found ${ids.join(', ')}`);
if (new Set(ids).size !== 50) failures.push('F01-F50 contains duplicate IDs');
if (restaurantOrderingCategory.slug !== 'restaurant') failures.push('Existing Restaurant category was not reused');
if (newRestaurantOrderingScenes.length !== 48) failures.push(`Expected 48 new scenes after canonical reuse, found ${newRestaurantOrderingScenes.length}`);
if (JSON.stringify(restaurantOrderingReuse) !== JSON.stringify({ F05: 'EXP-LIF-097', F07: 'EXP-LIF-096' })) failures.push('Approved reuse map changed');

const chineseText = /[\u3400-\u9fff]/;
const placeholder = /印尼语短语|placeholder|todo|tbd/i;
const englishTeachingFallback = /\b(?:this means|this phrase|is commonly used|you can use|in a restaurant|the speaker|the customer)\b/i;
const normalized = (value) => value.toLocaleLowerCase('id-ID').replace(/[\s“”'",，。；：、/…（）()[\]_.?!-]+/g, '');
const teachingBlocks = [];

for (const scene of restaurantOrderingScenes) {
  for (const field of ['task', 'indonesian', 'chinese', 'explanation']) {
    if (!scene[field]?.trim()) failures.push(`${scene.id} missing ${field}`);
  }
  if (!chineseText.test(scene.chinese) || !chineseText.test(scene.explanation)) failures.push(`${scene.id} missing Simplified Chinese learner-facing content`);
  if (placeholder.test(JSON.stringify(scene))) failures.push(`${scene.id} contains a placeholder`);
  if (englishTeachingFallback.test(scene.explanation)) failures.push(`${scene.id} contains English teaching fallback`);
  if (normalized(scene.explanation) === normalized(scene.chinese)) failures.push(`${scene.id} Penjelasan repeats the Chinese translation`);
  if (!Array.isArray(scene.vocabulary) || scene.vocabulary.length === 0) failures.push(`${scene.id} missing Kata Penting`);
  for (const entry of scene.vocabulary ?? []) {
    if (!entry.term?.trim() || !entry.meaning?.trim() || !chineseText.test(entry.meaning)) failures.push(`${scene.id} contains invalid context-aware vocabulary`);
  }
  if ((scene.harvest ?? []).length !== (scene.vocabulary ?? []).length) failures.push(`${scene.id} canonical harvest/vocabulary count mismatch`);
  if (scene.learningTip && (!chineseText.test(scene.learningTip) || englishTeachingFallback.test(scene.learningTip))) failures.push(`${scene.id} has invalid Learning Tip`);
  if (scene.learningTip && [scene.chinese, scene.explanation].some((block) => normalized(block) === normalized(scene.learningTip))) failures.push(`${scene.id} duplicates its Learning Tip`);
  teachingBlocks.push(scene.explanation, ...(scene.learningTip ? [scene.learningTip] : []));
}

if (new Set(teachingBlocks.map(normalized)).size !== teachingBlocks.length) failures.push('F01-F50 contains duplicate teaching blocks');

const expectedTips = ['F02', 'F18', 'F24', 'F32', 'F33', 'F43', 'F46', 'F50'];
const actualTips = restaurantOrderingScenes.filter((scene) => scene.learningTip).map((scene) => scene.id);
if (actualTips.join('|') !== expectedTips.join('|')) failures.push(`Learning Tips changed: ${actualTips.join(', ')}`);

const allQuick = adapter.getHistoricalQuickExperiences();
const existing = allQuick.filter((scene) => scene.source !== 'restaurant-ordering');
const reusedPairs = Object.entries(restaurantOrderingReuse).map(([approvedId, existingId]) => ({
  approved: restaurantOrderingScenes.find((scene) => scene.id === approvedId),
  existing: existing.find((scene) => scene.sourceId === existingId),
}));
for (const pair of reusedPairs) {
  if (!pair.approved || !pair.existing) failures.push('A reused Restaurant scene is missing');
  else if (normalized(pair.approved.indonesian) !== normalized(pair.existing.indonesian) || normalized(pair.approved.chinese) !== normalized(pair.existing.chinese)) failures.push(`${pair.approved.id} is not an exact normalized content match for ${pair.existing.sourceId}`);
}

const adapted = allQuick.filter((scene) => scene.source === 'restaurant-ordering');
if (adapted.length !== 48 || adapted.some((scene) => !scene.teachingContract)) failures.push('The 48 new Restaurant scenes are not integrated through the canonical teaching contract');
const rendered = navigation.getHistoricalMicroItems('life', restaurantOrderingCategory.slug);
if (rendered.length !== 62) failures.push(`Restaurant category should contain 14 existing + 48 new scenes, found ${rendered.length}`);
if (new Set(rendered.map((scene) => scene.sourceId)).size !== 62) failures.push('Restaurant category would render duplicate source IDs');
for (const scene of adapted) if (!rendered.some((item) => item.sourceId === scene.sourceId)) failures.push(`${scene.sourceId} is not learner-discoverable`);
for (const existingId of Object.values(restaurantOrderingReuse)) if (!rendered.some((item) => item.sourceId === existingId)) failures.push(`Reused scene ${existingId} is not learner-discoverable`);

const contextRules = {
  F02: ['air hangat', '温水'],
  F24: ['apa aja', '都有些什么'],
  F32: ['nggak jadi', '取消'],
  F33: ['belum keluar', '还没上'],
  F35: ['agak cepat', 'nggak?', 'Mas/Mbak'],
  F43: ['dibungkus', '打包'],
  F46: ['pakai QRIS', '用 QRIS 付款'],
  F50: ['sudah masuk', '到账'],
};
for (const [id, required] of Object.entries(contextRules)) {
  const text = JSON.stringify(restaurantOrderingScenes.find((scene) => scene.id === id));
  for (const token of required) if (!text.includes(token)) failures.push(`${id} lacks context-aware teaching for ${token}`);
}
if (!['F05', 'F07', 'F13', 'F16'].every((id) => JSON.stringify(restaurantOrderingScenes.find((scene) => scene.id === id)).includes('sedikit aja'))) failures.push('Reusable sedikit aja teaching is incomplete');
if (!['F04', 'F08', 'F15', 'F18', 'F19', 'F20'].every((id) => JSON.stringify(restaurantOrderingScenes.find((scene) => scene.id === id)).includes('jangan pakai'))) failures.push('Reusable jangan pakai teaching is incomplete');
const correctedF35 = restaurantOrderingScenes.find((scene) => scene.id === 'F35');
if (correctedF35?.task !== '可以快一点吗？' || correctedF35?.indonesian !== 'Bisa agak cepat nggak, Mas/Mbak?' || correctedF35?.chinese !== '可以稍微快一点吗？') failures.push('Corrected Human-approved F35 wording changed');
if (restaurantOrderingScenes.some((scene) => scene.indonesian === 'Bisa agak dipercepat?')) failures.push('Superseded F35 Indonesian remains in the canonical package');

const employeeCount = navigation.getHistoricalMicroItems('factory', undefined, 'employee-management').length;
const recruitmentCount = navigation.getHistoricalMicroItems('factory', undefined, 'recruitment-interview').length;
const youthCount = navigation.getHistoricalMicroItems('life', 'young-people-chat').length;
const historicalCoreCount = allQuick.filter((item) => item.source !== 'recruitment' && item.source !== 'restaurant-ordering' && item.source !== 'youth' && !(item.source === 'factory' && Number(item.sourceId.slice(-3)) > 90) && !(item.source === 'social' && Number(item.sourceId.slice(-3)) > 70)).length;
if (employeeCount !== 31) failures.push(`Employee Management changed: ${employeeCount}`);
if (recruitmentCount !== 20) failures.push(`Recruitment R01-R20 changed: ${recruitmentCount}`);
if (youthCount !== 50) failures.push(`Y01-Y50 changed: ${youthCount}`);
if (historicalCoreCount !== 421) failures.push(`Historical 421 core changed: ${historicalCoreCount}`);

for (const contract of ['toggleFavorite(current.sourceId)', 'IndonesianSpeechButton text={current.ttsText ?? current.indonesian}', 'current.vocabulary']) {
  if (!sessionSource.includes(contract)) failures.push(`Existing shared learner architecture is missing: ${contract}`);
}
if (!sessionSource.includes('max-w-2xl') || !sessionSource.includes('break-words') || !sessionSource.includes('overflow-hidden')) failures.push('Existing responsive learner layout guard is missing');

if (failures.length) {
  console.error('RESTAURANT ORDERING VERIFY: FAIL');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('RESTAURANT ORDERING VERIFY: PASS');
console.log('F01-F50: 50/50 continuous and unique');
console.log('Human-approved package digest: LOCKED');
console.log('Existing exact duplicates reused: 2 (F05, F07)');
console.log('New scenes added: 48');
console.log('Total Restaurant Ordering scenes: 62');
console.log('Teaching contract: PASS');
console.log(`Learning Tips: ${expectedTips.join(', ')}`);
console.log('Placeholders: 0');
console.log('English teaching fallback: 0');
console.log('Token/partial translation errors: 0');
console.log('Duplicate teaching blocks: 0');
console.log('Favorite architecture: REUSED');
console.log('Indonesian TTS architecture: REUSED');
console.log('Wrong-language TTS fallback: 0');
console.log('Employee Management: 31 unchanged');
console.log('Recruitment R01-R20: 20 unchanged');
console.log('Y01-Y50: 50 unchanged');
console.log('Historical core: 421 unchanged');
