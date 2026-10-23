// 任务 A：教学意图与课程状态一致性（离线，零模型调用）
// 用法：node --experimental-strip-types --import <hook> scripts/verify-teaching-intent-consistency.mjs
//
// 覆盖用户报告的 P0 缺陷：学生问词义时被强行切到不相关课程句教学。
// 断言的是「程序判定」这一层——它决定模型收到什么指令，是缺陷的根因所在。

const brain = await import('../lib/server/mandarin-coach-brain.ts');
const coach = await import('../lib/server/mandarin-ai-coach.ts');
const skill = await import('../lib/server/mandarin-teacher-skill.ts');

const checks = [];
function check(name, pass, detail = '') {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
}

// ── 1. 纯释义请求：必须判定为「只解释，不推进课程」 ──
// 这是 P0 缺陷的第一道闸门。若为 false，模型会被 courseFocus 强制换成课程句。
const explainCases = [
  ['分酒器是啥', '分酒器'],
  ['分酒器是啥意思', '分酒器'],
  ['库存是什么意思', '库存'],
  ['Apa arti 分酒器?', '分酒器'],
];
for (const [message, expectedTarget] of explainCases) {
  const plan = brain.routeCoachInput(message);
  check(
    `释义回合不得推进课程: 「${message}」`,
    plan.explanationOnly === true && plan.targetChinese === expectedTarget,
    `explanationOnly=${plan.explanationOnly} target=${JSON.stringify(plan.targetChinese)}`,
  );
}

// ── 2. 明确要学：必须不是 explanationOnly，且目标词就是那个词 ──
const learnCases = ['我想学习怎么介绍分酒器。', '我想学怎么介绍分酒器'];
for (const message of learnCases) {
  const plan = brain.routeCoachInput(message);
  check(
    `学习请求应可教学且目标词正确: 「${message}」`,
    plan.explanationOnly === false && plan.targetChinese === '分酒器',
    `explanationOnly=${plan.explanationOnly} target=${JSON.stringify(plan.targetChinese)}`,
  );
}

// ── 3. 目标词提取不得吞入疑问尾巴或学习框架 ──
const targetCases = [
  ['分酒器是啥', '分酒器'],
  ['库存是什么意思', '库存'],
  ['我想学习怎么介绍分酒器。', '分酒器'],
];
for (const [message, expected] of targetCases) {
  const plan = brain.routeCoachInput(message);
  check(`目标词提取: 「${message}」→ ${expected}`, plan.targetChinese === expected, JSON.stringify(plan.targetChinese));
}

// ── 4. system prompt：纯释义回合不得出现「teach it now」式强制推进 ──
const focus = { title: 'Kursus Restoran', day: 1, topic: 'Sapaan', target: '你想喝点什么？', pinyin: 'nǐ xiǎng hē diǎn shén me?', meaning: 'Mau minum apa?', position: '3/28' };
const lesson = { id: 'mandarin-work-level-1-day-27', title: 'Test', day: 1, scenario: 'restoran', expressions: [] };
const baseArgs = {
  courseLesson: lesson, currentExpression: null, currentSkill: 'TEACH', learningGoal: '', userLevel: 'beginner',
  masteryState: [], recentMistakes: [], reviewQueue: [], userInitiatedMemory: [], recentTurns: [], recentConversationSummary: '',
  sessionMemory: skill.emptyStudentSessionMemory(), courseFocus: focus, occupation: 'hospitality',
};
const explainSystem = skill.buildTeacherSkillSystem({ ...baseArgs, explanationOnly: true });
const teachSystem = skill.buildTeacherSkillSystem({ ...baseArgs, explanationOnly: false });
check(
  'system(释义回合) 显式禁止推进课程',
  /CONTEXT ONLY THIS TURN/.test(explainSystem) && /Do NOT teach/.test(explainSystem) && !/teach it now/.test(explainSystem),
  '含 CONTEXT ONLY + 不含 teach it now',
);
check(
  'system(释义回合) 保留课程位置以便继续',
  /Leave the course position unchanged/.test(explainSystem) && /resumes exactly here/.test(explainSystem),
);
check(
  'system(教学回合) 仍可教课程目标句',
  !/CONTEXT ONLY THIS TURN/.test(teachSystem) && teachSystem.includes(focus.target),
);
check(
  'system 通用规则含「学生问题优先」',
  /THE STUDENT'S QUESTION WINS/.test(explainSystem) && /ANSWER ONLY unless the learner asks to learn it/.test(explainSystem),
);

