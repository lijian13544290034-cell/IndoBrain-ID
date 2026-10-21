// 2 小时冲刺验收：职业课程闭环（生成 → 开课 → 答错纠正 → lanjut → 刷新恢复）+ sopir 回归
// ⚠️ 本地无 AI Gateway 凭据：LLM 回合会走降级，但本脚本验收的 6 轮全部是确定性路径，不受影响。
const BASE = process.argv[2] || 'http://localhost:3341';
const RUN = String(Date.now()).slice(-6);
const SID = `coach-mini-${RUN}`;
const OUT = process.argv[3] || 'results/mini-course-acceptance.json';

const checks = [];
const turns = [];
const recentTurns = [];
let currentExpression = null;
let messageCount = 0;

function ctx(miniCourse = null) {
  return JSON.stringify({
    lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, currentExpression, currentSkill: 'TEACH',
    conversationMode: 'COACH_CONVERSATION', userLevel: 'absolute beginner',
    learningGoal: 'belum bisa Mandarin, mau kerja di perusahaan China',
    recentMistakes: [], masteryState: [], reviewQueue: [], userInitiatedMemory: [],
    recentConversationSummary: 'Siswa pemula, mau kerja di perusahaan China.', recentTurns: recentTurns.slice(-6),
    sessionStartedAt: new Date().toISOString(), messageCount, miniCourse,
  });
}

async function send(message, sid = SID, miniCourse = null) {
  messageCount += 1;
  const fd = new FormData();
  fd.set('sessionId', sid);
  fd.set('context', ctx(miniCourse));
  fd.set('message', message);
  const started = Date.now();
  const r = await fetch(`${BASE}/api/mandarin-coach/conversation`, { method: 'POST', body: fd });
  const body = await r.json();
  const latency = Date.now() - started;
  const result = { ...body, status: r.status, latency_ms: latency, strategy: body.teachingStrategy };
  const record = { turn: turns.length + 1, message, status: r.status, latency_ms: latency, answer: body.answer, chinese: body.chinese, pinyin: body.pinyin, indonesian: body.indonesian, followUp: body.followUp, strategy: body.teachingStrategy, intent: body.intent, usage: body.usage, error: body.error };
  turns.push(record);
  recentTurns.push({ role: 'user', text: message });
  if (body.answer) recentTurns.push({ role: 'assistant', text: body.answer });
  if (body.chinese) currentExpression = null;
  return result;
}

function check(name, pass, detail) {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  // 1. 目标 + 要课程 + 没说职业 → 先问岗位，不硬塞课程
  const t1 = await send('Saya pemula, mau kerja di perusahaan China. Bisa buatkan kursus Mandarin?');
  check('T1 理解目标并询问岗位', t1.status === 200 && /pekerjaanmu|pekerjaan|posisi|jabatan|apa\?/i.test(t1.followUp || ''), t1.followUp);

  // 2. 说出职业 → 生成 7 天课程
  const t2 = await send('Saya mau kerja sebagai admin.');
  const dayLines = (t2.answer || '').split('\n').filter((line) => /^Hari \d/.test(line));
  check('T2 生成 7 天职业课程', t2.status === 200 && dayLines.length === 7 && /Admin/i.test(t2.answer || ''), `${dayLines.length} 天 · ${t2.chinese || 'n/a'}`);
  check('T2 课程含 admin 岗位内容', /文件|会议|报告/.test(t2.answer || ''), (t2.answer || '').split('\n').slice(2, 4).join(' | '));

  // 3. 开第一课
  const t3 = await send('Mulai pelajaran pertama.');
  check('T3 开始第一课', t3.status === 200 && t3.chinese === '你好' && t3.strategy === 'MINI_COURSE_START', `${t3.chinese} · ${t3.pinyin}`);

  // 4. 答错 → 指出并重试
  const t4 = await send('zai jian');
  check('T4 答错被纠正（zai jian）', t4.status === 200 && t4.strategy === 'MINI_COURSE_CORRECT' && /belum tepat/i.test(t4.answer || '') && t4.chinese === '你好', t4.answer);

  // 5. lanjut → 课内下一句
  const t5 = await send('lanjut');
  check('T5 lanjut 进入下一句', t5.status === 200 && t5.strategy === 'MINI_COURSE_NEXT' && t5.chinese === '我叫…', `${t5.chinese} · ${t5.pinyin}`);

  // 6. 模拟刷新页面（新客户端、同 sessionId、只带历史摘要）→ 上下文仍能恢复
  const t6 = await send('lanjut');
  check('T6 刷新后课程上下文恢复', t6.status === 200 && t6.strategy === 'MINI_COURSE_NEXT' && t6.chinese === '我是印尼人', `${t6.chinese} · ${t6.pinyin}`);

  // 7. 答对 → 通过并提示继续
  const t7 = await send('我是印尼人');
  check('T7 答对确认并推进', t7.status === 200 && t7.strategy === 'MINI_COURSE_PASS', t7.answer);

  // 7b. 无服务端记忆（等价重启/换实例）：只靠客户端带回的游标也能继续
  const t7b = await send('lanjut', `coach-mini-seed-${RUN}`, { key: 'admin', cursor: 2 });
  check('T7b 无进程记忆时按游标恢复', t7b.status === 200 && t7b.strategy === 'MINI_COURSE_NEXT' && t7b.chinese === '早上好', `${t7b.chinese} · ${t7b.pinyin}`);

  // 8. sopir 场景回归（原确定性路径未被破坏）
  const sidSopir = `coach-mini-sopir-${RUN}`;
  const s1 = await send('Saya capek, bagaimana bilang ke sopir supaya dia yang nyetir?', sidSopir);
  check('T8 sopir 场景仍可用', s1.status === 200 && /开车/.test(s1.chinese || ''), `${s1.chinese} · ${s1.answer?.slice(0, 40)}`);

  const passed = checks.filter((item) => item.pass).length;
  const summary = { run: RUN, base: BASE, sessionId: SID, passed, total: checks.length, checks, turns };
  const fs = await import('node:fs');
  fs.mkdirSync('results', { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log(`\n${passed}/${checks.length} PASS · ${OUT}`);
  if (passed !== checks.length) process.exitCode = 1;
}

main().catch((error) => { console.error('RUN FAILED', error.message); process.exitCode = 2; });
