export type BrowserVoiceLike = Pick<SpeechSynthesisVoice, 'lang' | 'name'>;

export function isIndonesianVoice(voice: BrowserVoiceLike) {
  const lang = voice.lang.toLowerCase();
  return lang === 'id-id' || lang.startsWith('id') || /indones/i.test(`${voice.name} ${voice.lang}`);
}
