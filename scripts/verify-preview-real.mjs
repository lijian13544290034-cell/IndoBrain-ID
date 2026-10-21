// Preview 真实模型验收：职业课程闭环 6 轮 + 课内自由提问（走真实 LLM）
// 通过 vercel curl 绕过 Deployment Protection；不打印任何密钥。
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const CLI = process.execPath;
const CLI_JS = 'C:/Users/lijia/WorkBuddy/2026-10-18-21-29-22/.tools/vercel/node_modules/vercel/dist/vc.js';
const DEPLOY = process.argv[2] || 'https://indobrain-01-prd-prd-v0-1-gf0p4s00p-lijian1.vercel.app';
const OUT = process.argv[3] || 'results/preview-real-model.json';
const RUN = String(Date.now()).slice(-6);
const SID = `coach-preview-${RUN}`;

const turns = [];
const recentTurns = [];
let messageCount = 0;
let cursor = null;
const checks = [];

function ctx() {
  return JSON.stringify({
    lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, currentExpression: null, currentSkill: 'TEACH',
    conversationMode: 'COACH_CONVERSATION', userLevel: 'absolute beginner',
    learningGoal: 'belum bisa Mandarin, mau kerja di perusahaan China',
    recentMistakes: [], masteryState: [], reviewQueue: [], userInitiatedMemory: [],
    recentConversationSummary: 'Siswa pemula, mau kerja di perusahaan China.',
    recentTurns: recentTurns.slice(-6), messageCount, miniCourse: cursor ? { key: cursor.key, cursor: cursor.cursor } : null,
  });
}

function send(message) {
  messageCount += 1;
  const args = [CLI_JS, 'curl', 'api/mandarin-coach/conversation', '--deployment', DEPLOY, '-s', '-X', 'POST',
    '-F', `sessionId=${SID}`, '-F', `message=${message}`, '-F', `context=${ctx()}`];
  const started = Date.now();
  const raw = execFileSync(CLI, args, { encoding: 'utf8', env: { ...process.env, CI: '1' }, maxBuffer: 8 * 1024 * 1024 });
  const json = raw.slice(raw.indexOf('{'));
  const body = JSON.parse(json);
  const latency = Date.now() - started;
  const record = {
    turn: turns.length + 1, message, latency_ms: latency, strategy: body.teachingStrategy, chinese: body.chinese,
    pinyin: body.pinyin, answer: body.answer, followUp: body.followUp, model: body.usage && body.usage.model_used,
    model_calls: body.usage && body.usage.model_calls, tokens: body.usage && [body.usage.token_input, body.usage.token_output],
    cost: body.usage && body.usage.estimated_ai_cost, skillGap: body.skillGap, miniCourse: body.miniCourse,
  };
  turns.push(record);
  recentTurns.push({ role: 'user', text: message });
  if (body.answer) recentTurns.push({ role: 'assistant', text: body.answer });
  cursor = body.miniCourse || cursor;
  console.log(`#${record.turn} ${message.slice(0, 32)} → ${record.strategy} | ${record.chinese || '-'} | model=${record.model_calls} ${record.model}`);
  return body;
}

function check(name, pass, detail = '') {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
}

const t1 = send('Saya pemula, mau kerja di perusahaan China. Bisa buatkan kursus Mandarin?');
check('T1 理解目标并询问岗位', /pekerjaanmu|posisi|jabatan/i.test(t1.followUp || ''), t1.followUp);

const t2 = send('Saya mau kerja sebagai admin.');
const dayLines = (t2.answer || '').split('\n').filter((l) => /^Hari \d/.test(l));
check('T2 生成 7 天职业课程', dayLines.length === 7 && /Admin/i.test(t2.answer || ''), `${dayLines.length} 天`);

const t3 = send('Mulai pelajaran pertama.');
check('T3 开始第一课', t3.chinese === '你好' && t3.teachingStrategy === 'MINI_COURSE_START', `${t3.chinese} · ${t3.pinyin}`);

const t4 = send('zai jian');
check('T4 答错被纠正', t4.teachingStrategy === 'MINI_COURSE_CORRECT' && /belum tepat/i.test(t4.answer || ''), t4.answer.slice(0, 60));

const t5 = send('lanjut');
check('T5 lanjut 进入下一句', t5.chinese === '我叫…' && t5.teachingStrategy === 'MINI_COURSE_NEXT', `${t5.chinese}`);

// 刷新：客户端带回游标，服务端进程可能无记忆
const t6 = send('lanjut');
check('T6 刷新后课程上下文恢复', t6.chinese === '我是印尼人' && t6.teachingStrategy === 'MINI_COURSE_NEXT', `${t6.chinese}`);

// 课内自由提问：必须由真实 LLM 回答，且带课程上下文
const t7 = send('为什么用 你好，不用 您好？');
check('T7 真实模型课内答疑', (t7.usage.model_calls || 0) >= 1 && /gemini/i.test(t7.usage.model_used || '') && t7.skillGap === false, `${t7.usage.model_used} · ${t7.usage.token_input}/${t7.usage.token_output} tok · $${t7.usage.estimated_ai_cost}`);

const passed = checks.filter((c) => c.pass).length;
fs.mkdirSync('results', { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ run: RUN, deployment: DEPLOY, sessionId: SID, passed, total: checks.length, checks, turns }, null, 2));
console.log(`\n${passed}/${checks.length} PASS · ${OUT}`);
if (passed !== checks.length) process.exitCode = 1;
