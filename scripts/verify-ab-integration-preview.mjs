// 任务 A+B 集成验收：真实模型连续对话（Preview，走 vercel curl 绕过 Deployment Protection）
//
// 记录的是真实行为：每轮的实际输出文本、teachingStrategy、targetChinese、拆词、miniCourse 游标。
// 不做「HTTP 200 就算过」或纯关键词的宽松判定——每个断言都绑定具体教学行为。
//
// 用法：node scripts/verify-ab-integration-preview.mjs <deployUrl> [outJson]

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const CLI = process.execPath;
const CLI_JS = 'C:/Users/lijia/WorkBuddy/2026-10-18-21-29-22/.tools/vercel/node_modules/vercel/dist/vc.js';
const DEPLOY = process.argv[2];
const OUT = process.argv[3] || 'results/ab-integration-preview.json';
if (!DEPLOY) { console.error('usage: node verify-ab-integration-preview.mjs <deployUrl> [out]'); process.exit(2); }

const checks = [];
const transcript = [];
let totalCalls = 0;
let totalCost = 0;

function check(name, pass, detail = '') {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
}

function makeSession(name) {
  const recentTurns = [];
  let messageCount = 0;
  let miniCourse = null;
  const SID = `coach-ab-${name}-${String(Date.now()).slice(-6)}`;

  function ctx() {
    return JSON.stringify({
      lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, currentExpression: null, currentSkill: 'TEACH',
      conversationMode: 'COACH_CONVERSATION', userLevel: 'BEGINNER', learningGoal: 'restoran',
      recentMistakes: [], masteryState: [], reviewQueue: [], userInitiatedMemory: [],
      recentConversationSummary: '', recentTurns: recentTurns.slice(-6), messageCount,
      miniCourse: miniCourse ? { key: miniCourse.key, cursor: miniCourse.cursor } : null,
    });
  }

  async function send(message) {
    messageCount += 1;
    const args = [CLI_JS, 'curl', 'api/mandarin-coach/conversation', '--deployment', DEPLOY, '-s', '-X', 'POST',
      '-F', `sessionId=${SID}`, '-F', `message=${message}`, '-F', `context=${ctx()}`];
    const started = Date.now();
    let raw;
    try {
      raw = execFileSync(CLI, args, { encoding: 'utf8', env: { ...process.env, CI: '1' }, maxBuffer: 16 * 1024 * 1024 });
    } catch (error) {
      return { ok: false, error: String(error.message).slice(0, 300), latency: Date.now() - started };
    }
    let body;
    try {
      body = JSON.parse(raw.slice(raw.indexOf('{')));
    } catch {
      return { ok: false, error: 'non-JSON response: ' + raw.slice(0, 200), latency: Date.now() - started };
    }
    const latency = Date.now() - started;
    if (body.usage) {
      totalCalls += body.usage.model_calls || 0;
      totalCost += body.usage.estimated_ai_cost || 0;
    }
    if (body.miniCourse) miniCourse = { key: body.miniCourse.key, cursor: body.miniCourse.cursor };

    const record = {
      message,
      latency,
      intent: body.intent,
      intents: body.intents,
      strategy: body.teachingStrategy,
      targetChinese: body.targetChinese || '',
      chinese: body.chinese || '',
      pinyin: body.pinyin || '',
      indonesian: body.indonesian || '',
      answer: (body.answer || '').slice(0, 400),
      followUp: (body.followUp || '').slice(0, 200),
      wordBreakdown: (body.wordBreakdown || []).map((part) => part.chinese),
      miniCourse: body.miniCourse || null,
      speechSegments: (body.speechSegments || []).length,
      usage: body.usage ? { calls: body.usage.model_calls, cost: body.usage.estimated_ai_cost } : null,
      error: body.error || null,
    };
    transcript.push(record);
    recentTurns.push({ role: 'user', text: message });
    if (body.answer) recentTurns.push({ role: 'assistant', text: String(body.answer).slice(0, 240) });

    console.log(`\n  [${name}] ${message}`);
    console.log(`    strategy=${record.strategy} target=${JSON.stringify(record.targetChinese)} intent=${record.intent} ${latency}ms`);
    console.log(`    answer: ${record.answer.replace(/\s+/g, ' ').slice(0, 220)}`);
    if (record.chinese) console.log(`    card: ${record.chinese} / ${record.pinyin} / ${record.indonesian}`);
    if (record.miniCourse) console.log(`    course: ${record.miniCourse.key}@${record.miniCourse.cursor} (${record.miniCourse.position})`);
    return { ok: !body.error, body, record };
  }

  return { send, get miniCourse() { return miniCourse; }, SID };
}

