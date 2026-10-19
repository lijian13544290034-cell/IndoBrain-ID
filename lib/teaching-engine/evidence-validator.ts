import type { CourseReferenceStatus, TeachingEvidence } from './contracts';

export type EvidenceValidation =
  | { accepted: true; normalized: TeachingEvidence; reason: 'VALID_EVIDENCE' }
  | { accepted: false; normalized: TeachingEvidence; reason: 'NO_EVIDENCE' | 'INVALID_INDEPENDENT_EVIDENCE' | 'UNSUPPORTED_ACOUSTIC_CLAIM' };

export function validateTeachingEvidence(evidence: TeachingEvidence): EvidenceValidation {
  if (evidence.outcome === 'NO_EVIDENCE' || evidence.technicalFailure) {
    return { accepted: false, normalized: { ...evidence, outcome: 'NO_EVIDENCE' }, reason: 'NO_EVIDENCE' };
  }
  if (evidence.source === 'STT_INTELLIGIBILITY' && evidence.dimension === 'PRONUNCIATION' && evidence.acousticVerified) {
    return { accepted: false, normalized: { ...evidence, acousticVerified: false }, reason: 'UNSUPPORTED_ACOUSTIC_CLAIM' };
  }
  if (evidence.source === 'UNPROMPTED_RECALL' && evidence.promptLevel !== 'NONE') {
    return { accepted: false, normalized: evidence, reason: 'INVALID_INDEPENDENT_EVIDENCE' };
  }
  return { accepted: true, normalized: evidence, reason: 'VALID_EVIDENCE' };
}

export function canUseCaseForAssertion(input: { assertionKind: 'STRATEGY' | 'CONTENT'; courseReferenceStatus: CourseReferenceStatus }) {
  if (input.assertionKind === 'STRATEGY') return { allowed: true, reason: 'STRATEGY_CAN_BE_REVIEWED_AFTER_REFERENCE_CORRECTION' as const };
  if (input.courseReferenceStatus === 'EXACT_IN_REFERENCED_DAY' || input.courseReferenceStatus === 'EXACT_SOURCE_LITERAL') {
    return { allowed: true, reason: 'EXACT_CONTENT_REFERENCE' as const };
  }
  return { allowed: false, reason: 'CONTENT_ASSERTION_BLOCKED_BY_REFERENCE' as const };
}
