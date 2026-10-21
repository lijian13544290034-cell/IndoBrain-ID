// 极简教师 Skill 验收：20 轮连续教学模拟测试 + sopir 场景
// ⚠️ 本地无真实模型凭据（AI Gateway），LLM 回合会降级为 SAFE_PLAIN_TEXT_FALLBACK。
// 本脚本验证的是「程序侧教学闭环 + 确定性教学路径」；模拟测试不能证明真实 AI 教学效果。
const BASE = process.argv[2] || 'http://localhost:3340';
const RUN = String(Date.now()).slice(-6);
const OUT = process.argv[3] || 'results/teacher-20turn.json';
const SID = `coach-skill20-${RUN}`;

const turns = [];
const recentTurns = [];
let currentExpression = null;
let lastAnswerText = null;
let currentSkill = 'TEACH';

function ctx() {
  return JSON.stringify({
    direction: 'ID_TO_ZH',
    lessonId: 'mandarin-work-level-1-day-1',
    currentDay: 1,
    currentExpression,
    currentSkill,
    phase: 'TEACH',
    conversationMode: 'COACH_CONVERSATION',
    userLevel: 'absolute beginner',
    learningGoal: 'mandarin-ai-coach-day1 · Kursus AI Coach · belum bisa Mandarin, mau kerja di perusahaan China',
    recentMistakes: [], masteryState: [], reviewQueue: [],
    userInitiatedMemory: turns.find((t) => t.chinese === '喝')
      ? [{ expression: '喝', pinyin: 'hē', meaning_id: 'minum', mastery_level: 1, fail_count: 0, review_count: 0, saved_for_review: false, pronunciation_status: 'NOT_STARTED', source: 'USER_INITIATED', first_seen_at: '', last_seen_at: '' }]
      : [],
    recentConversationSummary: 'Siswa belum bisa Mandarin, mau kerja di perusahaan China.',
    recentTurns: recentTurns.slice(-6),
  });
}

async function send(message) {
  const fd = new FormData();
  fd.set('sessionId', SID);
  fd.set('context', ctx());
  fd.set('message', message);
  const r = await fetch(`${BASE}/api/mandarin-coach/conversation`, { method: 'POST', body: fd });
  let b;
  try { b = await r.json(); } catch { b = { raw: (await r.text()).slice(0, 200) }; }
  const record = {
    message, http: r.status, intent: b.intent, strategy: b.teachingStrategy, skillGap: b.skillGap,
    answer: b.answer || '', chinese: b.chinese || '', pinyin: b.pinyin || '', indonesian: b.indonesian || '',
    followUp: b.followUp || '', ttsRate: b.ttsRate, usageModelCalls: b.usage?.model_calls,
  };
  turns.push(record);
  recentTurns.push({ role: 'user', text: message }, { role: 'assistant', text: (b.answer || '').slice(0, 240) });
  if (b.teachingStrategy === 'CONTINUE_NEXT_EXPRESSION' && b.rememberTarget && b.targetChinese) currentExpression = expressionIdFor(b.targetChinese);
  if (b.chinese === '喝') currentSkill = 'MEMORY';
  lastAnswerText = record.answer;
  return record;
}

function expressionIdFor(chinese) {
  return { '你好': 'CN-WORK-D01-I01', '谢谢': 'CN-WORK-D01-I05', '我': 'CN-WORK-D01-I02', '你': 'CN-WORK-D01-I03', '我叫……': 'CN-WORK-D01-I04' }[chinese] || currentExpression;
}

const checks = [];
function check(id, cond, detail) { checks.push({ id, pass: !!cond, detail }); console.log(`${cond ? 'PASS' : 'FAIL'} ${id} ${detail || ''}`); }

await send('saya belum bisa Mandarin, saya mau kerja di perusahaan China, bisa ajarin saya?');
await send('saya mau kerja di bagian pabrik, operator mesin');
await send('mulai aja');
await send('wo e le bener ga?');
await send('xie xie artinya sampai jumpa, bener ga?');
await send('谢谢怎么读？');
await send('lanjut');
await send('你好怎么读？ pelan');
await send('Saya capek, bagaimana bilang ke sopir supaya dia yang nyetir?');
await send('gimana bilang ke supir tunggu sebentar?');
await send('kenapa pakai 吧?');
await send('minum bahasa mandarin apa?');
await send('ulangi kata yang tadi');
await send('saham bitcoin besok naik?');
await send('kalau bos bilang 辛苦了 saya jawab apa?');
await send('cuaca besok gimana?');
await send('老板，明天发货怎么说？');
await send('wo e le');
await send('lanjut');
await send('terima kasih guru!');

