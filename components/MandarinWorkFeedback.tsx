'use client';

import { useState, type FormEvent } from 'react';

const EXPERIENCE_OPTIONS = [
  '😊 Mudah dipahami',
  '🙂 Cukup baik',
  '😐 Biasa saja',
  '😕 Agak sulit',
] as const;

const IMPROVEMENT_OPTIONS = [
  '🔊 Audio / pengucapan',
  '🔤 Pinyin',
  '🇨🇳 Materi Mandarin',
  '🇮🇩 Penjelasan Bahasa Indonesia',
  '📱 Tampilan',
  '📚 Tingkat kesulitan',
  '💡 Lainnya',
] as const;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

type MandarinWorkFeedbackProps = {
  day: number;
  level?: 1 | 2;
  itemId?: string | null;
  showCompletionPrompt: boolean;
  onDismissCompletionPrompt: () => void;
};

export default function MandarinWorkFeedback({ day, level = 1, itemId = null, showCompletionPrompt, onDismissCompletionPrompt }: MandarinWorkFeedbackProps) {
  const [open, setOpen] = useState(false);
  const [experience, setExperience] = useState('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const openForm = () => {
    setSubmitState('idle');
    setOpen(true);
  };

  const toggleImprovement = (value: string) => {
    setImprovements((current) => current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!experience || submitState === 'submitting') return;
    setSubmitState('submitting');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: 'mandarin-work-30d',
          level,
          day,
          itemId,
          page: window.location.pathname,
          experience,
          improvements,
          comment,
          whatsapp,
        }),
      });
      const result = await response.json() as { saved?: boolean };
      if (!response.ok || !result.saved) throw new Error('feedback_not_saved');
      setSubmitState('success');
      onDismissCompletionPrompt();
    } catch {
      setSubmitState('error');
    }
  };

  return <>
    {showCompletionPrompt ? <section className="mt-5 rounded-3xl border border-[var(--ib-border-soft)] bg-[var(--ib-primary-soft)] p-4" aria-label="Permintaan masukan opsional">
      <p className="font-bold text-[var(--ib-primary-strong)]">Bagaimana pengalaman belajarmu sejauh ini?</p>
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={openForm} className="min-h-11 rounded-full bg-[var(--ib-primary)] px-4 text-sm font-bold text-white">💬 Beri Masukan</button><button type="button" onClick={onDismissCompletionPrompt} className="min-h-11 rounded-full px-4 text-sm font-semibold text-[var(--ib-text-secondary)]">Lewati</button></div>
    </section> : null}

    <footer className="mt-6 flex justify-center"><button type="button" onClick={openForm} className="min-h-11 rounded-full border border-[var(--ib-border-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ib-primary)] shadow-sm"><span className="block">💬 Beri Masukan</span><span className="block text-[11px] font-medium text-[var(--ib-text-muted)]">给我们建议</span></button></footer>

    {open ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="mandarin-feedback-title" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-[28px] sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><h2 id="mandarin-feedback-title" className="text-xl font-bold text-[var(--ib-primary-strong)]">Bantu kami membuat kursus ini lebih baik</h2><p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">Kursus ini masih terus kami kembangkan.<br/>Masukan kamu sangat membantu kami.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Tutup formulir masukan" className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--ib-bg-muted)] text-xl text-[var(--ib-text-secondary)]">×</button></div>

        {submitState === 'success' ? <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800" role="status">Terima kasih. Masukan kamu sudah terkirim.</div> : <form className="mt-6 grid gap-6" onSubmit={submit}>
          <fieldset><legend className="font-bold text-[var(--ib-text-primary)]">Bagaimana pengalaman belajarmu?</legend><div className="mt-3 grid grid-cols-2 gap-2">{EXPERIENCE_OPTIONS.map((option) => <label key={option} className={`cursor-pointer rounded-2xl border p-3 text-sm font-semibold ${experience === option ? 'border-[var(--ib-primary)] bg-[var(--ib-primary-soft)] text-[var(--ib-primary-strong)]' : 'border-[var(--ib-border-soft)] text-[var(--ib-text-secondary)]'}`}><input type="radio" name="experience" value={option} checked={experience === option} onChange={() => setExperience(option)} className="sr-only"/>{option}</label>)}</div></fieldset>

          <fieldset><legend className="font-bold text-[var(--ib-text-primary)]">Apa yang perlu diperbaiki?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{IMPROVEMENT_OPTIONS.map((option) => <label key={option} className={`cursor-pointer rounded-2xl border p-3 text-sm font-medium ${improvements.includes(option) ? 'border-[var(--ib-primary)] bg-[var(--ib-primary-soft)] text-[var(--ib-primary-strong)]' : 'border-[var(--ib-border-soft)] text-[var(--ib-text-secondary)]'}`}><input type="checkbox" checked={improvements.includes(option)} onChange={() => toggleImprovement(option)} className="sr-only"/>{option}</label>)}</div></fieldset>

          <label className="grid gap-2 font-bold text-[var(--ib-text-primary)]">Masukan kamu<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows={4} placeholder="Tulis masukan atau saran kamu di sini..." className="resize-none rounded-2xl border border-[var(--ib-border-soft)] px-4 py-3 text-sm font-normal text-[var(--ib-text-primary)] outline-none focus:border-[var(--ib-primary)]"/></label>

          <label className="grid gap-2 font-bold text-[var(--ib-text-primary)]">Nomor WhatsApp <span className="text-xs font-medium text-[var(--ib-text-muted)]">(opsional)</span><span className="text-xs font-normal leading-5 text-[var(--ib-text-secondary)]">Jika kamu bersedia kami hubungi untuk memahami masukanmu lebih lanjut.</span><input type="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} maxLength={60} autoComplete="tel" className="rounded-2xl border border-[var(--ib-border-soft)] px-4 py-3 text-sm font-normal text-[var(--ib-text-primary)] outline-none focus:border-[var(--ib-primary)]"/></label>

          {submitState === 'error' ? <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">Masukan belum terkirim. Silakan coba lagi.</p> : null}
          <button type="submit" disabled={!experience || submitState === 'submitting'} className="min-h-12 rounded-full bg-[var(--ib-primary)] px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitState === 'submitting' ? 'Mengirim...' : 'Kirim Masukan'}</button>
        </form>}

        {submitState === 'success' ? <button type="button" onClick={() => setOpen(false)} className="mt-4 min-h-11 w-full rounded-full bg-[var(--ib-primary)] px-4 font-bold text-white">Tutup</button> : null}
      </section>
    </div> : null}
  </>;
}
