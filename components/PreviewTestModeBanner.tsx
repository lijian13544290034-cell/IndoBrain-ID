'use client';

import { useState } from 'react';

export default function PreviewTestModeBanner() {
  const [pending, setPending] = useState(false);

  async function exitTestMode() {
    setPending(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
    } finally {
      window.location.replace('/login');
    }
  }

  return <aside className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span className="font-medium">Preview Test Mode（试用测试模式）</span><button type="button" onClick={() => void exitTestMode()} disabled={pending} className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-amber-100 disabled:opacity-50">退出测试模式</button></aside>;
}
