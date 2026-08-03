import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExperienceDetail from '@/components/ExperienceDetail';
import NavigationButtons from '@/components/NavigationButtons';
import { filterExperiencesByCategory } from '@/lib/experience-category-counts';
import { getNannyExperiences } from '@/lib/nanny-experiences';
import { getNannyWorkflow, isNannyWorkflow, nannyWorkflow } from '@/lib/nanny-workflow';
import { getExperienceCatalog } from '@/lib/experience-catalog';
import { getSearchNavigation } from '@/lib/experience-navigation';

export default async function NannyDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ workflow?: string; search?: string }> }) {
  const { id } = await params; const { workflow, search } = await searchParams;
  const allExperiences = getNannyExperiences(); const item = allExperiences.find((entry) => entry.id === `EXP-NAN-${id}`);
  if (!item) notFound();
  const selected = isNannyWorkflow(workflow) ? workflow : undefined;
  const experiences = filterExperiencesByCategory(allExperiences, nannyWorkflow, selected);
  const index = experiences.indexOf(item); const searchNavigation = getSearchNavigation(getExperienceCatalog(), item.id, search); const previous = searchNavigation?.previous ?? (experiences[index - 1] ? { id: experiences[index - 1].id, href: `/nanny/${experiences[index - 1].id.slice(-3)}?workflow=${selected ?? ''}` } : undefined); const next = searchNavigation?.next ?? (experiences[index + 1] ? { id: experiences[index + 1].id, href: `/nanny/${experiences[index + 1].id.slice(-3)}?workflow=${selected ?? ''}` } : undefined);
  const current = getNannyWorkflow(item.id);
  const listHref = selected ? `/nanny?workflow=${selected}` : '/nanny';
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14"><Link href={listHref} className="text-sm text-stone-500 hover:text-stone-900">← Asisten Rumah Tangga（保姆）</Link><header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5"><p className="text-xs text-stone-400">Alur Rumah（家庭分类）</p><nav className="mt-3 grid gap-2 sm:grid-cols-3">{nannyWorkflow.map((stage) => <Link key={stage.slug} href={`/nanny?workflow=${stage.slug}`} className={`flex min-h-10 items-center rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${current?.slug === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}</nav></header><ExperienceDetail experience={item} /><NavigationButtons experienceId={item.id} previous={previous} next={next} /></main>;
}
