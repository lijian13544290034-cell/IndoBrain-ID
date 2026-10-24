import { createHash } from 'node:crypto';
import { getChineseTtsProvider, type ChineseTtsRate } from '@/lib/chinese-tts-provider';
import { isValidatedSpokenChinese } from '@/lib/mandarin-coach-speech';

export const runtime = 'nodejs';

const cache = new Map<string, { audio: Uint8Array; expiresAt: number }>();
const cacheTtlMs = 24 * 60 * 60 * 1000;
const maxCacheEntries = 100;

function cacheKey(text: string, voice: string, rate: ChineseTtsRate) {
  return createHash('sha256').update(`${voice}:${rate}:${text}`).digest('hex');
}

function cachedResponse(audio: Uint8Array, cacheStatus: 'HIT' | 'MISS', voice: string, rate: ChineseTtsRate, text: string) {
  const body = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer;
  return new Response(body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=86400',
      'X-IndoBrain-TTS-Cache': cacheStatus,
      'X-IndoBrain-Chinese-TTS-Voice': voice,
      'X-IndoBrain-Chinese-TTS-Rate': rate,
      'X-IndoBrain-TTS-Billable-Characters': String([...text].length),
    },
  });
}

export async function GET() {
  const provider = getChineseTtsProvider();
  return Response.json({ configured: provider.configured, voice: provider.voice });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { text?: unknown; rate?: unknown } | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const rate: ChineseTtsRate = body?.rate === 'slow' ? 'slow' : 'normal';
  if (!isValidatedSpokenChinese(text)) return Response.json({ error: 'Only validated Chinese teaching text is accepted.' }, { status: 400 });
  const provider = getChineseTtsProvider();
  if (!provider.configured || !provider.voice) return Response.json({ error: 'Chinese TTS is not configured.' }, { status: 503 });

  const key = cacheKey(text, provider.voice, rate);
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return cachedResponse(entry.audio, 'HIT', provider.voice, rate, text);
  let generated: Awaited<ReturnType<typeof provider.synthesize>>;
  try { generated = await provider.synthesize(text, rate); } catch { return Response.json({ error: 'Chinese audio could not be generated.' }, { status: 502 }); }

  if (cache.size >= maxCacheEntries) cache.delete(cache.keys().next().value as string);
  cache.set(key, { audio: generated.audio, expiresAt: Date.now() + cacheTtlMs });
  return cachedResponse(generated.audio, 'MISS', generated.voice, rate, text);
}
