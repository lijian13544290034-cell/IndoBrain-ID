import ChineseExperienceActions from '@/components/ChineseExperienceActions';
import ChineseVoiceSlot from '@/components/ChineseVoiceSlot';
import IndonesianAudioProvider from '@/components/IndonesianAudioProvider';
import LearningItemActions from '@/components/LearningItemActions';
import type { ChineseDialogue, ChineseExperience, ChineseVocabulary } from '@/lib/chinese-experiences';

const contentId = (experience: ChineseExperience, type: string, index?: number) => `ID_TO_ZH:${experience.id}:${type}${index === undefined ? '' : `:${index + 1}`}`;

function ChineseLine({ experience, item, type, index, dark = false }: { experience: ChineseExperience; item: ChineseDialogue; type: string; index: number; dark?: boolean }) {
  return <div className={`rounded-xl px-4 py-4 ${dark ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-900'}`}>
    <p className={`text-xs ${dark ? 'text-stone-300' : 'text-stone-400'}`}>{item.speaker}</p>
    <p className={`mt-2 text-sm leading-6 ${dark ? 'text-stone-200' : 'text-stone-600'}`}>{item.indonesian}</p>
    <p className="mt-2 text-lg font-medium leading-7">{item.chinese}</p>
    <p className={`mt-1 text-sm ${dark ? 'text-stone-300' : 'text-stone-500'}`}>{item.pinyin}</p>
    <div className="mt-3 flex flex-wrap items-center gap-2"><ChineseVoiceSlot text={item.chinese} compact /><LearningItemActions itemId={contentId(experience, type, index)} targetText={item.chinese} dark={dark} /></div>
  </div>;
}

function ChineseWord({ experience, item, type, index }: { experience: ChineseExperience; item: ChineseVocabulary; type: string; index: number }) {
  return <li className="rounded-lg bg-stone-50 px-3 py-3 text-sm"><p className="text-stone-600">{item.indonesian}</p><p className="mt-2 text-base font-medium text-stone-900">{item.chinese}</p><p className="mt-1 text-stone-500">{item.pinyin}</p><div className="mt-3 flex flex-wrap items-center gap-2"><ChineseVoiceSlot text={item.chinese} compact /><LearningItemActions itemId={contentId(experience, type, index)} targetText={item.chinese} /></div></li>;
}

export default function ChineseExperienceDetail({ experience }: { experience: ChineseExperience }) {
  const main = experience.dialogue.find((item) => item.chinese === experience.title) ?? experience.dialogue[0];
  return <IndonesianAudioProvider><article className="mt-7 rounded-2xl border border-stone-200 bg-white px-5 py-6 shadow-sm sm:px-8">
    <p className="text-xs font-medium text-stone-400">{experience.id}</p>
    <p className="mt-4 text-sm leading-6 text-stone-600">{main.indonesian}</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{experience.title}</h1>
    <p className="mt-2 text-lg text-stone-500">{experience.pinyin}</p>
    <div className="mt-3 flex flex-wrap items-center gap-2"><ChineseVoiceSlot text={experience.title} /><LearningItemActions itemId={contentId(experience, 'main')} targetText={experience.title} /></div>

    <section className="mt-7"><p className="text-xs font-medium text-stone-400">场景介绍（Konteks）</p><p className="mt-2 text-sm leading-7 text-stone-700">{experience.scenario}</p></section>

    <section className="mt-7"><p className="text-xs font-medium text-stone-400">场景对话（Dialog）</p><div className="mt-3 space-y-3">{experience.dialogue.map((item, index) => <ChineseLine key={`${item.speaker}-${index}`} experience={experience} item={item} type="dialogue" index={index} dark={item.speaker === '中国同事'} />)}</div></section>

    <section className="mt-7 grid gap-6 lg:grid-cols-2"><div><p className="text-xs font-medium text-stone-400">高频词汇（Kosakata penting）</p><ul className="mt-3 space-y-2">{experience.vocabulary.map((item, index) => <ChineseWord key={`${item.chinese}-${index}`} experience={experience} item={item} type="vocabulary" index={index} />)}</ul></div><div><p className="text-xs font-medium text-stone-400">常用物品（Benda terkait）</p><ul className="mt-3 space-y-2">{experience.objects.map((item, index) => <ChineseWord key={`${item.chinese}-${index}`} experience={experience} item={item} type="object" index={index} />)}</ul></div></section>

    <section className="mt-7 rounded-xl border border-stone-200 p-4"><p className="text-xs font-medium text-stone-400">Pattern（句型）</p><p className="mt-2 text-sm text-stone-600">{experience.pattern.indonesian}</p><p className="mt-2 text-lg font-medium">{experience.pattern.chinese}</p><p className="mt-1 text-sm text-stone-500">{experience.pattern.pinyin}</p><div className="mt-3 flex flex-wrap items-center gap-2"><ChineseVoiceSlot text={experience.pattern.chinese} compact /><LearningItemActions itemId={contentId(experience, 'pattern')} targetText={experience.pattern.chinese} /></div><div className="mt-4 space-y-2">{experience.pattern.examples.map((item, index) => <div key={`${item.chinese}-${index}`} className="border-l-2 border-stone-300 pl-3"><p className="text-sm text-stone-600">{item.indonesian}</p><p className="mt-1 text-sm font-medium">{item.chinese}</p><p className="mt-1 text-sm text-stone-500">{item.pinyin}</p><div className="mt-2 flex flex-wrap items-center gap-2"><ChineseVoiceSlot text={item.chinese} compact /><LearningItemActions itemId={contentId(experience, 'pattern-example', index)} targetText={item.chinese} /></div></div>)}</div></section>

    <section className="mt-7 grid gap-3 md:grid-cols-2"><div className="rounded-xl bg-stone-50 p-4"><p className="text-xs font-medium text-stone-400">中国小知识</p><p className="mt-2 text-sm leading-7 text-stone-700">{experience.chinaKnowledge}</p></div><div className="rounded-xl bg-stone-50 p-4"><p className="text-xs font-medium text-stone-400">文化提醒</p><p className="mt-2 text-sm leading-7 text-stone-700">{experience.cultureTip}</p></div></section>
    <ChineseExperienceActions experienceId={experience.id} />
  </article></IndonesianAudioProvider>;
}
