'use client';

import type { EssentialCategory } from '@/lib/essentials';

export default function EssentialsCategoryFilter({ categories, selected, onSelect }: { categories: EssentialCategory[]; selected: string; onSelect: (category: string) => void }) {
  return <nav className="mt-4 grid gap-2 sm:grid-cols-3" aria-label="Kategori Essentials">
    <button type="button" onClick={() => onSelect('')} className={`min-h-10 cursor-pointer rounded-lg border px-3 py-2 text-left text-xs font-medium transition duration-200 ${!selected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>Semua（全部）</button>
    {categories.map((category) => <button key={category.slug} type="button" onClick={() => onSelect(category.slug)} className={`min-h-10 cursor-pointer rounded-lg border px-3 py-2 text-left text-xs font-medium transition duration-200 ${selected === category.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>{category.indonesian}<span className="ml-1 text-stone-400">（{category.chinese}）</span></button>)}
  </nav>;
}
