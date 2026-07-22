'use client';

import { useEffect, useState } from 'react';

let activeButton: (() => void) | undefined;

export default function IndonesianSpeechButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const stop = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  };

  const play = () => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setNotice('Audio belum tersedia di browser ini.（当前浏览器暂不支持语音。）');
      return;
    }
    if (playing) { stop(); return; }
    activeButton?.();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith('id'));
    if (voice) utterance.voice = voice;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => { setPlaying(false); setNotice('Audio belum tersedia di browser ini.（当前浏览器暂不支持语音。）'); };
    activeButton = stop;
    setNotice('');
    setPlaying(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return <span className="inline-flex items-center gap-2"><button type="button" onClick={play} aria-label="Dengarkan（听一听）" title="Dengarkan（听一听）" className={`min-h-8 cursor-pointer rounded-lg border border-stone-300 px-2 text-xs font-medium transition duration-200 hover:bg-stone-100 ${compact ? '' : 'mt-2'}`}>{playing ? '■ Memutar（播放中）' : '🔊 Dengarkan（听一听）'}</button>{notice && <span className="text-xs text-stone-500">{notice}</span>}</span>;
}
