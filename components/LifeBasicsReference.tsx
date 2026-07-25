import Link from 'next/link';
import EssentialItemCard from '@/components/EssentialItemCard';
import IndonesianAudioProvider from '@/components/IndonesianAudioProvider';
import type { LifeBasicsSection } from '@/lib/life-basics';

export default function LifeBasicsReference({ section }: { section: LifeBasicsSection }) {
  const count = section.groups.reduce((total, group) => total + group.items.length, 0);
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14"><Link href="/life/basics" className="text-sm text-stone-500 hover:text-stone-900">← Dasar（基础）</Link><header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5"><p className="text-xs text-stone-400">Dasar（基础）</p><h1 className="mt-1 text-2xl font-semibold">{section.indonesian} <span className="text-base font-normal text-stone-500">（{section.chinese}）</span></h1><p className="mt-2 text-sm leading-6 text-stone-500">{section.description}</p><p className="mt-4 text-xs text-stone-400">{count} ungkapan（{count} 条表达）</p></header><IndonesianAudioProvider><section className="mt-7" aria-label={`${section.indonesian} reference`}>{section.groups.map((group) => <section key={group.title} className="mt-8 first:mt-0"><h2 className="text-lg font-semibold">{group.title} <span className="text-sm font-normal text-stone-500">（{group.chineseTitle}）</span></h2>{group.tip && <p className="mt-2 rounded-xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">{group.tip}</p>}<div className="mt-4 grid gap-3 sm:grid-cols-2">{group.items.map((entry) => <EssentialItemCard key={entry.id} item={entry} />)}</div></section>)}</section></IndonesianAudioProvider></main>;
}
