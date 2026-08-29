import Link from 'next/link';
import MicroSceneLearningSession from '@/components/MicroSceneLearningSession';
import {
  getFactoryMicroRoles,
  getHistoricalMicroGroups,
  getHistoricalMicroItems,
  getHistoricalMicroModule,
  getHistoricalMicroModules,
  getNextHistoricalMicroGroup,
  type HistoricalMicroGroup,
} from '@/lib/historical-micro-navigation';

function BackLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="inline-flex min-h-10 items-center text-sm font-medium text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← {label}</Link>;
}

function Header({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="mt-4 rounded-[26px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] sm:p-6">
    <p className="text-xs font-semibold tracking-[0.16em] text-[var(--ib-primary)]">{eyebrow}</p>
    <h1 className="mt-2 text-2xl font-bold text-[var(--ib-text-primary)] sm:text-3xl">{title}</h1>
    <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{description}</p>
  </header>;
}

function GroupCards({ groups, hrefFor }: { groups: HistoricalMicroGroup[]; hrefFor: (group: HistoricalMicroGroup) => string }) {
  return <section className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="历史场景分类">
    {groups.map((group) => {
      const content = <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h2 className="font-bold text-[var(--ib-text-primary)]">{group.title}</h2><p className="mt-1 text-xs font-medium text-[var(--ib-primary)]">{group.indonesian}</p></div>
        <span className="shrink-0 rounded-full bg-[var(--ib-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ib-primary)]">{group.count ? `${group.count} 个` : '待补充'}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--ib-text-secondary)]">{group.subtitle}</p>
      </>;
      return group.count ? <Link key={group.slug} href={hrefFor(group)} className="rounded-[20px] border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--ib-primary)] hover:bg-[var(--ib-primary-soft)]/40">{content}</Link> : <article key={group.slug} aria-disabled="true" className="rounded-[20px] border border-[var(--ib-border-soft)] bg-[var(--ib-bg-soft)] p-4 opacity-70">{content}</article>;
    })}
  </section>;
}

function contextHref(moduleSlug: string, categorySlug?: string, roleSlug?: string) {
  const params = new URLSearchParams({ module: moduleSlug });
  if (roleSlug) params.set('role', roleSlug);
  if (categorySlug) params.set('category', categorySlug);
  return `/micro-scenes?${params.toString()}`;
}

