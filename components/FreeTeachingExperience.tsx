'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type SpokenChinese = { text: string; pinyin: string; indonesian: string; purpose: string };
type AssistantPayload = {
  answer: string;
  responseMode: string;
  spokenChinese: SpokenChinese[];
  followUp: string;
  contextSummary: string;
  assessment: { status: string; evidence: string };
  learnerAct?: 'QUESTION' | 'REQUEST' | 'ATTEMPT' | 'PRACTICE' | 'CONFUSION' | 'SESSION_END';
  teachingStrategy?: string;
  corrections?: Array<{ issue: string; explanation: string; modelChinese: string }>;
  task?: null | { type: string; prompt: string };
  learningEvidence?: {
    weakExpressions: Array<{ expression: string; evidence: string }>;
    independentUses: Array<{ expression: string; learnerEvidence: string }>;
  };
  sessionWrapUp?: null | { recap: string; weakFocus: string[]; recallExercises: string[] };
  tts: { policy: string; eligibleRequestCount: number; billableCharacters: number; nonChineseRequestCount: number; rejectedItems: number };
  usage: { token_input: number; token_output: number; model_calls: number; estimated_ai_cost: number; model_used: string; response_latency_ms: number };
  error?: string;
};
type Turn = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  payload?: AssistantPayload;
};
type TtsActual = { clicks: number; providerRequests: number; cacheHits: number; billableCharacters: number };
type CoachingState = {
  consecutiveFailures: number;
  lastTeachingStrategy: string;
  sameTaskRepeatCount: number;
  lastTaskPrompt: string;
  weakExpressions: string[];
  independentUses: string[];
};

const STORAGE_KEY = 'indobrain:ai-free-teaching:v1';
const EMPTY_COACHING_STATE: CoachingState = { consecutiveFailures: 0, lastTeachingStrategy: '', sameTaskRepeatCount: 0, lastTaskPrompt: '', weakExpressions: [], independentUses: [] };
const SUGGESTIONS = [
  'boleh buat tes untuk saya ya',
  'saya mau belajar Mandarin untuk restoran',
  'apa arti 分酒器?',
  'saya mau latihan percakapan dengan pelanggan',
];

