export const CORE_TEACHING_SKILL_IDS = ['S02', 'S03', 'S04', 'S05', 'S07', 'S08'] as const;

export type CoreTeachingSkillId = (typeof CORE_TEACHING_SKILL_IDS)[number];
export type TeachingStage = 'DIAGNOSE' | 'MODEL' | 'SPEAK' | 'EVALUATE' | 'HINT' | 'RETRY' | 'ADVANCE' | 'TRANSFER_TEST' | 'COMPLETE';
export type TeachingEvent =
  | 'DIAGNOSIS_READY'
  | 'MODEL_PRESENTED'
  | 'LEARNER_ATTEMPTED'
  | 'EVIDENCE_ACCEPTED'
  | 'EVIDENCE_REJECTED'
  | 'TECHNICAL_FAILURE'
  | 'HINT_SELECTED'
  | 'RETRY_REQUESTED'
  | 'OBJECTIVE_PRACTICED'
  | 'TRANSFER_READY'
  | 'TRANSFER_PASSED'
  | 'TRANSFER_FAILED'
  | 'SESSION_ENDED';

export type MasteryStatus = 'NOT_STARTED' | 'PRACTICED' | 'INDEPENDENT' | 'MASTERED';
export type MasteryDimension = 'UNDERSTANDING' | 'RECALL' | 'PRONUNCIATION' | 'LISTENING' | 'APPLICATION';
export type TechnicalFailureReason = 'MICROPHONE_DENIED' | 'AUDIO_INVALID' | 'EMPTY_STT' | 'NETWORK' | 'RATE_LIMIT' | 'PROVIDER' | 'SCHEMA' | 'TTS';
export type EvidenceOutcome = 'SUCCESS' | 'LEARNER_ERROR' | 'NO_EVIDENCE';
export type EvidenceSource =
  | 'GUIDED_REPEAT'
  | 'MEANING_TASK'
  | 'LISTENING_TASK'
  | 'STT_INTELLIGIBILITY'
  | 'ACOUSTIC_ASSESSMENT'
  | 'UNPROMPTED_RECALL'
  | 'TRANSFER_TASK';
export type PromptLevel = 'NONE' | 'TASK_ONLY' | 'SEMANTIC_CUE' | 'FIRST_WORD' | 'FULL_MODEL';
export type CourseReferenceStatus =
  | 'EXACT_IN_REFERENCED_DAY'
  | 'EXACT_SOURCE_LITERAL'
  | 'CONFLICT_TARGET_NOT_EXACT'
  | 'CONFLICT_REFERENCE_SOURCE_DAY'
  | 'DIRECTION_MISMATCH'
  | 'TECHNICAL_REFERENCE_ONLY';

export type TeachingEvidence = {
  evidenceId: string;
  expressionId: string;
  dimension: MasteryDimension;
  source: EvidenceSource;
  outcome: EvidenceOutcome;
  occurredAt: string;
  promptLevel: PromptLevel;
  technicalFailure?: TechnicalFailureReason;
  acousticVerified?: boolean;
  courseReferenceStatus?: CourseReferenceStatus;
};

export type DimensionEvidenceSummary = {
  successes: number;
  learnerErrors: number;
  noEvidence: number;
  level: 0 | 1 | 2 | 3 | 4;
  acousticVerified: boolean;
  lastEvidenceAt: string | null;
};

export type FiveDimensionEvidence = Record<MasteryDimension, DimensionEvidenceSummary>;

export type MasterySnapshot = {
  status: MasteryStatus;
  dimensions: FiveDimensionEvidence;
  acceptedEvidence: TeachingEvidence[];
  ignoredTechnicalEvidence: TeachingEvidence[];
  legacyMasteryLevel: 0 | 1 | 2 | 3 | 4 | null;
};

export type TeachingContext = {
  learnerLevel: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE';
  consecutiveLearnerErrors: number;
  consecutiveSuccesses: number;
  promptLevel: PromptLevel;
  learnerRequestedHelp: boolean;
};

export type SkillDefinition = {
  id: CoreTeachingSkillId;
  name: string;
  version: '1.0.0-contract';
  purpose: string;
  preconditions: string[];
  invariants: string[];
  runtimeEnabled: false;
};
