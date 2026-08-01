'use client';

import Link from 'next/link';
import type { LearningAchievementStats } from '@/lib/learning-achievements';

export default function LearningAchievementPanel({
  stats,
  newlyMasteredHarvestCount,
  alreadyCompleted = false,
  onContinue,
}: {
  stats: LearningAchievementStats;
  newlyMasteredHarvestCount: number;
  alreadyCompleted?: boolean;
  onContinue?: () => void;
}) {
  return <section className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5" aria-live="polite">
    <h2 className="text-base font-semibold">{alreadyCompleted ? '该场景已经完成' : '🎉 又完成了一个真实场景'}</h2>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <div><p className="text-xs text-stone-500">已经完成</p><p className="mt-1 text-lg font-semibold">{stats.completedExperienceCount} 个真实场景</p></div>
      <div><p className="text-xs text-stone-500">已经掌握</p><p className="mt-1 text-lg font-semibold">{stats.masteredHarvestCount} 个印尼语词汇/词组</p></div>
      <div><p className="text-xs text-stone-500">本次新增</p><p className="mt-1 text-lg font-semibold">{newlyMasteredHarvestCount} 个词汇/词组</p></div>
    </div>
    <div className="mt-5 flex flex-wrap gap-2">
      {onContinue && <button type="button" onClick={onContinue} className="min-h-10 rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition duration-200 hover:bg-white hover:shadow-sm">继续学习</button>}
      <Link href="/about#learning-achievement" className="min-h-10 rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-stone-700">查看学习成果</Link>
    </div>
  </section>;
}
