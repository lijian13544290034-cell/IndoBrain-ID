import type { Metadata } from 'next';
import NativeFreeChat from '@/components/NativeFreeChat';
import { isAiFreeTeachingEnabled } from '@/lib/account/ai-free-teaching';
import { currentGuestSession } from '@/lib/server/guest-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Mandarin Native Chat | IndoBrain',
  description: 'Eksperimen guru Mandarin AI dengan jawaban bebas dan audio kalimat Mandarin.',
  robots: { index: false, follow: false },
};

export default async function NativeChatPage() {
  const enabled = isAiFreeTeachingEnabled();
  const session = enabled ? await currentGuestSession() : null;
  return <main className="min-h-screen bg-gradient-to-b from-violet-50 via-stone-50 to-white px-4 pb-28 pt-7 text-stone-950">
    <div className="mx-auto w-full max-w-2xl">
      {enabled ? <NativeFreeChat initialReady={Boolean(session)} /> : <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Preview only</p>
        <h1 className="mt-3 text-2xl font-bold">Eksperimen ini belum dibuka</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Hanya tersedia pada deployment Preview yang diaktifkan khusus.</p>
      </section>}
    </div>
  </main>;
}
