import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarkdownExperience from '@/components/MarkdownExperience';
import LocalizedLabel from '@/components/LocalizedLabel';
import ExperienceActions from '@/components/ExperienceActions';
import ExperienceNavLink from '@/components/ExperienceNavLink';
import { getFactoryExperience, getFactoryExperiences } from '@/lib/factory-experiences';

const workflow = [
  { indonesian: 'Produksi', chinese: '生产', ids: [1, 2, 3, 21, 22, 23, 24, 27, 28, 29, 30, 31, 32, 35, 38, 39, 40, 43, 44, 45, 46, 47, 48, 49, 50] },
  { indonesian: 'Kualitas', chinese: '品质', ids: [4, 33, 42] },
  { indonesian: 'Keamanan', chinese: '安全', ids: [34] },
  { indonesian: 'Material', chinese: '原材料', ids: [5, 25, 26, 37] },
  { indonesian: 'Pengiriman', chinese: '交付', ids: [6, 7, 8, 9, 10] },
  { indonesian: 'Ekspor', chinese: '出口', ids: [11, 12, 13, 14] },
  { indonesian: 'Pelanggan', chinese: '客户', ids: [15, 16, 17, 18, 19, 20, 36, 41] },
];

export function generateStaticParams() {
  return getFactoryExperiences().map(({ id }) => ({ id: id.slice(-3) }));
}

export default async function FactoryManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experience = getFactoryExperience(id);
  const experiences = getFactoryExperiences();
  const currentIndex = experiences.findIndex((item) => item.id === experience?.id);

  if (!experience || currentIndex === -1) notFound();

  const previous = experiences[currentIndex - 1];
  const next = experiences[currentIndex + 1];
  const currentNumber = Number(id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
      <Link href="/factory" className="text-sm text-stone-500 hover:text-stone-900">← Factory</Link>

      <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
        <p className="text-xs text-stone-400">Business Role</p>
        <LocalizedLabel indonesian="Manajer Pabrik" chinese="工厂经理" className="mt-1 font-semibold" />
        <p className="mt-2 text-sm text-stone-500">已完成：{experiences.length} Experiences</p>
        <p className="mt-1 text-sm text-stone-500">当前浏览：{experience.id}</p>
        <p className="mt-5 text-xs text-stone-400">Workflow</p>
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {workflow.map((stage, index) => {
            const active = stage.ids.includes(currentNumber);
            return (
              <li key={stage.indonesian} className={`rounded-lg border px-3 py-2 text-xs ${active ? 'border-stone-900 bg-stone-900 font-medium text-white' : 'border-stone-200 bg-white text-stone-500'}`}>
                <span className={`mr-1.5 ${active ? 'text-stone-300' : 'text-stone-400'}`}>{index + 1}.</span>
                <span className="font-medium">{stage.indonesian}</span>
                <span className={`ml-1 ${active ? 'text-stone-300' : 'text-stone-400'}`}>（{stage.chinese}）</span>
              </li>
            );
          })}
        </ol>
      </header>

      <nav className="mt-7 grid gap-2 sm:grid-cols-2" aria-label="Experience navigation">
        {experiences.map((item) => {
          const active = item.id === experience.id;
          return (
            <Link
              key={item.id}
              href={`/factory/manager/${item.id.slice(-3)}`}
              className={`rounded-xl border px-3 py-3 transition ${active ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
            >
              <span className={`block text-[11px] ${active ? 'text-stone-300' : 'text-stone-400'}`}>{item.id}</span>
              <span className="mt-1 block text-sm font-medium">{item.task}</span>
            </Link>
          );
        })}
      </nav>

      <MarkdownExperience content={experience.content} />
      <ExperienceActions experienceId={experience.id} indonesian={experience.content} />

      <div className="mt-6 flex items-center justify-between gap-3">
        {previous ? (
          <ExperienceNavLink href={`/factory/manager/${previous.id.slice(-3)}`} experienceId={experience.id} action="previous_clicked" className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">← Previous</ExperienceNavLink>
        ) : <span />}
        {next ? (
          <ExperienceNavLink href={`/factory/manager/${next.id.slice(-3)}`} experienceId={experience.id} action="next_clicked" className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">Next →</ExperienceNavLink>
        ) : <span />}
      </div>
    </main>
  );
}
