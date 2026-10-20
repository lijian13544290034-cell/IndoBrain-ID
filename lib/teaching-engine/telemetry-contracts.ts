import type { PromptLevel, TeachingStage, TechnicalFailureReason } from './contracts';

export type ActiveOutcome = 'INDEPENDENT_SUCCESS' | 'SCAFFOLDED_SUCCESS' | 'PARTIAL' | 'IMITATED' | 'NOT_YET' | 'NO_EVIDENCE';
export type HintType = 'FIRST_TOKEN' | 'SKELETON_BLANK' | 'BINARY_CHOICE' | 'FULL_MODEL' | 'CONTRAST_HINT' | 'OBJECT_CUE' | 'AUDIO_ONLY' | 'NONE';

export type ActiveTeachingSession = {
  schema: 'indobrain.active-teaching-session/v1';
  objectiveId: 'temporary:wo-mingtian-shangban';
  stage: TeachingStage;
  promptLevel: PromptLevel;
  attempts: number;
  consecutiveErrors: number;
  consecutiveSuccesses: number;
  hints: number;
  prerequisitesVerified: boolean;
  masteryStatus: 'NOT_STARTED' | 'PRACTICED' | 'INDEPENDENT';
};

export type TeachingTurnTelemetry = {
  schema: 'indobrain.teaching-turn-telemetry/v1';
  turnId: string;
  lessonId: string;
  direction: 'ID_TO_ZH';
  stage: TeachingStage;
  stagePath: TeachingStage[];
  objective: {
    surface: '我明天上班';
    pinyin: 'wǒ míng tiān shàng bān';
    meaningId: 'Besok saya masuk kerja.';
    courseReferenceStatus: 'TEMPORARY_TEACHING_OBJECTIVE';
    introducedDayByToken: { 我: 1; 明天: 6; 上班: 27 };
    anchorExpressionIds: readonly ['CN-WORK-D01-I02', 'CN-WORK-D06-I02', 'CN-WORK-D27-I01'];
    prerequisitesVerified: boolean;
  };
  input: {
    modality: 'VOICE' | 'TEXT';
    text: string;
    sttConfidence: null;
  };
  evidence: {
    kind: 'NONE' | 'PROMPTED_ATTEMPT' | 'INDEPENDENT_PRODUCTION';
    outcome: ActiveOutcome;
    promptLevel: PromptLevel;
    source: 'NONE' | 'MEANING_TASK' | 'STT_INTELLIGIBILITY' | 'UNPROMPTED_RECALL' | 'TRANSFER_TASK';
    acousticVerified: false;
    written: boolean;
  };
  teaching: {
    action: string;
    hintType: HintType;
    promptLevel: PromptLevel;
    correctionType: 'NONE' | 'ELICITATION' | 'RECAST' | 'EXPLICIT';
  };
  technical: { failed: boolean; reason: TechnicalFailureReason | null };
  next: {
    stage: TeachingStage;
    difficulty: 'HOLD' | 'DOWN' | 'UP';
    recordsLearnerFailure: boolean;
    masteryStatus: 'NOT_STARTED' | 'PRACTICED' | 'INDEPENDENT';
  };
};

export function assertTeachingTelemetryInvariant(turn: TeachingTurnTelemetry) {
  if (turn.technical.failed) {
    if (turn.evidence.kind !== 'NONE' || turn.evidence.outcome !== 'NO_EVIDENCE') throw new Error('TECH_FAILURE must be NO_EVIDENCE');
    if (turn.teaching.correctionType !== 'NONE') throw new Error('TECH_FAILURE must not correct');
    if (turn.next.difficulty === 'DOWN') throw new Error('TECH_FAILURE must not reduce difficulty');
    if (turn.next.recordsLearnerFailure) throw new Error('TECH_FAILURE must not record learner failure');
  }
  if (turn.evidence.outcome === 'SCAFFOLDED_SUCCESS' && turn.evidence.kind === 'INDEPENDENT_PRODUCTION') {
    throw new Error('Scaffolded success cannot be independent production');
  }
  if (turn.evidence.kind === 'INDEPENDENT_PRODUCTION' && turn.evidence.promptLevel !== 'NONE') {
    throw new Error('Independent production requires promptLevel=NONE');
  }
}
