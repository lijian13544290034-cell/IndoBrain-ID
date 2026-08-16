import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import { harvestMeaning, harvestTerm } from '@/lib/harvest';

export default function HarvestSection({ harvest }: { harvest: string[] }) {
  return <section className="mt-6">
    <p className="text-xs text-stone-400">Kata Penting Hari Ini（今日重点词汇）</p>
    {harvest.length ? <ul className="mt-2 space-y-2 text-sm text-stone-700">{harvest.map((word) => {
      const term = harvestTerm(word);
      const meaning = harvestMeaning(word);
      return <li key={word} className="rounded-2xl border border-stone-100 bg-white/80 px-3 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-stone-800">• {term}</span>
          <IndonesianSpeechButton text={term} compact />
        </div>
        <p className="mt-1 pl-4 text-xs leading-5 text-stone-500">{meaning}</p>
      </li>;
    })}</ul> : <p className="mt-2 text-sm leading-6 text-stone-500">Belum tersedia.<br />该内容将在后续版本补充。</p>}
  </section>;
}
