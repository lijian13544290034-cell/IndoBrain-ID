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

function stripPunctuation(text) {
  return text.replace(/[？?。！!，,、\s]/g, '');
}

function hasHanzi(text) {
  return /[\u3400-\u9FFF]/.test(text);
}

function hasToneMark(text) {
  return /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/i.test(text);
}

function section(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start < 0) return '';
  const next = source.indexOf(`function `, start + 9);
  return source.slice(start, next < 0 ? source.length : next);
}

const {
  chineseVisualObjects,
  chineseQuantityExpressions,
  chineseGoldenLessonJumlah,
  chineseTtsVoice,
} = compileChineseLearning();

const expectedStates = ['entry', 'paham', 'dengar', 'lihat', 'ucapkan', 'temukan', 'pakai', 'aku-bisa', 'completion'];
const lesson = chineseGoldenLessonJumlah;

if (lesson.route !== '/learn-chinese') failures.push('Chinese lesson route must be /learn-chinese');
if (lesson.id !== 'jumlah-01') failures.push('Lesson id must be jumlah-01');
if (lesson.titleId !== 'Jumlah') failures.push('Lesson title must be Jumlah');
if (lesson.subtitleId !== 'Belajar menyebut jumlah benda dalam Mandarin') failures.push('Lesson subtitle changed');
if (chineseTtsVoice !== 'zh-CN-XiaoxiaoNeural') failures.push(`Chinese TTS voice must be zh-CN-XiaoxiaoNeural, found ${chineseTtsVoice}`);
if (JSON.stringify(lesson.steps.map((item) => item.id)) !== JSON.stringify(expectedStates)) failures.push('Lesson state flow must match ENTRY → PAHAM → DENGAR → LIHAT → UCAPKAN → TEMUKAN → PAKAI → AKU BISA → COMPLETION');

uniqueBy(chineseVisualObjects, (item) => item.id, 'Chinese visual object id');
uniqueBy(chineseQuantityExpressions, (item) => item.id, 'Chinese quantity expression id');

const apple = chineseVisualObjects.find((item) => item.id === 'apple');
if (!apple || apple.renderer !== 'css-apple') failures.push('Visual Library V1 must provide css apple object');
if (JSON.stringify(apple?.supportedVariables.quantity) !== JSON.stringify([1, 2, 3])) failures.push('Apple visual must support quantity states 1, 2, 3');

const expectedExpressions = [
  { id: 'one-apple', quantity: 1, hanzi: '一个苹果', indonesian: 'satu apel' },
  { id: 'two-apples', quantity: 2, hanzi: '两个苹果', indonesian: 'dua apel' },
  { id: 'three-apples', quantity: 3, hanzi: '三个苹果', indonesian: 'tiga apel' },
];

for (const expected of expectedExpressions) {
  const expression = chineseQuantityExpressions.find((item) => item.id === expected.id);
  if (!expression) {
    failures.push(`Missing target expression: ${expected.id}`);
    continue;
  }
  if (expression.quantity !== expected.quantity) failures.push(`${expected.id} quantity changed`);
  if (expression.hanzi !== expected.hanzi) failures.push(`${expected.id} Hanzi must be ${expected.hanzi}`);
  if (expression.indonesian !== expected.indonesian) failures.push(`${expected.id} Indonesian support changed`);
  if (expression.ttsText !== expected.hanzi) failures.push(`${expected.id} TTS input must be current Hanzi expression`);
  if (!hasHanzi(expression.ttsText)) failures.push(`${expected.id} TTS input must contain Hanzi`);
  if (expression.ttsText === expression.pinyin) failures.push(`${expected.id} must not use pinyin as TTS input`);
  if (expression.visual.objectId !== 'apple' || expression.visual.quantity !== expected.quantity) failures.push(`${expected.id} visual state mismatch`);
  const tokenHanzi = stripPunctuation(expression.pinyinTokens.map((token) => token.hanzi).join(''));
  if (tokenHanzi !== stripPunctuation(expression.hanzi)) failures.push(`${expected.id} Hanzi/Pinyin token alignment mismatch`);
  for (const token of expression.pinyinTokens) {
    if (!hasHanzi(token.hanzi)) failures.push(`${expected.id} token missing Hanzi`);
    if (!/^[a-z]+$/i.test(token.base)) failures.push(`${expected.id} token base must be plain Latin syllable`);
    if (![1, 2, 3, 4, 'neutral'].includes(token.tone)) failures.push(`${expected.id} token has invalid tone`);
    if (token.tone !== 'neutral' && !hasToneMark(token.display)) failures.push(`${expected.id} token display must use tone marks`);
    if (!token.wordBlock.includes(token.hanzi)) failures.push(`${expected.id} token wordBlock must include its Hanzi`);
  }
}

