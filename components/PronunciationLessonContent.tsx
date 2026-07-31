import Link from 'next/link';
import IndonesianAudioProvider from '@/components/IndonesianAudioProvider';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import type { PronunciationLesson } from '@/lib/pronunciation-lessons';

export default function PronunciationLessonContent({ lesson, total }: { lesson: PronunciationLesson; total: number }) {
  const previous = lesson.id > 1 ? lesson.id - 1 : null;
  const next = lesson.id < total ? lesson.id + 1 : null;

  return <IndonesianAudioProvider><main className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
    <Link href="/pronunciation" className="text-sm text-stone-500 hover:text-stone-900">← 发音基础</Link>
    <header className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-xs text-stone-400">Lesson {lesson.id} / {total}</p>
      <h1 className="mt-1 text-2xl font-semibold">{lesson.title}</h1>
      <p className="mt-1 text-base text-stone-500">{lesson.indonesianTitle}</p>
      <p className="mt-4 text-sm leading-7 text-stone-600">{lesson.introduction}</p>
    </header>

    <div className="mt-8 space-y-8">
      {lesson.sections.map((section) => <section key={section.title}>
        <h2 className="text-lg font-semibold">{section.title} <span className="text-sm font-normal text-stone-500">（{section.chineseTitle}）</span></h2>
        <p className="mt-3 rounded-xl bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-600">{section.rule}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {section.examples.map((example) => <article key={example.word} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold">{example.word}</h3>
            <p className="mt-1 text-sm text-stone-500">{example.chinese}</p>

            <div className="mt-4">
              <p className="text-xs font-medium text-stone-400">人工确认音节</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {example.syllables.map((part, index) => <span key={`${part}-${index}`} className="inline-flex items-center gap-1 rounded-lg bg-stone-50 px-2 py-1 text-sm"><span>{part}</span><IndonesianSpeechButton text={part} rate="slow" compact /></span>)}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-medium text-stone-400">整词播放</span>
              <IndonesianSpeechButton text={example.audioText} rate="slow" compact />
            </div>

            {example.focusCombination && <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-medium text-stone-400">重点组合</span>
              <span className="rounded-md bg-stone-100 px-2 py-1 text-sm">{example.focusCombination}</span>
              <IndonesianSpeechButton text={example.focusCombination} rate="slow" compact />
            </div>}

            {example.vowelCount && <p className="mt-4 text-sm"><span className="text-stone-400">元音：</span>{example.vowelCount.join('、')}</p>}
            <p className="mt-4 text-sm leading-6 text-stone-600"><span className="font-medium text-stone-500">发音规则：</span>{example.ruleNote}</p>
          </article>)}
        </div>
      </section>)}
    </div>

    {lesson.practice && <section className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <h2 className="font-semibold">Practice <span className="text-sm font-normal text-stone-500">（练习）</span></h2>
      <p className="mt-3 text-sm leading-7 text-stone-600">{lesson.practice.prompt}</p>
      <p className="mt-3 text-sm font-medium">{lesson.practice.answer}</p>
      <div className="mt-4 flex items-center gap-2"><span className="text-xs font-medium text-stone-400">完整播放</span><IndonesianSpeechButton text={lesson.practice.audioText} rate="slow" compact /></div>
      <div className="mt-4 flex flex-wrap gap-2">{lesson.practice.chunks.map((part, index) => <span key={`${part}-${index}`} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm">{part}<IndonesianSpeechButton text={part} rate="slow" compact /></span>)}</div>
    </section>}

    {lesson.id === total && <Link href="/" className="mt-8 inline-flex rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-700">开始正式课程</Link>}
    <nav className="mt-10 flex items-center justify-between gap-3 border-t border-stone-200 pt-6">
      {previous ? <Link href={`/pronunciation/${previous}`} className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm hover:bg-stone-50">← 上一课</Link> : <span />}
      {next ? <Link href={`/pronunciation/${next}`} className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm hover:bg-stone-50">下一课 →</Link> : <span />}
    </nav>
  </main></IndonesianAudioProvider>;
}
