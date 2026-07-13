import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarkdownExperience from '@/components/MarkdownExperience';
import LocalizedLabel from '@/components/LocalizedLabel';
import ExperienceActions from '@/components/ExperienceActions';
import ExperienceNavLink from '@/components/ExperienceNavLink';
import { getFactoryExperience, getFactoryExperiences } from '@/lib/factory-experiences';
import { factoryWorkflow, getWorkflowForExperience, isFactoryWorkflow } from '@/lib/factory-workflow';

export function generateStaticParams() {
  return getFactoryExperiences().map(({ id }) => ({ id: id.slice(-3) }));
}

export default async function FactoryManagerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ workflow?: string }> }) {
  const { id } = await params;
  const { workflow } = await searchParams;
  const experience = getFactoryExperience(id);
  const experiences = getFactoryExperiences();
  const currentIndex = experiences.findIndex((item) => item.id === experience?.id);
  if (!experience || currentIndex === -1) notFound();

  const previous = experiences[currentIndex - 1];
  const next = experiences[currentIndex + 1];
  const currentWorkflow = getWorkflowForExperience(experience.id);
  const selectedWorkflow = isFactoryWorkflow(workflow) ? workflow : currentWorkflow?.slug;
  const managerHref = selectedWorkflow ? `/factory/manager?workflow=${selectedWorkflow}` : '/factory/manager';

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href={managerHref} className="text-sm text-stone-500 hover:text-stone-900">← Manajer Pabrik（工厂经理）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Peran（角色）</p>
      <LocalizedLabel indonesian="Manajer Pabrik" chinese="工厂经理" className="mt-1 font-semibold" />
      <p className="mt-2 text-sm text-stone-500">Situasi saat ini: {experience.id}<br />当前场景：{experience.id}</p>
      <p className="mt-5 text-xs text-stone-400">Alur Kerja（工作流程）</p>
      <nav className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Alur kerja">
        {factoryWorkflow.map((stage, index) => <Link key={stage.slug} href={`/factory/manager?workflow=${stage.slug}`} className={`rounded-lg border px-3 py-2 text-xs ${currentWorkflow?.slug === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'}`}><span className="mr-1 text-stone-400">{index + 1}.</span>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}
      </nav>
    </header>
    <section className="mt-7 rounded-2xl border border-stone-200 bg-white px-6 py-6 shadow-sm">
      <p className="text-sm text-stone-400">{experience.id}</p>
      <h1 className="mt-2 text-2xl font-semibold">{experience.task}</h1>
      <p className="mt-5 text-xs text-stone-400">Bahasa Indonesia（印尼语）</p>
      <p className="mt-2 rounded-xl bg-stone-50 p-4 text-lg leading-8">{experience.indonesian || 'Kalimat bahasa Indonesia belum tersedia.'}</p>
      {experience.explanation && <><p className="mt-5 text-xs text-stone-400">Penjelasan（中文说明）</p><p className="mt-2 text-sm leading-6 text-stone-700">{experience.explanation}</p></>}
      <p className="mt-6 text-xs text-stone-400">Kata Penting Hari Ini（今日重点词汇）</p>
      {experience.harvest.length ? <ul className="mt-2 space-y-1 text-sm text-stone-700">{experience.harvest.map((word) => <li key={word}>• {word}</li>)}</ul> : <p className="mt-2 text-sm text-stone-500">Belum tersedia dalam sumber resmi.<br />正式来源暂未提供。</p>}
      <ExperienceActions experienceId={experience.id} indonesian={experience.indonesian} factory />
    </section>
    <MarkdownExperience content={experience.content} />
    <div className="mt-6 flex items-center justify-between gap-3">
      {previous ? <ExperienceNavLink href={`/factory/manager/${previous.id.slice(-3)}?workflow=${selectedWorkflow ?? ''}`} experienceId={experience.id} action="previous_clicked" className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">← Sebelumnya（上一条）</ExperienceNavLink> : <span />}
      {next ? <ExperienceNavLink href={`/factory/manager/${next.id.slice(-3)}?workflow=${selectedWorkflow ?? ''}`} experienceId={experience.id} action="next_clicked" className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">Berikutnya（下一条） →</ExperienceNavLink> : <span />}
    </div>
  </main>;
}
