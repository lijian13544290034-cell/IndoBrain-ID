import { writeFileSync } from 'node:fs';

const BASE = process.argv[2];
const OUT = process.argv[3] || 'results/native-v2-product-test.json';
const BYPASS = process.env.VERCEL_PROTECTION_BYPASS || '';

if (!BASE) { console.error('usage: node verify-native-v2.mjs <baseUrl> [outFile]'); process.exit(1); }

const cookies = new Map();
async function call(path, init = {}) {
  const headers = new Headers(init.headers || {});
  if (cookies.size) headers.set('cookie', [...cookies].map(([k, v]) => `${k}=${v}`).join('; '));
  if (BYPASS) headers.set('x-vercel-protection-bypass', BYPASS);
  const response = await fetch(BASE + path, { ...init, headers, redirect: 'manual' });
  for (const raw of response.headers.getSetCookie?.() || []) {
    const pair = raw.split(';', 1)[0];
    const eq = pair.indexOf('=');
    if (eq > 0) cookies.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  return response;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SCENARIOS = [
  {
    id: 'S1-real-user-sentence',
    text: 'saya mau kerja di retoran china, tolong bantu buat les untuk saya, boelh ya',
    expectChinese: false,
    note: '真实用户原句（含拼写错误 retoran/boelh）；允许先给计划+追问岗位，不必立刻教中文',
  },
  { id: 'S2-factory-work', text: 'saya mau kerja di pabrik, tolong ajari saya Mandarin untuk kerja', expectChinese: true, note: '去工厂工作' },
  { id: 'S3-practice-now', text: 'saya mau langsung latihan ngobrol pakai Mandarin sama kamu', expectChinese: true, note: '直接练习中文' },
  { id: 'S4-reexplain', text: 'kemarin saya tidak paham, tolong jelaskan lagi pelan-pelan', expectChinese: true, note: '没听懂，继续解释' },
  { id: 'S5-ask-boss-leave', text: 'saya mau belajar cara minta izin ke bos China, gimana bilangnya', expectChinese: true, note: '跟中国老板请假' },
  { id: 'S6-no-lesson-chat', text: 'saya tidak mau les, ngobrol santai saja ya', expectChinese: false, note: '不想上课，随便聊' },
  { id: 'S7-followup-chain', text: 'kalau bos bilang "minggu depan kita lembur", saya harus jawab apa?', expectChinese: true, note: '连续追问（承接上轮）' },
  { id: 'S8-sudden-switch', text: 'oh iya, ganti topik ya — saya mau beli SIM card di China, bilangnya gimana', expectChinese: true, note: '突然换话题' },
  { id: 'S9-messy-input', text: 'bang gue mau tanya dong, 老板 bilang apa klo mau pulang cepet? makasih ya', expectChinese: true, note: '拼写错误/俚语/中印混合' },
];

function normalize(text) { return text.replace(/\s+/g, ' ').trim(); }
function toneMarksOk(pinyin) { return /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜǹńň]/u.test(pinyin) && !/[0-9]/.test(pinyin); }
function hanOnly(text) { return /^[\u3400-\u9FFF\u3000-\u303F，。！？、；：""''（）…·.\s—–-]+$/u.test(text) && /[\u3400-\u9FFF]/.test(text); }

async function withRetry(run, label) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let result;
    try {
      result = await run();
    } catch (error) {
      console.log(`  ! ${label} network error: ${error?.cause?.code || error?.message} (attempt ${attempt})`);
      if (attempt < 3) { await sleep(8000); continue; }
      return null;
    }
    if (result.status !== 429 && result.status !== 503) return result;
    console.log(`  ↻ ${label} HTTP ${result.status}, backoff 65s (attempt ${attempt})`);
    if (attempt < 3) await sleep(65000);
  }
  return null;
}

async function bootGuest() {
  const response = await call('/api/guest/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ remember: true, next: '/coba-gratis/native-chat' }),
  });
  return response.status;
}

const emptyState = { consecutiveFailures: 0, lastTeachingStrategy: '', sameTaskRepeatCount: 0, lastTaskPrompt: '', weakExpressions: [], independentUses: [] };

async function askNative(message, history) {
  const startedAt = Date.now();
  const outcome = await withRetry(async () => {
    const response = await call('/api/mandarin-coach/native-chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message, sessionId: 'free-native-v2-product-test', recentTurns: history.map((t) => ({ role: t.role, text: t.text })) }),
    });
    const payload = await response.json().catch(() => null);
    return { status: response.status, payload };
  }, 'B');
  return { status: outcome?.status || 0, payload: outcome?.payload || null, latencyMs: Date.now() - startedAt };
}

