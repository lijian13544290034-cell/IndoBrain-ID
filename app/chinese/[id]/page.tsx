import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChineseExperienceDetail from '@/components/ChineseExperienceDetail';
import { getChineseExperience, getChineseExperiences } from '@/lib/chinese-experiences';

export function generateStaticParams() { return getChineseExperiences().map((item) => ({ id: item.id })); }
export default async function ChineseExperiencePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const lesson = getChineseExperience(id); if (!lesson) notFound(); const all = getChineseExperiences(); const index = all.findIndex((item) => item.id === lesson.id); const previous = all[index - 1]; const next = all[index + 1]; return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14"><Link href={`/chinese?category=${lesson.category}`} className="text-sm text-stone-500 hover:text-stone-900">← 中文沟通</Link><ChineseExperienceDetail experience={lesson} /><nav className="mt-6 flex justify-between gap-3">{previous ? <Link href={`/chinese/${previous.id}`} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50">← 上一条</Link> : <span />}{next ? <Link href={`/chinese/${next.id}`} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50">下一条 →</Link> : <span />}</nav></main>; }
