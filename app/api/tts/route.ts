import { createHash } from 'node:crypto';
import { getTtsProvider } from '@/lib/tts-provider';

export const runtime = 'nodejs';

const cache = new Map<string, { audio: Uint8Array; expiresAt: number }>();
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
  const provider = getTtsProvider();
  return Response.json({ configured: provider.configured, voice: provider.voice });
}

export async function POST(request: Request) {
  const provider = getTtsProvider();
  if (!provider.configured || !provider.voice) return Response.json({ error: 'TTS is not configured.' }, { status: 503 });
  const body = await request.json().catch(() => null) as { text?: unknown } | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 500 || /[\u3400-\u9FFF]/.test(text)) return Response.json({ error: 'Only Indonesian text is accepted.' }, { status: 400 });

  const key = cacheKey(text, provider.voice);
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return cachedResponse(entry.audio, 'HIT', provider.voice);
  let generated: Awaited<ReturnType<typeof provider.synthesize>>;
  try { generated = await provider.synthesize(text); } catch { return Response.json({ error: 'Audio could not be generated.' }, { status: 502 }); }

  if (cache.size >= maxCacheEntries) cache.delete(cache.keys().next().value as string);
  cache.set(key, { audio: generated.audio, expiresAt: Date.now() + cacheTtlMs });
  return cachedResponse(generated.audio, 'MISS', generated.voice);
}
