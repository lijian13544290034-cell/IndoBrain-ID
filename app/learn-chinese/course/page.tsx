import type { Metadata } from 'next';
import MandarinWorkExperience from '@/components/MandarinWorkExperience';

export const metadata: Metadata = {
  title: 'Kursus Mandarin 30 Hari | 尼会说 IndoBrain',
  description: 'Kursus Mandarin untuk kerja Day 1–30 dengan progres belajar yang tersimpan di perangkat.',
  robots: { index: false, follow: false },
};

export default function MandarinCoursePage() {
  return <MandarinWorkExperience />;
}
