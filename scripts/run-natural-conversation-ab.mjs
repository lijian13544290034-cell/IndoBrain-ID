import { readFile, writeFile } from 'node:fs/promises';

// HANDOFF VERSION (workbuddy/natural-conversation-ab-handoff, based on 9f3341f)
// 增强点（不改变原有请求协议与评分口径）：
//  1. 每组完成后立即落盘（含单臂完成即保存）
//  2. AB_RESUME_FILE 断点续跑：跳过有效 A/B 臂，仅补测缺失/失败臂
//  3. 保留原始回复：失败臂的旧结果移入 history[]，绝不覆盖有效数据
//  4. 单独记录 429 / 503 / 网络失败（errorLog + 每臂 attempts）
//  5. 每臂记录 executedAt 执行时间 + scriptVersion/实验配置
//  6. 限流：请求间隔默认 13s（≈4.6 req/min < Gemini 观察值 5/min）；
//     服务端 structured_retries 按 12s/次计入限流等待；429 额外退避 65s
const SCRIPT_VERSION = 'wb-handoff-1';
const SCENARIO_FILE = 'natural-conversation-round1-v1.json';

const baseUrl = process.argv[2]?.replace(/\/$/, '');
const outputPath = process.argv[3] || '';
const requestIntervalMs = Math.max(0, Number(process.env.AB_REQUEST_INTERVAL_MS) || 13_000);
const retryPenaltyMs = Math.max(0, Number(process.env.AB_RETRY_PENALTY_MS) || 12_000);
const maxAttempts = Math.max(1, Number(process.env.AB_MAX_ATTEMPTS) || 3);
const resumeFile = process.env.AB_RESUME_FILE || '';
const shareToken = process.env.VERCEL_SHARE_TOKEN || '';
const oidcToken = process.env.VERCEL_OIDC_TOKEN || '';
const protectionBypass = process.env.VERCEL_PROTECTION_BYPASS || '';
if (!baseUrl) throw new Error('Usage: node scripts/run-natural-conversation-ab.mjs <preview-url>');

const cases = JSON.parse(await readFile(new URL(`./data/${SCENARIO_FILE}`, import.meta.url), 'utf8'));

// —— 有效臂判定：HTTP 200 + 真实回答 + 模型与 token 记账齐全 ——
function isValidArm(arm) {
  return Boolean(
    arm &&
    arm.status === 200 &&
    typeof arm.answer === 'string' && arm.answer.trim().length > 0 &&
    arm.usage && typeof arm.usage.model_used === 'string' && arm.usage.model_used.trim() &&
    Number.isFinite(arm.usage.token_input) && Number.isFinite(arm.usage.token_output)
  );
}

async function loadResume() {
  if (!resumeFile) return { cases: [], errorLog: [] };
  try {
    const parsed = JSON.parse(await readFile(resumeFile, 'utf8'));
    const prior = Array.isArray(parsed.cases) ? parsed.cases : [];
    const byId = new Map(prior.map((row) => [row.id, row]));
    console.error(`Resume: loaded ${prior.length} prior case rows from ${resumeFile}`);
    const reusable = prior.filter((row) => isValidArm(row.A) && isValidArm(row.B)).length;
    console.error(`Resume: ${reusable} complete valid pairs will be skipped`);
    return { cases: prior, errorLog: Array.isArray(parsed.errorLog) ? parsed.errorLog : [] };
  } catch (error) {
    console.error(`Resume: could not load ${resumeFile} (${error.message}); starting fresh`);
    return { cases: [], errorLog: [] };
  }
}
const prior = await loadResume();
const priorById = new Map(prior.cases.map((row) => [row.id, row]));
const errorLog = prior.errorLog;

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
    if (oidcToken) headers.set('x-vercel-trusted-oidc-idp-token', oidcToken);
    if (protectionBypass) headers.set('x-vercel-protection-bypass', protectionBypass);
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers, redirect: 'manual' });
    remember(response);
    return response;
  };
}

async function prepare(client) {
  if (shareToken) {
    const access = await client(`/coba-gratis/ai-free-teaching?_vercel_share=${encodeURIComponent(shareToken)}`);
    if (![200, 307, 308].includes(access.status)) throw new Error(`Preview access failed: ${access.status}`);
  }
  const guest = await client('/api/guest/session', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ remember: true, next: '/coba-gratis/ai-free-teaching' }),
  });
  if (!guest.ok) throw new Error(`Guest session failed: ${guest.status} ${await guest.text()}`);
}

const clients = { A: createClient(), B: createClient() };
await prepare(clients.A);
await prepare(clients.B);
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// —— 失败分类：429 / 503 / 其他 HTTP / 网络异常 ——
function classify(error) {
  if (error?.network) return 'network';
  const status = error?.status;
  if (status === 429) return 'http_429';
  if (status === 503) return 'http_503';
  return status ? `http_${status}` : 'http_unknown';
}
function logError(id, arm, type, detail) {
  errorLog.push({ at: new Date().toISOString(), caseId: id, arm, type, detail: String(detail).slice(0, 300) });
  console.error(`[${type}] ${id}:${arm} ${detail}`);
}

