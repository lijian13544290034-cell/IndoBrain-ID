// Codex 审查的 5 项 P0 验收（本地纯逻辑 + Preview 端到端双模式）
// 用法：
//   node scripts/verify-p0-codex-review.mjs local
//   node scripts/verify-p0-codex-review.mjs preview https://<deployment>
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const MODE = process.argv[2] || 'local';
const DEPLOY = process.argv[3] || '';
const OUT = process.argv[4] || 'results/p0-codex-review.json';
const root = 'C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration';
const tmp = path.join(root, '.tmp-p0');
const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
};

function buildOfflineFixtures() {
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const strip = (src) => src.replace("import 'server-only';", '').replace(/from '@\/lib[^']*'/g, "from './stub.ts'");
  writeFileSync(path.join(tmp, 'mc.ts'), strip(readFileSync(path.join(root, 'lib/server/mandarin-mini-course.ts'), 'utf8')));
  writeFileSync(path.join(tmp, 'guard.ts'), strip(readFileSync(path.join(root, 'lib/teaching-intent-guard.ts'), 'utf8')));
  const active = readFileSync(path.join(root, 'lib/server/teaching-engine-active.ts'), 'utf8')
    .replace("import 'server-only';", '')
    .replace(/import \{ orchestrateTeachingTurn \}[^;]*;/, 'const orchestrateTeachingTurn = (x) => x;')
    .replace(/from '@\/lib\/teaching-engine\/[^']*'/g, "from './stub.ts'")
    .replace(/from '@\/lib\/teaching-intent-guard'/, "from './guard.ts'");
  writeFileSync(path.join(tmp, 'active.ts'), active);
  writeFileSync(path.join(tmp, 'stub.ts'), `
export type LearningDirection = string;
export type PromptLevel = string;
export type TeachingStage = string;
export type TechnicalFailureReason = string;
export type TeachingTurnKind = string;
export type ActiveOutcome = string;
export type ActiveTeachingSession = any;
export type HintType = string;
export type TeachingTurnTelemetry = any;
export function assertTeachingTelemetryInvariant() {}
export function teachingIntentGuardReply(_d: any, v: any) { return { answer: 'guard-' + v, teachingStrategy: 'GUARD' }; }
`);
}

