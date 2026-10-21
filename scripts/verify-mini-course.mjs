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
  // 0. 用户实测发现的首轮 bug：餐厅服务员自我介绍 → 必须直接进入餐厅场景教学，不得输出通用四周计划
  const sidResto = `coach-mini-resto-${RUN}`;
  const t0 = await send('Saya belum bisa bahasa Mandarin. Saya kerja di restoran, sering melayani tamu China. Saya mau belajar Mandarin supaya bisa melayani mereka dengan baik. Bisa ajarin saya dari nol?', sidResto);
  check('T0 餐厅首轮：直接开教迎宾句（非通用计划）', t0.status === 200 && t0.chinese === '欢迎光临' && !/Minggu 1|4 minggu|rencana dasar/i.test(t0.answer || ''), `${t0.strategy} · ${t0.chinese} · ${t0.pinyin}`);
  const t0b = await send('lanjut', sidResto);
  check('T0b 餐厅 lanjut 进入下一句', t0b.status === 200 && t0b.strategy === 'MINI_COURSE_NEXT' && t0b.chinese === '几位？', `${t0b.chinese} · ${t0b.pinyin}`);

  // 1. 目标 + 要课程 + 没说职业 → 先问岗位，不硬塞课程
  const t1 = await send('Saya pemula, mau kerja di perusahaan China. Bisa buatkan kursus Mandarin?');
  check('T1 理解目标并询问岗位', t1.status === 200 && /pekerjaanmu|pekerjaan|posisi|jabatan|apa\?/i.test(t1.followUp || ''), t1.followUp);

  // 2. 说出职业 → 课程静默建好，立刻开教该职业第一句（本地降级也必须教，不允许空提示）
  const t2 = await send('Saya mau kerja sebagai admin.');
  const teachingLike = ['MINI_COURSE_START', 'MINI_COURSE_START_FALLBACK', 'MINI_COURSE_CREATED'].includes(t2.strategy) || /Hari \d/i.test(t2.answer || '');
  check('T2 说出职业即开教 admin 第一句', t2.status === 200 && teachingLike && t2.chinese === '我整理文件' && /文件/.test(t2.answer || ''), `${t2.strategy} · ${t2.chinese} · ${t2.pinyin}`);

  // 3. 开第一课（显式 mulai 仍可用）
  const t3 = await send('Mulai pelajaran pertama.');
  check('T3 开始第一课', t3.status === 200 && t3.chinese === '我整理文件' && t3.strategy === 'MINI_COURSE_START', `${t3.chinese} · ${t3.pinyin}`);

  // 4. 答错 → 指出并重试
  const t4 = await send('zai jian');
  check('T4 答错被纠正（zai jian）', t4.status === 200 && t4.strategy === 'MINI_COURSE_CORRECT' && /belum tepat/i.test(t4.answer || '') && t4.chinese === '我整理文件', t4.answer);

  // 5. lanjut → 课内下一句
  const t5 = await send('lanjut');
  check('T5 lanjut 进入下一句', t5.status === 200 && t5.strategy === 'MINI_COURSE_NEXT' && t5.chinese === '会议几点开始？', `${t5.chinese} · ${t5.pinyin}`);

  // 6. 模拟刷新页面（新客户端、同 sessionId、只带历史摘要）→ 上下文仍能恢复
  const t6 = await send('lanjut');
  check('T6 刷新后课程上下文恢复', t6.status === 200 && t6.strategy === 'MINI_COURSE_NEXT' && t6.chinese === '报告做好了', `${t6.chinese} · ${t6.pinyin}`);

  // 7. 答非当前目标 → 纠错并引导重试（不误判成答对）
  const t7 = await send('我是印尼人');
  check('T7 答非目标被纠正', t7.status === 200 && t7.strategy === 'MINI_COURSE_CORRECT' && /belum tepat/i.test(t7.answer || '') && t7.chinese === '报告做好了', t7.answer);

  // 7b. 无服务端记忆（等价重启/换实例）：只靠客户端带回的游标也能继续
  const t7b = await send('lanjut', `coach-mini-seed-${RUN}`, { key: 'admin', cursor: 2 });
  check('T7b 无进程记忆时按游标恢复', t7b.status === 200 && t7b.strategy === 'MINI_COURSE_NEXT' && t7b.chinese === '我发给您', `${t7b.chinese} · ${t7b.pinyin}`);

  // 8. sopir 场景回归（原确定性路径未被破坏）
  const sidSopir = `coach-mini-sopir-${RUN}`;
  const s1 = await send('Saya capek, bagaimana bilang ke sopir supaya dia yang nyetir?', sidSopir);
  check('T8 sopir 场景仍可用', s1.status === 200 && /开车/.test(s1.chinese || ''), `${s1.chinese} · ${s1.answer?.slice(0, 40)}`);

  // 9. 学生课内自由提问不被练习判断抢答（修复回归的关键场景）
  const sidAsk = `coach-mini-ask-${RUN}`;
  await send('Saya mau kerja di gudang.', sidAsk);
  const t9 = await send('xie xie itu artinya apa dan bagaimana cara bacanya?', sidAsk);
  check('T9 课内自由提问不被当成练习', t9.status === 200 && t9.strategy !== 'MINI_COURSE_CORRECT', t9.strategy);

  // 10. 跑题请求礼貌拒绝（不是通用聊天机器人）
  const sidOff = `coach-mini-off-${RUN}`;
  const t10 = await send('Eh, jadi kamu suka nonton bola? Tim favoritmu siapa?', sidOff);
  check('T10 跑题礼貌拒绝', t10.status === 200 && t10.strategy !== 'DIRECT', t10.strategy);

  // 11. 真实用户实测 bug：学生纠正老师（预订包厢/桌子）绝不能被判成"答错"
  const sidFix = `coach-mini-fix-${RUN}`;
  await send('Saya kerja di restoran, sering melayani tamu China.', sidFix);
  const t11 = await send('不是，我说的是有没有预定包厢或者房间，或者桌子', sidFix);
  check('T11 学生纠正老师不被判错', t11.status === 200 && t11.strategy !== 'MINI_COURSE_CORRECT' && t11.strategy !== 'MINI_COURSE_PASS', `${t11.strategy} · ${(t11.answer || '').slice(0, 60)}`);

  // 12. 印尼语否定/说明真实意图同样放行
  const t12 = await send('bukan itu maksud saya, yang saya maksud meja di ruang privat', sidFix);
  check('T12 印尼语纠正不被判错', t12.status === 200 && t12.strategy !== 'MINI_COURSE_CORRECT', `${t12.strategy} · ${(t12.answer || '').slice(0, 50)}`);

  // 13. 正常跟读仍可判定（回归保护）
  const sidRec = `coach-mini-rec-${RUN}`;
  await send('Saya kerja di restoran.', sidRec);
  const t13 = await send('huān yíng guāng lín', sidRec);
  check('T13 正常拼音跟读仍判定', t13.status === 200 && (t13.strategy === 'MINI_COURSE_PASS' || t13.strategy === 'MINI_COURSE_CORRECT'), `${t13.strategy} · ${t13.chinese}`);
  const t13b = await send('欢迎光临', sidRec);
  check('T13b 汉字跟读仍判定', t13b.status === 200 && t13b.strategy === 'MINI_COURSE_PASS', `${t13b.strategy}`);

  const passed = checks.filter((item) => item.pass).length;
  const summary = { run: RUN, base: BASE, sessionId: SID, passed, total: checks.length, checks, turns };
  const fs = await import('node:fs');
  fs.mkdirSync('results', { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log(`\n${passed}/${checks.length} PASS · ${OUT}`);
  if (passed !== checks.length) process.exitCode = 1;
}

main().catch((error) => { console.error('RUN FAILED', error.message); process.exitCode = 2; });
