'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import EssentialItemCard from '@/components/EssentialItemCard';
import EssentialsCategoryFilter from '@/components/EssentialsCategoryFilter';
import EssentialsSearch from '@/components/EssentialsSearch';
import IndonesianAudioProvider from '@/components/IndonesianAudioProvider';
import type { Essential, EssentialCategory } from '@/lib/essentials';

function normalized(value: string) {
  return value.trim().toLocaleLowerCase();
}

export default function EssentialsHub({ items, categories }: { items: Essential[]; categories: EssentialCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? '');

  useEffect(() => {
    setQuery(params.get('q') ?? '');
    setCategory(params.get('category') ?? '');
  }, [params]);

  function update(nextQuery: string, nextCategory: string) {
    const next = new URLSearchParams();
    if (nextCategory) next.set('category', nextCategory);
    if (nextQuery.trim()) next.set('q', nextQuery.trim());
    router.replace(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    const term = normalized(query);
    return items.filter((item) => {
      const categoryMatch = !category || item.category === category;
      const searchable = [item.chinese, item.indonesian, item.category, ...item.aliases].join(' ').toLocaleLowerCase();
      return categoryMatch && (!term || searchable.includes(term));
    });
  }, [items, category, query]);

  return <IndonesianAudioProvider>
    <EssentialsSearch value={query} onChange={(value) => { setQuery(value); update(value, category); }} />
    <EssentialsCategoryFilter categories={categories} selected={category} onSelect={(value) => { setCategory(value); update(query, value); }} />
    <p className="mt-5 text-sm text-stone-500">{filtered.length} ungkapan ditemukan（找到 {filtered.length} 条）</p>
    {filtered.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{filtered.map((item) => <EssentialItemCard key={item.id} item={item} />)}</div> : <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-5 text-sm leading-6 text-stone-500">Tidak ada ungkapan yang cocok.<br />没有找到匹配表达。</p>}
  </IndonesianAudioProvider>;
}
