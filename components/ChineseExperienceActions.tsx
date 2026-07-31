'use client';

import { useEffect, useState } from 'react';
import { completeExperience, readLearningProfile, submitScene, subscribeProfile } from '@/lib/learning-profile';

export default function ChineseExperienceActions({ experienceId }: { experienceId: string }) {
  const [completed, setCompleted] = useState(false); const [open, setOpen] = useState(false); const [sent, setSent] = useState(false);
  useEffect(() => { const sync = () => setCompleted(readLearningProfile().completed.includes(experienceId)); sync(); return subscribeProfile(sync); }, [experienceId]);
  function share(form: FormData) { submitScene({ experienceId, module: 'chinese', happened: String(form.get('happened') ?? ''), wantedToSay: String(form.get('wanted') ?? '') }); setSent(true); }
  return <section className="mt-8 border-t border-stone-200 pt-6"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setOpen(!open)} className="min-h-10 rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition duration-200 hover:bg-stone-50 hover:shadow-sm">场景共创</button><button type="button" onClick={() => { completeExperience(experienceId); setCompleted(true); }} disabled={completed} className={`min-h-10 rounded-xl px-4 py-2 text-sm font-medium ${completed ? 'cursor-default border border-stone-200 bg-stone-100 text-stone-500' : 'cursor-pointer bg-stone-900 text-white hover:bg-stone-700'}`}>{completed ? '已完成学习' : '完成学习'}</button></div>{open && (sent ? <p className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">已提交，等待审核。</p> : <form action={share} className="mt-4 space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4"><label className="block text-sm font-medium">你遇到了什么场景？<textarea required name="happened" className="mt-2 min-h-20 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm" /></label><label className="block text-sm font-medium">你想学会说哪句话？<textarea required name="wanted" className="mt-2 min-h-20 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm" /></label><button className="min-h-10 rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white">提交场景</button></form>)}</section>;
}
