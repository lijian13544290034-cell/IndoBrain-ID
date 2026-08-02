'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { homeHeroCategories, type HomeHeroCategory } from '@/lib/home-hero-categories';
import type { CatalogExperience } from '@/lib/experience-catalog';
import { readLearningProfile, subscribeProfile } from '@/lib/learning-profile';
import { vocabularyLibrary } from '@/lib/vocabulary-library';
import { lifeContentUpdates } from '@/lib/life-content-updates';

type ProfileState = ReturnType<typeof readLearningProfile>;

function Icon({ name }: { name: 'menu' | 'search' | 'play' | 'scene' | 'book' | 'heart' | 'arrow' | 'spark' }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'menu') return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></svg>;
  if (name === 'play') return <svg {...common} fill="currentColor"><path d="m9 7 7 5-7 5Z" /></svg>;
  if (name === 'scene') return <svg {...common}><path d="m4 19 5-5 3 3 7-8" /><path d="M16 9h3v3" /></svg>;
  if (name === 'book') return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22Z" /></svg>;
  if (name === 'heart') return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
  return <svg {...common}><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4Z" /></svg>;
}

function getHeroCategory(experience: CatalogExperience): HomeHeroCategory {
  const category = experience.category.toLocaleLowerCase('id-ID');
  if (experience.id.startsWith('EXP-FAC') || experience.module.toLocaleLowerCase('id-ID').includes('pabrik')) return 'factory';
  if (experience.id.startsWith('EXP-DRV')) return 'travel';
  if (experience.id.startsWith('EXP-NAN')) return 'public-service';
  if (category === 'restaurant') return 'restaurant';
  if (category === 'business') return 'business';
  if (category === 'friends' || category === 'dating' || experience.id.startsWith('EXP-SOC')) return 'social';
  return 'life';
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return { id: 'Selamat pagi.', zh: '早上好！' };
  if (hour < 15) return { id: 'Selamat siang.', zh: '下午好！' };
  return { id: 'Selamat sore.', zh: '你好！' };
}

