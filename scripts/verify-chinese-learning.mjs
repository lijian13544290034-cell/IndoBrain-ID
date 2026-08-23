import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function compileChineseLearning() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'indobrain-chinese-learning-'));
  const require = createRequire(import.meta.url);
  for (const file of ['chinese-learning', 'chinese-tts-provider']) {
    const sourcePath = path.join(root, 'lib', `${file}.ts`);
    const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, skipLibCheck: true },
      fileName: sourcePath,
      reportDiagnostics: true,
    });
    for (const diagnostic of compiled.diagnostics ?? []) {
      if (diagnostic.category === ts.DiagnosticCategory.Error) failures.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
    fs.writeFileSync(path.join(tempDir, `${file}.js`), compiled.outputText, 'utf8');
  }
  const module = require(path.join(tempDir, 'chinese-learning.js'));
  const ttsModule = require(path.join(tempDir, 'chinese-tts-provider.js'));
  fs.rmSync(tempDir, { recursive: true, force: true });
  return { ...module, ...ttsModule };
}

function uniqueBy(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    const value = key(item);
    if (!value) failures.push(`Missing ${label}`);
    if (seen.has(value)) failures.push(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

const {
  chineseConcepts,
  chineseLearningGroups,
  chineseRealUses,
  chineseAzureVoice,
} = compileChineseLearning();

const conceptIds = new Set(chineseConcepts.map((item) => item.id));
const realUseIds = new Set(chineseRealUses.map((item) => item.id));

if (chineseConcepts.length !== 11) failures.push(`Expected 11 Chinese concepts, found ${chineseConcepts.length}`);
if (chineseLearningGroups.length !== 2) failures.push(`Expected 2 Chinese learning groups, found ${chineseLearningGroups.length}`);
if (chineseRealUses.length !== 2) failures.push(`Expected 2 Chinese real use units, found ${chineseRealUses.length}`);
if (chineseRealUses.reduce((sum, item) => sum + item.items.length, 0) !== 7) failures.push('Expected 7 Chinese real use items');
if (chineseAzureVoice !== 'zh-CN-XiaoxiaoNeural') failures.push(`Chinese Azure voice must be zh-CN-XiaoxiaoNeural, found ${chineseAzureVoice}`);

uniqueBy(chineseConcepts, (item) => item.id, 'Chinese concept id');
uniqueBy(chineseLearningGroups, (item) => item.id, 'Chinese learning group id');
uniqueBy(chineseRealUses, (item) => item.id, 'Chinese real use id');

for (const concept of chineseConcepts) {
  if (!/[\u3400-\u9FFF]/.test(concept.hanzi)) failures.push(`Concept ${concept.id} missing Hanzi`);
  if (!concept.pinyin || /\d/.test(concept.pinyin)) failures.push(`Concept ${concept.id} must use tone-mark pinyin`);
  if (!concept.indonesian) failures.push(`Concept ${concept.id} missing Indonesian support`);
  if (concept.ttsText !== concept.hanzi) failures.push(`Concept ${concept.id} ttsText should match Hanzi`);
  if (!concept.visualKey || !concept.visual?.kind) failures.push(`Concept ${concept.id} missing visual model`);
}

const groupRealUseCount = new Map();
for (const group of chineseLearningGroups) {
  if (!group.realUseId || !realUseIds.has(group.realUseId)) failures.push(`Group ${group.id} references missing Real Use`);
  groupRealUseCount.set(group.id, (groupRealUseCount.get(group.id) ?? 0) + 1);
  for (const conceptId of group.conceptIds) {
    if (!conceptIds.has(conceptId)) failures.push(`Group ${group.id} references missing concept ${conceptId}`);
  }
}
for (const [groupId, count] of groupRealUseCount) {
  if (count !== 1) failures.push(`Group ${groupId} must have exactly ONE Real Use`);
}

for (const realUse of chineseRealUses) {
  if (!['phrase', 'sentence', 'micro_scene'].includes(realUse.type)) failures.push(`Invalid Real Use type: ${realUse.id}`);
  if (!realUse.titleZh || !realUse.titleId || !realUse.contextId) failures.push(`Real Use ${realUse.id} missing title/context`);
  if (!realUse.items.length) failures.push(`Real Use ${realUse.id} has no items`);
  for (const item of realUse.items) {
    if (!/[\u3400-\u9FFF]/.test(item.hanzi)) failures.push(`Real Use ${realUse.id} item missing Hanzi`);
    if (!item.pinyin || /\d/.test(item.pinyin)) failures.push(`Real Use ${realUse.id} item must use tone-mark pinyin`);
    if (!item.indonesian) failures.push(`Real Use ${realUse.id} item missing Indonesian`);
    if (!item.ttsText || !/[\u3400-\u9FFF]/.test(item.ttsText)) failures.push(`Real Use ${realUse.id} item missing Chinese ttsText`);
    for (const conceptId of item.conceptIds) {
      if (!conceptIds.has(conceptId)) failures.push(`Real Use ${realUse.id} references missing concept ${conceptId}`);
    }
  }
}

const page = read('app/learn-chinese/page.tsx');
const component = read('components/ChineseLearningExperience.tsx');
const button = read('components/ChineseSpeechButton.tsx');
const route = read('app/api/chinese-tts/route.ts');
const indonesianRoute = read('app/api/tts/route.ts');
const indonesianProvider = read('lib/tts-provider.ts');

if (!page.includes('ChineseLearningExperience')) failures.push('/learn-chinese route is not wired to ChineseLearningExperience');
if (!component.includes('ChineseSpeechButton')) failures.push('Chinese learning UI is not wired to ChineseSpeechButton');
if (!component.includes('马上会用')) failures.push('Chinese learning UI missing Real Use section');
if (/PHRASE|SENTENCE|MICRO_SCENE|realUseId|conceptIds/.test(component)) failures.push('Chinese learning UI leaks internal labels');
if (!button.includes("fetch('/api/chinese-tts'")) failures.push('ChineseSpeechButton must use /api/chinese-tts');
if (!button.includes("utterance.lang = voice.lang || 'zh-CN'")) failures.push('Chinese browser fallback must use Chinese voice/lang');
if (!button.includes('Chinese browser voice is not available')) failures.push('Chinese fallback must fail closed without Chinese voice');
if (!route.includes('getChineseTtsProvider')) failures.push('/api/chinese-tts is not wired to Chinese provider');
if (!route.includes('Only Chinese text is accepted')) failures.push('/api/chinese-tts must reject non-Chinese text');
if (!route.includes('X-IndoBrain-Chinese-TTS-Voice')) failures.push('/api/chinese-tts must return Chinese voice header');
if (!indonesianRoute.includes('Only Indonesian text is accepted')) failures.push('Existing Indonesian /api/tts guard was changed');
if (!indonesianProvider.includes('id-ID-GadisNeural')) failures.push('Existing Indonesian TTS voice was changed');

if (failures.length) {
  console.error('CHINESE LEARNING TEMPLATE: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`CHINESE LEARNING TEMPLATE: PASS (${chineseConcepts.length} concepts, ${chineseLearningGroups.length} groups, ${chineseRealUses.length} real use units, ${chineseRealUses.reduce((sum, item) => sum + item.items.length, 0)} real use items)`);
