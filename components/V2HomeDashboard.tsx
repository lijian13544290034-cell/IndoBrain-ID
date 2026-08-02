'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { homeHeroCategories, type HomeHeroCategory } from '@/lib/home-hero-categories';
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

function getHeroCategory(experience: CatalogExperience): HomeHeroCategory {
  const category = experience.category.toLocaleLowerCase('id-ID');
  if (experience.id.startsWith('EXP-DRV')) return 'travel';
  if (experience.id.startsWith('EXP-NAN')) return 'public-service';
  if (!experience.id.startsWith('EXP-LIF') && !experience.id.startsWith('EXP-SOC')) return 'factory';
  if (category === 'restaurant') return 'restaurant';
  if (category === 'business') return 'business';
  if (category === 'friends' || category === 'dating' || experience.id.startsWith('EXP-SOC')) return 'social';
  return 'life';
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return { id: 'Selamat pagi.', zh: '早上好！' };
  if (hour < 15) return { id: 'Selamat siang.', zh: '下午好！' };
  if (hour < 19) return { id: 'Selamat sore.', zh: '傍晚好！' };
  return { id: 'Selamat malam.', zh: '晚上好！' };
}

export default function V2HomeDashboard({ catalog }: { catalog: readonly CatalogExperience[] }) {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [query, setQuery] = useState('');
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [hello, setHello] = useState({ id: 'Selamat datang.', zh: '欢迎回来！' });

  useEffect(() => {
    setProfile(readLearningProfile());
    return subscribeProfile(() => setProfile(readLearningProfile()));
  }, []);
  useEffect(() => { setHello(greeting()); }, []);

  const completed = profile?.completed ?? [];
  const favorites = profile?.favorites ?? [];
  const continueExperience = useMemo(() => catalog.find((item) => !completed.includes(item.id)) ?? catalog[0], [catalog, completed]);
  const heroCategory = continueExperience ? getHeroCategory(continueExperience) : 'life';
  const hero = homeHeroCategories[heroCategory];
  const progress = catalog.length ? Math.round((completed.length / catalog.length) * 100) : 0;
  const lifeSceneCount = useMemo(() => catalog.filter((item) => item.module === 'Life').length, [catalog]);

  useEffect(() => { setHeroImageFailed(false); }, [hero.heroImage]);

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
    { href: '/life', title: '场景速查', subtitle: `${lifeSceneCount} 个生活场景`, icon: 'scene' as const },
    { href: '/vocabulary', title: '基础词库', subtitle: `${vocabularyLibrary.length} 个高频词汇`, icon: 'book' as const },
    { href: '/about#favorites', title: '我的收藏', subtitle: `${favorites.length} 条收藏`, icon: 'heart' as const },
  ];

  return <main className="v2-home mx-auto min-h-screen w-full max-w-6xl overflow-hidden px-5 pb-6 pt-4 sm:px-8 sm:pb-12 sm:pt-9">
    <header data-home-part="header" className="relative z-10 flex items-start justify-between">
      <div><p className="font-serif text-3xl font-bold tracking-tight text-[var(--ib-primary-strong)] sm:text-5xl">IndoBrain</p><p className="mt-0.5 text-sm tracking-wide text-[var(--ib-text-secondary)] sm:mt-2 sm:text-base">会说，机会更多。</p></div>
      <Link href="/about" aria-label="打开菜单" className="flex size-11 items-center justify-center rounded-2xl text-[var(--ib-primary-strong)] transition hover:bg-[var(--ib-primary-soft)] active:bg-[#dce8ff]"><Icon name="menu" /></Link>
    </header>

    <section data-home-part="greeting" className="relative mt-4 sm:mt-10"><h1 className="text-[21px] font-semibold leading-7 tracking-tight text-[var(--ib-text-primary)] sm:text-4xl">{hello.id}</h1><p className="mt-0.5 text-sm text-[var(--ib-text-secondary)] sm:mt-1 sm:text-2xl">{hello.zh}</p></section>

    <section data-home-part="search" className="relative mt-2.5 sm:mt-5">
      <label className="flex min-h-[58px] items-center gap-3 rounded-[var(--ib-radius-control)] border border-white bg-white/90 px-4 text-[var(--ib-text-secondary)] shadow-[var(--ib-shadow-card)] sm:min-h-16 sm:px-5"><Icon name="search" /><span className="sr-only">统一搜索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索印尼语、中文、场景、词汇…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--ib-text-muted)] sm:text-base" /></label>
      {query.trim() && <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--ib-border-soft)] bg-[var(--ib-bg-card)] p-2 shadow-xl">{results.length ? results.map((result) => <Link key={result.key} href={result.href} className="block rounded-xl px-4 py-3 transition hover:bg-[var(--ib-primary-soft)]"><p className="text-sm font-semibold text-[var(--ib-text-primary)]">{result.title}<span className="ml-2 text-xs font-normal text-[var(--ib-text-secondary)]">{result.type}</span></p><p className="mt-1 text-xs text-[var(--ib-text-secondary)]">{result.detail}</p></Link>) : <p className="px-4 py-5 text-sm text-[var(--ib-text-secondary)]">没有找到相关内容。</p>}</div>}
    </section>

    <section data-home-part="hero" className="relative mt-3 min-h-[178px] overflow-hidden rounded-[var(--ib-radius-card)] border border-[var(--ib-border-soft)] bg-gradient-to-br from-[#073c89] via-[#145bcc] to-[#9dccff] p-3 shadow-[0_12px_30px_rgba(28,77,171,0.16)] sm:mt-5 sm:min-h-[210px] sm:p-7">
      {!heroImageFailed && <Image src={hero.heroImage} alt="" fill loading="eager" className="pointer-events-none object-cover object-right opacity-45 sm:opacity-80" onError={() => setHeroImageFailed(true)} />}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/94 to-white/18" />
      <div className="relative max-w-xl">
        <p className="text-xs font-medium text-[var(--ib-text-secondary)] sm:text-sm">{hero.label} · {hero.chinese}</p>
        <h2 className="mt-1 line-clamp-2 text-[21px] font-semibold leading-[1.3] text-[var(--ib-text-primary)] sm:text-2xl">{continueExperience?.task ?? '从一个真实场景开始'}</h2>
        <p className="mt-1 text-xs text-[var(--ib-text-secondary)] sm:text-sm">{continueExperience?.id ?? 'EXP-LIF-001'}</p>
        <div className="mt-2 flex items-center gap-2"><div className="h-1.5 flex-1 max-w-xs overflow-hidden rounded-full bg-[#d9e5fb]"><div className="h-full rounded-full bg-[#1a5fe8] transition-all" style={{ width: `${progress}%` }} /></div><span className="text-xs font-medium text-[var(--ib-text-secondary)]">{progress}%</span></div>
        {continueExperience && <Link href={continueExperience.href} className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-full bg-[#1259e8] px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0e4dcc] active:bg-[#0a3fa9] sm:mt-4 sm:min-h-11 sm:px-5">继续学习 <Icon name="arrow" /></Link>}
      </div>
    </section>

    <section data-home-part="entries" className="mt-2.5 grid gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3">
      {entryCards.map((entry) => <Link data-home-entry key={entry.href} href={entry.href} className="group flex min-h-[72px] items-center justify-between gap-3 rounded-[var(--ib-radius-card)] border border-white bg-[var(--ib-bg-card)] p-3 shadow-[var(--ib-shadow-card)] transition hover:-translate-y-0.5 hover:bg-[var(--ib-primary-soft)] active:bg-[#dce8ff] sm:min-h-28 sm:p-4"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--ib-primary-soft)] text-[#1558db] sm:size-11"><Icon name={entry.icon} /></span><span className="min-w-0"><h2 className="text-base font-bold text-[var(--ib-text-primary)]">{entry.title}</h2><p className="mt-0.5 text-xs text-[var(--ib-text-secondary)] sm:mt-1 sm:text-sm">{entry.subtitle}</p></span></div><span className="shrink-0 text-[#174fd4] transition group-hover:translate-x-1"><Icon name="arrow" /></span></Link>)}
    </section>
  </main>;
}
