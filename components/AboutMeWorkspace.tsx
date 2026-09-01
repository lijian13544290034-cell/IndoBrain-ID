'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import IndonesianAudioProvider from '@/components/IndonesianAudioProvider';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import AchievementCardLauncher from '@/components/achievement-card/AchievementCardLauncher';
import { getBasicFavoriteId, resolveBasicFavoriteIds } from '@/lib/basic-essentials';
import type { CatalogExperience } from '@/lib/experience-catalog';
import { getLearningAchievementStats } from '@/lib/learning-achievements';
import { getIndonesiaPowerFromLearning, getIndonesiaLevel, getIndonesiaLevelDisplayId, getNextIndonesiaLevel } from '@/lib/v2/indonesia-power';
import { createEmptyLearningProfile, readLearningProfile, subscribeProfile, toggleFavorite, type LearningProfile } from '@/lib/learning-profile';
import IndonesiaPowerBadge from '@/components/IndonesiaPowerBadge';

const statusLabel = { pending: '待审核', accepted: '已接受', published: '已发布', rejected: '未采用' } as const;

export default function AboutMeWorkspace({ catalog, total }: { catalog: CatalogExperience[]; total: number }) {
  const [profile, setProfile] = useState<LearningProfile>(createEmptyLearningProfile);
  useEffect(() => {
    const sync = () => setProfile(readLearningProfile());
    sync();
    return subscribeProfile(sync);
  }, []);

  const favorites = useMemo(
    () => profile.favorites.map((id) => catalog.find((item) => item.id === id)).filter((item): item is CatalogExperience => Boolean(item)),
    [profile.favorites, catalog],
  );
  const basicFavorites = useMemo(() => resolveBasicFavoriteIds(profile.favorites), [profile.favorites]);
  const favoriteCount = favorites.length + basicFavorites.length;
  const achievements = useMemo(() => getLearningAchievementStats(profile.completed, catalog), [profile.completed, catalog]);
  const indonesiaPower = useMemo(() => getIndonesiaPowerFromLearning(achievements.completedExperienceCount, achievements.masteredHarvestCount), [achievements]);
  const currentLevel = getIndonesiaLevel(indonesiaPower);
  const nextLevel = getNextIndonesiaLevel(indonesiaPower);
  const pointsToNextLevel = nextLevel ? Math.max(0, nextLevel.min - indonesiaPower) : 0;

  async function copy(text: string) {
    if (navigator.clipboard) await navigator.clipboard.writeText(text);
  }

  return <IndonesianAudioProvider><main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Beranda（返回首页）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">IndoBrain</p>
      <h1 className="mt-1 text-2xl font-semibold">Tentang Saya <span className="text-base font-normal text-stone-500">（关于我）</span></h1>
      <p className="mt-2 text-sm leading-6 text-stone-500">只保存这台设备上的学习记录；暂不跨设备同步。</p>
    </header>

    <section className="mt-7 grid gap-3 sm:grid-cols-3">
      <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs text-stone-400">收藏</p><p className="mt-2 text-2xl font-semibold">{favoriteCount}</p></article>
      <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs text-stone-400">连续学习天数</p><p className="mt-2 text-2xl font-semibold">{profile.currentStreak} 天</p></article>
      <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs text-stone-400">已完成 Experience</p><p className="mt-2 text-2xl font-semibold">{achievements.completedExperienceCount} / {total}</p></article>
    </section>

    <section id="learning-achievement" className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <h2 className="text-lg font-semibold">成长中心</h2>
      <p className="mt-1 text-sm text-stone-500">当前设备学习成果</p>
      <div className="mt-4"><IndonesiaPowerBadge totalIndonesiaPower={indonesiaPower} size="detail" /></div>
      <div className="mt-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600"><p>{getIndonesiaLevelDisplayId(indonesiaPower)} · {currentLevel.nameZh}</p>{nextLevel ? <p className="mt-1">距离下一等级还差 {pointsToNextLevel} 印尼力 · 下一等级门槛 {nextLevel.min}</p> : <p className="mt-1">已达到最高等级</p>}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs text-stone-400">已完成真实场景</p><p className="mt-2 text-2xl font-semibold">{achievements.completedExperienceCount}</p></article>
        <article className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs text-stone-400">已掌握印尼语词汇/词组</p><p className="mt-2 text-2xl font-semibold">{achievements.masteredHarvestCount}</p></article>
        <article className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs text-stone-400">连续学习天数</p><p className="mt-2 text-2xl font-semibold">{profile.currentStreak} 天</p></article>
      </div>
      <div className="mt-5"><AchievementCardLauncher stats={achievements} streakDays={profile.currentStreak} /></div>
      {achievements.recentlyCompleted.length > 0 && <div className="mt-5"><p className="text-sm font-medium">最近完成</p><ul className="mt-2 space-y-2">{achievements.recentlyCompleted.map((experience) => <li key={experience.id}><Link href={experience.href} className="text-sm text-stone-700 hover:underline">{experience.id} · {experience.task}</Link></li>)}</ul></div>}
    </section>

    <section id="favorites" className="mt-8 scroll-mt-6">
      <h2 className="text-lg font-semibold">收藏</h2>
      {favorites.length || basicFavorites.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {basicFavorites.map((item) => <article key={item.conceptKey} className="flex min-h-44 flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium text-stone-400">基础必会 · {item.id}</p>
          <Link href={`/basic-essentials?category=${encodeURIComponent(item.categoryId)}&sub=${encodeURIComponent(item.subcategoryId)}&concept=${encodeURIComponent(item.conceptKey)}`} className="mt-2 text-lg font-semibold hover:underline">{item.indonesian}</Link>
          <p className="mt-1 text-sm leading-6 text-stone-700">{item.chinese}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-4"><IndonesianSpeechButton text={item.ttsText} compact /><button onClick={() => { toggleFavorite(getBasicFavoriteId(item.conceptKey)); setProfile(readLearningProfile()); }} className="min-h-8 rounded-lg border border-stone-300 px-2 text-xs font-medium hover:bg-stone-100" aria-label={`取消收藏 ${item.indonesian}`}>取消收藏</button></div>
        </article>)}
        {favorites.map((item) => <article key={item.id} className="flex min-h-44 flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-medium text-stone-400">{item.id} · {item.module}（{item.category}）</p><Link href={item.href} className="mt-2 font-semibold hover:underline">{item.task}</Link><p className="mt-2 text-sm leading-6 text-stone-700">{item.indonesian}</p><div className="mt-auto flex flex-wrap gap-2 pt-4"><IndonesianSpeechButton text={item.indonesian} compact /><button onClick={() => copy(item.indonesian)} className="min-h-8 rounded-lg border border-stone-300 px-2 text-xs font-medium hover:bg-stone-100">复制</button><button onClick={() => { toggleFavorite(item.id); setProfile(readLearningProfile()); }} className="min-h-8 rounded-lg border border-stone-300 px-2 text-xs font-medium hover:bg-stone-100">取消收藏</button></div></article>)}
      </div> : <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-500">还没有收藏。打开任意 Experience 或基础词汇，点击“收藏”即可保存。</p>}
    </section>

    <section className="mt-8">
      <h2 className="text-lg font-semibold">我的贡献</h2>
      {profile.submissions.length ? <div className="mt-4 space-y-3">{profile.submissions.map((submission) => <article key={submission.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="font-medium">{submission.happened}</p><span className="shrink-0 text-xs text-stone-400">{statusLabel[submission.status]}</span></div><p className="mt-2 text-sm text-stone-600">想表达：{submission.wantedToSay}</p><p className="mt-2 text-xs text-stone-400">{new Date(submission.submittedAt).toLocaleDateString()} · {submission.experienceId}</p></article>)}</div> : <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-500">还没有提交场景。你可以在任意 Experience 页面点击“场景共创”。</p>}
    </section>
  </main></IndonesianAudioProvider>;
}
