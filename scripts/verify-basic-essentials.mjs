import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const sourcePath = path.join(root, 'lib', 'basic-essentials.ts');
const realUseSourcePath = path.join(root, 'lib', 'basic-real-use.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const realUseSource = fs.existsSync(realUseSourcePath) ? fs.readFileSync(realUseSourcePath, 'utf8') : '';
const experienceComponentSource = fs.readFileSync(path.join(root, 'components', 'BasicEssentialsExperience.tsx'), 'utf8');
const conceptGridSource = fs.readFileSync(path.join(root, 'components', 'BasicConceptGrid.tsx'), 'utf8');
const aboutWorkspaceSource = fs.readFileSync(path.join(root, 'components', 'AboutMeWorkspace.tsx'), 'utf8');
const learningProfileSource = fs.readFileSync(path.join(root, 'lib', 'learning-profile.ts'), 'utf8');
const homeSource = fs.readFileSync(path.join(root, 'components', 'V2HomeDashboard.tsx'), 'utf8');
const pwaSource = fs.readFileSync(path.join(root, 'components', 'PwaInstallButton.tsx'), 'utf8');
const globalStylesSource = fs.readFileSync(path.join(root, 'app', 'globals.css'), 'utf8');
const failures = [];
const warnings = [];

function compileBasicEssentials() {
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    fileName: sourcePath,
    reportDiagnostics: true,
  });

  const diagnostics = compiled.diagnostics ?? [];
  for (const diagnostic of diagnostics) {
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      failures.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'indobrain-basic-'));
  const tempFile = path.join(tempDir, 'basic-essentials.cjs');
  fs.writeFileSync(tempFile, compiled.outputText, 'utf8');
  const require = createRequire(import.meta.url);
  const module = require(tempFile);
  fs.rmSync(tempDir, { recursive: true, force: true });
  return module;
}

function compileBasicRealUse() {
  if (!realUseSource) {
    failures.push('Missing Real Use runtime data: lib/basic-real-use.ts');
    return {};
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'indobrain-real-use-'));
  const require = createRequire(import.meta.url);
  const basicCompiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    fileName: sourcePath,
    reportDiagnostics: true,
  });
  const realUseCompiled = ts.transpileModule(realUseSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    fileName: realUseSourcePath,
    reportDiagnostics: true,
  });

  for (const diagnostic of [...(basicCompiled.diagnostics ?? []), ...(realUseCompiled.diagnostics ?? [])]) {
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      failures.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  }

  fs.writeFileSync(path.join(tempDir, 'basic-essentials.js'), basicCompiled.outputText, 'utf8');
  fs.writeFileSync(path.join(tempDir, 'basic-real-use.js'), realUseCompiled.outputText, 'utf8');
  const module = require(path.join(tempDir, 'basic-real-use.js'));
  fs.rmSync(tempDir, { recursive: true, force: true });
  return module;
}

function uniqueBy(items, key, label) {
  const seen = new Map();
  for (const item of items) {
    const value = key(item);
    if (!value) failures.push(`${label} is empty for ${item.id ?? item.title ?? 'unknown item'}`);
    if (seen.has(value)) failures.push(`Duplicate ${label}: ${value} (${seen.get(value)} / ${item.id ?? item.title})`);
    seen.set(value, item.id ?? item.title);
  }
}

