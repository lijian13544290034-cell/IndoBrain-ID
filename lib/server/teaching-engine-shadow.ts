import 'server-only';

import { orchestrateTeachingTurn } from '@/lib/teaching-engine/orchestrator';
import type { TeachingEngineTurn } from '@/lib/teaching-engine/integration-contracts';

export function teachingEngineShadowEnabled() {
  return process.env.AI_COACH_TEACHING_ENGINE_V1 === 'shadow';
}

export type TeachingEngineRuntimeMode = 'OFF' | 'SHADOW' | 'ACTIVE';

export function teachingEngineRuntimeMode(): TeachingEngineRuntimeMode {
  const requested = process.env.AI_COACH_TEACHING_ENGINE_V1?.toLowerCase();
  if (requested === 'shadow') return 'SHADOW';
  if (requested !== 'active') return 'OFF';
  if (process.env.VERCEL_ENV === 'production') return 'OFF';
  const isolated = process.env.VERCEL_ENV === 'preview'
    || process.env.NODE_ENV === 'development'
    || process.env.NODE_ENV === 'test'
    || process.env.AI_COACH_TEACHING_ENGINE_ACTIVE_TEST === '1';
  return isolated ? 'ACTIVE' : 'OFF';
}

export function teachingEngineActiveEnabled() {
  return teachingEngineRuntimeMode() === 'ACTIVE';
}

export function runTeachingEngineShadow(input: TeachingEngineTurn) {
  if (!teachingEngineShadowEnabled()) return null;
  return orchestrateTeachingTurn(input);
}
