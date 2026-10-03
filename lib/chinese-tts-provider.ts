export type ChineseTtsAudio = { audio: Uint8Array; voice: string };

export type ChineseTtsProvider = {
  configured: boolean;
  voice: string | null;
  synthesize: (text: string, rate?: ChineseTtsRate) => Promise<ChineseTtsAudio>;
};

export const chineseTtsVoice = 'zh-CN-XiaoxiaoNeural';
export const chineseTtsRate = '-15%';
export const chineseTtsSlowRate = '-35%';
export type ChineseTtsRate = 'normal' | 'slow';

export function resolveChineseTtsRate(rate: ChineseTtsRate) {
  return rate === 'slow' ? chineseTtsSlowRate : chineseTtsRate;
}

function escapeXml(text: string) {
  return text.replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);
}

export function getChineseTtsProvider(): ChineseTtsProvider {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  const configured = Boolean(key && region);
  return {
    configured,
    voice: configured ? chineseTtsVoice : null,
    async synthesize(text: string, rate: ChineseTtsRate = 'normal') {
      if (!configured || !key || !region) throw new Error('Chinese TTS provider is not configured');
      const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
          'User-Agent': 'IndoBrain Chinese Learning',
        },
        body: `<speak version="1.0" xml:lang="zh-CN"><voice name="${chineseTtsVoice}"><prosody rate="${resolveChineseTtsRate(rate)}">${escapeXml(text)}</prosody></voice></speak>`,
      });
      if (!response.ok) throw new Error('Chinese TTS provider request failed');
      return { audio: new Uint8Array(await response.arrayBuffer()), voice: chineseTtsVoice };
    },
  };
}
