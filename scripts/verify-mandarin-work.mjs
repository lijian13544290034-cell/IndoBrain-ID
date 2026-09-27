import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd(); const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const sourcePath = path.join(root, 'lib/mandarin-work-course.ts');
const output = ts.transpileModule(read('lib/mandarin-work-course.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: sourcePath, reportDiagnostics: true });
for (const diagnostic of output.diagnostics ?? []) if (diagnostic.category === ts.DiagnosticCategory.Error) failures.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mandarin-work-'));
fs.writeFileSync(path.join(temporary, 'course.js'), output.outputText);
const course = createRequire(import.meta.url)(path.join(temporary, 'course.js'));
fs.rmSync(temporary, { recursive: true, force: true });

const { mandarinWorkDays, allMandarinWorkItems, MANDARIN_WORK_NAMESPACE, SELF_RESCUE_DAY14, SELF_RESCUE_DAY30 } = course;
const normalize = (value) => value.replace(/[？?。！!，,、…\s]/g, '');
if (MANDARIN_WORK_NAMESPACE !== 'mandarin-work-30d') failures.push('Course namespace changed');
if (mandarinWorkDays.length !== 30 || mandarinWorkDays.some((day, index) => day.day !== index + 1)) failures.push('Day order must be exactly 1-30');
const items = allMandarinWorkItems(); const unique = new Set(items.map((item) => normalize(item.chinese)));
if (unique.size !== 194) failures.push(`Required expression count must be 194, found ${unique.size}`);
for (const item of items) {
  if (!item.id.startsWith(`CN-WORK-D${String(item.day).padStart(2,'0')}-`)) failures.push(`Invalid course item id: ${item.id}`);
  if (!item.favoriteId.startsWith(`${MANDARIN_WORK_NAMESPACE}:`)) failures.push(`Favorite namespace leak: ${item.favoriteId}`);
  if (!item.indonesian) failures.push(`Missing canonical Indonesian: ${item.chinese}`);
  if (!item.audioText || item.audioText !== item.chinese) failures.push(`Invalid audioText: ${item.chinese}`);
  const expectedHanzi = Array.from(normalize(item.chinese)).join('');
  const actualHanzi = item.pinyinSegments.map((segment) => segment.hanzi).join('');
  if (actualHanzi !== expectedHanzi || item.pinyinSegments.some((segment) => !segment.pinyin)) failures.push(`Invalid pinyin alignment: ${item.chinese}`);
  if (!['NEW','REVIEW','COMBINATION'].includes(item.itemType)) failures.push(`Invalid item type: ${item.id}`);
  if (!item.reviewTags.includes(item.itemType.toLowerCase()) || !item.reviewTags.includes('work')) failures.push(`Invalid review tags: ${item.id}`);
  if (item.day <= 14 && item.difficulty !== 1) failures.push(`Invalid difficulty: ${item.id}`);
  if (item.day >= 15 && item.day <= 28 && item.difficulty !== 2) failures.push(`Invalid difficulty: ${item.id}`);
  if (item.day >= 29 && item.difficulty !== 3) failures.push(`Invalid difficulty: ${item.id}`);
}
const hereItem = items.find((item) => normalize(item.chinese) === '这里');
const giveItem = items.find((item) => normalize(item.chinese) === '给');
if (!hereItem?.coreWordIds.includes('CN-CORE-8FD9-91CC') || hereItem.coreWordIds.length !== 1) failures.push('这里 must use one stable lexical core ID');
if (!giveItem?.coreWordIds.includes('CN-CORE-7ED9')) failures.push('给 must use its stable lexical core ID');
for (const day of mandarinWorkDays) {
  const listening = [...day.items, ...day.dialogue.map((turn) => turn.item)].find((item) => item.id === day.listeningItemId);
  if (!listening?.reviewTags.includes('listening')) failures.push(`Day ${day.day} listening item is not tagged`);
}
for (const [text, expected] of [['一个','yí ge'],['快一点','kuài yì diǎn'],['找一下','zhǎo yí xià'],['一起吃饭','yì qǐ chī fàn'],['不对','bú duì'],['不会','bú huì'],['不可以','bù kě yǐ'],['来不及','lái bu jí']]) {
  const actual = course.toPinyinSegments(text).map((segment) => segment.pinyin).join(' ');
  if (actual !== expected) failures.push(`Mandarin sandhi mismatch: ${text} -> ${actual}, expected ${expected}`);
}
const unknown = [SELF_RESCUE_DAY14, SELF_RESCUE_DAY30];
if (unknown[0].chinese !== '你去办公室拿文件。' || unknown[1].chinese !== '你把昨天的销售报表整理一下。') failures.push('Self-rescue unknown input changed');
for (const value of unknown) {
  if (value.type !== 'UNKNOWN_INPUT' || !value.tags.includes('self-rescue') || !value.tags.includes('listening')) failures.push(`Invalid unknown metadata: ${value.chinese}`);
  if (unique.has(normalize(value.chinese)) || items.some((item) => item.coreWordIds.includes(value.chinese))) failures.push(`Unknown input leaked into learned content: ${value.chinese}`);
}

const page = read('app/learn-chinese/page.tsx'); const ui = read('components/MandarinWorkExperience.tsx'); const recorder = read('components/LocalPronunciationRecorder.tsx'); const button = read('components/ChineseSpeechButton.tsx'); const indonesianProvider = read('lib/tts-provider.ts'); const profile = read('lib/mandarin-work-profile.ts');
if (!page.includes('MandarinWorkExperience')) failures.push('/learn-chinese is not wired to Mandarin for Work');
for (const marker of ['30天工作中文','30 Hari Bisa Mandarin untuk Kerja','LocalPronunciationRecorder','SELF_RESCUE_DAY14','SELF_RESCUE_DAY30']) if (!ui.includes(marker)) failures.push(`Missing UI marker: ${marker}`);
for (const marker of ['MediaRecorder','getUserMedia','URL.createObjectURL','URL.revokeObjectURL','getTracks']) if (!recorder.includes(marker)) failures.push(`Local-only recorder missing: ${marker}`);
if (!profile.includes("mandarin-work-30d") && !profile.includes('MANDARIN_WORK_NAMESPACE')) failures.push('Progress profile lacks Mandarin namespace');
if (!button.includes("voice.lang.trim().replace('_', '-').toLowerCase() === 'zh-cn'") || button.includes("lang.startsWith('zh')")) failures.push('Browser fallback is not exact zh-CN');
if (!indonesianProvider.includes('id-ID-GadisNeural')) failures.push('Indonesian TTS changed');

if (failures.length) { console.error('MANDARIN WORK 30D: FAIL'); for (const failure of [...new Set(failures)]) console.error(`- ${failure}`); process.exit(1); }
console.log(`MANDARIN WORK 30D: PASS (30/30 days, ${unique.size}/194 canonical translations, strict zh-CN, isolated profile)`);
