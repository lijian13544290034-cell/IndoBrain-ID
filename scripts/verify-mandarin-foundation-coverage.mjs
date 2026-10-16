import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const sourcePath = path.join(root, 'lib/mandarin-work-course.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: sourcePath });
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mandarin-foundation-'));
fs.writeFileSync(path.join(temporary, 'course.js'), output.outputText);
const course = createRequire(import.meta.url)(path.join(temporary, 'course.js'));
fs.rmSync(temporary, { recursive: true, force: true });

const normalize = (value) => value.replace(/[？?。！!，,、…\s]/g, '');
const items = course.allMandarinWorkItems();
const itemIds = new Set(items.map((item) => item.id));
assert.equal(itemIds.size, items.length, 'all Level 1 item IDs must remain unique');

const additionsByDay = new Map([
  [1, ['我们', '请', '不客气']],
  [7, ['十一', '二十', '二十一', '五十', '一百', '分钟', '上午', '下午']],
  [8, ['前面', '后面']],
  [9, ['是', '不是']],
  [14, ['对不起', '不好意思', '请帮我']],
]);
const expectedPinyin = new Map([
  ['我们', 'wǒ men'], ['请', 'qǐng'], ['不客气', 'bú kè qi'],
  ['十一', 'shí yī'], ['二十', 'èr shí'], ['二十一', 'èr shí yī'], ['五十', 'wǔ shí'], ['一百', 'yì bǎi'],
  ['分钟', 'fēn zhōng'], ['上午', 'shàng wǔ'], ['下午', 'xià wǔ'],
  ['前面', 'qián miàn'], ['后面', 'hòu miàn'], ['是', 'shì'], ['不是', 'bú shì'],
  ['对不起', 'duì bu qǐ'], ['不好意思', 'bù hǎo yì si'], ['请帮我', 'qǐng bāng wǒ'],
]);

let additionCount = 0;
for (const [day, expressions] of additionsByDay) {
  const dayItems = course.mandarinWorkDays[day - 1].items;
  for (const chinese of expressions) {
    const matches = dayItems.filter((item) => normalize(item.chinese) === chinese);
    assert.equal(matches.length, 1, `Day ${day} must contain ${chinese} exactly once`);
    const [item] = matches;
    assert.equal(item.pinyinSegments.map((segment) => segment.pinyin).join(' '), expectedPinyin.get(chinese), `${chinese} pinyin mismatch`);
    assert(item.indonesian?.trim(), `${chinese} must have an Indonesian explanation`);
    assert.equal(item.audioText, item.chinese, `${chinese} must keep zh-CN TTS text aligned`);
    additionCount += 1;
  }
}
assert.equal(additionCount, 18, 'Batch 3 must add exactly 18 foundation expressions');

// Appending foundation items must not renumber established course records.
for (const [day, chinese, id] of [
  [1, '你好', 'CN-WORK-D01-I01'], [1, '再见', 'CN-WORK-D01-I07'],
  [7, '点', 'CN-WORK-D07-I01'], [7, '十个', 'CN-WORK-D07-I07'],
  [14, '不懂', 'CN-WORK-D14-I01'], [14, '懂了', 'CN-WORK-D14-I06'],
  [30, '拿这个', 'CN-WORK-D30-D01'],
]) {
  const found = items.find((item) => item.day === day && normalize(item.chinese) === chinese && item.id === id);
  assert(found, `existing canonical ID changed: ${id} ${chinese}`);
}

for (const day of [1, 7, 14, 30]) {
  const lesson = course.mandarinWorkDays[day - 1];
  assert(lesson.items.length || lesson.dialogue.length, `Day ${day} must remain available`);
  for (const item of [...lesson.items, ...lesson.dialogue.map((turn) => turn.item)]) {
    assert.equal(item.pinyinSegments.map((segment) => segment.hanzi).join(''), normalize(item.chinese), `Day ${day} Chinese/pinyin alignment failed for ${item.id}`);
    assert(item.pinyinSegments.every((segment) => segment.pinyin), `Day ${day} missing pinyin for ${item.id}`);
    assert(item.indonesian, `Day ${day} missing Indonesian for ${item.id}`);
  }
}

const levelTwo = fs.readFileSync(path.join(root, 'lib/server/mandarin-work-level2.ts'), 'utf8');
assert.match(levelTwo, /day\(31,/);
assert.match(levelTwo, /day\(60,/);
assert.match(levelTwo, /classification: 'UNKNOWN_INPUT'/);
const adapter = fs.readFileSync(path.join(root, 'lib/server/mandarin-coach-curriculum.ts'), 'utf8');
assert.match(adapter, /\.\.\.lesson\.items\.map/);
assert.match(adapter, /pinyin: item\.pinyinSegments\.map/);
assert.match(adapter, /indonesian: item\.indonesian/);
const tts = fs.readFileSync(path.join(root, 'lib/chinese-tts-provider.ts'), 'utf8');
assert.match(tts, /zh-CN-XiaoxiaoNeural/);
assert.doesNotMatch(tts, /zh-TW|zh-HK|Cantonese/i);

console.log('MANDARIN FOUNDATION COVERAGE: PASS (18 additions across Days 1, 7, 8, 9, 14; established IDs stable; AI Coach adapter and zh-CN TTS preserved)');
