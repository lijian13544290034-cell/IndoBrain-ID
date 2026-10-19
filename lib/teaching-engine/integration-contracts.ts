import type { MasterySnapshot, TechnicalFailureReason } from './contracts';

export type LearningDirection = 'ZH_TO_ID' | 'ID_TO_ZH';
export type TeachingTurnKind = 'TEACHING' | 'RETRY_SAME_TARGET' | 'EXIT_OFFER' | 'TECH_FAILURE' | 'OFF_TOPIC_REDIRECT' | 'COMPLETION';
export type RuntimeEvidenceKind = 'NONE' | 'PROMPTED_ATTEMPT' | 'INDEPENDENT_PRODUCTION';

export type StrategyHistoryEntry = {
  attemptIndex: number;
  strategy: string;
  evidenceKind: RuntimeEvidenceKind;
  verdict: 'SUCCESS' | 'RETRY' | 'NO_EVIDENCE';
};

export type TeachingTurnSources = {
  turnKind: 'MANDARIN_COACH_SUCCESS_RESPONSE' | 'CALLER_DECLARED' | 'TRANSPORT_OR_PROVIDER_FAILURE';
  evidenceKind: 'MASTERY_POLICY_ACCEPTED_EVIDENCE' | 'NO_ASSESSMENT_IN_CONVERSATION_ROUTE' | 'TECHNICAL_FAILURE';
  strategyHistory: 'STRUCTURED_CLIENT_HISTORY' | 'UNAVAILABLE_LEGACY_RECENT_TURNS' | 'CALLER_DECLARED';
};

export type TeachingEngineTurn = {
  requestId: string;
  direction: LearningDirection;
  turnKind: TeachingTurnKind;
  evidence: {
    kind: RuntimeEvidenceKind;
    prompted: boolean;
    written: boolean;
    reviewQueued: boolean;
  };
  strategyHistory: StrategyHistoryEntry[];
  teachingAction: string;
  technicalFailure: TechnicalFailureReason | null;
  sources: TeachingTurnSources;
  courseAuthorization: {
    authorized: boolean;
    lessonId: string;
    source: string;
  };
  ruleContext: Record<string, unknown>;
  mastery?: MasterySnapshot;
};

export function languagePolicyFor(direction: LearningDirection) {
  return direction === 'ZH_TO_ID'
    ? { explanation: 'ZH' as const, target: 'ID' as const, feedback: 'ZH' as const, romanization: 'NONE' as const }
    : { explanation: 'ID' as const, target: 'ZH' as const, feedback: 'ID' as const, romanization: 'PINYIN' as const };
}
