'use client';

import { FormEvent, useState } from 'react';

export default function PreviewBootstrapPage() {
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('+6281280000999');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/internal/preview-test-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-preview-bootstrap-token': token },
      body: JSON.stringify({ phone, password }),
    });
    const body = await response.json() as { phone?: string; learningDirection?: string; error?: string };
    setMessage(response.ok ? `Ready: ${body.phone} (${body.learningDirection})` : (body.error ?? 'Unable to initialize account.'));
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-semibold">Preview account setup</h1>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <input aria-label="Bootstrap token" type="password" value={token} onChange={(event) => setToken(event.target.value)} />
        <input aria-label="Test phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <input aria-label="Test password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button type="submit">Initialize Preview test account</button>
      </form>
      {message ? <p className="mt-4" role="status">{message}</p> : null}
    </main>
  );
}
