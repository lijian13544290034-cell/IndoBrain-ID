import type { Metadata } from 'next';
import MandarinAiCoachExperience from '@/components/MandarinAiCoachExperience';

export const metadata: Metadata = {
  title: 'AI 中文教练 | Pelatih Mandarin AI | 尼会说 IndoBrain',
  description: 'Latihan Mandarin 10 menit dengan AI: dengarkan, ucapkan, pahami, dan praktikkan untuk situasi kerja.',
  robots: { index: false, follow: false },
};

export default function MandarinAiCoachPage() {
  return <MandarinAiCoachExperience />;
}
