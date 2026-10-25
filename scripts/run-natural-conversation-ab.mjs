import { readFile } from 'node:fs/promises';

const baseUrl = process.argv[2]?.replace(/\/$/, '');
const shareToken = process.env.VERCEL_SHARE_TOKEN || '';
if (!baseUrl) throw new Error('Usage: node scripts/run-natural-conversation-ab.mjs <preview-url>');

const cases = JSON.parse(await readFile(new URL('./data/natural-conversation-round1-v1.json', import.meta.url), 'utf8'));

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

const results = [];
for (let index = 0; index < cases.length; index += 1) {
  const test = cases[index];
  const row = { id: test.id, title: test.title, message: test.message };
  for (const variant of ['A', 'B']) {
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
    row[variant] = { status: response.status, ...payload };
  }
  results.push(row);
  console.error(`Completed ${index + 1}/${cases.length}: ${test.id}`);
}

const totals = (variant) => results.reduce((total, row) => {
  const item = row[variant];
  total.successful += item.status === 200 ? 1 : 0;
  total.tokens += (item.usage?.token_input || 0) + (item.usage?.token_output || 0);
  total.modelCalls += item.usage?.model_calls || 0;
  total.cost += item.usage?.estimated_ai_cost || 0;
  total.latencyMs += item.usage?.response_latency_ms || 0;
  return total;
}, { successful: 0, tokens: 0, modelCalls: 0, cost: 0, latencyMs: 0 });

const summary = { A: totals('A'), B: totals('B') };
for (const value of Object.values(summary)) {
  value.averageTokens = value.successful ? Math.round(value.tokens / value.successful) : 0;
  value.averageLatencyMs = value.successful ? Math.round(value.latencyMs / value.successful) : 0;
  value.projected20TurnCost = value.successful ? value.cost / value.successful * 20 : 0;
}

console.log(JSON.stringify({ experiment: 'NATURAL_CONVERSATION_SKILL_V1', baseUrl, modelTier: 'SMART', cases: results, totals: summary }, null, 2));
