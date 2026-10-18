import type { Metadata } from 'next';
import MandarinReview from '@/components/MandarinReview';
import { getMandarinLevel2Access } from '@/lib/server/mandarin-work-level2-access';
import { getMandarinCoachCurriculum } from '@/lib/server/mandarin-coach-curriculum';

export const metadata: Metadata = {
  title: 'Ulasan Mandarin | 尼会说 IndoBrain',
  description: 'Ulangi materi Mandarin yang tersimpan, belum dikuasai, atau sudah jatuh tempo.',
  robots: { index: false, follow: false },
};

export default async function MandarinReviewPage() {
  const levelTwoAccess = await getMandarinLevel2Access();
  const curriculum = getMandarinCoachCurriculum(levelTwoAccess.state === 'authorized');
  return <MandarinReview curriculum={curriculum} />;
}
