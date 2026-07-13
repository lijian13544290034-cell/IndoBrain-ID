import Link from 'next/link';
import LocalizedLabel from '@/components/LocalizedLabel';
import { getFactoryExperiences } from '@/lib/factory-experiences';
import { factoryWorkflow, isFactoryWorkflow } from '@/lib/factory-workflow';

export default async function FactoryManagerIndexPage({ searchParams }: { searchParams: Promise<{ workflow?: string }> }) {
  const { workflow } = await searchParams;
  const selected = isFactoryWorkflow(workflow) ? workflow : undefined;
  const allExperiences = getFactoryExperiences();
  const experiences = selected
    ? allExperiences.filter((experience) => (factoryWorkflow.find((stage) => stage.slug === selected)?.ids as readonly number[] | undefined)?.includes(Number(experience.id.slice(-3))))
    : allExperiences;

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href="/factory" className="text-sm text-stone-500 hover:text-stone-900">← Pabrik（工厂）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Peran（角色）</p>
      <LocalizedLabel indonesian="Manajer Pabrik" chinese="工厂经理" className="mt-1 font-semibold" />
      <p className="mt-2 text-sm text-stone-500">50 situasi kerja tersedia<br />已完成 50 个工作场景</p>
      <p className="mt-5 text-xs text-stone-400">Alur Kerja（工作流程）</p>
      <nav className="mt-3 grid gap-2 sm:grid-cols-4" aria-label="Alur kerja">
        <Link href="/factory/manager" className={`flex min-h-10 min-w-0 cursor-pointer items-center break-words rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${!selected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>Semua（全部）</Link>
        {factoryWorkflow.map((stage, index) => <Link key={stage.slug} href={`/factory/manager?workflow=${stage.slug}`} className={`flex min-h-10 min-w-0 cursor-pointer items-center break-words rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${selected === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}><span className="mr-1 text-stone-400">{index + 1}.</span>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}
      </nav>
    </header>
    <section className="mt-7" aria-label="Situasi kerja">
      <h1 className="text-lg font-semibold">Situasi Kerja <span className="text-sm font-normal text-stone-500">（工作场景）</span></h1>
      {experiences.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-stone-300 p-5 text-sm leading-6 text-stone-500">Belum ada situasi dalam kategori ini.<br />此分类暂时没有工作场景。</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{experiences.map((experience) => <Link key={experience.id} href={`/factory/manager/${experience.id.slice(-3)}?workflow=${selected ?? ''}`} className="flex min-h-44 cursor-pointer flex-col rounded-xl border border-stone-200 bg-white px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50 hover:shadow-md"><p className="text-[11px] font-medium text-stone-400">{experience.id}</p><p className="mt-2 font-semibold text-stone-900">{experience.task}</p><p className="mt-2 text-sm leading-6 text-stone-700">{experience.indonesian || 'Belum tersedia.'}</p>{experience.explanation ? <p className="mt-auto pt-2 line-clamp-2 text-xs leading-5 text-stone-500">{experience.explanation}</p> : <p className="mt-auto pt-2 text-xs leading-5 text-stone-500">该内容将在后续版本补充。</p>}</Link>)}</div>}
    </section>
  </main>;
}
