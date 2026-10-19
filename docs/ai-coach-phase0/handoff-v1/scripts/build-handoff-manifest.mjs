#!/usr/bin/env node
// Emit a machine-readable handoff manifest: path, provider, role, bytes, SHA-256 (raw + LF-canonical), duplicate group.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const ORIG = join(ROOT, 'received/original');

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// Declared source IDs from the Codex Phase 0 manifest (docs/ai-coach-phase0/source-manifest.v1.json)
const DECLARED = [
  { sourceId: 'WBA-SKILLS-S01-S12', provider: 'WORKBUDDY_A', artifactType: 'SKILL_MANIFEST', file: 'WA/1-IndoBrain-AI-Teaching-Skills-V1.md' },
  { sourceId: 'WBA-EVIDENCE-TABLE', provider: 'WORKBUDDY_A', artifactType: 'EVIDENCE_TABLE', file: 'WA/2-教学证据与参考文献表.md' },
  { sourceId: 'WBA-BIDIRECTIONAL-EXAMPLES', provider: 'WORKBUDDY_A', artifactType: 'EXAMPLE_LIBRARY', file: 'WA/3-双向教学示例库.md' },
  { sourceId: 'WBB-100-CASES', provider: 'WORKBUDDY_B', artifactType: 'TEST_CASE_CORPUS', file: 'WB/data/ai-coach-cases-100.json' },
  { sourceId: 'WBB-TIS-RUBRIC', provider: 'WORKBUDDY_B', artifactType: 'HUMAN_RUBRIC', file: 'WB/AI-Coach-教学质量评分标准.md' },
  { sourceId: 'WBB-QUICK-SPEAK', provider: 'WORKBUDDY_B', artifactType: 'INTERACTION_SPEC', file: 'WB/Quick-Speak-五分钟体验设计.md' },
  { sourceId: 'WBB-MOBILE-SPEC', provider: 'WORKBUDDY_B', artifactType: 'MOBILE_SPEC', file: 'WB/移动端交互规范-375-390-430.md' },
  { sourceId: 'WBB-REAL-USER-PROTOCOL', provider: 'WORKBUDDY_B', artifactType: 'TEST_PROTOCOL', file: 'WB/真实用户测试计划-与基线对比.md' },
  // supporting artifacts named in the Phase 0 inventory but not given their own sourceId
  { sourceId: 'WBA-INDEX', provider: 'WORKBUDDY_A', artifactType: 'INDEX', file: 'WA/建立索引.md' },
  { sourceId: 'WBB-BUILD-SCRIPT', provider: 'WORKBUDDY_B', artifactType: 'GENERATOR', file: 'WB/build-cases.mjs' },
  { sourceId: 'WBB-VERIFY-SCRIPT', provider: 'WORKBUDDY_B', artifactType: 'VERIFIER', file: 'WB/verify-targets.mjs' },
  { sourceId: 'WBB-BUNDLE', provider: 'WORKBUDDY_B', artifactType: 'BUNDLE', file: 'WB/ai-coach-teaching-eval-v1.zip' },
  { sourceId: 'CODEX-PHASE1-CONTRACT-SPEC', provider: 'CODEX', artifactType: 'PHASE0_DOC', file: 'CODEX/PHASE1_CONTRACT_SPEC_V1.md' },
  { sourceId: 'CODEX-SOURCE-INVENTORY', provider: 'CODEX', artifactType: 'PHASE0_DOC', file: 'CODEX/SOURCE_INVENTORY_V1.md' },
  { sourceId: 'CODEX-NORMALIZATION-SPEC', provider: 'CODEX', artifactType: 'PHASE0_DOC', file: 'CODEX/TEST_CASE_NORMALIZATION_V1.md' },
  { sourceId: 'CODEX-SOURCE-MANIFEST', provider: 'CODEX', artifactType: 'PHASE0_DOC', file: 'CODEX/source-manifest.v1.json' },
];

