import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const data = read('lib/server/mandarin-work-level2.ts');
const catalog = read('lib/mandarin-work-level2-catalog.ts');
const access = read('lib/server/mandarin-work-level2-access.ts');
const catalogPage = read('app/learn-chinese/level-2/page.tsx');
const dayPage = read('app/learn-chinese/level-2/[day]/page.tsx');
const ui = read('components/MandarinWorkLevel2Experience.tsx');
const previewQa = read('lib/account/preview-qa.ts');
const provider = read('lib/chinese-tts-provider.ts');
const speech = read('components/ChineseSpeechButton.tsx');
const sitemap = read('app/sitemap.ts');
const robots = read('app/robots.ts');

const executableSource = data.replace("import 'server-only';", '');
const executable = ts.transpileModule(executableSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const runtimeModule = { exports: {} };
new Function('exports', 'module', 'require', executable)(runtimeModule.exports, runtimeModule, () => ({}));
const runtimeDays = runtimeModule.exports.mandarinWorkLevel2Days;

const days = [...data.matchAll(/\bday\((\d+),/g)].map((match) => Number(match[1]));
if (days.length !== 30 || days.some((value, index) => value !== index + 31)) failures.push(`Level 2 day order is invalid: ${days.join(',')}`);
const catalogDays = [...catalog.matchAll(/\[(\d+),\s*'/g)].map((match) => Number(match[1]));
if (catalogDays.length !== 30 || catalogDays.some((value, index) => value !== index + 31)) failures.push('Public catalog must contain Day 31-60 exactly once');
if (days.filter((value) => value >= 51).length !== 10) failures.push('Construction module must contain exactly 10 days');
if (!data.startsWith("import 'server-only';")) failures.push('Paid curriculum is not server-only');
for (const marker of ["day(40", "day(50", "classification: 'UNKNOWN_INPUT'", "mode: 'SELF_RESCUE'", 'unknownInput: level2UnknownInputs[40]', 'unknownInput: level2UnknownInputs[50]']) if (!data.includes(marker)) failures.push(`Missing self-rescue unknown-input marker: ${marker}`);
const unknownInputs = ['你先把这个放到仓库，等一下再回来。', '这个数量跟昨天的不一样，你再确认一下。'];
for (const text of unknownInputs) {
  if (data.split(text).length !== 2) failures.push(`UNKNOWN_INPUT must occur exactly once: ${text}`);
  if (data.match(new RegExp(`item\\([^\\n]*${text}`, 'u'))) failures.push(`UNKNOWN_INPUT leaked into learned items: ${text}`);
}
const hasToneMarkedPinyin = (value) => typeof value === 'string' && value.trim().length > 0 && /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/u.test(value);
let visibleChineseAudited = 0;
let itemEntries = 0;
let recognitionEntries = 0;
let dialogueEntries = 0;
for (const lesson of runtimeDays) {
  visibleChineseAudited += 1;
  if (!hasToneMarkedPinyin(lesson.titlePinyin)) failures.push(`Day ${lesson.day} title is missing tone-marked pinyin`);
  for (const item of lesson.items) {
    visibleChineseAudited += 1;
    itemEntries += 1;
    if (!hasToneMarkedPinyin(item.pinyin)) failures.push(`Day ${lesson.day} item is missing tone-marked pinyin: ${item.chinese}`);
  }
  for (const phrase of lesson.recognition) {
    visibleChineseAudited += 1;
    recognitionEntries += 1;
    if (!hasToneMarkedPinyin(phrase.pinyin)) failures.push(`Day ${lesson.day} recognition phrase is missing tone-marked pinyin: ${phrase.chinese}`);
  }
  for (const turn of lesson.dialogue) {
    visibleChineseAudited += 2;
    dialogueEntries += 1;
    if (!hasToneMarkedPinyin(turn.rolePinyin)) failures.push(`Day ${lesson.day} dialogue role is missing tone-marked pinyin: ${turn.role}`);
    if (!hasToneMarkedPinyin(turn.pinyin)) failures.push(`Day ${lesson.day} dialogue is missing tone-marked pinyin: ${turn.chinese}`);
  }
  if (lesson.unknownInput && 'pinyin' in lesson.unknownInput) failures.push(`Day ${lesson.day} UNKNOWN_INPUT must not expose pinyin`);
}
const unknownBlock = data.match(/const level2UnknownInputs:[\s\S]*?\n};/)?.[0] ?? '';
for (const forbidden of ['id:', 'pinyin:', 'indonesian:', 'coreWordIds', 'favorite', 'review']) if (unknownBlock.includes(forbidden)) failures.push(`UNKNOWN_INPUT contains learned-content field: ${forbidden}`);
for (const marker of ['mandarin.level2.access', 'hasMembershipPermission', "roles as string[]", 'verifyPreviewQaSession']) if (!(access + catalog).includes(marker)) failures.push(`Missing server entitlement marker: ${marker}`);
if (catalogPage.includes('mandarin-work-level2.ts') || catalogPage.includes('getMandarinWorkLevel2Day')) failures.push('Public catalog imports paid curriculum');
for (const marker of ['getMandarinLevel2Access', "redirect(`/login?next=/learn-chinese/level-2/", 'getMandarinWorkLevel2Day']) if (!dayPage.includes(marker)) failures.push(`Protected day route missing: ${marker}`);
for (const marker of ['ChineseSpeechButton', 'LocalPronunciationRecorder', 'toggleMandarinFavorite', 'completeMandarinDay', 'MandarinWorkFeedback', 'text-[15px]', 'font-semibold', 'lesson.titlePinyin', 'phrase.pinyin', 'turn.pinyin', 'turn.rolePinyin', 'lesson.unknownInput', 'Tidak perlu menebak artinya', 'Dengarkan UNKNOWN_INPUT']) if (!ui.includes(marker)) failures.push(`Level 2 UI missing: ${marker}`);
for (const contract of [
  '>{lesson.title}</h1>\n        <PhrasePinyin pinyin={lesson.titlePinyin}/>',
  '>{phrase.chinese}</p><PhrasePinyin pinyin={phrase.pinyin}/><div className="mt-2"><ChineseSpeechButton text={phrase.chinese}',
  '>{turn.chinese}</p><PhrasePinyin pinyin={turn.pinyin}/><div className="mt-2"><ChineseSpeechButton text={turn.chinese}',
]) if (!ui.includes(contract)) failures.push(`Visible Chinese/pinyin renderer contract missing: ${contract}`);
if (!ui.includes('现场听到安全类中文时：先执行安全指令，再处理语言理解。</p><p className="text-[15px] font-semibold')) failures.push('Safety guidance pinyin is not rendered directly below Chinese');
if (!provider.includes('zh-CN-XiaoxiaoNeural') || !provider.includes("chineseTtsRate = '-15%'")) failures.push('Mandarin Azure voice/rate changed');
if (!speech.includes("voice.lang.trim().replace('_', '-').toLowerCase() === 'zh-cn'") || speech.includes("lang.startsWith('zh')")) failures.push('Browser fallback is not exact zh-CN');
if (!previewQa.includes("process.env.VERCEL_ENV === 'preview'") || !previewQa.includes("process.env.ENABLE_PREVIEW_QA === 'true'")) failures.push('Preview QA is not fail-closed outside Preview');
for (const marker of ['MANDARIN_WORK_GEO_SLUGS']) if (!sitemap.includes(marker) || !robots.includes(marker)) failures.push('Mandarin GEO pages missing from sitemap/robots');
const geoRoutes = ['mandarin-untuk-kerja-di-indonesia','mandarin-untuk-proyek-konstruksi','mandarin-yang-sering-digunakan-bos-tiongkok','cara-memahami-instruksi-bos-tiongkok','kosakata-mandarin-untuk-pekerja-konstruksi'];
for (const slug of geoRoutes) if (!fs.existsSync(path.join(root, 'app/(geo)', slug, 'page.tsx'))) failures.push(`Missing GEO route: ${slug}`);

if (failures.length) { console.error('MANDARIN WORK LEVEL 2: FAIL'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`MANDARIN WORK LEVEL 2: PASS (${visibleChineseAudited} learner-visible Chinese entries audited: ${itemEntries} items, 30 titles, ${recognitionEntries} listening variants, ${dialogueEntries} dialogue lines + roles; all non-UNKNOWN_INPUT entries render tone-marked pinyin)`);
