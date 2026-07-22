import ExperienceActions from '@/components/ExperienceActions';
import HarvestSection from '@/components/HarvestSection';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import IndonesianAudioProvider from '@/components/IndonesianAudioProvider';
import IndoBrainInsight from '@/components/IndoBrainInsight';

export type ExperienceDetailItem = {
  id: string;
  task: string;
  indonesian?: string;
  explanation?: string;
  harvest: string[];
  missing?: boolean;
  insight?: { indonesian: string; chinese: string };
};

export default function ExperienceDetail({ experience }: { experience: ExperienceDetailItem }) {
  return <section className="mt-7 rounded-2xl border border-stone-200 bg-white px-6 py-7 shadow-sm sm:px-8">
    <p className="text-sm text-stone-400">{experience.id}</p>
    {experience.missing ? <><h1 className="mt-2 text-2xl font-semibold">Belum tersedia</h1><p className="mt-5 text-sm leading-6 text-stone-500">该内容将在后续版本补充。</p></> : <>
      <IndonesianAudioProvider><h1 className="mt-2 text-2xl font-semibold">{experience.task}</h1>
      <p className="mt-5 text-xs text-stone-400">Bahasa Indonesia（印尼语）</p>
      <div className="mt-2 rounded-xl bg-stone-50 p-4"><p className="text-lg leading-8">{experience.indonesian || 'Belum tersedia.'}</p>{experience.indonesian && <IndonesianSpeechButton text={experience.indonesian} />}</div>
      {experience.explanation && <><p className="mt-5 text-xs text-stone-400">Penjelasan（中文说明）</p><p className="mt-2 text-sm leading-6 text-stone-700">{experience.explanation}</p></>}
      <HarvestSection harvest={experience.harvest} />
      {experience.insight && <IndoBrainInsight insight={experience.insight} />}
      <ExperienceActions experienceId={experience.id} indonesian={experience.indonesian || ''} /></IndonesianAudioProvider>
    </>}
  </section>;
}
