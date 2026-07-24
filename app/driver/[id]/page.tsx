import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExperienceDetail from '@/components/ExperienceDetail';
import NavigationButtons from '@/components/NavigationButtons';
import { getDriverExperiences } from '@/lib/driver-experiences';
import { driverWorkflow, getDriverWorkflow, isDriverWorkflow } from '@/lib/driver-workflow';

export default async function DriverDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ workflow?: string }> }) {
  const { id } = await params; const { workflow } = await searchParams;
  const experiences = getDriverExperiences(); const item = experiences.find((entry) => entry.id === `EXP-DRV-${id}`);
  if (!item) notFound();
  const index = experiences.indexOf(item); const previous = experiences[index - 1]; const next = experiences[index + 1];
  const currentWorkflow = getDriverWorkflow(item.id); const selected = isDriverWorkflow(workflow) ? workflow : currentWorkflow?.slug;
  const listHref = selected ? `/driver?workflow=${selected}` : '/driver';
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href={listHref} className="text-sm text-stone-500 hover:text-stone-900">← Sopir（司机）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5"><p className="text-xs text-stone-400">Alur Perjalanan（行程分类）</p><nav className="mt-3 grid gap-2 sm:grid-cols-3">{driverWorkflow.map((stage) => <Link key={stage.slug} href={`/driver?workflow=${stage.slug}`} className={`flex min-h-10 items-center rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${currentWorkflow?.slug === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}</nav></header>
    <ExperienceDetail experience={item} />
    <NavigationButtons experienceId={item.id} previous={previous ? { href: `/driver/${previous.id.slice(-3)}?workflow=${selected ?? ''}`, id: previous.id } : undefined} next={next ? { href: `/driver/${next.id.slice(-3)}?workflow=${selected ?? ''}`, id: next.id } : undefined} />
  </main>;
}
