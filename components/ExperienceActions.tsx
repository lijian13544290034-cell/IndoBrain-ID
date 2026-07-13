'use client';

import { useEffect, useState } from 'react';
import { getSessionId } from '@/lib/session';

export default function ExperienceActions({ experienceId, indonesian, factory = false }: { experienceId: string; indonesian: string; factory?: boolean }) {
  const [status, setStatus] = useState('');
  const event = async (action: string) => {
    await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: getSessionId(), experience_id: experienceId, action }) });
  };
  useEffect(() => { event('viewed'); }, [experienceId]);
  async function copy() {
    await navigator.clipboard.writeText(indonesian);
    await event('copied');
    setStatus(factory ? 'Sudah disalin（已复制）' : '已复制');
  }
  async function feedback(helpful: boolean) {
    await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: getSessionId(), experience_id: experienceId, helpful }) });
    setStatus(factory ? (helpful ? 'Terima kasih atas masukan Anda（感谢反馈）' : 'Masukan sudah dicatat（已记录）') : (helpful ? '感谢反馈' : '已记录，我们会改进'));
  }
  return <div className="mt-7 flex flex-wrap gap-2">
    <button onClick={copy} className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">{factory ? 'Salin Bahasa Indonesia（复制印尼语）' : '复制印尼语'}</button>
    <button onClick={() => feedback(true)} className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">{factory ? 'Membantu（有帮助）' : '有帮助'}</button>
    <button onClick={() => feedback(false)} className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">{factory ? 'Belum Membantu（没帮助）' : '没帮助'}</button>
    {status && <span className="self-center text-sm text-stone-500">{status}</span>}
  </div>;
}
