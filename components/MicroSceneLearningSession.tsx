'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import MarkdownExperience from '@/components/MarkdownExperience';
import { harvestMeaning, harvestTerm } from '@/lib/harvest';
import { completeExperience, readLearningProfile, subscribeProfile, toggleFavorite } from '@/lib/learning-profile';
import type { QuickMicroSceneCard } from '@/lib/micro-scenes';

function ArrowIcon({ reverse = false }: { reverse?: boolean }) {
  return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={reverse ? 'rotate-180' : undefined}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}

function displayExplanation(explanation: string) {
  return explanation.replace(/(?:\r?\n\s*)?---\s*$/, '').trim();
}

function isLearned(item: QuickMicroSceneCard, completedIds: string[]) {
  return [item.progressKey, ...item.legacyProgressKeys].some((key) => completedIds.includes(key));
}

export default function MicroSceneLearningSession({ items, domainTitle, topicTitle, backHref }: { items: QuickMicroSceneCard[]; domainTitle: string; topicTitle: string; backHref: string }) {
  const [index, setIndex] = useState(0);
  const [profile, setProfile] = useState<ReturnType<typeof readLearningProfile> | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const current = items[index];

  useEffect(() => {
    setProfile(readLearningProfile());
    return subscribeProfile(() => setProfile(readLearningProfile()));
  }, []);
  useEffect(() => setIndex(0), [items]);

  const completedIds = profile?.completed ?? [];
  const completedCount = useMemo(() => items.filter((item) => isLearned(item, completedIds)).length, [items, completedIds]);
  const completed = current ? isLearned(current, completedIds) : false;
  const favorited = current ? profile?.favorites.includes(current.sourceId) ?? false : false;
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  if (!current) {
    return <section className="mt-5 rounded-[24px] border border-dashed border-[var(--ib-border-soft)] bg-white px-5 py-10 text-center">
      <p className="text-sm text-[var(--ib-text-secondary)]">这个主题暂时没有已映射的微场景。</p>
      <Link href={backHref} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--ib-primary)] px-5 text-sm font-semibold text-white">返回主题列表</Link>
    </section>;
  }

  const moveTo = (nextIndex: number) => {
    setIndex((nextIndex + items.length) % items.length);
    window.requestAnimationFrame(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const goNext = () => {
    completeExperience(current.progressKey);
    moveTo(index + 1);
  };
  const toggleCurrentFavorite = () => toggleFavorite(current.sourceId);
  const explanation = displayExplanation(current.explanation);

  return <>
    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
      <Link href={backHref} className="inline-flex min-h-10 items-center font-medium text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← {domainTitle}</Link>
      <span className="shrink-0 text-[var(--ib-text-secondary)]">{completedCount}/{items.length} 已学</span>
    </div>

    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ib-border-soft)]" aria-label={`学习进度 ${progress}%`}>
      <div className="h-full rounded-full bg-[var(--ib-primary)] transition-[width]" style={{ width: `${progress}%` }} />
    </div>

    <section ref={cardRef} className="mx-auto mt-4 w-full max-w-2xl scroll-mt-3 overflow-hidden rounded-[26px] border border-[var(--ib-border-soft)] bg-white shadow-[var(--ib-shadow-card)]">
      <div className="px-5 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.08em] text-[var(--ib-primary)]">现实瞬间 · {topicTitle}</p>
            {current.momentTitle ? <p className="mt-2 text-sm font-medium text-[var(--ib-text-secondary)]">{current.momentTitle}</p> : null}
          </div>
          <span className="shrink-0 text-xs tabular-nums text-[var(--ib-text-muted)]">{index + 1} / {items.length}</span>
        </div>

        <h1 className="mt-3 text-[22px] font-bold leading-8 text-[var(--ib-text-primary)] sm:text-2xl">{current.sceneTitle}</h1>

        <div className="mt-4 rounded-[20px] bg-[var(--ib-bg-soft)] px-4 py-4 sm:px-5">
          <p lang="id" className="break-words text-[27px] font-bold leading-[1.3] tracking-tight text-[var(--ib-text-primary)] sm:text-[32px]">{current.indonesian}</p>
          <IndonesianSpeechButton text={current.indonesian} />
        </div>

        <section className="mt-6 border-t border-[var(--ib-border-soft)] pt-5">
          <h2 className="text-sm font-bold text-[var(--ib-text-primary)]">什么时候这样说？</h2>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-[var(--ib-text-secondary)]">{explanation}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-bold text-[var(--ib-text-primary)]">今天记住</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {current.harvest.map((entry) => {
              const term = harvestTerm(entry);
              const meaning = harvestMeaning(entry);
              return <li key={entry} className="min-w-0 rounded-2xl border border-[var(--ib-border-soft)] px-3.5 py-3">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="min-w-0 break-words text-sm font-semibold text-[var(--ib-text-primary)]">{term}</span>
                  <IndonesianSpeechButton text={term} compact iconOnly />
                </div>
                {meaning ? <p className="mt-1 break-words text-xs leading-5 text-[var(--ib-text-secondary)]">{meaning}</p> : null}
              </li>;
            })}
          </ul>
        </section>

        {current.pattern ? <section className="mt-6 rounded-[20px] border border-[var(--ib-border-soft)] bg-[var(--ib-primary-soft)]/35 px-4 py-4">
          <h2 className="text-sm font-bold text-[var(--ib-text-primary)]">顺便会一句</h2>
          <p lang="id" className="mt-3 break-words text-base font-semibold leading-7 text-[var(--ib-text-primary)]">{current.pattern.indonesian}</p>
          <IndonesianSpeechButton text={current.pattern.indonesian} compact />
          <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{current.pattern.chinese}</p>
        </section> : null}

        {current.insight ? <section className="mt-6 rounded-[20px] border border-[var(--ib-border-soft)] px-4 py-4">
          <h2 className="text-sm font-bold text-[var(--ib-text-primary)]">学习提示</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--ib-text-primary)]">{current.insight.indonesian}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{current.insight.chinese}</p>
        </section> : null}

        {current.content ? <details className="mt-6 rounded-[20px] border border-[var(--ib-border-soft)] px-4 py-3">
          <summary className="min-h-8 cursor-pointer py-1 text-sm font-bold text-[var(--ib-text-primary)]">展开工厂学习补充</summary>
          <MarkdownExperience content={current.content} compact />
        </details> : null}

        <p className="mt-6 text-[11px] tracking-wide text-[var(--ib-text-muted)]">{current.sourceId}</p>
      </div>

      <div className="border-t border-[var(--ib-border-soft)] bg-[var(--ib-bg-soft)] px-4 py-4 sm:px-6">
        <div className="grid grid-cols-[auto_1fr] gap-2 sm:grid-cols-[auto_auto_1fr]">
          <button type="button" onClick={() => moveTo(index - 1)} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--ib-border-soft)] bg-white px-3 text-[var(--ib-text-secondary)] hover:border-[var(--ib-primary)]" aria-label="上一个场景"><ArrowIcon reverse /></button>
          <button type="button" onClick={toggleCurrentFavorite} aria-pressed={favorited} className={`min-h-12 rounded-2xl border px-4 text-sm font-semibold transition ${favorited ? 'border-[var(--ib-primary)] bg-[var(--ib-primary-soft)] text-[var(--ib-primary)]' : 'border-[var(--ib-border-soft)] bg-white text-[var(--ib-text-secondary)] hover:border-[var(--ib-primary)]'}`}>{favorited ? '已收藏' : '收藏'}</button>
          <button type="button" onClick={goNext} className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--ib-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--ib-primary-strong)] sm:col-span-1">{completed ? '下一场景' : '学会了，下一场景'}<ArrowIcon /></button>
        </div>
      </div>
    </section>
  </>;
}
