'use client';

import { useEffect, useState } from 'react';
import LearningAchievementPanel from '@/components/LearningAchievementPanel';
import type { CatalogExperience } from '@/lib/experience-catalog';
import { getLearningAchievementStats, getNewlyMasteredHarvestCount, type LearningAchievementStats } from '@/lib/learning-achievements';
import { getSessionId } from '@/lib/session';
import SceneCocreationDialog from '@/components/SceneCocreationDialog';
import { completeExperience, readLearningProfile, subscribeProfile, toggleFavorite, track } from '@/lib/learning-profile';

export default function ExperienceActions({ experienceId, indonesian, harvest, achievementCatalog }: { experienceId: string; indonesian: string; harvest: string[]; achievementCatalog: CatalogExperience[] }) {
  const [status, setStatus] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCocreation, setShowCocreation] = useState(false);
  const [achievement, setAchievement] = useState<{ stats: LearningAchievementStats; newlyMasteredHarvestCount: number; alreadyCompleted: boolean; streakDays?: number } | null>(null);
  const event = async (action: string) => {
    await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: getSessionId(), experience_id: experienceId, action }) });
  };
  useEffect(() => {
    event('viewed');
    const sync = () => {
      const profile = readLearningProfile();
      const wasCompleted = profile.completed.includes(experienceId);
      setFavorited(profile.favorites.includes(experienceId));
      setCompleted(wasCompleted);
      if (wasCompleted) setAchievement({ stats: getLearningAchievementStats(profile.completed, achievementCatalog), newlyMasteredHarvestCount: 0, alreadyCompleted: true, streakDays: profile.currentStreak });
    };
    sync(); return subscribeProfile(sync);
  }, [experienceId]);
  async function copy() {
    await navigator.clipboard.writeText(indonesian);
    await event('experience_copied');
    setStatus('Sudah disalin（已复制）');
  }
  function favorite() { const result = toggleFavorite(experienceId); setFavorited(result.favorited); setStatus(result.favorited ? '已收藏。' : '已取消收藏。'); }
  function complete() {
    const before = readLearningProfile();
    const result = completeExperience(experienceId);
    const alreadyCompleted = !result.completed;
    setCompleted(true);
    setAchievement({
      stats: getLearningAchievementStats(result.profile.completed, achievementCatalog),
      newlyMasteredHarvestCount: alreadyCompleted ? 0 : getNewlyMasteredHarvestCount(before.completed, harvest, achievementCatalog),
      alreadyCompleted,
      streakDays: result.profile.currentStreak,
    });
    setStatus(result.completed ? '学习已完成。' : '这条 Experience 已完成。');
  }
  function openCocreation() { setShowCocreation(true); track('scene_cocreation_opened', experienceId); }
  return <section className="mt-7">
    <div className="flex flex-wrap gap-2">
    <button onClick={copy} className="min-h-10 cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition duration-200 hover:bg-stone-50 hover:shadow-sm">复制</button>
    <button onClick={favorite} className={`min-h-10 cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition duration-200 hover:shadow-sm ${favorited ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 hover:bg-stone-50'}`}>{favorited ? '已收藏' : '收藏'}</button>
    <button onClick={openCocreation} className="min-h-10 cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition duration-200 hover:bg-stone-50 hover:shadow-sm">场景共创</button>
    </div>
    <div className="mt-4"><button onClick={complete} disabled={completed} className={`min-h-10 rounded-xl px-4 py-2 text-sm font-medium ${completed ? 'cursor-default border border-stone-200 bg-stone-100 text-stone-500' : 'cursor-pointer bg-stone-900 text-white hover:bg-stone-700'}`}>{completed ? '已完成学习' : '完成学习'}</button></div>
    {achievement && <LearningAchievementPanel {...achievement} onContinue={() => setAchievement(null)} />}
    {showCocreation && <SceneCocreationDialog experienceId={experienceId} onClose={() => setShowCocreation(false)} />}
    {status && <p className="mt-3 text-sm text-stone-500">{status}</p>}
  </section>;
}
