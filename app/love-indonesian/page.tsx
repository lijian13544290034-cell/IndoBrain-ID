import type { Metadata } from 'next';
import LoveIndonesianExperience from '@/components/LoveIndonesianExperience';

export const metadata: Metadata = {
  title: '尼会说｜印尼语恋爱大全100句',
  description: '课本不教，但印尼人谈恋爱真的会说。100句真实印尼语恋爱口语，永久免费学习。',
  alternates: { canonical: '/love-indonesian' },
  openGraph: {
    title: '尼会说｜印尼语恋爱大全100句',
    description: '课本不教，但印尼人谈恋爱真的会说。100句真实印尼语恋爱口语，永久免费学习。',
    url: '/love-indonesian',
    type: 'website',
  },
};

export default async function LoveIndonesianPage({ searchParams }: { searchParams: Promise<{ scene?: string }> }) {
  const { scene } = await searchParams;
  return <LoveIndonesianExperience initialSceneId={scene} />;
}
