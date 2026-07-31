export type TtsLanguage = 'indonesian' | 'chinese';
export type TtsAudio = { audio: Uint8Array; voice: string; language: string };

export type TtsProvider = {
  configured: boolean;
  voice: string | null;
  language: string | null;
  synthesize: (text: string) => Promise<TtsAudio>;
};

export const azureSpeechConfig: Record<TtsLanguage, { language: string; voice: string }> = {
  indonesian: { language: 'id-ID', voice: 'id-ID-GadisNeural' },
  chinese: { language: 'zh-CN', voice: 'zh-CN-XiaoxiaoNeural' },
};

function escapeXml(text: string) {
  return text.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);
}

export function getTtsProvider(type: TtsLanguage = 'indonesian'): TtsProvider {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  const configured = Boolean(key && region);
  const speech = azureSpeechConfig[type];
  return {
    configured,
    voice: configured ? speech.voice : null,
    language: configured ? speech.language : null,
    async synthesize(text: string) {
      if (!configured || !key || !region) throw new Error('TTS provider is not configured');
      const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3', 'User-Agent': 'IndoBrain' },
        body: `<speak version="1.0" xml:lang="${speech.language}"><voice name="${speech.voice}">${escapeXml(text)}</voice></speak>`,
      });
      if (!response.ok) throw new Error('TTS provider request failed');
      return { audio: new Uint8Array(await response.arrayBuffer()), voice: speech.voice, language: speech.language };
    },
  };
}
