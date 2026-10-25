// run-natural-session-10min.mjs
// 完整、连续的 ~10 分钟教学会话（非 30 个独立问答）：
//   学生：印尼零基础中文学习者（商店员工，接待中国顾客）
//   AI 需连续完成：了解需求 → 示范 → 练习 → 纠错 → 调整策略 → 角色扮演 → 总结
//   保留全部真实对话（完整 payload），文字输入验证；语音能力单独标注未验证。
//   学生回答含故意错误（触发纠错与策略调整），结尾含无原句提示的新场景迁移表达。
// 用法: node scripts/run-natural-session-10min.mjs <preview-url> [output.json]
import { writeFile } from 'node:fs/promises';

const baseUrl = process.argv[2]?.replace(/\/$/, '');
const outputPath = process.argv[3] || 'results/natural-session-10min.json';
const protectionBypass = process.env.VERCEL_PROTECTION_BYPASS || '';
const shareToken = process.env.VERCEL_SHARE_TOKEN || '';
const requestIntervalMs = Math.max(0, Number(process.env.AB_REQUEST_INTERVAL_MS) || 13_000);
if (!baseUrl) throw new Error('Usage: node scripts/run-natural-session-10min.mjs <preview-url>');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createClient() {
  const cookies = new Map();
  const remember = (response) => {
    const values = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [response.headers.get('set-cookie')].filter(Boolean);
    for (const value of values) {
      const pair = value.split(';', 1)[0];
      const index = pair.indexOf('=');
      if (index > 0) cookies.set(pair.slice(0, index), pair.slice(index + 1));
    }
  };
  return async (path, init = {}) => {
    const headers = new Headers(init.headers || {});
    if (cookies.size) headers.set('cookie', [...cookies].map(([key, value]) => `${key}=${value}`).join('; '));
    if (protectionBypass) headers.set('x-vercel-protection-bypass', protectionBypass);
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers, redirect: 'manual' });
    remember(response);
    return response;
  };
}
const client = createClient();
if (shareToken) await client(`/coba-gratis/ai-free-teaching?_vercel_share=${encodeURIComponent(shareToken)}`);
const guest = await client('/api/guest/session', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ remember: true, next: '/coba-gratis/ai-free-teaching' }),
});
if (!guest.ok) throw new Error(`Guest session failed: ${guest.status}`);

const sessionId = 'free-natural-session-10min';
let contextSummary = '';
let coachingState = { consecutiveFailures: 0, lastTeachingStrategy: '', sameTaskRepeatCount: 0, lastTaskPrompt: '', weakExpressions: [], independentUses: [] };
const history = []; // { role, text } — assistant text enriched with taught Chinese (mirrors FreeTeachingExperience)

