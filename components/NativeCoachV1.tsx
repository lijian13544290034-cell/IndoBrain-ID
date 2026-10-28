'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { playBrowserAudioBlob, prepareBrowserAudio } from '@/lib/browser-audio';
import { splitInlineChinese } from '@/lib/chinese-inline-fragments';

type ChineseItem = { text: string; pinyin: string; indonesian: string };
type Breakdown = {
  sentence: string;
  pinyin: string;
  indonesian: string;
  words: ChineseItem[];
};
type PerformanceMetrics = {
  timeToFirstTextMs: number | null;
  fullResponseMs: number;
  modelTimeToFirstOutputMs: number | null;
};
type Turn = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  chinese: ChineseItem[];
  breakdowns?: Record<string, Breakdown>;
  streaming?: boolean;
  performance?: PerformanceMetrics;
};
type StreamEvent = {
  type: 'accepted' | 'text-delta' | 'replace-text' | 'complete' | 'error';
  text?: string;
  answer?: string;
  spokenChinese?: ChineseItem[];
  performance?: PerformanceMetrics;
  error?: string;
  retryable?: boolean;
};

const STORAGE_KEY = 'indobrain:native-coach:v1';
const SUGGESTIONS = [
  'Aku mau kerja jadi waiter di resto China. Bantu mulai dari situasi paling penting.',
  'Langsung roleplay ya, kamu jadi pelanggan dan aku jadi kasir.',
  'Jangan les dulu, aku cuma mau ngobrol santai pakai bahasa Indonesia.',
];