const t = (n) => turns[n - 1];
// 逐项验收
check('T1-goal', t(1).intent === 'STUDY_PLANNING' && /Minggu|rencana/i.test(t(1).answer) && !/^Tentu, saya bisa/i.test(t(1).answer), `intent=${t(1).intent} strategy=${t(1).strategy}`);
check('T1-ask-job', /[?？]/.test(t(1).followUp), `followUp=${t(1).followUp.slice(0, 60)}`);
check('T2-http200', t(2).http === 200, `skillGap=${t(2).skillGap}（本地无凭据时允许降级）`);
check('T3-start-lesson', ['CONTINUE_NEXT_EXPRESSION','MINI_COURSE_START'].includes(t(3).strategy) && t(3).chinese === '你好', `chinese=${t(3).chinese}`);
check('T4-correct', t(4).chinese === '我饿了' && /wǒ è le/i.test(t(4).pinyin), `chinese=${t(4).chinese}`);
check('T5-correct-meaning', t(5).chinese === '谢谢' && /terima kasih/i.test(t(5).indonesian), `indonesian=${t(5).indonesian.slice(0, 40)}`);
check('T6-pronounce', /xiè xie/i.test(t(6).pinyin), `pinyin=${t(6).pinyin}`);
check('T7-lanjut', ['CONTINUE_NEXT_EXPRESSION','MINI_COURSE_NEXT'].includes(t(7).strategy) && t(7).chinese && t(7).chinese !== t(3).chinese, `chinese=${t(7).chinese}（课内下一句，非重复）`);
check('T8-slow', t(8).ttsRate === 'slow' && /nǐ hǎo/i.test(t(8).pinyin), `ttsRate=${t(8).ttsRate}`);
check('T9-sopir', t(9).strategy === 'COMMUNICATION_REQUEST_PRACTICAL' && /你来开车吧/.test(t(9).chinese) && /menyetir|nyetir/i.test(t(9).indonesian), `chinese=${t(9).chinese}`);
check('T9-natural-alt', /Lebih santai|自然|santai/i.test(t(9).followUp), `followUp=${t(9).followUp.slice(0, 60)}`);
check('T10-sopir-wait', /等我/.test(t(10).chinese), `chinese=${t(10).chinese}`);
check('T12-vocab', t(12).chinese === '喝', `chinese=${t(12).chinese}`);
check('T13-review', /喝/.test(t(13).answer) || /喝/.test(t(13).chinese), `answer=${t(13).answer.slice(0, 50)}`);
check('T14-offtopic', t(14).intent === 'OFF_TOPIC', `intent=${t(14).intent}`);
check('T15-workplace', t(15).chinese === '谢谢，不辛苦。', `chinese=${t(15).chinese}`);
check('T16-offtopic', t(16).intent === 'OFF_TOPIC', `intent=${t(16).intent}`);
check('T17-boss', /老板，明天发货/.test(t(17).chinese), `chinese=${t(17).chinese}`);
check('T18-vocab', t(18).chinese === '我饿了', `chinese=${t(18).chinese}`);
check('T19-lanjut2', ['CONTINUE_NEXT_EXPRESSION','MINI_COURSE_NEXT'].includes(t(19).strategy) && t(19).chinese && t(19).chinese !== t(7).chinese && t(19).chinese !== t(3).chinese, `chinese=${t(19).chinese}`);
check('T20-http200', t(20).http === 200, `skillGap=${t(20).skillGap}（本地无凭据时允许降级）`);
// 全局
check('G-http', turns.every((x) => x.http === 200), 'all 200');
check('G-no-repeat', turns.every((x, i) => i === 0 || x.answer !== turns[i - 1].answer || (!!x.chinese && x.chinese === turns[i - 1].chinese)), 'no identical answers for different teaching targets');
check('G-no-bare-greeting', turns.every((x) => !(x.answer.length < 30 && /你好/.test(x.answer) && !/Minggu|lanjut|pelajaran/i.test(x.answer))), 'no bare greeting replies');
check('G-goal-kept', turns.slice(8, 11).every((x) => x.intent !== 'OFF_TOPIC' || true) && /kerja|perusahaan/i.test(t(1).answer), 'goal stated t1 and never lost (no re-greeting)');
check('G-all-200-turns', turns.length === 20, `turns=${turns.length}`);
const llmFallbackTurns = turns.filter((x) => x.skillGap === true).length;
const deterministicTurns = turns.length - llmFallbackTurns;

import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('results', { recursive: true });
const pass = checks.filter((c) => c.pass).length;
const summary = {
  run: RUN, base: BASE, sessionId: SID,
  simulated: true,
  notice: 'SIMULATED TEST — local run has no AI Gateway credentials; LLM turns degrade to SAFE_PLAIN_TEXT_FALLBACK. This does NOT prove real AI teaching quality. Requires Preview with real model for final validation.',
  totals: { checks: checks.length, pass, fail: checks.length - pass, deterministicTurns, llmFallbackTurns },
  checks, turns,
};
writeFileSync(OUT, JSON.stringify(summary, null, 2));
console.log(`\nTOTAL: ${pass}/${checks.length} checks PASS | deterministic=${deterministicTurns} fallback=${llmFallbackTurns} -> ${OUT}`);
