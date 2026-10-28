import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const accessUrl = new URL(process.argv[2]);
const outputPath = process.argv[3] || 'results/native-coach-intent-v1/preview-regression.json';
const onlyBreakdown = process.argv.includes('--only-breakdown');
const baseUrl = accessUrl.origin;
const cookies = new Map();
const rows = [];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function remember(response) {
  for (const raw of response.headers.getSetCookie?.() || []) {
    const pair = raw.split(';', 1)[0];
    const index = pair.indexOf('=');
    if (index > 0) cookies.set(pair.slice(0, index), pair.slice(index + 1));
  }
}

async function request(path, init = {}) {
  const headers = new Headers(init.headers || {});
  if (cookies.size) headers.set('cookie', [...cookies].map(([key, value]) => `${key}=${value}`).join('; '));
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers, redirect: 'manual' });
  remember(response);
  return response;
}

async function ask(message, sessionId, history = []) {
  const started = performance.now();
  const response = await request('/api/mandarin-coach/native-coach-v1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, sessionId, recentTurns: history.slice(-8), learningReferences: [] }),
  });
  const events = [];
  const decoder = new TextDecoder();
  let buffer = '';
  let firstTextMs = null;
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        events.push(event);
        if (event.type === 'text-delta') firstTextMs ??= Math.round(performance.now() - started);
      }
      if (done) break;
    }
  }
  if (buffer.trim()) events.push(JSON.parse(buffer));
  return {
    status: response.status,
    firstTextMs,
    fullMs: Math.round(performance.now() - started),
    complete: events.findLast((event) => event.type === 'complete') || null,
    error: events.findLast((event) => event.type === 'error') || null,
  };
}

async function record(id, message, sessionId, history = []) {
  const result = await ask(message, sessionId, history);
  rows.push({ id, message, result });
  await writeFile(outputPath, JSON.stringify({ executedAt: new Date().toISOString(), baseUrl, rows }, null, 2));
  await wait(13_000);
  return result;
}

await mkdir(new URL('../results/native-coach-intent-v1/', import.meta.url), { recursive: true });
await request(`${accessUrl.pathname}${accessUrl.search}`);
const guest = await request('/api/guest/session', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ remember: true, next: '/coba-gratis/native-coach-v1' }),
});
if (!guest.ok) throw new Error(`Guest session failed: ${guest.status} ${await guest.text()}`);

const scenarios = [
  ['I1', 'Aku mau kenalan sama orang China, cara bilang nama saya gimana?'],
  ['I2', 'Gimana ngomong nama saya Adi dalam Mandarin?'],
  ['I3', 'Aku mau perkenalkan diri ke bos China.'],
  ['I4', 'Ajari aku bilang umur sama pekerjaan.'],
  ['I5', 'Cara ngenalin teman saya ke orang China gimana?'],
  ['I6', 'Aku mau belajar Mandarin buat kerja, enaknya mulai dari mana?'],
];
if (!onlyBreakdown) {
  for (const [id, message] of scenarios) await record(id, message, `free-intent-preview-${id.toLowerCase()}`);
}

const history = [];
for (const [id, message] of onlyBreakdown ? [] : [
  ['C1', 'Aku mau belajar cara bilang nama saya.'],
  ['C2', 'Nama saya Budi. Sekarang ajari bilang umur saya 25.'],
  ['C3', 'Ganti topik ya, aku kerja sebagai kasir. Cara kenalan ke bos gimana?'],
]) {
  const result = await record(id, message, 'free-intent-preview-context', history);
  history.push({ role: 'user', text: message });
  if (result.complete) history.push({ role: 'assistant', text: result.complete.answer, teaching: result.complete.spokenChinese || [] });
}

const breakdownStarted = performance.now();
let breakdownResponse;
let breakdown;
for (let attempt = 1; attempt <= 2; attempt += 1) {
  breakdownResponse = await request('/api/mandarin-coach/word-breakdown', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: '我叫阿迪', context: 'user: Gimana ngomong nama saya Adi dalam Mandarin?', sessionId: `free-intent-preview-breakdown-${attempt}` }),
  });
  breakdown = await breakdownResponse.json().catch(() => null);
  if (breakdownResponse.ok) break;
  if (attempt < 2) await wait(13_000);
}

const tts = [];
for (const text of ['我叫阿迪', ...(breakdown?.breakdown?.words || []).map((word) => word.text), '我叫阿迪']) {
  const started = performance.now();
  const response = await request('/api/chinese-tts', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, rate: 'normal' }),
  });
  const audio = await response.arrayBuffer();
  tts.push({
    text,
    status: response.status,
    latencyMs: Math.round(performance.now() - started),
    bytes: audio.byteLength,
    contentType: response.headers.get('content-type'),
    voice: response.headers.get('X-IndoBrain-Chinese-TTS-Voice'),
    cache: response.headers.get('X-IndoBrain-TTS-Cache'),
  });
}

await writeFile(outputPath, JSON.stringify({
  executedAt: new Date().toISOString(), baseUrl, rows, history,
  breakdown: { status: breakdownResponse.status, fullMs: Math.round(performance.now() - breakdownStarted), payload: breakdown },
  tts,
}, null, 2));
console.log(JSON.stringify({ outputPath, calls: rows.length, breakdownStatus: breakdownResponse.status, tts: tts.length }));
