import Link from 'next/link';
import { Suspense } from 'react';
import EssentialsHub from '@/components/EssentialsHub';
import LocalizedLabel from '@/components/LocalizedLabel';
import { driverEssentialCategories, getEssentials } from '@/lib/essentials';

export default function DriverEssentialsPage() {
  const essentials = getEssentials('driver');
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href="/driver" className="text-sm text-stone-500 hover:text-stone-900">← Sopir（司机）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Peran（角色）</p>
      <LocalizedLabel indonesian="Sopir" chinese="司机" className="mt-1 font-semibold" />
      <p className="mt-2 text-sm leading-6 text-stone-500">Ungkapan sopir yang sering dipakai untuk dicari dan digunakan dengan cepat<br />高频司机表达，随时查找、马上使用</p>
      <nav className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="Mode Sopir">
        <Link href="/driver" className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition duration-200 hover:bg-stone-100 hover:shadow-sm">Pengalaman（真实场景）<span className="mt-1 block text-xs font-normal text-stone-400">40 situasi</span></Link>
        <Link href="/driver/essentials" className="min-h-12 rounded-xl border border-stone-900 bg-stone-900 px-4 py-3 text-sm font-medium text-white">Essentials（高频必备）<span className="mt-1 block text-xs font-normal text-stone-300">60 ungkapan</span></Link>
      </nav>
    </header>
    <section className="mt-7" aria-label="Essentials Sopir">
      <h1 className="text-lg font-semibold">Essentials Sopir <span className="text-sm font-normal text-stone-500">（司机高频必备）</span></h1>
      <p className="mt-2 text-sm leading-6 text-stone-500">Cari dan gunakan ungkapan singkat untuk perjalanan sehari-hari.<br />查找并直接使用日常出行短句。</p>
      <div className="mt-5"><Suspense fallback={<p className="text-sm text-stone-500">Memuat Essentials（正在加载高频表达）</p>}><EssentialsHub items={essentials} categories={driverEssentialCategories} /></Suspense></div>
    </section>
  </main>;
}
