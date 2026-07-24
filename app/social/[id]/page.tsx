import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExperienceDetail from '@/components/ExperienceDetail';
import NavigationButtons from '@/components/NavigationButtons';
import { getSocialExperiences } from '@/lib/social-experiences';
import { getSocialWorkflow, isSocialWorkflow, socialWorkflow } from '@/lib/social-workflow';

export default async function SocialDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ category?: string }> }) {
  const { id } = await params;
  const { category } = await searchParams;
  const experiences = getSocialExperiences();
  const item = experiences.find((entry) => entry.id === `EXP-SOC-${id}`);
  if (!item) notFound();

  const index = experiences.indexOf(item);
  const previous = experiences[index - 1];
  const next = experiences[index + 1];
  const currentCategory = getSocialWorkflow(item.id);
  const selected = isSocialWorkflow(category) ? category : currentCategory?.slug;
  const listHref = selected ? `/social?category=${selected}` : '/social';

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href={listHref} className="text-sm text-stone-500 hover:text-stone-900">← Social（社交）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Kategori（分类）</p>
      <nav className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Kategori sosial">{socialWorkflow.map((stage) => <Link key={stage.slug} href={`/social?category=${stage.slug}`} className={`flex min-h-10 min-w-0 items-center break-words rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${currentCategory?.slug === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}</nav>
    </header>
    <ExperienceDetail experience={item} />
    <NavigationButtons experienceId={item.id} previous={previous ? { href: `/social/${previous.id.slice(-3)}?category=${selected ?? ''}`, id: previous.id } : undefined} next={next ? { href: `/social/${next.id.slice(-3)}?category=${selected ?? ''}`, id: next.id } : undefined} />
  </main>;
}