if (lesson.focusExpressionId !== 'two-apples') failures.push('Focus expression must be two-apples');
if (lesson.temukan.missingQuantity !== 2) failures.push('Temukan missing quantity must be 2');
if (lesson.temukan.questionId !== 'Yang mana untuk dua apel?') failures.push('Temukan question must clearly target two apples');
if (lesson.temukan.correctFeedbackId !== 'Bagus!') failures.push('Temukan correct feedback must be Bagus!');
if (lesson.temukan.firstWrongFeedbackId !== 'Coba lagi') failures.push('Wrong answer feedback must be Coba lagi');
if (lesson.temukan.options.filter((item) => item.correct).length !== 1) failures.push('Temukan must have one correct answer');
if (lesson.temukan.options.find((item) => item.correct)?.hanzi !== '两个苹果') failures.push('Temukan correct answer must be 两个苹果');

const pakai = lesson.pakai;
const expectedPakai = [
  [pakai.question, '你要几个？', '你要几个', 'Kamu mau berapa?'],
  [pakai.answer, '两个。', '两个', 'Dua.'],
  [pakai.response, '给你。', '给你', 'Ini untukmu.'],
];
for (const [line, hanzi, ttsText, indonesian] of expectedPakai) {
  if (line.hanzi !== hanzi) failures.push(`Pakai line must be ${hanzi}`);
  if (line.ttsText !== ttsText) failures.push(`Pakai TTS input must be Hanzi without punctuation: ${ttsText}`);
  if (line.indonesian !== indonesian) failures.push(`Pakai Indonesian support must be ${indonesian}`);
  if (!hasHanzi(line.ttsText)) failures.push(`Pakai TTS input must contain Hanzi: ${hanzi}`);
  if (stripPunctuation(line.pinyinTokens.map((token) => token.hanzi).join('')) !== stripPunctuation(line.hanzi)) failures.push(`Pakai Pinyin alignment mismatch: ${hanzi}`);
}

if (lesson.akuBisa.visualToHanzi.quantity !== 3) failures.push('Aku Bisa visual → Hanzi test must use 3 apples');
if (lesson.akuBisa.visualToHanzi.options.find((item) => item.correct)?.hanzi !== '三个苹果') failures.push('Aku Bisa visual → Hanzi correct answer must be 三个苹果');
if (lesson.akuBisa.soundToMeaning.expressionId !== 'two-apples') failures.push('Aku Bisa sound → meaning test must use two-apples');

const page = read('app/learn-chinese/page.tsx');
const component = read('components/ChineseLearningExperience.tsx');
const button = read('components/ChineseSpeechButton.tsx');
const route = read('app/api/chinese-tts/route.ts');
const chineseProvider = read('lib/chinese-tts-provider.ts');
const indonesianRoute = read('app/api/tts/route.ts');
const indonesianProvider = read('lib/tts-provider.ts');
const applicationFrame = read('components/ApplicationFrame.tsx');

