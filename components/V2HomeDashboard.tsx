'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CatalogExperience } from '@/lib/experience-catalog';
import { readLearningProfile, subscribeProfile } from '@/lib/learning-profile';
import { getLearningAchievementStats } from '@/lib/learning-achievements';
import { getIndonesiaPowerFromLearning } from '@/lib/v2/indonesia-power';
import { withSearchContext } from '@/lib/experience-navigation';
import { vocabularyLibrary } from '@/lib/vocabulary-library';
import IndonesiaPowerBadge from '@/components/IndonesiaPowerBadge';
import type { getContentStats } from '@/lib/content-stats';

type ProfileState = ReturnType<typeof readLearningProfile>;
type IconName = 'menu' | 'search' | 'scene' | 'book' | 'heart' | 'arrow';
type ContentStats = ReturnType<typeof getContentStats>;

function Icon({ name }: { name: IconName }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'menu') return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></svg>;
  if (name === 'scene') return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m15.5 8.5-2.4 4.1-4.2 2.4 2.4-4.2Z" /><circle cx="12" cy="12" r="1" /></svg>;
  if (name === 'book') return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22Z" /></svg>;
  if (name === 'heart') return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
  return <svg {...common}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}

export default function V2HomeDashboard({ catalog, contentStats }: { catalog: readonly CatalogExperience[]; contentStats: ContentStats }) {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setProfile(readLearningProfile());
    return subscribeProfile(() => setProfile(readLearningProfile()));
  }, []);

  const completed = profile?.completed ?? [];
  const favorites = profile?.favorites ?? [];
  const continueExperience = useMemo(() => catalog.find((item) => !completed.includes(item.id)) ?? catalog[0], [catalog, completed]);
  const progress = catalog.length ? Math.round((completed.length / catalog.length) * 100) : 0;
  const achievements = useMemo(() => getLearningAchievementStats(completed, catalog), [catalog, completed]);
  const indonesiaPower = useMemo(() => getIndonesiaPowerFromLearning(achievements.completedExperienceCount, achievements.masteredHarvestCount), [achievements]);

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID');
    if (!term) return [];
    const experiences = catalog
      .filter((item) => [item.id, item.task, item.indonesian, ...item.harvest].join(' ').toLocaleLowerCase('id-ID').includes(term))
      .slice(0, 5)
      .map((item) => ({ key: item.id, title: item.indonesian, detail: `${item.id} · ${item.task}`, href: withSearchContext(item.href, query), type: 'Experience' }));
    const vocabulary = vocabularyLibrary
      .filter((item) => [item.textId, item.textZh, ...item.tags].join(' ').toLocaleLowerCase('id-ID').includes(term))
      .slice(0, 5)
      .map((item) => ({ key: item.id, title: item.textId, detail: `${item.textZh} · ${item.id}`, href: '/vocabulary', type: '词库' }));
    return [...experiences, ...vocabulary].slice(0, 8);
  }, [catalog, query]);

  const quickLinks = [
    { href: '/life', label: '场景速查', count: `${contentStats.totalUniqueSceneCount} 个场景`, icon: 'scene' as const },
    { href: '/vocabulary', label: '基础词库', count: `${contentStats.vocabularyCount} 个词汇`, icon: 'book' as const },
    { href: '/about#favorites', label: '我的收藏', count: `${favorites.length} 条收藏`, icon: 'heart' as const },
  ];

  return <main className="v2-home mx-auto min-h-[100dvh] w-full max-w-6xl overflow-hidden px-5 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 sm:pb-10 sm:pt-8">
    <header data-home-part="brand-header" className="relative z-10 flex h-[64px] items-start justify-between sm:h-[76px]">
      <div><p className="font-serif text-[38px] font-bold leading-[0.94] tracking-tight text-[var(--ib-primary-strong)] sm:text-5xl">IndoBrain</p><p className="mt-1 text-[15px] leading-4 tracking-wide text-[var(--ib-text-secondary)] sm:text-base">会说，机会更多。</p></div>
      <div className="flex items-center gap-1"><IndonesiaPowerBadge totalIndonesiaPower={indonesiaPower} size="compact" href="/about#learning-achievement" /><Link href="/about" aria-label="打开菜单" className="flex size-11 items-center justify-center rounded-2xl text-[var(--ib-primary-strong)] transition hover:bg-[var(--ib-primary-soft)] active:bg-[var(--ib-primary-soft)]"><Icon name="menu" /></Link></div>
    </header>

    <section data-home-part="search" className="relative mt-3">
      <label className="flex h-[52px] items-center gap-3 rounded-[18px] border border-[var(--ib-border-soft)] bg-[var(--ib-bg-card)] px-4 text-[var(--ib-text-secondary)] shadow-[var(--ib-shadow-card)] sm:px-5"><Icon name="search" /><span className="sr-only">统一搜索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索场景、句子、词汇" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--ib-text-muted)] sm:text-base" /></label>
      {query.trim() && <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[18px] border border-[var(--ib-border-soft)] bg-[var(--ib-bg-card)] p-2 shadow-xl">{results.length ? results.map((result) => <Link key={result.key} href={result.href} className="block rounded-xl px-4 py-3 transition hover:bg-[var(--ib-primary-soft)]"><p className="text-sm font-semibold text-[var(--ib-text-primary)]">{result.title}<span className="ml-2 text-xs font-normal text-[var(--ib-text-secondary)]">{result.type}</span></p><p className="mt-1 text-xs text-[var(--ib-text-secondary)]">{result.detail}</p></Link>) : <p className="px-4 py-5 text-sm text-[var(--ib-text-secondary)]">没有找到相关内容。</p>}</div>}
    </section>

    {continueExperience && <Link data-home-part="continue-learning" href={continueExperience.href} className="group relative mt-3 flex h-[88px] overflow-hidden rounded-[18px] border border-[var(--ib-border-soft)] bg-[var(--ib-bg-card)] px-4 py-2.5 shadow-[var(--ib-shadow-card)] transition hover:bg-[var(--ib-primary-soft)] active:bg-[var(--ib-primary-soft)]">
      <div className="min-w-0 pr-9"><p className="text-[13px] font-semibold leading-4 text-[var(--ib-primary)]">继续学习</p><h1 className="mt-1 truncate text-[18px] font-semibold leading-5 text-[var(--ib-text-primary)]">{continueExperience.task}</h1><p className="mt-1 truncate text-xs leading-4 text-[var(--ib-text-secondary)]">{continueExperience.module} · {continueExperience.id} · 进度 {progress}%</p></div>
      <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ib-primary)] transition group-hover:translate-x-1"><Icon name="arrow" /></span>
      <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-[2px] overflow-hidden bg-[var(--ib-border-soft)]"><span className="block h-full bg-[var(--ib-primary)]" style={{ width: `${progress}%` }} /></span>
    </Link>}

    <section data-home-part="quick-start" className="mt-4">
      <h2 className="h-6 text-[16px] font-semibold leading-6 text-[var(--ib-text-primary)]">快速开始</h2>
      <div data-home-part="quick-links" className="mt-2 overflow-hidden rounded-[18px] border border-[var(--ib-border-soft)] bg-[var(--ib-bg-card)] shadow-[var(--ib-shadow-card)]">
        {quickLinks.map((link, index) => <Link key={link.href} href={link.href} className={`flex h-[60px] items-center gap-3 px-4 transition hover:bg-[var(--ib-primary-soft)] active:bg-[var(--ib-primary-soft)] ${index ? 'border-t border-[var(--ib-border-soft)]' : ''}`}><span className="shrink-0 text-[var(--ib-primary)]"><Icon name={link.icon} /></span><span className="min-w-0 flex-1"><span className="block truncate text-[16px] font-semibold leading-5 text-[var(--ib-text-primary)]">{link.label}</span></span><span className="shrink-0 text-[13px] text-[var(--ib-text-secondary)]">{link.count}</span><span aria-hidden="true" className="shrink-0 text-[var(--ib-text-secondary)]"><Icon name="arrow" /></span></Link>)}
      </div>
    </section>
  </main>;
}
