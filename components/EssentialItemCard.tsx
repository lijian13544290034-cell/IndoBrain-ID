'use client';

import { useState } from 'react';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import type { Essential } from '@/lib/essentials';

export default function EssentialItemCard({ item }: { item: Essential }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(item.indonesian);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return <article className="flex min-h-36 min-w-0 flex-col rounded-xl border border-stone-200 bg-white px-4 py-4 shadow-sm transition duration-200 hover:bg-stone-50 hover:shadow-md">
    <p className="text-[11px] font-medium text-stone-400">{item.id}</p>
    <p className="mt-2 text-base font-semibold text-stone-900">{item.chinese}</p>
    <p className="mt-2 break-words text-sm leading-6 text-stone-700">{item.indonesian}</p>
    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
      <button type="button" onClick={copy} className="min-h-8 cursor-pointer rounded-lg border border-stone-300 px-2 text-xs font-medium transition duration-200 hover:bg-stone-100">{copied ? 'Tersalin（已复制）' : 'Salin（复制）'}</button>
      <IndonesianSpeechButton text={item.indonesian} compact />
    </div>
  </article>;
}
