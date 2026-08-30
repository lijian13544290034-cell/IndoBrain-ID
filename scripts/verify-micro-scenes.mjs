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
const navigation = require(path.join(root, 'lib/historical-micro-navigation.ts'));
const cityLife = require(path.join(root, 'lib/city-life-micro-navigation.ts'));
const micro = require(path.join(root, 'lib/micro-scenes.ts'));
const sceneMap = require(path.join(root, 'lib/scene-map-v2.ts'));

const indexSource = read('lib/micro-scenes.ts');
const adapterSource = read('lib/quick-experience-adapter.ts');
const navigationSource = read('lib/historical-micro-navigation.ts');
const cityLifeSource = read('lib/city-life-micro-navigation.ts');
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
if (mappedQuick.length !== 369) failures.push(`Expected 369 Scene Map mapped Quick assets, found ${mappedQuick.length}`);
if (unmappedQuick.length !== 52) failures.push(`Expected 52 Scene Map UNMAPPED_REVIEW Quick assets, found ${unmappedQuick.length}`);
if (new Set(quickIndex.map((item) => item.sourceId)).size !== 421) failures.push('Quick index contains duplicate stable source IDs');
if (unmappedQuick.some((item) => item.primaryMapping)) failures.push('UNMAPPED_REVIEW assets must not be force-mapped into Scene Map');
if (unmappedQuick.some((item) => !historicalIds.has(item.sourceId))) failures.push('UNMAPPED_REVIEW contains an unknown source ID');

const canonicalLevel1 = new Set(sceneMap.sceneMapV2.map((group) => group.slug));
const topicKeys = new Set(sceneMap.sceneMapV2.flatMap((group) => group.topics.map((topic) => `${group.slug}:${topic.slug}`)));
if (canonicalLevel1.size !== 6) failures.push(`Scene Map V2 regression: expected 6 domains, found ${canonicalLevel1.size}`);
if (topicKeys.size !== 36) failures.push(`Scene Map V2 regression: expected 36 topics, found ${topicKeys.size}`);

for (const item of mappedQuick) {
  if (!item.primaryMapping || !topicKeys.has(`${item.primaryMapping.level1}:${item.primaryMapping.level2}`)) failures.push(`${item.sourceId} has an invalid Scene Map primary mapping`);
  for (const mapping of item.secondaryMappings) if (!topicKeys.has(`${mapping.level1}:${mapping.level2}`)) failures.push(`${item.sourceId} has an invalid Scene Map secondary mapping`);
}

const modules = navigation.getHistoricalMicroModules();
const expectedModules = [
  ['driver', '出行·司机', 32],
  ['nanny', '家庭·保姆', 49],
  ['factory', '工作·工厂', 184],
  ['life', '城市生活·社交', 156],
];
if (modules.length !== 4) failures.push(`Expected 4 historical Micro Scene entrances, found ${modules.length}`);
for (const [slug, title, count] of expectedModules) {
  const module = modules.find((item) => item.slug === slug);
  if (!module) failures.push(`Missing historical Micro Scene entrance: ${slug}`);
  else {
    if (module.title !== title) failures.push(`Expected learner-facing title ${title} for ${slug}, found ${module.title}`);
    if (module.count !== count) failures.push(`Expected ${count} reachable assets for ${slug}, found ${module.count}`);
  }
}

const expectedGroupSlugs = {
  driver: ['jemput', 'perjalanan', 'menunggu', 'kunjungan', 'lanjutan'],
  nanny: ['makan', 'rumah', 'anak', 'belanja', 'kerja'],
  factoryManager: ['produksi', 'kualitas', 'keamanan', 'material', 'pengiriman', 'ekspor', 'pelanggan'],
  life: ['restaurant', 'supermarket', 'bank-payments', 'medical-pharmacy', 'grooming-wellness', 'housing-property', 'repairs', 'delivery-takeout', 'documents-window', 'hotel-stay', 'airport-travel', 'new-friends', 'friend-daily', 'meals-coffee', 'daily-chat', 'cultural-exchange', 'dating', 'business-social'],
  factoryRoles: ['manager', 'production', 'warehouse', 'qc', 'purchasing', 'operator', 'logistics', 'shipping', 'export', 'customer-service'],
};
const actualGroups = {
  driver: navigation.getDriverMicroGroups().map((item) => item.slug),
  nanny: navigation.getNannyMicroGroups().map((item) => item.slug),
  factoryManager: navigation.getFactoryManagerMicroGroups().map((item) => item.slug),
  life: navigation.getLifeMicroGroups().map((item) => item.slug),
  factoryRoles: navigation.getFactoryMicroRoles().map((item) => item.slug),
};
for (const [name, expected] of Object.entries(expectedGroupSlugs)) {
  if (actualGroups[name].join('|') !== expected.join('|')) failures.push(`${name} historical ordering changed: ${actualGroups[name].join(', ')}`);
}

