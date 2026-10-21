// Preview 真实模型自然教学验收：餐厅 11 轮 + 仓库 10 轮（走真实 LLM，非规则）
// 通过 vercel curl 绕过 Deployment Protection；不打印任何密钥。
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const CLI = process.execPath;
const CLI_JS = 'C:/Users/lijia/WorkBuddy/2026-10-18-21-29-22/.tools/vercel/node_modules/vercel/dist/vc.js';
const DEPLOY = process.argv[2] || 'https://indobrain-01-prd-prd-v0-1-h4r0c8b3i-lijian1.vercel.app';
const OUT = process.argv[3] || 'results/preview-natural-teaching.json';
const WHICH = process.argv[4] || 'both'; // resto | gudang | both

function makeSession(name) {
  const turns = [];
  const recentTurns = [];
  let messageCount = 0;
  let cursor = null;
  const SID = `coach-nat-${name}-${String(Date.now()).slice(-6)}`;
  function ctx() {
    return JSON.stringify({
      lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, currentExpression: null, currentSkill: 'TEACH',
      conversationMode: 'COACH_CONVERSATION', userLevel: 'BEGINNER', learningGoal: '', recentMistakes: [],
      masteryState: [], reviewQueue: [], userInitiatedMemory: [], recentConversationSummary: '',
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
      pinyin: body.pinyin, indonesian: body.indonesian, answer: body.answer, followUp: body.followUp,
      model: body.usage && body.usage.model_used, model_calls: body.usage && body.usage.model_calls,
      tokens: body.usage && [body.usage.token_input, body.usage.token_output], cost: body.usage && body.usage.estimated_ai_cost,
      skillGap: body.skillGap, miniCourse: body.miniCourse,
    };
    turns.push(record);
    recentTurns.push({ role: 'user', text: message });
    if (body.answer) recentTurns.push({ role: 'assistant', text: body.answer });
    cursor = body.miniCourse || cursor;
    console.log(`  #${record.turn} ${message.slice(0, 34)} → ${record.strategy} | ${record.chinese || '-'} | calls=${record.model_calls} ${record.model || ''} $${record.cost || 0}`);
    return record;
  }
  return { name, SID, turns, send };
}

const checks = [];
function check(name, pass, detail = '') {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
}

async function runRestaurant() {
  console.log('\n===== 餐厅服务员（11 轮真实模型）=====');
  const s = makeSession('resto');
  const t1 = s.send('Saya belum bisa bahasa Mandarin. Saya kerja di restoran, sering melayani tamu China. Saya mau belajar Mandarin supaya bisa melayani mereka dengan baik. Bisa ajarin saya dari nol?');
  check('A1 首轮直接职业教学（欢迎光临优先）', (t1.chinese || '').includes('欢迎光临') && !/Hari \d.*\n.*Hari \d/.test(t1.answer || ''), `${t1.strategy} · ${t1.chinese || t1.answer.slice(0, 60)}`);
  check('A1 非强制 7 天大纲', !/^Hari 7/m.test(t1.answer || ''), 'answer 无完整 7 天大纲');
  check('A1 教师自然邀请练习', /ucapkan|coba|praktik|giliran|latih/i.test((t1.followUp || '') + (t1.answer || '')), (t1.followUp || '').slice(0, 80));
  const t2 = s.send('huān yíng guāng lín');
  check('A2 拼音回答被理解', t2.strategy !== 'OFF_TOPIC', `${t2.strategy} · ${t2.chinese || ''} · ${(t2.answer || '').slice(0, 60)}`);
  const t3 = s.send('lanjut');
  check('A3 lanjut 推进教学', /lanjut|几位|jǐ wèi|berikut/i.test((t3.chinese || '') + (t3.answer || '')), `${t3.strategy} · ${t3.chinese || t3.answer.slice(0, 50)}`);
  const t4 = s.send('berapa orang?');
  check('A4 印尼语回答被理解', t4.strategy !== 'OFF_TOPIC', `${t4.strategy} · ${(t4.answer || '').slice(0, 60)}`);
  const t5 = s.send('tidak mengerti, boleh jelaskan lagi?');
  check('A5 tidak mengerti 被理解并重新解释', /各位|几位|jǐ wèi|berapa orang|berarti|artinya/i.test(t5.answer || ''), `${t5.strategy} · ${(t5.answer || '').slice(0, 70)}`);
  const t6 = s.send('lanjut');
  const t7 = s.send('kenapa harus pakai 您, bukan kamu?');
  check('A7 真模型课内答疑', (t7.model_calls || 0) >= 1, `calls=${t7.model_calls} ${t7.model} · ${(t7.answer || '').slice(0, 60)}`);
  const t8 = s.send('zhè biān qǐng');
  const t9 = s.send('lanjut');
  const t10 = s.send('zhe shi cai dan (salah ton ya?)');
  check('A10 带错的回答被纠错', /zhè|tÖn|nada|tone|bel|coba/i.test((t10.answer || '') + (t10.followUp || '')), `${t10.strategy} · ${(t10.answer || '').slice(0, 70)}`);
  const t11 = s.send('lanjut');
  return s;
}

async function runWarehouse() {
  console.log('\n===== 仓库员工（10 轮真实模型）=====');
  const s = makeSession('gudang');
  const t1 = s.send('Saya kerja di gudang perusahaan China. Bos saya sering tanya jumlah barang dan stok. Saya belum bisa Mandarin. Tolong ajarin saya.');
  check('B1 首轮直接教数量/库存表达', /有多少|库存|货到/.test(t1.chinese || '') && !/^Hari 7/m.test(t1.answer || ''), `${t1.strategy} · ${t1.chinese || t1.answer.slice(0, 60)}`);
  const t2 = s.send('yǒu duō shao?');
  check('B2 拼音回答被理解', t2.strategy !== 'OFF_TOPIC', `${t2.strategy} · ${(t2.answer || '').slice(0, 60)}`);
  const t3 = s.send('lanjut');
  const t4 = s.send('kù cún bú gòu');
  const t5 = s.send('artinya apa 货到了吗? masih belum paham');
  check('B5 tidak paham 被重新解释', /货到|huò dào|barang.*sampai|artinya/i.test(t5.answer || ''), `${t5.strategy} · ${(t5.answer || '').slice(0, 70)}`);
  const t6 = s.send('lanjut');
  const t7 = s.send('gimana cara tanya bos: stok cukup atau tidak?');
  check('B7 主动新问题被回应', (t7.model_calls || 0) >= 1 || /库存|cukup|不够|cukup/i.test(t7.answer || ''), `calls=${t7.model_calls} · ${t7.chinese || (t7.answer || '').slice(0, 60)}`);
  const t8 = s.send('jīn tiān chū huò');
  const t9 = s.send('lanjut');
  const t10 = s.send('qing dian yi xia');
  check('B10 无调拼音仍被评估', t10.strategy !== 'OFF_TOPIC', `${t10.strategy} · ${(t10.answer || '').slice(0, 60)}`);
  return s;
}

const sessions = [];
if (WHICH !== 'gudang') sessions.push(await runRestaurant());
if (WHICH !== 'resto') sessions.push(await runWarehouse());

const passed = checks.filter((c) => c.pass).length;
fs.mkdirSync('results', { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({
  run: String(Date.now()).slice(-6), deployment: DEPLOY, passed, total: checks.length, checks,
  sessions: sessions.map((s) => ({ name: s.name, sessionId: s.SID, turns: s.turns })),
}, null, 2));
console.log(`\n${passed}/${checks.length} PASS · ${OUT}`);
if (passed !== checks.length) process.exitCode = 1;
