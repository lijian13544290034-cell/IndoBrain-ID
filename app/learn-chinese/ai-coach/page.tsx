import type { Metadata } from 'next';
import MandarinAiCoachExperience from '@/components/MandarinAiCoachExperience';
import { getMandarinLevel2Access } from '@/lib/server/mandarin-work-level2-access';
import { getMandarinCoachCurriculum } from '@/lib/server/mandarin-coach-curriculum';

export const metadata: Metadata = {
  title: 'AI 中文教练 | Pelatih Mandarin AI | 尼会说 IndoBrain',
  description: 'Latihan Mandarin 10 menit dengan AI: dengarkan, ucapkan, pahami, dan praktikkan untuk situasi kerja.',
  robots: { index: false, follow: false },
};

export default async function MandarinAiCoachPage() {
  const levelTwoAccess = await getMandarinLevel2Access();
  const curriculum = getMandarinCoachCurriculum(levelTwoAccess.state === 'authorized');
  return <MandarinAiCoachExperience curriculum={curriculum} />;
}