// 学生脚本：Rina，便利店收银员，零基础。括号内为脚本意图说明（不会发送）。
// 含故意错误：T5 量词/句式错误、T7 一次失败 + T8 二次失败（触发策略调整）、T12 迁移表达无原句提示。
const studentScript = [
  { intent: 'needs-analysis', text: 'Halo! Saya Rina, saya kerja sebagai kasir di minimarket. Sering ada pelanggan dari China, tapi saya tidak bisa bahasa Mandarin sama sekali. Bisa tolong ajarin saya?' },
  { intent: 'request-greeting', text: 'Biasanya pelanggan masuk terus saya bingung mau bilang apa. Tolong ajarin cara menyapa pelanggan yang baru masuk toko.' },
  { intent: 'practice-follow-read', text: '你好，欢迎光临。' },
  { intent: 'request-ask-need', text: 'Oke! Terus gimana cara nanya pelanggan itu mau beli apa?' },
  { intent: 'attempt-with-mistake', text: '你要买什么的？' },
  { intent: 'request-price', text: 'Paham. Kalau pas bayar, saya mau bilang total harganya. Tolong ajarin dong.' },
  { intent: 'attempt-with-mistake', text: '一起二十块。' },
  { intent: 'request-harder', text: 'Kayaknya gampang, kasih saya soal yang lebih sulit dong.' },
  { intent: 'attempt-harder-fail-1', text: '一共二十五块，对吗？ehm... 我说 "Yígòng èrshíwǔ kuài" betul nggak?' },
  { intent: 'attempt-harder-fail-2', text: '一共是二十五块钱的。' },
  { intent: 'request-strategy-change', text: 'Aku bingung sendiri. Coba ajarin lagi pelan-pelan pakai cara yang beda ya.' },
  { intent: 'request-roleplay', text: 'Sekarang ayo latihan sungguhan! Kamu jadi pelanggan dari China, saya kasir. Mulai ya.' },
  { intent: 'roleplay-answer-1', text: '你好，欢迎光临！你要买什么？' },
  { intent: 'roleplay-answer-2-price', text: '这个……一共十五块。' },
  { intent: 'transfer-independent-attempt', text: 'Aku coba sendiri tanpa contoh ya: 可以刷卡。 Udah benar nggak?' },
  { intent: 'request-polite-form', text: 'Kalau mau lebih sopan gimana ya bilangnya? Ajarin versi sopannya dong.' },
  { intent: 'session-end', text: 'Sudah selesai ya untuk hari ini. Tolong rangkum apa saja yang harus saya ulang.' },
];

async function ask(message) {
  const startedAt = Date.now();
  const response = await client('/api/mandarin-coach/free-teaching', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, sessionId, contextSummary, skillVersion: 'NATURAL_V1', coachingState, recentTurns: history.slice(-12) }),
  });
  const payload = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
  const latencyMs = Date.now() - startedAt;
  if (requestIntervalMs) await wait(requestIntervalMs);
  return { status: response.status, payload, latencyMs };
}

const transcript = [];
for (let index = 0; index < studentScript.length; index += 1) {
  const step = studentScript[index];
  process.stderr.write(`[${new Date().toISOString()}] turn ${index + 1}/${studentScript.length} (${step.intent})...\n`);
  const { status, payload, latencyMs } = await ask(step.text);
  const entry = {
    turn: index + 1,
    intent: step.intent,
    studentInput: step.text,
    httpStatus: status,
    latencyMs,
    payload,
  };
  transcript.push(entry);
  if (status !== 200) {
    console.error(`  ! HTTP ${status}: ${payload?.error}`);
    continue;
  }
  // 与 FreeTeachingExperience 相同的状态推进（客户端同款逻辑）
  contextSummary = payload.contextSummary || contextSummary;
  if (payload.teachingStrategy && payload.learningEvidence) {
    const evidence = payload.learningEvidence;
    const nextTask = payload.task?.prompt || '';
    // 与 FreeTeachingExperience 相同的状态推进（含换策略后清零失败计数）
    const strategyChangeApplied = coachingState.consecutiveFailures >= 2
      && payload.teachingStrategy !== coachingState.lastTeachingStrategy;
    coachingState = {
      consecutiveFailures: strategyChangeApplied ? 0 : payload.assessment.status === 'NEEDS_WORK' ? Math.min(5, coachingState.consecutiveFailures + 1) : payload.assessment.status === 'CORRECT' ? 0 : coachingState.consecutiveFailures,
      lastTeachingStrategy: payload.teachingStrategy || coachingState.lastTeachingStrategy,
      sameTaskRepeatCount: nextTask && nextTask === coachingState.lastTaskPrompt ? Math.min(3, coachingState.sameTaskRepeatCount + 1) : nextTask ? 1 : 0,
      lastTaskPrompt: nextTask,
      weakExpressions: [...new Set([...coachingState.weakExpressions, ...evidence.weakExpressions.map((item) => item.expression)])].slice(-12),
      independentUses: [...new Set([...coachingState.independentUses, ...evidence.independentUses.map((item) => item.learnerEvidence)])].slice(-12),
    };
  }
  history.push({ role: 'user', text: step.text });
  history.push({
    role: 'assistant',
    text: [payload.answer, payload.spokenChinese?.length ? `Taught Chinese: ${payload.spokenChinese.map((item) => item.text).join('、')}` : '', payload.task ? `Task: ${payload.task.type}: ${payload.task.prompt}` : ''].filter(Boolean).join('\n'),
  });
  await writeFile(outputPath, JSON.stringify({
    experiment: 'NATURAL_SESSION_10MIN',
    scriptVersion: 'wb-handoff-1',
    baseUrl,
    learner: 'Rina, Indonesian minimarket cashier, absolute beginner',
    scenario: 'Serving Chinese customers in a store (needs analysis → model → practice → correction → strategy change → roleplay → transfer → wrap-up)',
    modality: 'TEXT ONLY — voice/pronunciation abilities NOT verified in this test',
    coachingState,
    transcript,
  }, null, 2), 'utf8');
}