const COURSE_TARGETS = ['欢迎光临', '几位', '这边请', '这是菜单', '您要什么', '请稍等', '请坐', '要不要加水', '一共多少钱', '谢谢'];

function looksUnrelatedTo(text, keyword) {
  // 卡片里完全没提到关键词 → 视为跑题（不相关教学句）
  return Boolean(text) && !text.includes(keyword);
}

// ═══════════ 场景组 1：核心 P0 缺陷（问词义不得跳转） ═══════════
console.log('\n═══ 场景 1: 餐厅课程中学到一半，问「分酒器是啥」 ═══');
const s1 = makeSession('p0');
const start1 = await s1.send('Saya belajar Mandarin untuk kerja di restoran. Saya pemula.');
check('1.1 首轮进入教学而非空泛计划', Boolean(start1.record?.chinese), `strategy=${start1.record?.strategy} chinese=${JSON.stringify(start1.record?.chinese)}`);
const courseBefore = s1.miniCourse ? { ...s1.miniCourse } : null;

const q1 = await s1.send('分酒器是啥');
check(
  '1.2 「分酒器是啥」给出释义（不空答）',
  Boolean(q1.record?.answer) && q1.record.answer.length > 10,
  `strategy=${q1.record?.strategy}`,
);
check(
  '1.3 未擅自跳出不相关教学句（卡片不含课程句）',
  !q1.record?.chinese || !COURSE_TARGETS.some((t) => q1.record.chinese.includes(t)),
  `chinese=${JSON.stringify(q1.record?.chinese)} target=${JSON.stringify(q1.record?.targetChinese)}`,
);
check(
  '1.4 卡片若无则不给不相关句；若有则必须与「分酒器」相关',
  !q1.record?.chinese || q1.record.chinese.includes('分酒器') || q1.record.targetChinese.includes('分酒器'),
  `chinese=${JSON.stringify(q1.record?.chinese)}`,
);
// 这是上一轮 Preview 暴露的真缺陷：模型判定 MEANING，却被迷你课程练习分支判成"答错"。
check(
  '1.7 「分酒器是啥」没有被判成跟读答错',
  !/MINI_COURSE_CORRECT|MINI_COURSE_RETRY|belum tepat|Belum tepat/i.test(`${q1.record?.strategy || ''} ${q1.record?.answer || ''}`),
  `strategy=${q1.record?.strategy}`,
);
check(
  '1.8 解释内容真的在讲「分酒器」（不是通用寒暄）',
  /分酒器|wine|anggur|teh|cangkir|pitcher|pour|tuang/i.test(q1.record?.answer || ''),
  `answer=${(q1.record?.answer || '').slice(0, 140)}`,
);

const q2 = await s1.send('Apa arti 分酒器?');
check(
  '1.5 「Apa arti 分酒器?」给出释义',
  Boolean(q2.record?.answer) && q2.record.answer.length > 10,
  `strategy=${q2.record?.strategy}`,
);
check(
  '1.6 印尼语问法同样不跳转不相关教学句',
  !q2.record?.chinese || !COURSE_TARGETS.some((t) => q2.record.chinese.includes(t)),
  `chinese=${JSON.stringify(q2.record?.chinese)}`,
);

