import { createHash } from 'node:crypto';
import { getTtsProvider } from '@/lib/tts-provider';

export const runtime = 'nodejs';

const cache = new Map<string, { audio: Uint8Array; expiresAt: number }>();
const cacheTtlMs = 24 * 60 * 60 * 1000;
const maxCacheEntries = 200;
type SpeechRate = 'normal' | 'slow';
type AudioMode = 'phoneme' | 'text' | 'example';
type AudioCandidate = { text: string; audioMode: AudioMode | 'fallback'; phoneme?: string };

function cacheKey(input: unknown, voice: string) {
  return createHash('sha256').update(`${voice}:${JSON.stringify(input)}`).digest('hex');
}

function cachedResponse(audio: Uint8Array, cacheStatus: 'HIT' | 'MISS', voice: string) {
  const body = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer;
  return new Response(body, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=86400', 'X-IndoBrain-TTS-Cache': cacheStatus, 'X-IndoBrain-TTS-Voice': voice } });
}

function validText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 500 && !/[\u3400-\u9FFF]/.test(value) ? value.trim() : null;
}

function pronunciationCandidates(text: string, value: unknown): AudioCandidate[] {
  if (!value || typeof value !== 'object') return [{ text, audioMode: 'fallback' }];
  const input = value as { audioMode?: unknown; phoneme?: unknown; audioText?: unknown; exampleWords?: unknown };
  const audioMode: AudioMode = input.audioMode === 'phoneme' || input.audioMode === 'text' || input.audioMode === 'example' ? input.audioMode : 'text';
  const phoneme = typeof input.phoneme === 'string' && input.phoneme.length <= 64 && /^[\p{L}\sˈˌ.]+$/u.test(input.phoneme) ? input.phoneme : null;
  const audioText = validText(input.audioText);
  const exampleWords = Array.isArray(input.exampleWords) ? input.exampleWords.map(validText).filter((word): word is string => Boolean(word)) : [];
  const candidates: AudioCandidate[] = [];
  if (audioMode === 'phoneme' && phoneme) candidates.push({ text, audioMode: 'phoneme', phoneme });
  if (audioText) candidates.push({ text: audioText, audioMode: 'text' });
  for (const word of exampleWords) candidates.push({ text: word, audioMode: 'example' });
  candidates.push({ text, audioMode: 'fallback' });
  return candidates.filter((candidate, index, list) => list.findIndex((other) => other.text === candidate.text && other.phoneme === candidate.phoneme && other.audioMode === candidate.audioMode) === index);
}

export async function GET() {
  const provider = getTtsProvider();
  return Response.json({ configured: provider.configured, voice: provider.voice });
}

export async function POST(request: Request) {
  const provider = getTtsProvider();
  if (!provider.configured || !provider.voice) return Response.json({ error: 'TTS is not configured.' }, { status: 503 });
  const body = await request.json().catch(() => null) as { text?: unknown; rate?: unknown; pronunciation?: unknown } | null;
  const text = validText(body?.text);
  const rate: SpeechRate = body?.rate === 'slow' ? 'slow' : 'normal';
  if (!text) return Response.json({ error: 'Only Indonesian text is accepted.' }, { status: 400 });

  const candidates = pronunciationCandidates(text, body?.pronunciation);
  for (const candidate of candidates) {
    const key = cacheKey({ text, voice: provider.voice, rate, requested: body?.pronunciation ?? null, candidate }, provider.voice);
    const entry = cache.get(key);
    if (entry && entry.expiresAt > Date.now()) return cachedResponse(entry.audio, 'HIT', provider.voice);
    try {
      const generated = await provider.synthesize(candidate.text, { rate, phoneme: candidate.phoneme });
      if (cache.size >= maxCacheEntries) cache.delete(cache.keys().next().value as string);
      cache.set(key, { audio: generated.audio, expiresAt: Date.now() + cacheTtlMs });
      return cachedResponse(generated.audio, 'MISS', generated.voice);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.warn('Pronunciation TTS candidate failed', { audioMode: candidate.audioMode, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  return Response.json({ error: 'Audio could not be generated.' }, { status: 502 });
}
