import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

const BASE = process.argv[2];
const OUT = process.argv[3] || 'results/native-coach-v1/regression.json';
const BYPASS = process.env.VERCEL_PROTECTION_BYPASS || '';
const OIDC = process.env.VERCEL_OIDC_TOKEN || '';
if (!BASE) {
  console.error('usage: node scripts/verify-native-coach-v1-live.mjs <baseUrl> [outFile]');
  process.exit(1);
}

const scenarios = [
  { id: 'S1', title: '中餐厅服务员', prompt: 'Bang aku mau kerja jadi waiter di resto Cina, mandarin nol besar nih wkwk. Bisa bikinin cara belajar yg cocok buat kerja?' },
  { id: 'S2', title: '工厂操作员', prompt: 'Pak aku operator mesin pabrik, bosku China. Tolong susunin latihan Mandarin biar ngerti instruksi mesin sama safety, jangan mulai dari salam doang ya.' },
  { id: 'S3', title: '中国老板的司机', prompt: 'Bro besok aku jadi sopir bos Chinese, bahasa Mandarin kacau banget. Yang penting bisa jemput di bandara dan ngobrol soal tujuan. Latih aku dong.' },
  { id: 'S4', title: '华人家庭保姆', prompt: 'Kak aku mau kerja jadi ART keluarga Chinese. Bantu dong belajar ngomong soal bersih-bersih, nyuci sama masak. Enaknya mulai dari mana?' },
  { id: 'S5', title: '便利店收银员', prompt: 'Aku kasir minimarket, kalo customer China nanya boleh bayar QRIS gimana jawabnya? Langsung roleplay aja deh, kamu jadi pembeli.' },
  { id: 'S6', title: '厨房工作人员', prompt: 'Mas aku keterima bantu dapur restoran Chinese, chefnya orang China, dia ngomong cepet banget. Boleh ajarin bahasa yang kepake buat kerja di dapur?' },
  { id: 'S7', title: '中印混合真实沟通', prompt: 'Bos bilang 明天早点来, maksudnya apaan sih? Kalo aku nggak bisa datang pagi jawab gimana yang sopan?' },
  { id: 'S8', title: '只想聊天', prompt: 'Eh jangan les dulu, aku lagi capek habis kerja. Temenin ngobrol santai aja pake Indo ya, boleh?' },
];

const followups = {
  S2: [
    'Waduh kepanjangan. Aku nggak suka hafalan. Langsung roleplay satu instruksi safety paling penting, satu-satu ya.',
    'Aku jawab: 我不知道，继续开机器。 Gimana? Aku masih bingung—jelasin lebih gampang, jangan tambah daftar.',
    "Aku jawab: 好的，我马上停机。 Sekarang jangan suruh ulang kalimat tadi lagi. Kasih instruksi berbeda: 'jangan sentuh mesin', satu saja.",
  ],
  S5: [
    '可以，用 QRIS。 Aku jawab gini benar nggak? Jangan puji dulu kalau ada yang salah.',
    'Sekarang QRIS gagal. Aku bilang: QRIS 坏了，你付现金吧。 Kedengaran sopan nggak? Lanjut roleplay, jangan kasih ceramah panjang.',
    'Pembeli marah dan bilang 太麻烦了！ Kamu jadi pembeli yang marah itu; aku mau coba menenangkan dengan kalimatku sendiri.',
  ],
  S8: [
    'Bos tadi ngomel, aku kesel banget. Jangan ngajarin Mandarin ya, cukup dengerin aja.',
    'Aku cuma salah taruh barang sedikit tapi dia bentak di depan orang. Malu banget. Kamu jangan tanya banyak dulu ya.',
    'Makasih. Yuk ganti topik total—menurutmu habis kerja enaknya makan apa yang hangat dan murah?',
  ],
};

const cookies = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, init = {}) {
  const headers = new Headers(init.headers || {});
  if (cookies.size) headers.set('cookie', [...cookies].map(([key, value]) => `${key}=${value}`).join('; '));
  if (BYPASS) headers.set('x-vercel-protection-bypass', BYPASS);
  if (OIDC) headers.set('x-vercel-trusted-oidc-idp-token', OIDC);
  const response = await fetch(`${BASE}${path}`, { ...init, headers, redirect: 'manual' });
  for (const raw of response.headers.getSetCookie?.() || []) {
    const pair = raw.split(';', 1)[0];
    const index = pair.indexOf('=');
    if (index > 0) cookies.set(pair.slice(0, index), pair.slice(index + 1));
  }
  return response;
}

