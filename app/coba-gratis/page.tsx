import type { Metadata } from 'next';
import GuestModeEntry from '@/components/GuestModeEntry';
import { guestLimits, isGuestModeEnabled } from '@/lib/account/guest-mode';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Coba Gratis AI Coach Mandarin | IndoBrain',
  description: 'Coba AI Coach Mandarin untuk kerja tanpa daftar, tanpa nomor HP, tanpa kata sandi.',
  robots: { index: false, follow: false },
};

export default function GuestPage() {
  const enabled = isGuestModeEnabled();
  const limits = guestLimits();
  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-8 text-[var(--ib-text-primary)]">
    <div className="mx-auto w-full max-w-md">
      {enabled ? <GuestModeEntry conversationPerSession={limits.conversationPerSession} sessionHours={Math.round(limits.ttlSeconds / 3600)} /> : <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Mode Tamu belum dibuka</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Uji coba gratis sedang tidak tersedia. Silakan hubungi tim IndoBrain.</p>
      </section>}
    </div>
  </main>;
}
