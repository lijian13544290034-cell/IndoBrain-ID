'use client';

import { useEffect, useRef, useState } from 'react';
import { useIndonesianAudio } from '@/components/IndonesianAudioProvider';
import { isIndonesianVoice } from '@/lib/indonesian-voice';
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

function getBrowserSpeech(): SpeechSynthesis | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.speechSynthesis;
}

function pickIndonesianVoice(voices: SpeechSynthesisVoice[]) {
  return voices.find(isIndonesianVoice);
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
  const speech = getBrowserSpeech();
  if (!speech) throw new Error('Browser speech is not available');
  const voice = pickIndonesianVoice(await loadVoices(speech));
  if (!voice) throw new Error('Indonesian browser voice is not available');

  speech.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  utterance.rate = 0.92;
  utterance.pitch = 1;
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

export default function IndonesianSpeechButton({ text, compact = false, iconOnly = false }: { text: string; compact?: boolean; iconOnly?: boolean }) {
  const azureConfigured = useIndonesianAudio();
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

  useEffect(() => () => stop(), []);

  const markEnded = () => {
    if (stopActiveAudio === stop) stopActiveAudio = undefined;
    setPlaying(false);
  };

  const playWithAzure = async () => {
    const audio = new Audio(await getAudioUrl(text));
    audioRef.current = audio;
    activeAudio = audio;
    stopRef.current = () => audio.pause();
    stopActiveAudio = stop;
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => { if (activeAudio === audio) activeAudio = undefined; markEnded(); resolve(); };
      audio.onerror = () => { if (activeAudio === audio) activeAudio = undefined; markEnded(); reject(new Error('Azure audio playback failed')); };
      audio.play().then(resolve).catch(reject);
    });
  };

  const play = async () => {
    if (/[\u3400-\u9FFF]/.test(text)) {
      setFailed(true);
      return;
    }
    if (playing || loading) { stop(); return; }
    stopActiveAudio?.();
    setFailed(false);
    setLoading(true);
    try {
      if (azureConfigured !== false) {
        await playWithAzure();
      } else {
        await speakWithBrowser(text, markEnded);
      }
      track('audio_played', 'audio');
      setPlaying(true);
    } catch {
      try {
        await speakWithBrowser(text, markEnded);
        track('audio_played', 'audio');
        setPlaying(true);
      } catch {
        setPlaying(false);
        setFailed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const checking = azureConfigured === null;
  const buttonText = loading ? '加载中…' : playing ? '播放中' : failed ? '语音暂不可用' : '听一听';
  const title = failed ? '未找到可用的印尼语语音' : azureConfigured === false ? '使用浏览器印尼语语音朗读' : '听一听';

  return (
    <button
      type="button"
      onClick={play}
      disabled={checking}
      aria-label="听一听"
      title={title}
      className={`min-h-8 rounded-lg border border-stone-300 px-2 text-xs font-medium transition duration-200 ${checking ? 'cursor-wait text-[var(--ib-text-secondary)] opacity-60' : 'cursor-pointer text-[#5b82c5] hover:bg-[var(--ib-primary-soft)] active:bg-[var(--ib-primary-soft)] active:text-[var(--ib-primary-strong)]'} ${compact ? '' : 'mt-2'}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <SpeakerIcon />
        {!iconOnly && <span>{buttonText}</span>}
      </span>
    </button>
  );
}
