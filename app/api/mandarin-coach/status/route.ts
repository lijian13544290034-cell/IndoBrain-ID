import { getChineseTtsProvider } from '@/lib/chinese-tts-provider';
import { coachConfiguration } from '@/lib/server/mandarin-ai-coach';
import { teachingEngineRuntimeMode } from '@/lib/server/teaching-engine-shadow';

export const runtime = 'nodejs';

export async function GET() {
  const tts = getChineseTtsProvider();
  const ai = coachConfiguration();
  return Response.json({
    ready: ai.gatewayCredentialAvailable && tts.configured && tts.voice === 'zh-CN-XiaoxiaoNeural',
    ai: { configured: ai.gatewayCredentialAvailable, fastModel: ai.fastModel, smartModel: ai.smartModel, sttModel: ai.sttModel },
    tts: { configured: tts.configured, voice: tts.voice, language: 'zh-CN' },
    curriculum: 'day-1',
    teachingEngine: { mode: teachingEngineRuntimeMode() },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
