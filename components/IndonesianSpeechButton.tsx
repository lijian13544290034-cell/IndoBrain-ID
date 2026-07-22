'use client';

import { useEffect, useState } from 'react';

let activeButton: (() => void) | undefined;

const unavailableMessage = 'Suara Bahasa Indonesia belum tersedia di browser ini.（当前浏览器没有可用的印尼语音色。）';

function selectIndonesianVoice(voices: SpeechSynthesisVoice[]) {
  const exact = voices.find((voice) => voice.lang.toLowerCase() === 'id-id');
  const locale = voices.find((voice) => voice.lang.toLowerCase().startsWith('id'));
  const named = voices.find((voice) => /bahasa indonesia|indonesian|indonesia/i.test(voice.name));
  return { voice: exact ?? locale ?? named ?? null, exact: Boolean(exact), indonesianVoices: voices.filter((voice) => voice.lang.toLowerCase().startsWith('id')) };
}

export default function IndonesianSpeechButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  function stop() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }

  useEffect(() => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { setSupported(false); return; }
    const refreshVoices = () => {
      const selection = selectIndonesianVoice(window.speechSynthesis.getVoices());
      setVoice(selection.voice);
      setSupported(true);
      if (process.env.NODE_ENV !== 'production') console.debug('[IndoBrain Indonesian speech]', {
        selectedVoice: selection.voice?.name ?? null,
        selectedLocale: selection.voice?.lang ?? null,
        exactIdIdMatch: selection.exact,
        availableIndonesianVoices: selection.indonesianVoices.map((item) => ({ name: item.name, lang: item.lang })),
      });
    };
    refreshVoices();
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices);
      window.speechSynthesis.cancel();
      if (activeButton === stop) activeButton = undefined;
    };
  // stop is intentionally stable for the active button cleanup below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = () => {
    if (!voice || !supported || /[\u3400-\u9FFF]/.test(text)) return;
    if (playing) { stop(); return; }
    activeButton?.();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang || 'id-ID';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    activeButton = stop;
    setPlaying(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const unavailable = supported === false || (supported === true && !voice);
  return <span className="inline-flex items-center gap-2"><button type="button" onClick={play} disabled={!voice || !supported} aria-label="Dengarkan（听一听）" title="Dengarkan（听一听）" className={`min-h-8 rounded-lg border border-stone-300 px-2 text-xs font-medium transition duration-200 ${voice && supported ? 'cursor-pointer hover:bg-stone-100' : 'cursor-not-allowed opacity-50'} ${compact ? '' : 'mt-2'}`}>{playing ? '■ Memutar（播放中）' : '🔊 Dengarkan（听一听）'}</button>{unavailable && <span className="text-xs text-stone-500">{unavailableMessage}</span>}</span>;
}
