'use client';

import { useEffect, useRef, useState } from 'react';

export default function AiCoachRecorder({ disabled, busy, onRecorded }: { disabled?: boolean; busy?: boolean; onRecorded: (audio: Blob) => Promise<void> }) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  async function start() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      streamRef.current = stream;
      const preferred = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size > 128) await onRecorded(blob);
        else setError('Suara belum terekam. Coba lagi.');
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError('Mikrofon tidak dapat digunakan. Izinkan akses mikrofon lalu coba lagi.');
    }
  }

  function stop() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }

  return <div>
    <button
      type="button"
      disabled={disabled || busy}
      onClick={recording ? stop : start}
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${recording ? 'bg-rose-600' : 'bg-[var(--ib-primary)]'}`}
      aria-label={recording ? 'Berhenti merekam' : 'Mulai merekam'}
    >
      {busy ? 'AI sedang memeriksa…' : recording ? '■ Berhenti & periksa' : '🎙️ Ucapkan sekarang'}
    </button>
    {recording ? <p role="status" className="mt-2 text-center text-xs font-semibold text-rose-700">Merekam… ucapkan kalimat Mandarin, lalu tekan berhenti.</p> : null}
    {error ? <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p> : null}
  </div>;
}