if (!page.includes('ChineseLearningExperience')) failures.push('/learn-chinese route is not wired to ChineseLearningExperience');
if (page.includes('searchParams') || page.includes('groupId')) failures.push('/learn-chinese must not keep old group-query demo flow');
if (!component.includes("'use client'")) failures.push('Chinese golden template must be an interactive client lesson');
for (const state of ['EntryState', 'PahamState', 'DengarState', 'LihatState', 'UcapkanState', 'TemukanState', 'PakaiState', 'AkuBisaState', 'CompletionState']) {
  if (!component.includes(`function ${state}`)) failures.push(`Missing UI state: ${state}`);
}
if (section(component, 'DengarState').includes('PinyinAlignment') || section(component, 'DengarState').includes('expression.hanzi') || section(component, 'DengarState').includes('expression.indonesian')) failures.push('Dengar must hide Hanzi, Pinyin, and Indonesian support');
if (!section(component, 'LihatState').includes('ExpressionFocus')) failures.push('Lihat must show Hanzi + Pinyin alignment + Indonesian support');
if (!section(component, 'UcapkanState').includes('Sekarang coba ucapkan')) failures.push('Ucapkan must ask the child to imitate');
if (!section(component, 'TemukanState').includes('Coba lagi') && !component.includes('firstWrongFeedbackId')) failures.push('Temukan must use gentle retry feedback');
if (!section(component, 'PakaiState').includes('lesson.pakai.question') || !section(component, 'PakaiState').includes('lesson.pakai.answer') || !section(component, 'PakaiState').includes('lesson.pakai.response')) failures.push('Pakai must use exact approved dialogue data');
if (section(component, 'AkuBisaState').includes('PinyinAlignment') || section(component, 'AkuBisaState').includes('.indonesian')) failures.push('Aku Bisa tests must not show Pinyin or Indonesian target translation');
if (!section(component, 'CompletionState').includes('3 ungkapan Mandarin sudah kamu kuasai')) failures.push('Completion screen must show calm learning result');
if (/Chinese Learning Template V1|马上会用|下一组|首页|收藏|我的|场景/.test(component)) failures.push('Chinese learning UI must not use Chinese interface labels or old demo labels');
if (!component.includes('Kembali') || !component.includes('Mulai') || !component.includes('Dengarkan') || !component.includes('Lanjut') || !component.includes('Ulangi')) failures.push('Chinese learning UI labels must be Bahasa Indonesia');
if (!button.includes("fetch('/api/chinese-tts'")) failures.push('ChineseSpeechButton must use /api/chinese-tts');
if (!button.includes("utterance.lang = voice.lang || 'zh-CN'")) failures.push('Chinese browser fallback must use Chinese voice/lang');
if (!button.includes('Chinese browser voice is not available')) failures.push('Chinese fallback must fail closed without Chinese voice');
if (!route.includes('getChineseTtsProvider')) failures.push('/api/chinese-tts is not wired to Chinese provider');
if (!route.includes('Only Chinese text is accepted')) failures.push('/api/chinese-tts must reject non-Chinese text');
if (!route.includes('X-IndoBrain-Chinese-TTS-Voice')) failures.push('/api/chinese-tts must return Chinese voice header');
if (!chineseProvider.includes('process.env.AZURE_SPEECH_KEY')) failures.push('Chinese TTS must reuse existing AZURE_SPEECH_KEY');
if (!chineseProvider.includes('process.env.AZURE_SPEECH_REGION')) failures.push('Chinese TTS must reuse existing AZURE_SPEECH_REGION');
if (/CHINESE_AZURE_SPEECH_KEY|CHINESE_AZURE_SPEECH_REGION/.test(chineseProvider + route + button)) failures.push('Chinese TTS must not introduce separate CHINESE_AZURE_* credentials');
if (!chineseProvider.includes('chineseTtsVoice')) failures.push('Chinese voice must be isolated behind a Chinese TTS voice constant');
if (!indonesianRoute.includes('Only Indonesian text is accepted')) failures.push('Existing Indonesian /api/tts guard was changed');
if (!indonesianProvider.includes('id-ID-GadisNeural')) failures.push('Existing Indonesian TTS voice was changed');
if (!applicationFrame.includes("pathname?.startsWith('/learn-chinese')")) failures.push('/learn-chinese must hide the global bottom navigation');

if (failures.length) {
  console.error('CHINESE GOLDEN TEMPLATE 01: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('CHINESE GOLDEN TEMPLATE 01: PASS (Jumlah, 3 target expressions, 9 lesson states, Chinese TTS shared Azure config)');
