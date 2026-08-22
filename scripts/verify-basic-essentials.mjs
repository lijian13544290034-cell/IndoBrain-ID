import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const sourcePath = path.join(root, 'lib', 'basic-essentials.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
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
} = compileBasicEssentials();

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

const routeExists = fs.existsSync(path.join(root, 'app', 'basic-essentials', 'page.tsx'));
const componentExists = fs.existsSync(path.join(root, 'components', 'BasicEssentialsExperience.tsx'));
if (!routeExists) warnings.push('Basic Essentials route not present yet: app/basic-essentials/page.tsx');
if (!componentExists) warnings.push('Basic Essentials UI component not present yet: components/BasicEssentialsExperience.tsx');

if (failures.length) {
  console.error('BASIC ESSENTIALS INTEGRITY: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`BASIC ESSENTIALS INTEGRITY: PASS (${basicEssentialsConcepts.length} concepts, ${basicEssentialsCategories.length} categories, ${basicEssentialsMicroScenes.length} micro scenes)`);
if (warnings.length) {
  for (const warning of warnings) console.warn(`BASIC ESSENTIALS WARNING: ${warning}`);
}
