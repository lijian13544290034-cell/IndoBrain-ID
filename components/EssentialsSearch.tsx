'use client';

export default function EssentialsSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="block">
    <span className="sr-only">Cari kata atau situasi（搜索词语或场景）</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Cari kata atau situasi（搜索词语或场景）" className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-500" />
  </label>;
}
