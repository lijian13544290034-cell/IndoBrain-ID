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

const { youthChatCategory, youthChatScenes } = require(path.join(root, 'lib/youth-chat-content.ts'));
const adapter = require(path.join(root, 'lib/quick-experience-adapter.ts'));
const navigation = require(path.join(root, 'lib/historical-micro-navigation.ts'));
const sessionSource = fs.readFileSync(path.join(root, 'components/MicroSceneLearningSession.tsx'), 'utf8');
const expectedIds = Array.from({ length: 50 }, (_, index) => `Y${String(index + 1).padStart(2, '0')}`);
const ids = youthChatScenes.map((scene) => scene.id);
const digest = crypto.createHash('sha256').update(JSON.stringify(youthChatScenes)).digest('hex');

if (digest !== '2dd66b6336514f4253dc6965bb21286b4aa5550a8a700c571bc5977586f37532') failures.push(`Human-approved package digest changed: ${digest}`);
if (youthChatScenes.length !== 50) failures.push(`Expected 50 scenes, found ${youthChatScenes.length}`);
if (ids.join('|') !== expectedIds.join('|')) failures.push(`Expected continuous Y01-Y50 IDs, found ${ids.join(', ')}`);
if (new Set(ids).size !== 50) failures.push('Y01-Y50 contains duplicate IDs');
if (youthChatCategory.title !== '年轻人都在怎么聊') failures.push('Approved category title changed');
if (youthChatCategory.subtitle !== '听懂印尼年轻人的聊天、网络热词、暧昧、互损，以及那些课本很少告诉你的真实表达。') failures.push('Approved category subtitle changed');

const chineseText = /[\u3400-\u9fff]/;
const placeholder = /印尼语短语|placeholder|todo|tbd/i;
const englishFallback = /\b(?:Safer than|Strong flirting|The learning goal|More direct|can carry|is common|means that)\b/i;
for (const scene of youthChatScenes) {
  for (const field of ['task', 'indonesian', 'ttsText', 'chinese', 'explanation', 'risk']) {
    if (!scene[field]?.trim()) failures.push(`${scene.id} missing ${field}`);
  }
  if (!chineseText.test(scene.chinese) || !chineseText.test(scene.explanation)) failures.push(`${scene.id} missing Chinese learner-facing content`);
  if (placeholder.test(JSON.stringify(scene))) failures.push(`${scene.id} contains a placeholder`);
  if (englishFallback.test(scene.explanation)) failures.push(`${scene.id} contains English teaching fallback`);
  if (!Array.isArray(scene.vocabulary) || scene.vocabulary.length === 0) failures.push(`${scene.id} missing Kata Penting`);
  if (scene.vocabulary.some((entry) => !entry.term?.trim())) failures.push(`${scene.id} contains an empty vocabulary term`);
  if (!/^(🟢|🟡|🔴)/u.test(scene.risk)) failures.push(`${scene.id} missing approved risk level`);
  if (chineseText.test(scene.ttsText)) failures.push(`${scene.id} sends Chinese labels to Indonesian TTS`);
  if ([scene.chinese, scene.explanation].some((block) => scene.learningTip && block.trim() === scene.learningTip.trim())) failures.push(`${scene.id} duplicates its learning tip`);
}

const expectedTips = ['Y11', 'Y20', 'Y48', 'Y50'];
const actualTips = youthChatScenes.filter((scene) => scene.learningTip).map((scene) => scene.id);
if (actualTips.join('|') !== expectedTips.join('|')) failures.push(`Learning Tips changed: ${actualTips.join(', ')}`);

const adapted = adapter.getHistoricalQuickExperiences().filter((scene) => scene.source === 'youth');
if (adapted.length !== 50 || adapted.some((scene) => !scene.teachingContract)) failures.push('Y01-Y50 are not integrated through the canonical teaching contract');
const group = navigation.getLifeMicroGroups().find((item) => item.slug === youthChatCategory.slug);
const rendered = navigation.getHistoricalMicroItems('life', youthChatCategory.slug);
if (group?.count !== 50 || rendered.length !== 50) failures.push(`Young People Chat category is not reachable as exactly 50 scenes: ${group?.count}/${rendered.length}`);
if (new Set(rendered.map((scene) => scene.sourceId)).size !== 50) failures.push('Young People Chat category would render duplicate scenes');
if (!sessionSource.includes('current.risk') || !sessionSource.includes('current.vocabulary') || !sessionSource.includes('current.ttsText')) failures.push('Risk, canonical vocabulary, or Indonesian TTS rendering is missing');

if (failures.length) {
  console.error('YOUTH CHAT VERIFY: FAIL');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('YOUTH CHAT VERIFY: PASS');
console.log('Y01-Y50: 50/50 continuous and unique');
console.log('Human-approved package digest: LOCKED');
console.log('Teaching contract: PASS');
console.log('Placeholders: 0');
console.log('English teaching fallback: 0');
console.log('Duplicate rendering: 0');
console.log('Risk levels: PASS');
console.log('Indonesian TTS text: PASS');