async function startGuest() {
  const response = await request('/api/guest/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ remember: true, next: '/coba-gratis/native-coach-v1' }),
  });
  return { status: response.status, payload: await response.json().catch(() => null) };
}

async function askOnce(message, sessionId, recentTurns) {
  const started = performance.now();
  const response = await request('/api/mandarin-coach/native-coach-v1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, sessionId, recentTurns }),
  });
  const headersMs = Math.round(performance.now() - started);
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !response.body || !contentType.includes('application/x-ndjson')) {
    return { status: response.status, headersMs, error: await response.text(), events: [] };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const events = [];
  let buffer = '';
  let firstTextMs = null;
  let streamedText = '';
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      const item = JSON.parse(line);
      events.push(item);
      if (item.type === 'text-delta') {
        firstTextMs ??= Math.round(performance.now() - started);
        streamedText += item.text || '';
      }
      if (item.type === 'replace-text') streamedText = item.text || '';
    }
    if (done) break;
  }
  if (buffer.trim()) events.push(JSON.parse(buffer));
  const complete = events.findLast((item) => item.type === 'complete') || null;
  const streamError = events.findLast((item) => item.type === 'error') || null;
  return {
    status: response.status,
    headersMs,
    firstTextMs,
    clientFullMs: Math.round(performance.now() - started),
    streamedText,
    complete,
    streamError,
    events,
  };
}

async function ask(message, sessionId, recentTurns) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const result = await askOnce(message, sessionId, recentTurns);
    const retryable = result.status === 429 || result.status === 503 || result.streamError?.retryable;
    if (!retryable || attempt === 2) return { ...result, attempts: attempt };
    await sleep(result.status === 429 ? 65_000 : 12_000);
  }
}

function percentile(values, quantile) {
  const sorted = values.filter((value) => Number.isFinite(value)).toSorted((a, b) => a - b);
  if (!sorted.length) return null;
  return sorted[Math.ceil(sorted.length * quantile) - 1];
}

function hasToneMarks(value) {
  return /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜǹńň]/u.test(value) && !/[0-9]/u.test(value);
}

function chineseOnly(value) {
  return /^[\u3400-\u9FFF\u3000-\u303F，。！？、；：“”‘’（）…·\s—–-]+$/u.test(value)
    && /[\u3400-\u9FFF]/u.test(value)
    && !/[A-Za-z]/u.test(value);
}

