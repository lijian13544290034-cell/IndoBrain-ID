'use client';

import { FormEvent, useState } from 'react';

export default function AccountPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/auth/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json() as { error?: string; message?: string };
    setMessage(data.error ?? data.message ?? 'Unable to update password.');
    if (response.ok) { setCurrentPassword(''); setNewPassword(''); }
  }

  return <form onSubmit={submit} className="mt-4 space-y-3">
    <input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Kata sandi saat ini（当前密码）" className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm" />
    <input required type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Kata sandi baru（至少10位，含字母和数字）" className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm" />
    {message && <p className="text-sm text-gray-600">{message}</p>}
    <button className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium hover:bg-stone-50">Ubah kata sandi（修改密码）</button>
  </form>;
}