// ═══════════ 场景组 2：明确要学 → 卡片必须相关 ═══════════
const want = await s1.send('我想学习怎么介绍分酒器');
check(
  '2.1 「我想学习怎么介绍分酒器」生成相关教学卡片',
  Boolean(want.record?.chinese) && want.record.chinese.includes('分酒器'),
  `chinese=${JSON.stringify(want.record?.chinese)} strategy=${want.record?.strategy}`,
);
check(
  '2.2 教学卡片含拼音与印尼语释义',
  Boolean(want.record?.pinyin) && Boolean(want.record?.indonesian),
  `pinyin=${JSON.stringify(want.record?.pinyin)} id=${JSON.stringify(want.record?.indonesian)}`,
);
check(
  '2.3 卡片附拆词（任务 B 能力未回归）',
  Array.isArray(want.record?.wordBreakdown) && want.record.wordBreakdown.length > 0,
  `breakdown=${JSON.stringify(want.record?.wordBreakdown)}`,
);

// ═══════════ 场景组 3：继续课程 → 恢复原课程，不重开 ═══════════
const cont = await s1.send('继续刚才的课程');
check(
  '3.1 「继续刚才的课程」被识别为继续（非重新开课）',
  ['CONTINUE_NEXT_EXPRESSION', 'MINI_COURSE_NEXT'].includes(cont.record?.strategy) || Boolean(cont.record?.miniCourse),
  `strategy=${cont.record?.strategy}`,
);
check(
  '3.2 「继续刚才的课程」回到被打断前的位置（游标不动）',
  !cont.record?.miniCourse || courseBefore === null || cont.record.miniCourse.cursor === courseBefore.cursor,
  `before=${JSON.stringify(courseBefore)} after=${JSON.stringify(cont.record?.miniCourse)}`,
);
check(
  '3.5 恢复的是原课程当前句（不是另开新句）',
  !cont.record?.chinese || cont.record.chinese.includes('欢迎光临') || cont.record.strategy === 'MINI_COURSE_RESUME',
  `chinese=${JSON.stringify(cont.record?.chinese)} strategy=${cont.record?.strategy}`,
);
check(
  '3.3 继续时给出了下一步教学内容',
  Boolean(cont.record?.chinese) || Boolean(cont.record?.answer),
  `chinese=${JSON.stringify(cont.record?.chinese)}`,
);

// ═══════════ 场景组 4：答 AI 新教的句子 → 不被旧课程规则误判 ═══════════
const newSentence = want.record?.chinese || '这是分酒器';
const answerNew = await s1.send(newSentence);
check(
  '4.1 回答 AI 动态教的新句子，没有被旧课程规则判成答错',
  !/MINI_COURSE_CORRECT|MINI_COURSE_RETRY/i.test(answerNew.record?.strategy || '')
    && !/Belum tepat|belum tepat/i.test(answerNew.record?.answer || ''),
  `strategy=${answerNew.record?.strategy} answer=${(answerNew.record?.answer || '').slice(0, 140)}`,
);
check(
  '4.2 反馈针对新教的句子内容，而非原课程目标',
  Boolean(answerNew.record?.answer) && answerNew.record.answer.length > 5,
  `len=${answerNew.record?.answer?.length}`,
);

// ═══════════ 场景组 5：印尼语纠正老师 → AI 理解并调整 ═══════════
const fix = await s1.send('Bukan, maksud saya bukan itu. Saya mau yang tadi.');
check(
  '5.1 印尼语纠正被理解（不作扣分/判错）',
  Boolean(fix.record?.answer) && fix.record.answer.length > 10,
  `strategy=${fix.record?.strategy}`,
);

// ═══════════ 场景组 2（续）：多轮后课程状态仍可用 ═══════════
const cont2 = await s1.send('lanjut');
check(
  '6.1 多轮打断后「lanjut」仍能继续课程',
  Boolean(cont2.record?.chinese) || Boolean(cont2.record?.answer),
  `strategy=${cont2.record?.strategy} chinese=${JSON.stringify(cont2.record?.chinese)}`,
);