const citySections = navigation.getCityLifeMicroSections();
const expectedCitySections = ['life-services', 'social-relationships'];
if (citySections.map((section) => section.slug).join('|') !== expectedCitySections.join('|')) failures.push('City Life must render the two visual sections 生活办事 and 社交关系 without another navigation layer');
const expectedCityCounts = {
  restaurant: 14,
  supermarket: 10,
  'bank-payments': 6,
  'medical-pharmacy': 5,
  'grooming-wellness': 5,
  'housing-property': 2,
  repairs: 3,
  'delivery-takeout': 4,
  'documents-window': 1,
  'hotel-stay': 0,
  'airport-travel': 8,
  'new-friends': 13,
  'friend-daily': 8,
  'meals-coffee': 15,
  'daily-chat': 11,
  'cultural-exchange': 20,
  dating: 25,
  'business-social': 6,
};
for (const group of citySections.flatMap((section) => section.groups)) {
  if (group.count !== expectedCityCounts[group.slug]) failures.push(`Expected ${expectedCityCounts[group.slug]} City Life assets in ${group.slug}, found ${group.count}`);
}
const cityLifeTotal = citySections.find((section) => section.slug === 'life-services')?.groups.reduce((sum, group) => sum + group.count, 0);
const citySocialTotal = citySections.find((section) => section.slug === 'social-relationships')?.groups.reduce((sum, group) => sum + group.count, 0);
if (cityLifeTotal !== 58) failures.push(`Expected City Life 生活办事 total 58, found ${cityLifeTotal}`);
if (citySocialTotal !== 98) failures.push(`Expected City Life 社交关系 total 98, found ${citySocialTotal}`);
const mappedCityIds = cityLife.getCityLifeMicroSourceIds();
if (mappedCityIds.length !== 156 || new Set(mappedCityIds).size !== 156) failures.push(`City Life primary mapping must contain 156 unique IDs; found ${mappedCityIds.length} placements and ${new Set(mappedCityIds).size} unique IDs`);

const contexts = [
  ...navigation.getDriverMicroGroups().map((group) => ({ key: `driver/${group.slug}`, items: navigation.getHistoricalMicroItems('driver', group.slug), allowed: new Set(['driver']) })),
  ...navigation.getNannyMicroGroups().map((group) => ({ key: `nanny/${group.slug}`, items: navigation.getHistoricalMicroItems('nanny', group.slug), allowed: new Set(['nanny']) })),
  ...navigation.getFactoryManagerMicroGroups().map((group) => ({ key: `factory/manager/${group.slug}`, items: navigation.getHistoricalMicroItems('factory', group.slug, 'manager'), allowed: new Set(['factory']) })),
  ...navigation.getFactoryMicroRoles().filter((role) => role.slug !== 'manager').map((role) => ({ key: `factory/${role.slug}`, items: navigation.getHistoricalMicroItems('factory', undefined, role.slug), allowed: new Set(['module']) })),
  ...navigation.getLifeMicroGroups().map((group) => ({ key: `life/${group.slug}`, items: navigation.getHistoricalMicroItems('life', group.slug), allowed: new Set(['life', 'social']) })),
];

const reachableIds = navigation.getHistoricalMicroReachableIds();
const reachableSet = new Set(reachableIds);
if (reachableIds.length !== 421) failures.push(`Expected 421 Quick assets reachable through historical navigation, found ${reachableIds.length}`);
for (const id of historicalIds) if (!reachableSet.has(id)) failures.push(`${id} is not reachable through historical Micro navigation`);
for (const item of unmappedQuick) if (!reachableSet.has(item.sourceId)) failures.push(`${item.sourceId} was lost because it is Scene Map UNMAPPED_REVIEW`);

