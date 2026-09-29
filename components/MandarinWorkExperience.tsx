'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ChineseSpeechButton from '@/components/ChineseSpeechButton';
import LocalPronunciationRecorder from '@/components/LocalPronunciationRecorder';
import MandarinWorkFeedback from '@/components/MandarinWorkFeedback';
import { SELF_RESCUE_DAY14, SELF_RESCUE_DAY30, canonicalTranslation, completionCopy, mandarinWorkDays, type MandarinWorkItem, type PinyinSegment } from '@/lib/mandarin-work-course';
import { completeMandarinDay, completeMandarinItem, emptyMandarinWorkProfile, readMandarinWorkProfile, subscribeMandarinWorkProfile, toggleMandarinFavorite } from '@/lib/mandarin-work-profile';

function PinyinLine({ segments }: { segments: PinyinSegment[] }) {
  return <div className="flex flex-wrap gap-2" aria-label="Hanzi dan pinyin sejajar">{segments.map((segment, index) => <span key={`${segment.hanzi}-${index}`} className="inline-flex min-w-9 flex-col items-center rounded-xl bg-[var(--ib-primary-soft)] px-2 py-1.5"><span className="text-xl font-bold text-[var(--ib-primary-strong)]">{segment.hanzi}</span><span className="whitespace-nowrap text-[15px] font-semibold leading-5 text-[var(--ib-text-secondary)]">{segment.pinyin}</span></span>)}</div>;
}

function ItemCard({ item, favorited, completed, onFavorite, onComplete }: { item: MandarinWorkItem; favorited: boolean; completed: boolean; onFavorite: () => void; onComplete: () => void }) {
  return <article className="rounded-3xl border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)]">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-2xl font-bold tracking-wide text-[var(--ib-primary-strong)]">{item.chinese}</p><p className="mt-2 text-[13px] font-medium text-[var(--ib-text-secondary)]">{item.indonesian}</p></div><span className="rounded-full bg-[var(--ib-primary-soft)] px-2 py-1 text-[10px] font-bold text-[var(--ib-primary)]">{item.itemType}</span></div>
    <div className="mt-4"><PinyinLine segments={item.pinyinSegments} /></div>
    {item.indonesianExplanation ? <p className="mt-4 rounded-2xl bg-[var(--ib-bg-muted)] p-3 text-sm leading-6 text-[var(--ib-text-secondary)]">{item.indonesianExplanation}</p> : null}
    <div className="mt-4 flex flex-wrap gap-2"><ChineseSpeechButton text={item.audioText} compact label="Dengarkan Mandarin"/><button type="button" onClick={onFavorite} aria-pressed={favorited} className="min-h-11 rounded-full border border-[var(--ib-border-soft)] px-4 text-sm font-semibold text-[var(--ib-primary)]">{favorited ? '★ Favorit' : '☆ Favorit'}</button><button type="button" onClick={onComplete} className="min-h-11 rounded-full border border-[var(--ib-border-soft)] px-4 text-sm font-semibold text-[var(--ib-text-secondary)]">{completed ? '✓ Dipelajari' : 'Tandai dipelajari'}</button></div>
  </article>;
}

function SelfRescue({ day }: { day: 14 | 30 }) {
  const data = day === 14 ? SELF_RESCUE_DAY14 : SELF_RESCUE_DAY30;
  const [started, setStarted] = useState(false); const [handled, setHandled] = useState(false);
  return <section className="rounded-3xl border-2 border-[var(--ib-primary)] bg-white p-5">
    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Self-rescue listening</p>
    <h3 className="mt-2 text-xl font-bold text-[var(--ib-primary-strong)]">Saat kamu belum mengerti</h3>
    <div className="mt-4"><ChineseSpeechButton text={data.audioText} label="Dengarkan" /></div>
    {!started ? <button type="button" onClick={() => setStarted(true)} className="mt-4 min-h-11 rounded-full bg-[var(--ib-primary)] px-5 text-sm font-semibold text-white">Saya belum mengerti</button> : <div className="mt-4 grid gap-2 sm:grid-cols-2">{['我不懂','慢一点','再说一次','什么意思？'].map((text) => <button key={text} type="button" onClick={() => setHandled(true)} className="rounded-2xl border border-[var(--ib-border-soft)] bg-[var(--ib-primary-soft)] p-3 text-left"><span className="block text-xl font-bold text-[var(--ib-primary-strong)]">{text}</span><span className="text-xs text-[var(--ib-text-secondary)]">{canonicalTranslation(text)}</span></button>)}</div>}
    {handled ? <div className="mt-4 rounded-2xl bg-[var(--ib-bg-muted)] p-4 text-sm leading-6 text-[var(--ib-text-secondary)]"><p>Kamu belum mempelajari kalimat ini.</p><p>Tujuannya bukan menebak artinya.</p><p>Saat tidak mengerti, kamu bisa mengatakan: 我不懂 / 慢一点 / 再说一次 / 什么意思？</p></div> : null}
  </section>;
}