const checks = [];
function check(id, name, passed, evidence) {
  checks.push({ id, name, passed, evidence });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${id} ${name} :: ${String(evidence).slice(0, 260)}`);
}

const boot = await startGuest();
check('AUTH-1', 'guest session starts', boot.status === 200, `status=${boot.status}`);
if (boot.status !== 200) process.exitCode = 1;

const rows = [];
const firstById = new Map();
for (const scenario of scenarios) {
  const result = await ask(scenario.prompt, `free-native-v1-${scenario.id.toLowerCase()}`, []);
  const row = { kind: 'first-round', scenarioId: scenario.id, title: scenario.title, turn: 1, user: scenario.prompt, result };
  rows.push(row);
  firstById.set(scenario.id, row);
  const complete = result.complete;
  check(`${scenario.id}-HTTP`, 'stream completes', result.status === 200 && complete?.answer?.length > 10 && !result.streamError,
    `status=${result.status} first=${result.firstTextMs}ms full=${result.clientFullMs}ms chars=${complete?.answer?.length || 0}`);
  const normalize = (value) => String(value || '').replace(/\s+/gu, ' ').trim();
  check(`${scenario.id}-STREAM`, 'stream text matches final answer', normalize(result.streamedText) === normalize(complete?.answer),
    `stream=${result.streamedText?.length || 0} final=${complete?.answer?.length || 0}`);
  check(`${scenario.id}-BOUND`, 'answer is bounded and not truncated', complete?.truncated === false && (complete?.usage?.token_output || 0) <= 900,
    `truncated=${complete?.truncated} output=${complete?.usage?.token_output}`);
  const spoken = complete?.spokenChinese || [];
  check(`${scenario.id}-ZH`, 'all marked Chinese has pinyin, meaning, and zh-CN-safe text', spoken.every((item) => chineseOnly(item.text) && hasToneMarks(item.pinyin) && item.indonesian?.length > 2),
    spoken.map((item) => `${item.text}|${item.pinyin}|${item.indonesian}`).join(' ; ') || 'no marked Chinese');
  if (['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'].includes(scenario.id)) {
    check(`${scenario.id}-PRACTICAL`, 'practical work request includes a playable Chinese sentence', spoken.length > 0,
      spoken.map((item) => item.text).join('、') || 'none');
  }
  await sleep(13_000);
}

const s1 = firstById.get('S1')?.result.complete;
const s1Spoken = s1?.spokenChinese || [];
check('S1-INTENT', 'waiter request gets job-specific plan, not greeting drill',
  /(resto|restoran|waiter|pelayan)/iu.test(s1?.answer || '')
    && /(fokus|langkah|tahap|rencana|cara belajar)/iu.test(s1?.answer || '')
    && !s1Spoken.every((item) => /^(?:你|您)好[！。]?|^欢迎光临[！。]?$/u.test(item.text.trim())),
  (s1?.answer || '').slice(0, 300));
const s5 = firstById.get('S5')?.result.complete;
check('S5-ROLE', 'QRIS request enters buyer roleplay',
  /(pembeli|customer|顾客|可以吗|扫码)/iu.test(`${s5?.answer || ''} ${(s5?.spokenChinese || []).map((item) => item.text).join(' ')}`),
  (s5?.answer || '').slice(0, 300));
const s8 = firstById.get('S8')?.result.complete;
check('S8-CHAT', 'no-lesson request stays conversational without Chinese task',
  (s8?.spokenChinese || []).length === 0 && !/(latihan|ulangi|terjemahkan|tes\b)/iu.test(s8?.answer || ''),
  (s8?.answer || '').slice(0, 300));

for (const scenarioId of ['S2', 'S5', 'S8']) {
  const scenario = scenarios.find((item) => item.id === scenarioId);
  const seed = firstById.get(scenarioId)?.result.complete;
  const history = [
    { role: 'user', text: scenario.prompt },
    { role: 'assistant', text: seed?.answer || '' },
  ];
  let turn = 1;
  for (const user of followups[scenarioId]) {
    turn += 1;
    const result = await ask(user, `free-native-v1-${scenarioId.toLowerCase()}`, history);
    rows.push({ kind: 'conversation', scenarioId, title: scenario.title, turn, user, result });
    const complete = result.complete;
    check(`${scenarioId}-T${turn}`, 'multi-turn response completes', result.status === 200 && complete?.answer?.length > 5 && !result.streamError,
      `first=${result.firstTextMs}ms full=${result.clientFullMs}ms :: ${(complete?.answer || '').slice(0, 180)}`);
    history.push({ role: 'user', text: user }, { role: 'assistant', text: complete?.answer || '' });
    await sleep(13_000);
  }
}

const s2t3 = rows.find((row) => row.scenarioId === 'S2' && row.turn === 3)?.result.complete;
check('S2-CORRECT', 'unsafe wrong answer is corrected without accepting it',
  /(bahaya|jangan|salah|hentikan|stop|停)/iu.test(s2t3?.answer || '') && !/(benar sekali|sempurna)/iu.test(s2t3?.answer || ''),
  (s2t3?.answer || '').slice(0, 300));
const s2t4 = rows.find((row) => row.scenarioId === 'S2' && row.turn === 4)?.result.complete;
check('S2-SWITCH', 'learner can switch to one different safety instruction',
  /(jangan sentuh|不要碰|不要触摸)/iu.test(`${s2t4?.answer || ''} ${(s2t4?.spokenChinese || []).map((item) => item.text).join(' ')}`),
  (s2t4?.answer || '').slice(0, 300));
const s5t3 = rows.find((row) => row.scenarioId === 'S5' && row.turn === 3)?.result.complete;
check('S5-CORRECT', 'requested Mandarin correction remains Mandarin and playable',
  (s5t3?.spokenChinese || []).length > 0,
  (s5t3?.answer || '').slice(0, 300));
const s5t4 = rows.find((row) => row.scenarioId === 'S5' && row.turn === 4)?.result.complete;
check('S5-ROLE-CONTEXT', 'latest angry-buyer roleplay is preserved',
  /太麻烦了/u.test(`${s5t4?.answer || ''} ${(s5t4?.spokenChinese || []).map((item) => item.text).join(' ')}`),
  (s5t4?.answer || '').slice(0, 300));
const s8Turns = rows.filter((row) => row.scenarioId === 'S8').map((row) => row.result.complete);
check('S8-CONTEXT', 'three follow-ups stay out of forced teaching and accept topic switch',
  s8Turns.every((item) => (item?.spokenChinese || []).length === 0)
    && /(bakso|soto|mie|sup|bubur|makanan)/iu.test(s8Turns.at(-1)?.answer || ''),
  (s8Turns.at(-1)?.answer || '').slice(0, 300));

const ttsCases = [];
const ttsCandidates = rows.flatMap((row) => (row.result.complete?.spokenChinese || []).map((item) => ({ row, item }))).slice(0, 3);
for (const candidate of ttsCandidates) {
  const started = performance.now();
  const response = await request('/api/chinese-tts', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: candidate.item.text, rate: 'normal' }),
  });
  const audio = await response.arrayBuffer();
  const readyMs = Math.round(performance.now() - started);
  const item = {
    text: candidate.item.text,
    scenarioId: candidate.row.scenarioId,
    status: response.status,
    readyMs,
    endToEndReadyMs: (candidate.row.result.clientFullMs || 0) + readyMs,
    bytes: audio.byteLength,
    contentType: response.headers.get('content-type'),
    voice: response.headers.get('X-IndoBrain-Chinese-TTS-Voice'),
    cache: response.headers.get('X-IndoBrain-TTS-Cache'),
    billableCharacters: Number(response.headers.get('X-IndoBrain-TTS-Billable-Characters') || 0),
  };
  ttsCases.push(item);
  check(`TTS-${ttsCases.length}`, 'marked Chinese returns real zh-CN audio',
    item.status === 200 && item.bytes > 1_000 && item.contentType === 'audio/mpeg' && item.voice === 'zh-CN-XiaoxiaoNeural',
    `status=${item.status} bytes=${item.bytes} voice=${item.voice} ready=${item.readyMs}ms cache=${item.cache}`);
}

for (const [id, text] of [['PINYIN', 'nǐ hǎo'], ['INDO', 'boleh bayar QRIS'], ['MIXED', '可以 pakai QRIS']]) {
  const response = await request('/api/chinese-tts', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }),
  });
  check(`TTS-REJECT-${id}`, `${id.toLowerCase()} is rejected by zh-CN TTS`, response.status === 400, `status=${response.status}`);
}

const successful = rows.filter((row) => row.result.complete);
const firstText = successful.map((row) => row.result.firstTextMs);
const fullResponse = successful.map((row) => row.result.clientFullMs);
const modelFirst = successful.map((row) => row.result.complete.performance?.modelTimeToFirstOutputMs);
const audioReady = ttsCases.map((item) => item.readyMs);
const performanceSummary = {
  calls: successful.length,
  firstTextMs: { p50: percentile(firstText, 0.5), p95: percentile(firstText, 0.95) },
  fullResponseMs: { p50: percentile(fullResponse, 0.5), p95: percentile(fullResponse, 0.95) },
  modelFirstOutputMs: { p50: percentile(modelFirst, 0.5), p95: percentile(modelFirst, 0.95) },
  audioReadyMs: { p50: percentile(audioReady, 0.5), p95: percentile(audioReady, 0.95) },
};
const usage = successful.reduce((total, row) => {
  const current = row.result.complete.usage;
  total.inputTokens += current.token_input || 0;
  total.outputTokens += current.token_output || 0;
  total.costUsd += current.estimated_ai_cost || 0;
  return total;
}, { inputTokens: 0, outputTokens: 0, costUsd: 0 });
usage.costUsd = Number(usage.costUsd.toFixed(6));

const output = {
  experiment: 'NATIVE_COACH_V1',
  baseUrl: BASE,
  executedAt: new Date().toISOString(),
  model: successful[0]?.result.complete?.usage?.model_used || null,
  settings: { callsPlanned: 17, responseProtocol: 'NDJSON streaming', ttsPolicy: 'explicit validated Chinese only' },
  checks: { total: checks.length, passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length },
  performance: performanceSummary,
  usage,
  ttsCases,
  details: checks,
  rows,
};
mkdirSync(OUT.replace(/[\\/][^\\/]+$/u, ''), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`\n${output.checks.passed}/${output.checks.total} checks passed`);
console.log(JSON.stringify({ performance: output.performance, usage: output.usage }, null, 2));
console.log(`written: ${OUT}`);
if (output.checks.failed) process.exitCode = 1;
