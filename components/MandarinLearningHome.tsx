'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { emptyMandarinWorkProfile, readMandarinWorkProfile, subscribeMandarinWorkProfile } from '@/lib/mandarin-work-profile';
import { readPersonalizationState, subscribePersonalization } from '@/lib/mandarin-coach-personalization-profile';

export default function MandarinLearningHome() {
  const [courseProfile, setCourseProfile] = useState(emptyMandarinWorkProfile());
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profileLabel, setProfileLabel] = useState('');

  useEffect(() => {
    const syncCourse = () => setCourseProfile(readMandarinWorkProfile());
    const syncPersonalization = () => {
      const state = readPersonalizationState();
      setProfileCompleted(state.profile.onboardingCompleted);
      setProfileLabel(state.profile.skipped ? 'Jalur standar' : state.profile.occupationLabel);
    };
    syncCourse();
    syncPersonalization();
    const unsubscribeCourse = subscribeMandarinWorkProfile(syncCourse);
    const unsubscribePersonalization = subscribePersonalization(syncPersonalization);
    return () => { unsubscribeCourse(); unsubscribePersonalization(); };
  }, []);

  const completedDays = courseProfile.completedDays.filter((day) => day >= 1 && day <= 30).length;
  const currentDay = Math.min(30, Math.max(1, courseProfile.currentDay));
  const progress = Math.round((completedDays / 30) * 100);

  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-6 text-[var(--ib-text-primary)] sm:py-10">
    <div className="mx-auto w-full max-w-5xl">
      <header className="overflow-hidden rounded-[32px] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-8">
        <p className="text-sm font-bold text-[var(--ib-primary)]">尼会说 · IndoBrain</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-[var(--ib-primary-strong)] sm:text-5xl">Belajar Mandarin untuk Kerja</h1>
        <p lang="zh-CN" className="mt-2 text-base font-semibold text-[var(--ib-text-secondary)]">印尼人学中文</p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--ib-text-secondary)]">Lanjutkan kursus, latihan dengan AI Coach, atau atur profil belajar sesuai pekerjaanmu.</p>
        <div className="mt-6 rounded-2xl bg-[var(--ib-primary-soft)] p-4">
          <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Progres kursus</p><p className="mt-1 font-bold text-[var(--ib-primary-strong)]">{completedDays}/30 hari selesai</p></div><span className="text-sm font-bold text-[var(--ib-primary)]">{progress}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" aria-label={`${progress}% kursus selesai`}><div className="h-full rounded-full bg-[var(--ib-primary)]" style={{ width: `${progress}%` }} /></div>
          <Link href="/learn-chinese/course" className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--ib-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--ib-primary-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2 sm:w-auto">Lanjutkan Hari {currentDay}</Link>
        </div>
      </header>

      <section className="mt-5 grid gap-4 md:grid-cols-2" aria-label="Pilihan belajar">
        <Link href="/learn-chinese/course" className="group rounded-3xl border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] transition hover:border-[var(--ib-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2"><span className="text-3xl" aria-hidden>📘</span><h2 className="mt-4 text-xl font-bold text-[var(--ib-primary-strong)]">Kursus 30 Hari</h2><p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">Pelajari materi Day 1–30 dengan progres dan favorit yang sudah tersimpan.</p><span className="mt-4 inline-flex text-sm font-bold text-[var(--ib-primary)]">Buka kursus <span className="ml-2 transition group-hover:translate-x-1" aria-hidden>→</span></span></Link>
        <Link href="/learn-chinese/ai-coach" className="group rounded-3xl border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] transition hover:border-[var(--ib-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2"><span className="text-3xl" aria-hidden>🧑‍🏫</span><h2 className="mt-4 text-xl font-bold text-[var(--ib-primary-strong)]">Pelatih Mandarin AI</h2><p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">Tanya, latihan percakapan, dengarkan, dan ucapkan materi Mandarin yang tersedia.</p><span className="mt-4 inline-flex text-sm font-bold text-[var(--ib-primary)]">Masuk AI Coach <span className="ml-2 transition group-hover:translate-x-1" aria-hidden>→</span></span></Link>
        <Link href="/learn-chinese/profile" className="group rounded-3xl border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] transition hover:border-[var(--ib-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2"><span className="text-3xl" aria-hidden>🎯</span><h2 className="mt-4 text-xl font-bold text-[var(--ib-primary-strong)]">Profil Belajar Kerja</h2><p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{profileCompleted ? `Profil sudah siap${profileLabel ? ` · ${profileLabel}` : ''}. Kamu bisa melihat atau mengubahnya.` : 'Isi profil singkat untuk menyesuaikan rencana belajar. Langkah ini boleh dilewati.'}</p><span className="mt-4 inline-flex text-sm font-bold text-[var(--ib-primary)]">{profileCompleted ? 'Lihat / ubah profil' : 'Isi profil'} <span className="ml-2 transition group-hover:translate-x-1" aria-hidden>→</span></span></Link>
        <div className="grid grid-cols-2 gap-3" aria-label="Favorit dan ulasan">
          <Link href="/learn-chinese/favorites" className="rounded-3xl border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)] transition hover:border-[var(--ib-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2"><span className="text-2xl" aria-hidden>☆</span><h2 className="mt-3 font-bold text-[var(--ib-primary-strong)]">Favorit</h2><p className="mt-2 text-xs leading-5 text-[var(--ib-text-secondary)]">Lihat dan dengarkan ungkapan yang sudah kamu simpan.</p></Link>
          <Link href="/learn-chinese/review" className="rounded-3xl border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)] transition hover:border-[var(--ib-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2"><span className="text-2xl" aria-hidden>↻</span><h2 className="mt-3 font-bold text-[var(--ib-primary-strong)]">Ulasan</h2><p className="mt-2 text-xs leading-5 text-[var(--ib-text-secondary)]">Ulangi materi yang tersimpan, masih sulit, atau sudah jatuh tempo.</p></Link>
        </div>
      </section>
    </div>
  </main>;
}
