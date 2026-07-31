'use client';

import { useEffect, useRef, useState } from 'react';
import { useIndonesianAudio } from '@/components/IndonesianAudioProvider';
import { track } from '@/lib/learning-profile';

let activeAudio: HTMLAudioElement | undefined;
let stopActiveAudio: (() => void) | undefined;
const audioUrlCache = new Map<string, string>();
const pendingAudio = new Map<string, Promise<string>>();

type SpeechRate = 'normal' | 'slow';
export type PronunciationAudioInput = {
  audioMode: 'phoneme' | 'text' | 'example';
  phoneme?: string;
  audioText?: string;
  exampleWords?: string[];
};

async function getAudioUrl(text: string, rate: SpeechRate, pronunciation?: PronunciationAudioInput) {
  const cacheKey = JSON.stringify({ text, rate, pronunciation: pronunciation ?? null });
  const cached = audioUrlCache.get(cacheKey);
  if (cached) return cached;
  const pending = pendingAudio.get(cacheKey);
  if (pending) return pending;
  const request = fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, rate, pronunciation }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('TTS request failed');
      const url = URL.createObjectURL(await response.blob());
      audioUrlCache.set(cacheKey, url);
      pendingAudio.delete(cacheKey);
      return url;
    })
    .catch((error) => { pendingAudio.delete(cacheKey); throw error; });
  pendingAudio.set(cacheKey, request);
  return request;
}

export default function IndonesianSpeechButton({ text, compact = false, rate = 'normal', pronunciation, label = '🔊 听一听' }: { text: string; compact?: boolean; rate?: SpeechRate; pronunciation?: PronunciationAudioInput; label?: string }) {
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
      const audio = new Audio(await getAudioUrl(text, rate, pronunciation));
      audioRef.current = audio;
      activeAudio = audio;
      stopActiveAudio = stop;
      audio.onended = () => { if (activeAudio === audio) activeAudio = undefined; if (stopActiveAudio === stop) stopActiveAudio = undefined; setPlaying(false); };
      audio.onerror = () => { if (activeAudio === audio) activeAudio = undefined; if (stopActiveAudio === stop) stopActiveAudio = undefined; setPlaying(false); setFailed(true); };
      await audio.play();
      track('audio_played', 'audio');
      setPlaying(true);
    } catch {
      setPlaying(false);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const unavailable = enabled !== true;
  return <button type="button" onClick={play} disabled={unavailable} aria-label={label} title={unavailable ? '语音功能正在配置中' : label} className={`min-h-8 rounded-lg border border-stone-300 px-2 text-xs font-medium transition duration-200 ${unavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-stone-100'} ${compact ? '' : 'mt-2'}`}>{loading ? '加载中…' : playing ? '■ 播放中' : failed ? '重试' : label}</button>;
}
