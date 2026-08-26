'use client';

import { useEffect, useRef, useState } from 'react';

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
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  const request = fetch('/api/chinese-tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), signal: controller.signal })
    .then(async (response) => {
      if (!response.ok) throw new Error('Chinese TTS request failed');
      const url = URL.createObjectURL(await response.blob());
      audioUrlCache.set(text, url);
      return url;
    })
    .finally(() => {
      window.clearTimeout(timeout);
      pendingAudio.delete(text);
    });
  pendingAudio.set(text, request);
  return request;
}

function isChineseVoice(voice: SpeechSynthesisVoice) {
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();
  return lang === 'zh-cn' || lang.startsWith('zh') || name.includes('chinese') || name.includes('mandarin') || name.includes('中文') || name.includes('普通话');
}

async function loadVoices(speech: SpeechSynthesis) {
  const currentVoices = speech.getVoices();
  if (currentVoices.length > 0) return currentVoices;
  return await new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const timeout = window.setTimeout(() => resolve(speech.getVoices()), 800);
    speech.addEventListener('voiceschanged', () => {
      window.clearTimeout(timeout);
      resolve(speech.getVoices());
    }, { once: true });
  });
}

async function speakWithBrowser(text: string, onEnd: () => void) {
  const speech = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!speech) throw new Error('Browser speech is not available');
  const voice = (await loadVoices(speech)).find(isChineseVoice);
  if (!voice) throw new Error('Chinese browser voice is not available');
  speech.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice.lang || 'zh-CN';
  utterance.rate = 0.82;
  utterance.pitch = 1.05;
  utterance.voice = voice;
  stopActiveAudio = () => {
    speech.cancel();
    stopActiveAudio = undefined;
    onEnd();
  };
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  speech.speak(utterance);
}

export default function ChineseSpeechButton({ text, compact = false, label = 'Dengarkan' }: { text: string; compact?: boolean; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined);
  const stopRef = useRef<(() => void) | undefined>(undefined);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = undefined;
    audioRef.current?.pause();
    if (activeAudio === audioRef.current) activeAudio = undefined;
    if (stopActiveAudio === stop) stopActiveAudio = undefined;
    setPlaying(false);
  };

  const markEnded = () => {
    if (stopActiveAudio === stop) stopActiveAudio = undefined;
    setPlaying(false);
  };

  useEffect(() => stop, []);

  const playWithAzure = async () => {
    const audio = new Audio(await getAudioUrl(text));
    audioRef.current = audio;
    activeAudio = audio;
    stopRef.current = () => audio.pause();
    stopActiveAudio = stop;
    setPlaying(true);
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => { if (activeAudio === audio) activeAudio = undefined; markEnded(); resolve(); };
      audio.onerror = () => { if (activeAudio === audio) activeAudio = undefined; markEnded(); reject(new Error('Chinese audio playback failed')); };
      audio.play().catch(reject);
    });
  };

  const play = async () => {
    if (!/[\u3400-\u9FFF]/.test(text)) {
      setFailed(true);
      return;
    }
    if (playing || loading) { stop(); return; }
    stopActiveAudio?.();
    setFailed(false);
    setLoading(true);
    try {
      await playWithAzure();
    } catch {
      try {
        await speakWithBrowser(text, markEnded);
        setPlaying(true);
      } catch {
        setPlaying(false);
        setFailed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const visibleLabel = loading ? 'Memuat' : playing ? 'Memutar' : failed ? 'Audio belum tersedia' : label;

  return (
    <button
      type="button"
      onClick={play}
      aria-label={`${label}: ${text}`}
      title={failed ? 'Audio Mandarin belum tersedia' : label}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#b9d2ff] bg-white px-4 text-sm font-bold text-[#4f76bb] shadow-sm transition hover:bg-[#eef5ff] active:scale-[0.99] ${loading ? 'cursor-wait opacity-60' : ''} ${compact ? 'px-3 text-xs' : ''}`}
    >
      <SpeakerIcon />
      <span>{visibleLabel}</span>
    </button>
  );
}
