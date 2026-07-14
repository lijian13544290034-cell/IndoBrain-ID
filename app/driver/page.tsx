import Link from 'next/link';
import ComingSoonCard from '@/components/ComingSoonCard';
import ExperienceCard from '@/components/ExperienceCard';
import LocalizedLabel from '@/components/LocalizedLabel';
import { getDriverExperiences } from '@/lib/driver-experiences';
import { driverWorkflow, isDriverWorkflow } from '@/lib/driver-workflow';

export default async function DriverPage({ searchParams }: { searchParams: Promise<{ workflow?: string }> }) {
  const { workflow } = await searchParams;
  const selected = isDriverWorkflow(workflow) ? workflow : undefined;
  const all = getDriverExperiences();
  const selectedExperiences = selected ? all.filter((item) => driverWorkflow.find((stage) => stage.slug === selected)?.ids.includes(Number(item.id.slice(-3)) as never)) : all;
  const experiences = selectedExperiences.filter((item) => !item.missing);

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Beranda（返回首页）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Peran（角色）</p>
      <LocalizedLabel indonesian="Sopir" chinese="司机" className="mt-1 font-semibold" />
      <p className="mt-2 text-sm leading-6 text-stone-500">Situasi perjalanan sehari-hari<br />日常司机沟通场景</p>
      <p className="mt-5 text-xs text-stone-400">Alur Perjalanan（行程分类）</p>
      <nav className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Alur perjalanan">
        <Link href="/driver" className={`flex min-h-10 items-center rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${!selected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>Semua（全部）</Link>
        {driverWorkflow.map((stage) => <Link key={stage.slug} href={`/driver?workflow=${stage.slug}`} className={`flex min-h-10 min-w-0 items-center break-words rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${selected === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}
      </nav>
    </header>
    <section className="mt-7" aria-label="Situasi sopir">
      <h1 className="text-lg font-semibold">Situasi Sopir <span className="text-sm font-normal text-stone-500">（司机场景）</span></h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{experiences.map((experience) => <ExperienceCard key={experience.id} href={`/driver/${experience.id.slice(-3)}?workflow=${selected ?? ''}`} experience={experience} />)}<ComingSoonCard className="sm:col-span-2" /></div>
    </section>
  </main>;
}
