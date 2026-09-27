'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import IndonesianAudioProvider from '@/components/IndonesianAudioProvider';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import { completeExperience, createEmptyLearningProfile, readLearningProfile, subscribeProfile, toggleFavorite } from '@/lib/learning-profile';
import { getLoveScenesForChapter, loveChapters, loveSceneById, loveScenes, type LoveScene, type LoveToneLevel } from '@/lib/love-indonesian-content';

const toneLabels: Record<LoveToneLevel, { icon: string; label: string; detail: string; className: string }> = {
  natural: { icon: '🟢', label: '日常自然', detail: '可放心用于合适的日常交流', className: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  context: { icon: '🟡', label: '看语境', detail: '需要结合关系、语气和上下文', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  caution: { icon: '⚠️', label: '谨慎使用', detail: '冲突或分手语境，表达前先冷静', className: 'bg-slate-100 text-slate-800 ring-slate-300' },
};

function HeartIcon({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
}

function ChapterCards({ completed, onSelect }: { completed: string[]; onSelect: (scene: LoveScene) => void }) {
  return <section aria-labelledby="love-chapters-title" className="mt-7">
    <div className="flex items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ib-primary)]">10 Chapters</p><h2 id="love-chapters-title" className="mt-1 text-2xl font-bold text-[var(--ib-text-primary)]">从认识到重新选择</h2></div>
      <p className="shrink-0 text-sm font-semibold text-[var(--ib-text-secondary)]">{completed.length} / 100</p>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {loveChapters.map((chapter) => {
        const scenes = getLoveScenesForChapter(chapter.id);
        const done = scenes.filter((scene) => completed.includes(scene.id)).length;
        return <button key={chapter.id} type="button" onClick={() => onSelect(scenes[0])} className="group min-w-0 rounded-[24px] border border-[var(--ib-border-soft)] bg-white p-5 text-left shadow-[var(--ib-shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--ib-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)]">
          <div className="flex items-start justify-between gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ib-primary-soft)] text-sm font-bold text-[var(--ib-primary)]">{chapter.order}</span><span className="rounded-full border border-[var(--ib-border-soft)] bg-[var(--ib-primary-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--ib-primary-strong)]">免费</span></div>
          <h3 className="mt-4 break-words text-lg font-bold text-[var(--ib-text-primary)]">{chapter.title}<span className="ml-2 font-medium text-[var(--ib-text-secondary)]">｜{chapter.chineseTitle}</span></h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{chapter.description}</p>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-[var(--ib-text-secondary)]"><span>{chapter.range}</span><span>{done} / 10</span></div>
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--ib-primary-soft)]"><span className="block h-full rounded-full bg-[var(--ib-primary)] transition-all" style={{ width: `${done * 10}%` }} /></span>
        </button>;
      })}
    </div>
  </section>;
}

function SceneCard({ scene, completed, favorited, onComplete, onFavorite, onNavigate, onClose }: { scene: LoveScene; completed: boolean; favorited: boolean; onComplete: () => void; onFavorite: () => void; onNavigate: (scene: LoveScene) => void; onClose: () => void }) {
  const chapter = loveChapters.find((item) => item.id === scene.chapterId)!;
  const tone = toneLabels[scene.toneLevel];
  const previous = loveScenes[scene.order - 2];
  const next = loveScenes[scene.order];

  return <section aria-label={`${scene.id} 学习卡`} className="mt-7">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button type="button" onClick={onClose} className="min-h-10 rounded-full bg-white px-4 text-sm font-semibold text-[var(--ib-text-secondary)] shadow-sm transition hover:text-[var(--ib-primary)]">← 章节总览</button>
      <p className="text-sm font-semibold text-[var(--ib-text-secondary)]">{scene.order} / 100</p>
    </div>
    <div className="mt-3 overflow-hidden rounded-[30px] border border-[var(--ib-border-soft)] bg-white shadow-[var(--ib-shadow-card)]">
      <div className="bg-gradient-to-br from-[var(--ib-primary-soft)] via-white to-[var(--ib-bg-page)] px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ib-primary)]">尼会说 · 恋爱大全 · {scene.id}</p><p className="mt-1 text-sm font-semibold text-[var(--ib-text-secondary)]">Chapter {chapter.order} · {chapter.title}｜{chapter.chineseTitle}</p></div>
          <button type="button" onClick={onFavorite} aria-label={favorited ? '取消收藏' : '收藏这句话'} aria-pressed={favorited} className={`flex size-11 items-center justify-center rounded-2xl transition ${favorited ? 'bg-[var(--ib-primary-soft)] text-[var(--ib-primary)]' : 'bg-white text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]'}`}><HeartIcon filled={favorited} /></button>
        </div>
        <div className="mt-7 min-w-0">
          <div className="flex min-w-0 items-start justify-between gap-3"><h1 className="min-w-0 break-words text-[clamp(1.75rem,7vw,2.75rem)] font-bold leading-[1.16] tracking-tight text-[var(--ib-text-primary)]" lang="id">{scene.indonesian}</h1><div className="shrink-0"><IndonesianSpeechButton text={scene.ttsText} compact iconOnly /></div></div>
          <p className="mt-4 break-words text-lg font-semibold leading-8 text-[var(--ib-text-secondary)]">{scene.chinese}</p>
          <span className={`mt-5 inline-flex max-w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ring-1 ${tone.className}`}><span>{tone.icon}</span><span>{tone.label}</span><span className="hidden font-medium sm:inline">· {tone.detail}</span></span>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        <section><h2 className="text-sm font-bold text-[var(--ib-text-primary)]">核心词</h2><div className="mt-3 flex flex-wrap gap-2">{scene.coreWords.map((word) => <span key={word.term} className="max-w-full rounded-2xl bg-[var(--ib-primary-soft)] px-3 py-2 text-sm text-[var(--ib-text-primary)]"><strong className="break-words" lang="id">{word.term}</strong><span className="mx-2 text-[var(--ib-text-muted)]">·</span><span className="break-words">{word.meaning}</span></span>)}</div></section>
        <section><h2 className="text-sm font-bold text-[var(--ib-text-primary)]">真实意思 / 语境</h2><p className="mt-2 break-words text-sm leading-7 text-[var(--ib-text-secondary)]">{scene.explanation}</p><p className="mt-2 break-words rounded-2xl bg-[var(--ib-primary-soft)] px-4 py-3 text-sm leading-6 text-[var(--ib-text-primary)]">{scene.usageContext}</p></section>
        <section><h2 className="text-sm font-bold text-[var(--ib-text-primary)]">真实聊天</h2><div className="mt-3 space-y-3">{scene.exampleDialogue.map((line, index) => <div key={`${line.speaker}-${index}`} className={`flex ${line.speaker === 'B' ? 'justify-end' : 'justify-start'}`}><div className={`min-w-0 max-w-[90%] rounded-2xl px-4 py-3 ${line.speaker === 'B' ? 'border border-[var(--ib-border-soft)] bg-white' : 'bg-[var(--ib-primary-soft)]'}`}><div className="flex min-w-0 items-start gap-2"><div className="min-w-0 flex-1"><p className="break-words text-sm font-bold leading-6 text-[var(--ib-text-primary)]" lang="id">{line.indonesian}</p><p className="mt-1 break-words text-xs leading-5 text-[var(--ib-text-secondary)]">{line.chinese}</p></div><IndonesianSpeechButton text={line.indonesian} compact iconOnly /></div></div></div>)}</div></section>
        <section><h2 className="text-sm font-bold text-[var(--ib-text-primary)]">下一句怎么接</h2>{scene.followUps.map((followUp) => <div key={followUp.indonesian} className="mt-3 min-w-0 rounded-2xl border border-[var(--ib-border-soft)] p-4"><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-bold leading-6 text-[var(--ib-text-primary)]" lang="id">{followUp.indonesian}</p><p className="mt-1 break-words text-sm leading-6 text-[var(--ib-text-secondary)]">{followUp.chinese}</p></div><IndonesianSpeechButton text={followUp.indonesian} compact iconOnly /></div></div>)}</section>

        <button type="button" onClick={onComplete} className={`min-h-12 w-full rounded-2xl px-5 text-sm font-bold transition ${completed ? 'bg-[var(--ib-primary-soft)] text-[var(--ib-primary)]' : 'bg-[var(--ib-primary)] text-white hover:bg-[var(--ib-primary-strong)]'}`}>{completed ? '✓ 已学会这句' : '标记为已学会'}</button>
      </div>
    </div>
    <nav aria-label="恋爱印尼语上一句和下一句" className="mt-4 grid grid-cols-2 gap-3">
      {previous ? <button type="button" onClick={() => onNavigate(previous)} className="min-h-12 rounded-2xl bg-white px-4 text-left text-sm font-semibold text-[var(--ib-text-primary)] shadow-sm">← {previous.id}</button> : <span />}
      {next ? <button type="button" onClick={() => onNavigate(next)} className="min-h-12 rounded-2xl bg-[var(--ib-primary)] px-4 text-right text-sm font-semibold text-white shadow-sm hover:bg-[var(--ib-primary-strong)]">{next.id} →</button> : <span className="flex min-h-12 items-center justify-end rounded-2xl bg-[var(--ib-primary-soft)] px-4 text-sm font-bold text-[var(--ib-primary)]">100 / 100 完成</span>}
    </nav>
  </section>;
}

export default function LoveIndonesianExperience({ initialSceneId }: { initialSceneId?: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState(() => createEmptyLearningProfile());
  const [selectedId, setSelectedId] = useState<LoveScene['id'] | ''>(() => {
    const candidate = initialSceneId as LoveScene['id'] | undefined;
    return candidate && loveSceneById.has(candidate) ? candidate : '';
  });
  const selected = useMemo(() => selectedId ? loveSceneById.get(selectedId) : undefined, [selectedId]);
  const completed = profile.completed.filter((id) => id.startsWith('LOVE-'));

  useEffect(() => {
    setProfile(readLearningProfile());
    return subscribeProfile(() => setProfile(readLearningProfile()));
  }, []);

  const navigate = (scene: LoveScene) => {
    setSelectedId(scene.id);
    router.replace(`/love-indonesian?scene=${scene.id}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const close = () => {
    setSelectedId('');
    router.replace('/love-indonesian', { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <IndonesianAudioProvider><main className="mx-auto min-h-[100dvh] w-full max-w-5xl overflow-x-hidden px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-8">
    <Link href="/" className="inline-flex min-h-10 items-center text-sm font-semibold text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← 尼会说 · IndoBrain</Link>
    <header className="relative mt-3 overflow-hidden rounded-[32px] border border-[var(--ib-border-soft)] bg-gradient-to-br from-[var(--ib-primary-soft)] via-white to-[var(--ib-bg-page)] px-5 py-8 shadow-[var(--ib-shadow-card)] sm:px-9 sm:py-10">
      <div aria-hidden="true" className="absolute -right-8 -top-8 size-32 rounded-full bg-[var(--ib-primary)]/10 blur-2xl" />
      <div className="relative"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--ib-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--ib-primary-strong)]">永久免费</span><span className="rounded-full border border-[var(--ib-border-soft)] bg-white px-3 py-1 text-xs font-bold text-[var(--ib-primary)] shadow-sm">100 句 · 10 章</span></div><h1 className="mt-5 flex items-center gap-3 break-words text-3xl font-bold tracking-tight text-[var(--ib-text-primary)] sm:text-5xl"><span className="shrink-0 text-[var(--ib-primary)]"><HeartIcon filled={false} size={36} /></span><span>印尼语恋爱大全</span></h1><p className="mt-3 text-lg font-semibold text-[var(--ib-primary)]">课本不教，但印尼人谈恋爱真的会说。</p><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ib-text-secondary)] sm:text-base">100句真实恋爱印尼语，全部永久免费。从认识、暧昧、确定关系，到想念、吵架、和好、分手与复合，按一段关系的发展顺序学会真实表达。</p></div>
    </header>

    {selected ? <SceneCard scene={selected} completed={profile.completed.includes(selected.id)} favorited={profile.favorites.includes(selected.id)} onComplete={() => completeExperience(selected.id)} onFavorite={() => toggleFavorite(selected.id)} onNavigate={navigate} onClose={close} /> : <ChapterCards completed={completed} onSelect={navigate} />}
  </main></IndonesianAudioProvider>;
}
