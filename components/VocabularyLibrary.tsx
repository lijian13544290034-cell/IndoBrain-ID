'use client';

import { useMemo, useState } from 'react';
import IndonesianAudioProvider from '@/components/IndonesianAudioProvider';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import { readLearningProfile, toggleFavorite } from '@/lib/learning-profile';
import { getVocabularyFrequency, sortVocabularyForDisplay, vocabularyLibrary, vocabularyLibraryCategories } from '@/lib/vocabulary-library';
import { vocabularyCategoryLabels, type VocabularyCategory } from '@/lib/v2/vocabulary';

function HighlightText({ text, query }: { text: string; query: string }) {
  const term = query.trim();
  if (!term) return <>{text}</>;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'));
  return <>{parts.map((part, index) => part.toLocaleLowerCase('id-ID') === term.toLocaleLowerCase('id-ID') ? <mark key={`${part}-${index}`} className="rounded bg-amber-100 px-0.5 text-inherit">{part}</mark> : part)}</>;
}

const frequencyStyles = { '超高频': 'bg-amber-100 text-amber-900', '高频': 'bg-emerald-100 text-emerald-900', '常用': 'bg-stone-100 text-stone-600' } as const;

export default function VocabularyLibrary({ sourcesByVocabularyId }: { sourcesByVocabularyId: Record<string, string[]> }) {
  const [category, setCategory] = useState<VocabularyCategory | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState(() => readLearningProfile().favorites);
  const [copied, setCopied] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase('id-ID');
  const categoryCounts = useMemo(() => new Map(vocabularyLibraryCategories.map((key) => [key, vocabularyLibrary.filter((item) => item.category === key).length])), []);
  const filteredItems = useMemo(() => vocabularyLibrary.filter((item) => (category === 'ALL' || item.category === category) && (!normalizedQuery || [item.textId, item.textZh, item.normalizedKey, ...item.tags, item.usageNoteZh ?? ''].join(' ').toLocaleLowerCase('id-ID').includes(normalizedQuery))), [category, normalizedQuery]);
  const items = useMemo(() => sortVocabularyForDisplay(filteredItems), [filteredItems]);
  const copy = async (id: string, textId: string, textZh: string) => { await navigator.clipboard.writeText(`${textId}\n${textZh}`); setCopied(id); window.setTimeout(() => setCopied(null), 1600); };

  return <IndonesianAudioProvider><main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
    <h1 className="text-3xl font-semibold text-stone-900">基础词库</h1><p className="mt-2 text-sm leading-6 text-stone-500">Kamus Dasar · 常用印尼语词汇与自然词组</p>
    <label className="mt-6 block"><span className="sr-only">搜索词汇</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索印尼语、中文或标签" className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none focus:border-stone-700" /></label>
    <div className="mt-3 flex justify-end"><button onClick={() => setQuery('')} className="text-sm text-stone-500 underline disabled:opacity-40" disabled={!query}>清空搜索</button></div>
    <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="词汇分类"><button onClick={() => setCategory('ALL')} className={`shrink-0 rounded-full px-4 py-2 text-sm ${category === 'ALL' ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700'}`}>全部（{vocabularyLibrary.length}）</button>{vocabularyLibraryCategories.map((key) => <button key={key} onClick={() => setCategory(key)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${category === key ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700'}`}>{vocabularyCategoryLabels[key]}（{categoryCounts.get(key) ?? 0}）</button>)}</div>
    <p className="mt-5 text-sm text-stone-500">找到 {items.length} 个词汇或词组</p>
    {items.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map((item) => {
      const frequency = getVocabularyFrequency(item.id);
      const sources = sourcesByVocabularyId[item.id] ?? ['基础词库补充'];
      return <article key={item.id} className="flex min-h-52 flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold text-stone-900"><HighlightText text={item.textId} query={query} /></p><p className="mt-1 text-sm text-stone-600"><HighlightText text={item.textZh} query={query} /></p></div><button onClick={() => { const result = toggleFavorite(item.id); setFavorites(result.profile.favorites); }} aria-label={favorites.includes(item.id) ? `取消收藏 ${item.textId}` : `收藏 ${item.textId}`} className="min-h-10 rounded-lg border border-stone-300 px-3 text-sm hover:bg-stone-50">{favorites.includes(item.id) ? '已收藏' : '收藏'}</button></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className="text-stone-400"><HighlightText text={vocabularyCategoryLabels[item.category]} query={query} /> · {item.id}</span><span className={`rounded-full px-2 py-1 font-medium ${frequencyStyles[frequency]}`}>{frequency}</span></div><div className="mt-2 flex flex-wrap gap-1.5">{item.tags.filter((tag) => tag !== vocabularyCategoryLabels[item.category]).map((tag) => <span key={tag} className="rounded-full border border-stone-200 px-2 py-0.5 text-xs text-stone-500"><HighlightText text={tag} query={query} /></span>)}</div><p className="mt-3 text-xs leading-5 text-stone-500">来源：{sources.join(' · ')}</p>{item.usageNoteZh && <p className="mt-2 text-sm leading-6 text-stone-600">{item.usageNoteZh}</p>}<div className="mt-auto flex flex-wrap gap-2 pt-4"><IndonesianSpeechButton text={item.pronunciationText ?? item.textId} compact iconOnly /><button onClick={() => copy(item.id, item.textId, item.textZh)} className="min-h-9 rounded-lg border border-stone-300 px-3 text-sm hover:bg-stone-50">{copied === item.id ? '已复制' : '复制'}</button></div></article>;
    })}</div> : <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-sm leading-6 text-stone-500">没有找到匹配词汇。可尝试搜索中文、印尼语或分类关键词。</div>}
  </main></IndonesianAudioProvider>;
}
