import type { Metadata } from 'next';
import MandarinFavorites from '@/components/MandarinFavorites';
import type { MandarinFavoriteEntry } from '@/lib/mandarin-favorite-resolver';
import { getMandarinLevel2Access } from '@/lib/server/mandarin-work-level2-access';
import { mandarinWorkLevel2Days } from '@/lib/server/mandarin-work-level2';

export const metadata: Metadata = {
  title: 'Favorit Mandarin | 尼会说 IndoBrain',
  description: 'Ungkapan Mandarin yang disimpan untuk dipelajari kembali.',
  robots: { index: false, follow: false },
};

export default async function MandarinFavoritesPage() {
  const access = await getMandarinLevel2Access();
  const levelTwoEntries: MandarinFavoriteEntry[] = access.state === 'authorized'
    ? mandarinWorkLevel2Days.flatMap((day) => day.items.map((item) => ({
      favoriteId: `mandarin-work-30d:${item.id}`,
      itemId: item.id,
      day: day.day,
      courseTitle: day.title,
      chinese: item.chinese,
      pinyin: item.pinyin,
      indonesian: item.indonesian,
      audioText: item.chinese,
      href: `/learn-chinese/level-2/${day.day}`,
      level: 2 as const,
    })))
    : [];

  return <MandarinFavorites levelTwoEntries={levelTwoEntries} levelTwoAccess={access.state} />;
}
