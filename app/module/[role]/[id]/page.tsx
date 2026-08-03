import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExperienceDetail from '@/components/ExperienceDetail';
import NavigationButtons from '@/components/NavigationButtons';
import { moduleExperiences, moduleMeta, type ModuleRole } from '@/lib/module-experiences';
import { getExperienceCatalog } from '@/lib/experience-catalog';
import { getSearchNavigation } from '@/lib/experience-navigation';

export default async function ModuleExperiencePage({ params, searchParams }: { params: Promise<{ role: string; id: string }>; searchParams: Promise<{ search?: string }> }) {
  const { role, id } = await params;
  const { search } = await searchParams;
  if (!(role in moduleMeta)) notFound();
  const key = role as ModuleRole;
  const entries = moduleExperiences[key];
  const item = entries.find((entry) => entry.id.endsWith('-' + id));
  if (!item) notFound();
  const index = entries.indexOf(item);
  const searchNavigation = getSearchNavigation(getExperienceCatalog(), item.id, search);
  const previous = searchNavigation?.previous ?? (entries[index - 1] ? { id: entries[index - 1].id, href: '/module/' + key + '/' + entries[index - 1].id.slice(-3) } : undefined);
  const next = searchNavigation?.next ?? (entries[index + 1] ? { id: entries[index + 1].id, href: '/module/' + key + '/' + entries[index + 1].id.slice(-3) } : undefined);

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href={'/module/' + key} className="text-sm text-stone-500 hover:text-stone-900">← {moduleMeta[key].indonesian}（{moduleMeta[key].chinese}）</Link>
    <ExperienceDetail experience={item} />
    <NavigationButtons experienceId={item.id} previous={previous} next={next} />
  </main>;
}