function ListeningCheck({ items }: { items: MandarinWorkItem[] }) {
  const available = items.slice(0, 3); const target = available[0]; const [answer, setAnswer] = useState('');
  if (!target) return null;
  return <section className="rounded-3xl bg-[var(--ib-primary-soft)] p-5"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Listening check</p><div className="mt-3"><ChineseSpeechButton text={target.audioText} label="Dengarkan" /></div>{available.length > 1 ? <div className="mt-4 grid gap-2">{available.map((item) => <button key={item.id} type="button" onClick={() => setAnswer(item.id)} className="rounded-2xl bg-white p-3 text-left text-sm font-semibold text-[var(--ib-text-primary)]">{item.indonesian}</button>)}</div> : <p className="mt-4 text-sm text-[var(--ib-text-secondary)]">Dengar lagi · Tampilkan arti</p>}{answer ? <p role="status" className="mt-3 text-sm font-bold text-[var(--ib-primary-strong)]">{answer === target.id ? 'Benar.' : 'Coba dengarkan lagi.'}</p> : null}</section>;
}

function Milestone({ day }: { day: 7 | 14 | 30 }) {
  const title = `${day} Hari Selesai`; const lines = completionCopy[day];
  return <section className="rounded-3xl bg-[var(--ib-primary-strong)] p-5 text-white"><h3 className="text-2xl font-bold">{title}</h3>{day === 30 ? <><p className="mt-3 text-sm leading-6">Dari nol, sekarang kamu sudah memiliki kemampuan dasar Mandarin untuk bekerja.</p><p className="mt-4 text-sm leading-6">Sekarang kamu belum bisa semua Mandarin.<br/>Tapi kamu sudah bisa mulai menggunakannya untuk bekerja.</p></> : null}<ul className="mt-4 grid gap-2 text-sm">{lines.map((line) => <li key={line}>✓ {line}</li>)}</ul></section>;
}

