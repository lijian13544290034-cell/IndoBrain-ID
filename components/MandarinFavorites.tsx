'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ChineseSpeechButton from '@/components/ChineseSpeechButton';
import { resolveMandarinFavoriteIds, type MandarinFavoriteEntry } from '@/lib/mandarin-favorite-resolver';
import { mandarinLevelOneFavoriteEntries } from '@/lib/mandarin-work-favorites';
import {
  emptyMandarinWorkProfile,
  readMandarinWorkProfile,
  subscribeMandarinWorkProfile,
  toggleMandarinFavorite,
} from '@/lib/mandarin-work-profile';

type Props = {
  levelTwoEntries: MandarinFavoriteEntry[];
  levelTwoAccess: 'anonymous' | 'locked' | 'authorized';
};

export default function MandarinFavorites({ levelTwoEntries, levelTwoAccess }: Props) {
  const [profile, setProfile] = useState(emptyMandarinWorkProfile);

  useEffect(() => {
    const sync = () => setProfile(readMandarinWorkProfile());
    sync();
    return subscribeMandarinWorkProfile(sync);
  }, []);

  const resolution = useMemo(
    () => resolveMandarinFavoriteIds(
      profile.favorites,
      mandarinLevelOneFavoriteEntries,
      levelTwoEntries,
      levelTwoAccess === 'authorized',
    ),
    [profile.favorites, levelTwoEntries, levelTwoAccess],
  );

  const removeFavorite = (favoriteId: string) => {
    setProfile(toggleMandarinFavorite(favoriteId));
  };

  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-6 text-[var(--ib-text-primary)] sm:py-10">
    <div className="mx-auto w-full max-w-4xl">
      <header className="rounded-[32px] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-8">
        <p className="text-sm font-bold text-[var(--ib-primary)]">尼会说 · IndoBrain</p>
        <h1 className="mt-3 text-3xl font-bold text-[var(--ib-primary-strong)] sm:text-5xl">Favorit</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ib-text-secondary)]">Dengarkan kembali dan kelola ungkapan Mandarin yang sudah kamu simpan.</p>
      </header>

      {resolution.lockedLevel2Count > 0 ? <section className="mt-5 rounded-3xl border border-[var(--ib-border-soft)] bg-[var(--ib-primary-soft)] p-5" aria-label="Favorit Level 2 terkunci">
        <p className="font-bold text-[var(--ib-primary-strong)]">Ada favorit dari Level 2 yang masih terkunci.</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">Isi pelajaran tidak ditampilkan sampai akunmu memiliki akses Level 2.</p>
        <Link href={levelTwoAccess === 'anonymous' ? '/login?next=/learn-chinese/favorites' : '/learn-chinese/level-2'} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--ib-primary)] px-5 text-sm font-bold text-white">{levelTwoAccess === 'anonymous' ? 'Masuk' : 'Lihat akses Level 2'}</Link>
      </section> : null}

      {resolution.unresolvedIds.length > 0 ? <p role="status" className="mt-5 rounded-2xl border border-[var(--ib-border-soft)] bg-white p-4 text-sm leading-6 text-[var(--ib-text-secondary)]">Beberapa favorit lama belum dapat ditampilkan. Data aslinya tetap tersimpan.</p> : null}

      {resolution.entries.length === 0 && resolution.lockedLevel2Count === 0 ? <section className="mt-5 rounded-3xl border border-dashed border-[var(--ib-border-soft)] bg-white p-8 text-center shadow-[var(--ib-shadow-card)]">
        <span className="text-4xl" aria-hidden>☆</span>
        <h2 className="mt-4 text-xl font-bold text-[var(--ib-primary-strong)]">Belum ada favorit</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">Buka kursus dan tekan tombol favorit pada ungkapan yang ingin kamu simpan.</p>
        <Link href="/learn-chinese/course" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--ib-primary)] px-5 text-sm font-bold text-white">Buka kursus</Link>
      </section> : null}

      {resolution.entries.length > 0 ? <section className="mt-5 grid gap-4 md:grid-cols-2" aria-label="Daftar favorit Mandarin">
        {resolution.entries.map((entry) => <article key={entry.favoriteId} className="min-w-0 rounded-3xl border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)]">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Day {entry.day} · {entry.courseTitle}</p>
          <p lang="zh-CN" className="mt-4 break-words text-3xl font-bold leading-tight text-[var(--ib-primary-strong)]">{entry.chinese}</p>
          <p className="mt-2 break-words text-base font-semibold leading-7 text-[var(--ib-primary)]">{entry.pinyin}</p>
          <p lang="id" className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{entry.indonesian}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ChineseSpeechButton text={entry.audioText} compact />
            <button type="button" onClick={() => removeFavorite(entry.favoriteId)} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--ib-border-soft)] bg-white px-4 text-xs font-bold text-[var(--ib-primary)] transition hover:bg-[var(--ib-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2">Hapus dari Favorit</button>
          </div>
          <Link href={entry.href} className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[var(--ib-primary)]">Kembali ke kursus Day {entry.day} <span className="ml-2" aria-hidden>→</span></Link>
        </article>)}
      </section> : null}
    </div>
  </main>;
}
