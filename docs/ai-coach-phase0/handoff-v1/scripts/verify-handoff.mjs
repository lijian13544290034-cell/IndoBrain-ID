#!/usr/bin/env node
// Self-check: re-hash every received file against data/handoff-manifest.json and re-assert the four-state numbers.
// Exit code 0 = handoff intact. Non-zero = do not trust the handoff.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const manifest = JSON.parse(readFileSync(join(ROOT, 'data/handoff-manifest.json'), 'utf8'));
const four = JSON.parse(readFileSync(join(ROOT, 'data/four-state-result.json'), 'utf8'));

let fail = 0;
const bad = (msg) => { console.log(`FAIL ${msg}`); fail += 1; };

for (const f of manifest.files) {
  const abs = join(ROOT, f.path);
  const buf = readFileSync(abs);
  const raw = createHash('sha256').update(buf).digest('hex');
  const lf = createHash('sha256').update(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8').digest('hex');
  if (raw !== f.sha256) bad(`${f.path} raw hash drift`);
  if (lf !== f.sha256LfCanonical) bad(`${f.path} lf hash drift`);
  if (buf.length !== f.bytes) bad(`${f.path} size drift (${buf.length} != ${f.bytes})`);
}

const s = four.states;
const expect = (got, want, name) => { if (got !== want) bad(`${name}: ${got} != ${want}`); };
expect(s.S1_EXISTS.count, 100, 'S1');
expect(s.S2_FORMAT_VALID.count, 100, 'S2');
expect(s.S3_CURRICULUM_GOAL_VALID.countLoose, 93, 'S3 loose');
expect(s.S3_CURRICULUM_GOAL_VALID.countDayAnchoredExact, 20, 'S3 day-exact');
expect(s.S4_TEACHING_STANDARD_VALID.count, 0, 'S4');
expect(s.S4_TEACHING_STANDARD_VALID.ruleNamesWithImplementation, 0, 'S4 impl');
expect(s.S2_FORMAT_VALID.conformanceToCodexSchemaV1.casesWithSkillIds, 0, 'schema skillIds');
expect(s.S3_CURRICULUM_GOAL_VALID.crossProbeConflicts.length, 4, 'cross-probe conflicts');
expect(four.total, 100, 'total');

const byProvider = manifest.files.reduce((a, f) => (a[f.provider] = (a[f.provider] || 0) + 1, a), {});
console.log(`files=${manifest.files.length} WA=${byProvider.WORKBUDDY_A || 0} WB=${byProvider.WORKBUDDY_B || 0} CODEX=${byProvider.CODEX || 0}`);
console.log(fail === 0 ? 'HANDOFF INTACT' : `HANDOFF BROKEN (${fail} problems)`);
process.exit(fail === 0 ? 0 : 1);
