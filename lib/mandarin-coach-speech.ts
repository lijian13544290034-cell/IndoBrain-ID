export type CoachSpeechSegment = {
  language: 'zh-CN' | 'id-ID';
  text: string;
};

const han = /[\u3400-\u9FFF]/;

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
