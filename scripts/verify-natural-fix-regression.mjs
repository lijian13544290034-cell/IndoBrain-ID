// verify-natural-fix-regression.mjs
// 三个教学缺陷的针对性回归（不改测试标准：沿用 A/B 相同的接口、模型与 skillChecks）。
// 覆盖：R1-29 意图优先级（含负例：真跟读仍为 PRACTICE）、R1-28 混合语言语义保真、R1-05 更难题难度比较。
// 用法: node scripts/verify-natural-fix-regression.mjs <preview-url>
import { readFile, writeFile } from 'node:fs/promises';

const baseUrl = process.argv[2]?.replace(/\/$/, '');
const protectionBypass = process.env.VERCEL_PROTECTION_BYPASS || '';
const shareToken = process.env.VERCEL_SHARE_TOKEN || '';
const requestIntervalMs = Math.max(0, Number(process.env.AB_REQUEST_INTERVAL_MS) || 13_000);
if (!baseUrl) throw new Error('Usage: node scripts/verify-natural-fix-regression.mjs <preview-url>');
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

async function ask(message, recentTurns = [], coachingState = {}) {
  const response = await client('/api/mandarin-coach/free-teaching', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, sessionId: 'free-natural-fix-regression', recentTurns, contextSummary: '', modelTier: 'SMART', skillVersion: 'NATURAL_V1', coachingState }),
  });
  const payload = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
  if (requestIntervalMs) await wait(requestIntervalMs);
  return { status: response.status, payload };
}

const checks = [];
const record = (id, name, passed, detail) => { checks.push({ id, name, passed, detail }); console.error(`${passed ? 'PASS' : 'FAIL'} ${id} ${name} :: ${detail}`); };
const turns = [];

// —— R1-29: 结束请求必须优先于跟读识别 ——
let r = await ask('saya selesai ya, tolong rangkum yang perlu saya ulang');
record('R1-29', 'session-end learnerAct', r.payload?.learnerAct === 'SESSION_END', `learnerAct=${r.payload?.learnerAct}`);
record('R1-29', 'wrap-up present with 3-5 exercises', Boolean(r.payload?.sessionWrapUp && r.payload.sessionWrapUp.recallExercises?.length >= 3 && r.payload.sessionWrapUp.recallExercises?.length <= 5), `exercises=${r.payload?.sessionWrapUp?.recallExercises?.length}`);
record('R1-29', 'no practice task on wrap-up', r.payload?.task == null, `task=${JSON.stringify(r.payload?.task)}`);
turns.push({ role: 'user', text: 'saya selesai ya, tolong rangkum yang perlu saya ulang' });
turns.push({ role: 'assistant', text: `${r.payload?.answer || ''}\nTaught Chinese: ${(r.payload?.spokenChinese || []).map((s) => s.text).join('、')}` });

// —— R1-29 负例：真实跟读仍应识别为 PRACTICE（行为保持不变） ——
r = await ask('你好，欢迎光临。');
turns.push({ role: 'user', text: '（教师示范后跟读）你好，欢迎光临。' });
turns.push({ role: 'assistant', text: 'Contoh: 你好，欢迎光临。(nín hǎo, huān yíng guāng lín.) — sapaan kepada pelanggan yang baru masuk.' });
r = await ask('你好，欢迎光临。', turns.slice(-4));
record('R1-29-negative', 'genuine follow-read stays PRACTICE', r.payload?.learnerAct === 'PRACTICE', `learnerAct=${r.payload?.learnerAct}`);

// —— R1-28: 混合语言语义保真（引用片段逐字保留，不得拼接成新句） ——
r = await ask('老板 bilang 明天早点来, maksudnya apa dan saya jawab apa?');
const answer28 = String(r.payload?.answer || '');
record('R1-28', 'quotes fragment verbatim (明天早点来)', answer28.includes('明天早点来'), `has fragment=${answer28.includes('明天早点来')}`);
record('R1-28', 'no fused new sentence (老板明天)', !answer28.includes('老板明天'), `fused present=${answer28.includes('老板明天')}`);
record('R1-28', 'keeps reported speech (atasan/bos/bilang)', /bilang|kata|atasan|bos|老板说/i.test(answer28), `reported=${/bilang|kata|atasan|bos|老板说/i.test(answer28)}`);
const spoken28 = r.payload?.spokenChinese || [];
record('R1-28', 'gives a way to respond', /jawab|balas|katakan|ucap/i.test(answer28) || spoken28.some((s) => /reply|balas|respons/i.test(s.purpose)), `suggestedReply=${spoken28.find((s) => /reply|balas|respons/i.test(s.purpose))?.text || 'none in answer'}`);

// —— R1-05: 更难题必须与上一题比较且真的更难 ——
const state = { consecutiveFailures: 0, lastTeachingStrategy: 'MODEL', sameTaskRepeatCount: 1, lastTaskPrompt: '', weakExpressions: [], independentUses: [] };
r = await ask('tolong kasih saya satu soal terjemahan sederhana untuk kasir toko', [], state);
const firstTask = r.payload?.task?.prompt || '';
state.lastTaskPrompt = firstTask;
turns.push({ role: 'user', text: 'tolong kasih saya satu soal terjemahan sederhana untuk kasir toko' });
turns.push({ role: 'assistant', text: `${r.payload?.answer || ''}\nTask: ${firstTask}` });
r = await ask('kasih saya soal yang lebih sulit', turns.slice(-4), state);
const secondTask = r.payload?.task?.prompt || '';
const norm = (v) => String(v).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/gu, ' ').trim();
record('R1-05', 'new task given', Boolean(secondTask), `task=${secondTask.slice(0, 80)}`);
record('R1-05', 'different from previous task', Boolean(secondTask) && norm(secondTask) !== norm(firstTask) && !norm(secondTask).includes(norm(firstTask)), `first=${firstTask.slice(0, 60)} | second=${secondTask.slice(0, 60)}`);
record('R1-05', 'states what is harder', /(?:lebih|harder|sulitnya|lebih panjang|dua langkah|struktur)/i.test(String(r.payload?.answer)), `answer=${String(r.payload?.answer).slice(0, 120)}`);

const results = { baseUrl, executedAt: new Date().toISOString(), checks, allPassed: checks.every((c) => c.passed) };
const out = 'results/natural-fix-regression.json';
await writeFile(out, JSON.stringify(results, null, 2), 'utf8');
console.error(`\n${results.allPassed ? 'ALL PASS' : 'HAS FAILURES'} -> ${out} (${checks.filter((c) => c.passed).length}/${checks.length})`);
process.exit(results.allPassed ? 0 : 1);