async function askNatural(message, history) {
  const startedAt = Date.now();
  const outcome = await withRetry(async () => {
    const response = await call('/api/mandarin-coach/free-teaching', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message, sessionId: 'free-native-v2-product-test', recentTurns: history.map((t) => ({ role: t.role, text: t.text })),
        contextSummary: '', modelTier: 'SMART', skillVersion: 'NATURAL_V1', coachingState: emptyState,
      }),
    });
    const payload = await response.json().catch(() => null);
    return { status: response.status, payload };
  }, 'A');
  return { status: outcome?.status || 0, payload: outcome?.payload || null, latencyMs: Date.now() - startedAt };
}

async function tts(text) {
  const response = await call('/api/chinese-tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, rate: 'normal' }) });
  const buffer = await response.arrayBuffer();
  return {
    status: response.status,
    contentType: response.headers.get('content-type'),
    bytes: buffer.byteLength,
    cache: response.headers.get('X-IndoBrain-TTS-Cache'),
    voice: response.headers.get('X-IndoBrain-Chinese-TTS-Voice'),
    billableCharacters: response.headers.get('X-IndoBrain-TTS-Billable-Characters'),
  };
}

const bootStatus = await bootGuest();
console.log('guest session:', bootStatus);
if (bootStatus !== 200) { console.error('cannot start guest session'); process.exit(1); }

const checks = [];
const record = (id, name, passed, detail) => {
  checks.push({ id, name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${id} ${name} :: ${detail}`);
};

const rows = [];
const history = [];
for (const scenario of SCENARIOS) {
  const before = history.slice(-8);
  const b = await askNative(scenario.text, before);
  const bItems = b.payload?.spokenChinese || [];
  const a = await askNatural(scenario.text, before);

  const row = {
    id: scenario.id, note: scenario.note, input: scenario.text,
    B: { status: b.status, answer: b.payload?.answer || b.payload?.error || '', spokenChinese: bItems, latencyMs: b.latencyMs, usage: b.payload?.usage || null, tts: b.payload?.tts || null },
    A: { status: a.status, answer: a.payload?.answer || a.payload?.error || '', spokenChinese: a.payload?.spokenChinese || [], learnerAct: a.payload?.learnerAct || null, teachingStrategy: a.payload?.teachingStrategy || null, latencyMs: a.latencyMs, usage: a.payload?.usage || null },
  };
  rows.push(row);

  record(scenario.id, 'B answered (HTTP 200, non-empty)', b.status === 200 && normalize(row.B.answer).length > 20, `status=${b.status} chars=${row.B.answer.length} latency=${b.latencyMs}ms`);
  record(scenario.id, 'B answer not truncated', b.payload?.truncated !== true, `truncated=${b.payload?.truncated} outTokens=${b.payload?.usage?.token_output}`);
  if (scenario.expectChinese) {
    record(scenario.id, 'B produced playable Chinese', bItems.length > 0, `count=${bItems.length}`);
  }
  const fourLayer = bItems.filter((item) => hanOnly(item.text) && toneMarksOk(item.pinyin) && item.indonesian.length > 2);
  record(scenario.id, 'B four layers complete (zh+pinyin+tone+arti)', bItems.length === 0 ? !scenario.expectChinese : fourLayer.length === bItems.length,
    `${fourLayer.length}/${bItems.length} :: ${bItems.map((i) => `${i.text}|${i.pinyin}|${i.indonesian.slice(0, 24)}`).join(' ; ').slice(0, 260)}`);
  if (bItems.length > 0) {
    record(scenario.id, 'B audio list detected', b.payload?.tts?.audioListFound === true, `found=${b.payload?.tts?.audioListFound}`);
  }

  history.push({ role: 'user', text: scenario.text }, { role: 'assistant', text: row.B.answer });
  await sleep(12000);
}

// —— 真实用户原句专项：不能机械跳到「你好、欢迎光临」——
const s1 = rows.find((row) => row.id === 'S1-real-user-sentence');
const s1Answer = s1.B.answer;
const s1FirstChinese = s1.B.spokenChinese[0]?.text || '';
record('S1-intent', 'understands work-in-Chinese-restaurant + lesson request',
  /(restoran|restaurant| kerja| pekerjaan)/i.test(s1Answer) && /(les|belajar|rencana|langkah|jadwal|kosakata)/i.test(s1Answer),
  s1Answer.slice(0, 200).replace(/\n/g, ' '));
record('S1-no-generic-greeting', 'does not open with 你好/欢迎光临 drill',
  !/^(你好|您好|欢迎光临)/u.test(s1FirstChinese) && !/(^|\n)\s*(你好|您好)[！!。.]/u.test(s1Answer.slice(0, 80)),
  `firstChinese="${s1FirstChinese}" head="${s1Answer.slice(0, 60).replace(/\n/g, ' ')}"`);

// —— A/B 自然度对照（同一模型、同一输入）——
record('AB-both-answered', 'A and B both answered all 9 scenarios',
  rows.every((row) => row.B.status === 200 && row.A.status === 200),
  rows.map((row) => `${row.id}:A${row.A.status}/B${row.B.status}`).join(' '));

// —— 四层完整性（全量聚合）——
const allItems = rows.flatMap((row) => row.B.spokenChinese);
const withChineseTurns = rows.filter((row) => row.B.spokenChinese.length > 0).length;
record('AGG-chinese-coverage', 'most turns produced playable Chinese', withChineseTurns >= 6, `${withChineseTurns}/9 turns`);
record('AGG-pinyin', 'every sentence has tone-marked pinyin', allItems.length > 0 && allItems.every((item) => toneMarksOk(item.pinyin)), `${allItems.filter((item) => toneMarksOk(item.pinyin)).length}/${allItems.length}`);
record('AGG-meaning', 'every sentence has Indonesian meaning', allItems.length > 0 && allItems.every((item) => item.indonesian.length > 2), `${allItems.filter((item) => item.indonesian.length > 2).length}/${allItems.length}`);
record('AGG-zh-only', 'every sentence is Simplified Chinese only', allItems.every((item) => hanOnly(item.text)), `${allItems.filter((item) => hanOnly(item.text)).length}/${allItems.length}`);

// —— TTS：播放与不播放 ——
const ttsCases = [];
const firstChinese = rows.flatMap((row) => row.B.spokenChinese).find((item) => item.text.length >= 3);
if (firstChinese) {
  const ok = await tts(firstChinese.text);
  ttsCases.push({ kind: 'success', text: firstChinese.text, ...ok, expected: '200 audio' });
  record('TTS-1', 'pure Chinese sentence plays', ok.status === 200 && ok.contentType === 'audio/mpeg' && ok.bytes > 1000, `status=${ok.status} bytes=${ok.bytes} cache=${ok.cache}`);
}
const mixedScenario = rows.find((row) => /[A-Za-z]/.test(row.B.answer) && row.B.spokenChinese.length);
if (mixedScenario) {
  const sentence = mixedScenario.B.spokenChinese[0].text;
  const ok = await tts(sentence);
  ttsCases.push({ kind: 'success-mixed-context', text: sentence, ...ok, expected: '200 audio', sourceScenario: mixedScenario.id });
  record('TTS-2', 'Chinese extracted from mixed id/zh answer plays', ok.status === 200 && hanOnly(sentence), `status=${ok.status} text="${sentence}"`);
}
for (const [name, text] of [
  ['TTS-3 pinyin only rejected', 'lǎo bǎn, wǒ míngtiān xiǎng qǐngjià'],
  ['TTS-4 Indonesian only rejected', 'Bos, saya mau minta izin besok.'],
  ['TTS-5 mixed latin+han rejected', '老板 hello'],
  ['TTS-6 over-120-chars rejected', '你好'.repeat(70)],
]) {
  const bad = await tts(text);
  ttsCases.push({ kind: 'failure', text: text.slice(0, 40), ...bad, expected: '400' });
  record(name.split(' ')[0], name.slice(name.indexOf(' ') + 1), bad.status === 400, `status=${bad.status} bytes=${bad.bytes}`);
}

const sum = (rowsToSum, pick) => rowsToSum.reduce((total, row) => total + (pick(row) || 0), 0);
const bCost = sum(rows, (row) => row.B.usage?.estimated_ai_cost);
const aCost = sum(rows, (row) => row.A.usage?.estimated_ai_cost);
const bTokens = sum(rows, (row) => (row.B.usage?.token_input || 0) + (row.B.usage?.token_output || 0));
const aTokens = sum(rows, (row) => (row.A.usage?.token_input || 0) + (row.A.usage?.token_output || 0));
const bLatency = Math.round(sum(rows, (row) => row.B.latencyMs) / rows.length);
const aLatency = Math.round(sum(rows, (row) => row.A.latencyMs) / rows.length);

const passedCount = checks.filter((check) => check.passed).length;
const result = {
  experiment: 'FREE_MODEL_NATIVE_V2',
  baseUrl: BASE,
  executedAt: new Date().toISOString(),
  model: rows[0]?.B.usage?.model_used || rows[0]?.A.usage?.model_used || 'unknown',
  scenarios: rows.length,
  checks: { total: checks.length, passed: passedCount, failed: checks.length - passedCount },
  cost: {
    B: { totalUsd: Number(bCost.toFixed(4)), tokens: bTokens, avgLatencyMs: bLatency },
    A: { totalUsd: Number(aCost.toFixed(4)), tokens: aTokens, avgLatencyMs: aLatency },
    note: '9 个相同输入的独立请求；B 为自由文本单次调用，A 为结构化教学调用',
  },
  rows,
  ttsCases,
  details: checks,
};

writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8');
console.log(`\n== ${passedCount}/${checks.length} checks passed ==`);
console.log(`cost B=$${result.cost.B.totalUsd} A=$${result.cost.A.totalUsd} | tokens B=${bTokens} A=${aTokens} | latency B=${bLatency}ms A=${aLatency}ms`);
console.log(`written: ${OUT}`);
