'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const VOICE = 'id-ID-GadisNeural';
const audioBlobs = new Map<string, Blob>();
let healthPromise: Promise<boolean> | undefined;
let activeStop: (() => void) | undefined;

function speechAvailable() {
  healthPromise ??= fetch('/api/health/speech', { cache: 'no-store' })
    .then((response) => response.ok)
    .catch(() => false);
  return healthPromise;
}

export default function IndonesianAudioButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const pathname = usePathname();
  const [available, setAvailable] = useState<boolean | undefined>();
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    audioRef.current = null;
    urlRef.current = null;
    setPlaying(false);
    if (activeStop === stop) activeStop = undefined;
  };

  useEffect(() => { void speechAvailable().then(setAvailable); }, []);
  useEffect(() => stop, [pathname]);

  async function play() {
    if (!available || loading || !text.trim()) return;
    setError('');
    activeStop?.();
    setLoading(true);
    try {
      const cacheKey = `${VOICE}:${text.trim()}`;
      let blob = audioBlobs.get(cacheKey);
      if (!blob) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.trim(), voice: VOICE }),
        });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/')) throw new Error('unavailable');
        blob = await response.blob();
        audioBlobs.set(cacheKey, blob);
      }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      urlRef.current = url;
      activeStop = stop;
      audio.addEventListener('ended', stop, { once: true });
      audio.addEventListener('error', () => { setError('Audio belum tersedia.'); stop(); }, { once: true });
      await audio.play();
      setPlaying(true);
    } catch {
      setError('Audio belum tersedia.');
      stop();
    } finally {
      setLoading(false);
    }
  }

  const label = loading ? 'Memuat…' : playing ? 'Berhenti（停止）' : 'Dengarkan（听一听）';
  return <span className="inline-flex flex-wrap items-center gap-2">
    <button
      type="button"
      onClick={playing ? stop : play}
      disabled={available !== true || loading}
      aria-label={`Dengarkan Bahasa Indonesia: ${text}`}
      title={available === false ? 'Fitur audio sedang disiapkan.' : 'Dengarkan Bahasa Indonesia'}
      className={`rounded-xl border border-stone-300 px-3 py-2 text-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45 ${compact ? 'px-2 py-1 text-xs' : ''}`}
    >{label}</button>
    {error && <span role="status" className="text-xs text-stone-500">{error}</span>}
  </span>;
}
