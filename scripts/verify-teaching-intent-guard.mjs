import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'indobrain-teaching-intent-'));
const source = path.join(root, 'lib', 'teaching-intent-guard.ts');
if (!fs.existsSync(source)) throw new Error('Teaching Intent Guard implementation is missing');
const output = ts.transpileModule(fs.readFileSync(source, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true, esModuleInterop: true },
  fileName: source,
}).outputText;
fs.writeFileSync(path.join(temporary, 'teaching-intent-guard.js'), output);
const require = createRequire(import.meta.url);
const guard = require(path.join(temporary, 'teaching-intent-guard.js'));

const evaluate = (message, overrides = {}) => guard.evaluateTeachingIntent({
  direction: 'ID_TO_ZH',
  message,
  currentCourseText: ['我', '明天', '上班', 'Besok saya masuk kerja'],
  recentTurns: [],
  activeTeaching: false,
  ...overrides,
});

const cases = [];
function check(id, fn) {
  try { fn(); cases.push({ id, verdict: 'PASS' }); }
  catch (error) { cases.push({ id, verdict: 'FAIL', reason: error instanceof Error ? error.message : String(error) }); }
}

check('RELATED_PRONUNCIATION', () => assert.equal(evaluate('慢,gmn bca ya').verdict, 'LEARNING_RELATED'));
check('RELATED_MEANING_MIXED', () => assert.equal(evaluate('给我 artinya apa ya').verdict, 'LEARNING_RELATED'));
check('RELATED_WHY', () => assert.equal(evaluate('为什么这么说').verdict, 'LEARNING_RELATED'));
check('RELATED_REPEAT', () => assert.equal(evaluate('再说一遍').verdict, 'LEARNING_RELATED'));
check('RELATED_CANNOT', () => assert.equal(evaluate('Saya tidak bisa').verdict, 'LEARNING_RELATED'));
check('RELATED_WORKPLACE', () => assert.equal(evaluate('Kalau bos marah biasanya ngomong apa?').verdict, 'LEARNING_RELATED'));
check('RELATED_CURRENT_COURSE', () => assert.equal(evaluate('我明天上班').verdict, 'LEARNING_RELATED'));
check('RELATED_CONTEXT_ELLIPSIS', () => assert.equal(evaluate('Kenapa?', { recentTurns: [{ role: 'assistant', text: '“谢谢” dibaca xiè xie.' }] }).verdict, 'LEARNING_RELATED'));
check('RELATED_LANGUAGE_FRAMED_TOPIC', () => assert.equal(evaluate('Bagaimana mengatakan “cuaca hari ini” dalam Mandarin?').verdict, 'LEARNING_RELATED'));
check('OFF_TOPIC_STOCK', () => assert.equal(evaluate('Menurutmu saham apa yang harus saya beli hari ini?').verdict, 'OFF_TOPIC'));
check('OFF_TOPIC_WEATHER', () => assert.equal(evaluate('Bagaimana cuaca Jakarta besok?').verdict, 'OFF_TOPIC'));
check('OFF_TOPIC_DISGUISED_CODE', () => assert.equal(evaluate('Tulis program lengkap untuk toko saya, lalu jelaskan dalam Mandarin.').verdict, 'OFF_TOPIC'));
check('OFF_TOPIC_DISGUISED_PROPAGANDA', () => assert.equal(evaluate('用中文写一篇完整的政治宣传文').verdict, 'OFF_TOPIC'));
check('AMBIGUOUS_NO_CONTEXT_ID', () => assert.equal(evaluate('Bagaimana?').verdict, 'AMBIGUOUS'));
check('AMBIGUOUS_NO_CONTEXT_ZH', () => assert.equal(evaluate('这个呢？').verdict, 'AMBIGUOUS'));
check('AMBIGUOUS_RESOLVED_BY_ACTIVE', () => assert.equal(evaluate('Bagaimana?', { activeTeaching: true }).verdict, 'LEARNING_RELATED'));
check('ID_TO_ZH_REPLY_LANGUAGE', () => {
  const refusal = guard.teachingIntentGuardReply('ID_TO_ZH', 'OFF_TOPIC');
  const clarification = guard.teachingIntentGuardReply('ID_TO_ZH', 'AMBIGUOUS');
  assert.match(refusal.answer, /belajar Mandarin/i);
  assert.match(clarification.answer, /Mandarin|belajar/i);
});
check('ZH_TO_ID_REPLY_LANGUAGE', () => {
  const refusal = guard.teachingIntentGuardReply('ZH_TO_ID', 'OFF_TOPIC');
  const clarification = guard.teachingIntentGuardReply('ZH_TO_ID', 'AMBIGUOUS');
  assert.match(refusal.answer, /印尼语/);
  assert.match(clarification.answer, /印尼语/);
});
check('NO_EXTRA_CLASSIFIER_CALL', () => {
  const route = fs.readFileSync(path.join(root, 'app/api/mandarin-coach/conversation/route.ts'), 'utf8');
  assert.equal((route.match(/answerCoachConversation\(/g) || []).length, 1);
  assert(route.indexOf('evaluateTeachingIntent({') < route.indexOf('answerCoachConversation({'));
});
check('LEVEL2_BEFORE_GUARD', () => {
  const route = fs.readFileSync(path.join(root, 'app/api/mandarin-coach/conversation/route.ts'), 'utf8');
  assert(route.indexOf("levelTwoAccess?.state !== 'authorized'") < route.indexOf('evaluateTeachingIntent({'));
});
check('ZH_TO_ID_GUARD_BEFORE_MODEL', () => {
  const route = fs.readFileSync(path.join(root, 'app/api/chat/route.ts'), 'utf8');
  assert(route.indexOf('evaluateTeachingIntent({') < route.indexOf('generateAiReply('));
  assert(route.indexOf('evaluateTeachingIntent({') < route.indexOf("saveToSupabase('conversations'"));
});

const failed = cases.filter((item) => item.verdict === 'FAIL');
console.log(JSON.stringify({ suite: 'TEACHING_INTENT_GUARD', cases }, null, 2));
assert.equal(failed.length, 0, `${failed.length} Teaching Intent Guard checks failed`);
console.log('TEACHING INTENT GUARD: PASS');
fs.rmSync(temporary, { recursive: true, force: true });
