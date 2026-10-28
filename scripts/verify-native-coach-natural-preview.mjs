import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const accessUrl = new URL(process.argv[2]);
const outputPath = process.argv[3] || 'results/native-coach-natural-teaching/preview-regression.json';
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

await request(`${accessUrl.pathname}${accessUrl.search}`);
const guest = await request('/api/guest/session', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ remember: true, next: '/coba-gratis/native-coach-v1' }),
});
if (!guest.ok) throw new Error(`Guest session failed: ${guest.status} ${await guest.text()}`);

async function ask(message, sessionId, history) {
  const started = performance.now();
  const response = await request('/api/mandarin-coach/native-coach-v1', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message,
      sessionId,
      recentTurns: history.slice(-8),
      learningReferences: history.flatMap((turn) => [
        ...(turn.teaching || []),
        ...(turn.breakdowns || []).flatMap((item) => [{ text: item.sentence, pinyin: item.pinyin, indonesian: item.indonesian }, ...item.words]),
      ]).filter((item, index, items) => items.findIndex((candidate) => candidate.text === item.text) === index).slice(-8),
    }),
  });
  const events = [];
  const decoder = new TextDecoder();
  let buffer = '';
  let firstTextMs = null;
  let streamedText = '';
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
        if (event.type === 'text-delta') {
          firstTextMs ??= Math.round(performance.now() - started);
          streamedText += event.text || '';
        }
        if (event.type === 'replace-text') streamedText = event.text || '';
      }
      if (done) break;
    }
  }
  if (buffer.trim()) events.push(JSON.parse(buffer));
  return {
    status: response.status,
    firstTextMs,
    fullMs: Math.round(performance.now() - started),
    streamedText,
    complete: events.findLast((event) => event.type === 'complete') || null,
    error: events.findLast((event) => event.type === 'error') || null,
  };
}

async function record(id, message, sessionId, history) {
  const result = await ask(message, sessionId, history);
  rows.push({ id, message, result });
  await writeFile(outputPath, JSON.stringify({ executedAt: new Date().toISOString(), baseUrl, rows }, null, 2));
  await wait(13_000);
  return result;
}

const firstRound = [
  ['A1', 'sebagai pemulai mandarin, saya mau kerja di restoran china, tlg buat res untuk saya ya'],
  ['A2', 'Bang aku mau kerja jadi waiter di resto Cina, mandarin nol besar nih wkwk. Bisa bikinin cara belajar yg cocok buat kerja?'],
  ['D-FACTORY', 'Pak aku operator mesin pabrik, bosku China. Tolong susunin latihan Mandarin biar ngerti instruksi mesin sama safety, jangan mulai dari salam doang ya.'],
  ['D-DRIVER', 'Bro besok aku jadi sopir bos Chinese, bahasa Mandarin kacau banget. Yang penting bisa jemput di bandara dan ngobrol soal tujuan. Latih aku dong.'],
  ['D-CASHIER', 'Aku kasir minimarket, kalo customer China nanya boleh bayar QRIS gimana jawabnya? Langsung roleplay aja deh, kamu jadi pembeli.'],
  ['D-NANNY', 'Kak aku mau kerja jadi ART keluarga Chinese. Bantu dong belajar ngomong soal bersih-bersih, nyuci sama masak. Enaknya mulai dari mana?'],
  ['D-CHAT', 'Eh jangan les dulu, aku lagi capek habis kerja. Temenin ngobrol santai aja pake Indo ya, boleh?'],
];
for (const [id, message] of firstRound) await record(id, message, `free-natural-${id.toLowerCase()}`, []);

const contextHistory = [];
async function contextTurn(id, message) {
  const result = await record(id, message, 'free-natural-context', contextHistory);
  contextHistory.push({ role: 'user', text: message });
  if (result.complete) {
    contextHistory.push({
      role: 'assistant', text: result.complete.answer,
      teaching: result.complete.spokenChinese || [],
      breakdowns: [],
    });
  }
  return result;
}

await contextTurn('C1', 'Aku mau belajar 小明爱我, gimana bacanya?');
const breakdownStarted = performance.now();
const breakdownResponse = await request('/api/mandarin-coach/word-breakdown', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ text: '小明爱我', context: contextHistory.map((turn) => `${turn.role}: ${turn.text}`).join('\n'), sessionId: 'free-natural-context' }),
});
const breakdownPayload = await breakdownResponse.json().catch(() => null);
rows.push({ id: 'B-BREAKDOWN', message: '拆词: 小明爱我', result: { status: breakdownResponse.status, fullMs: Math.round(performance.now() - breakdownStarted), payload: breakdownPayload } });
if (breakdownResponse.ok && breakdownPayload?.breakdown && contextHistory.at(-1)?.role === 'assistant') {
  contextHistory.at(-1).breakdowns = [breakdownPayload.breakdown];
}
await wait(13_000);
await contextTurn('C2', 'Bisa pisahin kata-katanya satu-satu?');
await contextTurn('C3', 'Yang kata 爱 tadi itu artinya apa?');
await contextTurn('C4', 'Kalau dibalik jadi 我爱小明 gimana?');
await contextTurn('C5', 'Sekarang ganti topik dulu: makanan hangat murah setelah kerja enaknya apa?');
await contextTurn('C6', 'Yang tadi di atas bisa dibacain lagi?');
await contextTurn('C7', 'yang kata berdua di atas tadi kamu kasih saya itu, bukan pake kata berdua');

const tts = [];
for (const text of ['小明爱我', ...(breakdownPayload?.breakdown?.words || []).map((word) => word.text), '小明爱我']) {
  const started = performance.now();
  const response = await request('/api/chinese-tts', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, rate: 'normal' }),
  });
  const audio = await response.arrayBuffer();
  tts.push({ text, status: response.status, latencyMs: Math.round(performance.now() - started), bytes: audio.byteLength, contentType: response.headers.get('content-type'), voice: response.headers.get('X-IndoBrain-Chinese-TTS-Voice'), cache: response.headers.get('X-IndoBrain-TTS-Cache') });
}

await mkdir(new URL('../results/native-coach-natural-teaching/', import.meta.url), { recursive: true });
await writeFile(outputPath, JSON.stringify({ executedAt: new Date().toISOString(), baseUrl, rows, contextHistory, tts }, null, 2));
console.log(JSON.stringify({ outputPath, calls: rows.length, tts: tts.length, breakdownStatus: breakdownResponse.status }));
