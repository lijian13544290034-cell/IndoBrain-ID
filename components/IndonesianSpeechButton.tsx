'use client';

import { useEffect, useRef, useState } from 'react';
import { useIndonesianAudio } from '@/components/IndonesianAudioProvider';
import { track } from '@/lib/learning-profile';

let activeAudio: HTMLAudioElement | undefined;
let stopActiveAudio: (() => void) | undefined;
const audioUrlCache = new Map<string, string>();
const pendingAudio = new Map<string, Promise<string>>();

function SpeakerIcon() {
  return <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9v6h4l5 4V5L9 9Z" /><path d="M18 9.5a4 4 0 0 1 0 5" /><path d="M20.5 7a7 7 0 0 1 0 10" /></svg>;
}

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

export default function IndonesianSpeechButton({ text, compact = false, iconOnly = false }: { text: string; compact?: boolean; iconOnly?: boolean }) {
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
  const buttonText = loading ? '加载中…' : playing ? '播放中' : failed ? '重试' : '听一听';
  return <button type="button" onClick={play} disabled={unavailable} aria-label="听一听" title={unavailable ? '语音功能正在配置中' : '听一听'} className={`min-h-8 rounded-lg border border-stone-300 px-2 text-xs font-medium transition duration-200 ${unavailable ? 'cursor-not-allowed text-[var(--ib-text-secondary)] opacity-60' : 'cursor-pointer text-[#5b82c5] hover:bg-[var(--ib-primary-soft)] active:bg-[var(--ib-primary-soft)] active:text-[var(--ib-primary-strong)]'} ${compact ? '' : 'mt-2'}`}><span className="inline-flex items-center gap-1.5"><SpeakerIcon />{!iconOnly && <span>{buttonText}</span>}</span></button>;
}
