import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

export const normalizeMandarinChinese = (value) => String(value ?? '').replace(/[？?。！!，,、…；;：:\s]/gu, '');

function loadTypeScriptModule(root, relativePath, stripServerOnly = false) {
  const sourcePath = path.join(root, relativePath);
  let source = fs.readFileSync(sourcePath, 'utf8');
  if (stripServerOnly) source = source.replace("import 'server-only';", '');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: sourcePath,
  }).outputText;
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'indobrain-course-audit-'));
  const outputPath = path.join(temporary, 'module.cjs');
  fs.writeFileSync(outputPath, output);
  try {
    return createRequire(import.meta.url)(outputPath);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

function uniqueByChinese(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeMandarinChinese(item.chinese);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function loadMandarinCourseInventory(root = process.cwd()) {
  const levelOneModule = loadTypeScriptModule(root, 'lib/mandarin-work-course.ts');
  const levelTwoModule = loadTypeScriptModule(root, 'lib/server/mandarin-work-level2.ts', true);
  const goldenModule = loadTypeScriptModule(root, 'lib/chinese-learning.ts');
  const levelOneDays = levelOneModule.mandarinWorkDays;
  const levelTwoDays = levelTwoModule.mandarinWorkLevel2Days;
  const levelOneRaw = levelOneModule.allMandarinWorkItems();

  const levelOneCoach = levelOneDays.flatMap((lesson) => uniqueByChinese([
    ...lesson.items.map((item) => ({ id: item.id, chinese: item.chinese, pinyin: item.pinyinSegments.map((segment) => segment.pinyin).join(' '), indonesian: item.indonesian, lessonId: `mandarin-work-level-1-day-${lesson.day}`, day: lesson.day, source: 'MANDARIN_WORK_LEVEL_1' })),
    ...lesson.dialogue.map((turn) => ({ id: turn.item.id, chinese: turn.item.chinese, pinyin: turn.item.pinyinSegments.map((segment) => segment.pinyin).join(' '), indonesian: turn.item.indonesian, lessonId: `mandarin-work-level-1-day-${lesson.day}`, day: lesson.day, source: 'MANDARIN_WORK_LEVEL_1' })),
  ]));

  const levelTwoRawItems = levelTwoDays.flatMap((lesson) => lesson.items);
  const levelTwoRecognition = levelTwoDays.flatMap((lesson) => lesson.recognition);
  const levelTwoDialogue = levelTwoDays.flatMap((lesson) => lesson.dialogue);
  const levelTwoCoach = levelTwoDays.flatMap((lesson) => uniqueByChinese([
    ...lesson.items.map((item) => ({ id: item.id, chinese: item.chinese, pinyin: item.pinyin, indonesian: item.indonesian, lessonId: `mandarin-work-level-2-day-${lesson.day}`, day: lesson.day, source: 'MANDARIN_WORK_LEVEL_2' })),
    ...lesson.recognition.map((item, index) => ({ id: `CN-WORK-L2-D${lesson.day}-LISTEN-${String(index + 1).padStart(2, '0')}`, chinese: item.chinese, pinyin: item.pinyin, indonesian: '', lessonId: `mandarin-work-level-2-day-${lesson.day}`, day: lesson.day, source: 'MANDARIN_WORK_LEVEL_2' })),
    ...lesson.dialogue.map((turn, index) => ({ id: `CN-WORK-L2-D${lesson.day}-DIALOGUE-${String(index + 1).padStart(2, '0')}`, chinese: turn.chinese, pinyin: turn.pinyin, indonesian: '', lessonId: `mandarin-work-level-2-day-${lesson.day}`, day: lesson.day, source: 'MANDARIN_WORK_LEVEL_2' })),
  ]));

  const golden = goldenModule.chineseGoldenLessonJumlah;
  const goldenCoach = uniqueByChinese([
    ...golden.targetExpressions.map((item) => ({ id: `GOLDEN-JUMLAH-${item.id}`, chinese: item.hanzi, pinyin: item.pinyinTokens.map((token) => token.display).join(' '), indonesian: item.indonesian, lessonId: 'golden-quantity-jumlah', day: null, source: 'GOLDEN_QUANTITY' })),
    ...Object.values(golden.pakai).map((item) => ({ id: `GOLDEN-JUMLAH-${item.id}`, chinese: item.hanzi, pinyin: item.pinyinTokens.map((token) => token.display).join(' '), indonesian: item.indonesian, lessonId: 'golden-quantity-jumlah', day: null, source: 'GOLDEN_QUANTITY' })),
  ]);

  const dayCoachExpressions = [...levelOneCoach, ...levelTwoCoach];
  const allKnownExpressions = [...dayCoachExpressions, ...goldenCoach];
  const coreWordIds = new Set(levelOneRaw.flatMap((item) => item.coreWordIds));
  const foundationExpressions = new Set(levelOneCoach.filter((item) => item.day <= 14).map((item) => normalizeMandarinChinese(item.chinese)));
  const scenarioKeys = new Set([...levelOneDays.map((day) => day.scenario), ...levelTwoDays.map((day) => day.module)]);
  const knownLessonIds = new Set([
    ...levelOneDays.map((day) => `mandarin-work-level-1-day-${day.day}`),
    ...levelTwoDays.map((day) => `mandarin-work-level-2-day-${day.day}`),
    'golden-quantity-jumlah',
  ]);

  return {
    counts: {
      dayCourses: 2,
      dayLessons: levelOneDays.length + levelTwoDays.length,
      levelOneDays: levelOneDays.length,
      levelTwoDays: levelTwoDays.length,
      levelOneRawRecords: levelOneRaw.length,
      levelOneCoachExpressions: levelOneCoach.length,
      levelTwoItemRecords: levelTwoRawItems.length,
      levelTwoRecognitionRecords: levelTwoRecognition.length,
      levelTwoDialogueRecords: levelTwoDialogue.length,
      levelTwoCoachExpressions: levelTwoCoach.length,
      dayCoachExpressions: dayCoachExpressions.length,
      uniqueDayChinese: new Set(dayCoachExpressions.map((item) => normalizeMandarinChinese(item.chinese))).size,
      levelOneCoreWords: coreWordIds.size,
      foundationExpressionsDays1To14: foundationExpressions.size,
      occupationalDayScenes: levelOneDays.length + levelTwoDays.length,
      distinctScenarioKeys: scenarioKeys.size,
      goldenTopics: 1,
      goldenCoachExpressions: goldenCoach.length,
      allCoachLessonsIncludingTopics: knownLessonIds.size,
      allCoachExpressionsIncludingTopics: allKnownExpressions.length,
    },
    scenarios: {
      levelOne: levelOneDays.map((day) => ({ day: day.day, key: day.scenario, title: day.title })),
      levelTwoModules: Object.entries(levelTwoDays.reduce((result, day) => ({ ...result, [day.module]: (result[day.module] ?? 0) + 1 }), {})).map(([key, days]) => ({ key, days })),
    },
    knownExpressionIds: new Set(allKnownExpressions.map((item) => item.id)),
    knownChinese: new Set(allKnownExpressions.map((item) => normalizeMandarinChinese(item.chinese))),
    knownLessonIds,
    allKnownExpressions,
  };
}
