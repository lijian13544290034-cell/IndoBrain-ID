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

const { loveChapters, loveScenes } = require(path.join(root, 'lib/love-indonesian-content.ts'));
const expectedIds = Array.from({ length: 100 }, (_, index) => `LOVE-${String(index + 1).padStart(3, '0')}`);
const expectedChapterIds = ['kenalan', 'pdkt', 'jadian', 'manja-kangen', 'cemburu', 'kode-ngambek', 'berantem', 'bujuk-baikan', 'hubungan-serius', 'putus-balikan'];
const canonicalDigest = crypto.createHash('sha256').update(JSON.stringify(loveScenes.map(({ id, indonesian, chinese }) => ({ id, indonesian, chinese })))).digest('hex');
const expectedCanonicalDigest = '88e04527016756074fb5808d369cb187b40cc11e41b447fe1af55854654970e5';

if (canonicalDigest !== expectedCanonicalDigest) failures.push(`Canonical LOVE-001-LOVE-100 digest changed: ${canonicalDigest}`);
if (loveScenes.length !== 100) failures.push(`Expected 100 love scenes, found ${loveScenes.length}`);
if (loveChapters.length !== 10) failures.push(`Expected 10 chapters, found ${loveChapters.length}`);
if (loveScenes.map((scene) => scene.id).join('|') !== expectedIds.join('|')) failures.push('LOVE scene IDs are missing, duplicated, or out of order');
if (loveScenes.map((scene) => scene.order).join('|') !== Array.from({ length: 100 }, (_, index) => index + 1).join('|')) failures.push('LOVE scene order must be exactly 1-100');
if (loveChapters.map((chapter) => chapter.id).join('|') !== expectedChapterIds.join('|')) failures.push('LOVE chapter order changed');

const chinese = /[\u3400-\u9fff]/;
for (const chapter of loveChapters) {
  const scenes = loveScenes.filter((scene) => scene.chapterId === chapter.id);
  if (scenes.length !== 10) failures.push(`${chapter.id} expected 10 scenes, found ${scenes.length}`);
  if (chapter.order < 1 || chapter.order > 10 || !chapter.title || !chapter.chineseTitle || !chapter.description) failures.push(`${chapter.id} chapter metadata is incomplete`);
}

for (const scene of loveScenes) {
  for (const field of ['id', 'order', 'chapterId', 'indonesian', 'chinese', 'explanation', 'usageContext', 'toneLevel', 'ttsText']) {
    if (scene[field] === undefined || scene[field] === '') failures.push(`${scene.id} missing ${field}`);
  }
  if (!chinese.test(scene.chinese) || !chinese.test(scene.explanation) || !chinese.test(scene.usageContext)) failures.push(`${scene.id} is missing Chinese learner-facing content`);
  if (scene.ttsText !== scene.indonesian) failures.push(`${scene.id} TTS text differs from approved Indonesian`);
  if (scene.isFree !== true) failures.push(`${scene.id} is not permanently free`);
  if (!Array.isArray(scene.coreWords) || scene.coreWords.length === 0 || scene.coreWords.some((word) => !word.term || !word.meaning || !chinese.test(word.meaning))) failures.push(`${scene.id} coreWords are incomplete`);
  if (!Array.isArray(scene.exampleDialogue) || scene.exampleDialogue.length < 2 || scene.exampleDialogue.some((line) => !line.indonesian || !line.chinese)) failures.push(`${scene.id} exampleDialogue is incomplete`);
  if (!Array.isArray(scene.followUps) || scene.followUps.length === 0 || scene.followUps.some((line) => !line.indonesian || !line.chinese)) failures.push(`${scene.id} followUps are incomplete`);
  if (!['natural', 'context', 'caution'].includes(scene.toneLevel)) failures.push(`${scene.id} toneLevel is invalid`);
  if (/印尼语短语|placeholder|todo|tbd|this phrase|you can use/i.test(JSON.stringify(scene))) failures.push(`${scene.id} contains placeholder or English fallback`);
}

