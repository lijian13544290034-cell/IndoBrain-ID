import { createHash } from 'node:crypto';

export const runtime = 'nodejs';

const voice = 'id-ID-GadisNeural';
const cache = new Map<string, { audio: Uint8Array; expiresAt: number }>();
const cacheTtlMs = 24 * 60 * 60 * 1000;
const maxCacheEntries = 200;

function configured() {
  return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
}

function escapeXml(text: string) {
  return text.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);
}

function cacheKey(text: string) {
  return createHash('sha256').update(`${voice}:${text}`).digest('hex');
}

function cachedResponse(audio: Uint8Array, cacheStatus: 'HIT' | 'MISS') {
  const body = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer;
  return new Response(body, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=86400', 'X-IndoBrain-TTS-Cache': cacheStatus, 'X-IndoBrain-TTS-Voice': voice } });
}

export async function GET() {
  return Response.json({ configured: configured(), voice: configured() ? voice : null });
}

export async function POST(request: Request) {
  if (!configured()) return Response.json({ error: 'TTS is not configured.' }, { status: 503 });
  const body = await request.json().catch(() => null) as { text?: unknown } | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 500 || /[\u3400-\u9FFF]/.test(text)) return Response.json({ error: 'Only Indonesian text is accepted.' }, { status: 400 });

  const key = cacheKey(text);
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return cachedResponse(entry.audio, 'HIT');

  const region = process.env.AZURE_SPEECH_REGION as string;
  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY as string,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
      'User-Agent': 'IndoBrain',
    },
    body: `<speak version="1.0" xml:lang="id-ID"><voice name="${voice}">${escapeXml(text)}</voice></speak>`,
  });
  if (!response.ok) return Response.json({ error: 'Audio could not be generated.' }, { status: 502 });

  const audio = new Uint8Array(await response.arrayBuffer());
  if (cache.size >= maxCacheEntries) cache.delete(cache.keys().next().value as string);
  cache.set(key, { audio, expiresAt: Date.now() + cacheTtlMs });
  return cachedResponse(audio, 'MISS');
}
