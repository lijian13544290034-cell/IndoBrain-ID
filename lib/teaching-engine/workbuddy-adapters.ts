import type { TeachingEngineTurn } from './integration-contracts';
import { languagePolicyFor } from './integration-contracts';

export function normalizeTeachingTurn(input: TeachingEngineTurn): TeachingEngineTurn {
  if (input.turnKind !== 'TECH_FAILURE' && input.technicalFailure) {
    throw new Error('technicalFailure requires turnKind=TECH_FAILURE');
  }
  if (input.turnKind === 'TECH_FAILURE') {
    return {
      ...input,
      evidence: { kind: 'NONE', prompted: false, written: false, reviewQueued: false },
      sources: { ...input.sources, evidenceKind: 'TECHNICAL_FAILURE' },
      ruleContext: {
        ...input.ruleContext,
        turn: {
          ...((input.ruleContext.turn as Record<string, unknown> | undefined) ?? {}),
          outcome: 'NO_EVIDENCE',
        },
      },
    };
  }
  return input;
}

export function toWorkBuddyATeachingContext(input: TeachingEngineTurn) {
  const normalized = normalizeTeachingTurn(input);
  const turn = (normalized.ruleContext.turn as Record<string, unknown> | undefined) ?? {};
  return {
    ...normalized.ruleContext,
    turn: {
      ...turn,
      direction: normalized.direction,
      turnKind: normalized.turnKind,
      evidence: normalized.evidence,
      strategyHistory: normalized.strategyHistory,
    },
  };
}

export function toWorkBuddyBTestContract(input: TeachingEngineTurn) {
  const normalized = normalizeTeachingTurn(input);
  const language = languagePolicyFor(normalized.direction);
  return {
    contractVersion: '1.1.0-teaching-engine-adapter',
    requestId: normalized.requestId,
    direction: normalized.direction,
    turnKind: normalized.turnKind,
    teachingAction: normalized.teachingAction,
    targetLanguage: language.target,
    explanationLanguage: language.explanation,
    evidence: normalized.evidence,
    techFailure: normalized.technicalFailure ? { kind: normalized.technicalFailure, retryable: true } : null,
    history: normalized.strategyHistory,
    sources: normalized.sources,
    scoringMode: 'UNSCORED' as const,
    needsHumanReview: true,
    needsReviewReason: 'Teaching quality requires human review; deterministic checks cover contracts only.',
  };
}
