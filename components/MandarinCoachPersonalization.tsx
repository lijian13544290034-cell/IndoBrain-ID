'use client';

import { useEffect, useState } from 'react';
import {
  createDefaultLearnerProfile,
  generateSevenDayPlan,
  selectNextBestAction,
  type CareerGoalId,
  type LearnerLevel,
  type LearnerProfileV1,
  type OccupationId,
  type PersonalizationStateV1,
} from '@/lib/mandarin-coach-personalization';
import { readPersonalizationState, saveLearnerProfile, subscribePersonalization } from '@/lib/mandarin-coach-personalization-profile';
import type { MandarinCoachCurriculumPayload } from '@/lib/mandarin-coach-curriculum-types';
import { mandarinNavigationMeta, mandarinNavigationTitleId, mandarinNavigationTitleZh } from '@/lib/mandarin-coach-navigation';

const occupations: Array<{ value: OccupationId; label: string }> = [
  { value: 'FACTORY', label: 'Pabrik / produksi' }, { value: 'SALES', label: 'Sales / penjualan' },
  { value: 'LOGISTICS', label: 'Gudang / logistik' }, { value: 'CONSTRUCTION', label: 'Konstruksi' },
  { value: 'OFFICE', label: 'Kantor / administrasi' }, { value: 'HOSPITALITY', label: 'Layanan / hospitality' },
  { value: 'OTHER', label: 'Lainnya' },
];
const goals: Array<{ value: CareerGoalId; label: string }> = [
  { value: 'BASIC_COMMUNICATION', label: 'Komunikasi Mandarin dasar' },
  { value: 'UNDERSTAND_INSTRUCTIONS', label: 'Memahami instruksi kerja' },
  { value: 'REPORT_PROGRESS', label: 'Melaporkan progres dan masalah' },
  { value: 'SALES_NEGOTIATION', label: 'Penjualan, harga, dan pemasok' },
  { value: 'WAREHOUSE_LOGISTICS', label: 'Gudang, stok, dan pengiriman' },
  { value: 'CONSTRUCTION_SAFETY', label: 'Konstruksi dan keselamatan' },
  { value: 'OFFICE_COMMUNICATION', label: 'Komunikasi kantor' },
  { value: 'CUSTOM', label: 'Tujuan kerja lainnya' },
];

