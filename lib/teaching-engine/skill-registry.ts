import type { CoreTeachingSkillId, PromptLevel, SkillDefinition, TeachingContext } from './contracts';

const definitions: Record<CoreTeachingSkillId, SkillDefinition> = {
  S02: { id: 'S02', name: 'Micro Speaking', version: '1.0.0-contract', purpose: 'Produce one immediately usable target utterance.', preconditions: ['one approved target expression'], invariants: ['one clear production task per turn', 'guided repetition is practice, not mastery'], runtimeEnabled: false },
  S03: { id: 'S03', name: 'Scaffolding', version: '1.0.0-contract', purpose: 'Provide and remove the minimum useful support.', preconditions: ['learner state is known'], invariants: ['support may skip, increase, decrease or be removed', 'technical failure does not increase support as learner failure'], runtimeEnabled: false },
  S04: { id: 'S04', name: 'Adaptive Difficulty', version: '1.0.0-contract', purpose: 'Change one difficulty dimension from actual evidence.', preconditions: ['valid non-technical evidence'], invariants: ['one adjustment step per decision', 'never infer ability from technical failure'], runtimeEnabled: false },
  S05: { id: 'S05', name: 'Corrective Feedback', version: '1.0.0-contract', purpose: 'Correct the highest-value error while preserving intent.', preconditions: ['learner error evidence'], invariants: ['strategy depends on level and error type', 'no phoneme/tone claim without acoustic evidence'], runtimeEnabled: false },
  S07: { id: 'S07', name: 'Independent Recall', version: '1.0.0-contract', purpose: 'Collect unaided recall or transfer evidence.', preconditions: ['model and prompts removed'], invariants: ['promptLevel must be NONE', 'echo and guided STT cannot prove independence'], runtimeEnabled: false },
  S08: { id: 'S08', name: 'Error Recovery', version: '1.0.0-contract', purpose: 'Change strategy after repeated learner difficulty.', preconditions: ['learner error or explicit help request'], invariants: ['technical failure uses retry/fallback and is NO_EVIDENCE', 'offer a lower-friction path without ability attribution'], runtimeEnabled: false },
};

export function getCoreSkill(id: CoreTeachingSkillId): SkillDefinition {
  return definitions[id];
}

export function listCoreSkills(): SkillDefinition[] {
  return Object.values(definitions);
}

const promptOrder: PromptLevel[] = ['NONE', 'TASK_ONLY', 'SEMANTIC_CUE', 'FIRST_WORD', 'FULL_MODEL'];

export function selectScaffoldLevel(input: TeachingContext & { outcome: 'SUCCESS' | 'LEARNER_ERROR' | 'NO_EVIDENCE' }): PromptLevel {
  const index = promptOrder.indexOf(input.promptLevel);
  if (input.outcome === 'NO_EVIDENCE') return input.promptLevel;
  if (input.outcome === 'SUCCESS' && input.consecutiveSuccesses >= 3) return 'NONE';
  if (input.outcome === 'LEARNER_ERROR' && input.consecutiveLearnerErrors >= 3) return 'FULL_MODEL';
  if (input.outcome === 'SUCCESS' && input.consecutiveSuccesses >= 2) return promptOrder[Math.max(0, index - 1)];
  if (input.outcome === 'LEARNER_ERROR' || input.learnerRequestedHelp) return promptOrder[Math.min(promptOrder.length - 1, index + 1)];
  return input.promptLevel;
}

export function selectDifficultyAction(input: TeachingContext & { outcome: 'SUCCESS' | 'LEARNER_ERROR' | 'NO_EVIDENCE' }) {
  if (input.outcome === 'NO_EVIDENCE') return 'KEEP_DIFFICULTY' as const;
  if (input.outcome === 'SUCCESS' && input.consecutiveSuccesses >= 2) return 'INCREASE_ONE_VARIABLE' as const;
  if (input.outcome === 'LEARNER_ERROR' && input.consecutiveLearnerErrors >= 2) return 'REDUCE_ONE_VARIABLE' as const;
  return 'KEEP_DIFFICULTY' as const;
}

export type CorrectionErrorType = 'MEANING' | 'WORD_ORDER' | 'WORD_CHOICE' | 'INTELLIGIBILITY' | 'PHONEME_OR_TONE';

export function selectCorrectionStrategy(input: { learnerLevel: TeachingContext['learnerLevel']; errorType: CorrectionErrorType; acousticEvidence: boolean }) {
  if (input.errorType === 'PHONEME_OR_TONE' && !input.acousticEvidence) return 'REQUEST_ACOUSTIC_EVIDENCE' as const;
  if (input.learnerLevel === 'BEGINNER') return input.errorType === 'MEANING' ? 'MODEL_ONE_CORRECT_FORM' as const : 'PRESERVE_CORRECT_PART_AND_RETRY_ONE_POINT' as const;
  if (input.errorType === 'WORD_ORDER') return 'CONTRAST_MINIMAL_WORD_ORDER' as const;
  if (input.errorType === 'WORD_CHOICE' || input.errorType === 'MEANING') return 'EXPLAIN_ONE_SEMANTIC_GAP' as const;
  return 'RETRY_TARGET_SEGMENT' as const;
}

export function validateIndependentProduction(input: { source: 'GUIDED_REPEAT' | 'STT_INTELLIGIBILITY' | 'UNPROMPTED_RECALL' | 'TRANSFER_TASK'; promptLevel: PromptLevel; success: boolean }) {
  return input.success && input.promptLevel === 'NONE' && (input.source === 'UNPROMPTED_RECALL' || input.source === 'TRANSFER_TASK');
}

export function selectRecoveryAction(input: { outcome: 'SUCCESS' | 'LEARNER_ERROR' | 'NO_EVIDENCE'; consecutiveLearnerErrors: number }) {
  if (input.outcome === 'NO_EVIDENCE') return 'TECHNICAL_RETRY_OR_TEXT_FALLBACK' as const;
  if (input.outcome === 'SUCCESS') return 'CONTINUE_CURRENT_STRATEGY' as const;
  if (input.consecutiveLearnerErrors >= 3) return 'REDUCE_TASK_AND_OFFER_EXIT' as const;
  if (input.consecutiveLearnerErrors >= 2) return 'CHANGE_TEACHING_STRATEGY' as const;
  return 'GIVE_ONE_TARGETED_HINT' as const;
}
