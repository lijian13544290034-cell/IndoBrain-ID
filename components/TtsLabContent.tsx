'use client';

import IndonesianAudioProvider from '@/components/IndonesianAudioProvider';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';

const items = [
  { display: 'ja', phoneme: 'dʒa', examples: ['jalan'] },
  { display: 'ka', phoneme: 'ka', examples: ['kantor'] },
  { display: 'ba', phoneme: 'ba', examples: ['baik'] },
  { display: 'ma', phoneme: 'ma', examples: ['makan'] },
  { display: 'pu', phoneme: 'pu', examples: ['pulau'] },
  { display: 'lau', phoneme: 'laʊ', examples: ['pulau'] },
  { display: 'ng', phoneme: 'ŋə', examples: ['ngengat', 'sayang'] },
  { display: 'ny', phoneme: 'ɲa', examples: ['nyamuk', 'banyak'] },
  { display: 'sy', phoneme: 'ʃa', examples: ['syarat'] },
  { display: 'kh', phoneme: 'xa', examples: ['khusus', 'akhir'] },
  { display: 'ai', phoneme: 'aɪ', examples: ['baik'] },
  { display: 'au', phoneme: 'aʊ', examples: ['pulau'] },
  { display: 'oi', phoneme: 'ɔɪ', examples: ['boikot'] },
];

export default function TtsLabContent() {
  return <IndonesianAudioProvider><main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-10 sm:px-8">
    <p className="text-xs font-medium text-stone-400">Preview / Development only</p>
    <h1 className="mt-2 text-2xl font-semibold">TTS Lab</h1>
    <p className="mt-3 text-sm leading-7 text-stone-600">仅用于人工比较印尼语短音节与组合音的示范。Google 未配置或请求失败时，系统会安全回退到 Azure。</p>
    <div className="mt-8 space-y-3">{items.map((item) => <article key={item.display} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="font-semibold">{item.display} <span className="ml-2 text-sm font-normal text-stone-500">/{item.phoneme}/</span></h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <IndonesianSpeechButton text={item.display} rate="slow" label="Azure 文本" compact />
        <IndonesianSpeechButton text={item.display} rate="slow" pronunciation={{ provider: 'google', audioMode: 'text', audioText: item.display, exampleWords: item.examples }} label="Google 文本" compact />
        <IndonesianSpeechButton text={item.display} rate="slow" pronunciation={{ provider: 'google', audioMode: 'phoneme', alphabet: 'ipa', phoneme: item.phoneme, exampleWords: item.examples }} label="Google IPA" compact />
      </div>
      <p className="mt-3 text-sm text-stone-500">自然例词：{item.examples.join(' / ')}</p>
    </article>)}</div>
  </main></IndonesianAudioProvider>;
}
