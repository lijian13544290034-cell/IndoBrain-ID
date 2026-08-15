'use client';

import { useState, type ReactNode } from 'react';
import HarvestSection from '@/components/HarvestSection';
import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';
import type { GoldenSceneContent } from '@/lib/golden-scenes';

function SectionCard({ title, children, tone = 'stone' }: { title: string; children: ReactNode; tone?: 'stone' | 'blue' }) {
  return (
    <section className={`rounded-2xl border px-5 py-5 shadow-sm ${tone === 'blue' ? 'border-blue-100 bg-blue-50/70' : 'border-stone-200 bg-stone-50'}`}>
      <p className="text-xs font-medium text-stone-400">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SentenceBlock({ indonesian, chinese, speaker }: { indonesian: string; chinese: string; speaker?: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
      {speaker && <p className="text-xs font-medium text-blue-700">{speaker}</p>}
      <p className={`text-[15px] leading-7 text-stone-800 ${speaker ? 'mt-2' : ''}`}>{indonesian}</p>
      <IndonesianSpeechButton text={indonesian} />
      <p className="mt-2 text-sm leading-6 text-stone-500">{chinese}</p>
    </div>
  );
}

function ReplyBlock({ indonesian, chinese }: { indonesian: string; chinese: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[15px] leading-7 text-stone-800">{indonesian}</p>
      <IndonesianSpeechButton text={indonesian} />
      <p className="mt-2 text-sm leading-6 text-stone-500">{chinese}</p>
    </div>
  );
}

export default function GoldenSceneTemplate({ content, harvest }: { content: GoldenSceneContent; harvest: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const replies = expanded ? content.replies : content.replies.slice(0, 3);

  return (
    <div className="mt-6 space-y-4">
      <SectionCard title="场景任务">
        <p className="text-sm leading-6 text-stone-700">{content.situation}</p>
      </SectionCard>

      {content.goal && (
        <SectionCard title="通关目标" tone="blue">
          <p className="text-sm leading-6 text-blue-900">{content.goal}</p>
        </SectionCard>
      )}

      <SectionCard title="核心微对话">
        <div className="space-y-3">
          {content.dialogue.map((line) => (
            <SentenceBlock key={`${line.speaker}-${line.indonesian}`} speaker={line.speaker} indonesian={line.indonesian} chinese={line.chinese} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="对方还可能这样回答">
        <div className="space-y-3">
          {replies.map((reply) => (
            <ReplyBlock key={reply.indonesian} indonesian={reply.indonesian} chinese={reply.chinese} />
          ))}
        </div>
        {content.replies.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="mt-4 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition duration-200 hover:bg-blue-50"
          >
            {expanded ? '收起回答' : `展开更多回答（${content.replies.length - 3}）`}
          </button>
        )}
      </SectionCard>

      <SectionCard title="换一个词，你马上还能说">
        <div className="grid gap-3 sm:grid-cols-2">
          {content.variations.map((variation) => (
            <div key={variation.indonesian} className="rounded-xl border border-blue-100 bg-white px-4 py-4 shadow-sm">
              <p className="text-[15px] leading-7 text-stone-800">{variation.indonesian}</p>
              <IndonesianSpeechButton text={variation.indonesian} />
              <p className="mt-2 text-sm leading-6 text-stone-500">{variation.chinese}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {content.decisions?.map((decision) => (
        <SectionCard key={decision.situation} title="你来决定下一步">
          <p className="mb-3 text-sm leading-6 text-stone-600">{decision.situation}</p>
          <div className="space-y-3">
            {decision.options.map((option) => (
              <ReplyBlock key={option.indonesian} indonesian={option.indonesian} chinese={option.chinese} />
            ))}
          </div>
        </SectionCard>
      ))}

      <HarvestSection harvest={harvest} />

      {content.localUsage && (
        <SectionCard title="当地人更常这样说">
          <p className="text-sm leading-6 text-stone-700">{content.localUsage.indonesian}</p>
          <p className="mt-2 text-sm leading-6 text-stone-500">{content.localUsage.chinese}</p>
        </SectionCard>
      )}

      {content.easyMistake && (
        <SectionCard title="中国人容易说错">
          <p className="text-sm leading-6 text-stone-700">{content.easyMistake.indonesian}</p>
          <p className="mt-2 text-sm leading-6 text-stone-500">{content.easyMistake.chinese}</p>
        </SectionCard>
      )}

      <SectionCard title="今天试着说一次" tone="blue">
        <div className="rounded-xl border border-blue-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[15px] leading-7 text-stone-800">{content.trySay.indonesian}</p>
          <IndonesianSpeechButton text={content.trySay.indonesian} />
          <p className="mt-2 text-sm leading-6 text-stone-500">{content.trySay.chinese}</p>
        </div>
      </SectionCard>
    </div>
  );
}