async function runLocal() {
  buildOfflineFixtures();
  const script = `
import { looksLikeAttempt } from './mc.ts';
import { runActiveTeachingTurn as run } from './active.ts';

const out = { p1: [], p2: [], p3: [], p4: [], p5: [] };

// P0-1 短中文问句不得被判为练习
const questions = ['分酒器是啥', '这是啥', '啥意思', '那个呢', '几点下班', '为啥', '这个怎么读', '请问洗手间在哪', '这是几个'];
const attempts = ['欢迎光临', 'huān yíng guāng lín', '几位', 'wǒ míng tiān shàng bān'];
for (const q of questions) out.p1.push({ text: q, attempt: looksLikeAttempt(q), expect: 'NOT_ATTEMPT' });
for (const q of attempts) out.p1.push({ text: q, attempt: looksLikeAttempt(q), expect: 'ATTEMPT' });

// P0-2 / P0-4 主动教学：提问不评分、目标与评分一致
const b = { requestId: 'r', lessonId: 'mandarin-work-level-1-day-27', modality: 'TEXT', sessionKey: 'kb-' + Date.now() };
let r = run({ ...b, message: 'mulai', startRequested: true, sessionToken: null });
r = run({ ...b, message: 'saya besok kerja', startRequested: false, sessionToken: r.sessionToken });
for (const q of ['分酒器是啥', '那个呢', '这个怎么读']) {
  const o = run({ ...b, message: q, startRequested: false, sessionToken: r.sessionToken });
  out.p2.push({ ask: q, strategy: o.response.teachingStrategy, outcome: o.telemetry.evidence.outcome, recordsFailure: o.telemetry.next.recordsLearnerFailure, stage: o.telemetry.next.stage });
  r = o;
}
r = run({ ...b, message: '我明天上班', startRequested: false, sessionToken: r.sessionToken });
r = run({ ...b, message: '我明天上班', startRequested: false, sessionToken: r.sessionToken });
out.p4.push({ step: 'ADVANCE_TO_TRANSFER', shownTarget: r.response.targetChinese, stage: r.session.stage });
const t = run({ ...b, message: '我今天上班', startRequested: false, sessionToken: r.sessionToken });
out.p4.push({ step: 'TRANSFER_COMPLETE', shownTarget: t.response.targetChinese, outcome: t.telemetry.evidence.outcome, stage: t.session.stage });
out.p3.push({ hardcodedDefault: '我明天上班', note: '目标按阶段派生，不再固定' });

console.log(JSON.stringify(out));
`;
  writeFileSync(path.join(tmp, 'run.mjs'), script);
  const raw = execFileSync(process.execPath, ['--experimental-strip-types', path.join(tmp, 'run.mjs')], { encoding: 'utf8' });
  const data = JSON.parse(raw.slice(raw.lastIndexOf('\n{') + 1));

  // P0-1
  const p1bad = data.p1.filter((x) => (x.expect === 'NOT_ATTEMPT' && x.attempt) || (x.expect === 'ATTEMPT' && !x.attempt));
  check('P0-1 短中文问句不被判为练习，跟读仍判为练习', p1bad.length === 0,
    p1bad.length ? p1bad.map((x) => `${x.text}:${x.attempt}`).join(', ') : `${data.p1.length} 例全对`);

  // P0-2
  const p2bad = data.p2.filter((x) => x.recordsFailure || x.outcome !== 'NO_EVIDENCE' || x.stage !== 'SPEAK');
  check('P0-2 自由提问不被评分、不记失败、不推阶段', p2bad.length === 0,
    p2bad.length ? JSON.stringify(p2bad) : data.p2.map((x) => x.ask).join(' / '));
  check('P0-2b 提问回复走 ANSWER_THEN_RESUME', data.p2.every((x) => x.strategy === 'ANSWER_THEN_RESUME'),
    [...new Set(data.p2.map((x) => x.strategy))].join(','));

  // P0-3
  const activeSrc = readFileSync(path.join(root, 'lib/server/teaching-engine-active.ts'), 'utf8');
  const routeSrc = readFileSync(path.join(root, 'app/api/mandarin-coach/conversation/route.ts'), 'utf8');
  const routeHardcoded = /targetChinese:\s*activeTeaching[^,]*\?\s*'我明天上班'/.test(routeSrc);
  check('P0-3 路由不再硬编码目标「我明天上班」', !routeHardcoded, routeHardcoded ? 'route 仍有硬编码' : 'targetChinese 来自引擎');

  // P0-4
  const transfer = data.p4.find((x) => x.step === 'TRANSFER_COMPLETE');
  check('P0-4 显示目标与评分目标一致（TRANSFER 阶段=我今天上班）',
    transfer?.shownTarget === '我今天上班' && transfer?.outcome === 'INDEPENDENT_SUCCESS',
    JSON.stringify(transfer));

  // P0-5（正则定义在 mandarin-ai-coach.ts）
  const coachSrc = readFileSync(path.join(root, 'lib/server/mandarin-ai-coach.ts'), 'utf8');
  const JOB_CHANGE = coachSrc.match(/const JOB_CHANGE = (\/.*?\/[a-z]*);/s)?.[1];
  const QUESTION_LIKE = coachSrc.match(/const QUESTION_LIKE = (\/.*?\/[a-z]*);/s)?.[1];
  if (JOB_CHANGE && QUESTION_LIKE) {
    const re = (s) => new RegExp(s.slice(1, s.lastIndexOf('/')), s.slice(s.lastIndexOf('/') + 1));
    const jc = re(JOB_CHANGE);
    const ql = re(QUESTION_LIKE);
    const shouldSwitch = ['Saya sekarang kerja di gudang', 'saya pindah ke gudang', 'sekarang saya kerja di pabrik'];
    const mustNot = [
      'Saya kerja di restoran, ini 分酒器 bahasa Mandarin-nya apa?',
      'Di gudang kami pakai forklift, itu Mandarin-nya apa?',
      'pindah ke kantor, mulai kerja besok',
      'kalau saya kerja di gudang, bilangnya gimana?',
    ];
    const bad1 = shouldSwitch.filter((m) => !(jc.test(m) && !ql.test(m)));
    const bad2 = mustNot.filter((m) => jc.test(m) && !ql.test(m));
    check('P0-5 提问不重置课程/不切换教学目标', bad1.length === 0 && bad2.length === 0,
      [...bad1, ...bad2].join(' | ') || '换岗切换正常、提问不切换');
  } else {
    check('P0-5 提问不重置课程/不切换教学目标', false, '未找到 JOB_CHANGE / QUESTION_LIKE');
  }
}

