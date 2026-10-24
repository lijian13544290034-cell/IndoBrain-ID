'use client';

import { useState } from 'react';

type Props = {
  conversationPerSession: number;
  sessionHours: number;
};

export default function GuestModeEntry({ conversationPerSession, sessionHours }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function start() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/guest/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ remember: true, next: '/learn-chinese/ai-coach' }),
      });
      const payload = await response.json().catch(() => null) as { reviewPath?: string; error?: string } | null;
      if (!response.ok) {
        setMessage(payload?.error || 'Uji coba gratis belum bisa dimulai. Coba lagi sebentar.');
        return;
      }
      window.location.assign(payload?.reviewPath || '/learn-chinese/ai-coach');
    } catch {
      setMessage('Koneksi terputus. Periksa internet lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return <section className="overflow-hidden rounded-[28px] border border-[var(--ib-border-soft)] bg-white shadow-[var(--ib-shadow-card)]">
    <div className="bg-[var(--ib-primary)] px-6 py-7 text-white">
      <p className="text-xs font-bold uppercase tracking-widest text-white/80">Mode Tamu · Uji Coba Gratis</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight">Belajar Mandarin untuk Kerja</h1>
      <p className="mt-3 text-sm leading-6 text-white/90">Coba AI Coach Mandarin langsung dari browser HP kamu. Tanpa daftar, tanpa nomor HP, tanpa kata sandi.</p>
    </div>

    <div className="px-6 py-6">
      <ul className="space-y-3 text-sm leading-6 text-[var(--ib-text-secondary)]">
        <li className="flex gap-2"><span aria-hidden>✅</span><span><strong className="text-[var(--ib-text-primary)]">Tanpa registrasi</strong> — tidak perlu nomor HP, email, atau kata sandi.</span></li>
        <li className="flex gap-2"><span aria-hidden>✅</span><span><strong className="text-[var(--ib-text-primary)]">Langsung bicara dengan AI Coach</strong> — tanya, dengar pelafalan, dan latih kalimat kerja.</span></li>
        <li className="flex gap-2"><span aria-hidden>✅</span><span><strong className="text-[var(--ib-text-primary)]">Penjelasan kata</strong> — setiap kalimat bisa dibuka untuk melihat arti per kata.</span></li>
        <li className="flex gap-2"><span aria-hidden>✅</span><span><strong className="text-[var(--ib-text-primary)]">Tidak perlu install aplikasi</strong> — cukup buka di browser.</span></li>
      </ul>

      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="mt-6 min-h-14 w-full rounded-2xl bg-[var(--ib-primary)] px-5 text-base font-bold text-white transition hover:bg-[var(--ib-primary-strong)] disabled:opacity-60"
      >
        {loading ? 'Menyiapkan sesi…' : 'Mulai Belajar Sekarang'}
      </button>

      {message ? <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null}

      <p className="mt-4 text-center text-xs leading-5 text-[var(--ib-text-muted)]">
        Sesi uji coba berlaku {sessionHours} jam dan maksimal {conversationPerSession} percakapan AI.
        Progres belajar disimpan di browser ini — tanpa membuat akun.
      </p>
    </div>
  </section>;
}
