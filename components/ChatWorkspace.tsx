'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { ChatProfile, Message } from '@/lib/mock-data';
import { getSessionId } from '@/lib/session';

export default function ChatWorkspace({ profile }: { profile: ChatProfile }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const text = input.trim(); if (!text || loading) return;
    const user: Message = { id: `user-${Date.now()}`, role: 'user', text };
    const history = [...messages, user]; setMessages(history); setInput(''); setLoading(true); setStatus('');
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: getSessionId(), role_type: profile.roleType, messages: history.map((message) => ({ role: message.role, content: message.text })) }) });
      const data = await response.json();
      if (!response.ok) { setStatus(data.message || data.error || 'AI 尚未配置'); return; }
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: data.assistant_message }]);
    } catch { setStatus('网络连接失败，请稍后重试。'); } finally { setLoading(false); }
  }
  async function copyMessage(message: Message) { await navigator.clipboard.writeText(message.text); setStatus('已复制'); }
  return <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col bg-white">
    <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4 sm:px-7"><div className="flex items-center gap-4"><Link href="/" className="text-stone-500">←</Link><div><h1 className="font-semibold">{profile.title}</h1><p className="text-xs text-stone-500">（{profile.chineseTitle}）</p></div></div><button onClick={() => { setMessages([]); setStatus('已清空当前聊天'); }} className="text-sm text-stone-500">清空聊天</button></header>
    <section className="flex-1 space-y-5 px-5 py-7 sm:px-7">{messages.length === 0 && <p className="text-sm text-stone-400">输入你的真实问题，AI 会用自然印尼语协助。</p>}{messages.map((message) => <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}><div className={message.role === 'user' ? 'max-w-[85%] rounded-2xl bg-stone-900 px-4 py-3 text-sm leading-6 text-white' : 'max-w-[85%] rounded-2xl bg-stone-100 px-4 py-3 text-sm leading-6 text-stone-900'}><p className="whitespace-pre-line">{message.text}</p>{message.role === 'assistant' && <button onClick={() => copyMessage(message)} className="mt-3 text-xs text-stone-500">复制</button>}</div></div>)}{loading && <p className="text-sm text-stone-400">AI 正在回复…</p>}<div ref={bottomRef} /></section>
    <form onSubmit={sendMessage} className="border-t border-stone-200 p-4 sm:px-7"><div className="flex gap-3 rounded-2xl border border-stone-300 p-2"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入消息…" className="min-w-0 flex-1 bg-transparent px-3 py-2 outline-none" /><button disabled={loading} type="submit" className="rounded-xl bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50">发送</button></div>{status && <p className="mt-2 text-sm text-stone-500">{status}</p>}</form>
  </main>;
}