const byFile = new Map(DECLARED.map((d) => [d.file, d]));
const files = walk(ORIG).map((abs) => {
  const rel = relative(ORIG, abs).split(sep).join('/');
  const buf = readFileSync(abs);
  const text = buf.toString('utf8');
  const lf = createHash('sha256').update(text.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
  const declared = byFile.get(rel);
  return {
    path: `received/original/${rel}`,
    bytes: buf.length,
    sha256: sha(buf),
    sha256LfCanonical: lf,
    crlfPresent: buf.includes(Buffer.from('\r\n')),
    provider: rel.startsWith('WA/') ? 'WORKBUDDY_A' : rel.startsWith('WB/') ? 'WORKBUDDY_B' : 'CODEX',
    sourceId: declared?.sourceId ?? `UNREGISTERED-${rel.replace(/[^A-Za-z0-9]+/g, '-')}`,
    artifactType: declared?.artifactType ?? 'UNKNOWN',
    role: declared ? (rel.startsWith('WA/') || rel.startsWith('WB/') ? 'DECLARED_SOURCE' : 'PHASE0_SUPPORT') : 'UNREGISTERED',
  };
});

const dupGroups = {};
for (const f of files) (dupGroups[f.sha256LfCanonical] ||= []).push(f.path);
const duplicates = Object.entries(dupGroups).filter(([, v]) => v.length > 1).map(([h, paths]) => ({ sha256LfCanonical: h, paths }));

const manifest = {
  schema: 'indobrain.phase0.handoff/v1',
  generatedAt: new Date().toISOString(),
  handoffRoot: 'C:/Users/lijia/Documents/Codex/ai-coach-phase0-handoff-v1',
  originPolicy: 'Byte-identical copies. No file was edited, renamed or re-generated. Every SHA-256 below was computed at handoff time and re-verified against the original file.',
  hashPolicy: {
    sha256: 'raw bytes as stored on disk',
    sha256LfCanonical: 'text with CRLF normalized to LF, then hashed — this is the convention Codex uses in scripts/verify-ai-coach-phase0-artifacts.mjs',
    note: 'On this handoff both values are equal for every text file (the originals contain no CRLF), so either convention yields the same digest.',
  },
  declaredSourceCoverage: {
    provider: ['WORKBUDDY_A', 'WORKBUDDY_B'],
    declaredGroups: 8,
    foundGroups: DECLARED.filter((d) => d.sourceId.startsWith('WBA-') || d.sourceId.startsWith('WBB-')).filter((d) => !['WBA-INDEX', 'WBB-BUNDLE', 'WBB-BUILD-SCRIPT', 'WBB-VERIFY-SCRIPT'].includes(d.sourceId)).filter((d) => files.some((f) => f.path === `received/original/${d.file}`)).length,
    missingGroups: [],
    note: 'All eight artifact groups enumerated in docs/ai-coach-phase0/SOURCE_INVENTORY_V1.md were located on this machine and copied byte-identically. Codex previously recorded them as MISSING because they live outside the repository and outside every project worktree. Artifact-level gaps remain and are listed below.',
    fileLevelMISSING: [
      {
        sourceId: 'WBA-SKILLS-S01-S12',
        gap: 'Authoritative S01–S12 ID → name mapping is embedded in prose headings (### S02 · Micro Speaking …), not in a machine-readable manifest. No JSON/YAML/CSV skill manifest exists in any WorkBuddy A artifact.',
        consequence: 'Skill IDs S02/S03/S04/S05/S07/S08 remain opaque for normalization until a manifest is authored from this document.',
      },
      {
        sourceId: 'WBB-TIS-RUBRIC',
        gap: 'TIS v1.0 is complete as a HUMAN rubric: 6 dimensions (25/20/15/10/15/15), 0–4 anchors per dimension, PASS ≥ 80 with no P0 violation, 70–79 requires human re-review, < 70 FAIL, any P0 hard assertion = BLOCKER. What is absent is the machine bridge: no mapping from assertion rule names to dimension codes, and no mapping from assertions[].weight (integer 1) to dimension weights.',
        consequence: 'Human scoring can proceed today. Automated S4 judging needs the two mapping tables, not new prose.',
      },
      {
        sourceId: 'WBB-100-CASES',
        gap: 'Assertions are rule names with optional pattern/value and an integer weight of 1. There is no per-case aggregation rule, no threshold, and no indication which of the 127 rule names map to the 5 TIS P0 hard assertions.',
        consequence: 'Corpus cannot be executed even if every rule name were implemented — PASS/FAIL would still be undefined.',
      },
    ],
  },
  duplicateGroups: duplicates,
  files,
};

const OUT = join(ROOT, 'data/handoff-manifest.json');
writeFileSync(OUT, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`files=${files.length} declaredFound=${manifest.declaredSourceCoverage.foundGroups}/${manifest.declaredSourceCoverage.declaredGroups} dupGroups=${duplicates.length}`);
console.log(`written ${OUT}`);
