import { createHash } from 'node:crypto';

const DEFAULT_VOICE = 'id-ID-GadisNeural';
const APPROVED_VOICES = new Set([DEFAULT_VOICE, 'id-ID-ArdiNeural']);
const MAX_TEXT_LENGTH = 500;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

type CachedAudio = { audio: ArrayBuffer; expiresAt: number };

// Best-effort cache for warm serverless instances. It never stores credentials.
const audioCache = new Map<string, CachedAudio>();

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  })[character] ?? character);
}

function getCachedAudio(key: string) {
  const cached = audioCache.get(key);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    audioCache.delete(key);
    return undefined;
  }
  return cached.audio;
}

export async function POST(request: Request) {
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!azureKey || !region || !/^[a-z0-9-]+$/i.test(region)) {
    return jsonError('Speech is unavailable.', 503);
  }

  let payload: { text?: unknown; voice?: unknown };
  try {
    payload = await request.json() as { text?: unknown; voice?: unknown };
  } catch {
    return jsonError('Invalid request.', 400);
  }

  const text = payload.text;
  const voice = payload.voice ?? DEFAULT_VOICE;
  if (typeof text !== 'string' || !text.trim()) return jsonError('Indonesian text is required.', 400);
  if (text.length > MAX_TEXT_LENGTH) return jsonError('Text is too long.', 400);
  if (typeof voice !== 'string' || !APPROVED_VOICES.has(voice)) return jsonError('Unsupported voice.', 400);
  // Chinese and phonetic helper text must never be passed to speech synthesis.
  if (/[\u3400-\u9FFF]/.test(text)) return jsonError('Indonesian text is required.', 400);

  const normalizedText = text.trim();
  const cacheKey = createHash('sha256').update(`${voice}:${normalizedText}`).digest('hex');
  let audio = getCachedAudio(cacheKey);

  try {
    if (!audio) {
      const ssml = `<speak version="1.0" xml:lang="id-ID"><voice xml:lang="id-ID" name="${voice}">${escapeXml(normalizedText)}</voice></speak>`;
      const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'IndoBrain-TTS',
        },
        body: ssml,
        cache: 'no-store',
      });
      if (!response.ok) {
        console.error('Azure Speech synthesis failed', { status: response.status });
        return jsonError('Audio is temporarily unavailable.', 502);
      }
      audio = await response.arrayBuffer();
      if (!audio.byteLength) return jsonError('Audio is temporarily unavailable.', 502);
      if (audioCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = audioCache.keys().next().value;
        if (oldestKey) audioCache.delete(oldestKey);
      }
      audioCache.set(cacheKey, { audio, expiresAt: Date.now() + CACHE_TTL_MS });
    }

    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    console.error('Azure Speech request failed');
    return jsonError('Audio is temporarily unavailable.', 502);
  }
}