const seenContextIds = [];
for (const context of contexts) {
  if (!context.items.length && context.key !== 'life/hotel-stay') failures.push(`${context.key} has no reachable Quick Experiences`);
  const contextIds = new Set();
  for (const item of context.items) {
    seenContextIds.push(item.sourceId);
    if (contextIds.has(item.sourceId)) failures.push(`${context.key} duplicates ${item.sourceId}`);
    contextIds.add(item.sourceId);
    if (!context.allowed.has(item.source)) failures.push(`${context.key} unexpectedly contains ${item.sourceId} from ${item.source}`);
    if (item.progressKey !== item.sourceId) failures.push(`${item.sourceId} does not use its stable Quick ID for progress`);
    if (!item.legacyProgressKeys.includes(`micro:${item.sourceId}`)) failures.push(`${item.sourceId} lacks backward-compatible Micro V1 progress`);
    for (const field of ['sceneTitle', 'indonesian', 'explanation']) if (!item[field]?.trim()) failures.push(`${item.sourceId} visible unit is missing ${field}`);
    if (!item.harvest.length) failures.push(`${item.sourceId} visible unit is missing harvest`);
  }
}
if (seenContextIds.length !== 421 || new Set(seenContextIds).size !== 421) failures.push(`Historical navigation must expose every Quick Experience exactly once; found ${seenContextIds.length} placements and ${new Set(seenContextIds).size} unique IDs`);

const representativeContexts = [
  ['driver/jemput', 'EXP-DRV-013'],
  ['factory/manager/produksi', 'EXP-FAC-001'],
  ['factory/qc', 'EXP-QC-001'],
  ['factory/warehouse', 'EXP-WHS-001'],
  ['life/restaurant', 'EXP-LIF-093'],
  ['life/supermarket', 'EXP-LIF-083'],
  ['life/new-friends', 'EXP-SOC-001'],
];
for (const [contextKey, sourceId] of representativeContexts) {
  const context = contexts.find((item) => item.key === contextKey);
  if (!context?.items.some((item) => item.sourceId === sourceId)) failures.push(`${sourceId} is missing from ${contextKey}`);
}

const stats = micro.getMicroSceneStats();
if (stats.visibleAssetCount !== 421) failures.push(`Homepage Micro Scene count must be 421, found ${stats.visibleAssetCount}`);
if (stats.sceneMapMappedQuickCount !== 369) failures.push(`Scene Map mapped Quick count must remain 369, found ${stats.sceneMapMappedQuickCount}`);
if (stats.unmappedReviewCount !== 52) failures.push(`Scene Map UNMAPPED_REVIEW count must remain 52, found ${stats.unmappedReviewCount}`);

const forbiddenCopiedFields = ['sceneTitle', 'momentTitle', 'indonesian', 'chinese', 'explanation', 'harvest', 'pattern', 'insight', 'content'];
for (const item of quickIndex) for (const field of forbiddenCopiedFields) if (Object.hasOwn(item, field)) failures.push(`Quick index copied source content field ${field} for ${item.sourceId}`);
for (const phrase of ['Pak, sudah sampai.', 'Periksa produk batch ini ya.', 'Cek stok bahan ini ya.']) if (navigationSource.includes(phrase)) failures.push(`Historical navigation duplicated source content: ${phrase}`);
if (['sceneTitle:', 'explanation:', 'harvest:', 'pattern:', 'insight:', 'content:'].some((field) => cityLifeSource.includes(field))) failures.push('City Life navigation must map stable IDs without copying Quick Experience source content');

const reservation = historical.find((item) => item.sourceId === 'EXP-SOC-028');
if (reservation?.indonesian !== 'Saya sudah booking tempat.') failures.push(`EXP-SOC-028 reservation fix missing: ${reservation?.indonesian}`);
if (!reservation?.harvest.includes('booking（预订）')) failures.push('EXP-SOC-028 harvest must teach booking, not the rejected reservation wording');
const newEmployee = historical.find((item) => item.sourceId === 'EXP-FAC-046');
if (newEmployee?.indonesian !== 'Karyawan baru sudah dilatih?') failures.push(`EXP-FAC-046 new employee fix missing: ${newEmployee?.indonesian}`);
if (!newEmployee?.harvest.includes('karyawan baru（新员工）')) failures.push('EXP-FAC-046 harvest must identify a general new employee as karyawan baru');
if (historical.some((item) => /reservice/i.test(item.indonesian))) failures.push('Rejected word reservice remains in the 421 Quick Experiences');

