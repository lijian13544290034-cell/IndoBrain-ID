'use client';

import { useEffect, useState } from 'react';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import { getBasicRealUseFavoriteId } from '@/lib/basic-real-use';
import { readLearningProfile, subscribeProfile, toggleFavorite } from '@/lib/learning-profile';

function FavoriteIcon({ filled }: { filled: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
}

export default function BasicRealUseItem({ realUseId, itemIndex, indonesian, chinese, ttsText }: { realUseId: string; itemIndex: number; indonesian: string; chinese: string; ttsText: string }) {
  const favoriteId = getBasicRealUseFavoriteId(realUseId, itemIndex);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const sync = () => setFavorited(readLearningProfile().favorites.includes(favoriteId));
    sync();
    return subscribeProfile(sync);
  }, [favoriteId]);

  const favoriteLabel = favorited ? `取消收藏 ${indonesian}` : `收藏 ${indonesian}`;
  return <div className="flex w-full min-w-0 max-w-full items-start justify-between gap-2 rounded-2xl bg-[var(--ib-bg-soft)] px-3 py-3 sm:gap-3 sm:px-4">
    <div className="min-w-0 flex-1">
      <p className="whitespace-normal break-words text-sm font-semibold leading-5 text-[var(--ib-text-primary)]">{indonesian}</p>
      <p className="mt-1 whitespace-normal break-words text-xs leading-5 text-[var(--ib-text-secondary)]">{chinese}</p>
    </div>
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={() => toggleFavorite(favoriteId)} aria-label={favoriteLabel} title={favoriteLabel} aria-pressed={favorited} className={`flex size-10 items-center justify-center rounded-xl transition ${favorited ? 'bg-[var(--ib-primary-soft)] text-[var(--ib-primary)]' : 'text-[var(--ib-text-secondary)] hover:bg-[var(--ib-primary-soft)] hover:text-[var(--ib-primary)]'}`}>
        <FavoriteIcon filled={favorited} />
      </button>
      <IndonesianSpeechButton text={ttsText} compact iconOnly />
    </div>
  </div>;
}