export default function V2HomeDashboard({ catalog }: { catalog: readonly CatalogExperience[] }) {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [query, setQuery] = useState('');
  useEffect(() => { setProfile(readLearningProfile()); return subscribeProfile(() => setProfile(readLearningProfile())); }, []);

  const completed = profile?.completed ?? [];
  const favorites = profile?.favorites ?? [];
  const continueExperience = useMemo(() => catalog.find((item) => !completed.includes(item.id)) ?? catalog[0], [catalog, completed]);
  const heroCategory = continueExperience ? getHeroCategory(continueExperience) : 'life';
  const hero = homeHeroCategories[heroCategory];
  const progress = catalog.length ? Math.round((completed.length / catalog.length) * 100) : 0;
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID');
    if (!term) return [];
    const experienceResults = catalog.filter((item) => [item.id, item.task, item.indonesian, ...item.harvest].join(' ').toLocaleLowerCase('id-ID').includes(term)).slice(0, 5).map((item) => ({ key: item.id, title: item.indonesian, detail: `${item.id} · ${item.task}`, href: item.href, type: 'Experience' }));
    const vocabularyResults = vocabularyLibrary.filter((item) => [item.textId, item.textZh, ...item.tags].join(' ').toLocaleLowerCase('id-ID').includes(term)).slice(0, 5).map((item) => ({ key: item.id, title: item.textId, detail: `${item.textZh} · ${item.id}`, href: '/vocabulary', type: '词库' }));
    return [...experienceResults, ...vocabularyResults].slice(0, 8);
  }, [catalog, query]);
  const hello = greeting();
  const entryCards = [
    { href: '/life', title: '场景速查', subtitle: `${catalog.length} 个真实场景`, icon: 'scene' as const },
    { href: '/vocabulary', title: '基础词库', subtitle: `${vocabularyLibrary.length} 个高频词汇`, icon: 'book' as const },
    { href: '/about#favorites', title: '我的收藏', subtitle: `${favorites.length} 条收藏`, icon: 'heart' as const },
  ];

  return <main className="v2-home mx-auto min-h-screen w-full max-w-6xl overflow-hidden px-5 pb-12 pt-9 sm:px-8 sm:pt-12">
    <header className="relative z-10 flex items-start justify-between"><div><p className="font-serif text-4xl font-bold tracking-tight text-[#0b2769] sm:text-5xl">IndoBrain</p><p className="mt-2 text-base tracking-wide text-[#52658f]">会说，机会更多。</p></div><Link href="/about" aria-label="打开菜单" className="mt-1 flex size-12 items-center justify-center rounded-2xl text-[#0b2769] transition hover:bg-blue-50"><Icon name="menu" /></Link></header>

    <section className="relative mt-14 overflow-hidden pt-3 sm:mt-16"><div className="absolute inset-x-[-8%] bottom-0 h-44 opacity-70" aria-hidden><Image src="/home-heroes/life.svg" alt="" fill priority className="object-cover object-bottom" /></div><div className="relative"><h1 className="text-4xl font-bold tracking-tight text-[#10285f] sm:text-5xl">{hello.id}</h1><p className="mt-2 text-2xl text-[#596b95] sm:text-3xl">{hello.zh}</p></div></section>

    <section className="relative mt-6"><label className="flex min-h-20 items-center gap-4 rounded-[1.65rem] border border-white bg-white/90 px-6 text-[#5a6c95] shadow-[0_12px_30px_rgba(38,81,163,0.12)]"><Icon name="search" /><span className="sr-only">统一搜索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索印尼语、中文、场景、词汇…" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#66779c]" /></label>{query.trim() && <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-blue-100 bg-white p-2 shadow-xl">{results.length ? results.map((result) => <Link key={result.key} href={result.href} className="block rounded-xl px-4 py-3 transition hover:bg-blue-50"><p className="text-sm font-semibold text-[#152b61]">{result.title}<span className="ml-2 text-xs font-normal text-[#6b7c9d]">{result.type}</span></p><p className="mt-1 text-xs text-slate-500">{result.detail}</p></Link>) : <p className="px-4 py-5 text-sm text-slate-500">没有找到相关内容。</p>}</div>}</section>

    <section className="relative mt-7 overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-[#f3f8ff] to-[#dceaff] p-6 shadow-[0_14px_38px_rgba(28,77,171,0.14)] sm:min-h-[280px] sm:p-8"><Image src={hero.heroImage} alt="" fill className="pointer-events-none object-cover object-right opacity-75" /><div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10" /><div className="relative max-w-xl"><div className="flex items-center gap-3 text-[#1358e8]"><span className="flex size-9 items-center justify-center rounded-full bg-[#1660e8] text-white"><Icon name="play" /></span><span className="font-semibold">继续学习</span></div><p className="mt-5 text-sm font-medium text-[#5f7198]">{hero.label} · {hero.chinese}</p><h2 className="mt-1 text-2xl font-bold text-[#10285f] sm:text-3xl">{continueExperience?.module ?? 'Life'}</h2><p className="mt-3 text-sm text-[#566b9d]">{continueExperience ? `${continueExperience.id} · 上次学习到这里` : '从一个真实场景开始'}</p><p className="mt-4 text-sm font-medium text-[#1c407e]">当前学习进度 {progress}% <span className="font-normal text-[#7181a2]">· 已完成 {completed.length}/{catalog.length} 个场景</span></p><div className="mt-3 h-2 max-w-sm overflow-hidden rounded-full bg-[#d9e5fb]"><div className="h-full rounded-full bg-[#1a5fe8] transition-all" style={{ width: `${progress}%` }} /></div>{continueExperience && <Link href={continueExperience.href} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1259e8] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0e4dcc]">继续学习 <Icon name="arrow" /></Link>}</div></section>

    <section className="mt-7 grid gap-4 sm:grid-cols-3">{entryCards.map((entry) => <Link key={entry.href} href={entry.href} className="group min-h-52 rounded-[1.65rem] border border-white bg-white p-6 shadow-[0_10px_28px_rgba(28,77,171,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(28,77,171,0.16)]"><span className="flex size-16 items-center justify-center rounded-full bg-[#eff5ff] text-[#1558db]"><Icon name={entry.icon} /></span><h2 className="mt-7 text-xl font-bold text-[#10285f]">{entry.title}</h2><p className="mt-3 text-sm text-[#617196]">{entry.subtitle}</p><span className="mt-5 flex justify-end text-[#174fd4] transition group-hover:translate-x-1"><Icon name="arrow" /></span></Link>)}</section>

    <section className="mt-7 rounded-[1.65rem] border border-white bg-white p-6 shadow-[0_10px_28px_rgba(28,77,171,0.09)]"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-[#10285f]">最近更新</h2><Link href="/life" className="flex items-center gap-1 text-sm text-[#596b95] hover:text-[#1358e8]">查看全部 <Icon name="arrow" /></Link></div><div className="mt-5 divide-y divide-[#eaf0fb]">{lifeContentUpdates.map((update) => <Link key={update.id} href={`/life?category=${update.category}`} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><span className="rounded-md bg-[#1558e8] px-2 py-1 text-[11px] font-semibold text-white">NEW</span><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eff5ff] text-[#1558e8]"><Icon name="spark" /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-[#162d63]">{update.title}</span><span className="mt-1 block text-sm text-[#68789a]">新增 {update.addedCount} 个真实场景</span></span><span className="text-base font-semibold text-[#1558e8]">+{update.addedCount}</span></Link>)}</div></section>
  </main>;
}
