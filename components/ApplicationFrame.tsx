'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

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
  // Do not create the global navigation until a non-home route is confirmed.
  // This also prevents an initial client-path hydration gap from flashing it on "/".
  const isHome = pathname == null || pathname === '/';
  const [hash, setHash] = useState('');
  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);
  if (isHome) return <>{children}</>;

  return <div className="ib-app-shell min-h-screen pb-24">
    {children}
    <nav aria-label="主导航" className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--ib-border-soft)] bg-white/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(24,61,132,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const active = item.href === '/about#favorites'
            ? pathname === '/about' && hash === '#favorites'
            : pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
          return <Link key={item.href} href={item.href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition focus-visible:outline-none ${active ? 'bg-[var(--ib-primary-soft)] text-[var(--ib-primary)]' : 'text-[var(--ib-nav-inactive)] hover:bg-[var(--ib-primary-soft)] hover:text-[var(--ib-primary)] active:bg-[#dce8ff]'}`}><NavIcon kind={item.kind} /><span>{item.label}</span></Link>;
        })}
      </div>
    </nav>
  </div>;
}