export default function MandarinWorkExperience() {
  const [profile, setProfile] = useState(emptyMandarinWorkProfile()); const [selectedDay, setSelectedDay] = useState(1); const [showAllDays, setShowAllDays] = useState(false); const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  useEffect(() => { const sync = () => { const next = readMandarinWorkProfile(); setProfile(next); setSelectedDay((value) => value === 1 ? Math.min(30, next.currentDay) : value); }; sync(); return subscribeMandarinWorkProfile(sync); }, []);
  const day = mandarinWorkDays[Math.min(30, selectedDay) - 1]; const contentItems = useMemo(() => [...day.items, ...day.dialogue.map((turn) => turn.item)], [day]);
  const levelOneCompleted = profile.completedDays.filter((value) => value >= 1 && value <= 30).length;
  const update = (next: ReturnType<typeof readMandarinWorkProfile>) => setProfile(next);
  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))] text-[var(--ib-text-primary)]">
    <div className="mx-auto w-full max-w-5xl"><header className="rounded-[32px] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-8"><p className="text-sm font-bold text-[var(--ib-primary)]">尼会说 · IndoBrain</p><h1 className="mt-3 text-3xl font-bold text-[var(--ib-primary-strong)] sm:text-5xl">30天工作中文</h1><p className="mt-2 text-lg font-semibold text-[var(--ib-text-secondary)]">30 Hari Bisa Mandarin untuk Kerja</p><p className="mt-4 text-sm text-[var(--ib-primary)]">Bisa Mandarin, Peluang Kerja Lebih Besar.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--ib-border-soft)]"><div className="h-full bg-[var(--ib-primary)]" style={{ width: `${Math.round(levelOneCompleted / 30 * 100)}%` }} /></div><p className="mt-2 text-xs text-[var(--ib-text-muted)]">{levelOneCompleted}/30 hari selesai</p></header>
      <section className="mt-4 rounded-3xl bg-white p-4 shadow-[var(--ib-shadow-card)]"><div className="flex items-center justify-between"><h2 className="font-bold text-[var(--ib-primary-strong)]">Pilih hari</h2><button type="button" onClick={() => setShowAllDays((value) => !value)} className="text-sm font-semibold text-[var(--ib-primary)]">{showAllDays ? 'Tutup' : 'Lihat 30 hari'}</button></div>{showAllDays ? <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">{mandarinWorkDays.map((entry) => <button key={entry.day} type="button" onClick={() => { setSelectedDay(entry.day); setShowAllDays(false); setShowFeedbackPrompt(false); }} className={`aspect-square rounded-xl text-sm font-bold ${entry.day === selectedDay ? 'bg-[var(--ib-primary)] text-white' : profile.completedDays.includes(entry.day) ? 'bg-emerald-50 text-emerald-700' : 'bg-[var(--ib-primary-soft)] text-[var(--ib-primary)]'}`}>{entry.day}</button>)}</div> : null}</section>
      <section className="mt-4"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Hari {day.day} · {day.scenario}</p><h2 className="mt-1 text-3xl font-bold text-[var(--ib-primary-strong)]">{day.title}</h2></section>
      {day.items.length ? <section className="mt-4 grid gap-4 md:grid-cols-2">{day.items.map((item) => <ItemCard key={item.id} item={item} favorited={profile.favorites.includes(item.favoriteId)} completed={profile.completedItems.includes(item.id)} onFavorite={() => update(toggleMandarinFavorite(item.favoriteId))} onComplete={() => update(completeMandarinItem(item.id))} />)}</section> : null}
      {day.dialogue.length ? <section className="mt-5 rounded-3xl bg-white p-5 shadow-[var(--ib-shadow-card)]"><h3 className="text-xl font-bold text-[var(--ib-primary-strong)]">Dialog kerja</h3><div className="mt-4 grid gap-3">{day.dialogue.map((turn) => <div key={turn.id} className={`max-w-[92%] rounded-2xl border p-3 ${turn.role === '员工' ? 'ml-auto border-[var(--ib-border-soft)] bg-white' : 'border-transparent bg-[var(--ib-primary-soft)]'}`}><p className="text-[10px] font-bold text-[var(--ib-text-muted)]">{turn.role}</p><p className="mt-1 text-xl font-bold text-[var(--ib-primary-strong)]">{turn.item.chinese}</p><PinyinLine segments={turn.item.pinyinSegments}/><p className="mt-2 text-[13px] text-[var(--ib-text-secondary)]">{turn.item.indonesian}</p><div className="mt-2"><ChineseSpeechButton text={turn.item.audioText} compact /></div></div>)}</div></section> : null}
      {day.day === 14 || day.day === 30 ? <div className="mt-5"><SelfRescue day={day.day as 14|30}/></div> : <div className="mt-5"><ListeningCheck items={contentItems}/></div>}
      <div className="mt-5"><LocalPronunciationRecorder /></div>
      {day.day === 7 || day.day === 14 || day.day === 30 ? <div className="mt-5"><Milestone day={day.day as 7|14|30}/></div> : null}
      {day.day === 30 ? <section className="mt-5 rounded-3xl border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)]"><p className="text-2xl font-bold text-[var(--ib-primary-strong)]">30 Hari Pertama Selesai 🎉</p><p className="mt-3 text-sm leading-6 text-[var(--ib-text-secondary)]">Kamu sekarang sudah memiliki dasar Mandarin untuk bekerja.</p><p className="mt-4 font-bold text-[var(--ib-primary-strong)]">Tahap berikutnya:</p><ul className="mt-3 grid gap-2 text-sm text-[var(--ib-text-secondary)]"><li>✓ Memahami cara bos Tiongkok berbicara secara alami</li><li>✓ Menangani masalah di tempat kerja</li><li>✓ Memahami instruksi yang lebih panjang</li><li>✓ Mandarin untuk proyek konstruksi</li><li>✓ Simulasi kerja nyata</li></ul><Link href="/learn-chinese/level-2" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-[var(--ib-primary)] px-6 font-bold text-white">Lanjut ke Level 2</Link></section> : null}
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => { update(completeMandarinDay(day.day)); if (day.day === 7 || day.day === 14 || day.day === 30) setShowFeedbackPrompt(true); }} className="min-h-12 flex-1 rounded-full bg-[var(--ib-primary)] px-5 font-bold text-white">Selesaikan Hari {day.day}</button>{day.day < 30 ? <button type="button" onClick={() => { setSelectedDay(day.day + 1); setShowFeedbackPrompt(false); }} className="min-h-12 rounded-full border border-[var(--ib-border-soft)] bg-white px-5 font-bold text-[var(--ib-primary)]">Hari berikutnya</button> : null}</div>
      <MandarinWorkFeedback day={day.day} showCompletionPrompt={showFeedbackPrompt} onDismissCompletionPrompt={() => setShowFeedbackPrompt(false)} />
    </div>
  </main>;
}
