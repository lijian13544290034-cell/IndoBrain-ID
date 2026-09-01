import Link from 'next/link';
import BasicConceptGrid from '@/components/BasicConceptGrid';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import {
  basicEssentialsCategories,
  basicEssentialsCounterExamples,
  basicEssentialsNumberSteps,
  getBasicCategory,
  getBasicConcept,
  getBasicConcepts,
  getBasicSubcategory,
  searchBasicConcepts,
  type BasicCombination,
  type BasicConcept,
  type BasicSubcategory,
  type BasicTopCategory,
} from '@/lib/basic-essentials';
import { getRealUseForLearningGroup, type RealUseUnit } from '@/lib/basic-real-use';
import { getExperienceCatalog } from '@/lib/experience-catalog';

type BasicEssentialsExperienceProps = {
  category?: string;
  subcategory?: string;
  concept?: string;
  group?: string;
  query?: string;
  showFavorites?: boolean;
};

const GROUP_SIZE = 8;

function BasicIcon({ kind }: { kind: BasicTopCategory['icon'] }) {
  const common = { className: 'h-6 w-6', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'heart') return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>;
  if (kind === 'utensils') return <svg {...common}><path d="M4 3v8" /><path d="M8 3v8" /><path d="M6 3v18" /><path d="M14 3v8a4 4 0 0 0 4 4v6" /><path d="M18 3v18" /></svg>;
  if (kind === 'user') return <svg {...common}><circle cx="12" cy="7" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>;
  if (kind === 'home') return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-7h6v7" /></svg>;
  if (kind === 'navigation') return <svg {...common}><path d="m4 19 6-14 4 7 7 3-14 5 3-8Z" /></svg>;
  return <svg {...common}><path d="M4 4h7v7H4Z" /><path d="M13 4h7v7h-7Z" /><path d="M4 13h7v7H4Z" /><path d="M13 13h7v7h-7Z" /></svg>;
}

function buildHref(params: { category?: string; subcategory?: string; concept?: string; group?: number; query?: string }) {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.subcategory) search.set('sub', params.subcategory);
  if (params.group && params.group > 1) search.set('group', String(params.group));
  if (params.concept) search.set('concept', params.concept);
  if (params.query) search.set('q', params.query);
  const value = search.toString();
  return value ? `/basic-essentials?${value}` : '/basic-essentials';
}

function clampGroup(rawGroup: string | undefined, totalGroups: number) {
  const parsed = Number.parseInt(rawGroup ?? '1', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, Math.max(totalGroups, 1));
}

function nextSubcategory(category: BasicTopCategory, current: BasicSubcategory) {
  const index = category.subcategories.findIndex((item) => item.id === current.id);
  return index >= 0 ? category.subcategories[index + 1] : undefined;
}

function FavoritesEntry() {
  return <Link href="/basic-essentials?favorites=1" className="inline-flex min-h-10 items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ib-primary)] shadow-[var(--ib-shadow-card)] transition hover:bg-[var(--ib-primary-soft)]">我的收藏</Link>;
}

function RootHome() {
  return <main data-basic-essentials-page className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-14 pt-8 sm:px-8 sm:pt-12">
    <Link href="/" className="text-sm font-medium text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← Beranda（返回首页）</Link>
    <header className="mt-6 rounded-[30px] bg-white p-6 shadow-[var(--ib-shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ib-primary)]">Basic Essentials V1</p>
      <h1 className="mt-2 text-3xl font-bold text-[var(--ib-text-primary)]">基础必会</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ib-text-secondary)]">先学现在最能用的几组基础表达，再进入真实场景。</p>
      <div className="mt-4"><FavoritesEntry /></div>
    </header>

    <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Basic Essentials root categories">
      {basicEssentialsCategories.map((item) => <Link key={item.id} href={buildHref({ category: item.id, subcategory: item.subcategories[0]?.id })} className="rounded-[26px] bg-white p-5 shadow-[var(--ib-shadow-card)] transition hover:-translate-y-0.5 hover:bg-[var(--ib-primary-soft)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ib-primary-soft)] text-[var(--ib-primary)]"><BasicIcon kind={item.icon} /></span>
        <h2 className="mt-4 text-lg font-bold text-[var(--ib-text-primary)]">{item.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{item.subtitle}</p>
      </Link>)}
    </section>
  </main>;
}