// ── 5. 继续课程的中文/印尼语指令都要能恢复原课程 ──
const continueMessages = ['继续刚才的课程。', '继续', '继续学习', '接着刚才的课', 'lanjut', 'lanjutkan', 'kembali ke pelajaran'];
const continueLesson = { id: 'l1', title: 'Kursus Restoran', expressions: [
  { id: 'e1', chinese: '你好', pinyin: 'nǐ hǎo', indonesian: 'halo' },
  { id: 'e2', chinese: '你想喝点什么？', pinyin: '', indonesian: '' },
] };
for (const message of continueMessages) {
  const ctx = coach.buildContinueContext?.(message, { courseLesson: continueLesson, currentExpression: 'e1' });
  // 通过公开行为验证：CONTINUE_COURSE 命中时 composeKnownCoachResponse 会返回 CONTINUE_NEXT_EXPRESSION。
  const plan = brain.routeCoachInput(message);
  const reply = brain.composeKnownCoachResponse(plan, [], ctx ?? null);
  check(
    `恢复课程指令可识别: 「${message}」`,
    Boolean(ctx && ctx.next && ctx.next.chinese === '你想喝点什么？') && Boolean(reply && reply.teachingStrategy === 'CONTINUE_NEXT_EXPRESSION'),
    ctx ? `next=${JSON.stringify(ctx.next?.chinese)} strategy=${reply?.teachingStrategy}` : 'continueContext=null',
  );
}

// ── 6. 「继续」不得被误判成释义 ──
const contPlan = brain.routeCoachInput('继续刚才的课程。');
check('「继续」不是释义回合', contPlan.explanationOnly === false, `explanationOnly=${contPlan.explanationOnly}`);

// ── 7. 模糊输入不得被判错，应交由模型理解 ──
for (const message of ['Bukan, maksud saya...', 'bukan itu', 'eh bukan']) {
  const plan = brain.routeCoachInput(message);
  check(
    `模糊澄清不作判断: 「${message}」`,
    plan.explanationOnly === false && !plan.learningIntents.includes('CORRECTION'),
    `intents=${plan.learningIntents.join('+')} explanationOnly=${plan.explanationOnly}`,
  );
}

// ── 8. 混合语言 / 中文 / 印尼语自由提问：都要进入释义而非强行教学 ──
const mixedQuestions = [
  ['分酒器怎么念', '读音请求不算释义，但也不能被强行推进课程'],
  ['apa itu 分酒器', '印尼语问词义'],
  ['分酒器 itu apa?', '混用'],
  ['库存 artinya apa', '印尼语问词义（无汉字尾巴）'],
];
for (const [message, note] of mixedQuestions) {
  const plan = brain.routeCoachInput(message);
  check(
    `混合语言提问可用: 「${message}」`,
    plan.offTopic === false && Boolean(plan.targetChinese),
    `${note} | target=${JSON.stringify(plan.targetChinese)} intents=${plan.learningIntents.join('+')}`,
  );
}

// ── 9. 学生回答的是「AI 新教的句子」而不是原课程句子时，不得判为课程答错 ──
// 程序层不得把「与课程目标不符」直接升级成 CORRECTION 教学指令。
const offCourseAttempts = ['分酒器是用来倒酒的', 'kù cún bù gòu', '这个分酒器很好用'];
for (const message of offCourseAttempts) {
  const plan = brain.routeCoachInput(message);
  check(
    `非课程回答不硬判错: 「${message}」`,
    !plan.learningIntents.includes('CORRECTION') || plan.explanationOnly === false,
    `intents=${plan.learningIntents.join('+')}`,
  );
}

// ── 10. 迷你课程「练习判断」不得抢走释义/学习请求 ──
// 真实 Preview 暴露的缺陷：分酒器是啥 被 MINI_COURSE_CORRECT 判成答错，
// 因为排除清单只有「什么」没有「啥」。
const mc = await import('../lib/server/mandarin-mini-course.ts');
const mustNotBeAttempt = [
  ['分酒器是啥', '释义请求（啥）'],
  ['分酒器是啥意思', '释义请求（是啥意思）'],
  ['库存是什么意思', '释义请求（什么）'],
  ['我想学习怎么介绍分酒器', '新学习目标'],
  ['我想学怎么介绍分酒器', '新学习目标（我想学）'],
  ['Bukan, maksud saya...', '印尼语纠正'],
];
for (const [message, note] of mustNotBeAttempt) {
  check(
    `练习判断不抢释义/学习请求: 「${message}」`,
    mc.looksLikeAttempt(message) === false,
    note,
  );
}
// 真正的跟读仍要能被识别，否则纠错能力会退化。
const mustBeAttempt = [
  ['欢迎光临', '跟读课程句'],
  ['几位', '跟读课程句'],
  ['huān yíng guāng lín', '拼音跟读'],
  // 含「是 / 用 / 点」等常见字的真课程句，不能因为放宽释义判断而失去评分能力。
  ['这是菜单', '含「是」的课程句'],
  ['我整理文件', '课程句'],
  ['请稍等', '课程句'],
];
for (const [message, note] of mustBeAttempt) {
  check(
    `真实跟读仍被识别: 「${message}」`,
    mc.looksLikeAttempt(message) === true,
    note,
  );
}

console.log(`\n结果: ${checks.filter((c) => c.pass).length}/${checks.length} 通过`);
const failed = checks.filter((c) => !c.pass);
if (failed.length) {
  console.log('失败项:');
  for (const item of failed) console.log(' -', item.name, item.detail);
  process.exitCode = 1;
}
