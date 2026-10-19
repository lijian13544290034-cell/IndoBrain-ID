import type { CoreTeachingSkillId } from './contracts';

export type RuleResultStatus = 'PASS' | 'VIOLATION' | 'NOT_APPLICABLE';

export type RuleAssertion = {
  path?: string;
  op: string;
  value: unknown;
};

export type TeachingRule = {
  ruleId: string;
  stage: string;
  when: string;
  then: string;
  guard?: RuleAssertion;
  assertion: RuleAssertion;
  severity: 'P0' | 'P1' | 'P2';
};

export type TeachingRuleSet = {
  schema: 'indobrain.teaching-skill/v1';
  skillId: CoreTeachingSkillId;
  skillName: { en: string; zh: string };
  version: string;
  status: 'PROPOSED_FOR_INTEGRATION';
  reviewStatus: string;
  source: { sourceId: string; path: string; sha256: string; locator: string };
  stateContract: Record<string, string>;
  policies: TeachingRule[];
  outputContract: {
    languagePolicy: Record<'ZH_TO_ID' | 'ID_TO_ZH', {
      explanation: 'zh' | 'id';
      target: 'zh' | 'id';
      feedback: 'zh' | 'id';
      romanization: 'none' | 'pinyin';
    }>;
  };
};

export type RuleEvaluation = {
  skillId: CoreTeachingSkillId;
  ruleId: string;
  severity: TeachingRule['severity'];
  status: RuleResultStatus;
  actual?: unknown;
  reason: string;
};

export class UnknownRuleOperatorError extends Error {
  constructor(readonly operator: string) {
    super(`Unknown teaching rule operator: ${operator}`);
    this.name = 'UnknownRuleOperatorError';
  }
}