function SearchResults({ query }: { query: string }) {
  const results = searchBasicConcepts(query);

  return <main data-basic-essentials-page className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-14 pt-8 sm:px-8 sm:pt-12">
    <Link href="/basic-essentials" className="text-sm font-medium text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← 基础必会</Link>
    <header className="mt-6 rounded-[28px] bg-white p-5 shadow-[var(--ib-shadow-card)]">
      <h1 className="text-2xl font-bold text-[var(--ib-text-primary)]">搜索基础表达</h1>
      <form action="/basic-essentials" className="mt-4 flex gap-2 rounded-2xl bg-[var(--ib-bg-soft)] p-2">
        <input name="q" defaultValue={query} placeholder="搜索中文 / 印尼语" className="min-h-11 flex-1 rounded-xl border border-transparent bg-white px-4 text-sm text-[var(--ib-text-primary)] outline-none focus:border-[var(--ib-primary)]" />
        <button type="submit" className="rounded-xl bg-[var(--ib-primary)] px-4 text-sm font-semibold text-white">搜索</button>
      </form>
      <div className="mt-3"><FavoritesEntry /></div>
    </header>
    {results.length ? <BasicConceptGrid ariaLabel="Basic Essentials search results" entries={results.map((item) => ({ item, href: buildHref({ category: item.categoryId, subcategory: item.subcategoryId, concept: item.conceptKey }) }))} /> : <div className="mt-5 rounded-2xl bg-white p-5 text-sm text-[var(--ib-text-secondary)] shadow-[var(--ib-shadow-card)]">没有找到匹配的基础表达。</div>}
  </main>;
}

function FavoritesReview() {
  const concepts = getBasicConcepts();
  return <main data-basic-essentials-page className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-14 pt-8 sm:px-8 sm:pt-12">
    <Link href="/basic-essentials" className="text-sm font-medium text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← 基础必会</Link>
    <header className="mt-6 rounded-[28px] bg-white p-5 shadow-[var(--ib-shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ib-primary)]">Basic Essentials V1</p>
      <h1 className="mt-2 text-2xl font-bold text-[var(--ib-text-primary)]">我的收藏</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">快速复习你收藏的基础词汇。</p>
    </header>
    <BasicConceptGrid favoritesOnly ariaLabel="我的 Basic Essentials 收藏" entries={concepts.map((item) => ({ item, href: buildHref({ category: item.categoryId, subcategory: item.subcategoryId, concept: item.conceptKey }) }))} />
  </main>;
}

function TextWithSpeech({ indonesian, chinese, ttsText = indonesian }: BasicCombination & { ttsText?: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--ib-bg-soft)] px-4 py-3">
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-[var(--ib-text-primary)]">{indonesian}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--ib-text-secondary)]">{chinese}</p>
    </div>
    <IndonesianSpeechButton text={ttsText} compact iconOnly />
  </div>;
}

function ConceptDetail({ concept }: { concept: BasicConcept }) {
  const sceneById = new Map(getExperienceCatalog().map((scene) => [scene.id, scene]));
  const relatedScenes = concept.relatedSceneIds.map((id) => sceneById.get(id)).filter(Boolean).slice(0, 2);
  const spokenForms = concept.colloquialForms.filter((form) => form !== concept.indonesian).slice(0, 2);
  const combinations = [...concept.shortExpressions, ...concept.combinations].slice(0, 3);

  return <section className="rounded-[26px] bg-white p-5 shadow-[var(--ib-shadow-card)]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ib-primary)]">展开看看</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--ib-text-primary)]">{concept.indonesian}</h2>
        <p className="mt-1 text-base font-semibold text-[var(--ib-text-secondary)]">{concept.chinese}</p>
      </div>
      <IndonesianSpeechButton text={concept.ttsText} compact iconOnly />
    </div>

    <div className="mt-4 grid gap-3">
      {combinations.length ? <div>
        <h3 className="text-sm font-bold text-[var(--ib-text-primary)]">马上会说</h3>
        <div className="mt-2 grid gap-2">{combinations.slice(0, 2).map((item) => <TextWithSpeech key={item.indonesian} indonesian={item.indonesian} chinese={item.chinese} />)}</div>
      </div> : null}

      {spokenForms.length ? <div>
        <h3 className="text-sm font-bold text-[var(--ib-text-primary)]">现实里也会听到</h3>
        <div className="mt-2 grid gap-2">{spokenForms.map((form) => <TextWithSpeech key={form} indonesian={form} chinese="口语常见说法" />)}</div>
      </div> : null}

      {concept.usageNote ? <p className="rounded-2xl bg-[var(--ib-bg-soft)] px-4 py-3 text-sm leading-6 text-[var(--ib-text-secondary)]">{concept.usageNote}</p> : null}

      {relatedScenes.length ? <div>
        <h3 className="text-sm font-bold text-[var(--ib-text-primary)]">真实场景里会用到</h3>
        <div className="mt-2 grid gap-2">
          {relatedScenes.map((scene) => scene ? <Link key={scene.id} href={scene.href} className="rounded-2xl bg-[var(--ib-bg-soft)] px-4 py-3 text-sm transition hover:bg-[var(--ib-primary-soft)]">
            <span className="text-xs font-semibold text-[var(--ib-primary)]">{scene.id}</span>
            <p className="mt-1 font-semibold text-[var(--ib-text-primary)]">{scene.task}</p>
          </Link> : null)}
        </div>
      </div> : null}
    </div>
  </section>;
}

