'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setLearningProfileScope } from '@/lib/learning-profile';

function browserDeviceId() {
  const key = 'indobrain_account_device_id';
  let value = window.localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    window.localStorage.setItem(key, value);
  }
  return value;
}

export default function PhoneLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, deviceId: browserDeviceId() }),
    });
    const data = await response.json() as { error?: string; user?: { publicId?: string; learningDirection?: string; isSuperAdmin?: boolean; mustChangePassword?: boolean } };
    setSubmitting(false);
    if (!response.ok) return setMessage(data.error ?? 'Unable to sign in.');
    if (!data.user?.isSuperAdmin && data.user?.learningDirection !== 'ZH_TO_ID' && data.user?.learningDirection !== 'ID_TO_ZH') {
      return setMessage('Learning direction is not configured. Please contact an administrator.');
    }
    if (data.user?.publicId && data.user.learningDirection) setLearningProfileScope(`${data.user.publicId}:${data.user.learningDirection}`);
    router.push(data.user?.mustChangePassword ? '/change-initial-password' : data.user?.isSuperAdmin ? '/admin' : data.user?.learningDirection === 'ID_TO_ZH' ? '/chinese' : '/');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <label className="block text-sm font-medium text-gray-800">Nomor telepon <span className="font-normal text-gray-400">（手机号）</span>
        <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+628123456789" inputMode="tel" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 outline-none transition focus:border-stone-500" />
      </label>
      <label className="block text-sm font-medium text-gray-800">Kata sandi <span className="font-normal text-gray-400">（密码）</span>
        <input required value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 outline-none transition focus:border-stone-500" />
      </label>
      {message && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
      <button disabled={submitting} className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Memproses…' : 'Masuk（登录）'}</button>
      <p className="text-center text-xs leading-5 text-gray-400">Gunakan nomor internasional. Akun dibuat oleh administrator.</p>
    </form>
  );
}
