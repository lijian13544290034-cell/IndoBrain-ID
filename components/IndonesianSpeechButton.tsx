'use client';

import { useEffect, useRef, useState } from 'react';
import { useIndonesianAudio } from '@/components/IndonesianAudioProvider';
import { track } from '@/lib/learning-profile';

let activeAudio: HTMLAudioElement | undefined;
let stopActiveAudio: (() => void) | undefined;
const audioUrlCache = new Map<string, string>();
const pendingAudio = new Map<string, Promise<string>>();

type SpeechLanguage = 'indonesian' | 'chinese';

async function getAudioUrl(text: string, language: SpeechLanguage) {
  const requestKey = `${language}:${text}`;
  const cached = audioUrlCache.get(requestKey);
  if (cached) return cached;
  const pending = pendingAudio.get(requestKey);
  if (pending) return pending;
  const request = fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, language }) })
    .then(async (response) => {
      if (!response.ok) throw new Error('TTS request failed');
      const url = URL.createObjectURL(await response.blob());
      audioUrlCache.set(requestKey, url);
      pendingAudio.delete(requestKey);
      return url;
    })
    .catch((error) => { pendingAudio.delete(requestKey); throw error; });
  pendingAudio.set(requestKey, request);
  return request;
}

export default function IndonesianSpeechButton({ text, compact = false, language = 'indonesian', label }: { text: string; compact?: boolean; language?: SpeechLanguage; label?: string }) {
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
    if (enabled !== true || (language === 'indonesian' && /[\u3400-\u9FFF]/.test(text)) || (language === 'chinese' && !/[\u3400-\u9FFF]/.test(text))) return;
    if (playing || loading) { stop(); return; }
    stopActiveAudio?.();
    setFailed(false);
    setLoading(true);
    try {
      const audio = new Audio(await getAudioUrl(text, language));
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
  const actionLabel = label ?? (language === 'chinese' ? '🔊 播放发音' : '🔊 听一听');
  return <button type="button" onClick={play} disabled={unavailable} aria-label={actionLabel} title={unavailable ? '语音暂时不可用' : actionLabel} className={`min-h-8 rounded-lg border border-stone-300 px-2 text-xs font-medium transition duration-200 ${unavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-stone-100'} ${compact ? '' : 'mt-2'}`}>{loading ? '加载中…' : playing ? '■ 播放中' : failed ? '语音暂时不可用' : actionLabel}</button>;
}
