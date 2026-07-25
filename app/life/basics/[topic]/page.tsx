import { notFound } from 'next/navigation';
import LifeBasicsReference from '@/components/LifeBasicsReference';
import { getLifeBasics, isLifeBasicsTopic, lifeBasics } from '@/lib/life-basics';

export function generateStaticParams() { return lifeBasics.map((item) => ({ topic: item.slug })); }
export default async function LifeBasicsTopicPage({ params }: { params: Promise<{ topic: string }> }) { const { topic } = await params; if (!isLifeBasicsTopic(topic)) notFound(); return <LifeBasicsReference section={getLifeBasics(topic)!} />; }
