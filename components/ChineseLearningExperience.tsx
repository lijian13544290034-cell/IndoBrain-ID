import Link from 'next/link';
import ChineseSpeechButton from '@/components/ChineseSpeechButton';
import {
  chineseLearningGroups,
  chineseLearningCategory,
  getChineseLearningGroupBundle,
  type ChineseConcept,
  type ChineseRealUse,
  type ChineseVisual,
} from '@/lib/chinese-learning';

function AppleDot({ muted = false }: { muted?: boolean }) {
  return <span className={`relative inline-block h-10 w-10 rounded-full ${muted ? 'bg-[#ffd9d9]' : 'bg-[#f76f6f]'} shadow-sm`}>
    <span className="absolute left-1/2 top-[-5px] h-3 w-1.5 -translate-x-1/2 rounded-full bg-[#6f8f55]" />
  </span>;
}

function VisualMeaning({ visual }: { visual: ChineseVisual }) {
  const quantity = visual.quantity;
  const count = typeof quantity === 'number' ? quantity : quantity === 'few' ? 1 : quantity === 'some' ? 4 : quantity === 'many' ? 7 : quantity === 'all' ? 9 : 3;
  return <div className="flex min-h-28 items-center justify-center rounded-[28px] bg-[#fff7ef] p-4">
    <div className="flex max-w-56 flex-wrap items-center justify-center gap-2" aria-label="visual quantity">
      {Array.from({ length: count }).map((_, index) => <AppleDot key={index} muted={quantity === 'all' && index > 5} />)}
      {quantity === 'all' ? <span className="mt-2 w-full text-center text-xs font-semibold text-[#b05e4d]">全部</span> : null}
    </div>
  </div>;
}

function ConceptCard({ concept }: { concept: ChineseConcept }) {
  return <article className="rounded-[30px] border border-[#e6edf8] bg-white p-4 shadow-[var(--ib-shadow-card)]">
    <VisualMeaning visual={concept.visual} />
    <div className="mt-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-5xl font-black leading-none tracking-[-0.06em] text-[var(--ib-text-primary)]">{concept.hanzi}</p>
        <p className="mt-2 text-base font-semibold text-[#4f76bb]">{concept.pinyin}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--ib-text-secondary)]">{concept.indonesian}</p>
      </div>
      <ChineseSpeechButton text={concept.ttsText} compact />
    </div>
  </article>;
}

function RealUseBlock({ realUse }: { realUse?: ChineseRealUse }) {
  if (!realUse) return null;
  return <section className="mt-5 rounded-[30px] bg-white p-5 shadow-[var(--ib-shadow-card)]">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f76bb]">马上会用</p>
    <h2 className="mt-2 text-xl font-bold text-[var(--ib-text-primary)]">{realUse.titleZh}</h2>
    <p className="mt-1 text-sm leading-6 text-[var(--ib-text-secondary)]">{realUse.contextId}</p>
    <div className="mt-4 grid gap-3">
      {realUse.items.map((item) => <article key={item.hanzi} className="rounded-[24px] bg-[#f7faff] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-3xl font-black leading-tight text-[var(--ib-text-primary)]">{item.hanzi}</p>
            <p className="mt-1 text-sm font-semibold text-[#4f76bb]">{item.pinyin}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ib-text-secondary)]">{item.indonesian}</p>
          </div>
          <ChineseSpeechButton text={item.ttsText} compact />
        </div>
      </article>)}
    </div>
  </section>;
}

export default function ChineseLearningExperience({ groupId }: { groupId?: string }) {
  const { group, concepts, realUse } = getChineseLearningGroupBundle(groupId ?? chineseLearningGroups[0].id);
  const currentIndex = chineseLearningGroups.findIndex((item) => item.id === group.id);
  const previousGroup = currentIndex > 0 ? chineseLearningGroups[currentIndex - 1] : undefined;
  const nextGroup = currentIndex >= 0 && currentIndex < chineseLearningGroups.length - 1 ? chineseLearningGroups[currentIndex + 1] : undefined;

  return <main className="min-h-screen bg-[var(--ib-bg)] px-4 py-5 text-[var(--ib-text-primary)]">
    <div className="mx-auto max-w-4xl pb-12">
      <Link href="/" className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-[var(--ib-text-secondary)] shadow-sm">← IndoBrain</Link>

      <section className="mt-5 rounded-[32px] bg-white p-6 shadow-[var(--ib-shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f76bb]">Chinese Learning Template V1</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[var(--ib-text-primary)]">学中文：数量</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ib-text-secondary)]">
          Objeknya tetap apel. Lihat jumlahnya, dengar bunyinya, lalu kenali bahasa Mandarinnya.
        </p>
      </section>

      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Chinese learning groups">
        {chineseLearningGroups.map((item) => <Link
          key={item.id}
          href={`/learn-chinese?group=${item.id}`}
          className={`min-h-10 shrink-0 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${item.id === group.id ? 'bg-[#4f76bb] text-white' : 'bg-white text-[var(--ib-text-secondary)]'}`}
        >
          {item.order}. {item.titleId}
        </Link>)}
      </nav>

      <section className="mt-4 rounded-[30px] bg-white p-5 shadow-[var(--ib-shadow-card)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#4f76bb]">第 {group.order} 组 · {concepts.length} 个</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{group.titleZh}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--ib-text-secondary)]">{group.titleId}</p>
          </div>
          <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#4f76bb]">{currentIndex + 1} / {chineseLearningGroups.length}</span>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        {concepts.map((concept) => <ConceptCard key={concept.id} concept={concept} />)}
      </section>

      <RealUseBlock realUse={realUse} />

      <div className="mt-5 flex items-center justify-between gap-3">
        {previousGroup ? <Link href={`/learn-chinese?group=${previousGroup.id}`} className="min-h-11 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[var(--ib-text-secondary)] shadow-sm">← 上一组</Link> : <span />}
        {nextGroup ? <Link href={`/learn-chinese?group=${nextGroup.id}`} className="min-h-11 rounded-full bg-[#4f76bb] px-4 py-3 text-sm font-semibold text-white shadow-sm">下一组 →</Link> : <span className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-[var(--ib-text-secondary)] shadow-sm">Demo 完成</span>}
      </div>

      <section className="mt-5 rounded-[26px] border border-dashed border-[#c9d8f2] bg-white/70 p-4 text-sm leading-6 text-[var(--ib-text-secondary)]">
        <p className="font-semibold text-[var(--ib-text-primary)]">模板说明</p>
        <p className="mt-1">Indonesian adalah bantuan. Fokus utamanya tetap visual → bunyi Mandarin → Hanzi → penggunaan nyata.</p>
      </section>
    </div>
  </main>;
}
