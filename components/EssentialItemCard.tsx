'use client';

import { useEffect, useState } from 'react';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import HarvestSection from '@/components/HarvestSection';
import type { Essential } from '@/lib/essentials';
import { readLearningProfile, subscribeProfile, toggleFavorite } from '@/lib/learning-profile';

export default function EssentialItemCard({ item }: { item: Essential }) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);
  useEffect(() => {
    const sync = () => setFavorited(readLearningProfile().favorites.includes(item.id));
    sync();
    return subscribeProfile(sync);
  }, [item.id]);
  async function copy() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(item.indonesian);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function favorite() { setFavorited(toggleFavorite(item.id).favorited); }

  return <article className="flex min-h-36 min-w-0 flex-col rounded-xl border border-stone-200 bg-white px-4 py-4 shadow-sm transition duration-200 hover:bg-stone-50 hover:shadow-md">
    <p className="text-[11px] font-medium text-stone-400">{item.id}</p>
    <p className="mt-2 text-base font-semibold text-stone-900">{item.chinese}</p>
    <p className="mt-2 break-words text-sm leading-6 text-stone-700">{item.indonesian}</p>
    {item.example && <div className="mt-3 rounded-lg bg-stone-50 px-3 py-3"><p className="text-sm leading-6 text-stone-700">{item.example}</p><p className="mt-1 text-xs leading-5 text-stone-500">{item.exampleChinese}</p><IndonesianSpeechButton text={item.example} compact />{item.exampleHarvest && <HarvestSection harvest={item.exampleHarvest} />}</div>}
    {item.pattern && <div className="mt-3 border-l-2 border-stone-300 pl-3"><p className="text-xs font-medium text-stone-500">Pola（句型）</p><p className="mt-1 text-sm font-medium text-stone-800">{item.pattern.indonesian}</p><p className="mt-1 text-xs text-stone-500">{item.pattern.chinese}</p><ul className="mt-2 space-y-1 text-xs leading-5 text-stone-600">{item.pattern.substitutions.map((line) => <li key={line.indonesian}>• {line.indonesian} <span className="text-stone-400">（{line.chinese}）</span></li>)}</ul></div>}
    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
      <button type="button" onClick={copy} className="min-h-8 cursor-pointer rounded-lg border border-stone-300 px-2 text-xs font-medium transition duration-200 hover:bg-stone-100">{copied ? '已复制' : '复制'}</button>
      <IndonesianSpeechButton text={item.indonesian} compact />
      <button type="button" onClick={favorite} className={`min-h-8 cursor-pointer rounded-lg border px-2 text-xs font-medium transition duration-200 hover:bg-stone-100 ${favorited ? 'border-stone-900 bg-stone-900 text-white hover:bg-stone-800' : 'border-stone-300'}`}>{favorited ? '已收藏' : '收藏'}</button>
    </div>
  </article>;
}