export default function MicroSceneLibrary({ moduleSlug, roleSlug, categorySlug, sceneId }: { moduleSlug?: string; roleSlug?: string; categorySlug?: string; sceneId?: string }) {
  const modules = getHistoricalMicroModules();
  const selectedModule = getHistoricalMicroModule(moduleSlug);
  const factoryRoles = getFactoryMicroRoles();
  const selectedRole = moduleSlug === 'factory' ? factoryRoles.find((item) => item.slug === roleSlug) : undefined;
  const groups = selectedModule ? getHistoricalMicroGroups(selectedModule.slug, roleSlug) : [];
  const selectedGroup = groups.find((item) => item.slug === categorySlug);
  const items = selectedModule ? getHistoricalMicroItems(selectedModule.slug, categorySlug, roleSlug) : [];
  const selectedScene = items.find((item) => item.sourceId === sceneId);
  const isDirectFactoryRole = selectedModule?.slug === 'factory' && selectedRole && selectedRole.slug !== 'manager';
  const hasListContext = Boolean(selectedGroup || isDirectFactoryRole);
  const listTitle = selectedGroup?.title ?? selectedRole?.title ?? '';
  const listIndonesian = selectedGroup?.indonesian ?? selectedRole?.indonesian ?? '';
  const listHref = selectedModule ? contextHref(selectedModule.slug, categorySlug, roleSlug) : '/micro-scenes';

  let nextGroupHref: string | undefined;
  let nextGroupLabel: string | undefined;
  if (selectedModule && selectedGroup) {
    const nextGroup = getNextHistoricalMicroGroup(selectedModule.slug, selectedGroup.slug, roleSlug);
    if (nextGroup) {
      nextGroupHref = contextHref(selectedModule.slug, nextGroup.slug, roleSlug);
      nextGroupLabel = nextGroup.title;
    }
  } else if (selectedModule?.slug === 'factory' && selectedRole) {
    const roleIndex = factoryRoles.findIndex((item) => item.slug === selectedRole.slug);
    const nextRole = roleIndex >= 0 ? factoryRoles[roleIndex + 1] : undefined;
    if (nextRole) {
      nextGroupHref = contextHref('factory', undefined, nextRole.slug);
      nextGroupLabel = nextRole.title;
    }
  }

  if (selectedScene) {
    return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-3 sm:px-8 sm:pt-5">
      <MicroSceneLearningSession
        items={items}
        moduleTitle={selectedModule?.title ?? ''}
        categoryTitle={listTitle}
        backHref={listHref}
        initialSourceId={selectedScene.sourceId}
        nextGroupHref={nextGroupHref}
        nextGroupLabel={nextGroupLabel}
      />
    </main>;
  }

  return <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pt-12">
    <BackLink href={selectedModule ? '/micro-scenes' : '/'} label={selectedModule ? '返回微场景' : '返回首页'} />

    {!selectedModule ? <>
      <Header eyebrow="马上会说" title="我现在想学哪个现实场景？" description="先选一个你现在会遇到的角色或生活模块，再找到马上能用的一句话。" />
      <section className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="四个现实场景入口">
        {modules.map((item) => <Link key={item.slug} href={contextHref(item.slug)} className="flex min-h-32 flex-col rounded-[22px] border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--ib-primary)]">
          <div className="flex items-start justify-between gap-3"><span className="text-3xl" aria-hidden="true">{item.icon}</span><span className="rounded-full bg-[var(--ib-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ib-primary)]">{item.count} 个</span></div>
          <h2 className="mt-3 text-lg font-bold text-[var(--ib-text-primary)]">{item.title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--ib-text-secondary)]">{item.subtitle}</p>
        </Link>)}
      </section>
    </> : null}

    {selectedModule && !hasListContext ? <>
      <Header eyebrow={selectedModule.indonesian} title={selectedRole?.title ?? selectedModule.title} description={selectedRole?.subtitle ?? (selectedModule.slug === 'factory' ? '先选择你现在面对的工厂角色。' : '选择你现在最想学会的现实场景。')} />
      {selectedModule.slug === 'factory' && selectedRole?.slug === 'manager' ? <div className="mt-3"><BackLink href={contextHref('factory')} label="工厂角色" /></div> : null}
      <GroupCards
        groups={groups}
        hrefFor={(group) => selectedModule.slug === 'factory' && !selectedRole
          ? contextHref('factory', undefined, group.slug)
          : contextHref(selectedModule.slug, group.slug, roleSlug)}
      />
    </> : null}

    {selectedModule && hasListContext ? <>
      <Header eyebrow={`${selectedModule.title} · ${listIndonesian}`} title={listTitle} description="选择一个现在会遇到的真实瞬间，进入连续学习。" />
      <div className="mt-3"><BackLink href={selectedModule.slug === 'factory' && selectedRole?.slug === 'manager' ? contextHref('factory', undefined, 'manager') : contextHref(selectedModule.slug)} label={selectedModule.slug === 'factory' ? '返回工厂分类' : selectedModule.title} /></div>
      <section className="mt-3 grid gap-3 sm:grid-cols-2" aria-label={`${listTitle} Quick Experience 列表`}>
        {items.map((item) => <Link key={item.sourceId} href={`${listHref}&scene=${encodeURIComponent(item.sourceId)}`} className="flex min-h-36 flex-col rounded-[20px] border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--ib-primary)] hover:bg-[var(--ib-primary-soft)]/35">
          <h2 className="text-base font-bold leading-6 text-[var(--ib-text-primary)]">{item.sceneTitle}</h2>
          <p lang="id" className="mt-3 text-[17px] font-semibold leading-7 text-[var(--ib-primary-strong)]">{item.indonesian}</p>
          <p className="mt-auto pt-3 text-[11px] tracking-wide text-[var(--ib-text-muted)]">{item.sourceId}</p>
        </Link>)}
      </section>
    </> : null}

    {moduleSlug && !selectedModule ? <section className="mt-5 rounded-[24px] border border-dashed border-[var(--ib-border-soft)] bg-white p-6 text-sm text-[var(--ib-text-secondary)]">未找到这个微场景入口。<Link href="/micro-scenes" className="ml-2 font-semibold text-[var(--ib-primary)]">返回微场景</Link></section> : null}
    {selectedModule && sceneId && !selectedScene ? <section className="mt-5 rounded-[24px] border border-dashed border-[var(--ib-border-soft)] bg-white p-6 text-sm text-[var(--ib-text-secondary)]">这个场景不属于当前分类。<Link href={listHref} className="ml-2 font-semibold text-[var(--ib-primary)]">返回列表</Link></section> : null}
  </main>;
}