function normalize(text) {
  return String(text ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasChinese(text) {
  return /[\u3400-\u9FFF]/.test(String(text ?? ''));
}

function getKnownSceneIds() {
  const ids = new Set();
  const dirs = ['lib'];
  const stack = dirs.map((dir) => path.join(root, dir));
  while (stack.length) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.name.endsWith('.ts')) continue;
      const text = fs.readFileSync(fullPath, 'utf8');
      for (const match of text.matchAll(/['"`](EXP-[A-Z]+-\d{3})['"`]/g)) ids.add(match[1]);
    }
  }
  return ids;
}

const {
  basicEssentialsCategories,
  basicEssentialsConcepts,
  basicEssentialsNumberSteps,
  basicEssentialsCounterExamples,
  basicEssentialsMicroScenes,
  getBasicFavoriteId,
  getBasicSearchEntries,
  resolveBasicFavoriteIds,
  searchBasicConcepts,
} = compileBasicEssentials();

const {
  BASIC_REAL_USE_EXPECTED_STATS,
  basicRealUseGroupBindings,
  basicRealUseUnits,
} = compileBasicRealUse();

const categoryIds = new Set(basicEssentialsCategories.map((item) => item.id));
const subcategoryByCategory = new Map(
  basicEssentialsCategories.map((category) => [category.id, new Set(category.subcategories.map((item) => item.id))]),
);
const conceptIds = new Set(basicEssentialsConcepts.map((item) => item.id));
const conceptKeys = new Set(basicEssentialsConcepts.map((item) => item.conceptKey));
const knownSceneIds = getKnownSceneIds();

if (basicEssentialsCategories.length !== 6) failures.push(`Expected 6 top categories, found ${basicEssentialsCategories.length}`);

const expectedCategoryTitles = ['高频基础', '感受与状态', '吃喝', '身体与穿戴', '居家常用', '出行交通'];
for (const title of expectedCategoryTitles) {
  if (!basicEssentialsCategories.some((item) => item.title === title)) failures.push(`Missing frozen top category: ${title}`);
}

uniqueBy(basicEssentialsCategories, (item) => item.id, 'category id');
for (const category of basicEssentialsCategories) uniqueBy(category.subcategories, (item) => item.id, `subcategory id in ${category.id}`);
uniqueBy(basicEssentialsConcepts, (item) => item.id, 'concept id');
uniqueBy(basicEssentialsConcepts, (item) => item.conceptKey, 'concept key');

const visibleConcepts = basicEssentialsConcepts.filter((item) => item.status === 'active');
const basicSearchEntries = getBasicSearchEntries();
const basicSearchEntryByKey = new Map(basicSearchEntries.map((item) => [item.conceptKey, item]));
const favoriteIds = new Set();
let indonesianSearchCoverage = 0;
let chineseSearchCoverage = 0;

if (basicSearchEntries.length !== visibleConcepts.length) {
  failures.push(`Basic search index must contain every learner-visible concept: ${basicSearchEntries.length}/${visibleConcepts.length}`);
}

for (const concept of visibleConcepts) {
  const indonesianMatches = searchBasicConcepts(concept.indonesian);
  if (indonesianMatches.some((item) => item.conceptKey === concept.conceptKey)) indonesianSearchCoverage += 1;
  else failures.push(`Learner-visible Indonesian is not searchable: ${concept.conceptKey} -> ${concept.indonesian}`);

  const chineseMatches = searchBasicConcepts(concept.chinese);
  if (chineseMatches.some((item) => item.conceptKey === concept.conceptKey)) chineseSearchCoverage += 1;
  else failures.push(`Learner-visible Chinese meaning is not searchable: ${concept.conceptKey} -> ${concept.chinese}`);

  const searchEntry = basicSearchEntryByKey.get(concept.conceptKey);
  if (!searchEntry) continue;
  if (!searchEntry.searchText.includes(normalize(concept.indonesian))) failures.push(`Basic search entry is missing Indonesian: ${concept.conceptKey}`);
  if (!searchEntry.searchText.includes(normalize(concept.chinese))) failures.push(`Basic search entry is missing Chinese: ${concept.conceptKey}`);
  if (!searchEntry.href.includes(`concept=${encodeURIComponent(concept.conceptKey)}`)) failures.push(`Basic search entry has unstable href: ${concept.conceptKey}`);

  const favoriteId = getBasicFavoriteId(concept.conceptKey);
  if (favoriteId !== `BASIC:${concept.conceptKey}`) failures.push(`Basic favorite ID must derive from stable conceptKey: ${concept.conceptKey} -> ${favoriteId}`);
  if (favoriteIds.has(favoriteId)) failures.push(`Duplicate Basic favorite ID: ${favoriteId}`);
  favoriteIds.add(favoriteId);
}

for (const [query, expectedKey] of [['lapar', 'lapar'], ['饿', 'lapar'], ['haus', 'haus'], ['渴', 'haus'], ['capek', 'capek'], ['累', 'capek']]) {
  if (!searchBasicConcepts(query).some((item) => item.conceptKey === expectedKey)) failures.push(`Human search case failed: ${query} -> ${expectedKey}`);
}

const favoriteContractKeys = ['lapar', 'haus', 'capek'];
const persistedBasicFavoriteIds = favoriteContractKeys.map(getBasicFavoriteId);
const resolvedBasicFavorites = resolveBasicFavoriteIds(persistedBasicFavoriteIds);
if (resolvedBasicFavorites.map((item) => item.conceptKey).join(',') !== favoriteContractKeys.join(',')) {
  failures.push(`Basic favorite resolver failed persisted ID -> canonical concept contract: ${resolvedBasicFavorites.map((item) => item.conceptKey).join(',')}`);
}
if (resolveBasicFavoriteIds([...persistedBasicFavoriteIds, 'EXP-DRV-001', 'BASIC:not-a-concept']).length !== favoriteContractKeys.length) {
  failures.push('Basic favorite resolver must preserve non-Basic favorites and ignore unknown Basic IDs');
}

if (!homeSource.includes('basicSearchEntries') || !homeSource.includes("type: '基础必会'")) failures.push('Unified home search is not wired to the canonical Basic Essentials search index');
if (!experienceComponentSource.includes('searchBasicConcepts(query)')) failures.push('Basic Essentials search page is not using the canonical search helper');
if (!conceptGridSource.includes('getBasicFavoriteId(item.conceptKey)')) failures.push('Basic vocabulary favorite keys are not derived from stable conceptKey values');
if (!conceptGridSource.includes('readLearningProfile') || !conceptGridSource.includes('subscribeProfile') || !conceptGridSource.includes('toggleFavorite')) failures.push('Basic favorites must reuse persistent learning-profile storage');
if (!conceptGridSource.includes('IndonesianSpeechButton') || !conceptGridSource.includes('aria-pressed')) failures.push('Basic favorite cards must retain independent TTS and accessible favorite controls');
if (!experienceComponentSource.includes('/basic-essentials?favorites=1') || !experienceComponentSource.includes('favoritesOnly')) failures.push('Basic Essentials 我的收藏 entry/review is missing');
if (!aboutWorkspaceSource.includes('resolveBasicFavoriteIds(profile.favorites)') || !aboutWorkspaceSource.includes('basicFavorites.map')) failures.push('Global favorites view does not resolve and render Basic favorite IDs');
if (!aboutWorkspaceSource.includes('IndonesianSpeechButton text={item.ttsText}') || !aboutWorkspaceSource.includes('toggleFavorite(getBasicFavoriteId(item.conceptKey))')) failures.push('Global Basic favorite cards must retain TTS and unfavorite controls');
if (!aboutWorkspaceSource.includes('id="favorites"')) failures.push('Global favorites anchor is missing');
if (!aboutWorkspaceSource.includes('useState<LearningProfile>(createEmptyLearningProfile)') || !learningProfileSource.includes('export const createEmptyLearningProfile')) failures.push('Global favorites view must hydrate from a deterministic profile before syncing persistent storage');
if (!pwaSource.includes('basicPwaInstallVisible') || !globalStylesSource.includes("html[data-basic-pwa-install-visible='true'] [data-basic-essentials-page]")) failures.push('Basic Essentials PWA install banner does not reserve content space');

const duplicateTermAllowlist = new Set([
  // True homonyms or intentionally different real-world registers.
  'minggu',
  'tahu',
]);
const termOwners = new Map();

for (const concept of basicEssentialsConcepts) {
  if (!categoryIds.has(concept.categoryId)) failures.push(`Invalid categoryId for ${concept.conceptKey}: ${concept.categoryId}`);
  if (!subcategoryByCategory.get(concept.categoryId)?.has(concept.subcategoryId)) failures.push(`Invalid subcategoryId for ${concept.conceptKey}: ${concept.categoryId}/${concept.subcategoryId}`);

  for (const field of ['chinese', 'indonesian', 'ttsText', 'shortMeaning']) {
    if (!String(concept[field] ?? '').trim()) failures.push(`Missing ${field} for ${concept.conceptKey}`);
  }
  if (!hasChinese(concept.chinese)) failures.push(`Chinese meaning has no Chinese characters: ${concept.conceptKey}`);
  if (/[\u3400-\u9FFF]/.test(concept.ttsText)) failures.push(`ttsText contains Chinese: ${concept.conceptKey}`);
  if (!Array.isArray(concept.standardForms) || concept.standardForms.length < 1) failures.push(`Missing standardForms for ${concept.conceptKey}`);
  if (!Array.isArray(concept.colloquialForms)) failures.push(`colloquialForms must be an array for ${concept.conceptKey}`);
  if (!['超高频', '高频', '常用', '识别'].includes(concept.frequency)) failures.push(`Invalid frequency for ${concept.conceptKey}: ${concept.frequency}`);
  if (![1, 2, 3].includes(concept.difficulty)) failures.push(`Invalid difficulty for ${concept.conceptKey}: ${concept.difficulty}`);
  if (concept.status !== 'active') failures.push(`Basic Essentials V1 should not ship draft concept: ${concept.conceptKey}`);

  for (const relatedId of concept.relatedConceptIds ?? []) {
    if (!conceptIds.has(relatedId) && !conceptKeys.has(relatedId)) failures.push(`Unknown relatedConceptId for ${concept.conceptKey}: ${relatedId}`);
  }
  for (const prerequisiteId of concept.prerequisiteConceptIds ?? []) {
    if (!conceptIds.has(prerequisiteId) && !conceptKeys.has(prerequisiteId)) failures.push(`Unknown prerequisiteConceptId for ${concept.conceptKey}: ${prerequisiteId}`);
  }
  for (const sceneId of concept.relatedSceneIds ?? []) {
    if (!knownSceneIds.has(sceneId)) failures.push(`Unknown relatedSceneId for ${concept.conceptKey}: ${sceneId}`);
  }

  const term = normalize(concept.indonesian);
  if (termOwners.has(term) && !duplicateTermAllowlist.has(term)) {
    failures.push(`Duplicate Indonesian concept term: "${concept.indonesian}" (${termOwners.get(term)} / ${concept.conceptKey})`);
  } else {
    termOwners.set(term, concept.conceptKey);
  }
}

const byKey = new Map(basicEssentialsConcepts.map((item) => [item.conceptKey, item]));
const diMana = byKey.get('di-mana');
if (!diMana || !/哪里|哪儿/.test(diMana.chinese)) failures.push('High-risk check failed: di mana must mean 在哪里 / 哪儿');
const kosong = byKey.get('kosong');
if (!kosong || !/0|零|空/.test(kosong.chinese + kosong.usageNote)) failures.push('Number integrity failed: kosong must explain zero/empty usage');
const nol = byKey.get('nol');
if (!nol || !/零|0/.test(nol.chinese + nol.usageNote)) failures.push('Number integrity failed: nol must explain zero');

for (const step of basicEssentialsNumberSteps) {
  if (!step.items.length) failures.push(`Number step has no items: ${step.id}`);
  for (const item of step.items) {
    if (!item.indonesian || !item.chinese) failures.push(`Number step item incomplete in ${step.id}`);
  }
}

for (const item of basicEssentialsCounterExamples) {
  if (!item.indonesian || !item.chinese) failures.push(`Counter example incomplete: ${JSON.stringify(item)}`);
}

if (!Array.isArray(basicEssentialsMicroScenes) || basicEssentialsMicroScenes.length < 8) {
  failures.push(`Expected at least 8 Basic Essentials micro scenes, found ${basicEssentialsMicroScenes?.length ?? 0}`);
}

uniqueBy(basicEssentialsMicroScenes ?? [], (item) => item.id, 'micro scene id');
for (const scene of basicEssentialsMicroScenes ?? []) {
  for (const field of ['id', 'titleZh', 'contextZh']) {
    if (!String(scene[field] ?? '').trim()) failures.push(`Micro scene missing ${field}: ${scene.id ?? 'unknown'}`);
  }
  if (scene.status !== 'active') failures.push(`Micro scene should not ship draft status: ${scene.id}`);
  if (!Array.isArray(scene.conceptIds) || scene.conceptIds.length < 2) failures.push(`Micro scene needs reusable conceptIds: ${scene.id}`);
  for (const conceptId of scene.conceptIds ?? []) {
    if (!conceptKeys.has(conceptId) && !conceptIds.has(conceptId)) failures.push(`Micro scene references unknown conceptId: ${scene.id} -> ${conceptId}`);
  }
  if (!Array.isArray(scene.lines) || scene.lines.length < 2 || scene.lines.length > 4) failures.push(`Micro scene lines must be 2-4 short expressions: ${scene.id}`);
  for (const line of scene.lines ?? []) {
    if (!String(line.indonesian ?? '').trim()) failures.push(`Micro scene line missing Indonesian: ${scene.id}`);
    if (!String(line.chinese ?? '').trim() || !hasChinese(line.chinese)) failures.push(`Micro scene line missing Chinese: ${scene.id} -> ${line.indonesian}`);
    if (!String(line.ttsText ?? '').trim()) failures.push(`Micro scene line missing ttsText: ${scene.id} -> ${line.indonesian}`);
    if (hasChinese(line.ttsText)) failures.push(`Micro scene ttsText contains Chinese: ${scene.id} -> ${line.ttsText}`);
    if (normalize(line.ttsText) !== normalize(line.indonesian)) failures.push(`Micro scene ttsText must match the current line: ${scene.id} -> ${line.indonesian}`);
    if (String(line.indonesian ?? '').length > 80) failures.push(`Micro scene line is too long for zero-beginner UX: ${scene.id} -> ${line.indonesian}`);
  }
  for (const sceneId of scene.relatedSceneIds ?? []) {
    if (!knownSceneIds.has(sceneId)) failures.push(`Micro scene references unknown relatedSceneId: ${scene.id} -> ${sceneId}`);
  }
}

const highRiskIncomplete = [
  ['di mana', /哪里|哪儿/],
  ['ke mana', /去哪里|去哪/],
  ['dari mana', /从哪里|哪里来的/],
  ['berapa lama', /多久/],
  ['berapa jauh', /多远/],
  ['tidak apa-apa', /没关系|不要紧/],
  ['ada apa', /怎么了|什么事/],
];

for (const [term, expected] of highRiskIncomplete) {
  const matches = basicEssentialsConcepts.filter((item) => normalize(item.indonesian) === term);
  for (const item of matches) {
    if (!expected.test(item.chinese + item.shortMeaning + (item.usageNote ?? ''))) {
      failures.push(`High-risk Chinese meaning may be incomplete: ${term} => ${item.chinese}`);
    }
  }
}

if (!source.includes('export type BasicConcept')) failures.push('Content/UI separation failed: BasicConcept schema is missing from lib/basic-essentials.ts');
if (!source.includes('export type BasicMicroScene')) failures.push('Micro scene schema is missing from lib/basic-essentials.ts');
if (source.includes('IndonesianSpeechButton') || source.includes('className=')) failures.push('Content/UI separation failed: lib/basic-essentials.ts contains UI code');

function buildLearningGroups(groupSize = 8) {
  const groups = [];
  const sortedCategories = [...basicEssentialsCategories].sort((a, b) => a.order - b.order);
  for (const category of sortedCategories) {
    for (const subcategory of [...category.subcategories].sort((a, b) => a.order - b.order)) {
      const items = basicEssentialsConcepts
        .filter((concept) => concept.categoryId === category.id && concept.subcategoryId === subcategory.id && concept.status === 'active')
        .sort((a, b) => a.order - b.order);
      for (let index = 0; index < items.length; index += groupSize) {
        groups.push({
          learningGroupId: `${category.id}:${subcategory.id}:${Math.floor(index / groupSize) + 1}`,
          categoryId: category.id,
          subcategoryId: subcategory.id,
          group: Math.floor(index / groupSize) + 1,
          concepts: items.slice(index, index + groupSize),
        });
      }
    }
  }
  return groups;
}

const realUseUnits = basicRealUseUnits ?? [];
const realUseBindings = basicRealUseGroupBindings ?? [];
const realUseStats = BASIC_REAL_USE_EXPECTED_STATS ?? {};
const learningGroups = buildLearningGroups();
const realUseById = new Map(realUseUnits.map((unit) => [unit.id, unit]));
const bindingsByLearningGroup = new Map();
const displayCounts = new Map();

if (realUseStats.totalConcepts !== 633) failures.push(`Real Use expected totalConcepts must be 633, found ${realUseStats.totalConcepts}`);
if (learningGroups.length !== 93) failures.push(`Expected 93 Learning Groups, found ${learningGroups.length}`);
if (realUseUnits.length !== 93) failures.push(`Expected 93 Real Use Units, found ${realUseUnits.length}`);
if (realUseBindings.length !== 93) failures.push(`Expected 93 Real Use bindings, found ${realUseBindings.length}`);

let realUseItemCount = 0;
let phraseCount = 0;
let sentenceCount = 0;
let microSceneCount = 0;

uniqueBy(realUseUnits, (unit) => unit.id, 'real use id');

for (const binding of realUseBindings) {
  if (!binding.learningGroupId || !binding.realUseId) failures.push(`Real Use binding is incomplete: ${JSON.stringify(binding)}`);
  const expectedLearningGroupId = `${binding.categoryId}:${binding.subcategoryId}:${binding.group}`;
  if (binding.learningGroupId !== expectedLearningGroupId) failures.push(`Real Use binding learningGroupId mismatch: ${binding.learningGroupId} should be ${expectedLearningGroupId}`);
  if (!realUseById.has(binding.realUseId)) failures.push(`Real Use binding references missing unit: ${binding.learningGroupId} -> ${binding.realUseId}`);
  if (bindingsByLearningGroup.has(binding.learningGroupId)) failures.push(`Learning Group has more than one Real Use binding: ${binding.learningGroupId}`);
  bindingsByLearningGroup.set(binding.learningGroupId, binding.realUseId);
  displayCounts.set(binding.realUseId, (displayCounts.get(binding.realUseId) ?? 0) + 1);
}

for (const group of learningGroups) {
  if (!bindingsByLearningGroup.has(group.learningGroupId)) failures.push(`Learning Group has no Real Use: ${group.learningGroupId}`);
}

for (const [realUseId, count] of displayCounts) {
  if (count !== 1) failures.push(`Duplicated Real Use display binding: ${realUseId} appears ${count} times`);
}

function conceptMatchesText(conceptId, text) {
  const normalizedText = normalize(text).replace(/-/g, ' ');
  const concept = basicEssentialsConcepts.find((item) => item.conceptKey === conceptId || item.id === conceptId);
  const displayAliases = {
    'kotak-counter': ['kotak'],
    'lembar-counter': ['lembar'],
    'sakit-tenggorokan': ['sakit tenggorokan', 'tenggorokan sakit'],
  };
  const forms = new Set([
    conceptId.replace(/-/g, ' '),
    concept?.indonesian,
    ...(concept?.standardForms ?? []),
    ...(concept?.colloquialForms ?? []),
    ...(displayAliases[conceptId] ?? []),
  ].filter(Boolean).map((item) => normalize(item).replace(/-/g, ' ')));
  for (const form of [...forms]) {
    forms.add(`${form}nya`);
    forms.add(`${form}ku`);
    forms.add(`${form}mu`);
  }
  return [...forms].some((form) => form && normalizedText.includes(form));
}

for (const unit of realUseUnits) {
  if (!['phrase', 'sentence', 'micro_scene'].includes(unit.type)) failures.push(`Invalid Real Use type: ${unit.id} -> ${unit.type}`);
  if (unit.type === 'phrase') phraseCount += 1;
  if (unit.type === 'sentence') sentenceCount += 1;
  if (unit.type === 'micro_scene') microSceneCount += 1;
  if (unit.status !== 'active') failures.push(`Real Use unit should be active: ${unit.id}`);
  if (!String(unit.titleZh ?? '').trim() || !hasChinese(unit.titleZh)) failures.push(`Real Use unit missing Chinese titleZh: ${unit.id}`);
  if (!Array.isArray(unit.items) || unit.items.length < 1) failures.push(`Real Use unit has no items: ${unit.id}`);
  if (unit.type === 'micro_scene' && (!unit.contextZh || !hasChinese(unit.contextZh))) failures.push(`Micro-scene Real Use needs contextZh: ${unit.id}`);
  for (const item of unit.items ?? []) {
    realUseItemCount += 1;
    if (!String(item.indonesian ?? '').trim()) failures.push(`Real Use item missing Indonesian: ${unit.id}`);
    if (!String(item.chinese ?? '').trim() || !hasChinese(item.chinese)) failures.push(`Real Use item missing Chinese: ${unit.id} -> ${item.indonesian}`);
    if (!String(item.ttsText ?? '').trim()) failures.push(`Real Use item missing ttsText: ${unit.id} -> ${item.indonesian}`);
    if (/[\u3400-\u9FFF]/.test(item.ttsText)) failures.push(`Real Use ttsText contains Chinese: ${unit.id} -> ${item.ttsText}`);
    if (normalize(item.ttsText) !== normalize(item.indonesian)) failures.push(`Real Use ttsText must match Indonesian display: ${unit.id} -> ${item.indonesian}`);
    if (!Array.isArray(item.conceptIds) || item.conceptIds.length < 1) failures.push(`Real Use item missing conceptIds: ${unit.id} -> ${item.indonesian}`);
    for (const conceptId of item.conceptIds ?? []) {
      if (!conceptKeys.has(conceptId) && !conceptIds.has(conceptId)) failures.push(`Real Use item references unknown conceptId: ${unit.id} -> ${conceptId}`);
      if (!conceptMatchesText(conceptId, item.indonesian)) failures.push(`Invalid Real Use concept binding: ${unit.id} -> "${item.indonesian}" does not visibly use ${conceptId}`);
    }
  }
}

if (realUseItemCount !== 279) failures.push(`Expected 279 Real Use items, found ${realUseItemCount}`);
if (phraseCount !== 34) failures.push(`Expected 34 phrase Real Use units, found ${phraseCount}`);
if (sentenceCount !== 48) failures.push(`Expected 48 sentence Real Use units, found ${sentenceCount}`);
if (microSceneCount !== 11) failures.push(`Expected 11 micro_scene Real Use units, found ${microSceneCount}`);
if (realUseStats.totalRealUseItems !== 279 || realUseStats.phrase !== 34 || realUseStats.sentence !== 48 || realUseStats.microScene !== 11) {
  failures.push(`Real Use expected stats are not frozen V1 values: ${JSON.stringify(realUseStats)}`);
}

const routeExists = fs.existsSync(path.join(root, 'app', 'basic-essentials', 'page.tsx'));
const componentExists = fs.existsSync(path.join(root, 'components', 'BasicEssentialsExperience.tsx'));
if (!routeExists) warnings.push('Basic Essentials route not present yet: app/basic-essentials/page.tsx');
if (!componentExists) warnings.push('Basic Essentials UI component not present yet: components/BasicEssentialsExperience.tsx');

if (failures.length) {
  console.error('BASIC ESSENTIALS INTEGRITY: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`BASIC ESSENTIALS INTEGRITY: PASS (${basicEssentialsConcepts.length} concepts, ${basicEssentialsCategories.length} categories, ${basicEssentialsMicroScenes.length} micro scenes, ${realUseUnits.length} real use units, ${realUseItemCount} real use items)`);
console.log(`BASIC ESSENTIALS SEARCH COVERAGE: ${indonesianSearchCoverage}/${visibleConcepts.length} Indonesian, ${chineseSearchCoverage}/${visibleConcepts.length} Chinese`);
if (warnings.length) {
  for (const warning of warnings) console.warn(`BASIC ESSENTIALS WARNING: ${warning}`);
}
