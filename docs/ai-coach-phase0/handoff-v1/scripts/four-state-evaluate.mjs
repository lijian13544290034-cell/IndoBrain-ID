#!/usr/bin/env node
// AI Coach Phase 0 handoff — four-state separation for the WorkBuddy B 100-case corpus.
//
// S1 EXISTS              the record is present and parseable
// S2 FORMAT_VALID        the record satisfies the field contract it declares
// S3 CURRICULUM_GOAL_VALID  the target expression really belongs to the referenced course location
// S4 TEACHING_STANDARD_VALID  an executable judge can decide pass/fail for the declared assertions
//
// Read-only. Writes nothing into any repository.
// Usage: node scripts/four-state-evaluate.mjs [--repo <path>] [--json]

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SRC = join(ROOT, 'received/original/WB/data/ai-coach-cases-100.json');
const OUT = join(ROOT, 'data/four-state-result.json');

const argv = process.argv.slice(2);
const repoArg = argv.indexOf('--repo');
const REPO = repoArg >= 0 ? argv[repoArg + 1] : (process.env.INDOBRAIN_REPO || 'C:/Users/lijia/Desktop/IndoBrain-B2-3-rt');

const raw = JSON.parse(readFileSync(SRC, 'utf8'));
const cases = raw.cases;

const course = readFileSync(join(REPO, 'lib/mandarin-work-course.ts'), 'utf8');
const l2 = readFileSync(join(REPO, 'lib/server/mandarin-work-level2.ts'), 'utf8');
const driver = readFileSync(join(REPO, 'lib/driver-experiences.ts'), 'utf8');

