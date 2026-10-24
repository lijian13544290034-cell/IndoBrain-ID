import type { Metadata } from 'next';
import FreeTeachingExperience from '@/components/FreeTeachingExperience';
import { isAiFreeTeachingEnabled } from '@/lib/account/ai-free-teaching';
import { currentGuestSession } from '@/lib/server/guest-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Free Teaching Preview | IndoBrain',
  description: 'Eksperimen guru Mandarin AI bebas untuk pengguna tamu IndoBrain.',
  robots: { index: false, follow: false },
};

export default async function AiFreeTeachingPage() {
  const enabled = isAiFreeTeachingEnabled();
  const session = enabled ? await currentGuestSession() : null;
  return <main className="min-h-screen bg-gradient-to-b from-violet-50 via-stone-50 to-white px-4 py-7 text-stone-950">
    <div className="mx-auto w-full max-w-2xl">
      {enabled ? <FreeTeachingExperience initialReady={Boolean(session)} /> : <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Preview only</p>
        <h1 className="mt-3 text-2xl font-bold">AI Free Teaching belum dibuka</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Eksperimen ini hanya tersedia pada deployment Preview yang diaktifkan khusus.</p>
      </section>}
    </div>
  </main>;
}

