import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSceneMapEntries, getSceneMapGroup, getSceneMapGroupCount, getSceneMapTopic, getSceneMapTopicCounts, resolveLegacyLifeCategory, sceneMapV2, type SceneMapEntry, type SceneMapEntryKind } from '@/lib/scene-map-v2';

const typeLabel: Record<SceneMapEntryKind, string> = {
  golden: '⭐ 黄金场景',
  quick: '⚡ 快速解决',
};

function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-sm font-medium text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← {children}</Link>;
}

function CountPill({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-[var(--ib-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ib-primary)]">{children}</span>;
}

function SceneList({ title, entries, empty }: { title: string; entries: SceneMapEntry[]; empty: string }) {
  return <section className="rounded-[24px] border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)]">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-[var(--ib-text-primary)]">{title}</h2>
      <CountPill>{entries.length}</CountPill>
    </div>
    {entries.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => <Link key={entry.id} href={entry.href} className="rounded-2xl border border-[var(--ib-border-soft)] bg-[var(--ib-bg-soft)] px-4 py-3 transition hover:border-[var(--ib-primary)] hover:bg-white">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold text-[var(--ib-primary)]">{entry.id}</p>
          <span className="text-[11px] text-[var(--ib-text-muted)]">{entry.module}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-[var(--ib-text-primary)]">{entry.title}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--ib-text-secondary)]">{entry.indonesian}</p>
      </Link>)}
    </div> : <p className="mt-4 rounded-2xl border border-dashed border-[var(--ib-border-soft)] px-4 py-5 text-sm text-[var(--ib-text-secondary)]">{empty}</p>}
  </section>;
}

export default function SceneMapV2Entry({ groupSlug, topicSlug, type, legacyCategory }: { groupSlug?: string; topicSlug?: string; type?: string; legacyCategory?: string }) {
  const legacyTarget = resolveLegacyLifeCategory(legacyCategory);
  const resolvedGroupSlug = groupSlug ?? legacyTarget?.group;
  const resolvedTopicSlug = topicSlug ?? legacyTarget?.topic;
  const group = getSceneMapGroup(resolvedGroupSlug);
  const topic = getSceneMapTopic(resolvedGroupSlug, resolvedTopicSlug);
  const selectedType = type === 'golden' || type === 'quick' ? type : undefined;

  return <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pt-12">
    <BackLink href="/">Beranda（返回首页）</BackLink>
    <header className="mt-6 rounded-[28px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ib-primary)]">Scene Map V2</p>
      <h1 className="mt-2 text-2xl font-bold text-[var(--ib-text-primary)]">场景速查</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ib-text-secondary)]">按真实生活任务进入：先选大场景，再选具体问题，最后选择黄金场景或快速解决。</p>
    </header>

    {!group ? <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Scene Map V2 level 2">
      {sceneMapV2.map((item) => <Link key={item.slug} href={`/life?group=${item.slug}`} className="flex min-h-36 flex-col rounded-[24px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--ib-primary)]">
        <div className="flex items-start justify-between gap-3">
          <span className="text-3xl" aria-hidden="true">{item.icon}</span>
          <CountPill>{getSceneMapGroupCount(item)} 条</CountPill>
        </div>
        <h2 className="mt-4 text-lg font-bold text-[var(--ib-text-primary)]">{item.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{item.subtitle}</p>
      </Link>)}
    </section> : null}

    {group && !topic ? <>
      <div className="mt-5"><BackLink href="/life">场景速查</BackLink></div>
      <section className="mt-4 rounded-[28px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)]">
        <div className="flex items-center gap-3"><span className="text-3xl" aria-hidden="true">{group.icon}</span><div><h2 className="text-xl font-bold text-[var(--ib-text-primary)]">{group.title}</h2><p className="mt-1 text-sm text-[var(--ib-text-secondary)]">{group.subtitle}</p></div></div>
      </section>
      <section className="mt-5 grid gap-3 sm:grid-cols-2" aria-label={`${group.title} level 3`}>
        {group.topics.map((item) => {
          const counts = getSceneMapTopicCounts(item);
          return <Link key={item.slug} href={`/life?group=${group.slug}&topic=${item.slug}`} className="rounded-[22px] border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)] transition hover:border-[var(--ib-primary)] hover:bg-[var(--ib-primary-soft)]/40">
            <div className="flex items-start justify-between gap-3"><h3 className="font-bold text-[var(--ib-text-primary)]">{item.title}</h3><CountPill>{counts.all}</CountPill></div>
            <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{item.subtitle}</p>
            <p className="mt-3 text-xs text-[var(--ib-text-muted)]">⭐ {counts.golden} · ⚡ {counts.quick}</p>
          </Link>;
        })}
      </section>
    </> : null}

    {group && topic ? <TopicView groupSlug={group.slug} groupTitle={group.title} topicSlug={topic.slug} topicTitle={topic.title} topicSubtitle={topic.subtitle} selectedType={selectedType} /> : null}
  </main>;
}

function TopicView({ groupSlug, groupTitle, topicSlug, topicTitle, topicSubtitle, selectedType }: { groupSlug: string; groupTitle: string; topicSlug: string; topicTitle: string; topicSubtitle: string; selectedType?: SceneMapEntryKind }) {
  const topic = getSceneMapTopic(groupSlug, topicSlug);
  const entries = topic ? getSceneMapEntries(topic) : [];
  const golden = entries.filter((item) => item.kind === 'golden');
  const quick = entries.filter((item) => item.kind === 'quick');
  const visibleGolden = !selectedType || selectedType === 'golden';
  const visibleQuick = !selectedType || selectedType === 'quick';

  return <>
    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm"><BackLink href={`/life?group=${groupSlug}`}>{groupTitle}</BackLink><span className="text-[var(--ib-text-muted)]">/</span><span className="font-semibold text-[var(--ib-text-primary)]">{topicTitle}</span></div>
    <section className="mt-4 rounded-[28px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)]">
      <h2 className="text-xl font-bold text-[var(--ib-text-primary)]">{topicTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{topicSubtitle}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(['golden', 'quick'] as SceneMapEntryKind[]).map((kind) => <Link key={kind} href={`/life?group=${groupSlug}&topic=${topicSlug}&type=${kind}`} className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${selectedType === kind ? 'border-[var(--ib-primary)] bg-[var(--ib-primary)] text-white' : 'border-[var(--ib-border-soft)] bg-[var(--ib-bg-soft)] text-[var(--ib-text-primary)] hover:border-[var(--ib-primary)]'}`}>{typeLabel[kind]} <span className="ml-2 opacity-75">{kind === 'golden' ? golden.length : quick.length}</span></Link>)}
      </div>
    </section>
    <div className="mt-5 grid gap-5">
      {visibleGolden ? <SceneList title="⭐ 黄金场景" entries={golden} empty="这个分类暂时没有黄金场景。" /> : null}
      {visibleQuick ? <SceneList title="⚡ 快速解决" entries={quick} empty="这个分类暂时没有快速解决内容。" /> : null}
    </div>
  </>;
}

