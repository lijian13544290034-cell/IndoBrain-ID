'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ChineseSpeechButton from '@/components/ChineseSpeechButton';
import LocalPronunciationRecorder from '@/components/LocalPronunciationRecorder';
import MandarinWorkFeedback from '@/components/MandarinWorkFeedback';
import type { MandarinLevel2Day, MandarinLevel2Item } from '@/lib/server/mandarin-work-level2';
import { completeMandarinDay, completeMandarinItem, emptyMandarinWorkProfile, readMandarinWorkProfile, subscribeMandarinWorkProfile, toggleMandarinFavorite } from '@/lib/mandarin-work-profile';

function PinyinBlocks({ item }: { item: MandarinLevel2Item }) {
  const hanzi = Array.from(item.chinese.replace(/[？?。！!，,、…\s]/g, ''));
  const readings = item.pinyin.split(/\s+/).filter(Boolean);
  const aligned = hanzi.length === readings.length;
  return <div className="flex flex-wrap gap-2" aria-label="Hanzi dan pinyin sejajar">
    {aligned ? hanzi.map((character, index) => <span key={`${character}-${index}`} className="inline-flex min-w-9 flex-col items-center rounded-xl bg-[var(--ib-primary-soft)] px-2 py-1.5"><span className="text-xl font-bold text-[var(--ib-primary-strong)]">{character}</span><span className="whitespace-nowrap text-[15px] font-semibold leading-5 text-[var(--ib-text-secondary)]">{readings[index]}</span></span>) : <span className="rounded-xl bg-[var(--ib-primary-soft)] px-3 py-2 text-[15px] font-semibold leading-5 text-[var(--ib-text-secondary)]">{item.pinyin}</span>}
  </div>;
}

function LessonItem({ item, favorite, completed, onFavorite, onComplete }: { item: MandarinLevel2Item; favorite: boolean; completed: boolean; onFavorite: () => void; onComplete: () => void }) {
  const favoriteId = `mandarin-work-30d:${item.id}`;
  return <article className="rounded-3xl border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)]" data-favorite-id={favoriteId}>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-2xl font-bold text-[var(--ib-primary-strong)]">{item.chinese}</p><p className="mt-2 text-[13px] font-medium leading-5 text-[var(--ib-text-secondary)]">{item.indonesian}</p></div><span className="rounded-full bg-[var(--ib-primary-soft)] px-2 py-1 text-[10px] font-bold text-[var(--ib-primary)]">{item.kind}</span></div>
    <div className="mt-4"><PinyinBlocks item={item}/></div>
    <div className="mt-4 flex flex-wrap gap-2"><ChineseSpeechButton text={item.chinese} compact label="Dengarkan Mandarin"/><button type="button" onClick={onFavorite} aria-pressed={favorite} className="min-h-11 rounded-full border border-[var(--ib-border-soft)] px-4 text-sm font-semibold text-[var(--ib-primary)]">{favorite ? '★ Favorit' : '☆ Favorit'}</button><button type="button" onClick={onComplete} className="min-h-11 rounded-full border border-[var(--ib-border-soft)] px-4 text-sm font-semibold text-[var(--ib-text-secondary)]">{completed ? '✓ Dipelajari' : 'Tandai dipelajari'}</button></div>
  </article>;
}

