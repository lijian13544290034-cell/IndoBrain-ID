'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import ChineseSpeechButton from '@/components/ChineseSpeechButton';
import {
  chineseGoldenLessonJumlah,
  getQuantityExpression,
  getQuantityExpressionByQuantity,
  type ChineseLessonStateId,
  type ChinesePakaiLine,
  type ChinesePinyinToken,
  type ChineseQuantityExpression,
  type ChineseVisualState,
} from '@/lib/chinese-learning';

const lesson = chineseGoldenLessonJumlah;

function AppleShape({ quiet = false }: { quiet?: boolean }) {
  return (
    <span className={`relative inline-block h-14 w-14 rounded-[46%_46%_52%_52%] ${quiet ? 'bg-[#f2aaa0]' : 'bg-[#ee7468]'} shadow-[inset_0_-10px_18px_rgba(120,45,37,0.08)]`}>
      <span className="absolute left-1/2 top-[-7px] h-4 w-2 -translate-x-1/2 rounded-full bg-[#6f8457]" />
      <span className="absolute right-2 top-2 h-5 w-4 rounded-full bg-white/25" />
    </span>
  );
}

function AppleVisual({ state, compact = false }: { state: ChineseVisualState; compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center rounded-[34px] bg-[#fff6ef] ${compact ? 'min-h-28 p-4' : 'min-h-48 p-7 md:min-h-56'}`} aria-label={`${state.quantity} apple visual`}>
      <div className="flex max-w-[280px] flex-wrap items-center justify-center gap-3">
        {Array.from({ length: state.quantity }).map((_, index) => <AppleShape key={index} />)}
      </div>
    </div>
  );
}

function PinyinAlignment({ tokens }: { tokens: ChinesePinyinToken[] }) {
  const blocks = tokens.reduce<Array<{ wordBlock: string; tokens: ChinesePinyinToken[] }>>((acc, token) => {
    const last = acc[acc.length - 1];
    if (last?.wordBlock === token.wordBlock) last.tokens.push(token);
    else acc.push({ wordBlock: token.wordBlock, tokens: [token] });
    return acc;
  }, []);

  return (
    <div className="flex flex-wrap items-end justify-center gap-3" aria-label="Pinyin alignment">
      {blocks.map((block) => (
        <div key={block.wordBlock} className="rounded-2xl bg-[#f4f7fc] px-3 py-2">
          <div className="flex justify-center gap-1 text-3xl font-black leading-none tracking-[0.02em] text-[#17366f]">
            {block.tokens.map((token) => <span key={`${block.wordBlock}-${token.hanzi}`}>{token.hanzi}</span>)}
          </div>
          <div className="mt-2 flex justify-center gap-1 text-sm font-semibold text-[#6a7da0]">
            {block.tokens.map((token) => <span key={`${block.wordBlock}-${token.base}`}>{token.display}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepShell({
  step,
  title,
  children,
  primary,
  secondary,
}: {
  step: ChineseLessonStateId;
  title: string;
  children: React.ReactNode;
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  const currentIndex = lesson.steps.findIndex((item) => item.id === step);
  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 py-5 text-[#17366f]">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[820px] flex-col">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#6a7da0] shadow-sm">Kembali</Link>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-[#dfe8f7]">
            <div className="h-full rounded-full bg-[#4f76bb] transition-all" style={{ width: `${Math.max(8, ((currentIndex + 1) / lesson.steps.length) * 100)}%` }} />
          </div>
        </div>

        <section className="mt-5 flex flex-1 flex-col justify-center rounded-[36px] bg-white p-5 shadow-[0_18px_50px_rgba(23,54,111,0.08)] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7b95c6]">{lesson.titleId}</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#17366f] md:text-5xl">{title}</h1>
          <div className="mt-6">{children}</div>
        </section>

        {(primary || secondary) ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {secondary}
            {primary}
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ActionButton({ children, onClick, variant = 'primary' }: { children: React.ReactNode; onClick: () => void; variant?: 'primary' | 'secondary' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-full px-5 text-base font-bold transition active:scale-[0.99] ${variant === 'primary' ? 'bg-[#17366f] text-white shadow-[0_12px_28px_rgba(23,54,111,0.18)]' : 'bg-white text-[#4f76bb] shadow-sm'}`}
    >
      {children}
    </button>
  );
}

function ExpressionFocus({ expression, showText = true, showSupport = true }: { expression: ChineseQuantityExpression; showText?: boolean; showSupport?: boolean }) {
  return (
    <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr] md:items-center">
      <AppleVisual state={expression.visual} />
      {showText ? (
        <div className="text-center md:text-left">
          <p className="text-6xl font-black leading-none tracking-[0.02em] text-[#17366f] md:text-7xl">{expression.hanzi}</p>
          <div className="mt-5"><PinyinAlignment tokens={expression.pinyinTokens} /></div>
          {showSupport ? <p className="mt-4 text-lg font-semibold text-[#7a8496]">{expression.indonesian}</p> : null}
          <div className="mt-5 flex justify-center md:justify-start"><ChineseSpeechButton text={expression.ttsText} /></div>
        </div>
      ) : null}
    </div>
  );
}

function EntryState({ goNext }: { goNext: () => void }) {
  return (
    <StepShell
      step="entry"
      title={lesson.titleId}
      primary={<ActionButton onClick={goNext}>Mulai</ActionButton>}
    >
      <p className="max-w-xl text-lg font-semibold leading-8 text-[#6a7da0]">{lesson.subtitleId}</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {lesson.targetExpressions.map((expression) => <AppleVisual key={expression.id} state={expression.visual} compact />)}
      </div>
    </StepShell>
  );
}

function PahamState({ goNext }: { goNext: () => void }) {
  const [index, setIndex] = useState(0);
  const expression = lesson.targetExpressions[index];
  return (
    <StepShell
      step="paham"
      title="Perhatikan jumlahnya"
      primary={index === lesson.targetExpressions.length - 1 ? <ActionButton onClick={goNext}>Lanjut</ActionButton> : <ActionButton onClick={() => setIndex(index + 1)}>Lanjut</ActionButton>}
      secondary={index > 0 ? <ActionButton variant="secondary" onClick={() => setIndex(index - 1)}>Ulangi</ActionButton> : undefined}
    >
      <AppleVisual state={expression.visual} />
      <div className="mt-5 flex justify-center gap-2">
        {lesson.targetExpressions.map((item, itemIndex) => <span key={item.id} className={`h-2.5 w-2.5 rounded-full ${itemIndex === index ? 'bg-[#17366f]' : 'bg-[#d6e0f0]'}`} />)}
      </div>
    </StepShell>
  );
}

function DengarState({ goNext }: { goNext: () => void }) {
  const [index, setIndex] = useState(0);
  const expression = lesson.targetExpressions[index];
  return (
    <StepShell
      step="dengar"
      title="Ketuk untuk mendengar"
      primary={index === lesson.targetExpressions.length - 1 ? <ActionButton onClick={goNext}>Lanjut</ActionButton> : <ActionButton onClick={() => setIndex(index + 1)}>Lanjut</ActionButton>}
      secondary={index > 0 ? <ActionButton variant="secondary" onClick={() => setIndex(index - 1)}>Ulangi</ActionButton> : undefined}
    >
      <AppleVisual state={expression.visual} />
      <div className="mt-6 flex justify-center">
        <ChineseSpeechButton text={expression.ttsText} />
      </div>
    </StepShell>
  );
}

function LihatState({ goNext }: { goNext: () => void }) {
  const [index, setIndex] = useState(1);
  const expression = lesson.targetExpressions[index];
  return (
    <StepShell
      step="lihat"
      title="Lihat bentuknya"
      primary={index === lesson.targetExpressions.length - 1 ? <ActionButton onClick={goNext}>Lanjut</ActionButton> : <ActionButton onClick={() => setIndex(index + 1)}>Lanjut</ActionButton>}
      secondary={index > 0 ? <ActionButton variant="secondary" onClick={() => setIndex(index - 1)}>Ulangi</ActionButton> : undefined}
    >
      <ExpressionFocus expression={expression} />
    </StepShell>
  );
}

function UcapkanState({ goNext }: { goNext: () => void }) {
  const expression = getQuantityExpression(lesson.focusExpressionId) ?? lesson.targetExpressions[1];
  return (
    <StepShell
      step="ucapkan"
      title="Sekarang coba ucapkan"
      primary={<ActionButton onClick={goNext}>Lanjut</ActionButton>}
    >
      <ExpressionFocus expression={expression} />
      <div className="mx-auto mt-6 max-w-sm rounded-full bg-[#f4f7fc] px-4 py-3 text-center text-sm font-semibold text-[#6a7da0]">
        Dengarkan, tarik napas pelan, lalu tirukan.
      </div>
      <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-[#dfe8f7]">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-[#8fb1ea]" />
      </div>
      <div className="mt-5 flex justify-center"><ChineseSpeechButton text={expression.ttsText} label="Dengar lagi" /></div>
    </StepShell>
  );
}

function TemukanState({ goNext }: { goNext: () => void }) {
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(false);
  const missing = getQuantityExpressionByQuantity(lesson.temukan.missingQuantity) ?? lesson.targetExpressions[1];

  const choose = (choice: { correct: boolean }) => {
    if (choice.correct) setCorrect(true);
    else setAttempts((value) => value + 1);
  };

  return (
    <StepShell
      step="temukan"
      title={lesson.temukan.questionId}
      primary={correct ? <ActionButton onClick={goNext}>Lanjut</ActionButton> : undefined}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-[#f8fbff] p-4">
          <AppleVisual state={{ objectId: 'apple', quantity: 1 }} compact />
          <p className="mt-3 text-center text-3xl font-black text-[#17366f]">一个苹果</p>
        </div>
        <div className="rounded-[28px] bg-[#f8fbff] p-4 ring-2 ring-[#dfe8f7]">
          <AppleVisual state={{ objectId: 'apple', quantity: 2 }} compact />
          <p className="mt-3 text-center text-4xl font-black text-[#4f76bb]">?</p>
        </div>
        <div className="rounded-[28px] bg-[#f8fbff] p-4">
          <AppleVisual state={{ objectId: 'apple', quantity: 3 }} compact />
          <p className="mt-3 text-center text-3xl font-black text-[#17366f]">三个苹果</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {lesson.temukan.options.map((choice) => (
          <button key={choice.id} type="button" onClick={() => choose(choice)} className="min-h-14 rounded-2xl bg-white text-2xl font-black text-[#17366f] shadow-sm ring-1 ring-[#dfe8f7] transition active:scale-[0.99]">
            {choice.hanzi}
          </button>
        ))}
      </div>
      {correct ? <p className="mt-5 rounded-full bg-[#eef9f1] px-4 py-3 text-center font-bold text-[#39744c]">✓ {lesson.temukan.correctFeedbackId}</p> : null}
      {!correct && attempts === 1 ? <p className="mt-5 text-center font-semibold text-[#6a7da0]">{lesson.temukan.firstWrongFeedbackId}</p> : null}
      {!correct && attempts > 1 ? (
        <div className="mt-5 rounded-[24px] bg-[#f4f7fc] p-4 text-center">
          <p className="text-3xl font-black text-[#17366f]">{missing.hanzi}</p>
          <div className="mt-3"><PinyinAlignment tokens={missing.pinyinTokens} /></div>
          <div className="mt-4 flex justify-center"><ChineseSpeechButton text={missing.ttsText} /></div>
        </div>
      ) : null}
    </StepShell>
  );
}

function PakaiLine({ line, showIndonesian = true }: { line: ChinesePakaiLine; showIndonesian?: boolean }) {
  return (
    <article className="rounded-[26px] bg-[#f8fbff] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-4xl font-black leading-tight text-[#17366f]">{line.hanzi}</p>
          <div className="mt-3"><PinyinAlignment tokens={line.pinyinTokens} /></div>
          {showIndonesian ? <p className="mt-3 text-sm font-semibold text-[#7a8496]">{line.indonesian}</p> : null}
        </div>
        <ChineseSpeechButton text={line.ttsText} compact />
      </div>
    </article>
  );
}

function PakaiState({ goNext }: { goNext: () => void }) {
  const [picked, setPicked] = useState(false);
  return (
    <StepShell
      step="pakai"
      title="Pakai sebentar"
      primary={picked ? <ActionButton onClick={goNext}>Lanjut</ActionButton> : undefined}
    >
      <div className="grid gap-4">
        <PakaiLine line={lesson.pakai.question} />
        <div className="grid gap-3 sm:grid-cols-3">
          {lesson.targetExpressions.map((expression) => (
            <button key={expression.id} type="button" onClick={() => setPicked(expression.id === lesson.focusExpressionId)} className={`rounded-[26px] p-3 shadow-sm ring-1 transition active:scale-[0.99] ${picked && expression.id === lesson.focusExpressionId ? 'bg-[#eef9f1] ring-[#9ed6ad]' : 'bg-white ring-[#dfe8f7]'}`}>
              <AppleVisual state={expression.visual} compact />
            </button>
          ))}
        </div>
        {picked ? (
          <>
            <PakaiLine line={lesson.pakai.answer} />
            <PakaiLine line={lesson.pakai.response} />
          </>
        ) : null}
      </div>
    </StepShell>
  );
}

function AkuBisaState({ goNext }: { goNext: () => void }) {
  const [visualCorrect, setVisualCorrect] = useState(false);
  const [soundCorrect, setSoundCorrect] = useState(false);
  const soundExpression = getQuantityExpression(lesson.akuBisa.soundToMeaning.expressionId) ?? lesson.targetExpressions[1];

  return (
    <StepShell
      step="aku-bisa"
      title="Aku Bisa"
      primary={visualCorrect && soundCorrect ? <ActionButton onClick={goNext}>Lanjut</ActionButton> : undefined}
    >
      <div className="grid gap-5">
        <section className="rounded-[30px] bg-[#f8fbff] p-4">
          <AppleVisual state={{ objectId: 'apple', quantity: lesson.akuBisa.visualToHanzi.quantity }} compact />
          <p className="mt-4 text-center text-base font-bold text-[#6a7da0]">{lesson.akuBisa.visualToHanzi.questionId}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {lesson.akuBisa.visualToHanzi.options.map((choice) => (
              <button key={choice.id} type="button" onClick={() => setVisualCorrect(choice.correct)} className={`min-h-14 rounded-2xl text-2xl font-black shadow-sm ring-1 ${visualCorrect && choice.correct ? 'bg-[#eef9f1] text-[#39744c] ring-[#9ed6ad]' : 'bg-white text-[#17366f] ring-[#dfe8f7]'}`}>{choice.hanzi}</button>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] bg-[#f8fbff] p-4">
          <div className="flex items-center justify-center"><ChineseSpeechButton text={soundExpression.ttsText} /></div>
          <p className="mt-4 text-center text-base font-bold text-[#6a7da0]">{lesson.akuBisa.soundToMeaning.questionId}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {lesson.akuBisa.soundToMeaning.options.map((visual) => (
              <button key={`sound-${visual.quantity}`} type="button" onClick={() => setSoundCorrect(visual.quantity === 2)} className={`rounded-[26px] p-3 shadow-sm ring-1 ${soundCorrect && visual.quantity === 2 ? 'bg-[#eef9f1] ring-[#9ed6ad]' : 'bg-white ring-[#dfe8f7]'}`}>
                <AppleVisual state={visual} compact />
              </button>
            ))}
          </div>
        </section>
      </div>
    </StepShell>
  );
}

function CompletionState({ restart }: { restart: () => void }) {
  return (
    <StepShell
      step="completion"
      title="Hebat!"
      primary={<ActionButton onClick={restart}>Lanjut</ActionButton>}
      secondary={<ActionButton variant="secondary" onClick={restart}>Ulangi</ActionButton>}
    >
      <p className="text-lg font-semibold text-[#6a7da0]">Sekarang kamu sudah bisa:</p>
      <div className="mt-6 grid gap-3">
        {lesson.targetExpressions.map((expression) => (
          <div key={expression.id} className="flex items-center justify-between rounded-[24px] bg-[#f8fbff] px-4 py-3">
            <AppleVisual state={expression.visual} compact />
            <p className="text-3xl font-black text-[#17366f]">{expression.hanzi}</p>
            <span className="text-xl font-black text-[#39744c]">✓</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-lg font-bold text-[#17366f]">3 ungkapan Mandarin sudah kamu kuasai</p>
    </StepShell>
  );
}

export default function ChineseLearningExperience() {
  const [state, setState] = useState<ChineseLessonStateId>('entry');
  const stateOrder = useMemo(() => lesson.steps.map((item) => item.id), []);
  const goNext = () => {
    const currentIndex = stateOrder.indexOf(state);
    setState(stateOrder[Math.min(currentIndex + 1, stateOrder.length - 1)]);
  };
  const restart = () => setState('entry');

  if (state === 'entry') return <EntryState goNext={goNext} />;
  if (state === 'paham') return <PahamState goNext={goNext} />;
  if (state === 'dengar') return <DengarState goNext={goNext} />;
  if (state === 'lihat') return <LihatState goNext={goNext} />;
  if (state === 'ucapkan') return <UcapkanState goNext={goNext} />;
  if (state === 'temukan') return <TemukanState goNext={goNext} />;
  if (state === 'pakai') return <PakaiState goNext={goNext} />;
  if (state === 'aku-bisa') return <AkuBisaState goNext={goNext} />;
  return <CompletionState restart={restart} />;
}
