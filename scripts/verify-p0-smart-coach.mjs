// P0 修复验收探针：两个真实 FAIL 案例 + 回归
const BASE = process.argv[2] || 'http://localhost:3340';
const RUN = String(Date.now()).slice(-6);
const OUT = process.argv[3] || 'results/p0-fix-verify.json';

function ctx(extra = {}) {
  return JSON.stringify({
    direction: 'ID_TO_ZH',
    lessonId: 'mandarin-work-level-1-day-27',
    currentDay: 27,
    phase: 'TEACH',
    conversationMode: 'COACH_CONVERSATION',
    userLevel: 'absolute beginner',
    learningGoal: 'mandarin-work · 30 Hari Bisa Mandarin untuk Kerja · kerja',
    recentMistakes: [], masteryState: [], reviewQueue: [],
    userInitiatedMemory: [], recentConversationSummary: '', recentTurns: [],
    ...extra,
  });
}

async function turn(message, sessionIdSuffix, extraCtx = {}) {
  const fd = new FormData();
  fd.set('sessionId', `coach-p0fix-${RUN}-${sessionIdSuffix}`);
  fd.set('context', ctx(extraCtx));
  fd.set('message', message);
  const r = await fetch(`${BASE}/api/mandarin-coach/conversation`, { method: 'POST', body: fd });
  let b = null;
  try { b = await r.json(); } catch { b = { raw: (await r.text()).slice(0, 300) }; }
  return { http: r.status, body: b };
}

const results = [];
function record(id, title, pass, expected, observed) {
  results.push({ id, title, verdict: pass ? 'PASS' : 'FAIL', expected, observed });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${title}`);
}

const CASE1 = 'saya orang pemulai, saya mau kerja di Pt china, boleh bantu saya buat les ya, sarayt kaya gmn ya';
const CASE2 = '今天太累了，我不想开车，我应该怎么和司机说？';

const t1 = await turn(CASE1, '01');
{
  const b = t1.body;
  const a = (b.answer || '');
  const pass =
    t1.http === 200 &&
    b.intent === 'STUDY_PLANNING' &&
    /minggu|rencana|plan|kurikulum|kursus/i.test(a) &&
    /syarat|HSK|perkenalan|interview/i.test(a) &&
    /pekerjaan|target|bidang|\?/i.test(b.followUp || '') &&
    !/^Tentu, saya bisa bantu/i.test(a);
  record('F1', 'FAIL1 学习计划+求职：识别意图、给计划与求职条件、追问岗位', pass,
    { intent: 'STUDY_PLANNING', plan: true, jobRequirements: true, asksOccupation: true },
    { http: t1.http, intent: b.intent, strategy: b.teachingStrategy, answer: a.slice(0, 220), followUp: b.followUp });
}

const t2 = await turn(CASE2, '02');
{
  const b = t2.body;
  const pass =
    t2.http === 200 &&
    /你来开车|开车吧/.test(b.chinese || '') &&
    /kāi chē/.test(b.pinyin || '') &&
    /menyetir|nyetir/i.test(b.indonesian || '') &&
    /今天我太累了/.test(b.chinese || '') &&
    (b.followUp || '').length > 0 &&
    !/^今天太累了，我不想开车/.test((b.chinese || '').replace(/[。．]/g, '')) ;
  record('F2', 'FAIL2 实用请求：给出目标句+拼音+印尼语+自然表达建议', pass,
    { chinese: '今天我太累了，你来开车吧。', pinyinHas: 'kāi chē', meaningHas: 'menyetir', alternative: true },
    { http: t2.http, intent: b.intent, strategy: b.teachingStrategy, chinese: b.chinese, pinyin: b.pinyin, indonesian: b.indonesian, followUp: b.followUp });
}

const t3 = await turn('gimana bilang ke supir tunggu sebentar?', '03');
record('F3', '司机请求泛化：等我一 determinstic', t3.http === 200 && /等我/.test(t3.body.chinese || ''),
  { chinese: /等我/ }, { http: t3.http, chinese: t3.body.chinese, pinyin: t3.body.pinyin });

const t4 = await turn('buatkan rencana belajar mandarin', '04');
record('F4', '通用学习计划分支', t4.http === 200 && t4.body.intent === 'STUDY_PLANNING' && /minggu/i.test(t4.body.answer || ''),
  { intent: 'STUDY_PLANNING', plan: true }, { http: t4.http, intent: t4.body.intent, answer: (t4.body.answer || '').slice(0, 140) });

const r1 = await turn('minum bahasa mandarin apa?', '10');
record('R1', '回归：词汇问答不受影响', r1.http === 200 && r1.body.chinese === '喝' && r1.body.intent === 'VOCABULARY',
  { chinese: '喝', intent: 'VOCABULARY' }, { http: r1.http, intent: r1.body.intent, chinese: r1.body.chinese });

const r2 = await turn('saham bitcoin besok naik?', '11');
record('R2', '回归：跑题仍被拦截', r2.http === 200 && r2.body.intent === 'OFF_TOPIC' && /hanya membantu kamu belajar|fokus/i.test(r2.body.answer || ''),
  { intent: 'OFF_TOPIC' }, { http: r2.http, intent: r2.body.intent, answer: (r2.body.answer || '').slice(0, 80) });

const r3 = await turn('我饿了什么意思', '12');
record('R3', '回归：意思问答不受影响', r3.http === 200 && /我饿了/.test(r3.body.chinese || '') ,
  { chinese: /我饿了/ }, { http: r3.http, intent: r3.body.intent, chinese: r3.body.chinese });

const r4 = await turn('Bos bilang 辛苦了, saya jawab apa?', '13');
record('R4', '回归：职场用语不受影响', r4.http === 200 && /谢谢，不辛苦/.test(r4.body.chinese || ''),
  { chinese: '谢谢，不辛苦。' }, { http: r4.http, intent: r4.body.intent, chinese: r4.body.chinese });

const r5 = await turn('你好怎么读？', '14');
record('R5', '回归：发音问答不受影响', r5.http === 200 && /nǐ hǎo/i.test(r5.body.pinyin || ''),
  { pinyin: /nǐ hǎo/ }, { http: r5.http, intent: r5.body.intent, pinyin: r5.body.pinyin });

const summary = {
  run: RUN,
  base: BASE,
  totals: { pass: results.filter((x) => x.verdict === 'PASS').length, fail: results.filter((x) => x.verdict === 'FAIL').length },
  results,
};
import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('results', { recursive: true });
writeFileSync(OUT, JSON.stringify(summary, null, 2));
console.log(`\nTOTAL: ${summary.totals.pass} PASS / ${summary.totals.fail} FAIL -> ${OUT}`);
