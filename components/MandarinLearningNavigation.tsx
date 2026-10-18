'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const availableItems = [
  { href: '/learn-chinese', label: 'Beranda', icon: '⌂' },
  { href: '/learn-chinese/course', label: 'Kursus', icon: '书' },
  { href: '/learn-chinese/ai-coach', label: 'AI Coach', icon: '✦' },
  { href: '/learn-chinese/favorites', label: 'Favorit', icon: '☆' },
];

const upcomingItems = [
  { label: 'Ulasan', icon: '↻' },
];

export default function MandarinLearningNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Navigasi belajar Mandarin" className="fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--ib-border-soft)] bg-white/95 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(24,61,132,0.08)] backdrop-blur">
    <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
      {availableItems.map((item) => {
        const active = item.href === '/learn-chinese'
          ? pathname === item.href
          : pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-1 sm:text-xs ${active ? 'bg-[var(--ib-primary-soft)] text-[var(--ib-primary)]' : 'text-[var(--ib-nav-inactive)] hover:bg-[var(--ib-primary-soft)] hover:text-[var(--ib-primary)]'}`}><span className="text-lg leading-none" aria-hidden>{item.icon}</span><span className="max-w-full truncate">{item.label}</span></Link>;
      })}
      {upcomingItems.map((item) => <button key={item.label} type="button" disabled aria-disabled="true" title={`${item.label} · segera hadir`} className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-[10px] font-semibold text-[var(--ib-text-muted)] opacity-65 sm:text-xs"><span className="text-lg leading-none" aria-hidden>{item.icon}</span><span className="max-w-full truncate">{item.label}</span><span className="sr-only">Segera hadir</span></button>)}
    </div>
  </nav>;
}
