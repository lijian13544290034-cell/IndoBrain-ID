import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExperienceDetail from '@/components/ExperienceDetail';
import NavigationButtons from '@/components/NavigationButtons';
import { getNannyExperiences } from '@/lib/nanny-experiences';
import { getNannyWorkflow, nannyWorkflow } from '@/lib/nanny-workflow';

export default async function NannyDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ workflow?: string }> }) {
  const { id } = await params; const { workflow } = await searchParams;
  const experiences = getNannyExperiences(); const item = experiences.find((entry) => entry.id === `EXP-NAN-${id}`);
  if (!item) notFound();
  const index = experiences.indexOf(item); const previous = experiences[index - 1]; const next = experiences[index + 1];
  const current = getNannyWorkflow(item.id); const selected = workflow ?? current?.slug;
  const listHref = selected ? `/nanny?workflow=${selected}` : '/nanny';
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14"><Link href={listHref} className="text-sm text-stone-500 hover:text-stone-900">← Asisten Rumah Tangga（保姆）</Link><header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5"><p className="text-xs text-stone-400">Alur Rumah（家庭分类）</p><nav className="mt-3 grid gap-2 sm:grid-cols-3">{nannyWorkflow.map((stage) => <Link key={stage.slug} href={`/nanny?workflow=${stage.slug}`} className={`flex min-h-10 items-center rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${current?.slug === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}</nav></header><ExperienceDetail experience={item} /><NavigationButtons experienceId={item.id} previous={previous ? { href: `/nanny/${previous.id.slice(-3)}?workflow=${selected ?? ''}`, id: previous.id } : undefined} next={next ? { href: `/nanny/${next.id.slice(-3)}?workflow=${selected ?? ''}`, id: next.id } : undefined} /></main>;
}