function RealUseSection({ realUse }: { realUse?: RealUseUnit }) {
  if (!realUse) return null;
  const sceneById = new Map(getExperienceCatalog().map((scene) => [scene.id, scene]));
  const relatedScenes = (realUse.relatedSceneIds ?? []).map((id) => sceneById.get(id)).filter(Boolean).slice(0, 1);
  const showContext = realUse.type === 'micro_scene';

  return <section className="mt-5 rounded-[28px] bg-white p-5 shadow-[var(--ib-shadow-card)]" aria-label="马上会用">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ib-primary)]">马上会用</p>
      <h2 className="mt-2 text-xl font-bold text-[var(--ib-text-primary)]">{realUse.titleZh}</h2>
      {showContext && realUse.contextZh ? <p className="mt-1 text-sm leading-6 text-[var(--ib-text-secondary)]">{realUse.contextZh}</p> : null}
    </div>

    <div className="mt-4 grid gap-3">
      {realUse.items.map((item) => <TextWithSpeech key={`${realUse.id}-${item.indonesian}`} indonesian={item.indonesian} chinese={item.chinese} ttsText={item.ttsText} />)}
      {relatedScenes.length ? <div>
        {relatedScenes.map((relatedScene) => relatedScene ? <Link key={relatedScene.id} href={relatedScene.href} className="inline-flex rounded-full bg-[var(--ib-bg-soft)] px-3 py-2 text-xs font-semibold text-[var(--ib-primary)] shadow-sm transition hover:bg-[var(--ib-primary-soft)]">
          进入真实场景 →
        </Link> : null)}
      </div> : null}
    </div>
  </section>;
}

function SecondaryTabs({ category, selectedSubcategory }: { category: BasicTopCategory; selectedSubcategory: BasicSubcategory }) {
  return <nav aria-label={`${category.title} 二级分类`} className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
    <div className="flex min-w-max gap-2 py-1">
      {category.subcategories.map((item) => {
        const active = item.id === selectedSubcategory.id;
        return <Link key={item.id} href={buildHref({ category: category.id, subcategory: item.id })} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-[var(--ib-primary)] text-white shadow-[var(--ib-shadow-card)]' : 'bg-white text-[var(--ib-text-secondary)] hover:bg-[var(--ib-primary-soft)] hover:text-[var(--ib-primary)]'}`}>{item.title}</Link>;
      })}
    </div>
  </nav>;
}

function LearningProgress({ groupIndex, totalGroups, groupCount }: { groupIndex: number; totalGroups: number; groupCount: number }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[var(--ib-shadow-card)]">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ib-primary)]">当前学习</p>
      <p className="mt-1 text-sm font-semibold text-[var(--ib-text-primary)]">第 {groupIndex} 组 · {groupCount} 个</p>
    </div>
    <span className="rounded-full bg-[var(--ib-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--ib-primary)]">{groupIndex} / {totalGroups}</span>
  </div>;
}

function GroupPager({ category, subcategory, groupIndex, totalGroups }: { category: BasicTopCategory; subcategory: BasicSubcategory; groupIndex: number; totalGroups: number }) {
  const nextSub = nextSubcategory(category, subcategory);
  const nextHref = groupIndex < totalGroups
    ? buildHref({ category: category.id, subcategory: subcategory.id, group: groupIndex + 1 })
    : nextSub ? buildHref({ category: category.id, subcategory: nextSub.id }) : undefined;
  const nextLabel = groupIndex < totalGroups ? `继续下一组 →` : nextSub ? `下一组：${nextSub.title} →` : undefined;

  return <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
    {groupIndex > 1 ? <Link href={buildHref({ category: category.id, subcategory: subcategory.id, group: groupIndex - 1 })} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ib-text-secondary)] shadow-[var(--ib-shadow-card)]">← 上一组</Link> : <span />}
    {nextHref && nextLabel ? <Link href={nextHref} className="rounded-full bg-[var(--ib-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--ib-shadow-card)]">{nextLabel}</Link> : <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ib-text-secondary)] shadow-[var(--ib-shadow-card)]">这一类完成了</span>}
  </div>;
}

