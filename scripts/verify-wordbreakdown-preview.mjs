// P1 拆词功能 Preview 真实模型验收（走 vercel curl 绕过 Deployment Protection）
// 验收项：固定句/AI 动态句拆词、覆盖完整性、零额外调用、刷新保留、回归
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const CLI = process.execPath;
const CLI_JS = 'C:/Users/lijia/WorkBuddy/2026-10-18-21-29-22/.tools/vercel/node_modules/vercel/dist/vc.js';
const DEPLOY = process.argv[2] || 'https://indobrain-v12-rc2-integration-piwfky21g-lijian1.vercel.app';
const OUT = process.argv[3] || 'results/p1-wordbreakdown-preview.json';

const checks = [];
const turns = [];
function check(name, pass, detail) {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
}

function makeSession(name) {
  const recentTurns = [];
  let messageCount = 0;
  let cursor = null;
  const SID = `coach-wb-${name}-${String(Date.now()).slice(-6)}`;
  function ctx() {
    return JSON.stringify({
      lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, currentExpression: null, currentSkill: 'TEACH',
      conversationMode: 'COACH_CONVERSATION', userLevel: 'BEGINNER', learningGoal: '', recentMistakes: [],
      masteryState: [], reviewQueue: [], userInitiatedMemory: [], recentConversationSummary: '',
      recentTurns: recentTurns.slice(-6), messageCount, miniCourse: cursor ? { key: cursor.key, cursor: cursor.cursor } : null,
    });
  }
  async function send(message) {
    messageCount += 1;
    const args = [CLI_JS, 'curl', 'api/mandarin-coach/conversation', '--deployment', DEPLOY, '-s', '-X', 'POST',
      '-F', `sessionId=${SID}`, '-F', `message=${message}`, '-F', `context=${ctx()}`];
    const started = Date.now();
    const raw = execFileSync(CLI, args, { encoding: 'utf8', env: { ...process.env, CI: '1' }, maxBuffer: 8 * 1024 * 1024 });
    const json = raw.slice(raw.indexOf('{'));
    const body = JSON.parse(json);
    const latency = Date.now() - started;
    const record = {
      turn: turns.length + 1, session: SID, message, latency_ms: latency, strategy: body.teachingStrategy,
      chinese: body.chinese, targetChinese: body.targetChinese, pinyin: body.pinyin, answer: body.answer,
      wordBreakdown: body.wordBreakdown || null, model: body.usage?.model_used, model_calls: body.usage?.model_calls,
      tokens: body.usage ? [body.usage.token_input, body.usage.token_output] : null,
      cost: body.usage?.estimated_ai_cost, skillGap: body.skillGap, miniCourse: body.miniCourse || null,
    };
    turns.push(record);
    recentTurns.push({ role: 'user', text: message });
    if (body.answer) recentTurns.push({ role: 'assistant', text: body.answer });
    if (body.miniCourse) cursor = { key: body.miniCourse.key, cursor: body.miniCourse.cursor };
    return record;
  }
  return { SID, send };
}

/** 覆盖检查：所有词拼起来（去分隔）应能覆盖原句汉字，无重复词（除原文确有重复），顺序与原文一致 */
function coverage(breakdown, chinese) {
  const clean = chinese.replace(/[？?！!，,。.、\s]/g, '');
  const joined = breakdown.map((w) => w.chinese).join('');
  const ordered = joined === clean;
  const words = breakdown.map((w) => w.chinese);
  const dupWithin = words.some((w, i) => w === words[i + 1] && clean.indexOf(w + w) === -1);
  return { clean, joined, ordered, dupWithin };
}

const pinyinToned = (p) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(p);
const idOk = (s) => typeof s === 'string' && s.length >= 2 && /[a-z]/i.test(s);

