import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicCoreExperience, { type PublicCoreExpression } from '@/components/PublicCoreExperience';
import { getMandarinV2Runtime } from '@/lib/server/mandarin-v2-runtime';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '30 Kalimat Mandarin Sehari-hari · IndoBrain',
  description: 'Kursus gratis 30 kalimat Mandarin sehari-hari untuk pemula Indonesia.',
};

export default async function PublicCorePage() {
  const runtime = await getMandarinV2Runtime();
  const course = runtime.courses.find((item) => item.id === 'mandarin-public-core-30');
  if (!course) notFound();

  return <PublicCoreExperience expressions={course.expressions as PublicCoreExpression[]} />;
}