export default function MandarinCoachPersonalization({ curriculum, onStart }: { curriculum: MandarinCoachCurriculumPayload; onStart: (lessonId: string) => void }) {
  const [state, setState] = useState<PersonalizationStateV1 | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LearnerProfileV1>(() => createDefaultLearnerProfile());

  useEffect(() => {
    const sync = () => { const next = readPersonalizationState(); setState(next); setDraft(next.profile); };
    sync();
    return subscribePersonalization(sync);
  }, []);

  function save(skipped: boolean) {
    const now = new Date().toISOString();
    const profile: LearnerProfileV1 = skipped
      ? { ...createDefaultLearnerProfile(now), onboardingCompleted: true, skipped: true }
      : { ...draft, onboardingCompleted: true, skipped: false, occupationLabel: occupations.find((item) => item.value === draft.occupation)?.label || draft.occupationLabel, updatedAt: now };
    const plan = generateSevenDayPlan(profile, curriculum, now);
    const next = saveLearnerProfile(profile, plan);
    setState(next);
    setDraft(profile);
    setEditing(false);
  }

  if (!state) return <section className="mt-6 rounded-3xl bg-[var(--ib-bg-muted)] p-5" aria-busy="true">Menyiapkan rencana belajar…</section>;
  if (!state.profile.onboardingCompleted || editing) return <section className="mt-6 rounded-3xl border border-[var(--ib-border-soft)] bg-[var(--ib-bg-muted)] p-5" aria-labelledby="learner-profile-title">
    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Profil belajar singkat · dapat dilewati</p>
    <h2 id="learner-profile-title" className="mt-2 text-xl font-bold text-[var(--ib-primary-strong)]">Apa yang paling kamu butuhkan di tempat kerja?</h2>
    <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">Jawaban disimpan hanya di browser ini. Tidak dikirim ke database pribadi.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-[var(--ib-text-secondary)]">Pekerjaan
        <select value={draft.occupation} onChange={(event) => setDraft((current) => ({ ...current, occupation: event.target.value as OccupationId }))} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--ib-border-soft)] bg-white px-3 text-[var(--ib-text-primary)]">
          <option value="SKIPPED">Pilih pekerjaan</option>{occupations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-[var(--ib-text-secondary)]">Posisi / tugas
        <input value={draft.jobRole} onChange={(event) => setDraft((current) => ({ ...current, jobRole: event.target.value.slice(0, 80) }))} placeholder="Contoh: operator mesin, sales toko" className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--ib-border-soft)] bg-white px-3 text-[var(--ib-text-primary)]" />
      </label>
      <label className="text-sm font-semibold text-[var(--ib-text-secondary)]">Tujuan utama
        <select value={draft.goal} onChange={(event) => setDraft((current) => ({ ...current, goal: event.target.value as CareerGoalId }))} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--ib-border-soft)] bg-white px-3 text-[var(--ib-text-primary)]">
          {goals.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-[var(--ib-text-secondary)]">Tingkat Mandarin
        <select value={draft.selfReportedLevel} onChange={(event) => setDraft((current) => ({ ...current, selfReportedLevel: event.target.value as LearnerLevel }))} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--ib-border-soft)] bg-white px-3 text-[var(--ib-text-primary)]">
          <option value="BEGINNER">Pemula total</option><option value="ELEMENTARY">Sudah tahu sedikit</option><option value="INTERMEDIATE">Bisa percakapan sederhana</option>
        </select>
      </label>
      <label className="text-sm font-semibold text-[var(--ib-text-secondary)] sm:col-span-2">Situasi kerja yang ingin dilatih
        <input value={draft.customScenario} onChange={(event) => setDraft((current) => ({ ...current, customScenario: event.target.value.slice(0, 120) }))} placeholder="Contoh: melapor mesin rusak kepada bos" className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--ib-border-soft)] bg-white px-3 text-[var(--ib-text-primary)]" />
      </label>
      {draft.goal === 'CUSTOM' ? <label className="text-sm font-semibold text-[var(--ib-text-secondary)] sm:col-span-2">Tujuan khusus
        <input value={draft.customGoal} onChange={(event) => setDraft((current) => ({ ...current, customGoal: event.target.value.slice(0, 120) }))} placeholder="Contoh: berbicara dengan pelanggan dari Tiongkok" className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--ib-border-soft)] bg-white px-3 text-[var(--ib-text-primary)]" />
      </label> : null}
      <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold text-[var(--ib-text-secondary)]">Waktu belajar per hari</legend><div className="mt-2 flex gap-3">{([5, 10] as const).map((minutes) => <label key={minutes} className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[var(--ib-border-soft)] bg-white px-3 font-semibold"><input type="radio" name="daily-minutes" checked={draft.dailyMinutes === minutes} onChange={() => setDraft((current) => ({ ...current, dailyMinutes: minutes }))} />{minutes} menit</label>)}</div></fieldset>
    </div>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => save(false)} className="min-h-12 flex-1 rounded-full bg-[var(--ib-primary-strong)] px-5 font-bold text-white">Buat rencana 7 hari</button><button type="button" onClick={() => save(true)} className="min-h-12 rounded-full border border-[var(--ib-border-soft)] px-5 font-bold text-[var(--ib-primary)]">Lewati · pakai jalur standar</button></div>
  </section>;

  const action = selectNextBestAction(state);
  return <section className="mt-6 rounded-3xl border border-[var(--ib-border-soft)] bg-[var(--ib-primary-soft)] p-5" aria-labelledby="personal-plan-title">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Rencana pribadi · 7 hari</p><h2 id="personal-plan-title" className="mt-2 text-xl font-bold text-[var(--ib-primary-strong)]">{state.plan?.goalLabel || 'Jalur belajar standar'}</h2></div><button type="button" onClick={() => setEditing(true)} className="min-h-10 rounded-full border border-[var(--ib-border-soft)] bg-white px-4 text-sm font-bold text-[var(--ib-primary)]">Ubah profil</button></div>
    <p className="mt-3 text-sm leading-6 text-[var(--ib-text-secondary)]">Saran berikutnya: {action.reason}</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{state.plan?.items.map((item) => {
      const lesson = curriculum.lessons.find((entry) => entry.id === item.lessonId);
      if (!lesson) return null;
      return <button key={item.dayIndex} type="button" onClick={() => onStart(item.lessonId)} className="min-w-0 rounded-2xl border border-[var(--ib-border-soft)] bg-white p-4 text-left transition hover:border-[var(--ib-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2"><span className="text-xs font-bold text-[var(--ib-primary)]">Hari rencana {item.dayIndex} · {item.durationMinutes} menit</span><span className="mt-1 block font-bold text-[var(--ib-primary-strong)]">{mandarinNavigationTitleId(lesson)}</span><span lang="zh-CN" className="mt-1 block text-xs text-[var(--ib-text-muted)]">{mandarinNavigationTitleZh(lesson)}</span><span className="mt-2 block text-xs leading-5 text-[var(--ib-text-secondary)]">{mandarinNavigationMeta(lesson, item.expressionIds.length)} · {item.reason}</span></button>;
    })}</div>
    {state.plan?.contentGaps.length ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Materi belum tersedia:</strong> {state.plan.contentGaps.join(' ')}</div> : null}
    <p className="mt-4 text-xs leading-5 text-[var(--ib-text-muted)]">Kamu tetap bisa memilih dan belajar Day 1–60 dalam urutan asli di bawah.</p>
  </section>;
}
