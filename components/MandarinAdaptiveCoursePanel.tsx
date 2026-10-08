'use client';

import { useEffect, useMemo, useState } from 'react';
import { careerLabel, type LearningPurpose, type MandarinLevel, type PersonalLearningPlan } from '@/lib/mandarin-adaptive-course';
import { readAdaptiveCourseState, subscribeAdaptiveCourse, updateAdaptiveLearner, type AdaptiveProfileForm } from '@/lib/mandarin-adaptive-course-profile';
import { mandarinNavigationTitleId } from '@/lib/mandarin-coach-navigation';
import type { MandarinCoachCurriculumPayload } from '@/lib/mandarin-coach-curriculum-types';

const blankForm: AdaptiveProfileForm = {
  currentJob: '', desiredJob: '', purpose: 'CURRENT_JOB', mandarinLevel: 'ZERO', immediateProblem: '', dailyStudyMinutes: 15, targetDate: null,
};

function adaptiveTelemetry(sessionId: string, event: string, data: Record<string, unknown>) {
  void fetch('/api/mandarin-coach/telemetry', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, event, data: { page: '/learn-chinese/ai-coach', lesson_id: 'adaptive-course-v1', ...data } }), keepalive: true,
  });
}

function SummaryList({ title, values, empty }: { title: string; values: string[]; empty: string }) {
  return <div className="rounded-2xl border border-[var(--ib-border-soft)] bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-[var(--ib-text-muted)]">{title}</p>{values.length ? <ul className="mt-2 space-y-1 text-sm text-[var(--ib-text-primary)]">{values.map((value) => <li key={value}>• {value}</li>)}</ul> : <p className="mt-2 text-sm text-[var(--ib-text-muted)]">{empty}</p>}</div>;
}