function newSessionId() {
  return `free-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;
}

export default function FreeTeachingExperience({ initialReady }: { initialReady: boolean }) {
  const [ready, setReady] = useState(initialReady);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [contextSummary, setContextSummary] = useState('');
  const [coachingState, setCoachingState] = useState<CoachingState>(EMPTY_COACHING_STATE);
  const [sessionId] = useState(newSessionId);
  const [ttsActual, setTtsActual] = useState<TtsActual>({ clicks: 0, providerRequests: 0, cacheHits: 0, billableCharacters: 0 });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as { turns?: Turn[]; contextSummary?: string; coachingState?: CoachingState } | null;
      if (saved?.turns?.length) setTurns(saved.turns.slice(-20));
      if (saved?.contextSummary) setContextSummary(saved.contextSummary.slice(0, 500));
      if (saved?.coachingState) setCoachingState({ ...EMPTY_COACHING_STATE, ...saved.coachingState });
    } catch { /* Ignore stale or malformed local experiment state. */ }
  }, []);

  useEffect(() => {
    if (!turns.length) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, turns: turns.slice(-20), contextSummary, coachingState }));
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns, contextSummary, coachingState]);

  async function startGuestSession() {
    setStarting(true);
    setError('');
    try {
      const response = await fetch('/api/guest/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ remember: true, next: '/coba-gratis/ai-free-teaching' }),
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
    const userTurn: Turn = { id: `u-${Date.now()}`, role: 'user', text: clean };
    const history = [...turns, userTurn];
    setTurns(history);
    setMessage('');
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/mandarin-coach/free-teaching', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          sessionId,
          contextSummary,
          skillVersion: 'NATURAL_V1',
          coachingState,
          recentTurns: history.slice(-12).map((turn) => ({
            role: turn.role,
            text: turn.role === 'assistant' && turn.payload
              ? [
                  turn.text,
                  turn.payload.spokenChinese.length ? `Taught Chinese: ${turn.payload.spokenChinese.map((item) => item.text).join('、')}` : '',
                  turn.payload.followUp ? `Teacher follow-up: ${turn.payload.followUp}` : '',
                ].filter(Boolean).join('\n')
              : turn.text,
          })),
        }),
      });
      const payload = await response.json().catch(() => null) as AssistantPayload | null;
      if (!response.ok || !payload?.answer) throw new Error(payload?.error || 'Guru AI belum dapat menjawab.');
      setTurns((current) => [...current, { id: `a-${Date.now()}`, role: 'assistant', text: payload.answer, payload }]);
      setContextSummary(payload.contextSummary || contextSummary);
      if (payload.teachingStrategy && payload.learningEvidence) {
        const evidence = payload.learningEvidence;
        const nextTask = payload.task?.prompt || '';
        setCoachingState((current) => ({
          consecutiveFailures: payload.assessment.status === 'NEEDS_WORK' ? Math.min(5, current.consecutiveFailures + 1) : payload.assessment.status === 'CORRECT' ? 0 : current.consecutiveFailures,
          lastTeachingStrategy: payload.teachingStrategy || current.lastTeachingStrategy,
          sameTaskRepeatCount: nextTask && nextTask === current.lastTaskPrompt ? Math.min(3, current.sameTaskRepeatCount + 1) : nextTask ? 1 : 0,
          lastTaskPrompt: nextTask,
          weakExpressions: [...new Set([...current.weakExpressions, ...evidence.weakExpressions.map((item) => item.expression)])].slice(-12),
          independentUses: [...new Set([...current.independentUses, ...evidence.independentUses.map((item) => item.expression)])].slice(-12),
        }));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Koneksi terputus. Coba lagi.');
    } finally {
      setSending(false);
    }
  }

  async function playChinese(item: SpokenChinese) {
    setError('');
    try {
      const response = await fetch('/api/chinese-tts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: item.text, rate: 'normal' }),
      });
      if (!response.ok) throw new Error('Audio Mandarin belum tersedia.');
      const cache = response.headers.get('X-IndoBrain-TTS-Cache');
      const characters = Number(response.headers.get('X-IndoBrain-TTS-Billable-Characters') || item.text.length);
      setTtsActual((current) => ({
        clicks: current.clicks + 1,
        providerRequests: current.providerRequests + (cache === 'MISS' ? 1 : 0),
        cacheHits: current.cacheHits + (cache === 'HIT' ? 1 : 0),
        billableCharacters: current.billableCharacters + (cache === 'MISS' ? characters : 0),
      }));
      const url = URL.createObjectURL(await response.blob());
      const audio = new Audio(url);
      audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true });
      await audio.play();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Audio gagal diputar.');
    }
  }

  function clearConversation() {
    localStorage.removeItem(STORAGE_KEY);
    setTurns([]);
    setContextSummary('');
    setCoachingState(EMPTY_COACHING_STATE);
    setTtsActual({ clicks: 0, providerRequests: 0, cacheHits: 0, billableCharacters: 0 });
  }

  if (!ready) return <section className="rounded-[28px] border border-violet-200 bg-white p-6 shadow-xl shadow-violet-100/60">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Eksperimen Preview · Mode Tamu</p>
    <h1 className="mt-3 text-3xl font-black leading-tight text-stone-950">AI Mengajar Bebas, Kamu Tentukan Arah</h1>
    <p className="mt-4 text-sm leading-7 text-stone-600">Tanpa registrasi. Guru AI tidak memaksa urutan kursus: minta tes, penjelasan, koreksi, roleplay, atau lanjutkan latihan sebelumnya.</p>
    <button type="button" onClick={startGuestSession} disabled={starting} className="mt-6 min-h-14 w-full rounded-2xl bg-violet-700 px-5 font-bold text-white hover:bg-violet-800 disabled:opacity-60">
      {starting ? 'Menyiapkan sesi…' : 'Mulai AI Free Teaching'}
    </button>
    {error ? <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
  </section>;

  return <section className="overflow-hidden rounded-[28px] border border-violet-200 bg-white shadow-xl shadow-violet-100/60">
    <header className="bg-gradient-to-br from-violet-800 to-indigo-700 px-5 py-5 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-100">AI Free Teaching V1 · B</p>
          <h1 className="mt-2 text-2xl font-black">Guru Mandarin Bebas</h1>
          <p className="mt-2 text-xs leading-5 text-violet-100">Kursus hanya referensi. Audio hanya untuk kalimat Mandarin yang ditandai.</p>
        </div>
        <button type="button" onClick={clearConversation} className="rounded-full border border-white/30 px-3 py-2 text-xs font-bold hover:bg-white/10">Mulai baru</button>
      </div>
    </header>

    <div className="max-h-[58vh] min-h-80 space-y-4 overflow-y-auto bg-stone-50 px-4 py-5">
      {!turns.length ? <div className="rounded-2xl border border-dashed border-violet-300 bg-white p-4 text-sm leading-6 text-stone-600">
        <strong className="text-stone-900">Coba dengan cara alami.</strong> Guru AI akan memilih sendiri apakah perlu mengajar, mengetes, mengoreksi, mengulang, atau roleplay.
      </div> : null}
      {turns.map((turn) => <article key={turn.id} className={turn.role === 'user' ? 'ml-8 rounded-2xl rounded-br-md bg-violet-700 p-4 text-white' : 'mr-3 rounded-2xl rounded-bl-md border border-stone-200 bg-white p-4 text-stone-900'}>
        <p className="whitespace-pre-wrap text-sm leading-6">{turn.text}</p>
        {turn.payload?.spokenChinese.map((item) => <div key={`${turn.id}-${item.text}`} className="mt-3 rounded-2xl bg-violet-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p lang="zh-CN" className="text-2xl font-black text-violet-950">{item.text}</p>
              <p className="mt-1 font-semibold text-violet-700">{item.pinyin}</p>
              <p className="mt-1 text-sm text-stone-600">{item.indonesian}</p>
            </div>
            <button type="button" aria-label={`Putar ${item.text}`} onClick={() => playChinese(item)} className="min-h-11 min-w-11 rounded-full bg-violet-700 text-lg text-white hover:bg-violet-800">🔊</button>
          </div>
        </div>)}
        {turn.payload?.followUp ? <p className="mt-3 text-sm font-semibold text-violet-800">{turn.payload.followUp}</p> : null}
        {turn.payload?.corrections?.map((item) => <div key={`${turn.id}-${item.issue}`} className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-stone-700">
          <p className="font-bold text-amber-900">Koreksi utama: {item.issue}</p>
          <p>{item.explanation}</p>
          {item.modelChinese ? <p lang="zh-CN" className="mt-1 font-bold text-stone-950">{item.modelChinese}</p> : null}
        </div>)}
        {turn.payload?.task ? <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm leading-6 text-violet-950">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Satu latihan</p>
          <p className="mt-1 font-semibold">{turn.payload.task.prompt}</p>
        </div> : null}
        {turn.payload?.sessionWrapUp ? <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-stone-700">
          <p className="font-bold text-emerald-900">Ringkasan belajar</p>
          <p>{turn.payload.sessionWrapUp.recap}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">{turn.payload.sessionWrapUp.recallExercises.map((exercise) => <li key={exercise}>{exercise}</li>)}</ol>
        </div> : null}
        {turn.payload ? <p className="mt-3 text-[11px] text-stone-400">{turn.payload.responseMode} · {turn.payload.usage.model_used} · {turn.payload.usage.token_input + turn.payload.usage.token_output} token · TTS {turn.payload.tts.billableCharacters} karakter kandidat</p> : null}
      </article>)}
      {sending ? <div role="status" className="mr-20 rounded-2xl bg-white p-4 text-sm text-stone-500">Guru AI sedang berpikir…</div> : null}
      <div ref={endRef} />
    </div>

    <div className="border-t border-stone-200 bg-white p-4">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => setMessage(suggestion)} className="shrink-0 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800">{suggestion}</button>)}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <label htmlFor="free-teaching-message" className="sr-only">Pesan untuk guru Mandarin</label>
        <textarea id="free-teaching-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={2} maxLength={500} placeholder="Minta tes, penjelasan, atau latihan…" className="min-h-14 flex-1 resize-none rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-violet-600" />
        <button type="submit" disabled={sending || !message.trim()} className="min-w-20 rounded-2xl bg-violet-700 px-4 font-bold text-white hover:bg-violet-800 disabled:opacity-50">Kirim</button>
      </form>
      {error ? <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <p className="mt-3 text-center text-[11px] text-stone-400">TTS aktual: {ttsActual.clicks} klik · {ttsActual.providerRequests} request Azure · {ttsActual.cacheHits} cache hit · {ttsActual.billableCharacters} karakter tertagih</p>
    </div>
  </section>;
}

