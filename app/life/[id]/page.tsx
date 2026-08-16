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
import { getSceneMapEntryLocation } from '@/lib/scene-map-v2';

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
  const sceneMapLocation = getSceneMapEntryLocation(item.id);
  const listHref = sceneMapLocation?.href ?? '/life';
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14"><Link href={listHref} className="text-sm text-stone-500 hover:text-stone-900">← 场景速查</Link>{sceneMapLocation ? <header className="mt-7 rounded-2xl border border-[var(--ib-border-soft)] bg-white px-5 py-4 shadow-[var(--ib-shadow-card)]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ib-primary)]">Scene Map V2</p><div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--ib-text-secondary)]"><Link href="/life" className="font-medium hover:text-[var(--ib-primary)]">场景速查</Link><span>/</span><Link href={`/life?group=${sceneMapLocation.group.slug}`} className="font-medium hover:text-[var(--ib-primary)]">{sceneMapLocation.group.title}</Link><span>/</span><Link href={sceneMapLocation.href} className="font-semibold text-[var(--ib-text-primary)] hover:text-[var(--ib-primary)]">{sceneMapLocation.topic.title}</Link></div></header> : null}<ExperienceDetail experience={item} /><NavigationButtons experienceId={item.id} previous={previous} next={next} /></main>;
}
