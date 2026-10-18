'use client';

import ChineseSpeechButton from '@/components/ChineseSpeechButton';
import type { MandarinSupplementalContentType, MandarinSupplementalExpressionV1 } from '@/lib/mandarin-course-import-types';

const sourceLabels: Record<MandarinSupplementalContentType, string> = {
  PUBLIC_HIGH_FREQUENCY: 'Kosakata Penting',
  PRACTICAL_SENTENCE: 'Kalimat Praktis',
  CAREER_SCENARIO: 'Situasi Singkat',
};

export default function MandarinV2ExpressionCard({
  expression,
  contentType,
  favorited,
  onFavorite,
}: {
  expression: MandarinSupplementalExpressionV1;
  contentType: MandarinSupplementalContentType;
  favorited: boolean;
  onFavorite: () => void;
}) {
  return <article className="min-w-0 rounded-3xl border border-[var(--ib-border-soft)] bg-white p-5 shadow-[var(--ib-shadow-card)]">
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--ib-primary)]">
      <span>{sourceLabels[contentType]}</span>
      <span aria-hidden>·</span>
      <span>Tingkat {expression.difficulty}</span>
    </div>
    <p lang="zh-CN" className="mt-4 break-words text-3xl font-bold leading-tight text-[var(--ib-primary-strong)]">{expression.chinese}</p>
    <p className="mt-2 break-words text-base font-semibold leading-7 text-[var(--ib-primary)]">{expression.pinyin}</p>
    <p lang="id" className="mt-2 text-sm leading-6 text-[var(--ib-text-secondary)]">{expression.indonesian}</p>
    <div className="mt-5 flex flex-wrap gap-2">
      <ChineseSpeechButton text={expression.ttsText} compact />
      <button type="button" onClick={onFavorite} aria-pressed={favorited} className="min-h-11 rounded-full border border-[var(--ib-border-soft)] bg-white px-4 text-xs font-bold text-[var(--ib-primary)] transition hover:bg-[var(--ib-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-primary)] focus-visible:ring-offset-2">{favorited ? '★ Tersimpan' : '☆ Simpan'}</button>
    </div>
  </article>;
}
