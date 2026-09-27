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
const { vocabularyLibrary, vocabularyLibraryCategories } = require(path.join(root, 'lib/vocabulary-library.ts'));
const { vocabularyCategoryLabels } = require(path.join(root, 'lib/v2/vocabulary.ts'));
const { basicEssentialsCategories, getBasicConcepts } = require(path.join(root, 'lib/basic-essentials.ts'));
const {
  getCityLifeMicroSections,
  getDriverMicroGroups,
  getFactoryManagerMicroGroups,
  getFactoryMicroRoles,
  getHistoricalMicroItems,
  getHistoricalMicroModules,
  getHistoricalMicroReachableIds,
  getNannyMicroGroups,
} = require(path.join(root, 'lib/historical-micro-navigation.ts'));
const { getSceneMapCount, getSceneMapGroupCount, getSceneMapTopicCounts, sceneMapV2 } = require(path.join(root, 'lib/scene-map-v2.ts'));
const { getLoveScenesForChapter, loveChapters, loveScenes } = require(path.join(root, 'lib/love-indonesian-content.ts'));

const contentStats = getContentStats();
const microSceneStats = getMicroSceneStats();
const sources = Object.fromEntries([
  ['home', 'components/V2HomeDashboard.tsx'],
  ['vocabulary', 'components/VocabularyLibrary.tsx'],
  ['basic', 'components/BasicEssentialsExperience.tsx'],
  ['micro', 'components/MicroSceneLibrary.tsx'],
  ['golden', 'components/SceneMapV2Entry.tsx'],
  ['love', 'components/LoveIndonesianExperience.tsx'],
].map(([key, relativePath]) => [key, fs.readFileSync(path.join(root, relativePath), 'utf8')]));

const topLevel = {
  vocabulary: contentStats.vocabularyCount,
  basicEssentials: contentStats.basicEssentialsConceptCount,
  microScenes: microSceneStats.visibleAssetCount,
  goldenScenes: contentStats.goldenSceneCount,
  love: contentStats.loveSceneCount,
};
const vocabulary = Object.fromEntries(vocabularyLibraryCategories.map((category) => [vocabularyCategoryLabels[category], vocabularyLibrary.filter((item) => item.category === category).length]));
const basicEssentials = Object.fromEntries(basicEssentialsCategories.map((category) => [category.title, {
  count: getBasicConcepts({ categoryId: category.id }).length,
  subcategories: Object.fromEntries(category.subcategories.map((subcategory) => [subcategory.title, getBasicConcepts({ categoryId: category.id, subcategoryId: subcategory.id }).length])),
}]));
const microModules = getHistoricalMicroModules();
const cityLifeSections = getCityLifeMicroSections();
const microScenes = {
  modules: Object.fromEntries(microModules.map((module) => [module.title, module.count])),
  driver: Object.fromEntries(getDriverMicroGroups().map((group) => [group.title, group.count])),
  nanny: Object.fromEntries(getNannyMicroGroups().map((group) => [group.title, group.count])),
  factoryRoles: Object.fromEntries(getFactoryMicroRoles().map((group) => [group.title, group.count])),
  factoryManager: Object.fromEntries(getFactoryManagerMicroGroups().map((group) => [group.title, group.count])),
  cityLife: Object.fromEntries(cityLifeSections.map((section) => [section.title, {
    count: section.groups.reduce((total, group) => total + group.count, 0),
    subcategories: Object.fromEntries(section.groups.filter((group) => group.count > 0).map((group) => [group.title, group.count])),
  }])),
};
const goldenScenes = Object.fromEntries(sceneMapV2.map((group) => [group.title, {
  count: getSceneMapGroupCount(group, 'golden'),
  subcategories: Object.fromEntries(group.topics.map((topic) => [topic.title, getSceneMapTopicCounts(topic).golden])),
}]));
const love = Object.fromEntries(loveChapters.map((chapter) => [chapter.chineseTitle, getLoveScenesForChapter(chapter.id).length]));
const report = { topLevel, vocabulary, basicEssentials, microScenes, goldenScenes, love };

