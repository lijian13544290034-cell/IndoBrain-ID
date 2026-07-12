'use client';

import { useEffect, useState } from 'react';
import { getSessionId } from '@/lib/session';

export default function ExperienceActions({ experienceId, indonesian }: { experienceId: string; indonesian: string }) {
  const [status, setStatus] = useState('');
  const event = async (action: string) => {
    await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: getSessionId(), experience_id: experienceId, action }) });
  };
  useEffect(() => { event('viewed'); }, [experienceId]);
  async function copy() {
    await navigator.clipboard.writeText(indonesian);
    await event('copied');
    setStatus('已复制');
  }
  async function feedback(helpful: boolean) {
    await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: getSessionId(), experience_id: experienceId, helpful }) });
    setStatus(helpful ? '感谢反馈' : '已记录，我们会改进');
  }
  return <div className="mt-7 flex flex-wrap gap-2">
    <button onClick={copy} className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">复制印尼语</button>
    <button onClick={() => feedback(true)} className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">有帮助</button>
    <button onClick={() => feedback(false)} className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">没帮助</button>
    {status && <span className="self-center text-sm text-stone-500">{status}</span>}
  </div>;
}
