'use client';

import { useEffect, useState } from 'react';
import MandarinV2ExpressionCard from '@/components/MandarinV2ExpressionCard';
import type { MandarinV2Course } from '@/lib/mandarin-v2-runtime';
import { mandarinV2FavoriteId } from '@/lib/mandarin-v2-runtime';
import { emptyMandarinWorkProfile, readMandarinWorkProfile, subscribeMandarinWorkProfile, toggleMandarinFavorite } from '@/lib/mandarin-work-profile';

function MandarinV2ExpressionGrid({ course }: { course: MandarinV2Course }) {
  const [profile, setProfile] = useState(emptyMandarinWorkProfile);
  useEffect(() => {
    const sync = () => setProfile(readMandarinWorkProfile());
    sync();
    return subscribeMandarinWorkProfile(sync);
  }, []);

  return <section aria-labelledby={`${course.id}-title`}>
    <header className="mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">{course.groupId} · Tingkat {course.difficulty}</p>
      <h2 id={`${course.id}-title`} className="mt-2 text-2xl font-bold text-[var(--ib-primary-strong)]">{course.titleId}</h2>
      <p className="mt-1 text-sm text-[var(--ib-text-secondary)]">{course.titleZh}</p>
    </header>
    <div className="grid gap-4 md:grid-cols-2">
      {course.expressions.map((expression) => {
        const favoriteId = mandarinV2FavoriteId(expression.id);
        return <MandarinV2ExpressionCard key={expression.id} expression={expression} contentType={course.contentType} favorited={profile.favorites.includes(favoriteId)} onFavorite={() => setProfile(toggleMandarinFavorite(favoriteId))} />;
      })}
    </div>
  </section>;
}

export function MandarinV2VocabularyModule({ course }: { course: MandarinV2Course }) {
  if (course.contentType !== 'PUBLIC_HIGH_FREQUENCY') return null;
  return <MandarinV2ExpressionGrid course={course} />;
}

export function MandarinV2SentenceModule({ course }: { course: MandarinV2Course }) {
  if (course.contentType !== 'PRACTICAL_SENTENCE') return null;
  return <MandarinV2ExpressionGrid course={course} />;
}

export { MandarinV2ExpressionGrid };
