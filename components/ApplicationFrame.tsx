'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

function NavIcon({ kind }: { kind: 'home' | 'scenes' | 'favorites' | 'account' }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'home') return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-7h6v7" /></svg>;
  if (kind === 'scenes') return <svg {...common}><path d="m4 19 5-5 3 3 7-8" /><path d="M16 9h3v3" /><path d="M4 5h7" /></svg>;
  if (kind === 'favorites') return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}

const items = [
  { href: '/', label: '首页', kind: 'home' as const },
  { href: '/life', label: '场景', kind: 'scenes' as const },
  { href: '/about#favorites', label: '收藏', kind: 'favorites' as const },
  { href: '/about', label: '我的', kind: 'account' as const },
];

export default function ApplicationFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  if (isHome) return <>{children}</>;
  return <div className="min-h-screen pb-24">{children}<nav aria-label="主导航" className="fixed inset-x-0 bottom-0 z-50 border-t border-blue-100 bg-white/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(24,61,132,0.08)] backdrop-blur"><div className="mx-auto grid max-w-md grid-cols-4">{items.map((item) => { const active = item.href === '/' ? false : pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition ${active ? 'text-[#1358e8]' : 'text-slate-500 hover:text-[#1358e8]'}`}><NavIcon kind={item.kind} /><span>{item.label}</span></Link>; })}</div></nav></div>;
}