// —— 会话级验证（机械可查的记录，不冒充真人语音） ——
const finalSummary = {
  baseUrl,
  executedAt: new Date().toISOString(),
  modality: 'TEXT ONLY — voice/pronunciation NOT verified',
  turns: transcript.length,
  sessionDurationBudget: '≈10 min including rate-limit intervals',
  skillChecksAllPassed: transcript.filter((t) => t.payload?.skillChecks).every((t) => Object.values(t.payload.skillChecks).every(Boolean)),
  teachingRecord: {
    taughtChinese: [...new Set(transcript.flatMap((t) => (t.payload?.spokenChinese || []).map((s) => s.text)))],
    strategiesUsed: [...new Set(transcript.map((t) => t.payload?.teachingStrategy).filter(Boolean))],
    correctionsGiven: transcript.flatMap((t) => (t.payload?.corrections || []).map((c) => ({ turn: t.turn, issue: c.issue, modelChinese: c.modelChinese }))),
    assessments: transcript.filter((t) => t.payload?.assessment && t.payload.assessment.status !== 'NOT_ASSESSED').map((t) => ({ turn: t.turn, status: t.payload.assessment.status, evidence: t.payload.assessment.evidence, studentInput: t.studentInput })),
    independentUses: transcript.flatMap((t) => (t.payload?.learningEvidence?.independentUses || []).map((u) => ({ turn: t.turn, expression: u.expression, learnerEvidence: u.learnerEvidence }))),
    weakExpressions: transcript.flatMap((t) => (t.payload?.learningEvidence?.weakExpressions || []).map((w) => ({ turn: t.turn, expression: w.expression }))),
    wrapUp: transcript.find((t) => t.payload?.sessionWrapUp)?.payload?.sessionWrapUp || null,
    tasksGiven: transcript.filter((t) => t.payload?.task).map((t) => ({ turn: t.turn, ...t.payload.task })),
    finalCoachingState: coachingState,
  },
  transferCheck: (() => {
    const t = transcript.find((x) => x.intent === 'transfer-independent-attempt');
    const priorTaught = transcript.slice(0, transcript.indexOf(t)).flatMap((x) => (x.payload?.spokenChinese || []).map((s) => s.text));
    return {
      studentProduced: t?.studentInput,
      withoutHint: !priorTaught.includes(t?.studentInput || ''),
      assessed: t?.payload?.assessment?.status,
      evidence: t?.payload?.assessment?.evidence,
      recordedAsIndependentUse: (t?.payload?.learningEvidence?.independentUses || []).length > 0,
    };
  })(),
  transcript,
};
await writeFile(outputPath, JSON.stringify(finalSummary, null, 2), 'utf8');
console.error(`\nSession done: ${transcript.length} turns -> ${outputPath}`);
console.error(`skillChecks all passed: ${finalSummary.skillChecksAllPassed}`);
console.error(`transfer without hint: ${finalSummary.transferCheck.withoutHint}, assessed: ${finalSummary.transferCheck.assessed}`);
