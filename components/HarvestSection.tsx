import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import { harvestTerm } from '@/lib/harvest';

export default function HarvestSection({ harvest }: { harvest: string[] }) {
  return <section className="mt-6">
    <p className="text-xs text-stone-400">Kata Penting Hari Ini（今日重点词汇）</p>
    {harvest.length ? <ul className="mt-2 space-y-2 text-sm text-stone-700">{harvest.map((word) => <li key={word} className="flex flex-wrap items-center gap-2"><span>• {word}</span><IndonesianSpeechButton text={harvestTerm(word)} compact /></li>)}</ul> : <p className="mt-2 text-sm leading-6 text-stone-500">Belum tersedia.<br />该内容将在后续版本补充。</p>}
  </section>;
}
