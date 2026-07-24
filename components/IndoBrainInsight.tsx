type Insight = { indonesian: string; chinese: string };

export default function IndoBrainInsight({ insight }: { insight: Insight }) {
  return <section className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
    <h2 className="text-sm font-semibold text-stone-800">💡 IndoBrain Insight</h2>
    <p className="mt-3 text-sm leading-6 text-stone-700">{insight.indonesian}</p>
    <p className="mt-2 text-sm leading-6 text-stone-500">{insight.chinese}</p>
  </section>;
}
