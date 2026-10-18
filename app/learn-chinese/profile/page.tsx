import type { Metadata } from 'next';
import MandarinCoachPersonalization from '@/components/MandarinCoachPersonalization';
import { getMandarinLevel2Access } from '@/lib/server/mandarin-work-level2-access';
import { getMandarinCoachCurriculum } from '@/lib/server/mandarin-coach-curriculum';

export const metadata: Metadata = {
  title: 'Profil Belajar Mandarin | 尼会说 IndoBrain',
  description: 'Lihat atau ubah profil pekerjaan dan target belajar Mandarin.',
  robots: { index: false, follow: false },
};

export default async function MandarinLearningProfilePage() {
  const levelTwoAccess = await getMandarinLevel2Access();
  const curriculum = getMandarinCoachCurriculum(levelTwoAccess.state === 'authorized');
  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-8 text-[var(--ib-text-primary)]"><div className="mx-auto w-full max-w-3xl"><header className="rounded-[32px] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-8"><p className="text-sm font-bold text-[var(--ib-primary)]">Profil belajar</p><h1 className="mt-2 text-3xl font-bold text-[var(--ib-primary-strong)]">Sesuaikan Mandarin dengan pekerjaanmu</h1><p className="mt-3 text-sm leading-6 text-[var(--ib-text-secondary)]">Kamu boleh melewati profil ini dan tetap belajar lewat jalur standar. Data tersimpan hanya di browser ini.</p><MandarinCoachPersonalization curriculum={curriculum} displayMode="profile" /></header></div></main>;
}
