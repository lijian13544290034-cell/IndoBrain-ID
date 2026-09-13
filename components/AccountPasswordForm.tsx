'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (visible) return <svg {...common}><path d="m2 2 20 20" /><path d="M6.7 6.7C3.7 8.5 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1.2" /><path d="M10.7 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a13.2 13.2 0 0 1-1.7 2.7" /><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" /></svg>;
  return <svg {...common}><path d="M2.1 12.3a1 1 0 0 1 0-.7A10.8 10.8 0 0 1 22 12a10.8 10.8 0 0 1-19.9.3Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

type Feedback = { kind: 'success' | 'error'; text: string; sessionExpired?: boolean } | null;

export default function AccountPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json() as { error?: string; message?: string };
      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setCurrentPasswordVisible(false);
        setNewPasswordVisible(false);
        setFeedback({ kind: 'success', text: '密码修改成功 / Password changed successfully' });
        return;
      }
      if (response.status === 401 && data.error === 'Current password is incorrect.') {
        setFeedback({ kind: 'error', text: '当前密码错误' });
      } else if (response.status === 401) {
        setFeedback({ kind: 'error', text: '登录状态失效，请重新登录', sessionExpired: true });
      } else if (response.status === 400) {
        setFeedback({ kind: 'error', text: '新密码不符合要求：至少 10 位，并包含字母和数字' });
      } else {
        setFeedback({ kind: 'error', text: '修改失败，请重试' });
      }
    } catch {
      setFeedback({ kind: 'error', text: '修改失败，请重试' });
    } finally {
      setSubmitting(false);
    }
  }

  return <form onSubmit={submit} className="mt-4 space-y-3">
    <label className="block text-sm font-medium">Kata sandi saat ini（当前密码）<span className="relative mt-2 block"><input required type={currentPasswordVisible ? 'text' : 'password'} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-xl border border-stone-300 py-2.5 pl-3 pr-14 text-sm" /><button type="button" onPointerDown={(event) => event.preventDefault()} onClick={() => setCurrentPasswordVisible((visible) => !visible)} aria-label={currentPasswordVisible ? '隐藏密码' : '显示密码'} aria-pressed={currentPasswordVisible} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-gray-500 hover:bg-stone-100"><PasswordVisibilityIcon visible={currentPasswordVisible} /></button></span></label>
    <label className="block text-sm font-medium">Kata sandi baru（新密码）<span className="relative mt-2 block"><input required minLength={10} type={newPasswordVisible ? 'text' : 'password'} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-xl border border-stone-300 py-2.5 pl-3 pr-14 text-sm" /><button type="button" onPointerDown={(event) => event.preventDefault()} onClick={() => setNewPasswordVisible((visible) => !visible)} aria-label={newPasswordVisible ? '隐藏密码' : '显示密码'} aria-pressed={newPasswordVisible} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-gray-500 hover:bg-stone-100"><PasswordVisibilityIcon visible={newPasswordVisible} /></button></span></label>
    <p className="text-xs text-gray-500">密码至少 10 位，并包含字母和数字。</p>
    {feedback && <div role={feedback.kind === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-3 py-2.5 text-sm ${feedback.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}><p>{feedback.text}</p>{feedback.sessionExpired && <Link href="/login?next=/account" className="mt-1 inline-block font-medium underline underline-offset-2">前往登录 / Sign in</Link>}</div>}
    <button disabled={submitting} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{submitting ? '正在修改…' : 'Ubah kata sandi（修改密码）'}</button>
  </form>;
}
