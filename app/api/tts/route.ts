import { createHash } from 'node:crypto';
import { getTtsProvider, type TtsLanguage } from '@/lib/tts-provider';

export const runtime = 'nodejs';

const cache = new Map<string, { audio: Uint8Array; expiresAt: number }>();
const pending = new Map<string, Promise<{ audio: Uint8Array; voice: string; language: string }>>();
const cacheTtlMs = 24 * 60 * 60 * 1000;
const maxCacheEntries = 200;

function cacheKey(text: string, voice: string) {
  return createHash('sha256').update(`${voice}:${text}`).digest('hex');
}

function cachedResponse(audio: Uint8Array, cacheStatus: 'HIT' | 'MISS', voice: string) {
  const body = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer;
  return new Response(body, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=86400', 'X-IndoBrain-TTS-Cache': cacheStatus, 'X-IndoBrain-TTS-Voice': voice } });
}

export async function GET() {
  const indonesian = getTtsProvider('indonesian');
  const chinese = getTtsProvider('chinese');
  return Response.json({ configured: indonesian.configured, voice: indonesian.voice, languages: { indonesian: { configured: indonesian.configured, voice: indonesian.voice, language: indonesian.language }, chinese: { configured: chinese.configured, voice: chinese.voice, language: chinese.language } } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { text?: unknown; language?: unknown } | null;
  const type: TtsLanguage = body?.language === 'chinese' ? 'chinese' : 'indonesian';
  const provider = getTtsProvider(type);
  if (!provider.configured || !provider.voice) return Response.json({ error: 'TTS is not configured.' }, { status: 503 });
  const text = typeof body?.text === 'string' ? body.text.replace(/\s+/g, ' ').trim() : '';
  const hasChinese = /[\u3400-\u9FFF]/.test(text);
  if (!text || text.length > 500 || (type === 'indonesian' && hasChinese) || (type === 'chinese' && !hasChinese)) return Response.json({ error: 'Text is not valid for the selected pronunciation language.' }, { status: 400 });

  const key = cacheKey(text, provider.voice);
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return cachedResponse(entry.audio, 'HIT', provider.voice);
  let generated: Awaited<ReturnType<typeof provider.synthesize>>;
  try {
    const inProgress = pending.get(key);
    if (inProgress) generated = await inProgress;
    else {
      const request = provider.synthesize(text).finally(() => pending.delete(key));
      pending.set(key, request);
      generated = await request;
    }
  } catch { return Response.json({ error: 'Audio could not be generated.' }, { status: 502 }); }

  if (cache.size >= maxCacheEntries) cache.delete(cache.keys().next().value as string);
  cache.set(key, { audio: generated.audio, expiresAt: Date.now() + cacheTtlMs });
  return cachedResponse(generated.audio, 'MISS', generated.voice);
}
