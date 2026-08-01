import Link from 'next/link';
import ComingSoonCard from '@/components/ComingSoonCard';
import ExperienceCard from '@/components/ExperienceCard';
import LocalizedLabel from '@/components/LocalizedLabel';
import { filterExperiencesByCategory, getExperienceCategoryCounts } from '@/lib/experience-category-counts';
import { lifeContentUpdates } from '@/lib/life-content-updates';
import { getLifeExperiences } from '@/lib/life-experiences';
import { isLifeWorkflow, lifeWorkflow } from '@/lib/life-workflow';

export default async function LifePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const selected = isLifeWorkflow(category) ? category : undefined;
  const all = getLifeExperiences();
  const categoryCounts = getExperienceCategoryCounts(all, lifeWorkflow);
  const experiences = filterExperiencesByCategory(all, lifeWorkflow, selected);
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Beranda（返回首页）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Modul（模块）</p><LocalizedLabel indonesian="Life" chinese="生活" className="mt-1 font-semibold" />
      <p className="mt-2 text-sm leading-6 text-stone-500">Bahasa Indonesia untuk kehidupan sehari-hari<br />印尼日常生活，随时能用的自然表达</p>
      <nav className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="Mode Life"><Link href="/life" className="min-h-12 rounded-xl border border-stone-900 bg-stone-900 px-4 py-3 text-sm font-medium text-white">Pengalaman（真实场景）<span className="mt-1 block text-xs font-normal text-stone-300">{all.length} situasi</span></Link><Link href="/life/basics" className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition duration-200 hover:bg-stone-100 hover:shadow-sm">Dasar（基础速查）<span className="mt-1 block text-xs font-normal text-stone-400">Angka · Waktu · Uang · Arah</span></Link></nav>
      <p className="mt-5 text-xs text-stone-400">Kategori（分类）</p>
      <nav className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="Kategori Life"><Link href="/life" className={`flex min-h-10 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${!selected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}><span>Semua（全部）</span><span className={`shrink-0 ${!selected ? 'text-stone-200' : 'text-stone-400'}`}>{categoryCounts.all}</span></Link>{lifeWorkflow.map((stage) => <Link key={stage.slug} href={`/life?category=${stage.slug}`} className={`flex min-h-10 min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${selected === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}><span className="min-w-0 break-words">{stage.indonesian}<span className={`ml-1 ${selected === stage.slug ? 'text-stone-300' : 'text-stone-400'}`}>（{stage.chinese}）</span></span><span className={`shrink-0 ${selected === stage.slug ? 'text-stone-200' : 'text-stone-400'}`}>{categoryCounts.byCategory[stage.slug]}</span></Link>)}</nav>
    </header>
    <section className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4" aria-label="Pembaruan terbaru">
      <p className="text-sm font-medium">Pembaruan Terbaru <span className="text-xs font-normal text-stone-500">（最近更新）</span></p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{lifeContentUpdates.map((update) => <Link key={update.id} href={`/life?category=${update.category}`} className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 py-3 text-sm text-stone-700 transition duration-200 hover:bg-stone-100 hover:shadow-sm"><span>{update.title}<span className="ml-1 text-xs text-stone-500">（{update.chinese}）</span></span><span className="shrink-0 text-xs text-stone-500">+{update.addedCount}</span></Link>)}</div>
    </section>
    <section className="mt-7" aria-label="Situasi Life"><h1 className="text-lg font-semibold">Situasi Kehidupan <span className="text-sm font-normal text-stone-500">（生活场景）</span></h1>{experiences.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{experiences.map((experience) => <ExperienceCard key={experience.id} href={`/life/${experience.id.slice(-3)}?category=${selected ?? ''}`} experience={experience} />)}<ComingSoonCard className="sm:col-span-2" /></div> : <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-500">Belum ada situasi di kategori ini.<br />该分类暂时没有场景。</p>}</section>
  </main>;
}
