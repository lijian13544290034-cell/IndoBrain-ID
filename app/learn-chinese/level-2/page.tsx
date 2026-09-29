import Link from 'next/link';
import type { Metadata } from 'next';
import { getMandarinLevel2Access } from '@/lib/server/mandarin-work-level2-access';
import { mandarinLevel2Catalog } from '@/lib/mandarin-work-level2-catalog';

export const metadata: Metadata = {
  title: 'Mandarin untuk Kerja — Level 2 | 尼会说 IndoBrain',
  description: 'Dengar bos, pahami tugas, dan selesaikan masalah kerja dengan Mandarin praktis.',
  robots: { index: false, follow: false },
};

export default async function MandarinLevel2CatalogPage() {
  const access = await getMandarinLevel2Access();
  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-6 text-[var(--ib-text-primary)]">
    <div className="mx-auto w-full max-w-5xl">
      <header className="rounded-[32px] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-8">
        <p className="text-sm font-bold text-[var(--ib-primary)]">尼会说 · IndoBrain</p>
        <h1 className="mt-3 text-3xl font-bold text-[var(--ib-primary-strong)] sm:text-5xl">Mandarin untuk Kerja — Level 2</h1>
        <p className="mt-2 text-lg font-semibold text-[var(--ib-text-secondary)]">工作中文进阶</p>
        <div className="mt-5 grid gap-1 text-xl font-bold text-[var(--ib-primary-strong)]"><span>Dengar Bos.</span><span>Pahami Tugas.</span><span>Selesaikan Masalah.</span></div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--ib-text-secondary)]">Belajar memahami Mandarin yang benar-benar digunakan di tempat kerja.</p>
        {access.state === 'anonymous' ? <Link href="/login?next=/learn-chinese/level-2/31" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-[var(--ib-primary)] px-6 font-bold text-white">Masuk untuk Level 2</Link> : null}
        {access.state === 'locked' ? <div className="mt-5 rounded-2xl border border-[var(--ib-border-soft)] bg-[var(--ib-primary-soft)] p-4"><p className="font-bold text-[var(--ib-primary-strong)]">Level 2 belum terbuka untuk akun ini.</p><button type="button" disabled className="mt-3 min-h-11 rounded-full border border-[var(--ib-border-soft)] bg-white px-5 font-bold text-[var(--ib-primary)]">Buka Akses Level 2</button></div> : null}
        {access.state === 'authorized' ? <Link href="/learn-chinese/level-2/31" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-[var(--ib-primary)] px-6 font-bold text-white">Mulai Day 31</Link> : null}
      </header>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Daftar Day 31 sampai Day 60">
        {mandarinLevel2Catalog.map(([day, title]) => {
          const body = <><span className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Day {day}</span><span className="mt-2 block text-lg font-bold text-[var(--ib-primary-strong)]">{title}</span><span className="mt-3 block text-xs font-semibold text-[var(--ib-text-muted)]">{access.state === 'authorized' ? 'Buka pelajaran →' : '🔒 Login + akses Level 2'}</span></>;
          return access.state === 'authorized' ? <Link key={day} href={`/learn-chinese/level-2/${day}`} className="rounded-3xl border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)]">{body}</Link> : <article key={day} className="rounded-3xl border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)]">{body}</article>;
        })}
      </section>
      <Link href="/learn-chinese" className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-[var(--ib-primary)]">← Kembali ke Level 1</Link>
    </div>
  </main>;
}
