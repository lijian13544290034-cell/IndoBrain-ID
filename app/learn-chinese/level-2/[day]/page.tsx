import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import MandarinWorkLevel2Experience from '@/components/MandarinWorkLevel2Experience';
import { getMandarinLevel2Access } from '@/lib/server/mandarin-work-level2-access';
import { getMandarinWorkLevel2Day } from '@/lib/server/mandarin-work-level2';

export const metadata: Metadata = { title: 'Level 2 Lesson | 尼会说 IndoBrain', robots: { index: false, follow: false } };

export default async function MandarinLevel2DayPage({ params }: { params: Promise<{ day: string }> }) {
  const dayNumber = Number((await params).day);
  if (!Number.isInteger(dayNumber) || dayNumber < 31 || dayNumber > 60) notFound();

  const access = await getMandarinLevel2Access();
  if (access.state === 'anonymous') redirect(`/login?next=/learn-chinese/level-2/${dayNumber}`);
  if (access.state === 'locked') redirect('/learn-chinese/level-2');

  const lesson = getMandarinWorkLevel2Day(dayNumber);
  if (!lesson) notFound();
  return <MandarinWorkLevel2Experience lesson={lesson} />;
}