async function callArm(variant, test) {
  const response = await clients[variant]('/api/mandarin-coach/free-teaching', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message: test.message,
      sessionId: `free-natural-ab-${variant.toLowerCase()}-${test.id.toLowerCase()}`,
      recentTurns: test.recentTurns || [],
      contextSummary: '',
      modelTier: 'SMART',
      skillVersion: variant === 'A' ? 'BASELINE' : 'NATURAL_V1',
      coachingState: test.coachingState || {},
    }),
  });
  const payload = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
  if (response.status !== 200) {
    const error = new Error(payload?.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

// —— 单臂执行：含 429/503/网络重试退避；structured_retries 计入限流 ——
async function runArm(variant, test) {
  const attempts = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const executedAt = new Date().toISOString();
    try {
      const payload = await callArm(variant, test);
      const arm = { status: 200, executedAt, attempt, ...payload };
      attempts.push(attempt);
      // 服务端内部结构化修复重试也占用 Gemini 限流额度，按 12s/次补偿等待
      const structuredRetries = Number(payload.usage?.structured_retries) || 0;
      if (requestIntervalMs) await wait(requestIntervalMs + structuredRetries * retryPenaltyMs);
      return arm;
    } catch (error) {
      const type = classify(error);
      logError(test.id, variant, type, error.message);
      attempts.push(attempt);
      if (attempt < maxAttempts) {
        const backoff = type === 'http_429' ? 65_000 : 20_000;
        console.error(`Retry ${attempt}/${maxAttempts} for ${test.id}:${variant} after ${backoff}ms`);
        await wait(backoff);
      } else if (requestIntervalMs) {
        await wait(requestIntervalMs);
      }
      if (attempt === maxAttempts) {
        return { status: error.status || 0, error: error.message, errorType: type, executedAt, attempts };
      }
    }
  }
}

async function save(rows) {
  if (!outputPath) return;
  const summary = totalsOf(rows);
  const report = {
    experiment: 'NATURAL_CONVERSATION_SKILL_V1',
    scriptVersion: SCRIPT_VERSION,
    scenarioFile: SCENARIO_FILE,
    baseUrl,
    modelTier: 'SMART',
    modelA: 'BASELINE (Free Teaching V1)',
    modelB: 'NATURAL_V1 (+ Natural Conversation Skill V1)',
    resumeFile: resumeFile || null,
    cases: rows,
    errorLog,
    totals: summary,
  };
  await writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8');
}

function totalsOf(rows) {
  const totals = (variant) => rows.reduce((total, row) => {
    const item = row[variant];
    if (isValidArm(item)) {
      total.successful += 1;
      total.tokens += (item.usage?.token_input || 0) + (item.usage?.token_output || 0);
      total.modelCalls += item.usage?.model_calls || 0;
      total.cost += item.usage?.estimated_ai_cost || 0;
      total.latencyMs += item.usage?.response_latency_ms || 0;
    }
    return total;
  }, { successful: 0, tokens: 0, modelCalls: 0, cost: 0, latencyMs: 0 });
  const summary = { A: totals('A'), B: totals('B') };
  for (const value of Object.values(summary)) {
    value.averageTokens = value.successful ? Math.round(value.tokens / value.successful) : 0;
    value.averageLatencyMs = value.successful ? Math.round(value.latencyMs / value.successful) : 0;
    value.projected20TurnCost = value.successful ? value.cost / value.successful * 20 : 0;
  }
  return summary;
}

// —— 主循环：跳过有效臂，仅补测缺失/失败臂；逐组即时落盘 ——
const results = [];
for (let index = 0; index < cases.length; index += 1) {
  const test = cases[index];
  const existing = priorById.get(test.id);
  const row = existing
    ? { ...existing, title: test.title, message: test.message }
    : { id: test.id, title: test.title, message: test.message };
  for (const variant of ['A', 'B']) {
    if (isValidArm(row[variant])) continue; // 已有真实数据，绝不覆盖
    if (row[variant]) {
      row.history = row.history || [];
      row.history.push({ variant, savedAt: new Date().toISOString(), previous: row[variant] });
    }
    row[variant] = await runArm(variant, test);
    await save([...results, row]); // 单臂完成立即落盘
  }
  results.push(row);
  const aOk = isValidArm(row.A) ? 'A✓' : 'A✗';
  const bOk = isValidArm(row.B) ? 'B✓' : 'B✗';
  console.error(`Completed ${index + 1}/${cases.length}: ${test.id} ${aOk}${bOk}`);
  await save([...results]);
}

await save(results);
const summary = totalsOf(results);
console.error(`Done. valid pairs: A=${summary.A.successful}/30 B=${summary.B.successful}/30; errors=${errorLog.length}`);
const report = { experiment: 'NATURAL_CONVERSATION_SKILL_V1', scriptVersion: SCRIPT_VERSION, scenarioFile: SCENARIO_FILE, baseUrl, modelTier: 'SMART', modelA: 'BASELINE (Free Teaching V1)', modelB: 'NATURAL_V1 (+ Natural Conversation Skill V1)', resumeFile: resumeFile || null, cases: results, errorLog, totals: summary };
if (outputPath) console.log(JSON.stringify({ ok: true, outputPath, totals: summary, errorCount: errorLog.length }));
else console.log(JSON.stringify(report, null, 2));