const humanApprovedFinalLanguage = {
  'EXP-NAN-019': 'Boleh minta gajinya dulu sebagian?',
  'EXP-NAN-028': 'Tolong keluarkan buahnya ya.',
  'EXP-FAC-067': 'Jumlah yang dikirim sudah sesuai?',
  'EXP-PRO-016': 'Batch ini cek sampel pertamanya dulu ya.',
  'EXP-PUR-016': 'Cek minimum order-nya dulu ya.',
  'EXP-OPR-014': 'Jumlah produksi hari ini laporkan ke supervisor ya.',
  'EXP-SHP-005': 'Booking space-nya sudah dikonfirmasi?',
  'EXP-EXP-004': 'SKA-nya kapan selesai?',
  'EXP-EXP-006': 'Perkiraan tiba di pelabuhan kapan?',
  'EXP-LIF-130': 'Bisa panggil teknisi buat perbaiki ini?',
  'EXP-SOC-004': 'Saya belum lama di Indonesia.',
};
for (const [sourceId, expectedIndonesian] of Object.entries(humanApprovedFinalLanguage)) {
  const item = historical.find((candidate) => candidate.sourceId === sourceId);
  if (item?.indonesian !== expectedIndonesian) failures.push(`${sourceId} Human Review wording missing: ${item?.indonesian}`);
}
const undefinedHoliday = historical.find((item) => item.sourceId === 'EXP-LIF-220');
if (undefinedHoliday?.indonesian !== 'Selamat merayakan ya!') failures.push(`EXP-LIF-220 must remain unchanged until its holiday is defined: ${undefinedHoliday?.indonesian}`);

if (indexSource.includes('BASIC_ESSENTIALS_MICRO_SCENE_GROUP_MAP_V1')) failures.push('Planning-only Micro Scene content must not be imported by runtime');
if (!adapterSource.includes('resolveHistoricalQuickExperience')) failures.push('Stable-ID Quick Experience adapter is missing');
if (!librarySource.includes('getHistoricalMicroModules') || !librarySource.includes('getHistoricalMicroItems')) failures.push('Primary Micro Scene navigation is not using historical Quick structure');
if (librarySource.includes('getQuickMicroSceneDomains') || librarySource.includes('getQuickMicroScenesForTopic') || librarySource.includes('sceneMapV2')) failures.push('Primary Micro Scene UI still depends on Scene Map taxonomy');
for (const label of ['出行·司机', '家庭·保姆', '工作·工厂', '城市生活·社交']) if (!librarySource.includes(label) && !navigationSource.includes(label)) failures.push(`Top-level learner label missing: ${label}`);
for (const label of ['生活办事', '社交关系']) if (!librarySource.includes(label) && !cityLifeSource.includes(label)) failures.push(`City Life visual section missing: ${label}`);
if (!librarySource.includes('visibleGroups = section.groups.filter((group) => group.count > 0)')) failures.push('City Life learner UI must hide empty category cards');
if (!librarySource.includes("showSourceId={selectedModule?.slug !== 'life'}")) failures.push('City Life learner UI still exposes EXP-LIF / EXP-SOC source distinctions');
for (const contract of ['current.explanation', 'current.harvest', 'current.pattern', 'current.insight', 'current.content', 'IndonesianSpeechButton', 'toggleFavorite', '完成这个场景组', 'nextGroupHref']) {
  if (!sessionSource.includes(contract)) failures.push(`Rich learning unit contract is missing: ${contract}`);
}
if (sessionSource.includes('(nextIndex + items.length) % items.length')) failures.push('Continuous learning still wraps and loses historical workflow ending');
if (!homeSource.includes("href: '/micro-scenes'")) failures.push('Independent homepage Micro Scene entry is missing');
if (!homeSource.includes('microSceneStats.visibleAssetCount')) failures.push('Homepage Micro Scene count is not derived from reachable historical Quick assets');

if (failures.length) {
  console.error('MICRO SCENES VERIFY: FAIL');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('MICRO SCENES VERIFY: PASS');
console.log('Historical Quick source integrity: 421');
console.log('Historical Quick reachable: 421');
console.log('Driver reachable: 32');
console.log('Nanny reachable: 49');
console.log('Factory Manager reachable: 65');
console.log('Factory role/module reachable: 119');
console.log('City Life / 生活办事 reachable: 58');
console.log('City Life / 社交关系 reachable: 98');
console.log('City Life unclassified: 0');
console.log('City Life duplicate primary assignments: 0');
console.log('Human-approved language fixes: EXP-SOC-028, EXP-FAC-046 + final 11-ID language review');
console.log('EXP-LIF-220 unchanged: needs Human scene definition');
console.log('Scene Map mapped Quick preserved: 369');
console.log('Scene Map UNMAPPED_REVIEW preserved and reachable: 52');
console.log('Scene Map taxonomy regression: 6 domains / 36 topics');
console.log('Progress identity: stable Quick ID + backward-compatible micro:{id} read');
