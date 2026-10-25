'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ChineseSpeechButton from '@/components/ChineseSpeechButton';
import {
  emptyPublicCoreProfile,
  readPublicCoreProfile,
  subscribePublicCoreProfile,
  togglePublicCoreFavorite,
  togglePublicCoreLearned,
} from '@/lib/public-core-profile';

export type PublicCoreExpression = {
  id: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  ttsText: string;
  difficulty: number;
  tags: string[];
};

const categories = [
  { id: 'all', label: 'Semua', short: '30' },
  { id: 'cat-greeting', label: 'Sapaan', short: '问候' },
  { id: 'cat-self-intro', label: 'Diri & posisi', short: '介绍' },
  { id: 'cat-numbers', label: 'Jumlah', short: '数量' },
  { id: 'cat-time', label: 'Waktu', short: '时间' },
  { id: 'cat-shopping', label: 'Belanja', short: '购物' },
  { id: 'cat-food-drink', label: 'Makan & minum', short: '餐饮' },
  { id: 'cat-travel', label: 'Perjalanan', short: '出行' },
  { id: 'cat-requests', label: 'Meminta bantuan', short: '请求' },
  { id: 'cat-responses', label: 'Respons', short: '回应' },
  { id: 'cat-daily-life', label: 'Keseharian', short: '日常' },
] as const;

function ExpressionCard({
  expression,
  index,
  favorite,
  learned,
  onFavorite,
  onLearned,
  onNext,
}: {
  expression: PublicCoreExpression;
  index: number;
  favorite: boolean;
  learned: boolean;
  onFavorite: () => void;
  onLearned: () => void;
  onNext: () => void;
}) {
  return (
    <article id={`expression-${expression.id}`} className="scroll-mt-4 rounded-[28px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-[var(--ib-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--ib-primary)]">{String(index + 1).padStart(2, '0')}</span>
        {learned ? <span className="text-xs font-bold text-emerald-700">✓ Sudah dipelajari</span> : null}
      </div>
      <p lang="zh-CN" className="mt-4 text-[2rem] font-bold leading-tight tracking-wide text-[var(--ib-primary-strong)] sm:text-4xl">{expression.chinese}</p>
      <p className="mt-2 text-base font-semibold leading-6 text-[var(--ib-primary)]">{expression.pinyin}</p>
      <p lang="id" className="mt-3 text-base leading-7 text-[var(--ib-text-secondary)]">{expression.indonesian}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <ChineseSpeechButton text={expression.ttsText} compact label="Dengarkan Mandarin" />
        <button type="button" onClick={onFavorite} aria-pressed={favorite} className="min-h-11 rounded-full border border-[var(--ib-border-soft)] bg-white px-4 text-sm font-bold text-[var(--ib-primary)]">
          {favorite ? '★ Favorit' : '☆ Favorit'}
        </button>
        <button type="button" onClick={onLearned} aria-pressed={learned} className="min-h-11 rounded-full border border-[var(--ib-border-soft)] bg-white px-4 text-sm font-bold text-[var(--ib-text-secondary)]">
          {learned ? 'Batalkan dipelajari' : 'Tandai dipelajari'}
        </button>
        <button type="button" onClick={onNext} className="min-h-11 rounded-full bg-[var(--ib-primary)] px-4 text-sm font-bold text-white">
          Kalimat berikutnya →
        </button>
      </div>
    </article>
  );
}

export default function PublicCoreExperience({ expressions, sourceCommit }: { expressions: PublicCoreExpression[]; sourceCommit: string }) {
  const [category, setCategory] = useState<(typeof categories)[number]['id']>('all');
  const [profile, setProfile] = useState(emptyPublicCoreProfile());

  useEffect(() => {
    const sync = () => setProfile(readPublicCoreProfile());
    sync();
    return subscribePublicCoreProfile(sync);
  }, []);

  const filtered = useMemo(
    () => category === 'all' ? expressions : expressions.filter((expression) => expression.tags.includes(category)),
    [category, expressions],
  );

  const moveToNext = (currentIndex: number) => {
    const next = filtered[(currentIndex + 1) % filtered.length];
    document.getElementById(`expression-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-[var(--ib-bg-page)] px-3 pb-12 pt-[max(0.75rem,env(safe-area-inset-top))] text-[var(--ib-text-primary)] sm:px-5">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-[32px] bg-[linear-gradient(135deg,#0b2f76,#174fa9)] p-5 text-white shadow-[var(--ib-shadow-card)] sm:p-8">
          <Link href="/learn-chinese" className="inline-flex min-h-11 items-center rounded-full bg-white/12 px-4 text-sm font-bold text-white">← Kembali ke Belajar Mandarin</Link>
          <p className="mt-5 text-sm font-bold text-blue-100">尼会说 · IndoBrain</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-5xl">30 Kalimat Mandarin Sehari-hari</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Ungkapan yang sering dipakai untuk menyapa, berbelanja, makan, bepergian, dan kebutuhan sehari-hari.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/12 px-3 py-2">30 ungkapan</span>
            <span className="rounded-full bg-white/12 px-3 py-2">10 kategori</span>
            <span className="rounded-full bg-white/12 px-3 py-2">Gratis</span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-[#71d6a2]" style={{ width: `${Math.round(profile.learned.length / expressions.length * 100)}%` }} /></div>
          <p className="mt-2 text-xs text-blue-100">{profile.learned.length}/{expressions.length} sudah dipelajari · {profile.favorites.length} favorit</p>
        </header>

        <aside className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900" role="note">
          Preview internal · Materi telah lolos review awal dan masih menunggu persetujuan akhir. Sumber konten: <code>{sourceCommit.slice(0, 7)}</code>.
        </aside>

        <nav aria-label="Kategori kalimat" className="mt-4 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2">
            {categories.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.id)} aria-pressed={category === item.id} className={`min-h-11 rounded-full px-4 text-sm font-bold ${category === item.id ? 'bg-[var(--ib-primary)] text-white' : 'border border-[var(--ib-border-soft)] bg-white text-[var(--ib-primary)]'}`}>{item.label} <span className="opacity-70">{item.short}</span></button>)}
          </div>
        </nav>

        <section className="mt-2 grid gap-4 md:grid-cols-2" aria-live="polite">
          {filtered.map((expression, index) => (
            <ExpressionCard
              key={expression.id}
              expression={expression}
              index={expressions.findIndex((item) => item.id === expression.id)}
              favorite={profile.favorites.includes(`mandarin-v2:${expression.id}`)}
              learned={profile.learned.includes(expression.id)}
              onFavorite={() => setProfile(togglePublicCoreFavorite(expression.id))}
              onLearned={() => setProfile(togglePublicCoreLearned(expression.id))}
              onNext={() => moveToNext(index)}
            />
          ))}
        </section>

        <footer className="mt-6 rounded-3xl bg-white p-5 text-center shadow-[var(--ib-shadow-card)]">
          <p className="text-sm text-[var(--ib-text-secondary)]">Progres dan favorit kursus ini tersimpan terpisah dari kursus Mandarin untuk kerja.</p>
          <Link href="/learn-chinese" className="mt-4 inline-flex min-h-12 items-center rounded-full bg-[var(--ib-primary)] px-6 font-bold text-white">Kembali ke Belajar Mandarin</Link>
        </footer>
      </div>
    </main>
  );
}
