import type { DimensionEvidenceSummary, FiveDimensionEvidence, MasteryDimension, MasterySnapshot, MasteryStatus, TeachingEvidence } from './contracts';
import { validateTeachingEvidence } from './evidence-validator';

const dimensions: MasteryDimension[] = ['UNDERSTANDING', 'RECALL', 'PRONUNCIATION', 'LISTENING', 'APPLICATION'];

const emptyDimension = (): DimensionEvidenceSummary => ({ successes: 0, learnerErrors: 0, noEvidence: 0, level: 0, acousticVerified: false, lastEvidenceAt: null });

export function createEmptyMasterySnapshot(legacyMasteryLevel: 0 | 1 | 2 | 3 | 4 | null = null): MasterySnapshot {
  return {
    status: legacyMasteryLevel && legacyMasteryLevel > 0 ? 'PRACTICED' : 'NOT_STARTED',
    dimensions: Object.fromEntries(dimensions.map((dimension) => [dimension, emptyDimension()])) as FiveDimensionEvidence,
    acceptedEvidence: [],
    ignoredTechnicalEvidence: [],
    legacyMasteryLevel,
  };
}

function levelFor(summary: DimensionEvidenceSummary): 0 | 1 | 2 | 3 | 4 {
  if (!summary.successes) return 0;
  if (summary.successes === 1) return 1;
  if (summary.successes <= 3) return summary.learnerErrors > summary.successes ? 1 : 2;
  return summary.learnerErrors > summary.successes ? 2 : 3;
}

function independentEvidence(evidence: TeachingEvidence) {
  return evidence.outcome === 'SUCCESS'
    && evidence.promptLevel === 'NONE'
    && (evidence.source === 'UNPROMPTED_RECALL' || evidence.source === 'TRANSFER_TASK');
}

function deriveStatus(evidence: TeachingEvidence[]): MasteryStatus {
  if (!evidence.length) return 'NOT_STARTED';
  const independent = evidence.filter(independentEvidence);
  if (!independent.length) return 'PRACTICED';
  const occasions = new Set(independent.map((item) => item.occurredAt.slice(0, 10)));
  const dimensionsSeen = new Set(independent.map((item) => item.dimension));
  const mastered = independent.length >= 2
    && occasions.size >= 2
    && dimensionsSeen.has('RECALL')
    && dimensionsSeen.has('APPLICATION');
  return mastered ? 'MASTERED' : 'INDEPENDENT';
}

export function applyTeachingEvidence(snapshot: MasterySnapshot, evidence: TeachingEvidence): MasterySnapshot {
  const validation = validateTeachingEvidence(evidence);
  if (!validation.accepted) {
    if (validation.reason !== 'NO_EVIDENCE') return snapshot;
    const dimension = snapshot.dimensions[evidence.dimension];
    return {
      ...snapshot,
      dimensions: { ...snapshot.dimensions, [evidence.dimension]: { ...dimension, noEvidence: dimension.noEvidence + 1 } },
      ignoredTechnicalEvidence: [...snapshot.ignoredTechnicalEvidence, validation.normalized],
    };
  }
  const current = snapshot.dimensions[evidence.dimension];
  const next: DimensionEvidenceSummary = {
    ...current,
    successes: current.successes + (evidence.outcome === 'SUCCESS' ? 1 : 0),
    learnerErrors: current.learnerErrors + (evidence.outcome === 'LEARNER_ERROR' ? 1 : 0),
    acousticVerified: current.acousticVerified || evidence.source === 'ACOUSTIC_ASSESSMENT',
    lastEvidenceAt: evidence.occurredAt,
  };
  next.level = evidence.dimension === 'PRONUNCIATION' && !next.acousticVerified
    ? Math.min(1, levelFor(next)) as 0 | 1
    : levelFor(next);
  const acceptedEvidence = [...snapshot.acceptedEvidence, validation.normalized];
  return {
    ...snapshot,
    dimensions: { ...snapshot.dimensions, [evidence.dimension]: next },
    acceptedEvidence,
    status: deriveStatus(acceptedEvidence),
  };
}