async function runPreview() {
  const CLI = process.execPath;
  const CLI_JS = 'C:/Users/lijia/WorkBuddy/2026-10-18-21-29-22/.tools/vercel/node_modules/vercel/dist/vc.js';
  const send = (sid, message, extraCtx = {}) => {
    const ctx = JSON.stringify({
      lessonId: extraCtx.lessonId || 'mandarin-work-level-1-day-27', currentDay: 27, currentExpression: null, currentSkill: 'TEACH',
      conversationMode: 'COACH_CONVERSATION', userLevel: 'BEGINNER', learningGoal: '', recentMistakes: [], masteryState: [],
      reviewQueue: [], userInitiatedMemory: [], recentConversationSummary: '', recentTurns: [], messageCount: 1,
      miniCourse: extraCtx.miniCourse || null, ...(extraCtx.raw || {}),
    });
    const raw = execFileSync(CLI, [CLI_JS, 'curl', 'api/mandarin-coach/conversation', '--deployment', DEPLOY, '-s', '-X', 'POST',
      '-F', `sessionId=${sid}`, '-F', `message=${message}`, '-F', `context=${ctx}`], { encoding: 'utf8', env: { ...process.env, CI: '1' }, maxBuffer: 8 * 1024 * 1024 });
    return JSON.parse(raw.slice(raw.indexOf('{')));
  };
  const sid = `coach-p0r-${String(Date.now()).slice(-6)}`;
  // 只验证非主动教学路径（day-1 课程）里的提问不被判成练习
  const r1 = send(sid, 'Saya kerja di restoran, saya waiter.', { lessonId: 'mandarin-work-level-1-day-1', currentDay: 1 });
  check('Preview 开课', r1.chinese === '欢迎光临', `${r1.teachingStrategy} · ${r1.chinese}`);
  const r2 = send(sid, '分酒器是啥', { lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, miniCourse: r1.miniCourse });
  check('P0-1(Preview) 「分酒器是啥」不被判为跟读答错',
    r2.teachingStrategy !== 'MINI_COURSE_CORRECT' && r2.teachingStrategy !== 'MINI_COURSE_PASS',
    `${r2.teachingStrategy} · calls=${r2.usage?.model_calls} · ${(r2.answer || '').slice(0, 60)}`);
  const r3 = send(sid, '那个呢', { lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, miniCourse: r1.miniCourse });
  check('P0-1b(Preview) 「那个呢」不被判为跟读答错',
    r3.teachingStrategy !== 'MINI_COURSE_CORRECT', `${r3.teachingStrategy} · ${(r3.answer || '').slice(0, 60)}`);
  // 提问后 lanjut 仍应继续同一课程（目标未被重置为别的职业/别的句）
  const r4 = send(sid, 'lanjut', { lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, miniCourse: r1.miniCourse });
  check('P0-5(Preview) 提问后 lanjut 仍沿原课程推进',
    r4.teachingStrategy === 'MINI_COURSE_NEXT' && r4.miniCourse?.key === r1.miniCourse?.key,
    `${r4.teachingStrategy} · key=${r4.miniCourse?.key} · ${r4.chinese}`);
}

(MODE === 'preview' ? runPreview() : runLocal())
  .then(() => {
    const passed = checks.filter((c) => c.pass).length;
    writeFileSync(path.join(root, OUT), JSON.stringify({ mode: MODE, deploy: DEPLOY || null, passed, total: checks.length, checks }, null, 2));
    try { rmSync(tmp, { recursive: true, force: true }); } catch {}
    console.log(`\n${passed}/${checks.length} PASS · ${OUT}`);
    if (passed !== checks.length) process.exitCode = 1;
  })
  .catch((e) => { console.error('FATAL', e); process.exit(1); });
