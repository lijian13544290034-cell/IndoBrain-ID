import type { TeachingEvent, TeachingStage } from './contracts';

export type TeachingTransition = {
  from: TeachingStage;
  event: TeachingEvent;
  to: TeachingStage;
  recordsLearnerFailure: boolean;
};

const transitions: Record<TeachingStage, Partial<Record<TeachingEvent, TeachingStage>>> = {
  DIAGNOSE: { DIAGNOSIS_READY: 'MODEL', SESSION_ENDED: 'COMPLETE' },
  MODEL: { MODEL_PRESENTED: 'SPEAK', SESSION_ENDED: 'COMPLETE' },
  SPEAK: { LEARNER_ATTEMPTED: 'EVALUATE', TECHNICAL_FAILURE: 'SPEAK', SESSION_ENDED: 'COMPLETE' },
  EVALUATE: { EVIDENCE_ACCEPTED: 'ADVANCE', EVIDENCE_REJECTED: 'HINT', TECHNICAL_FAILURE: 'RETRY', SESSION_ENDED: 'COMPLETE' },
  HINT: { HINT_SELECTED: 'RETRY', SESSION_ENDED: 'COMPLETE' },
  RETRY: { RETRY_REQUESTED: 'SPEAK', TECHNICAL_FAILURE: 'RETRY', SESSION_ENDED: 'COMPLETE' },
  ADVANCE: { OBJECTIVE_PRACTICED: 'TRANSFER_TEST', TRANSFER_READY: 'TRANSFER_TEST', SESSION_ENDED: 'COMPLETE' },
  TRANSFER_TEST: { TRANSFER_PASSED: 'COMPLETE', TRANSFER_FAILED: 'HINT', TECHNICAL_FAILURE: 'TRANSFER_TEST', SESSION_ENDED: 'COMPLETE' },
  COMPLETE: {},
};

export function transitionTeachingState(stage: TeachingStage, event: TeachingEvent): TeachingTransition | null {
  const to = transitions[stage][event];
  if (!to) return null;
  return {
    from: stage,
    event,
    to,
    recordsLearnerFailure: event === 'EVIDENCE_REJECTED' || event === 'TRANSFER_FAILED',
  };
}
