'use client';

import { useEffect, useState } from 'react';
import { getSessionId } from '@/lib/session';
import SceneCocreationDialog from '@/components/SceneCocreationDialog';
import { completeExperience, readLearningProfile, subscribeProfile, toggleFavorite, track } from '@/lib/learning-profile';

export default function ExperienceActions({ experienceId, indonesian }: { experienceId: string; indonesian: string }) {
  const [status, setStatus] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCocreation, setShowCocreation] = useState(false);
  const event = async (action: string) => {
    await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: getSessionId(), experience_id: experienceId, action }) });
  };
  useEffect(() => {
    event('viewed');
    const sync = () => { const profile = readLearningProfile(); setFavorited(profile.favorites.includes(experienceId)); setCompleted(profile.completed.includes(experienceId)); };
    sync(); return subscribeProfile(sync);
  }, [experienceId]);
  async function copy() {
    await navigator.clipboard.writeText(indonesian);
    await event('experience_copied');
    setStatus('Sudah disalin（已复制）');
  }
  function favorite() { const result = toggleFavorite(experienceId); setFavorited(result.favorited); setStatus(result.favorited ? '已收藏。' : '已取消收藏。'); }
  function complete() { const result = completeExperience(experienceId); setCompleted(true); setStatus(result.completed ? '学习已完成。' : '这条 Experience 已完成。'); }
  function openCocreation() { setShowCocreation(true); track('scene_cocreation_opened', experienceId); }
  return <section className="mt-7">
    <div className="flex flex-wrap gap-2">
    <button onClick={copy} className="min-h-10 cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition duration-200 hover:bg-stone-50 hover:shadow-sm">Salin Bahasa Indonesia（复制印尼语）</button>
    <button onClick={favorite} className={`min-h-10 cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition duration-200 hover:shadow-sm ${favorited ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 hover:bg-stone-50'}`}>{favorited ? '已收藏' : '收藏'}</button>
    <button onClick={openCocreation} className="min-h-10 cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition duration-200 hover:bg-stone-50 hover:shadow-sm">场景共创</button>
    </div>
    <div className="mt-4"><button onClick={complete} disabled={completed} className={`min-h-10 rounded-xl px-4 py-2 text-sm font-medium ${completed ? 'cursor-default border border-stone-200 bg-stone-100 text-stone-500' : 'cursor-pointer bg-stone-900 text-white hover:bg-stone-700'}`}>{completed ? '已完成学习' : '完成学习'}</button></div>
    {showCocreation && <SceneCocreationDialog experienceId={experienceId} onClose={() => setShowCocreation(false)} />}
    {status && <p className="mt-3 text-sm text-stone-500">{status}</p>}
  </section>;
}
