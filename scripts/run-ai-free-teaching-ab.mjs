const baseUrl = process.argv[2]?.replace(/\/$/, '');
const shareToken = process.env.VERCEL_SHARE_TOKEN || '';
if (!baseUrl) throw new Error('Usage: node scripts/run-ai-free-teaching-ab.mjs <preview-url>');

const prompts = [
  'boleh buat tes untuk saya ya',
  'saya mau belajar Mandarin untuk restoran',
  'apa arti 分酒器?',
  'saya belum paham, jelaskan lagi',
  'kasih saya soal yang lebih sulit',
  'saya mau latihan percakapan dengan pelanggan',
  '继续刚才的练习',
];

const cookies = new Map();
function rememberCookies(response) {
  const values = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);
  for (const value of values) {
    const pair = value.split(';', 1)[0];
    const index = pair.indexOf('=');
    if (index > 0) cookies.set(pair.slice(0, index), pair.slice(index + 1));
  }
}
function cookieHeader() {
  return [...cookies].map(([key, value]) => `${key}=${value}`).join('; ');
}
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
async function request(path, init = {}, attempt = 0) {
  const headers = new Headers(init.headers || {});
  if (cookies.size) headers.set('cookie', cookieHeader());
  try {
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers, redirect: 'manual' });
    rememberCookies(response);
    return response;
  } catch (error) {
    if (attempt >= 2) throw error;
    console.error(`Network request failed; retrying in ${2 ** attempt * 2}s.`);
    await wait(2 ** attempt * 2_000);
    return request(path, init, attempt + 1);
  }
}

if (shareToken) {
  const access = await request(`/coba-gratis/ai-free-teaching?_vercel_share=${encodeURIComponent(shareToken)}`);
  if (![200, 307, 308].includes(access.status)) throw new Error(`Preview access failed: ${access.status}`);
  if (access.status !== 200) {
    const location = access.headers.get('location') || '/coba-gratis/ai-free-teaching';
    const next = location.startsWith('http') ? location.slice(baseUrl.length) : location;
    const page = await request(next);
    if (page.status !== 200) throw new Error(`Preview page failed: ${page.status}`);
  }
}

const guest = await request('/api/guest/session', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ remember: true, next: '/coba-gratis/ai-free-teaching' }),
});
if (!guest.ok) throw new Error(`Guest session failed: ${guest.status} ${await guest.text()}`);

const results = [];
const histories = { A: [], B: [] };
let summaryB = '';
const startedAt = new Date().toISOString();

function speechMetrics(segments = []) {
  return {
    eligibleRequestCount: segments.length,
    billableCharacters: segments.reduce((sum, item) => sum + String(item.text || '').length, 0),
    chineseRequestCount: segments.filter((item) => item.language === 'zh-CN').length,
    nonChineseRequestCount: segments.filter((item) => item.language !== 'zh-CN').length,
  };
}

for (let index = 0; index < prompts.length; index += 1) {
  const prompt = prompts[index];
  const form = new FormData();
  form.set('sessionId', 'coach-ab-rules-v1');
  form.set('message', prompt);
  form.set('context', JSON.stringify({
    lessonId: 'mandarin-work-level-1-day-1',
    currentExpression: null,
    currentSkill: 'TEACH',
    userLevel: 'absolute beginner',
    recentMistakes: [],
    masteryState: [],
    reviewQueue: [],
    conversationMode: 'COACH_CONVERSATION',
    learningGoal: 'Mandarin praktis untuk kerja',
    preferredExplanationLanguage: 'INDONESIAN',
    userInitiatedMemory: [],
    recentConversationSummary: '',
    recentTurns: histories.A.slice(-6),
    sessionStartedAt: startedAt,
    messageCount: histories.A.length,
    miniCourse: null,
  }));
  const aResponse = await request('/api/mandarin-coach/conversation', { method: 'POST', body: form });
  const a = await aResponse.json().catch(() => ({ error: `HTTP ${aResponse.status}` }));
  histories.A.push({ role: 'user', text: prompt }, { role: 'assistant', text: a.answer || a.error || '' });

  const modelUsedA = String(a.usage?.model_used || '');
  const modelTier = modelUsedA.includes('flash-lite') ? 'FAST' : 'SMART';
  const freeRequest = () => request('/api/mandarin-coach/free-teaching', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message: prompt,
      sessionId: 'free-ab-autonomous-v1',
      recentTurns: histories.B.slice(-12),
      contextSummary: summaryB,
      modelTier,
    }),
  });
  let bResponse = await freeRequest();
  let b = await bResponse.json().catch(() => ({ error: `HTTP ${bResponse.status}` }));
  if (bResponse.status === 503) {
    console.error('Free mode hit a transient provider limit; retrying once after 40s.');
    await wait(40_000);
    bResponse = await freeRequest();
    b = await bResponse.json().catch(() => ({ error: `HTTP ${bResponse.status}` }));
  }
  histories.B.push({ role: 'user', text: prompt }, { role: 'assistant', text: b.answer || b.error || '' });
  summaryB = b.contextSummary || summaryB;

  results.push({
    prompt,
    A: {
      status: aResponse.status,
      answer: a.answer || a.error,
      chinese: a.chinese || '',
      intent: a.intent || '',
      teachingStrategy: a.teachingStrategy || '',
      assessment: null,
      model: a.usage?.model_used || '',
      tokens: (a.usage?.token_input || 0) + (a.usage?.token_output || 0),
      modelCalls: a.usage?.model_calls || 0,
      estimatedCost: a.usage?.estimated_ai_cost || 0,
      tts: speechMetrics(a.speechSegments),
    },
    B: {
      status: bResponse.status,
      answer: b.answer || b.error,
      spokenChinese: b.spokenChinese || [],
      mode: b.responseMode || '',
      assessment: b.assessment || null,
      model: b.usage?.model_used || '',
      tokens: (b.usage?.token_input || 0) + (b.usage?.token_output || 0),
      modelCalls: b.usage?.model_calls || 0,
      estimatedCost: b.usage?.estimated_ai_cost || 0,
      tts: b.tts || null,
    },
  });
  console.error(`Completed ${index + 1}/${prompts.length}: ${prompt}`);
}

const totals = (key) => results.reduce((total, row) => ({
  tokens: total.tokens + row[key].tokens,
  modelCalls: total.modelCalls + row[key].modelCalls,
  estimatedCost: total.estimatedCost + row[key].estimatedCost,
  ttsRequests: total.ttsRequests + (row[key].tts?.eligibleRequestCount || 0),
  ttsCharacters: total.ttsCharacters + (row[key].tts?.billableCharacters || 0),
  nonChineseTtsRequests: total.nonChineseTtsRequests + (row[key].tts?.nonChineseRequestCount || 0),
}), { tokens: 0, modelCalls: 0, estimatedCost: 0, ttsRequests: 0, ttsCharacters: 0, nonChineseTtsRequests: 0 });

console.log(JSON.stringify({ experiment: 'AI_FREE_TEACHING_V1', startedAt, baseUrl, prompts: results, totals: { A: totals('A'), B: totals('B') } }, null, 2));

