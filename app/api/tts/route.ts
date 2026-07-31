import { createHash } from 'node:crypto';
import { getGoogleTtsProvider } from '@/lib/google-tts-provider';
import { getTtsProvider } from '@/lib/tts-provider';

export const runtime = 'nodejs';

const cache = new Map<string, { audio: Uint8Array; expiresAt: number }>();
const cacheTtlMs = 24 * 60 * 60 * 1000;
const maxCacheEntries = 200;
const approvedGooglePhonemes = new Set(['b', 'd', 'g', 'k', 'p', 't', 'm', 'n', 'r', 'w', 'j', 'tʃ', 'dʒ', 'ŋ', 'ɲ', 'ʃ', 'x', 'a', 'ə', 'e', 'i', 'o', 'u', 'aɪ', 'aʊ', 'ɔɪ', 'dʒa', 'ka', 'ba', 'ma', 'pu', 'laʊ', 'ŋə', 'ŋa', 'ɲa', 'ʃa', 'xa']);

type SpeechRate = 'normal' | 'slow';
type AudioMode = 'phoneme' | 'text' | 'example';
type PronunciationInput = { provider: 'azure' | 'google'; audioMode: AudioMode; alphabet?: 'ipa'; phoneme?: string; audioText?: string; fallbackText?: string; exampleWords: string[] };
type AudioCandidate = { text: string; audioMode: AudioMode | 'fallback'; phoneme?: string; alphabet?: 'ipa' };

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

function normalizePronunciation(value: unknown): PronunciationInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as { provider?: unknown; audioMode?: unknown; alphabet?: unknown; phoneme?: unknown; audioText?: unknown; fallbackText?: unknown; exampleWords?: unknown };
  const audioMode: AudioMode = input.audioMode === 'phoneme' || input.audioMode === 'text' || input.audioMode === 'example' ? input.audioMode : 'text';
  const provider = input.provider === 'google' ? 'google' : 'azure';
  const phoneme = typeof input.phoneme === 'string' && approvedGooglePhonemes.has(input.phoneme) ? input.phoneme : undefined;
  const exampleWords = Array.isArray(input.exampleWords) ? input.exampleWords.map(validText).filter((word): word is string => Boolean(word)) : [];
  return { provider, audioMode, alphabet: input.alphabet === 'ipa' ? 'ipa' : undefined, phoneme, audioText: validText(input.audioText) ?? undefined, fallbackText: validText(input.fallbackText) ?? undefined, exampleWords };
}

function candidates(text: string, pronunciation: PronunciationInput | null, includePhoneme: boolean): AudioCandidate[] {
  if (!pronunciation) return [{ text, audioMode: 'fallback' }];
  const result: AudioCandidate[] = [];
  if (includePhoneme && pronunciation.audioMode === 'phoneme' && pronunciation.phoneme && pronunciation.alphabet === 'ipa') result.push({ text, audioMode: 'phoneme', phoneme: pronunciation.phoneme, alphabet: 'ipa' });
  if (pronunciation.audioText) result.push({ text: pronunciation.audioText, audioMode: 'text' });
  for (const word of pronunciation.exampleWords) result.push({ text: word, audioMode: 'example' });
  if (pronunciation.fallbackText) result.push({ text: pronunciation.fallbackText, audioMode: 'fallback' });
  result.push({ text, audioMode: 'fallback' });
  return result.filter((candidate, index, list) => list.findIndex((other) => other.text === candidate.text && other.phoneme === candidate.phoneme && other.audioMode === candidate.audioMode) === index);
}

function writeCache(key: string, audio: Uint8Array) {
  if (cache.size >= maxCacheEntries) cache.delete(cache.keys().next().value as string);
  cache.set(key, { audio, expiresAt: Date.now() + cacheTtlMs });
}

export async function GET() {
  const azure = getTtsProvider();
  const google = getGoogleTtsProvider();
  return Response.json({ configured: azure.configured, voice: azure.voice, googleConfigured: google.configured });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { text?: unknown; rate?: unknown; pronunciation?: unknown } | null;
  const text = validText(body?.text);
  const rate: SpeechRate = body?.rate === 'slow' ? 'slow' : 'normal';
  if (!text) return Response.json({ error: 'Only Indonesian text is accepted.' }, { status: 400 });
  const pronunciation = normalizePronunciation(body?.pronunciation);
  const google = getGoogleTtsProvider();

  if (pronunciation?.provider === 'google' && google.configured && google.voice) {
    for (const candidate of candidates(text, pronunciation, true)) {
      const key = cacheKey({ provider: 'google', voice: google.voice, locale: google.locale, rate, displayText: text, pronunciation, candidate }, google.voice);
      const entry = cache.get(key);
      if (entry && entry.expiresAt > Date.now()) return cachedResponse(entry.audio, 'HIT', google.voice);
      try {
        const generated = await google.synthesize({ text: candidate.text, phoneme: candidate.phoneme, alphabet: candidate.alphabet, rate });
        writeCache(key, generated.audio);
        return cachedResponse(generated.audio, 'MISS', generated.voice);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.warn('Google pronunciation TTS candidate failed', { audioMode: candidate.audioMode, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  }

  const azure = getTtsProvider();
  if (!azure.configured || !azure.voice) return Response.json({ error: 'TTS is not configured.' }, { status: 503 });
  for (const candidate of candidates(text, pronunciation, pronunciation?.provider === 'azure')) {
    const key = cacheKey({ provider: 'azure', voice: azure.voice, locale: 'id-ID', rate, displayText: text, pronunciation, candidate }, azure.voice);
    const entry = cache.get(key);
    if (entry && entry.expiresAt > Date.now()) return cachedResponse(entry.audio, 'HIT', azure.voice);
    try {
      const generated = await azure.synthesize(candidate.text, { rate, phoneme: candidate.phoneme });
      writeCache(key, generated.audio);
      return cachedResponse(generated.audio, 'MISS', generated.voice);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.warn('Azure pronunciation fallback failed', { audioMode: candidate.audioMode, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  return Response.json({ error: 'Audio could not be generated.' }, { status: 502 });
}
