// Verify every target_content / curriculum_ref against the real repo at a86dde0.
// Read-only. No writes into the repo.
import { readFileSync } from 'node:fs';

const REPO = 'C:/Users/lijia/Desktop/IndoBrain-B2-3-rt';
const data = JSON.parse(readFileSync('data/ai-coach-cases-100.json', 'utf8'));

// Pull the known-real lexicons directly from source files.
const course = readFileSync(`${REPO}/lib/mandarin-work-course.ts`, 'utf8');
const l2 = readFileSync(`${REPO}/lib/server/mandarin-work-level2.ts`, 'utf8');
const driver = readFileSync(`${REPO}/lib/driver-experiences.ts`, 'utf8');
const brain = readFileSync(`${REPO}/lib/server/mandarin-coach-brain.ts`, 'utf8');

// Extract all Chinese strings present in the day tables (D1-D30 + dialogues)
const dayBlocks = course.match(/const daily: string\[\]\[\] = \[([\s\S]*?)\n\];/);
const dayText = dayBlocks ? dayBlocks[1] : '';
const dialogueBlock = course.match(/const dialogues: Record<number[\s\S]*?\n\};/);
const dialogueText = dialogueBlock ? dialogueBlock[0] : '';
const level1Lexicon = new Set(
  (dayText + dialogueText).match(/[\u3400-\u9FFF]+/g) || []
);
const level2Lexicon = new Set(l2.match(/[\u3400-\u9FFF]+/g) || []);
const driverLexicon = new Set(driver.match(/[\u3400-\u9FFF]+/g) || []);

function strip(s) { return (s || '').replace(/[？?。！!，,、…\s/]/g, ''); }

// A chinese target is "found" if the normalized string, or its longest chunk,
// appears in any real lexicon.
function existsIn(chinese, lexicons) {
  const clean = strip(chinese);
  if (!clean) return { ok: true, how: 'no-chinese-target' };
  for (const [name, set] of Object.entries(lexicons)) {
    if (set.has(clean)) return { ok: true, how: `${name}:exact` };
    // try substring of length >= 2
    for (const part of clean.split('')) { /* noop */ }
    const candidates = [];
    for (let len = clean.length; len >= 2; len -= 1) {
      for (let i = 0; i + len <= clean.length; i += 1) candidates.push(clean.slice(i, i + len));
    }
    for (const cand of candidates) if (set.has(cand)) return { ok: true, how: `${name}:part(${cand})` };
  }
  return { ok: false, how: 'not-found' };
}

const lexicons = { L1: level1Lexicon, L2: level2Lexicon, DRV: driverLexicon, BRAIN: new Set(brain.match(/[\u3400-\u9FFF]+/g) || []) };

const rows = [];
for (const c of data.cases) {
  const t = c.target_content;
  if (!t) { rows.push({ id: c.case_id, status: 'NO_TARGET', detail: '' }); continue; }
  const chinese = t.chinese || '';
  const r = existsIn(chinese, lexicons);
  rows.push({ id: c.case_id, dir: c.learning_direction, chinese, indonesian: t.indonesian || '', ref: c.curriculum_ref, status: r.ok ? 'OK' : 'MISSING', how: r.how });
}

// Indonesian-side targets cannot be checked against repo lexicons (repo has no ID course content),
// so classify them separately.
const zToId = rows.filter((r) => r.dir === 'ZH_TO_ID');
const idToZh = rows.filter((r) => r.dir === 'ID_TO_ZH');

const okZ = zToId.filter((r) => r.status === 'OK');
const missingZ = zToId.filter((r) => r.status !== 'OK');

console.log('=== ZH_TO_ID (Indonesian targets) ===');
console.log(`total ${zToId.length} | chinese-side cross-check OK ${okZ.length} | not found ${missingZ.length}`);
for (const r of missingZ) console.log(`  ${r.id}  ${r.chinese}  ${r.how}`);

console.log('\n=== ID_TO_ZH (Chinese targets) ===');
const okB = idToZh.filter((r) => r.status === 'OK');
const missingB = idToZh.filter((r) => r.status !== 'OK');
console.log(`total ${idToZh.length} | verified in real curriculum ${okB.length} | not found ${missingB.length}`);
for (const r of missingB) console.log(`  ${r.id}  ${r.chinese}  ${r.how}  ref=${r.ref}`);

console.log('\n=== ref file existence ===');
const { existsSync } = await import('node:fs');
const refFiles = new Set();
for (const c of data.cases) {
  const m = (c.curriculum_ref || '').match(/^([\w.\-/\[\]]+?)(?:#|:|$)/);
  if (m) refFiles.add(m[1]);
}
for (const f of [...refFiles].sort()) {
  const p = `${REPO}/${f}`;
  console.log(`${existsSync(p) ? 'OK      ' : 'MISSING '} ${f}`);
}
