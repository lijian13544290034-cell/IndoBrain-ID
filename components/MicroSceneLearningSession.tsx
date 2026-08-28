'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import { completeExperience, readLearningProfile, subscribeProfile } from '@/lib/learning-profile';
import type { MicroSceneCard } from '@/lib/micro-scenes';

function ArrowIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}

export default function MicroSceneLearningSession({ items, domainTitle, topicTitle, backHref }: { items: MicroSceneCard[]; domainTitle: string; topicTitle: string; backHref: string }) {
  const [index, setIndex] = useState(0);
  const [profile, setProfile] = useState<ReturnType<typeof readLearningProfile> | null>(null);
  const current = items[index];

  useEffect(() => {
    setProfile(readLearningProfile());
    return subscribeProfile(() => setProfile(readLearningProfile()));
  }, []);
  useEffect(() => setIndex(0), [items]);

  const completedIds = profile?.completed ?? [];
  const completedCount = useMemo(() => items.filter((item) => completedIds.includes(item.progressKey)).length, [items, completedIds]);
  const completed = current ? completedIds.includes(current.progressKey) : false;
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  if (!current) {
    return <section className="mt-5 rounded-[24px] border border-dashed border-[var(--ib-border-soft)] bg-white px-5 py-10 text-center">
      <p className="text-sm text-[var(--ib-text-secondary)]">这个主题暂时没有通过审核的微场景。</p>
      <Link href={backHref} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--ib-primary)] px-5 text-sm font-semibold text-white">返回主题列表</Link>
    </section>;
  }

  const goNext = () => {
    completeExperience(current.progressKey);
    setIndex((value) => (value + 1) % items.length);
  };

  return <>
    <div className="mt-5 flex items-center justify-between gap-3 text-sm">
      <Link href={backHref} className="font-medium text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← {domainTitle}</Link>
      <span className="text-[var(--ib-text-secondary)]">{completedCount}/{items.length} 已学</span>
    </div>

    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--ib-border-soft)]" aria-label={`学习进度 ${progress}%`}>
      <div className="h-full rounded-full bg-[var(--ib-primary)] transition-all" style={{ width: `${progress}%` }} />
    </div>

    <section className="mx-auto mt-5 w-full max-w-2xl rounded-[28px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-8">
      <div>
        <p className="text-xs font-semibold text-[var(--ib-primary)]">{topicTitle}</p>
        <p className="mt-1 text-sm text-[var(--ib-text-secondary)]">{index + 1} / {items.length}</p>
      </div>

      <div className="mt-6 space-y-4">
        {current.lines.map((line, lineIndex) => <article key={`${current.assetId}:${lineIndex}`} className="rounded-[22px] bg-[var(--ib-bg-soft)] px-5 py-5">
          {current.lines.length > 1 && <p className="text-xs font-semibold text-[var(--ib-text-muted)]">{lineIndex + 1}</p>}
          <p lang="id" className="mt-1 break-words text-[26px] font-bold leading-[1.35] tracking-tight text-[var(--ib-text-primary)] sm:text-[32px]">{line.indonesian}</p>
          <p className="mt-3 text-[15px] leading-6 text-[var(--ib-text-secondary)]">{line.chinese}</p>
          <IndonesianSpeechButton text={line.ttsText} />
        </article>)}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
        <button type="button" onClick={() => completeExperience(current.progressKey)} disabled={completed} className={`min-h-12 rounded-2xl border px-4 text-sm font-semibold transition ${completed ? 'border-[var(--ib-border-soft)] bg-[var(--ib-bg-soft)] text-[var(--ib-text-secondary)]' : 'border-[var(--ib-primary)] text-[var(--ib-primary)] hover:bg-[var(--ib-primary-soft)]'}`}>{completed ? '已学会' : '标记学会'}</button>
        <button type="button" onClick={goNext} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--ib-primary)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--ib-primary-strong)]">下一个 <ArrowIcon /></button>
      </div>
    </section>
  </>;
}
