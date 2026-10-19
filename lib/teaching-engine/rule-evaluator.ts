import type { RuleAssertion, RuleEvaluation, RuleResultStatus, TeachingRule, TeachingRuleSet } from './rule-types';
import { UnknownRuleOperatorError } from './rule-types';

type AssertionEvaluation = { status: RuleResultStatus; actual?: unknown; reason: string };

function valueAtPath(context: Record<string, unknown>, path?: string) {
  if (!path) return undefined;
  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[key];
  }, context);
}

function compareNumber(actual: unknown, expected: unknown, predicate: (left: number, right: number) => boolean) {
  return typeof actual === 'number' && typeof expected === 'number' && predicate(actual, expected);
}

function compositeStatus(op: 'any' | 'all', children: AssertionEvaluation[]): AssertionEvaluation {
  if (!children.length) return { status: 'NOT_APPLICABLE', reason: `${op} has no child assertions` };
  if (op === 'any') {
    if (children.some((item) => item.status === 'PASS')) return { status: 'PASS', reason: 'at least one child passed' };
    if (children.every((item) => item.status === 'VIOLATION')) return { status: 'VIOLATION', reason: 'all children violated' };
    return { status: 'NOT_APPLICABLE', reason: 'no child passed and at least one child lacked data' };
  }
  if (children.some((item) => item.status === 'VIOLATION')) return { status: 'VIOLATION', reason: 'at least one child violated' };
  if (children.every((item) => item.status === 'PASS')) return { status: 'PASS', reason: 'all children passed' };
  return { status: 'NOT_APPLICABLE', reason: 'at least one child lacked data' };
}

function conditionalPrecondition(op: string, context: Record<string, unknown>) {
  if (op === 'gte_for_scoring') return valueAtPath(context, 'turn.scoringAttempted') === true;
  if (op === 'gte_for_up') return valueAtPath(context, 'difficulty.requestedChangeDirection') === 'UP';
  if (op === 'eq_for_mastered') return valueAtPath(context, 'item.requestedStatus') === 'MASTERED';
  if (op === 'gte_for_retention') return valueAtPath(context, 'turn.recall.evidenceTier') === 'E4';
  if (op === 'lte_for_continue') return valueAtPath(context, 'recovery.decision') === 'CONTINUE';
  return true;
}

export function evaluateRuleAssertion(assertion: RuleAssertion, context: Record<string, unknown>): AssertionEvaluation {
  if (assertion.op === 'any' || assertion.op === 'all') {
    if (!Array.isArray(assertion.value)) return { status: 'VIOLATION', reason: `${assertion.op} requires an assertion array` };
    return compositeStatus(assertion.op, assertion.value.map((item) => evaluateRuleAssertion(item as RuleAssertion, context)));
  }

  const supported = new Set([
    'eq', 'not_eq', 'in', 'not_in', 'lte', 'gte', 'lt', 'gt', 'length_eq', 'length_lte', 'length_gte',
    'contains_all', 'exists', 'gte_for_scoring', 'gte_for_up', 'max_value', 'eq_for_mastered',
    'gte_for_retention', 'lte_for_continue',
  ]);
  if (!supported.has(assertion.op)) throw new UnknownRuleOperatorError(assertion.op);

  const actual = valueAtPath(context, assertion.path);
  if (actual === undefined || actual === null) return { status: 'NOT_APPLICABLE', actual, reason: `missing field ${assertion.path ?? '(none)'}` };
  if (!conditionalPrecondition(assertion.op, context)) return { status: 'NOT_APPLICABLE', actual, reason: `conditional precondition for ${assertion.op} was not observed` };

  let passed = false;
  switch (assertion.op) {
    case 'eq':
    case 'eq_for_mastered': passed = actual === assertion.value; break;
    case 'not_eq': passed = actual !== assertion.value; break;
    case 'in': passed = Array.isArray(assertion.value) && assertion.value.includes(actual); break;
    case 'not_in': passed = Array.isArray(assertion.value) && !assertion.value.includes(actual); break;
    case 'lte':
    case 'lte_for_continue': passed = compareNumber(actual, assertion.value, (left, right) => left <= right); break;
    case 'gte':
    case 'gte_for_scoring':
    case 'gte_for_up':
    case 'gte_for_retention': passed = compareNumber(actual, assertion.value, (left, right) => left >= right); break;
    case 'lt': passed = compareNumber(actual, assertion.value, (left, right) => left < right); break;
    case 'gt': passed = compareNumber(actual, assertion.value, (left, right) => left > right); break;
    case 'length_eq': passed = Array.isArray(actual) && typeof assertion.value === 'number' && actual.length === assertion.value; break;
    case 'length_lte': passed = Array.isArray(actual) && typeof assertion.value === 'number' && actual.length <= assertion.value; break;
    case 'length_gte': passed = Array.isArray(actual) && typeof assertion.value === 'number' && actual.length >= assertion.value; break;
    case 'contains_all': passed = Array.isArray(actual) && Array.isArray(assertion.value) && assertion.value.every((item) => actual.includes(item)); break;
    case 'exists': passed = true; break;
    case 'max_value': {
      const values = actual && typeof actual === 'object' ? Object.values(actual as Record<string, unknown>) : [];
      const maximum = assertion.value;
      passed = values.length > 0 && typeof maximum === 'number' && values.every((item) => typeof item === 'number' && item <= maximum);
      break;
    }
  }
  return { status: passed ? 'PASS' : 'VIOLATION', actual, reason: passed ? 'assertion passed' : 'assertion failed' };
}

export function evaluateTeachingRule(skillId: TeachingRuleSet['skillId'], rule: TeachingRule, context: Record<string, unknown>): RuleEvaluation {
  if (rule.guard) {
    const guard = evaluateRuleAssertion(rule.guard, context);
    if (guard.status !== 'PASS') {
      return { skillId, ruleId: rule.ruleId, severity: rule.severity, status: 'NOT_APPLICABLE', actual: guard.actual, reason: `guard ${guard.reason}` };
    }
  }
  const result = evaluateRuleAssertion(rule.assertion, context);
  return { skillId, ruleId: rule.ruleId, severity: rule.severity, ...result };
}

export function evaluateTeachingRuleSets(ruleSets: TeachingRuleSet[], context: Record<string, unknown>) {
  return ruleSets.flatMap((skill) => skill.policies.map((rule) => evaluateTeachingRule(skill.skillId, rule, context)));
}