export default function MandarinAdaptiveCoursePanel({ curriculum, onStart }: { curriculum: MandarinCoachCurriculumPayload; onStart: (lessonId: string, expressionId?: string) => void }) {
  const [form, setForm] = useState<AdaptiveProfileForm>(blankForm);
  const [plan, setPlan] = useState<PersonalLearningPlan | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = () => {
      const state = readAdaptiveCourseState();
      if (state.learner) {
        const { currentJob, desiredJob, purpose, mandarinLevel, immediateProblem, dailyStudyMinutes, targetDate } = state.learner;
        setForm({ currentJob, desiredJob, purpose, mandarinLevel, immediateProblem, dailyStudyMinutes, targetDate });
      }
      setPlan(state.lastPlan);
    };
    load();
    return subscribeAdaptiveCourse(load);
  }, []);

  const lessonNames = useMemo(() => new Map(curriculum.catalog.map((entry) => [entry.id, `${entry.day ? `Hari ${entry.day}` : 'Topik'} · ${mandarinNavigationTitleId(entry)}`])), [curriculum.catalog]);

  function createPlan() {
    const before = readAdaptiveCourseState();
    const next = updateAdaptiveLearner(form, curriculum);
    const nextPlan = next.lastPlan;
    if (!nextPlan || !next.learner) return;
    setPlan(nextPlan);
    adaptiveTelemetry(next.sessionId, 'learner_profile_updated', {
      career_family: next.learner.careerFamily, purpose: next.learner.purpose, mandarin_level: next.learner.mandarinLevel,
      daily_minutes: next.learner.dailyStudyMinutes, goal_changed: before.learner?.careerFamily !== next.learner.careerFamily,
    });
    if (before.learner?.careerFamily && before.learner.careerFamily !== next.learner.careerFamily) adaptiveTelemetry(next.sessionId, 'career_goal_changed', { from: before.learner.careerFamily, to: next.learner.careerFamily });
    adaptiveTelemetry(next.sessionId, 'personal_plan_generated', {
      career_family: nextPlan.careerFamily, urgent: nextPlan.urgent, needs_clarification: nextPlan.needsClarification,
      lesson_ids: [...new Set(nextPlan.today.map((unit) => unit.lessonId))], capabilities: [...new Set(nextPlan.today.map((unit) => unit.capability))],
    });
    for (const gap of nextPlan.gaps) adaptiveTelemetry(next.sessionId, 'knowledge_gap_demand', { candidate_id: gap.id, requested_capability: gap.requestedCapability, verification_status: gap.verificationStatus });
  }

  const todayLabels = plan?.today.map((unit) => `${unit.chinese} · ${unit.indonesianMeaning || unit.capability}`) ?? [];
  const reviewLabels = plan?.review.map((unit) => unit.chinese) ?? [];
  const masteredLabels = plan?.mastered.map((unit) => unit.chinese) ?? [];
  const first = plan?.today[0];

  return <section className="mt-6 rounded-[28px] border border-[var(--ib-border-soft)] bg-[var(--ib-primary-soft)] p-4 sm:p-5" aria-labelledby="adaptive-course-title">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Adaptive Course Engine V1</p><h2 id="adaptive-course-title" className="mt-1 text-2xl font-bold text-[var(--ib-primary-strong)]">Kursus Saya <span className="text-base font-semibold">· 我的课程</span></h2><p className="mt-1 text-sm leading-6 text-[var(--ib-text-secondary)]">Rencana pribadi dari materi IndoBrain yang sudah diverifikasi.</p></div><button type="button" onClick={() => setExpanded((value) => !value)} className="min-h-10 shrink-0 rounded-full border border-[var(--ib-border-soft)] bg-white px-4 text-sm font-bold text-[var(--ib-primary)]">{expanded || !plan ? 'Tutup' : 'Ubah tujuan'}</button></div>

    {expanded || !plan ? <form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); createPlan(); setExpanded(false); }}>
      <label className="grid gap-1 text-sm font-semibold text-[var(--ib-primary-strong)]">Apa tujuanmu belajar Mandarin?<select value={form.purpose} onChange={(event) => setForm((value) => ({ ...value, purpose: event.target.value as LearningPurpose }))} className="min-h-12 rounded-xl border border-[var(--ib-border-soft)] bg-white px-3 font-normal text-[var(--ib-text-primary)]"><option value="CURRENT_JOB">Untuk pekerjaan saya sekarang</option><option value="NEW_JOB">Untuk mencari pekerjaan baru</option><option value="CHINESE_BOSS">Untuk bicara dengan bos China</option><option value="BUSINESS">Untuk bisnis</option><option value="OTHER">Lainnya</option></select></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-sm font-semibold text-[var(--ib-primary-strong)]">Pekerjaan sekarang<input value={form.currentJob} onChange={(event) => setForm((value) => ({ ...value, currentJob: event.target.value }))} placeholder="contoh: gudang" className="min-h-12 rounded-xl border border-[var(--ib-border-soft)] bg-white px-3 font-normal text-[var(--ib-text-primary)]" /></label><label className="grid gap-1 text-sm font-semibold text-[var(--ib-primary-strong)]">Pekerjaan yang dituju<input value={form.desiredJob} onChange={(event) => setForm((value) => ({ ...value, desiredJob: event.target.value }))} placeholder="contoh: purchasing" className="min-h-12 rounded-xl border border-[var(--ib-border-soft)] bg-white px-3 font-normal text-[var(--ib-text-primary)]" /></label></div>
      <label className="grid gap-1 text-sm font-semibold text-[var(--ib-primary-strong)]">Kemampuan Mandarin sekarang<select value={form.mandarinLevel} onChange={(event) => setForm((value) => ({ ...value, mandarinLevel: event.target.value as MandarinLevel }))} className="min-h-12 rounded-xl border border-[var(--ib-border-soft)] bg-white px-3 font-normal text-[var(--ib-text-primary)]"><option value="ZERO">Mulai dari nol</option><option value="BEGINNER">Bisa sedikit</option><option value="BASIC">Sudah paham dasar</option></select></label>
      <label className="grid gap-1 text-sm font-semibold text-[var(--ib-primary-strong)]">Apa yang paling mendesak?<textarea value={form.immediateProblem} onChange={(event) => setForm((value) => ({ ...value, immediateProblem: event.target.value }))} placeholder="contoh: Besok interview kerja" rows={2} className="rounded-xl border border-[var(--ib-border-soft)] bg-white p-3 font-normal text-[var(--ib-text-primary)]" /></label>
      <fieldset><legend className="text-sm font-semibold text-[var(--ib-primary-strong)]">Waktu belajar per hari</legend><div className="mt-2 flex flex-wrap gap-2">{([5, 15, 30] as const).map((minutes) => <label key={minutes} className={`rounded-full border px-4 py-2 text-sm font-bold ${form.dailyStudyMinutes === minutes ? 'border-[var(--ib-primary)] bg-white text-[var(--ib-primary)]' : 'border-[var(--ib-border-soft)] text-[var(--ib-text-secondary)]'}`}><input type="radio" className="sr-only" checked={form.dailyStudyMinutes === minutes} onChange={() => setForm((value) => ({ ...value, dailyStudyMinutes: minutes }))} />{minutes} menit</label>)}</div></fieldset>
      <button type="submit" className="min-h-13 rounded-full bg-[var(--ib-primary)] px-5 font-bold text-white">Buat rencana belajar saya</button>
    </form> : null}

    {plan ? <div className="mt-5"><div className="rounded-2xl bg-white p-4"><p className="text-sm text-[var(--ib-text-muted)]">Target</p><p className="mt-1 text-xl font-bold text-[var(--ib-primary-strong)]">{careerLabel(plan.careerFamily)}</p><p className="mt-1 text-sm text-[var(--ib-text-secondary)]">Fokus: {plan.currentFocus}{plan.urgent ? ' · Prioritas mendesak' : ''}</p>{plan.needsClarification ? <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">Posisi kerja belum cukup jelas. Pilih bidang kerja agar rencana tidak menebak kariermu.</p> : null}</div><div className="mt-3 grid gap-3 md:grid-cols-3"><SummaryList title="Hari ini" values={todayLabels} empty="Lengkapi tujuanmu untuk membuat rencana."/><SummaryList title="Perlu diulang" values={reviewLabels} empty="Belum ada review yang jatuh tempo."/><SummaryList title="Sudah dikuasai" values={masteredLabels} empty="Hasil latihan akan muncul di sini."/></div>{plan.gaps.length ? <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Perlu verifikasi konten:</strong> {plan.gaps.map((gap) => gap.requestedCapability).join(', ')}. Ini hanya kandidat review, bukan materi publik.</div> : null}{first ? <button type="button" onClick={() => onStart(first.lessonId, first.expressionId)} className="mt-4 min-h-13 w-full rounded-full bg-[var(--ib-primary-strong)] px-5 font-bold text-white">Mulai latihan dengan AI Coach · {lessonNames.get(first.lessonId)}</button> : null}</div> : null}
  </section>;
}
