import Link from 'next/link';
import ComingSoonCard from '@/components/ComingSoonCard';
import ExperienceCard from '@/components/ExperienceCard';
import LocalizedLabel from '@/components/LocalizedLabel';
import { getNannyExperiences } from '@/lib/nanny-experiences';
import { isNannyWorkflow, nannyWorkflow } from '@/lib/nanny-workflow';

export default async function NannyPage({ searchParams }: { searchParams: Promise<{ workflow?: string }> }) {
  const { workflow } = await searchParams;
  const selected = isNannyWorkflow(workflow) ? workflow : undefined;
  const all = getNannyExperiences();
  const experiences = selected ? all.filter((item) => nannyWorkflow.find((stage) => stage.slug === selected)?.ids.includes(Number(item.id.slice(-3)) as never)) : all;
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Beranda（返回首页）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Peran（角色）</p>
      <LocalizedLabel indonesian="Asisten Rumah Tangga" chinese="保姆" className="mt-1 font-semibold" />
      <p className="mt-2 text-sm leading-6 text-stone-500">Situasi komunikasi rumah sehari-hari<br />日常家庭沟通场景</p>
      <nav className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="Mode Asisten Rumah Tangga">
        <Link href="/nanny" className="min-h-12 rounded-xl border border-stone-900 bg-stone-900 px-4 py-3 text-sm font-medium text-white">Pengalaman（真实场景）<span className="mt-1 block text-xs font-normal text-stone-300">{all.length} situasi</span></Link>
        <Link href="/nanny/essentials" className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition duration-200 hover:bg-stone-100 hover:shadow-sm">Essentials（高频必备）<span className="mt-1 block text-xs font-normal text-stone-400">60 ungkapan</span></Link>
      </nav>
      <p className="mt-5 text-xs text-stone-400">Alur Rumah（家庭分类）</p>
      <nav className="mt-3 grid gap-2 sm:grid-cols-3">
        <Link href="/nanny" className={`flex min-h-10 items-center rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${!selected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>Semua（全部）</Link>
        {nannyWorkflow.map((stage) => <Link key={stage.slug} href={`/nanny?workflow=${stage.slug}`} className={`flex min-h-10 min-w-0 items-center break-words rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${selected === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}
      </nav>
    </header>
    <section className="mt-7"><h1 className="text-lg font-semibold">Situasi Rumah <span className="text-sm font-normal text-stone-500">（家庭场景）</span></h1><div className="mt-4 grid gap-3 sm:grid-cols-2">{experiences.map((item) => <ExperienceCard key={item.id} href={`/nanny/${item.id.slice(-3)}?workflow=${selected ?? ''}`} experience={item} />)}<ComingSoonCard className="sm:col-span-2" /></div></section>
  </main>;
}