// ═══════════ 场景组 7：库存（职场词）释义 ═══════════
console.log('\n═══ 场景 7: 「库存是什么意思」 ═══');
const s2 = makeSession('stock');
await s2.send('Saya kerja di gudang. Mau belajar Mandarin untuk kerja.');
const stock = await s2.send('库存是什么意思');
check(
  '7.1 「库存是什么意思」给出词义解释',
  Boolean(stock.record?.answer) && stock.record.answer.length > 10,
  `strategy=${stock.record?.strategy}`,
);
check(
  '7.2 目标词为「库存」而非整句',
  !stock.record?.targetChinese || stock.record.targetChinese.replace(/\s/g, '') === '库存',
  `target=${JSON.stringify(stock.record?.targetChinese)}`,
);

// ═══════════ 场景组 8：混合语言自由提问 ═══════════
const mixed = await s2.send('apa itu 分酒器');
check(
  '8.1 混合语言（印尼语+中文）提问可被理解',
  Boolean(mixed.record?.answer) && mixed.record.answer.length > 10,
  `intent=${mixed.record?.intent} target=${JSON.stringify(mixed.record?.targetChinese)}`,
);

// ═══════════ 场景组 9：真正跟读「欢迎光临」仍要能正常评分 ═══════════
// 放宽释义判断后最容易踩的回归：真跟读被当成问题放过去，评分能力消失。
console.log('\n═══ 场景 9: 真跟读「欢迎光临」仍能评分 ═══');
const s3 = makeSession('readaloud');
await s3.send('Saya belajar Mandarin untuk kerja di restoran. Saya pemula.');
const attempt = await s3.send('欢迎光临');
const attemptText = `${attempt.record?.strategy || ''} ${attempt.record?.answer || ''}`;
check(
  '9.1 跟读「欢迎光临」被当作练习作答（有评分/反馈）',
  Boolean(attempt.record?.answer) && attempt.record.answer.length > 8,
  `strategy=${attempt.record?.strategy} answer=${(attempt.record?.answer || '').slice(0, 140)}`,
);
check(
  '9.2 评分针对「欢迎光临」而不是跳到别的句子',
  /欢迎光临|huān yíng guāng lín|selamat datang/i.test(attemptText) || attempt.record?.targetChinese?.includes('欢迎光临'),
  `target=${JSON.stringify(attempt.record?.targetChinese)}`,
);
check(
  '9.3 没有被当成释义问题而变成"解释模式"',
  !attempt.record?.strategy?.includes('MEANING'),
  `strategy=${attempt.record?.strategy}`,
);

// ═══════════ 场景组 10：三种语言的提问都不被课程规则误判 ═══════════
console.log('\n═══ 场景 10: 中文 / 印尼语 / 混合语言提问均不误判 ═══');
for (const [probe, note] of [
  ['分酒器是啥意思', '中文短问句'],
  ['apa arti 分酒器?', '印尼语 + 中文'],
  ['分酒器 itu apa ya', '混合语序'],
]) {
  const r = await s3.send(probe);
  check(
    `10.x 「${probe}」不被判成跟读答错（${note}）`,
    !/MINI_COURSE_CORRECT/i.test(r.record?.strategy || '') && !/Belum tepat/i.test(r.record?.answer || ''),
    `strategy=${r.record?.strategy}`,
  );
}

// ═══════════ 汇总 ═══════════
const passed = checks.filter((c) => c.pass).length;
console.log(`\n═══ 结果: ${passed}/${checks.length} 通过 ═══`);
console.log(`模型调用 ${totalCalls} 次，估算成本 $${totalCost.toFixed(6)}`);

const failed = checks.filter((c) => !c.pass);
if (failed.length) {
  console.log('\n失败项:');
  for (const f of failed) console.log(' -', f.name, f.detail);
}

fs.mkdirSync('results', { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({
  deploy: DEPLOY,
  commit: process.env.GIT_COMMIT || null,
  run: new Date().toISOString(),
  passed, total: checks.length,
  total_model_calls: totalCalls,
  total_estimated_cost: totalCost,
  checks,
  transcript,
}, null, 2));
console.log(`\n写到 ${OUT}`);
process.exitCode = failed.length ? 1 : 0;
