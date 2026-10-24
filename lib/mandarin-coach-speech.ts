export type CoachSpeechSegment = {
  language: 'zh-CN' | 'id-ID';
  text: string;
};

const han = /[\u3400-\u9FFF]/;
const latin = /[A-Za-zÀ-ÖØ-öø-ÿ]/;

/**
 * zh-CN TTS 的服务端质量闸门：必须包含汉字，且不能混入印尼语、英文或拼音。
 * 数字与中英文标点可保留，因为它们可能是中文教学句的一部分。
 */
export function isValidatedSpokenChinese(value: string) {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > 0 && text.length <= 120 && han.test(text) && !latin.test(text);
}

export function buildExplicitChineseSpeechSegments(values: string[]) {
  const seen = new Set<string>();
  return values.flatMap((value) => {
    const text = value.replace(/\s+/g, ' ').trim();
    if (!isValidatedSpokenChinese(text) || seen.has(text)) return [];
    seen.add(text);
    return [{ language: 'zh-CN' as const, text }];
  }).slice(0, 8);
}

export function coachSpeechMetrics(segments: CoachSpeechSegment[]) {
  return {
    eligibleRequestCount: segments.length,
    billableCharacters: segments.reduce((sum, segment) => sum + segment.text.length, 0),
    chineseRequestCount: segments.filter((segment) => segment.language === 'zh-CN').length,
    nonChineseRequestCount: segments.filter((segment) => segment.language !== 'zh-CN').length,
  };
}

export function splitCoachSpeechText(value: string): CoachSpeechSegment[] {
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text) return [];
  const parts = text.match(/[\u3400-\u9FFF]+(?:[，。！？、；：]?)|[^\u3400-\u9FFF]+/g) ?? [];
  const segments: CoachSpeechSegment[] = [];
  for (const raw of parts) {
    const clean = raw.trim();
    if (!clean) continue;
    const language = han.test(clean) ? 'zh-CN' : 'id-ID';
    const previous = segments.at(-1);
    if (previous?.language === language) previous.text = `${previous.text} ${clean}`.replace(/\s+([，。！？、；：,.!?;:])/g, '$1');
    else segments.push({ language, text: clean });
  }
  return segments;
}

export function buildCoachSpeechSegments(input: {
  answer: string;
  chinese: string;
  indonesian: string;
  followUp: string;
}) {
  const blocks = [input.answer, input.chinese, input.indonesian, input.followUp]
    .map((value) => value.trim())
    .filter((value, index, values) => value && values.indexOf(value) === index);
  return blocks.flatMap(splitCoachSpeechText).slice(0, 12);
}
