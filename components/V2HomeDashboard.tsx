'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CatalogExperience } from '@/lib/experience-catalog';
import { readLearningProfile, subscribeProfile } from '@/lib/learning-profile';
import { vocabularyLibrary } from '@/lib/vocabulary-library';

type ProfileState = ReturnType<typeof readLearningProfile>;
type IconName = 'menu' | 'search' | 'scene' | 'book' | 'heart' | 'arrow';

function Icon({ name }: { name: IconName }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'menu') return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></svg>;
  if (name === 'scene') return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m15.5 8.5-2.4 4.1-4.2 2.4 2.4-4.2Z" /><circle cx="12" cy="12" r="1" /></svg>;
  if (name === 'book') return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22Z" /></svg>;
  if (name === 'heart') return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
  return <svg {...common}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi · 早上好';
  if (hour < 15) return 'Selamat siang · 下午好';
  if (hour < 19) return 'Selamat sore · 傍晚好';
  return 'Selamat malam · 晚上好';
}

export default function V2HomeDashboard({ catalog }: { catalog: readonly CatalogExperience[] }) {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [query, setQuery] = useState('');
  const [hello, setHello] = useState('Selamat datang · 欢迎回来');

  useEffect(() => {
    setProfile(readLearningProfile());
    return subscribeProfile(() => setProfile(readLearningProfile()));
  }, []);
  useEffect(() => { setHello(greeting()); }, []);

  const completed = profile?.completed ?? [];
  const favorites = profile?.favorites ?? [];
  const continueExperience = useMemo(() => catalog.find((item) => !completed.includes(item.id)) ?? catalog[0], [catalog, completed]);
  const progress = catalog.length ? Math.round((completed.length / catalog.length) * 100) : 0;
  const lifeSceneCount = useMemo(() => catalog.filter((item) => item.module === 'Life').length, [catalog]);

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID');
    if (!term) return [];
    const experiences = catalog
      .filter((item) => [item.id, item.task, item.indonesian, ...item.harvest].join(' ').toLocaleLowerCase('id-ID').includes(term))
      .slice(0, 5)
      .map((item) => ({ key: item.id, title: item.indonesian, detail: `${item.id} · ${item.task}`, href: item.href, type: 'Experience' }));
    const vocabulary = vocabularyLibrary
      .filter((item) => [item.textId, item.textZh, ...item.tags].join(' ').toLocaleLowerCase('id-ID').includes(term))
      .slice(0, 5)
      .map((item) => ({ key: item.id, title: item.textId, detail: `${item.textZh} · ${item.id}`, href: '/vocabulary', type: '词库' }));
    return [...experiences, ...vocabulary].slice(0, 8);
  }, [catalog, query]);

  const entryCards = [
    { href: '/life', title: '场景速查', subtitle: `${lifeSceneCount} 条`, icon: 'scene' as const },
    { href: '/vocabulary', title: '基础词库', subtitle: `${vocabularyLibrary.length} 条`, icon: 'book' as const },
    { href: '/about#favorites', title: '我的收藏', subtitle: `${favorites.length} 条`, icon: 'heart' as const },
  ];

  return <main className="v2-home mx-auto min-h-[100dvh] w-full max-w-6xl overflow-hidden px-5 pb-3 pt-3 sm:px-8 sm:pb-10 sm:pt-8">
    <header data-home-part="header" className="relative z-10 flex h-[58px] items-start justify-between sm:h-[76px]">
      <div><p className="font-serif text-[38px] font-bold leading-[0.92] tracking-tight text-[var(--ib-primary-strong)] sm:text-5xl">IndoBrain</p><p className="mt-1 text-[15px] leading-4 tracking-wide text-[var(--ib-text-secondary)] sm:text-base">会说，机会更多。</p></div>
      <Link href="/about" aria-label="打开菜单" className="flex size-11 items-center justify-center rounded-2xl text-[var(--ib-primary-strong)] transition hover:bg-[var(--ib-primary-soft)] active:bg-[#dce8ff]"><Icon name="menu" /></Link>
    </header>

    <section data-home-part="greeting" className="mt-2 flex h-8 items-center"><h1 className="text-[18px] font-semibold leading-8 tracking-tight text-[var(--ib-text-primary)] sm:text-2xl">{hello}</h1></section>

    <section data-home-part="search" className="relative mt-2">
      <label className="flex h-[52px] items-center gap-3 rounded-[20px] border border-white bg-white/90 px-4 text-[var(--ib-text-secondary)] shadow-[var(--ib-shadow-card)] sm:h-[58px] sm:px-5"><Icon name="search" /><span className="sr-only">统一搜索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索印尼语、中文、场景、词汇…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--ib-text-muted)] sm:text-base" /></label>
      {query.trim() && <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--ib-border-soft)] bg-[var(--ib-bg-card)] p-2 shadow-xl">{results.length ? results.map((result) => <Link key={result.key} href={result.href} className="block rounded-xl px-4 py-3 transition hover:bg-[var(--ib-primary-soft)]"><p className="text-sm font-semibold text-[var(--ib-text-primary)]">{result.title}<span className="ml-2 text-xs font-normal text-[var(--ib-text-secondary)]">{result.type}</span></p><p className="mt-1 text-xs text-[var(--ib-text-secondary)]">{result.detail}</p></Link>) : <p className="px-4 py-5 text-sm text-[var(--ib-text-secondary)]">没有找到相关内容。</p>}</div>}
    </section>

    {continueExperience && <Link data-home-part="continue-task" href={continueExperience.href} className="group relative mt-2.5 flex h-[110px] overflow-hidden rounded-[20px] border border-white bg-[var(--ib-bg-card)] px-4 py-3 shadow-[var(--ib-shadow-card)] transition hover:bg-[var(--ib-primary-soft)] active:bg-[#dce8ff] sm:mt-5 sm:h-[116px] sm:px-5">
      <div className="min-w-0 pr-9"><p className="text-sm font-semibold text-[var(--ib-primary)]">继续学习</p><h2 className="mt-1 line-clamp-2 text-[18px] font-semibold leading-[1.28] text-[var(--ib-text-primary)]">{continueExperience.task}</h2><p className="mt-1 truncate text-xs text-[var(--ib-text-secondary)]">{continueExperience.category} · {continueExperience.id} · 进度 {progress}%</p></div>
      <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ib-primary)] transition group-hover:translate-x-1"><Icon name="arrow" /></span>
      <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-[3px] overflow-hidden rounded-full bg-[#dce7f8]"><span className="block h-full rounded-full bg-[var(--ib-primary)]" style={{ width: `${progress}%` }} /></span>
    </Link>}

    <section data-home-part="entries" className="mt-2.5 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
      {entryCards.map((entry) => <Link data-home-entry key={entry.href} href={entry.href} className="flex h-[110px] min-w-0 flex-col items-center justify-center rounded-[20px] border border-white bg-[var(--ib-bg-card)] px-2 text-center shadow-[var(--ib-shadow-card)] transition hover:-translate-y-0.5 hover:bg-[var(--ib-primary-soft)] active:bg-[#dce8ff] sm:h-[116px] sm:px-4"><span className="flex size-9 items-center justify-center rounded-full bg-[var(--ib-primary-soft)] text-[#1558db] sm:size-11"><Icon name={entry.icon} /></span><h2 className="mt-2 truncate text-[15px] font-bold leading-4 text-[var(--ib-text-primary)]">{entry.title}</h2><p className="mt-1 text-xs leading-3 text-[var(--ib-text-secondary)]">{entry.subtitle}</p></Link>)}
    </section>
  </main>;
}
