'use client';

import { useEffect, useRef, useState } from 'react';

function supportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  return ['audio/mp4;codecs=mp4a.40.2','audio/mp4','audio/webm;codecs=opus','audio/webm'].find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

export default function LocalPronunciationRecorder() {
  const [state, setState] = useState<'idle'|'recording'|'ready'|'blocked'>('idle');
  const [audioUrl, setAudioUrl] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);

  const release = () => { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; };
  const clearAudio = () => { if (audioUrl) URL.revokeObjectURL(audioUrl); setAudioUrl(''); };
  useEffect(() => () => { recorder.current?.state === 'recording' && recorder.current.stop(); release(); if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  async function start() {
    try {
      clearAudio();
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = supportedMimeType();
      const instance = mimeType ? new MediaRecorder(media, { mimeType }) : new MediaRecorder(media);
      const chunks: Blob[] = [];
      stream.current = media; recorder.current = instance;
      instance.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      instance.onstop = () => { const blob = new Blob(chunks, { type: instance.mimeType || mimeType || 'audio/webm' }); setAudioUrl(URL.createObjectURL(blob)); setState('ready'); release(); };
      instance.onerror = () => { setState('blocked'); release(); };
      instance.start(); setState('recording');
    } catch { setState('blocked'); release(); }
  }
  function stop() { if (recorder.current?.state === 'recording') recorder.current.stop(); }

  return <div className="rounded-2xl border border-[var(--ib-border-soft)] bg-[var(--ib-primary-soft)] p-3">
    <p className="text-xs font-semibold text-[var(--ib-text-secondary)]">Latihan pengucapan lokal</p>
    <div className="mt-2 flex flex-wrap gap-2">
      {state !== 'recording' ? <button type="button" onClick={start} className="min-h-10 rounded-full bg-[var(--ib-primary)] px-4 text-sm font-semibold text-white">🎤 Rekam suara saya</button> : <button type="button" onClick={stop} className="min-h-10 rounded-full bg-[var(--ib-primary-strong)] px-4 text-sm font-semibold text-white">■ Berhenti</button>}
      {audioUrl ? <audio controls src={audioUrl} className="h-10 max-w-full" aria-label="Putar ulang rekaman lokal" /> : null}
    </div>
    {state === 'blocked' ? <p role="alert" className="mt-2 text-xs text-red-700">Mikrofon tidak tersedia atau izin ditolak.</p> : null}
    <p className="mt-2 text-[11px] text-[var(--ib-text-muted)]">Rekaman hanya tersimpan sementara di perangkat ini dan tidak diunggah.</p>
  </div>;
}
