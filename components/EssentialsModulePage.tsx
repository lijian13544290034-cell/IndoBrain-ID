import Link from 'next/link';
import { Suspense } from 'react';
import EssentialsHub from '@/components/EssentialsHub';
import LocalizedLabel from '@/components/LocalizedLabel';
import type { Essential, EssentialCategory } from '@/lib/essentials';

type Props = {
  title: string;
  chinese: string;
  experienceHref: string;
  experienceCount: number;
  items: Essential[];
  categories: EssentialCategory[];
  description: string;
  chineseDescription: string;
};

export default function EssentialsModulePage({ title, chinese, experienceHref, experienceCount, items, categories, description, chineseDescription }: Props) {
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href={experienceHref} className="text-sm text-stone-500 hover:text-stone-900">← {title}（{chinese}）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Modul（模块）</p>
      <LocalizedLabel indonesian={title} chinese={chinese} className="mt-1 font-semibold" />
      <p className="mt-2 text-sm leading-6 text-stone-500">{description}<br />{chineseDescription}</p>
      <nav className="mt-5 grid gap-2 sm:grid-cols-2" aria-label={`Mode ${title}`}>
        <Link href={experienceHref} className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition duration-200 hover:bg-stone-100 hover:shadow-sm">Pengalaman（真实场景）<span className="mt-1 block text-xs font-normal text-stone-400">{experienceCount} situasi</span></Link>
        <span className="min-h-12 rounded-xl border border-stone-900 bg-stone-900 px-4 py-3 text-sm font-medium text-white">Essentials（高频必备）<span className="mt-1 block text-xs font-normal text-stone-300">{items.length} ungkapan</span></span>
      </nav>
    </header>
    <section className="mt-7" aria-label={`Essentials ${title}`}>
      <h1 className="text-lg font-semibold">Essentials {title} <span className="text-sm font-normal text-stone-500">（高频必备）</span></h1>
      <div className="mt-5"><Suspense fallback={<p className="text-sm text-stone-500">Memuat Essentials（正在加载高频表达）</p>}><EssentialsHub items={items} categories={categories} /></Suspense></div>
    </section>
  </main>;
}
