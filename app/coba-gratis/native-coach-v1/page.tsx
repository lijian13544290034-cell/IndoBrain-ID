import type { Metadata } from 'next';
import NativeCoachV1 from '@/components/NativeCoachV1';
import { isNativeCoachV1Enabled } from '@/lib/account/native-coach-v1';
import { currentGuestSession } from '@/lib/server/guest-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Native Mandarin Coach V1 | IndoBrain',
  description: 'Preview guru Mandarin AI dengan percakapan alami dan audio Mandarin tervalidasi.',
  robots: { index: false, follow: false },
};

export default async function NativeCoachV1Page() {
  const enabled = isNativeCoachV1Enabled();
  const session = enabled ? await currentGuestSession() : null;
  return <main className="min-h-screen bg-gradient-to-b from-violet-50 via-stone-50 to-white px-4 pb-28 pt-7 text-stone-950">
    <div className="mx-auto w-full max-w-2xl">
      {enabled ? <NativeCoachV1 initialReady={Boolean(session)} /> : <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Preview only</p>
        <h1 className="mt-3 text-2xl font-bold">Native Coach V1 belum dibuka</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Legacy tetap aktif. Mode ini hanya tersedia pada Preview yang mengaktifkan flag khusus.</p>
      </section>}
    </div>
  </main>;
}
