import type { Metadata } from 'next';
import MandarinWorkExperience from '@/components/MandarinWorkExperience';
import { parseMandarinWorkDayParam } from '@/lib/mandarin-work-day-selection';

export const metadata: Metadata = {
  title: 'Kursus Mandarin 30 Hari | 尼会说 IndoBrain',
  description: 'Kursus Mandarin untuk kerja Day 1–30 dengan progres belajar yang tersimpan di perangkat.',
  robots: { index: false, follow: false },
};

export default async function MandarinCoursePage({ searchParams }: { searchParams: Promise<{ day?: string | string[] }> }) {
  const params = await searchParams;
  return <MandarinWorkExperience initialDay={parseMandarinWorkDayParam(params.day)} />;
}
