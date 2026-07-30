'use client';

import { useState } from 'react';

export default function AccountLogoutActions() {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
    } finally {
      // Keep the device identifier: it is the stable key used for the single-device rule.
      // Account identity is held only by the revoked HTTP-only session cookie.
      window.localStorage.removeItem('indobrain_session_id');
      window.sessionStorage.removeItem('indobrain_session_id');
      // A document navigation discards any cached client-side account state before login.
      window.location.replace('/login');
    }
  }

  return <div className="flex flex-wrap gap-2">
    <button onClick={() => void signOut()} disabled={pending} className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-stone-50 disabled:opacity-50">{pending ? 'Memproses…' : 'Keluar（退出登录）'}</button>
    <button onClick={() => void signOut()} disabled={pending} className="rounded-xl bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50">Ganti Akun（切换账号）</button>
  </div>;
}