function NumberModule({ selectedConcept }: { selectedConcept?: BasicConcept }) {
  if (!selectedConcept || !['nol', 'kosong'].includes(selectedConcept.conceptKey)) return null;
  return <section className="rounded-[26px] bg-white p-5 shadow-[var(--ib-shadow-card)]">
    <h2 className="text-lg font-bold text-[var(--ib-text-primary)]">数字规则小抄</h2>
    <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">数字模块规则保持不变。先听 nol / kosong，再看常见组合。</p>
    <div className="mt-3 grid gap-2">
      {basicEssentialsNumberSteps.slice(0, 2).flatMap((step) => step.items.slice(0, 6)).map((item) => <TextWithSpeech key={`number-${item.indonesian}`} indonesian={item.indonesian} chinese={item.chinese} />)}
    </div>
  </section>;
}

function CounterModule({ categoryId, subcategoryId }: { categoryId: string; subcategoryId: string }) {
  if (categoryId !== 'core' || subcategoryId !== 'measurement') return null;
  return <section className="rounded-[26px] bg-white p-5 shadow-[var(--ib-shadow-card)]">
    <h2 className="text-lg font-bold text-[var(--ib-text-primary)]">常见数量说法</h2>
    <div className="mt-3 grid gap-2">{basicEssentialsCounterExamples.slice(0, 6).map((item) => <TextWithSpeech key={`counter-${item.indonesian}`} indonesian={item.indonesian} chinese={item.chinese} />)}</div>
  </section>;
}

export default function BasicEssentialsExperience({ category, subcategory, concept, group, query, showFavorites = false }: BasicEssentialsExperienceProps) {
  const trimmedQuery = query?.trim() ?? '';
  if (trimmedQuery) return <SearchResults query={trimmedQuery} />;
  if (showFavorites) return <FavoritesReview />;

  const selectedCategory = getBasicCategory(category);
  if (!selectedCategory) return <RootHome />;

  const selectedSubcategory = getBasicSubcategory(selectedCategory.id, subcategory) ?? selectedCategory.subcategories[0];
  const concepts = getBasicConcepts({ categoryId: selectedCategory.id, subcategoryId: selectedSubcategory.id });
  const totalGroups = Math.max(1, Math.ceil(concepts.length / GROUP_SIZE));
  const groupIndex = clampGroup(group, totalGroups);
  const groupConcepts = concepts.slice((groupIndex - 1) * GROUP_SIZE, groupIndex * GROUP_SIZE);
  const realUse = getRealUseForLearningGroup(selectedCategory.id, selectedSubcategory.id, groupIndex);
  const selectedConcept = concept ? getBasicConcept(concept) : undefined;
  const detailConcept = selectedConcept && selectedConcept.categoryId === selectedCategory.id ? selectedConcept : undefined;

  return <main data-basic-essentials-page className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-14 pt-7 sm:px-8 sm:pt-10">
    <div className="flex items-center justify-between gap-3"><Link href="/basic-essentials" className="text-sm font-medium text-[var(--ib-text-secondary)] hover:text-[var(--ib-primary)]">← 基础必会</Link><FavoritesEntry /></div>

    <header className="mt-4 rounded-[28px] bg-white p-5 shadow-[var(--ib-shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ib-primary)]">Basic Essentials V1</p>
      <h1 className="mt-2 text-2xl font-bold text-[var(--ib-text-primary)]">{selectedCategory.title}</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{selectedCategory.subtitle}</p>
    </header>

    <div className="mt-4">
      <SecondaryTabs category={selectedCategory} selectedSubcategory={selectedSubcategory} />
    </div>

    <section className="mt-4 grid gap-3">
      <LearningProgress groupIndex={groupIndex} totalGroups={totalGroups} groupCount={groupConcepts.length} />
      <div>
        <h2 className="text-xl font-bold text-[var(--ib-text-primary)]">{selectedSubcategory.title}</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--ib-text-secondary)]">{selectedSubcategory.subtitle}</p>
      </div>
    </section>

    <BasicConceptGrid ariaLabel={`${selectedSubcategory.title} current learning group`} entries={groupConcepts.map((item) => ({ item, active: detailConcept?.conceptKey === item.conceptKey, href: buildHref({ category: selectedCategory.id, subcategory: selectedSubcategory.id, group: groupIndex, concept: item.conceptKey }) }))} />

    <RealUseSection realUse={realUse} />

    {detailConcept ? <div className="mt-5 grid gap-4">
      <ConceptDetail concept={detailConcept} />
      <NumberModule selectedConcept={detailConcept} />
      <CounterModule categoryId={selectedCategory.id} subcategoryId={selectedSubcategory.id} />
    </div> : null}

    <GroupPager category={selectedCategory} subcategory={selectedSubcategory} groupIndex={groupIndex} totalGroups={totalGroups} />
  </main>;
}
