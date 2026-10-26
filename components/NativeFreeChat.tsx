'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type ChineseItem = { text: string; pinyin: string; indonesian: string };
type NativePayload = {
  answer: string;
  spokenChinese: ChineseItem[];
  tts: { rejectedItems: number };
  usage: { model_used: string };
  error?: string;
};
type Turn = { id: string; role: 'user' | 'assistant'; text: string; chinese: ChineseItem[] };

const STORAGE_KEY = 'indobrain:native-chat:v2';
const SUGGESTIONS = [
  'saya mau kerja di restoran china, bantu buat les',
  'saya mau latihan ngobrol langsung',
  'jelaskan lagi yang tadi, saya belum paham',
];

function newSessionId() {
  return `free-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;
}

export default function NativeFreeChat({ initialReady }: { initialReady: boolean }) {
  const [ready, setReady] = useState(initialReady);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [playing, setPlaying] = useState('');
  const [sessionId] = useState(newSessionId);
  const endRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as { turns?: Turn[] } | null;
      if (saved?.turns?.length) setTurns(saved.turns.slice(-20));
    } catch { /* ignore stale local state */ }
  }, []);

  useEffect(() => {
    if (!turns.length) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, turns: turns.slice(-20) }));
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns]);

  async function startGuestSession() {
    setStarting(true);
    setError('');
    try {
      const response = await fetch('/api/guest/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ remember: true, next: '/coba-gratis/native-chat' }),
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
    const history = [...turns, userTurn];
    setTurns(history);
    setMessage('');
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/mandarin-coach/native-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          sessionId,
          recentTurns: history.slice(-10).map((turn) => ({ role: turn.role, text: turn.text })),
        }),
      });
      const payload = await response.json().catch(() => null) as NativePayload | null;
      if (!response.ok || !payload?.answer) throw new Error(payload?.error || 'Guru AI belum dapat menjawab.');
      setTurns((current) => [...current, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: payload.answer,
        chinese: payload.spokenChinese,
      }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Koneksi terputus. Coba lagi.');
    } finally {
      setSending(false);
    }
  }

  async function playChinese(text: string) {
    setError('');
    setPlaying(text);
    try {
      const response = await fetch('/api/chinese-tts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, rate: 'normal' }),
      });
      if (!response.ok) throw new Error('Audio Mandarin belum tersedia.');
      const url = URL.createObjectURL(await response.blob());
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.addEventListener('ended', () => { URL.revokeObjectURL(url); setPlaying(''); }, { once: true });
      await audio.play();
    } catch (caught) {
      setPlaying('');
      setError(caught instanceof Error ? caught.message : 'Audio gagal diputar.');
    }
  }

  function clearConversation() {
    localStorage.removeItem(STORAGE_KEY);
    setTurns([]);
    setPlaying('');
  }

  if (!ready) return <section className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Preview · Mode Tamu</p>
    <h1 className="mt-3 text-2xl font-black leading-tight text-stone-950">Ngobrol bebas dengan guru Mandarin AI</h1>
    <p className="mt-3 text-sm leading-7 text-stone-600">Tanpa registrasi. Tanya apa saja, minta rencana belajar, latihan percakapan, atau koreksi — sesuaikan dengan kebutuhanmu.</p>
    <button type="button" onClick={startGuestSession} disabled={starting} className="mt-6 min-h-14 w-full rounded-2xl bg-violet-700 px-5 font-bold text-white hover:bg-violet-800 disabled:opacity-60">
      {starting ? 'Menyiapkan sesi…' : 'Mulai ngobrol'}
    </button>
    {error ? <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
  </section>;

  return <section className="overflow-hidden overflow-x-hidden rounded-3xl border border-violet-200 bg-white shadow-sm">
    <header className="flex items-start justify-between gap-4 bg-gradient-to-br from-violet-800 to-indigo-700 px-5 py-4 text-white">
      <div>
        <h1 className="text-xl font-black">Guru Mandarin AI</h1>
        <p className="mt-1 text-xs text-violet-100">Kalimat Mandarin di jawaban bisa langsung diputar.</p>
      </div>
      <button type="button" onClick={clearConversation} className="shrink-0 rounded-full border border-white/30 px-3 py-2 text-xs font-bold hover:bg-white/10">Mulai baru</button>
    </header>

    <div className="max-h-[58vh] min-h-80 space-y-4 overflow-y-auto overflow-x-hidden bg-stone-50 px-4 py-5">
      {!turns.length ? <div className="rounded-2xl border border-dashed border-violet-300 bg-white p-4 text-sm leading-6 text-stone-600">
        Ceritakan tujuanmu — misalnya mau kerja di restoran China, atau mau langsung latihan ngobrol.
      </div> : null}
      {turns.map((turn) => <article key={turn.id} className={turn.role === 'user'
        ? 'ml-6 break-words rounded-2xl rounded-br-md bg-violet-700 p-4 text-white'
        : 'mr-2 break-words rounded-2xl rounded-bl-md border border-stone-200 bg-white p-4 text-stone-900'}>
        <p className="whitespace-pre-wrap text-sm leading-6">{turn.text}</p>
        {turn.role === 'assistant' && turn.chinese.length ? <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
          {turn.chinese.map((item) => <div key={`${turn.id}-${item.text}`} className="rounded-xl bg-violet-50 px-3 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p lang="zh-CN" className="break-words text-lg font-bold leading-7 text-violet-950">{item.text}</p>
                {item.pinyin ? <p className="mt-0.5 break-words text-sm font-semibold text-violet-700">{item.pinyin}</p> : null}
                {item.indonesian ? <p className="mt-0.5 break-words text-sm leading-6 text-stone-600">{item.indonesian}</p> : null}
              </div>
              <button type="button" aria-label={`Putar ${item.text}`} onClick={() => playChinese(item.text)} disabled={playing === item.text}
                className="min-h-11 min-w-11 shrink-0 rounded-full bg-violet-700 text-base text-white hover:bg-violet-800 disabled:opacity-50">
                {playing === item.text ? '⏸' : '🔊'}
              </button>
            </div>
          </div>)}
        </div> : null}
      </article>)}
      {sending ? <div role="status" className="mr-16 rounded-2xl bg-white p-4 text-sm text-stone-500">Guru AI sedang menulis…</div> : null}
      <div ref={endRef} />
    </div>

    <div className="border-t border-stone-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => setMessage(suggestion)}
          className="max-w-full shrink-0 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-left text-xs font-semibold text-violet-800">{suggestion}</button>)}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <label htmlFor="native-chat-message" className="sr-only">Pesan untuk guru Mandarin</label>
        <textarea id="native-chat-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={2} maxLength={500}
          placeholder="Tulis apa saja…" className="min-h-14 min-w-0 flex-1 resize-none rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-violet-600" />
        <button type="submit" disabled={sending || !message.trim()} className="min-w-20 shrink-0 rounded-2xl bg-violet-700 px-4 font-bold text-white hover:bg-violet-800 disabled:opacity-50">Kirim</button>
      </form>
      {error ? <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </div>
  </section>;
}