for (const id of ['LOVE-067', 'LOVE-096', 'LOVE-097']) {
  if (loveScenes.find((scene) => scene.id === id)?.toneLevel !== 'caution') failures.push(`${id} must use caution tone`);
}
const duplicateSerious = loveScenes.filter((scene) => scene.indonesian === 'Kamu serius sama aku?');
if (duplicateSerious.map((scene) => scene.id).join('|') !== 'LOVE-022|LOVE-081') failures.push('Approved LOVE-022 / LOVE-081 contextual duplicate changed');
if (duplicateSerious[0]?.explanation === duplicateSerious[1]?.explanation || duplicateSerious[0]?.usageContext === duplicateSerious[1]?.usageContext) failures.push('LOVE-022 and LOVE-081 need distinct explanation and context');

const serialized = JSON.stringify(loveScenes).toLocaleLowerCase('id-ID');
for (const term of ['pdkt', 'jomblo', 'deket', 'geer', 'baper', 'nyaman', 'pacar', 'pacaran', 'harapan palsu', 'kangen', 'manja', 'nempel', 'sok imut', 'sayang', 'cemburu', 'mantan', 'ngaku', 'kode', 'peka', 'terserah', 'diem', 'ngambek', 'marah', 'cari gara-gara', 'bujuk', 'baikan', 'main-main', 'nikah', 'jangka panjang', 'putus', 'balikan']) {
  if (!serialized.includes(term)) failures.push(`Required teaching term missing: ${term}`);
}
for (const comparison of ['kangen 和 rindu', 'ngambek 多指', 'marah 表示', 'baikan 指', 'balikan 指']) {
  if (!serialized.includes(comparison.toLocaleLowerCase('id-ID'))) failures.push(`Required comparison missing: ${comparison}`);
}

const uiSource = fs.readFileSync(path.join(root, 'components/LoveIndonesianExperience.tsx'), 'utf8');
const homeSource = fs.readFileSync(path.join(root, 'components/V2HomeDashboard.tsx'), 'utf8');
const proxySource = fs.readFileSync(path.join(root, 'proxy.ts'), 'utf8');
const routeSource = fs.readFileSync(path.join(root, 'app/love-indonesian/page.tsx'), 'utf8');
const manifestSource = fs.readFileSync(path.join(root, 'app/manifest.ts'), 'utf8');
if (!uiSource.includes("@/components/IndonesianSpeechButton")) failures.push('LOVE module does not reuse shared IndonesianSpeechButton');
if (uiSource.includes('speechSynthesis') || uiSource.includes('SpeechSynthesisUtterance')) failures.push('LOVE module created a parallel TTS implementation');
if (!uiSource.includes('break-words') || !uiSource.includes('overflow-x-hidden')) failures.push('LOVE module mobile overflow guards are missing');
if (!uiSource.includes('previous') || !uiSource.includes('next') || !uiSource.includes('scene.order - 2') || !uiSource.includes('loveScenes[scene.order]')) failures.push('LOVE previous/next order logic is missing');
if (!homeSource.includes("href: '/love-indonesian'") || !homeSource.includes('永久免费')) failures.push('LOVE free home entry is missing');
if (proxySource.includes("'/love-indonesian")) failures.push('LOVE free route was added to the membership auth matcher');
if (!routeSource.includes('尼会说｜印尼语恋爱大全100句') || !routeSource.includes('100句真实印尼语恋爱口语，永久免费学习。')) failures.push('LOVE metadata is missing');
if (!manifestSource.includes("start_url: '/'") || !manifestSource.includes("display: 'standalone'")) failures.push('PWA manifest baseline changed or is incomplete');

if (failures.length) {
  console.error(`LOVE V1 verification failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('LOVE V1 verification passed');
console.log(`Canonical digest: ${canonicalDigest}`);
console.log('Scenes: 100/100');
console.log('Chapters: 10/10');
console.log('Permanent free access: PASS');
console.log('Shared id-ID TTS architecture: PASS');
console.log('Mobile overflow guards: PASS');
console.log('PWA baseline: PASS');