const sum = (values) => values.reduce((total, value) => total + value, 0);
const assert = (condition, message) => { if (!condition) failures.push(message); };

for (const [category, count] of Object.entries(topLevel)) assert(Number.isInteger(count) && count > 0, `${category} count is invalid: ${count}`);
assert(contentStats.loveSceneCount === loveScenes.length, 'Love count is not derived from the canonical scene array');
assert(sum(Object.values(vocabulary)) === topLevel.vocabulary, 'Vocabulary subcategory counts do not equal the top-level count');
for (const [title, category] of Object.entries(basicEssentials)) assert(sum(Object.values(category.subcategories)) === category.count, `Basic Essentials subcategory counts do not equal ${title}`);
assert(sum(Object.values(basicEssentials).map((category) => category.count)) === topLevel.basicEssentials, 'Basic Essentials category counts do not equal the top-level count');
assert(getHistoricalMicroReachableIds().length === topLevel.microScenes, 'Reachable Micro Scene IDs do not equal the top-level count');
assert(sum(Object.values(microScenes.modules)) === topLevel.microScenes, 'Micro Scene module counts do not equal the top-level count');
for (const group of getFactoryManagerMicroGroups()) assert(group.count === getHistoricalMicroItems('factory', group.slug, 'manager').length, `Factory manager count is not derived from its real item list: ${group.title}`);
const lifeModule = microModules.find((module) => module.slug === 'life');
assert(Boolean(lifeModule) && sum(Object.values(microScenes.cityLife).map((section) => section.count)) === lifeModule.count, 'City Life sections do not equal the Life module count');
assert(getSceneMapCount('golden') === topLevel.goldenScenes, 'Golden Scene unique count does not equal the top-level count');
assert(sum(Object.values(love)) === topLevel.love, 'Love chapter counts do not equal the top-level count');

for (const binding of ['contentStats.vocabularyCount', 'contentStats.basicEssentialsConceptCount', 'microSceneStats.visibleAssetCount', 'contentStats.goldenSceneCount', 'contentStats.loveSceneCount']) assert(sources.home.includes(binding), `Homepage count binding missing: ${binding}`);
for (const label of ['生词', '基础必会', '微场景', '黄金场景', '印尼语恋爱大全']) assert(sources.home.includes(`label: '${label}'`), `Homepage learning category missing: ${label}`);
assert(sources.home.includes('items-baseline') && sources.home.includes('tabular-nums'), 'Homepage count display is not attached to the category title');
assert(!/hidden[^"']*\{link\.count\}/.test(sources.home), 'Homepage counts remain hidden on mobile');
for (const [area, source] of Object.entries({ vocabulary: sources.vocabulary, basic: sources.basic, micro: sources.micro, golden: sources.golden, love: sources.love })) assert(source.includes('tabular-nums'), `${area} does not render counts adjacent to titles`);
assert(sources.basic.includes('getBasicConcepts({ categoryId: item.id }).length'), 'Basic Essentials root count is not derived from canonical concepts');
assert(sources.micro.includes('visibleGroups.reduce') && !sources.micro.includes('rounded-full bg-[var(--ib-primary-soft)] px-2.5 py-1 text-xs font-semibold tabular-nums'), 'Micro Scene child counts are not inline or data-derived');
assert(!sources.golden.includes('function CountPill') && sources.golden.includes('getSceneMapGroupCount(item, selectedType)'), 'Golden Scene counts are not inline and type-filtered');
assert(sources.love.includes('{loveScenes.length}') && sources.love.includes('{loveChapters.length}') && !sources.love.includes('100 句 · 10 章'), 'Love counts contain a hard-coded display value');

if (failures.length) {
  console.error(`HOME CONTENT COUNTS: FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log('HOME CONTENT COUNTS: PASS');
console.log(JSON.stringify(report, null, 2));
