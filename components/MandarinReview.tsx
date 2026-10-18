'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ChineseSpeechButton from '@/components/ChineseSpeechButton';
import { subscribeCoachProfile } from '@/lib/mandarin-ai-coach-profile';
import { resolveMandarinReviewItems, type MandarinReviewItem, type MandarinReviewReason, type MandarinReviewStatus } from '@/lib/mandarin-coach-review';
import { subscribePersonalization } from '@/lib/mandarin-coach-personalization-profile';
import type { MandarinCoachCurriculumPayload } from '@/lib/mandarin-coach-curriculum-types';
import { readMandarinLearningLocalSnapshot } from '@/lib/mandarin-learning-local-data';

const reasonLabels: Record<MandarinReviewReason, string> = {
  SAVED_FOR_REVIEW: 'Kamu menyimpan ungkapan ini untuk diulas.',
  NEEDS_REVIEW: 'Latihan sebelumnya menunjukkan bahwa ungkapan ini perlu diulang.',
  DUE: 'Jadwal ulasan ungkapan ini sudah tiba.',
};

const statusLabels: Record<MandarinReviewStatus, string> = {
  PENDING: 'Perlu diulas',
  DUE: 'Sudah jatuh tempo',
  REVIEWED: 'Pernah diulas',
  MASTERED: 'Sudah dikuasai',
};

export default function MandarinReview({ curriculum }: { curriculum: MandarinCoachCurriculumPayload }) {
  const [items, setItems] = useState<MandarinReviewItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sync = () => {
      const snapshot = readMandarinLearningLocalSnapshot(curriculum.lessons);
      setItems(resolveMandarinReviewItems(snapshot.coach, snapshot.personalization));
      setLoaded(true);
    };
    sync();
    const unsubscribeCoach = subscribeCoachProfile(sync);
    const unsubscribePersonalization = subscribePersonalization(sync);
    const timer = window.setInterval(sync, 60_000);
    return () => {
      unsubscribeCoach();
      unsubscribePersonalization();
      window.clearInterval(timer);
    };
  }, [curriculum.lessons]);

  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-6 text-[var(--ib-text-primary)] sm:py-10">
    <div className="mx-auto w-full max-w-4xl">
      <header className="rounded-[32px] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-8">
        <p className="text-sm font-bold text-[var(--ib-primary)]">尼会说 · IndoBrain</p>
        <h1 className="mt-3 text-3xl font-bold text-[var(--ib-primary-strong)] sm:text-5xl">Ulasan</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ib-text-secondary)]">Ulangi ungkapan yang kamu simpan, masih sulit, atau sudah masuk jadwal ulasan.</p>
      </header>

      {loaded && items.length === 0 ? <section className="mt-5 rounded-3xl border border-dashed border-[var(--ib-border-soft)] bg-white p-8 text-center shadow-[var(--ib-shadow-card)]">
        <span className="text-4xl" aria-hidden>↻</span>
        <h2 className="mt-4 text-xl font-bold text-[var(--ib-primary-strong)]">Belum ada materi untuk diulas</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">Materi akan muncul setelah kamu menyimpannya untuk ulasan, memerlukan latihan lagi, atau jadwal ulasannya tiba.</p>
        <Link href="/learn-chinese/ai-coach" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--ib-primary)] px-5 text-sm font-bold text-white">Buka AI Coach</Link>
      </section> : null}

      {!loaded ? <p role="status" className="mt-5 rounded-2xl bg-white p-4 text-sm text-[var(--ib-text-secondary)]">Memuat materi ulasan…</p> : null}

      {items.length > 0 ? <section className="mt-5 grid gap-4 md:grid-cols-2" aria-label="Daftar ulasan Mandarin">
        {items.map((item) => <article key={item.key} className="min-w-0 rounded-3xl border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">{item.day ? `Day ${item.day} · ` : ''}{item.courseTitle}</p>
            <span className="rounded-full bg-[var(--ib-primary-soft)] px-3 py-1 text-[10px] font-bold text-[var(--ib-primary)]">{statusLabels[item.status]}</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-[var(--ib-text-muted)]">{item.lessonTitle}</p>
          <p lang="zh-CN" className="mt-4 break-words text-3xl font-bold leading-tight text-[var(--ib-primary-strong)]">{item.chinese}</p>
          <p className="mt-2 break-words text-base font-semibold leading-7 text-[var(--ib-primary)]">{item.pinyin}</p>
          <p lang="id" className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{item.indonesian}</p>
          <ul className="mt-4 grid gap-2 rounded-2xl bg-[var(--ib-bg-muted)] p-4 text-xs leading-5 text-[var(--ib-text-secondary)]">
            {item.reasons.map((reason) => <li key={reason}>• {reasonLabels[reason]}</li>)}
            <li>• {item.reviewCount > 0 ? `Latihan ulang tercatat: ${item.reviewCount} kali.` : 'Belum ada bukti latihan ulang yang tercatat.'}</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <ChineseSpeechButton text={item.chinese} compact />
            <Link href={item.href} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--ib-primary)] px-4 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2">Latihan di AI Coach</Link>
          </div>
        </article>)}
      </section> : null}
    </div>
  </main>;
}
