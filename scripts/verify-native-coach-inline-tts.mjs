import assert from 'node:assert/strict';
import { splitInlineChinese } from '../lib/chinese-inline-fragments.ts';

const chinese = (value) => splitInlineChinese(value).filter((item) => item.kind === 'chinese').map((item) => item.text);

assert.deepEqual(chinese('Kalau bos bilang 明天早点来，artinya datang lebih pagi.'), ['明天早点来，']);
assert.deepEqual(chinese('分酒器'), ['分酒器']);
assert.deepEqual(chinese('明天早点来。'), ['明天早点来。']);
assert.deepEqual(chinese('你好！请问您要去哪里？'), ['你好！', '请问您要去哪里？']);
assert.deepEqual(chinese('Bisa bilang 可以 pakai QRIS? Jawab 不可以。'), ['可以', '不可以。']);
assert.deepEqual(chinese('Nǐ hǎo, jangan baca pinyin ini.'), []);

const longChinese = `这是一个很长的中文片段${'很长'.repeat(70)}。`;
const longChunks = chinese(longChinese);
assert.ok(longChunks.length > 1);
assert.ok(longChunks.every((item) => [...item].length <= 120));

const reconstructed = splitInlineChinese('Indo 你好！ lalu 谢谢。').map((item) => item.text).join('');
assert.equal(reconstructed, 'Indo 你好！ lalu 谢谢。');

console.log('NATIVE COACH INLINE TTS: PASS (mixed text, words, sentences, punctuation, multiple fragments, length limit)');
