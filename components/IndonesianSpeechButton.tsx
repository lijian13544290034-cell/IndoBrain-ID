'use client';

import { useEffect, useRef, useState } from 'react';
import { useIndonesianAudio } from '@/components/IndonesianAudioProvider';

let activeAudio: HTMLAudioElement | undefined;
let stopActiveAudio: (() => void) | undefined;
const audioUrlCache = new Map<string, string>();
const pendingAudio = new Map<string, Promise<string>>();

async function getAudioUrl(text: string) {
  const cached = audioUrlCache.get(text);
  if (cached) return cached;
  const pending = pendingAudio.get(text);
  if (pending) return pending;
  const request = fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    .then(async (response) => {
      if (!response.ok) throw new Error('TTS request failed');
      const url = URL.createObjectURL(await response.blob());
      audioUrlCache.set(text, url);
      pendingAudio.delete(text);
      return url;
    })
    .catch((error) => { pendingAudio.delete(text); throw error; });
  pendingAudio.set(text, request);
  return request;
}

export default function IndonesianSpeechButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const enabled = useIndonesianAudio();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined);

  const stop = () => {
    audioRef.current?.pause();
    if (activeAudio === audioRef.current) activeAudio = undefined;
    if (stopActiveAudio === stop) stopActiveAudio = undefined;
    setPlaying(false);
  };

  useEffect(() => () => stop(), []);

  const play = async () => {
    if (enabled !== true || /[\u3400-\u9FFF]/.test(text)) return;
    if (playing || loading) { stop(); return; }
    stopActiveAudio?.();
    setFailed(false);
    setLoading(true);
    try {
      const audio = new Audio(await getAudioUrl(text));
      audioRef.current = audio;
      activeAudio = audio;
      stopActiveAudio = stop;
      audio.onended = () => { if (activeAudio === audio) activeAudio = undefined; if (stopActiveAudio === stop) stopActiveAudio = undefined; setPlaying(false); };
      audio.onerror = () => { if (activeAudio === audio) activeAudio = undefined; if (stopActiveAudio === stop) stopActiveAudio = undefined; setPlaying(false); setFailed(true); };
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  if (enabled !== true) return null;
  return <button type="button" onClick={play} aria-label="Dengarkan（听一听）" title="Dengarkan（听一听）" className={`min-h-8 cursor-pointer rounded-lg border border-stone-300 px-2 text-xs font-medium transition duration-200 hover:bg-stone-100 ${compact ? '' : 'mt-2'}`}>{loading ? 'Memuat…（加载中）' : playing ? '■ Memutar（播放中）' : failed ? 'Coba lagi（重试）' : '🔊 Dengarkan（听一听）'}</button>;
}