async function main() {
  // === 场景 1：固定句（职业课程预置路径） ===
  const s1 = makeSession('fixed');
  const t1 = await s1.send('Saya kerja di restoran, saya waiter. Tolong ajarin bahasa Mandarin ya.');
  check('1.1 餐厅首轮进入课程并教欢迎光临', t1.chinese === '欢迎光临' && t1.model_calls === 0, `${t1.strategy} · calls=${t1.model_calls}`);
  check('1.2 欢迎光临拆词非空且为预置(欢迎+光临)', Array.isArray(t1.wordBreakdown) && t1.wordBreakdown.length === 2,
    t1.wordBreakdown ? t1.wordBreakdown.map((w) => w.chinese).join('+') : 'null');
  const cov1 = coverage(t1.wordBreakdown || [], t1.chinese);
  check('1.3 拆词完整覆盖原句无重复', cov1.ordered && !cov1.dupWithin, `${cov1.joined} vs ${cov1.clean}`);
  check('1.4 拼音带声调', (t1.wordBreakdown || []).every((w) => pinyinToned(w.pinyin)), (t1.wordBreakdown || []).map((w) => w.pinyin).join(' / '));
  check('1.5 印尼语解释自然非空', (t1.wordBreakdown || []).every((w) => idOk(w.indonesian)), (t1.wordBreakdown || []).map((w) => w.indonesian).join(' / '));

  // === 场景 2：lanjut 连续走固定句库（库存不够 = 仓库句） ===
  const s2 = makeSession('fixed2');
  await s2.send('Saya kerja di gudang. Ajarin Mandarin dong.');
  const t2 = await s2.send('lanjut');
  const wb2 = t2.wordBreakdown || [];
  check('2.1 仓库句 lanjut 拆词存在', wb2.length >= 2, `${t2.chinese} → ${wb2.map((w) => w.chinese).join('+')}`);
  const cov2 = coverage(wb2, t2.chinese);
  check('2.2 仓库句拆词覆盖原句', cov2.ordered && !cov2.dupWithin, `${cov2.joined} vs ${cov2.clean}`);

  // === 场景 3：AI 动态句（自由提问走模型，wordBreakdown 由模型带回） ===
  const s3 = makeSession('dynamic');
  await s3.send('Saya kerja di restoran, saya waiter.');
  const t3 = await s3.send('Bagaimana cara bilang "tolong antar ke kamar 302" dalam bahasa Mandarin?');
  const wb3 = t3.wordBreakdown || [];
  check('3.1 AI 动态句返回拆词', wb3.length >= 2 && t3.model_calls > 0,
    `calls=${t3.model_calls} · ${t3.targetChinese || t3.chinese} → ${wb3.map((w) => w.chinese).join('+')}`);
  if (wb3.length >= 2) {
    const dynSrc = t3.targetChinese || t3.chinese;
    const cov3 = coverage(wb3, dynSrc);
    check('3.2 动态句拆词覆盖目标句', cov3.ordered && !cov3.dupWithin, `${cov3.joined} vs ${cov3.clean}`);
    check('3.3 动态句拼音带声调', wb3.every((w) => pinyinToned(w.pinyin)), wb3.map((w) => w.pinyin).join(' / '));
    check('3.4 动态句印尼语自然', wb3.every((w) => idOk(w.indonesian)), wb3.map((w) => w.indonesian).join(' / '));
  }

  // === 场景 4：继续对话/刷新后拆词保留（新会话仅带 miniCourse 游标，等价刷新） ===
  const s4 = makeSession('persist');
  await s4.send('Saya kerja di restoran, saya waiter.');
  const cursor = s4 ? null : null; // cursor 在 makeSession 内部；直接用 miniCourse 回传重建
  const snapshot = turns[turns.length - 2].miniCourse;
  const s4b = makeSession('persist-refresh');
  // 模拟刷新：全新 sessionId，只带游标
  const fdCtxRefresh = JSON.stringify({
    lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, currentExpression: null, currentSkill: 'TEACH',
    conversationMode: 'COACH_CONVERSATION', userLevel: 'BEGINNER', learningGoal: '', recentMistakes: [],
    masteryState: [], reviewQueue: [], userInitiatedMemory: [], recentConversationSummary: '',
    recentTurns: [], messageCount: 1, miniCourse: snapshot,
  });
  const raw4 = execFileSync(CLI, [CLI_JS, 'curl', 'api/mandarin-coach/conversation', '--deployment', DEPLOY, '-s', '-X', 'POST',
    '-F', `sessionId=coach-wb-refresh-${String(Date.now()).slice(-6)}`, '-F', 'message=lanjut', '-F', `context=${fdCtxRefresh}`],
    { encoding: 'utf8', env: { ...process.env, CI: '1' }, maxBuffer: 8 * 1024 * 1024 });
  const t4 = JSON.parse(raw4.slice(raw4.indexOf('{')));
  const record4 = { turn: turns.length + 1, session: 'refresh', message: 'lanjut(刷新恢复)', strategy: t4.teachingStrategy, chinese: t4.chinese, wordBreakdown: t4.wordBreakdown || null, model_calls: t4.usage?.model_calls };
  turns.push(record4);
  check('4.1 刷新后 lanjut 继续课程且拆词保留', t4.wordBreakdown && t4.wordBreakdown.length >= 2,
    `${t4.chinese} → ${(t4.wordBreakdown || []).map((w) => w.chinese).join('+')}`);

  // === 场景 5：回归（自由提问/纠错不被拆词路径影响） ===
  const s5 = makeSession('regress');
  await s5.send('Saya kerja di restoran, saya waiter.');
  const t5 = await s5.send('Bukan, maksud saya ada ruang per Meeting atau meja?');
  check('5.1 纠正老师不被判练习(进 AI 理解流程)', t5.model_calls > 0 && t5.strategy !== 'MINI_COURSE_PASS', `${t5.strategy} · calls=${t5.model_calls} · ${(t5.answer || '').slice(0, 60)}`);
  const t6 = await s5.send('Huān yíng guāng lín');
  check('5.2 拼音跟读仍判定', t6.strategy === 'MINI_COURSE_PASS' || /tepat|bagus|benar/i.test(t6.answer || ''), `${t6.strategy} · ${(t6.answer || '').slice(0, 60)}`);
  const t7 = await s5.send('欢迎光临');
  check('5.3 汉字跟读仍判定', t7.strategy === 'MINI_COURSE_PASS' || /tepat|bagus|benar/i.test(t7.answer || ''), `${t7.strategy} · ${(t7.answer || '').slice(0, 60)}`);

  // === 成本对比：拆词开启后同轮调用数 ===
  const totalCalls = turns.filter((t) => typeof t.model_calls === 'number').reduce((a, t) => a + t.model_calls, 0);
  const totalCost = turns.filter((t) => typeof t.cost === 'number').reduce((a, t) => a + t.cost, 0);
  console.log(`\nTOTAL model_calls=${totalCalls} · estimated_cost=$${totalCost.toFixed(4)} · turns=${turns.length}`);

  const passed = checks.filter((c) => c.pass).length;
  const summary = { run: String(Date.now()).slice(-6), deploy: DEPLOY, passed, total: checks.length, total_model_calls: totalCalls, total_estimated_cost: totalCost, checks, turns };
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log(`${passed}/${checks.length} PASS · ${OUT}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
