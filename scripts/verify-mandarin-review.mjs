import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveMandarinReviewItems } from '../lib/mandarin-coach-review.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const now = '2026-10-18T12:00:00.000Z';

const expression = { id: 'EXP-01', chinese: '你好', pinyin: 'nǐ hǎo', indonesian: 'Halo', chunks: [], kind: 'CORE' };
const futureExpression = { ...expression, id: 'EXP-02', chinese: '谢谢', pinyin: 'xiè xie', indonesian: 'Terima kasih' };
const masteredExpression = { ...expression, id: 'EXP-03', chinese: '好的', pinyin: 'hǎo de', indonesian: 'Baik' };
const lesson = { id: 'lesson-1', source: 'MANDARIN_WORK_LEVEL_1', courseTitle: '30天工作中文', courseTitleId: '30 Hari Bisa Mandarin untuk Kerja', group: 'Dasar', day: 1, title: '第一次开口', scenario: 'greeting', expressions: [expression, futureExpression, masteredExpression], dialogue: [] };
const memory = (expression_id, overrides = {}) => ({ expression_id, chinese: '', pinyin: '', indonesian: '', attempts: 0, correct_count: 0, wrong_count: 0, pronunciation_status: 'NOT_STARTED', comprehension_status: 'NOT_STARTED', last_seen: null, mastery_level: 0, saved_for_review: false, review_count: 0, ...overrides });
const profile = {
  version: 4, course: lesson.courseTitleId, lessonId: lesson.id, currentDay: 1, sessionId: 'session-1', startedAt: now, updatedAt: now,
  expressions: [
    memory('EXP-01', { saved_for_review: true, pronunciation_status: 'NEEDS_REVIEW', review_count: 2 }),
    memory('EXP-02'),
    memory('EXP-03'),
  ],
  usage: { token_input: 0, token_output: 0, stt_seconds: 0, tts_calls: 0, model_calls: 0, estimated_ai_cost: 0 },
  conversation: { mode: 'GUIDED_TRAINING', summary: '', recentTurns: [], questions: [] },
  learning: { userLevel: 'BEGINNER', preferredExplanationLanguage: 'INDONESIAN', userInitiated: [] }, completed: false,
};
const personalization = {
  version: 1, profile: {}, completedLessonIds: [], plan: null,
  mastery: {
    'EXP-01': { expressionId: 'EXP-01', lessonId: lesson.id, dimensions: {}, overallLevel: 1, nextReviewAt: '2026-10-17T12:00:00.000Z', evidenceCount: 1 },
    'EXP-02': { expressionId: 'EXP-02', lessonId: lesson.id, dimensions: {}, overallLevel: 1, nextReviewAt: '2026-10-19T12:00:00.000Z', evidenceCount: 1 },
    'EXP-03': { expressionId: 'EXP-03', lessonId: lesson.id, dimensions: {}, overallLevel: 4, nextReviewAt: '2026-10-17T12:00:00.000Z', evidenceCount: 8 },
  },
};

assert.deepEqual(resolveMandarinReviewItems([], null, now), [], 'empty data must produce an empty review list');
const items = resolveMandarinReviewItems([{ lesson, profile }], personalization, now);
assert.equal(items.length, 1, 'future and mastered-only records must not enter the review queue');
assert.equal(items[0].expressionId, 'EXP-01');
assert.deepEqual(items[0].reasons, ['SAVED_FOR_REVIEW', 'NEEDS_REVIEW', 'DUE'], 'three real sources must deduplicate into one expression');
assert.equal(items[0].status, 'DUE');
assert.equal(items[0].reviewCount, 2, 'existing real review count must be preserved');

const needsOnly = resolveMandarinReviewItems([{ lesson, profile: { ...profile, expressions: [memory('EXP-02', { pronunciation_status: 'NEEDS_REVIEW' })] } }], null, now);
assert.equal(needsOnly[0].reasons[0], 'NEEDS_REVIEW');

const page = read('app/learn-chinese/review/page.tsx');
assert.match(page, /getMandarinLevel2Access\(\)/, 'review route must check server-side Level 2 access');
assert.match(page, /getMandarinCoachCurriculum\(levelTwoAccess\.state === 'authorized'\)/, 'restricted lessons must only be serialized after authorization');

const component = read('components/MandarinReview.tsx');
assert.match(component, /readMandarinLearningLocalSnapshot\(curriculum\.lessons\)/, 'review reads the existing scoped aggregate snapshot');
assert.match(component, /subscribeCoachProfile/, 'review reacts to real coach profile updates');
assert.match(component, /subscribePersonalization/, 'review reacts to mastery schedule updates');
assert.doesNotMatch(component, /saveCoachProfile|savePersonalizationState|review_count\s*\+|reviewCount\s*\+/, 'viewing review must not manufacture review evidence');

const boundary = read('components/MandarinLearningScopeBoundary.tsx');
assert.match(boundary, /activeScope !== scope/, 'account changes must remount review under the verified scope');
const navigation = read('components/MandarinLearningNavigation.tsx');
assert.match(navigation, /href: '\/learn-chinese\/review'/, 'Ulasan navigation must be live');
const home = read('components/MandarinLearningHome.tsx');
assert.match(home, /href="\/learn-chinese\/review"/, 'home must link to the real review page');

console.log('Mandarin review verification PASS');
