'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import { getBasicFavoriteId, type BasicConcept } from '@/lib/basic-essentials';
import { readLearningProfile, subscribeProfile, toggleFavorite } from '@/lib/learning-profile';

type BasicConceptGridEntry = {
  item: BasicConcept;
  href: string;
  active?: boolean;
};

function FavoriteIcon({ filled }: { filled: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
}

export default function BasicConceptGrid({ entries, ariaLabel, favoritesOnly = false }: { entries: BasicConceptGridEntry[]; ariaLabel: string; favoritesOnly?: boolean }) {
  const [favoriteIds, setFavoriteIds] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setFavoriteIds(readLearningProfile().favorites);
    sync();
    return subscribeProfile(sync);
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds]);
  const visibleEntries = favoritesOnly
    ? entries.filter(({ item }) => favoriteSet.has(getBasicFavoriteId(item.conceptKey)))
    : entries;

  if (favoritesOnly && favoriteIds && !visibleEntries.length) {
    return <div className="mt-5 rounded-[22px] bg-white p-6 text-sm leading-6 text-[var(--ib-text-secondary)] shadow-[var(--ib-shadow-card)]">还没有收藏基础词汇。点击词卡旁的心形图标，收藏的词会出现在这里。</div>;
  }

  return <section className="mt-4 grid gap-3 sm:grid-cols-2" aria-label={ariaLabel}>
    {visibleEntries.map(({ item, href, active }) => {
      const favoriteId = getBasicFavoriteId(item.conceptKey);
      const favorited = favoriteSet.has(favoriteId);
      const favoriteLabel = favorited ? `取消收藏 ${item.indonesian}` : `收藏 ${item.indonesian}`;
      return <article key={item.conceptKey} className={`rounded-[22px] bg-white px-4 py-3 shadow-[var(--ib-shadow-card)] transition ${active ? 'ring-2 ring-[var(--ib-primary)]' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          <Link href={href} className="min-w-0 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)]">
            <p className="truncate text-lg font-bold text-[var(--ib-text-primary)]">{item.indonesian}</p>
            <p className="mt-1 text-sm text-[var(--ib-text-secondary)]">{item.chinese}</p>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={() => toggleFavorite(favoriteId)} aria-label={favoriteLabel} title={favoriteLabel} aria-pressed={favorited} className={`flex size-10 items-center justify-center rounded-xl transition ${favorited ? 'bg-[var(--ib-primary-soft)] text-[var(--ib-primary)]' : 'text-[var(--ib-text-secondary)] hover:bg-[var(--ib-primary-soft)] hover:text-[var(--ib-primary)]'}`}>
              <FavoriteIcon filled={favorited} />
            </button>
            <IndonesianSpeechButton text={item.ttsText} compact iconOnly />
          </div>
        </div>
      </article>;
    })}
  </section>;
}
