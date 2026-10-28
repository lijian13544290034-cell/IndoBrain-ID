import type { Metadata } from 'next';
import NativeCoachV1 from '@/components/NativeCoachV1';
import { isNativeCoachV1Enabled } from '@/lib/account/native-coach-v1';
import { currentGuestSession } from '@/lib/server/guest-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Guru Mandarin AI · Versi Uji Coba | IndoBrain',
  description: 'Guru Mandarin AI dengan percakapan alami dan suara Mandarin.',
  robots: { index: false, follow: false },
};

export default async function NativeCoachV1Page() {
  const enabled = isNativeCoachV1Enabled();
  const session = enabled ? await currentGuestSession() : null;
  return <main lang="id" className="min-h-screen bg-gradient-to-b from-violet-50 via-stone-50 to-white px-4 pb-12 pt-7 text-stone-950">
    <div className="mx-auto w-full max-w-2xl">
      {enabled ? <NativeCoachV1 initialReady={Boolean(session)} /> : <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Versi uji coba</p>
        <h1 className="mt-3 text-2xl font-bold">Guru Mandarin AI belum tersedia</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Versi sebelumnya tetap tersedia. Fitur ini hanya aktif pada tautan uji coba khusus.</p>
      </section>}
    </div>
  </main>;
}
