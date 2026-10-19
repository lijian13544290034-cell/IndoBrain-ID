import { evaluateTeachingRuleSets } from './rule-evaluator';
import { listTeachingRuleSets } from './rules';
import { normalizeTeachingTurn, toWorkBuddyATeachingContext, toWorkBuddyBTestContract } from './workbuddy-adapters';
import type { TeachingEngineTurn } from './integration-contracts';

export function orchestrateTeachingTurn(input: TeachingEngineTurn) {
  if (!input.courseAuthorization.authorized) {
    return {
      contractVersion: 'phase1b-shadow-v1' as const,
      status: 'BLOCKED_AUTHORIZATION' as const,
      lessonId: input.courseAuthorization.lessonId,
      skills: [],
      evaluations: [],
    };
  }

  const normalized = normalizeTeachingTurn(input);
  const ruleSets = listTeachingRuleSets();
  const evaluations = evaluateTeachingRuleSets(ruleSets, toWorkBuddyATeachingContext(normalized));
  const counts = evaluations.reduce((summary, item) => {
    summary[item.status] += 1;
    return summary;
  }, { PASS: 0, VIOLATION: 0, NOT_APPLICABLE: 0 });

  return {
    contractVersion: 'phase1b-shadow-v1' as const,
    status: 'SHADOW_ONLY' as const,
    lessonId: normalized.courseAuthorization.lessonId,
    courseSource: normalized.courseAuthorization.source,
    skills: ruleSets.map((item) => ({ id: item.skillId, version: item.version })),
    counts,
    evaluations,
    testContract: toWorkBuddyBTestContract(normalized),
    masteryStatus: normalized.mastery?.status ?? null,
  };
}