// ---------- lexicon extraction (day level) ----------
const dailyBlock = course.match(/const daily: string\[\]\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? '';
const starts = [...dailyBlock.matchAll(/\n\s*\[/g)].map((m) => m.index);
const daySets = {};
starts.forEach((s, i) => {
  const e = starts[i + 1] ?? dailyBlock.length;
  daySets[i + 1] = new Set((dailyBlock.slice(s, e).match(/'[^']*'/g) || []).map((q) => q.slice(1, -1)));
});
const allDayWords = new Set(Object.values(daySets).flatMap((s) => [...s]));

const dlg = course.match(/const dialogues: Record<number[\s\S]*?\n\};/)?.[0] ?? '';
const LEX = {
  COURSE: new Set(((dailyBlock + dlg).match(/[\u3400-\u9FFF]+/g) || [])),
  LEVEL2: new Set(l2.match(/[\u3400-\u9FFF]+/g) || []),
  DRIVER: new Set(driver.match(/[\u3400-\u9FFF]+/g) || []),
};

const clean = (s) => (s || '').replace(/[？?。！!，,、…\s/]/g, '');
const dayOf = (ref) => { const m = /#D(\d+)/.exec(ref || ''); return m ? Number(m[1]) : null; };

// probe A — corpus-wide substring resolution, same algorithm WorkBuddy B used in verify-targets.mjs
function looseResolve(zh) {
  const c = clean(zh);
  if (!c) return { ok: false, how: 'no-chinese-target' };
  for (const [name, set] of Object.entries(LEX)) {
    if (set.has(c)) return { ok: true, how: `${name}:exact` };
    for (let len = c.length; len >= 2; len -= 1)
      for (let i = 0; i + len <= c.length; i += 1)
        if (set.has(c.slice(i, i + len))) return { ok: true, how: `${name}:part(${c.slice(i, i + len)})` };
  }
  return { ok: false, how: 'not-found' };
}

// probe B — day-anchored resolution: does the target equal a word taught on the referenced day?
function strictResolve(c) {
  const zh = clean(c.target_content?.chinese);
  const d = dayOf(c.curriculum_ref);
  if (!zh) return 'NO_TARGET';
  if (d == null) return 'NO_DAY_REF';
  if (daySets[d]?.has(zh)) return 'EXACT_DAY';
  if ([...daySets[d]].some((x) => zh.includes(x) || x.includes(zh))) return 'PARTIAL_DAY';
  if (allDayWords.has(zh)) return 'OTHER_DAY';
  return 'NOT_IN_COURSE';
}

// ---------- S2 ----------
const REQUIRED = ['case_id','learning_direction','learner_level','learner_behavior','goal','scenario','student_input',
  'input_mode','expected_teacher_action','forbidden_teacher_action','success_criteria','severity','target_content',
  'curriculum_ref','assertions','failure_signature','baseline_expectation','tags','in_curriculum'];
const s2Failures = [];
for (const c of cases) {
  const miss = REQUIRED.filter((k) => c[k] === undefined || c[k] === null || (typeof c[k] === 'string' && !c[k].trim()));
  if (miss.length) { s2Failures.push({ id: c.case_id, missing: miss }); continue; }
  if (!Array.isArray(c.assertions) || !c.assertions.length) { s2Failures.push({ id: c.case_id, missing: ['assertions:empty'] }); continue; }
  if (c.assertions.some((a) => !a || !a.rule)) { s2Failures.push({ id: c.case_id, missing: ['assertion.rule'] }); }
}
const CODEX_SCHEMA_FIELDS = ['caseId','source','sourceVersion','sourceLocator','category','direction','evaluationMode',
  'skillIds','preconditions','input','expected','references','normalizationStatus'];
const schemaTouching = cases.filter((c) => CODEX_SCHEMA_FIELDS.some((k) => c[k] !== undefined)).length;
const withSkillIds = cases.filter((c) => Array.isArray(c.skillIds) && c.skillIds.length).length;

// ---------- rows ----------
const rows = cases.map((c) => {
  const loose = looseResolve(c.target_content?.chinese);
  const strict = strictResolve(c);
  const consistent = loose.ok
    ? (strict !== 'NOT_IN_COURSE')
    : (strict === 'NOT_IN_COURSE' || strict === 'NO_DAY_REF');
  return {
    caseId: c.case_id,
    direction: c.learning_direction,
    target: c.target_content?.chinese ?? null,
    curriculumRef: c.curriculum_ref ?? null,
    declaredInCurriculum: c.in_curriculum ?? null,
    S1: true,
    S2: !s2Failures.some((f) => f.id === c.case_id),
    S3_loose: loose.ok,
    S3_looseHow: loose.how,
    S3_strict: strict,
    S3_consistent: consistent,
    S4: false,
    S4_reason: 'NO_JUDGE',
  };
});

const tally = (arr) => arr.reduce((acc, k) => (acc[k] = (acc[k] || 0) + 1, acc), {});
const strictCounts = tally(rows.map((r) => r.S3_strict));
const rules = new Set();
cases.forEach((c) => (c.assertions || []).forEach((a) => a.rule && rules.add(a.rule)));

const result = {
  schema: 'indobrain.ai-coach.four-state/v1',
  generatedAt: new Date().toISOString(),
  source: 'received/original/WB/data/ai-coach-cases-100.json',
  corpusVersion: raw.meta?.version ?? null,
  corpusGeneratedAt: raw.meta?.generated_at ?? null,
  declaredBaseline: raw.meta?.repo_baseline ?? null,
  evaluatedAgainst: REPO,
  total: cases.length,
  states: {
    S1_EXISTS: {
      count: rows.filter((r) => r.S1).length, of: cases.length, status: 'PASS',
      definition: 'record present and JSON-parseable',
    },
    S2_FORMAT_VALID: {
      count: rows.filter((r) => r.S2).length, of: cases.length,
      status: s2Failures.length ? 'PARTIAL' : 'PASS',
      definition: 'all 19 declared fields non-empty, assertions array well-formed with a rule name on every entry',
      failures: s2Failures,
      conformanceToCodexSchemaV1: {
        schema: 'docs/ai-coach-phase0/teaching-test-case.schema.v1.json',
        casesTouchingAnySchemaField: schemaTouching,
        casesWithSkillIds: withSkillIds,
        verdict: 'NOT CONFORMANT — none of the 13 schema-required fields exist in the corpus; normalization is a re-authoring task, not a rename',
      },
    },
    S3_CURRICULUM_GOAL_VALID: {
      countLoose: rows.filter((r) => r.S3_loose).length, of: cases.length, status: 'PARTIAL',
      countDayAnchoredExact: strictCounts.EXACT_DAY ?? 0,
      countDayAnchoredAny: (strictCounts.EXACT_DAY ?? 0) + (strictCounts.PARTIAL_DAY ?? 0),
      definition: 'the target expression resolves to real course material AND to the referenced day',
      probeA_corpusWide: {
        description: 'substring match against course/L2/driver lexicons at the checked baseline (WorkBuddy B verify-targets.mjs semantics)',
        pass: rows.filter((r) => r.S3_loose).length,
        fail: rows.filter((r) => !r.S3_loose).map((r) => ({ caseId: r.caseId, target: r.target, ref: r.curriculumRef })),
      },
      probeB_dayAnchored: { description: 'target must equal (or contain) a word taught on the day named in curriculum_ref', counts: strictCounts },
      crossProbeConflicts: rows.filter((r) => !r.S3_consistent)
        .map((r) => ({ caseId: r.caseId, target: r.target, ref: r.curriculumRef, loose: r.S3_loose, strict: r.S3_strict })),
      verdict: 'PARTIAL — half the corpus has no day reference, and only one fifth is exactly a word from the referenced day',
    },
    S4_TEACHING_STANDARD_VALID: {
      count: 0, of: cases.length, status: 'NOT VERIFIED',
      definition: 'an executable judge can decide pass/fail for the assertions declared on the case',
      distinctRuleNamesDeclared: rules.size,
      ruleNamesWithImplementation: 0,
      reason: 'Assertions are declarative rule names. No evaluator implements them. The TIS rubric DOES define PASS/FAIL thresholds (PASS >= 80 with no P0 violation, < 70 FAIL, any P0 hard assertion = BLOCKER) but they are thresholds on a human 0-4 score, and no mapping exists from assertion rule names to TIS dimensions or P0 assertions. S4 cannot be reached by editing the corpus — it needs two mapping tables plus an evaluator.',
    },
  },
  // the only four-state matrix that is honest about this corpus:
  matrix: {
    exists_notFormatValid: rows.filter((r) => r.S1 && !r.S2).length,
    existsFormatValid_notCurriculumValid: rows.filter((r) => r.S1 && r.S2 && !r.S3_loose).length,
    existsFormatValid_curriculumValid_notStandardValid: rows.filter((r) => r.S1 && r.S2 && r.S3_loose).length,
    fullyValid: rows.filter((r) => r.S1 && r.S2 && r.S3_loose && r.S4).length,
  },
  ruleNameInventory: [...rules].sort(),
  rows,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8');

if (!argv.includes('--json')) {
  const s = result.states;
  console.log('AI COACH FOUR-STATE EVALUATION');
  console.log(`  source          ${result.source}`);
  console.log(`  baseline        ${result.declaredBaseline}  (checked: ${result.evaluatedAgainst})`);
  console.log(`  S1 EXISTS              ${s.S1_EXISTS.count}/${cases.length}  ${s.S1_EXISTS.status}`);
  console.log(`  S2 FORMAT_VALID        ${s.S2_FORMAT_VALID.count}/${cases.length}  ${s.S2_FORMAT_VALID.status}   (vs Codex schema v1: ${schemaTouching}/${cases.length} conformant)`);
  console.log(`  S3 CURRICULUM_VALID    ${s.S3_CURRICULUM_GOAL_VALID.countLoose}/${cases.length}  ${s.S3_CURRICULUM_GOAL_VALID.status}   (day-anchored exact: ${s.S3_CURRICULUM_GOAL_VALID.countDayAnchoredExact}/${cases.length})`);
  console.log(`  S4 STANDARD_VALID      ${s.S4_TEACHING_STANDARD_VALID.count}/${cases.length}  ${s.S4_TEACHING_STANDARD_VALID.status}   (${rules.size} rules declared, 0 implemented)`);
  console.log(`  matrix          100 exist -> ${result.matrix.existsFormatValid_curriculumValid_notStandardValid} reach S3 -> ${result.matrix.fullyValid} reach S4`);
  console.log(`  written         ${OUT}`);
}
