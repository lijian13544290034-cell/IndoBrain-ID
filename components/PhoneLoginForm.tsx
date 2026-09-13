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

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (visible) return <svg {...common}><path d="m2 2 20 20" /><path d="M6.7 6.7C3.7 8.5 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1.2" /><path d="M10.7 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a13.2 13.2 0 0 1-1.7 2.7" /><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" /></svg>;
  return <svg {...common}><path d="M2.1 12.3a1 1 0 0 1 0-.7A10.8 10.8 0 0 1 22 12a10.8 10.8 0 0 1-19.9.3Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

export default function PhoneLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
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
    router.push(data.user?.mustChangePassword ? '/change-initial-password' : data.user?.isSuperAdmin ? '/admin' : data.user?.learningDirection === 'ID_TO_ZH' ? '/learn-chinese' : '/');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <label className="block text-sm font-medium text-gray-800">Nomor telepon <span className="font-normal text-gray-400">（手机号）</span>
        <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+628123456789" inputMode="tel" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 outline-none transition focus:border-stone-500" />
      </label>
      <label className="block text-sm font-medium text-gray-800">Kata sandi <span className="font-normal text-gray-400">（密码）</span>
        <span className="relative mt-2 block">
          <input required value={password} onChange={(event) => setPassword(event.target.value)} type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" className="w-full rounded-xl border border-stone-300 py-3 pl-3 pr-14 outline-none transition focus:border-stone-500" />
          <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? '隐藏密码' : '显示密码'} aria-pressed={passwordVisible} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-gray-500 transition hover:bg-stone-100 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-stone-500">
            <PasswordVisibilityIcon visible={passwordVisible} />
          </button>
        </span>
      </label>
      {message && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
      <button disabled={submitting} className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Memproses…' : 'Masuk（登录）'}</button>
      <p className="text-center text-xs leading-5 text-gray-400">Gunakan nomor internasional. Akun dibuat oleh administrator.</p>
    </form>
  );
}
