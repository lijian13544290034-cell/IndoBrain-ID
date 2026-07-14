import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExperienceDetail from '@/components/ExperienceDetail';
import NavigationButtons from '@/components/NavigationButtons';
import { moduleExperiences, moduleMeta, type ModuleRole } from '@/lib/module-experiences';

export default async function ModuleExperiencePage({ params }: { params: Promise<{ role: string; id: string }> }) {
  const { role, id } = await params;
  if (!(role in moduleMeta)) notFound();
  const key = role as ModuleRole;
  const entries = moduleExperiences[key];
  const item = entries.find((entry) => entry.id.endsWith('-' + id));
  if (!item) notFound();
  const index = entries.indexOf(item);
  const previous = entries[index - 1];
  const next = entries[index + 1];

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href={'/module/' + key} className="text-sm text-stone-500 hover:text-stone-900">← {moduleMeta[key].indonesian}（{moduleMeta[key].chinese}）</Link>
    <ExperienceDetail experience={item} />
    <NavigationButtons experienceId={item.id} previous={previous ? { href: '/module/' + key + '/' + previous.id.slice(-3), id: previous.id } : undefined} next={next ? { href: '/module/' + key + '/' + next.id.slice(-3), id: next.id } : undefined} />
  </main>;
}
