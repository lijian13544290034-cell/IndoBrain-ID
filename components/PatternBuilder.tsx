'use client';

import { useState } from 'react';
import IndonesianAudioButton from '@/components/IndonesianAudioButton';

export default function PatternBuilder() {
  const [product, setProduct] = useState('susu');
  const [time, setTime] = useState('jam tujuh');
  const [factoryProduct, setFactoryProduct] = useState('kursi');
  const [quantity, setQuantity] = useState('500');
  const [copied, setCopied] = useState('');
  const patterns = [
    { id: 'buy', sentence: `Tolong beli ${product} ya.`, chinese: `请买${product}。` },
    { id: 'pickup', sentence: `Besok jemput saya ${time} ya.`, chinese: `明天${time}来接我。` },
    { id: 'factory', sentence: `Hari ini kita produksi ${factoryProduct} sebanyak ${quantity}.`, chinese: `今天我们生产 ${factoryProduct}，数量 ${quantity}。` },
  ];
  const copy = async (id: string, sentence: string) => {
    await navigator.clipboard.writeText(sentence);
    setCopied(id);
  };

  return <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-10 sm:px-8">
    <h1 className="text-3xl font-semibold">Pattern</h1><p className="mt-1 text-stone-500">（句型练习）</p>
    <div className="mt-8 space-y-5">
      <label className="block rounded-2xl border p-5"><span className="font-medium">购物</span><select value={product} onChange={(event) => setProduct(event.target.value)} className="ml-4 border p-2"><option>susu</option><option>telur</option><option>buah</option><option>beras</option><option>minyak</option><option>sabun cuci</option></select></label>
      <label className="block rounded-2xl border p-5"><span className="font-medium">接送</span><select value={time} onChange={(event) => setTime(event.target.value)} className="ml-4 border p-2"><option>jam tujuh</option><option>jam setengah delapan</option><option>jam delapan</option><option>jam sembilan</option></select></label>
      <label className="block rounded-2xl border p-5"><span className="font-medium">生产</span><input value={factoryProduct} onChange={(event) => setFactoryProduct(event.target.value)} className="ml-4 w-24 border p-2" /><input value={quantity} onChange={(event) => setQuantity(event.target.value)} className="ml-2 w-20 border p-2" /></label>
      {patterns.map((item) => <article key={item.id} className="rounded-2xl bg-stone-50 p-5"><p className="text-lg">{item.sentence}</p><p className="mt-2 text-sm text-stone-500">{item.chinese}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => copy(item.id, item.sentence)} className="text-sm underline">{copied === item.id ? '已复制' : 'Salin（复制）'}</button><IndonesianAudioButton text={item.sentence} /></div></article>)}
    </div>
  </main>;
}
