import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExperienceDetail from '@/components/ExperienceDetail';
import LocalizedLabel from '@/components/LocalizedLabel';
import MarkdownExperience from '@/components/MarkdownExperience';
import NavigationButtons from '@/components/NavigationButtons';
import { getFactoryExperience, getFactoryExperiences } from '@/lib/factory-experiences';
import { factoryWorkflow, getWorkflowForExperience, isFactoryWorkflow } from '@/lib/factory-workflow';

export function generateStaticParams() {
  return getFactoryExperiences().map(({ id }) => ({ id: id.slice(-3) }));
}

export default async function FactoryManagerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ workflow?: string }> }) {
  const { id } = await params; const { workflow } = await searchParams;
  const experience = getFactoryExperience(id); const experiences = getFactoryExperiences();
  const currentIndex = experiences.findIndex((item) => item.id === experience?.id);
  if (!experience || currentIndex === -1) notFound();
  const previous = experiences[currentIndex - 1]; const next = experiences[currentIndex + 1];
  const currentWorkflow = getWorkflowForExperience(experience.id);
  const selectedWorkflow = isFactoryWorkflow(workflow) ? workflow : currentWorkflow?.slug;
  const managerHref = selectedWorkflow ? `/factory/manager?workflow=${selectedWorkflow}` : '/factory/manager';
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href={managerHref} className="text-sm text-stone-500 hover:text-stone-900">← Manajer Pabrik（工厂经理）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5"><p className="text-xs text-stone-400">Peran（角色）</p><LocalizedLabel indonesian="Manajer Pabrik" chinese="工厂经理" className="mt-1 font-semibold" /><p className="mt-2 text-sm text-stone-500">Situasi saat ini: {experience.id}<br />当前场景：{experience.id}</p><p className="mt-5 text-xs text-stone-400">Alur Kerja（工作流程）</p><nav className="mt-3 grid gap-2 sm:grid-cols-4" aria-label="Alur kerja">{factoryWorkflow.map((stage, index) => <Link key={stage.slug} href={`/factory/manager?workflow=${stage.slug}`} className={`flex min-h-10 min-w-0 cursor-pointer items-center break-words rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${currentWorkflow?.slug === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}><span className="mr-1 text-stone-400">{index + 1}.</span>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}</nav></header>
    <ExperienceDetail experience={experience} />
    <MarkdownExperience content={experience.content} />
    <NavigationButtons experienceId={experience.id} previous={previous ? { href: `/factory/manager/${previous.id.slice(-3)}?workflow=${selectedWorkflow ?? ''}`, id: previous.id } : undefined} next={next ? { href: `/factory/manager/${next.id.slice(-3)}?workflow=${selectedWorkflow ?? ''}`, id: next.id } : undefined} />
  </main>;
}
