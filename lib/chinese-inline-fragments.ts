export type InlineTextFragment = {
  kind: 'text' | 'chinese';
  text: string;
};

const CHINESE_BLOCK = /[\u3400-\u9FFF](?:[\u3400-\u9FFF0-9\u3000 ，。！？、；：“”‘’（）…—-]*[\u3400-\u9FFF0-9，。！？、；：“”‘’（）…])?/gu;
const CHINESE_SENTENCE = /[^。！？；]+[。！？；]?/gu;
const MAX_TTS_CHARACTERS = 120;

function chunkChinese(value: string) {
  const sentences = value.match(CHINESE_SENTENCE) ?? [value];
  return sentences.flatMap((sentence) => {
    const characters = [...sentence];
    if (characters.length <= MAX_TTS_CHARACTERS) return [sentence];
    const chunks: string[] = [];
    for (let index = 0; index < characters.length; index += MAX_TTS_CHARACTERS) {
      chunks.push(characters.slice(index, index + MAX_TTS_CHARACTERS).join(''));
    }
    return chunks;
  }).filter(Boolean);
}

/**
 * Preserves the original answer text while marking only explicit Han text as
 * clickable. Indonesian, English and pinyin never enter a Chinese fragment.
 */
export function splitInlineChinese(value: string): InlineTextFragment[] {
  const fragments: InlineTextFragment[] = [];
  let cursor = 0;
  for (const match of value.matchAll(CHINESE_BLOCK)) {
    const index = match.index ?? 0;
    if (index > cursor) fragments.push({ kind: 'text', text: value.slice(cursor, index) });
    for (const text of chunkChinese(match[0])) fragments.push({ kind: 'chinese', text });
    cursor = index + match[0].length;
  }
  if (cursor < value.length) fragments.push({ kind: 'text', text: value.slice(cursor) });
  return fragments.length ? fragments : [{ kind: 'text', text: value }];
}
