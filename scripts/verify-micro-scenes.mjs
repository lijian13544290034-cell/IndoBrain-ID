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
const { harvestMeaning, harvestTerm } = require(path.join(root, 'lib/harvest.ts'));
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
const historicalCore = historical.filter((item) => !(item.source === 'factory' && Number(item.sourceId.slice(-3)) > 90) && !(item.source === 'social' && Number(item.sourceId.slice(-3)) > 70));

if (historical.length !== 449) failures.push(`Expected 449 Quick Experience assets after approved additions, found ${historical.length}`);
if (historicalIds.size !== 449) failures.push(`Expected 449 unique Quick Experience IDs, found ${historicalIds.size}`);
if (historicalCore.length !== 421) failures.push(`Expected the frozen 421 core Quick Experience assets to remain intact, found ${historicalCore.length}`);

const expectedSourceCounts = { driver: 32, nanny: 49, factory: 76, life: 86, social: 87, module: 119 };
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
if (quickIndex.length !== 449) failures.push(`Expected all 449 Quick assets in metadata index, found ${quickIndex.length}`);
if (mappedQuick.length !== 397) failures.push(`Expected 397 Scene Map mapped Quick assets, found ${mappedQuick.length}`);
if (unmappedQuick.length !== 52) failures.push(`Expected 52 Scene Map UNMAPPED_REVIEW Quick assets, found ${unmappedQuick.length}`);
if (new Set(quickIndex.map((item) => item.sourceId)).size !== 449) failures.push('Quick index contains duplicate stable source IDs');
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
  ['factory', '工作·工厂', 195],
  ['life', '城市生活·社交', 173],
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
  factoryRoles: ['manager', 'employee-management', 'production', 'warehouse', 'qc', 'purchasing', 'operator', 'logistics', 'shipping', 'export', 'customer-service'],
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
  dating: 42,
  'business-social': 6,
};
for (const group of citySections.flatMap((section) => section.groups)) {
  if (group.count !== expectedCityCounts[group.slug]) failures.push(`Expected ${expectedCityCounts[group.slug]} City Life assets in ${group.slug}, found ${group.count}`);
}
const cityLifeTotal = citySections.find((section) => section.slug === 'life-services')?.groups.reduce((sum, group) => sum + group.count, 0);
const citySocialTotal = citySections.find((section) => section.slug === 'social-relationships')?.groups.reduce((sum, group) => sum + group.count, 0);
if (cityLifeTotal !== 58) failures.push(`Expected City Life 生活办事 total 58, found ${cityLifeTotal}`);
if (citySocialTotal !== 115) failures.push(`Expected City Life 社交关系 total 115, found ${citySocialTotal}`);
const mappedCityIds = cityLife.getCityLifeMicroSourceIds();
if (mappedCityIds.length !== 173 || new Set(mappedCityIds).size !== 173) failures.push(`City Life primary mapping must contain 173 unique IDs; found ${mappedCityIds.length} placements and ${new Set(mappedCityIds).size} unique IDs`);

const contexts = [
  ...navigation.getDriverMicroGroups().map((group) => ({ key: `driver/${group.slug}`, items: navigation.getHistoricalMicroItems('driver', group.slug), allowed: new Set(['driver']) })),
  ...navigation.getNannyMicroGroups().map((group) => ({ key: `nanny/${group.slug}`, items: navigation.getHistoricalMicroItems('nanny', group.slug), allowed: new Set(['nanny']) })),
  ...navigation.getFactoryManagerMicroGroups().map((group) => ({ key: `factory/manager/${group.slug}`, items: navigation.getHistoricalMicroItems('factory', group.slug, 'manager'), allowed: new Set(['factory']) })),
  ...navigation.getFactoryMicroRoles().filter((role) => role.slug !== 'manager').map((role) => ({ key: `factory/${role.slug}`, items: navigation.getHistoricalMicroItems('factory', undefined, role.slug), allowed: new Set([role.slug === 'employee-management' ? 'factory' : 'module']) })),
  ...navigation.getLifeMicroGroups().map((group) => ({ key: `life/${group.slug}`, items: navigation.getHistoricalMicroItems('life', group.slug), allowed: new Set(['life', 'social']) })),
];

const reachableIds = navigation.getHistoricalMicroReachableIds();
const reachableSet = new Set(reachableIds);
if (reachableIds.length !== 449) failures.push(`Expected 449 Quick assets reachable through historical navigation, found ${reachableIds.length}`);
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
if (seenContextIds.length !== 449 || new Set(seenContextIds).size !== 449) failures.push(`Historical navigation must expose every Quick Experience exactly once; found ${seenContextIds.length} placements and ${new Set(seenContextIds).size} unique IDs`);

