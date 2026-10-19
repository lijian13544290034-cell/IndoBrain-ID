import 'server-only';

import { orchestrateTeachingTurn } from '@/lib/teaching-engine/orchestrator';
import type { TeachingEngineTurn } from '@/lib/teaching-engine/integration-contracts';

export function teachingEngineShadowEnabled() {
  return process.env.AI_COACH_TEACHING_ENGINE_V1 === 'shadow';
}

export function runTeachingEngineShadow(input: TeachingEngineTurn) {
  if (!teachingEngineShadowEnabled()) return null;
  return orchestrateTeachingTurn(input);
}
