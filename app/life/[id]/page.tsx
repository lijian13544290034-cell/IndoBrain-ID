import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import ExperienceDetail from '@/components/ExperienceDetail';
import NavigationButtons from '@/components/NavigationButtons';
import { filterExperiencesByCategory } from '@/lib/experience-category-counts';
import { getLifeExperiences } from '@/lib/life-experiences';
import { legacyBasicsRoute } from '@/lib/life-basics';
import { getLifeWorkflow, isLifeWorkflow, lifeWorkflow } from '@/lib/life-workflow';
import { getExperienceCatalog } from '@/lib/experience-catalog';
import { getSearchNavigation } from '@/lib/experience-navigation';

const goldenBatch6Flow = Array.from({ length: 25 }, (_, index) => 174 + index);

export default async function LifeDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ category?: string; search?: string; flow?: string }> }) {
  const { id } = await params; const { category, search, flow } = await searchParams;
  const legacyTopic = legacyBasicsRoute[id]; if (legacyTopic) redirect(`/life/basics/${legacyTopic}`);
  const allExperiences = getLifeExperiences(); const item = allExperiences.find((entry) => entry.id.endsWith(`-${id}`));
  if (!item) notFound();
  const selected = isLifeWorkflow(category) ? category : undefined;
  const experiences = filterExperiencesByCategory(allExperiences, lifeWorkflow, selected);
  const index = experiences.indexOf(item); const searchNavigation = getSearchNavigation(getExperienceCatalog(), item.id, search);
  const flowExperiences = flow === 'golden-batch-6' ? allExperiences.filter((experience) => goldenBatch6Flow.includes(Number(experience.id.slice(-3)))) : undefined;
  const flowIndex = flowExperiences?.indexOf(item) ?? -1;
  const flowHref = (experience: typeof item | undefined) => {
    if (!experience) return undefined;
    const workflow = getLifeWorkflow(experience.id);
    const separatorCategory = workflow ? `category=${workflow.slug}` : '';
    const query = `${separatorCategory}${separatorCategory ? '&' : ''}flow=golden-batch-6`;
    return { id: experience.id, href: `/life/${experience.id.slice(-3)}?${query}` };
  };
  const flowNavigation = flowExperiences && flowIndex >= 0 ? { previous: flowHref(flowExperiences[flowIndex - 1]), next: flowHref(flowExperiences[flowIndex + 1]) } : undefined;
  const previous = flowNavigation?.previous ?? searchNavigation?.previous ?? (experiences[index - 1] ? { id: experiences[index - 1].id, href: `/life/${experiences[index - 1].id.slice(-3)}?category=${selected ?? ''}` } : undefined); const next = flowNavigation?.next ?? searchNavigation?.next ?? (experiences[index + 1] ? { id: experiences[index + 1].id, href: `/life/${experiences[index + 1].id.slice(-3)}?category=${selected ?? ''}` } : undefined);
  const currentCategory = getLifeWorkflow(item.id); const listHref = selected ? `/life?category=${selected}` : '/life';
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14"><Link href={listHref} className="text-sm text-stone-500 hover:text-stone-900">← Life（生活）</Link><header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5"><p className="text-xs text-stone-400">Kategori（分类）</p><nav className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="Kategori Life">{lifeWorkflow.map((stage) => <Link key={stage.slug} href={`/life?category=${stage.slug}`} className={`flex min-h-10 min-w-0 items-center break-words rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${currentCategory?.slug === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}</nav></header><ExperienceDetail experience={item} /><NavigationButtons experienceId={item.id} previous={previous} next={next} /></main>;
}
