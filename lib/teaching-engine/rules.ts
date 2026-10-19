import s02 from './workbuddy-a/S02-micro-speaking.v1.json';
import s03 from './workbuddy-a/S03-scaffolding.v1.json';
import s04 from './workbuddy-a/S04-adaptive-difficulty.v1.json';
import s05 from './workbuddy-a/S05-corrective-feedback.v1.json';
import s07 from './workbuddy-a/S07-independent-recall.v1.json';
import s08 from './workbuddy-a/S08-error-recovery.v1.json';
import { CORE_TEACHING_SKILL_IDS } from './contracts';
import type { TeachingRuleSet } from './rule-types';

const rawRuleSets = [s02, s03, s04, s05, s07, s08] as unknown as TeachingRuleSet[];

export function listTeachingRuleSets(): TeachingRuleSet[] {
  const ids = rawRuleSets.map((item) => item.skillId);
  if (ids.length !== CORE_TEACHING_SKILL_IDS.length || CORE_TEACHING_SKILL_IDS.some((id) => !ids.includes(id))) {
    throw new Error('Teaching rule registry does not match the approved Phase 1A core Skill set.');
  }
  if (rawRuleSets.some((item) => item.status !== 'PROPOSED_FOR_INTEGRATION')) {
    throw new Error('A WorkBuddy A rule set has an unexpected integration status.');
  }
  return rawRuleSets;
}
