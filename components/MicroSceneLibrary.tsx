import Link from 'next/link';
import MicroSceneLearningSession from '@/components/MicroSceneLearningSession';
import { getQuickMicroSceneDomains, getQuickMicroScenesForTopic } from '@/lib/micro-scenes';

function BackLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="inline-flex min-h-10 items-center text-sm font-medium text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← {label}</Link>;
}

export default function MicroSceneLibrary({ groupSlug, topicSlug }: { groupSlug?: string; topicSlug?: string }) {
  const domains = getQuickMicroSceneDomains();
  const domain = domains.find((item) => item.slug === groupSlug);
  const topic = domain?.topics.find((item) => item.slug === topicSlug);

  return <main className={`mx-auto min-h-screen w-full px-5 pb-12 sm:px-8 ${topic ? 'max-w-4xl pt-3 sm:pt-5' : 'max-w-5xl pt-8 sm:pt-12'}`}>
    {!topic ? <BackLink href="/" label="返回首页" /> : null}

    {!topic ? <header className="mt-4 rounded-[26px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-[var(--ib-primary)]">马上会说</p>
      <h1 className="mt-2 text-2xl font-bold text-[var(--ib-text-primary)] sm:text-3xl">微场景</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">马上学一句现实中能说的话。选择一个生活场景，然后连续学下去。</p>
    </header> : null}

    {!domain ? <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="六个现实场景">
      {domains.map((item) => <Link key={item.slug} href={`/micro-scenes?group=${item.slug}`} className="flex min-h-36 flex-col rounded-[22px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--ib-primary)]">
        <div className="flex items-start justify-between gap-3"><span className="text-3xl" aria-hidden="true">{item.icon}</span><span className="rounded-full bg-[var(--ib-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ib-primary)]">{item.count} 个</span></div>
        <h2 className="mt-3 text-lg font-bold text-[var(--ib-text-primary)]">{item.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{item.topics.filter((topicItem) => topicItem.count > 0).slice(0, 3).map((topicItem) => topicItem.title).join(' · ') || '内容审核中'}</p>
      </Link>)}
    </section> : null}

    {domain && !topic ? <>
      <div className="mt-4"><BackLink href="/micro-scenes" label="六个现实场景" /></div>
      <section className="mt-2 rounded-[22px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)]">
        <div className="flex items-center gap-3"><span className="text-3xl" aria-hidden="true">{domain.icon}</span><div><h2 className="text-xl font-bold text-[var(--ib-text-primary)]">{domain.title}</h2><p className="mt-1 text-sm text-[var(--ib-text-secondary)]">选择现在最想学会的现实瞬间</p></div></div>
      </section>
      <section className="mt-5 grid gap-3 sm:grid-cols-2" aria-label={`${domain.title}微场景主题`}>
        {domain.topics.map((item) => item.count > 0 ? <Link key={item.slug} href={`/micro-scenes?group=${domain.slug}&topic=${item.slug}`} className="rounded-[20px] border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)] transition hover:border-[var(--ib-primary)] hover:bg-[var(--ib-primary-soft)]/40">
          <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-[var(--ib-text-primary)]">{item.title}</h3><span className="shrink-0 text-xs font-semibold text-[var(--ib-primary)]">{item.count} 个</span></div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{item.subtitle}</p>
        </Link> : null)}
      </section>
    </> : null}

    {domain && topic ? <MicroSceneLearningSession items={getQuickMicroScenesForTopic(domain.slug, topic.slug)} domainTitle={domain.title} topicTitle={topic.title} backHref={`/micro-scenes?group=${domain.slug}`} /> : null}

    {groupSlug && !domain ? <section className="mt-5 rounded-[24px] border border-dashed border-[var(--ib-border-soft)] bg-white p-6 text-sm text-[var(--ib-text-secondary)]">未找到这个现实场景。<Link href="/micro-scenes" className="ml-2 font-semibold text-[var(--ib-primary)]">返回微场景</Link></section> : null}
  </main>;
}
