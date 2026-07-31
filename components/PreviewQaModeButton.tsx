'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PreviewQaModeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function enterPreviewQaMode() {
    setLoading(true);
    setMessage('');
    const response = await fetch('/api/auth/preview-qa', { method: 'POST' });
    setLoading(false);
    if (!response.ok) return setMessage('Preview QA Mode is unavailable.');
    router.replace('/');
    router.refresh();
  }

  return <section className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-center">
    <p className="text-sm font-semibold text-stone-700">🧪 Preview QA Mode</p>
    <p className="mt-1 text-xs text-stone-500">仅用于 Preview 验收，不创建账号或保存数据。</p>
    <button type="button" onClick={enterPreviewQaMode} disabled={loading} className="mt-3 w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50">{loading ? 'Memproses…' : '进入测试'}</button>
    {message ? <p role="alert" className="mt-2 text-xs text-red-700">{message}</p> : null}
  </section>;
}