export default function MandarinWorkLevel2Experience({ lesson }: { lesson: MandarinLevel2Day }) {
  const [profile, setProfile] = useState(emptyMandarinWorkProfile());
  const [feedbackPrompt, setFeedbackPrompt] = useState(false);
  useEffect(() => { const sync = () => setProfile(readMandarinWorkProfile()); sync(); return subscribeMandarinWorkProfile(sync); }, []);
  const progress = useMemo(() => profile.completedDays.filter((day) => day >= 31 && day <= 60).length, [profile.completedDays]);
  const update = (next: ReturnType<typeof readMandarinWorkProfile>) => setProfile(next);

  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))] text-[var(--ib-text-primary)]">
    <div className="mx-auto w-full max-w-5xl">
      <header className="rounded-[32px] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[var(--ib-primary)]">Mandarin untuk Kerja — Level 2</p><p className="text-xs font-semibold text-[var(--ib-text-muted)]">工作中文进阶 · Day {lesson.day}</p></div><Link href="/learn-chinese/level-2" className="text-sm font-bold text-[var(--ib-primary)]">Daftar Level 2</Link></div>
        <h1 className="mt-4 text-3xl font-bold text-[var(--ib-primary-strong)] sm:text-5xl">{lesson.title}</h1>
        <p className="mt-2 text-sm font-semibold text-[var(--ib-text-secondary)]">{lesson.module === 'construction' ? '🏗️ Mandarin untuk Proyek Konstruksi' : lesson.module === 'boss-listening' ? '👂 Dengar Bos Tiongkok' : 'Selesaikan Masalah Kerja'}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--ib-border-soft)]"><div className="h-full bg-[var(--ib-primary)]" style={{ width: `${Math.round(progress / 30 * 100)}%` }}/></div><p className="mt-2 text-xs text-[var(--ib-text-muted)]">{progress}/30 hari Level 2 selesai</p>
      </header>

      {lesson.items.length ? <section className="mt-5 grid gap-4 md:grid-cols-2">{lesson.items.map((entry) => {
        const favoriteId = `mandarin-work-30d:${entry.id}`;
        return <LessonItem key={entry.id} item={entry} favorite={profile.favorites.includes(favoriteId)} completed={profile.completedItems.includes(entry.id)} onFavorite={() => update(toggleMandarinFavorite(favoriteId))} onComplete={() => update(completeMandarinItem(entry.id))}/>;
      })}</section> : null}

      {lesson.recognition.length ? <section className="mt-5 rounded-3xl border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)]"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">👂 Bos Tiongkok mungkin mengatakan:</p><p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">Kenali maksud tugasnya. Kamu tidak harus menghafal semua variasi.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{lesson.recognition.map((text, index) => <div key={`${text}-${index}`} className="rounded-2xl bg-[var(--ib-primary-soft)] p-3"><p className="text-lg font-bold text-[var(--ib-primary-strong)]">{text}</p><div className="mt-2"><ChineseSpeechButton text={text} compact/></div></div>)}</div></section> : null}

      {lesson.dialogue.length ? <section className="mt-5 rounded-3xl bg-white p-5 shadow-[var(--ib-shadow-card)]"><h2 className="text-xl font-bold text-[var(--ib-primary-strong)]">Dialog kerja</h2><div className="mt-4 grid gap-3">{lesson.dialogue.map((turn, index) => <div key={`${turn.chinese}-${index}`} className={`max-w-[92%] rounded-2xl border p-3 ${turn.role === '员工' ? 'ml-auto border-[var(--ib-border-soft)] bg-white' : 'border-transparent bg-[var(--ib-primary-soft)]'}`}><p className="text-[10px] font-bold text-[var(--ib-text-muted)]">{turn.role}</p><p className="mt-1 text-xl font-bold text-[var(--ib-primary-strong)]">{turn.chinese}</p><div className="mt-2"><ChineseSpeechButton text={turn.chinese} compact/></div></div>)}</div></section> : null}

      {lesson.unknownInput ? <section className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5"><p className="font-bold text-amber-900">Self-rescue listening · {lesson.unknownInput.classification} · {lesson.unknownInput.mode}</p><p className="mt-2 text-sm leading-6 text-amber-800">Tidak perlu menebak artinya. Dengarkan, lalu gunakan salah satu kalimat self-rescue.</p><div className="mt-3"><ChineseSpeechButton text={lesson.unknownInput.chinese} label="Dengarkan UNKNOWN_INPUT"/></div><div className="mt-3 flex flex-wrap gap-2">{['我不懂。','没听清。','慢一点。','再说一次。','什么意思？'].map((text) => <span key={text} className="rounded-full bg-white px-3 py-2 text-sm font-bold text-amber-900">{text}</span>)}</div></section> : null}

      {lesson.safety ? <section className="mt-5 rounded-3xl border-2 border-amber-400 bg-amber-50 p-5" role="note"><h2 className="text-xl font-bold text-amber-950">⚠️ Keselamatan di lokasi kerja</h2><p className="mt-2 text-sm leading-6 text-amber-900">现场听到安全类中文时：先执行安全指令，再处理语言理解。</p>{lesson.day === 60 ? <div className="mt-3 text-sm font-semibold text-amber-950"><p>停！ — Berhenti!</p><p>不要过去！ — Jangan ke sana!</p></div> : null}</section> : null}

      <div className="mt-5"><LocalPronunciationRecorder/></div>
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => { update(completeMandarinDay(lesson.day)); setFeedbackPrompt(true); }} className="min-h-12 flex-1 rounded-full bg-[var(--ib-primary)] px-5 font-bold text-white">Selesaikan Day {lesson.day}</button>{lesson.day < 60 ? <Link href={`/learn-chinese/level-2/${lesson.day + 1}`} className="inline-flex min-h-12 items-center rounded-full border border-[var(--ib-border-soft)] bg-white px-5 font-bold text-[var(--ib-primary)]">Day berikutnya</Link> : null}</div>
      <MandarinWorkFeedback day={lesson.day} level={2} showCompletionPrompt={feedbackPrompt} onDismissCompletionPrompt={() => setFeedbackPrompt(false)}/>
    </div>
  </main>;
}
