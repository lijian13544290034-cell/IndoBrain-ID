import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChinaCityDetail from '@/components/ChinaCityDetail';
import { chinaCities, getChinaCity } from '@/lib/china-cities';

export function generateStaticParams() { return chinaCities.map((city) => ({ city: city.slug })); }
export default async function ChinaCityPage({ params }: { params: Promise<{ city: string }> }) { const { city: slug } = await params; const city = getChinaCity(slug); if (!city) notFound(); return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14"><Link href="/chinese" className="text-sm text-stone-500 hover:text-stone-900">← 中文沟通</Link><ChinaCityDetail city={city} /></main>; }