const representativeContexts = [
  ['driver/jemput', 'EXP-DRV-013'],
  ['factory/manager/produksi', 'EXP-FAC-001'],
  ['factory/employee-management', 'EXP-FAC-091'],
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
if (stats.visibleAssetCount !== 449) failures.push(`Homepage Micro Scene count must be 449, found ${stats.visibleAssetCount}`);
if (stats.sceneMapMappedQuickCount !== 397) failures.push(`Scene Map mapped Quick count must be 397, found ${stats.sceneMapMappedQuickCount}`);
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

const approvedMicroAdditions = {
  'EXP-FAC-091': 'Kerja kamu hari ini bagus banget. Pertahankan ya.',
  'EXP-FAC-092': 'Saya lihat kamu sekarang sudah jauh lebih baik.',
  'EXP-FAC-093': 'Saya puas sama hasil kerja kamu.',
  'EXP-FAC-096': 'Ide kamu bagus. Kita coba.',
  'EXP-FAC-097': 'Saya percaya sama kamu.',
  'EXP-FAC-098': 'Mulai sekarang, bagian ini kamu yang pegang.',
  'EXP-FAC-101': 'Target bulan ini tercapai.',
  'EXP-FAC-104': 'Gak apa-apa salah.',
  'EXP-FAC-105': 'Saya kasih kamu kesempatan sekali lagi.',
  'EXP-FAC-107': 'Saya hargai itu.',
  'EXP-FAC-109': 'Makasih ya, hari ini sudah kerja keras.',
  'EXP-SOC-317': 'Kamu cantik banget hari ini.',
  'EXP-SOC-301': 'Senyum kamu manis banget.',
  'EXP-SOC-302': 'Kok kamu makin cantik sih?',
  'EXP-SOC-303': 'Kamu kelihatan makin fit.',
  'EXP-SOC-304': 'Body kamu bagus banget.',
  'EXP-SOC-305': 'Kamu seksi banget malam ini.',
  'EXP-SOC-318': 'Boleh minta IG kamu?',
  'EXP-SOC-319': 'Kapan-kapan kita nongkrong bareng, yuk.',
  'EXP-SOC-306': 'Kok kamu bikin aku salting sih?',
  'EXP-SOC-307': 'Kayaknya aku mulai suka sama kamu.',
  'EXP-SOC-308': 'Aku suka sama kamu.',
  'EXP-SOC-309': 'Aku kangen kamu.',
  'EXP-SOC-310': 'Aku sayang kamu.',
  'EXP-SOC-311': 'Aku cinta kamu.',
  'EXP-SOC-312': 'Kamu juga ada rasa sama aku, gak?',
  'EXP-SOC-314': 'Aku pengin peluk kamu.',
  'EXP-SOC-315': 'Aku pengin cium kamu. Boleh?',
};
for (const [sourceId, expectedIndonesian] of Object.entries(approvedMicroAdditions)) {
  const item = historical.find((candidate) => candidate.sourceId === sourceId);
  if (item?.indonesian !== expectedIndonesian) failures.push(`${sourceId} approved Micro wording missing: ${item?.indonesian}`);
}

const expectedEmployeeManagementIds = ['EXP-FAC-091', 'EXP-FAC-092', 'EXP-FAC-093', 'EXP-FAC-096', 'EXP-FAC-097', 'EXP-FAC-098', 'EXP-FAC-101', 'EXP-FAC-104', 'EXP-FAC-105', 'EXP-FAC-107', 'EXP-FAC-109'];
const employeeManagementRole = navigation.getFactoryMicroRoles().find((role) => role.slug === 'employee-management');
const employeeManagementItems = navigation.getHistoricalMicroItems('factory', undefined, 'employee-management');
if (employeeManagementRole?.title !== '员工管理') failures.push(`Employee Management learner-facing title missing: ${employeeManagementRole?.title}`);
if (employeeManagementRole?.count !== expectedEmployeeManagementIds.length) failures.push(`Expected ${expectedEmployeeManagementIds.length} Employee Management items, found ${employeeManagementRole?.count}`);
if (employeeManagementItems.map((item) => item.sourceId).join('|') !== expectedEmployeeManagementIds.join('|')) failures.push(`Employee Management placement changed: ${employeeManagementItems.map((item) => item.sourceId).join(', ')}`);
if (new Set(employeeManagementItems.map((item) => item.sourceId)).size !== employeeManagementItems.length) failures.push('Employee Management contains duplicate stable IDs');

const expectedEmployeeChinese = {
  'EXP-FAC-091': '你今天做得非常好，继续保持。',
  'EXP-FAC-092': '我看得出来，你现在进步很多了。',
  'EXP-FAC-093': '我对你的工作成果很满意。',
  'EXP-FAC-096': '你的想法不错，我们试试。',
  'EXP-FAC-097': '我相信你。',
  'EXP-FAC-098': '从现在开始，这部分你来负责。',
  'EXP-FAC-101': '这个月目标达成了。',
  'EXP-FAC-104': '犯错没关系。',
  'EXP-FAC-105': '我再给你一次机会。',
  'EXP-FAC-107': '我很认可这一点。',
  'EXP-FAC-109': '谢谢你，今天辛苦了。',
};
const expectedEmployeeVocabulary = {
  'saya lihat': '我看得出来；我注意到',
  'jauh lebih baik': '好很多；进步很多',
  'puas sama': '对……满意',
  'hasil kerja': '工作成果；工作结果',
  'ide': '想法；主意',
  'kita coba': '我们试试',
  'gak apa-apa': '没关系；不要紧',
  'yang penting': '重要的是……',
  'jangan diulang': '不要再犯；不要再重复',
  'sasaran': '目标',
  'tercapai': '达到；实现；达成',
  'pegang': '负责；掌管',
};
const chineseText = /[\u4e00-\u9fff]/;
const englishTeachingFallback = /\b(?:is|are|can|means?|natural|common|workplace|responsible|handling|use|way)\b/i;
const normalizedTeaching = (value) => value.toLocaleLowerCase().replace(/[\s“”'"，。；：、/…（）()[\]_-]+/g, '');
const teachingContractItems = historical.filter((candidate) => candidate.teachingContract);

if (teachingContractItems.length !== expectedEmployeeManagementIds.length) failures.push(`Teaching contract must be scoped to the ${expectedEmployeeManagementIds.length} Employee Management scenes; found ${teachingContractItems.length}`);
for (const item of teachingContractItems) {
  if (!chineseText.test(item.explanation) || englishTeachingFallback.test(item.explanation)) failures.push(`${item.sourceId} teaching explanation must be Simplified Chinese without English fallback`);
  if (normalizedTeaching(item.explanation) === normalizedTeaching(item.chinese)) failures.push(`${item.sourceId} explanation repeats the Chinese translation`);
  if (item.harvest.length < 1 || item.harvest.length > 3) failures.push(`${item.sourceId} teaching vocabulary must contain 1-3 reusable chunks`);
  for (const entry of item.harvest) {
    const meaning = harvestMeaning(entry);
    if (!meaning || meaning === '印尼语短语' || !chineseText.test(meaning)) failures.push(`${item.sourceId} has invalid learner-facing vocabulary: ${entry}`);
  }
  if (item.learningTip && (!chineseText.test(item.learningTip) || englishTeachingFallback.test(item.learningTip))) failures.push(`${item.sourceId} learning tip must be Simplified Chinese without English fallback`);
  if (item.learningTip && [item.explanation, item.chinese].some((value) => normalizedTeaching(value) === normalizedTeaching(item.learningTip))) failures.push(`${item.sourceId} learning tip duplicates another teaching block`);
  if (item.pattern || item.insight || item.content) failures.push(`${item.sourceId} teaching contract leaked a legacy fallback block`);
}

for (const item of employeeManagementItems) {
  if (!item.teachingContract) failures.push(`${item.sourceId} is missing the Micro Scene teaching contract`);
  if (item.chinese !== expectedEmployeeChinese[item.sourceId]) failures.push(`${item.sourceId} approved Chinese translation changed: ${item.chinese}`);
}
const employeeVocabulary = new Map(employeeManagementItems.flatMap((item) => item.harvest.map((entry) => [harvestTerm(entry).toLocaleLowerCase(), harvestMeaning(entry)])));
for (const [term, meaning] of Object.entries(expectedEmployeeVocabulary)) {
  if (employeeVocabulary.get(term) !== meaning) failures.push(`Employee Management vocabulary must teach ${term} as ${meaning}; found ${employeeVocabulary.get(term)}`);
}
const managerIds = new Set(navigation.getFactoryManagerMicroGroups().flatMap((group) => navigation.getHistoricalMicroItems('factory', group.slug, 'manager')).map((item) => item.sourceId));
for (const sourceId of expectedEmployeeManagementIds) if (managerIds.has(sourceId)) failures.push(`${sourceId} remains mixed into Factory Manager operational groups`);
for (const excludedId of ['EXP-SOC-313', 'EXP-SOC-316']) if (historicalIds.has(excludedId)) failures.push(`${excludedId} must remain excluded from Micro Scene`);

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
console.log('Historical Quick core integrity: 421');
console.log('Quick Experience reachable: 449');
console.log('Driver reachable: 32');
console.log('Nanny reachable: 49');
console.log('Factory Manager operational reachable: 65');
console.log('Employee Management reachable: 11');
console.log('Factory role/module reachable: 119');
console.log('City Life / 生活办事 reachable: 58');
console.log('City Life / 社交关系 reachable: 115');
console.log('City Life unclassified: 0');
console.log('City Life duplicate primary assignments: 0');
console.log('Human-approved language fixes: EXP-SOC-028, EXP-FAC-046 + final 11-ID language review');
console.log('EXP-LIF-220 unchanged: needs Human scene definition');
console.log('Scene Map mapped Quick: 397 (369 core + 28 approved additions)');
console.log('Scene Map UNMAPPED_REVIEW preserved and reachable: 52');
console.log('Scene Map taxonomy regression: 6 domains / 36 topics');
console.log('Progress identity: stable Quick ID + backward-compatible micro:{id} read');
