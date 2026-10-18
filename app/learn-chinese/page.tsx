import type { Metadata } from 'next';
import MandarinLearningHome from '@/components/MandarinLearningHome';

export const metadata: Metadata = {
  title: 'Belajar Mandarin untuk Kerja | 尼会说 IndoBrain',
  description: 'Beranda belajar Mandarin untuk kerja: lanjutkan kursus, gunakan AI Coach, dan atur profil belajar.',
  robots: { index: false, follow: false },
};

export default function LearnChinesePage() {
  return <MandarinLearningHome />;
}
