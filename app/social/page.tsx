import Link from 'next/link';
import ComingSoonCard from '@/components/ComingSoonCard';
import ExperienceCard from '@/components/ExperienceCard';
import LocalizedLabel from '@/components/LocalizedLabel';
import { getSocialExperiences } from '@/lib/social-experiences';
import { isSocialWorkflow, socialWorkflow } from '@/lib/social-workflow';

export default async function SocialPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const selected = isSocialWorkflow(category) ? category : undefined;
  const all = getSocialExperiences();
  const experiences = selected ? all.filter((item) => item.category === selected) : all;

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Beranda（返回首页）</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Modul（模块）</p>
      <LocalizedLabel indonesian="Social" chinese="社交" className="mt-1 font-semibold" />
      <p className="mt-2 text-sm leading-6 text-stone-500">Bahasa Indonesia untuk berteman dan berkomunikasi sehari-hari<br />认识朋友、日常聊天和自然社交</p>
      <p className="mt-5 text-xs text-stone-400">Kategori（分类）</p>
      <nav className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Kategori sosial">
        <Link href="/social" className={`flex min-h-10 items-center rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${!selected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>Semua（全部）</Link>
        {socialWorkflow.map((stage) => <Link key={stage.slug} href={`/social?category=${stage.slug}`} className={`flex min-h-10 min-w-0 items-center break-words rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 ${selected === stage.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:shadow-sm'}`}>{stage.indonesian}<span className="ml-1 text-stone-400">（{stage.chinese}）</span></Link>)}
      </nav>
    </header>
    <section className="mt-7" aria-label="Situasi sosial">
      <h1 className="text-lg font-semibold">Situasi Sosial <span className="text-sm font-normal text-stone-500">（社交场景）</span></h1>
      {experiences.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{experiences.map((experience) => <ExperienceCard key={experience.id} href={`/social/${experience.id.slice(-3)}?category=${selected ?? ''}`} experience={experience} />)}<ComingSoonCard className="sm:col-span-2" /></div> : <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-500">Belum ada situasi di kategori ini.<br />该分类暂时没有场景。</p>}
    </section>
  </main>;
}