function newSessionId() {
  return `free-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;
}

export default function NativeCoachV1({ initialReady }: { initialReady: boolean }) {
  const [ready, setReady] = useState(initialReady);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [retryText, setRetryText] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [playing, setPlaying] = useState('');
  const [ttsReadyMs, setTtsReadyMs] = useState<number | null>(null);
  const [ttsError, setTtsError] = useState('');
  const [breaking, setBreaking] = useState('');
  const [breakdownError, setBreakdownError] = useState('');
  const [sessionId] = useState(newSessionId);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as { turns?: Turn[] } | null;
      if (saved?.turns?.length) setTurns(saved.turns.slice(-20).map((turn) => ({ ...turn, streaming: false })));
    } catch { /* Ignore stale or invalid local state. */ }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns]);

  useEffect(() => {
    if (!turns.length || turns.some((turn) => turn.streaming)) return;
    const stable = turns.filter((turn) => !turn.streaming).slice(-20);
    if (stable.length) localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, turns: stable }));
  }, [turns]);

  async function startGuestSession() {
    setStarting(true);
    setError('');
    try {
      const response = await fetch('/api/guest/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ remember: true, next: '/coba-gratis/native-coach-v1' }),
      });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || 'Sesi tamu belum bisa dimulai.');
      setReady(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Koneksi terputus. Coba lagi.');
    } finally {
      setStarting(false);
    }
  }

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const clean = message.trim();
    if (!clean || sending) return;
    const userTurn: Turn = { id: `u-${Date.now()}`, role: 'user', text: clean, chinese: [] };
    const history = [...turns.filter((turn) => !turn.streaming), userTurn];
    const learningReferences = history.slice(-20).flatMap((turn) => [
      ...turn.chinese,
      ...Object.values(turn.breakdowns || {}).flatMap((item) => [
        { text: item.sentence, pinyin: item.pinyin, indonesian: item.indonesian },
        ...item.words,
      ]),
    ]).filter((item, index, items) => items.findIndex((candidate) => candidate.text === item.text) === index).slice(-8);
    const assistantId = `a-${Date.now()}`;
    setTurns([...history, { id: assistantId, role: 'assistant', text: '', chinese: [], streaming: true }]);
    setMessage('');
    setSending(true);
    setError('');
    setRetryText('');

    try {
      const response = await fetch('/api/mandarin-coach/native-coach-v1', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          sessionId,
          recentTurns: history.slice(-8).map((turn) => ({
            role: turn.role,
            text: turn.text,
            teaching: turn.chinese,
            breakdowns: Object.values(turn.breakdowns || {}),
          })),
          learningReferences,
        }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || 'Guru AI belum dapat menjawab.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let completed = false;
      let streamError = '';

      const handleEvent = (item: StreamEvent) => {
        if (item.type === 'text-delta' && item.text) {
          setTurns((current) => current.map((turn) => turn.id === assistantId
            ? { ...turn, text: `${turn.text}${item.text}` }
            : turn));
        }
        if (item.type === 'replace-text' && item.text) {
          setTurns((current) => current.map((turn) => turn.id === assistantId
            ? { ...turn, text: item.text || '' }
            : turn));
        }
        if (item.type === 'complete' && item.answer && item.performance) {
          completed = true;
          setTurns((current) => current.map((turn) => turn.id === assistantId ? {
            ...turn,
            text: item.answer || turn.text,
            chinese: item.spokenChinese || [],
            streaming: false,
            performance: item.performance,
          } : turn));
        }
        if (item.type === 'error') streamError = item.error || 'Jawaban terputus. Coba lagi.';
      };

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          handleEvent(JSON.parse(line) as StreamEvent);
        }
        if (done) break;
      }
      if (buffer.trim()) handleEvent(JSON.parse(buffer) as StreamEvent);
      if (streamError) throw new Error(streamError);
      if (!completed) throw new Error('Jawaban terputus sebelum selesai. Coba lagi.');
    } catch (caught) {
      setTurns((current) => current.map((turn) => turn.id === assistantId
        ? { ...turn, streaming: false, text: turn.text || 'Jawaban belum berhasil dibuat.' }
        : turn));
      setRetryText(clean);
      setError(caught instanceof Error ? caught.message : 'Koneksi terputus. Coba lagi.');
    } finally {
      setSending(false);
    }
  }

  async function playChinese(text: string) {
    const prepared = prepareBrowserAudio();
    const startedAt = performance.now();
    setTtsError('');
    setPlaying(text);
    setTtsReadyMs(null);
    try {
      const response = await fetch('/api/chinese-tts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, rate: 'normal' }),
      });
      const contentType = response.headers.get('content-type') || '';
      const voice = response.headers.get('X-IndoBrain-Chinese-TTS-Voice');
      if (!response.ok || !contentType.startsWith('audio/') || voice !== 'zh-CN-XiaoxiaoNeural') {
        throw new Error('Audio Mandarin belum tersedia. Teks lain tidak akan diputar sebagai pengganti.');
      }
      const audio = await response.blob();
      setTtsReadyMs(Math.round(performance.now() - startedAt));
      await playBrowserAudioBlob(audio, prepared);
    } catch (caught) {
      setTtsError(caught instanceof Error ? caught.message : 'Audio gagal diputar.');
    } finally {
      setPlaying('');
    }
  }

  async function requestBreakdown(turnId: string, text: string) {
    if (breaking) return;
    const existing = turns.find((turn) => turn.id === turnId)?.breakdowns?.[text];
    if (existing) {
      setTurns((current) => current.map((turn) => turn.id === turnId
        ? { ...turn, breakdowns: { ...turn.breakdowns, [text]: existing } }
        : turn));
      return;
    }
    setBreaking(`${turnId}:${text}`);
    setBreakdownError('');
    try {
      const turnIndex = turns.findIndex((turn) => turn.id === turnId);
      const context = turns.slice(Math.max(0, turnIndex - 2), turnIndex + 1)
        .map((turn) => `${turn.role}: ${turn.text}`)
        .join('\n')
        .slice(-800);
      const response = await fetch('/api/mandarin-coach/word-breakdown', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, context, sessionId }),
      });
      const payload = await response.json().catch(() => null) as { breakdown?: Breakdown; error?: string } | null;
      if (!response.ok || !payload?.breakdown) throw new Error(payload?.error || 'Rincian kata belum tersedia.');
      setTurns((current) => current.map((turn) => turn.id === turnId ? {
        ...turn,
        breakdowns: { ...turn.breakdowns, [text]: payload.breakdown! },
      } : turn));
    } catch (caught) {
      setBreakdownError(caught instanceof Error ? caught.message : 'Rincian kata belum tersedia.');
    } finally {
      setBreaking('');
    }
  }

  function clearConversation() {
    localStorage.removeItem(STORAGE_KEY);
    setTurns([]);
    setPlaying('');
    setTtsReadyMs(null);
    setTtsError('');
    setRetryText('');
    setError('');
    setBreaking('');
    setBreakdownError('');
  }

  if (!ready) return <section className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Native Coach V1 · Preview</p>
    <h1 className="mt-3 text-2xl font-black leading-tight text-stone-950">Guru Mandarin yang mengikuti tujuanmu</h1>
    <p className="mt-3 text-sm leading-7 text-stone-600">Tanpa registrasi. Kamu boleh bertanya, berganti topik, minta roleplay, atau hanya ngobrol santai.</p>
    <button type="button" onClick={startGuestSession} disabled={starting} className="mt-6 min-h-14 w-full rounded-2xl bg-violet-700 px-5 font-bold text-white hover:bg-violet-800 disabled:opacity-60">
      {starting ? 'Menyiapkan sesi…' : 'Mulai ngobrol'}
    </button>
    {error ? <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
  </section>;

  return <section className="overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm">
    <header className="flex items-start justify-between gap-4 bg-gradient-to-br from-violet-800 to-indigo-700 px-5 py-4 text-white">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-100">Native Coach V1 · Preview</p>
        <h1 className="mt-1 text-xl font-black">Guru Mandarin AI</h1>
        <p className="mt-1 text-xs text-violet-100">Kamu menentukan arah. Audio hanya untuk kalimat Mandarin tervalidasi.</p>
      </div>
      <button type="button" onClick={clearConversation} className="shrink-0 rounded-full border border-white/30 px-3 py-2 text-xs font-bold hover:bg-white/10">Mulai baru</button>
    </header>

    <div className="max-h-[58vh] min-h-80 space-y-4 overflow-y-auto overflow-x-hidden bg-stone-50 px-4 py-5" aria-live="polite">
      {!turns.length ? <div className="rounded-2xl border border-dashed border-violet-300 bg-white p-4 text-sm leading-6 text-stone-600">
        Ceritakan kebutuhanmu dengan bahasa sehari-hari. Guru akan menjawab kebutuhan itu dulu, bukan memaksamu masuk kursus.
      </div> : null}
      {turns.map((turn) => {
        const chineseFragments = turn.role === 'assistant'
          ? [...new Set(splitInlineChinese(turn.text).filter((fragment) => fragment.kind === 'chinese').map((fragment) => fragment.text))].slice(0, 4)
          : [];
        return <article key={turn.id} className={turn.role === 'user'
        ? 'ml-6 break-words rounded-2xl rounded-br-md bg-violet-700 p-4 text-white'
        : 'mr-2 break-words rounded-2xl rounded-bl-md border border-stone-200 bg-white p-4 text-stone-900'}>
        <p className="whitespace-pre-wrap text-sm leading-6">{turn.role === 'assistant' && turn.text
          ? splitInlineChinese(turn.text).map((fragment, index) => fragment.kind === 'chinese'
            ? <button key={`${turn.id}-inline-zh-${index}`} type="button" lang="zh-CN"
              aria-label={`Putar Mandarin: ${fragment.text}`} title="Klik untuk dengar Mandarin"
              onClick={() => playChinese(fragment.text)} disabled={playing === fragment.text}
              style={{ display: 'inline-block', maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'anywhere', verticalAlign: 'baseline' }}
              className="inline rounded-sm bg-violet-50 px-0.5 font-medium text-violet-900 underline decoration-violet-300 decoration-dotted underline-offset-2 hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-60">
              {fragment.text}
            </button>
            : <span key={`${turn.id}-inline-text-${index}`}>{fragment.text}</span>)
          : turn.text || (turn.streaming ? '…' : '')}</p>
        {turn.streaming ? <p className="mt-2 text-xs font-semibold text-violet-600">Sedang menulis…</p> : null}
        {turn.role === 'assistant' && !turn.streaming && chineseFragments.length ? <div className="mt-2 flex flex-wrap gap-1.5">
          {chineseFragments.map((text) => <button key={`${turn.id}-break-${text}`} type="button"
            onClick={() => requestBreakdown(turn.id, text)} disabled={Boolean(breaking)}
            className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50">
            {breaking === `${turn.id}:${text}` ? 'Mengurai…' : `拆词 · ${text}`}
          </button>)}
        </div> : null}
        {turn.role === 'assistant' && Object.values(turn.breakdowns || {}).length ? <div className="mt-3 space-y-2">
          {Object.values(turn.breakdowns || {}).map((breakdown) => <details key={`${turn.id}-details-${breakdown.sentence}`} open
            className="rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2.5">
            <summary className="cursor-pointer list-none text-xs font-bold text-violet-800">拆词 · Rincian kata</summary>
            <div className="mt-2 flex items-start justify-between gap-3 border-b border-violet-100 pb-2">
              <div className="min-w-0">
                <p lang="zh-CN" className="break-words text-base font-bold text-violet-950">{breakdown.sentence}</p>
                <p className="break-words text-xs font-semibold text-violet-700">{breakdown.pinyin}</p>
                <p className="break-words text-xs leading-5 text-stone-600">{breakdown.indonesian}</p>
              </div>
              <button type="button" onClick={() => playChinese(breakdown.sentence)} disabled={playing === breakdown.sentence}
                aria-label={`Putar ${breakdown.sentence}`} className="min-h-10 min-w-10 shrink-0 rounded-full bg-violet-700 text-sm text-white disabled:opacity-50">🔊</button>
            </div>
            <div className="divide-y divide-violet-100">
              {breakdown.words.map((word, index) => <div key={`${breakdown.sentence}-${word.text}-${index}`} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p lang="zh-CN" className="break-words text-base font-bold text-stone-900">{word.text}</p>
                  <p className="break-words text-xs font-semibold text-violet-700">{word.pinyin}</p>
                  <p className="break-words text-xs text-stone-600">{word.indonesian}</p>
                </div>
                <button type="button" onClick={() => playChinese(word.text)} disabled={playing === word.text}
                  aria-label={`Putar ${word.text}`} className="min-h-10 min-w-10 shrink-0 rounded-full border border-violet-200 bg-white text-sm disabled:opacity-50">🔊</button>
              </div>)}
            </div>
          </details>)}
        </div> : null}
        {turn.role === 'assistant' && turn.chinese.length ? <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
          {turn.chinese.map((item) => <div key={`${turn.id}-${item.text}`} className="rounded-xl bg-violet-50 px-3 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p lang="zh-CN" className="break-words text-lg font-bold leading-7 text-violet-950">{item.text}</p>
                <p className="mt-0.5 break-words text-sm font-semibold text-violet-700">{item.pinyin}</p>
                <p className="mt-0.5 break-words text-sm leading-6 text-stone-600">{item.indonesian}</p>
              </div>
              <button type="button" aria-label={`Putar ${item.text}`} onClick={() => playChinese(item.text)} disabled={playing === item.text}
                className="min-h-11 min-w-11 shrink-0 rounded-full bg-violet-700 text-base text-white hover:bg-violet-800 disabled:opacity-50">
                {playing === item.text ? '⏸' : '🔊'}
              </button>
            </div>
          </div>)}
        </div> : null}
        {turn.role === 'assistant' && turn.performance ? <p className="mt-3 text-[11px] text-stone-400">
          Mulai {turn.performance.timeToFirstTextMs ?? '–'} ms · selesai {turn.performance.fullResponseMs} ms
        </p> : null}
      </article>})}
      <div ref={endRef} />
    </div>

    <div className="border-t border-stone-200 bg-white p-4">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => setMessage(suggestion)}
          className="max-w-[85%] shrink-0 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-left text-xs font-semibold text-violet-800">{suggestion}</button>)}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <label htmlFor="native-coach-message" className="sr-only">Pesan untuk guru Mandarin</label>
        <textarea id="native-coach-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={2} maxLength={500}
          placeholder="Tulis kebutuhanmu…" className="min-h-14 min-w-0 flex-1 resize-none rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-violet-600" />
        <button type="submit" disabled={sending || !message.trim()} className="min-w-20 shrink-0 rounded-2xl bg-violet-700 px-4 font-bold text-white hover:bg-violet-800 disabled:opacity-50">Kirim</button>
      </form>
      {ttsReadyMs !== null ? <p className="mt-2 text-[11px] text-stone-400">Audio siap dalam {ttsReadyMs} ms</p> : null}
      {ttsError ? <p role="status" className="mt-2 text-xs text-amber-700">{ttsError}</p> : null}
      {breakdownError ? <p role="status" className="mt-2 text-xs text-amber-700">{breakdownError}</p> : null}
      {error ? <div role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
        <p>{error}</p>
        {retryText ? <button type="button" onClick={() => { setMessage(retryText); setError(''); }} className="mt-2 font-bold underline">Masukkan lagi pesan terakhir</button> : null}
      </div> : null}
    </div>
  </section>;
}
