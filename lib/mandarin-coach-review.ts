import type { CoachProfile, ExpressionMemory, UserInitiatedMemory } from '@/lib/mandarin-ai-coach';
import type { PersonalizationStateV1 } from '@/lib/mandarin-coach-personalization';
import type { MandarinCoachCurriculumExpression, MandarinCoachCurriculumLesson } from '@/lib/mandarin-coach-curriculum-types';

export type MandarinReviewReason = 'SAVED_FOR_REVIEW' | 'NEEDS_REVIEW' | 'DUE';
export type MandarinReviewStatus = 'PENDING' | 'DUE' | 'REVIEWED' | 'MASTERED';

export type MandarinReviewItem = {
  key: string;
  expressionId: string;
  lessonId: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  courseTitle: string;
  lessonTitle: string;
  day: number | null;
  reasons: MandarinReviewReason[];
  status: MandarinReviewStatus;
  reviewCount: number;
  nextReviewAt: string | null;
  href: '/learn-chinese/ai-coach';
};

export type MandarinCoachReviewSnapshot = {
  lesson: MandarinCoachCurriculumLesson;
  profile: CoachProfile;
};

type Draft = Omit<MandarinReviewItem, 'reasons' | 'status'> & {
  reasons: Set<MandarinReviewReason>;
  overallLevel: number | null;
};

function statusFor(item: Draft): MandarinReviewStatus {
  if (item.overallLevel === 4) return 'MASTERED';
  if (item.reasons.has('DUE')) return 'DUE';
  if (item.reviewCount > 0) return 'REVIEWED';
  return 'PENDING';
}

function canonicalDraft(
  lesson: MandarinCoachCurriculumLesson,
  expression: MandarinCoachCurriculumExpression,
  memory?: ExpressionMemory,
): Draft {
  return {
    key: `${lesson.id}:${expression.id}`,
    expressionId: expression.id,
    lessonId: lesson.id,
    chinese: expression.chinese,
    pinyin: expression.pinyin,
    indonesian: expression.indonesian,
    courseTitle: lesson.courseTitleId,
    lessonTitle: lesson.title,
    day: lesson.day,
    reasons: new Set<MandarinReviewReason>(),
    reviewCount: memory?.review_count ?? 0,
    nextReviewAt: null,
    overallLevel: null,
    href: '/learn-chinese/ai-coach',
  };
}

function userInitiatedDraft(lesson: MandarinCoachCurriculumLesson, memory: UserInitiatedMemory): Draft {
  return {
    key: `${lesson.id}:${memory.id}`,
    expressionId: memory.id,
    lessonId: lesson.id,
    chinese: memory.expression,
    pinyin: memory.pinyin,
    indonesian: memory.meaning_id,
    courseTitle: lesson.courseTitleId,
    lessonTitle: lesson.title,
    day: lesson.day,
    reasons: new Set<MandarinReviewReason>(),
    reviewCount: memory.review_count,
    nextReviewAt: null,
    overallLevel: memory.mastery_level,
    href: '/learn-chinese/ai-coach',
  };
}

export function resolveMandarinReviewItems(
  coachSnapshots: MandarinCoachReviewSnapshot[],
  personalization: PersonalizationStateV1 | null,
  now = new Date().toISOString(),
): MandarinReviewItem[] {
  const drafts = new Map<string, Draft>();
  const lessons = new Map(coachSnapshots.map(({ lesson }) => [lesson.id, lesson]));

  for (const { lesson, profile } of coachSnapshots) {
    const expressions = new Map(lesson.expressions.map((expression) => [expression.id, expression]));
    for (const memory of profile.expressions) {
      const expression = expressions.get(memory.expression_id);
      if (!expression) continue;
      const draft = canonicalDraft(lesson, expression, memory);
      if (memory.saved_for_review) draft.reasons.add('SAVED_FOR_REVIEW');
      if (memory.pronunciation_status === 'NEEDS_REVIEW') draft.reasons.add('NEEDS_REVIEW');
      if (draft.reasons.size > 0) drafts.set(draft.key, draft);
    }

    for (const memory of profile.learning.userInitiated) {
      if (!memory.saved_for_review && memory.pronunciation_status !== 'NEEDS_REVIEW') continue;
      const draft = userInitiatedDraft(lesson, memory);
      if (memory.saved_for_review) draft.reasons.add('SAVED_FOR_REVIEW');
      if (memory.pronunciation_status === 'NEEDS_REVIEW') draft.reasons.add('NEEDS_REVIEW');
      drafts.set(draft.key, draft);
    }
  }

  for (const mastery of Object.values(personalization?.mastery ?? {})) {
    const lesson = lessons.get(mastery.lessonId);
    const expression = lesson?.expressions.find((entry) => entry.id === mastery.expressionId);
    if (!lesson || !expression) continue;
    const key = `${lesson.id}:${expression.id}`;
    const draft = drafts.get(key) ?? canonicalDraft(lesson, expression);
    draft.overallLevel = mastery.overallLevel;
    draft.nextReviewAt = mastery.nextReviewAt;
    if (mastery.overallLevel < 4 && mastery.nextReviewAt <= now) draft.reasons.add('DUE');
    if (draft.reasons.size > 0) drafts.set(key, draft);
  }

  return [...drafts.values()]
    .filter((item) => item.reasons.size > 0)
    .map((item) => ({
      key: item.key,
      expressionId: item.expressionId,
      lessonId: item.lessonId,
      chinese: item.chinese,
      pinyin: item.pinyin,
      indonesian: item.indonesian,
      courseTitle: item.courseTitle,
      lessonTitle: item.lessonTitle,
      day: item.day,
      reasons: [...item.reasons],
      status: statusFor(item),
      reviewCount: item.reviewCount,
      nextReviewAt: item.nextReviewAt,
      href: item.href,
    }))
    .sort((a, b) => Number(b.status === 'DUE') - Number(a.status === 'DUE') || (a.day ?? 999) - (b.day ?? 999) || a.chinese.localeCompare(b.chinese, 'zh-CN'));
}
