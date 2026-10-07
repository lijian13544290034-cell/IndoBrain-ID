import 'server-only';

import { chineseGoldenLessonJumlah } from '@/lib/chinese-learning';
import { mandarinWorkDays } from '@/lib/mandarin-work-course';
import type { MandarinCoachCatalogEntry, MandarinCoachCurriculumExpression, MandarinCoachCurriculumLesson, MandarinCoachCurriculumPayload } from '@/lib/mandarin-coach-curriculum-types';
import { mandarinWorkLevel2Days } from '@/lib/server/mandarin-work-level2';

const normalizeChinese = (value: string) => value.replace(/[？?。！!，,、…\s]/g, '');

function uniqueExpressions(values: MandarinCoachCurriculumExpression[]) {
  const seen = new Set<string>();
  return values.filter((item) => {
    const key = normalizeChinese(item.chinese);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function levelOneLessons(): MandarinCoachCurriculumLesson[] {
  return mandarinWorkDays.map((lesson) => ({
    id: `mandarin-work-level-1-day-${lesson.day}`,
    source: 'MANDARIN_WORK_LEVEL_1',
    courseTitle: '30天工作中文',
    courseTitleId: '30 Hari Bisa Mandarin untuk Kerja',
    group: lesson.day <= 10 ? 'Dasar kerja' : lesson.day <= 20 ? 'Komunikasi kerja' : 'Situasi kerja lengkap',
    day: lesson.day,
    title: lesson.title,
    scenario: lesson.scenario,
    expressions: uniqueExpressions([
      ...lesson.items.map((item) => ({
        id: item.id,
        chinese: item.chinese,
        pinyin: item.pinyinSegments.map((segment) => segment.pinyin).join(' '),
        indonesian: item.indonesian,
        chunks: item.pinyinSegments.map((segment) => ({ chinese: segment.hanzi, pinyin: segment.pinyin })),
        kind: item.itemType,
      } satisfies MandarinCoachCurriculumExpression)),
      ...lesson.dialogue.map((turn) => ({
        id: turn.item.id,
        chinese: turn.item.chinese,
        pinyin: turn.item.pinyinSegments.map((segment) => segment.pinyin).join(' '),
        indonesian: turn.item.indonesian,
        chunks: turn.item.pinyinSegments.map((segment) => ({ chinese: segment.hanzi, pinyin: segment.pinyin })),
        kind: 'DIALOGUE' as const,
      })),
    ]),
    dialogue: lesson.dialogue.map((turn) => ({
      role: turn.role,
      chinese: turn.item.chinese,
      pinyin: turn.item.pinyinSegments.map((segment) => segment.pinyin).join(' '),
    })),
  }));
}

function levelTwoLessons(): MandarinCoachCurriculumLesson[] {
  return mandarinWorkLevel2Days.map((lesson) => ({
    id: `mandarin-work-level-2-day-${lesson.day}`,
    source: 'MANDARIN_WORK_LEVEL_2',
    courseTitle: '工作中文进阶',
    courseTitleId: 'Mandarin untuk Kerja — Level 2',
    group: lesson.module === 'boss-listening' ? 'Dengar Bos Tiongkok' : lesson.module === 'problem-solving' ? 'Selesaikan Masalah Kerja' : 'Mandarin untuk Proyek Konstruksi',
    day: lesson.day,
    title: lesson.title,
    scenario: lesson.module,
    expressions: uniqueExpressions([
      ...lesson.items.map((item) => ({
        id: item.id,
        chinese: item.chinese,
        pinyin: item.pinyin,
        indonesian: item.indonesian,
        chunks: [{ chinese: item.chinese, pinyin: item.pinyin }],
        kind: item.kind ?? 'CORE',
      } satisfies MandarinCoachCurriculumExpression)),
      ...lesson.recognition.map((item, index) => ({
        id: `CN-WORK-L2-D${lesson.day}-LISTEN-${String(index + 1).padStart(2, '0')}`,
        chinese: item.chinese,
        pinyin: item.pinyin,
        indonesian: '',
        chunks: [{ chinese: item.chinese, pinyin: item.pinyin }],
        kind: 'LISTENING' as const,
      })),
      ...lesson.dialogue.map((turn, index) => ({
        id: `CN-WORK-L2-D${lesson.day}-DIALOGUE-${String(index + 1).padStart(2, '0')}`,
        chinese: turn.chinese,
        pinyin: turn.pinyin,
        indonesian: '',
        chunks: [{ chinese: turn.chinese, pinyin: turn.pinyin }],
        kind: 'DIALOGUE' as const,
      })),
    ]),
    dialogue: lesson.dialogue.map((turn) => ({ role: turn.role, chinese: turn.chinese, pinyin: turn.pinyin })),
  }));
}

function quantityLesson(): MandarinCoachCurriculumLesson {
  const lesson = chineseGoldenLessonJumlah;
  const expressions = [
    ...lesson.targetExpressions.map((item) => ({
      id: `GOLDEN-JUMLAH-${item.id}`,
      chinese: item.hanzi,
      pinyin: item.pinyinTokens.map((token) => token.display).join(' '),
      indonesian: item.indonesian,
      chunks: item.pinyinTokens.map((token) => ({ chinese: token.hanzi, pinyin: token.display })),
      kind: 'CORE' as const,
    })),
    ...Object.values(lesson.pakai).map((item) => ({
      id: `GOLDEN-JUMLAH-${item.id}`,
      chinese: item.hanzi,
      pinyin: item.pinyinTokens.map((token) => token.display).join(' '),
      indonesian: item.indonesian,
      chunks: item.pinyinTokens.map((token) => ({ chinese: token.hanzi, pinyin: token.display })),
      kind: 'DIALOGUE' as const,
    })),
  ];
  return {
    id: 'golden-quantity-jumlah',
    source: 'GOLDEN_QUANTITY',
    courseTitle: '中文数量专题',
    courseTitleId: lesson.titleId,
    group: '专题 / Topik',
    day: null,
    title: lesson.titleId,
    scenario: lesson.subtitleId,
    expressions: uniqueExpressions(expressions),
    dialogue: Object.values(lesson.pakai).map((item) => ({ role: '练习', chinese: item.hanzi, pinyin: item.pinyinTokens.map((token) => token.display).join(' ') })),
  };
}

const levelOne = levelOneLessons();
const levelTwo = levelTwoLessons();
const topics = [quantityLesson()];
const allLessons = [...levelOne, ...levelTwo, ...topics];

function toCatalog(lesson: MandarinCoachCurriculumLesson, locked: boolean): MandarinCoachCatalogEntry {
  return {
    id: lesson.id,
    source: lesson.source,
    courseTitle: lesson.courseTitle,
    courseTitleId: lesson.courseTitleId,
    group: lesson.group,
    day: lesson.day,
    title: lesson.title,
    scenario: lesson.scenario,
    expressionCount: lesson.expressions.length,
    locked,
  };
}

export function getMandarinCoachCurriculum(levelTwoAuthorized: boolean): MandarinCoachCurriculumPayload {
  const availableLessons = levelTwoAuthorized ? allLessons : [...levelOne, ...topics];
  return {
    catalog: allLessons.map((lesson) => toCatalog(lesson, lesson.source === 'MANDARIN_WORK_LEVEL_2' && !levelTwoAuthorized)),
    lessons: availableLessons,
    inventory: {
      direction: 'INDONESIAN_TO_MANDARIN',
      courses: 2,
      days: 60,
      topics: topics.length,
      lessons: allLessons.length,
      expressions: allLessons.reduce((sum, lesson) => sum + lesson.expressions.length, 0),
    },
  };
}

export function getMandarinCoachLesson(lessonId: string) {
  return allLessons.find((lesson) => lesson.id === lessonId) ?? null;
}

export function getMandarinCoachExpression(expressionId: string) {
  for (const lesson of allLessons) {
    const expression = lesson.expressions.find((item) => item.id === expressionId);
    if (expression) return { lesson, expression };
  }
  return null;
}

export function isLevelTwoCoachLesson(lessonId: string) {
  return getMandarinCoachLesson(lessonId)?.source === 'MANDARIN_WORK_LEVEL_2';
}
