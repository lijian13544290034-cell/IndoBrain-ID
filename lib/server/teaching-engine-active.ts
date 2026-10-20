import 'server-only';

import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { orchestrateTeachingTurn } from '@/lib/teaching-engine/orchestrator';
import type { PromptLevel, TeachingStage, TechnicalFailureReason } from '@/lib/teaching-engine/contracts';
import { assertTeachingTelemetryInvariant, type ActiveOutcome, type ActiveTeachingSession, type HintType, type TeachingTurnTelemetry } from '@/lib/teaching-engine/telemetry-contracts';

type ActiveInput = {
  requestId: string;
  lessonId: string;
  message: string;
  modality: 'VOICE' | 'TEXT';
  startRequested: boolean;
  sessionKey: string;
  sessionToken: string | null;
};

type ActiveSessionEntry = {
  version: 1;
  sessionKeyHash: string;
  lessonId: string;
  state: ActiveTeachingSession;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
};

const ACTIVE_SESSION_TTL_MS = 30 * 60 * 1000;
const ACTIVE_SESSION_LIMIT = 1_000;
const consumedNonces = new Map<string, number>();
const localDevelopmentSecret = randomBytes(32).toString('hex');

export class ActiveTeachingStateError extends Error {
  readonly code = 'ACTIVE_TEACHING_STATE_INVALID';

  constructor() {
    super('Active teaching state is missing, expired, replayed, or belongs to another session.');
    this.name = 'ActiveTeachingStateError';
  }
}

const objective = {
  surface: '我明天上班' as const,
  pinyin: 'wǒ míng tiān shàng bān' as const,
  meaningId: 'Besok saya masuk kerja.' as const,
  courseReferenceStatus: 'TEMPORARY_TEACHING_OBJECTIVE' as const,
  introducedDayByToken: { 我: 1 as const, 明天: 6 as const, 上班: 27 as const },
  anchorExpressionIds: ['CN-WORK-D01-I02', 'CN-WORK-D06-I02', 'CN-WORK-D27-I01'] as const,
};

const emptyState = (): ActiveTeachingSession => ({
  schema: 'indobrain.active-teaching-session/v1',
  objectiveId: 'temporary:wo-mingtian-shangban',
  stage: 'DIAGNOSE', promptLevel: 'TASK_ONLY', attempts: 0, consecutiveErrors: 0,
  consecutiveSuccesses: 0, hints: 0, prerequisitesVerified: false, masteryStatus: 'NOT_STARTED',
});

function signingSecret() {
  const configured = process.env.PREVIEW_QA_SESSION_SECRET
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SECRET_KEY;
  if (configured) return createHash('sha256').update(`indobrain-active-teaching-v1:${configured}`).digest();
  if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production') throw new ActiveTeachingStateError();
  return createHash('sha256').update(`indobrain-active-teaching-v1:${localDevelopmentSecret}`).digest();
}

function removeExpiredNonces(now = Date.now()) {
  for (const [nonce, expiresAt] of consumedNonces) {
    if (expiresAt <= now) consumedNonces.delete(nonce);
  }
  while (consumedNonces.size >= ACTIVE_SESSION_LIMIT) {
    const oldest = consumedNonces.keys().next().value;
    if (typeof oldest !== 'string') break;
    consumedNonces.delete(oldest);
  }
}

function sessionKeyHash(sessionKey: string) {
  return createHash('sha256').update(sessionKey).digest('base64url');
}

function parseTrustedState(value: unknown): ActiveTeachingSession | null {
  if (!value || typeof value !== 'object') return null;
  const state = value as Partial<ActiveTeachingSession>;
  const stages: TeachingStage[] = ['DIAGNOSE', 'MODEL', 'SPEAK', 'EVALUATE', 'HINT', 'RETRY', 'ADVANCE', 'TRANSFER_TEST', 'COMPLETE'];
  const prompts: PromptLevel[] = ['NONE', 'TASK_ONLY', 'SEMANTIC_CUE', 'FIRST_WORD', 'FULL_MODEL'];
  if (state.schema !== 'indobrain.active-teaching-session/v1'
    || state.objectiveId !== 'temporary:wo-mingtian-shangban'
    || !state.stage || !stages.includes(state.stage)
    || !state.promptLevel || !prompts.includes(state.promptLevel)
    || !Number.isInteger(state.attempts) || !Number.isInteger(state.consecutiveErrors)
    || !Number.isInteger(state.consecutiveSuccesses) || !Number.isInteger(state.hints)
    || state.attempts! < 0 || state.attempts! > 20
    || state.consecutiveErrors! < 0 || state.consecutiveErrors! > 10
    || state.consecutiveSuccesses! < 0 || state.consecutiveSuccesses! > 10
    || state.hints! < 0 || state.hints! > 4
    || typeof state.prerequisitesVerified !== 'boolean'
    || !['NOT_STARTED', 'PRACTICED', 'INDEPENDENT'].includes(String(state.masteryStatus))) return null;
  return state as ActiveTeachingSession;
}

function requireTrustedState(input: ActiveInput, consume = true) {
  removeExpiredNonces();
  if (!input.sessionToken) throw new ActiveTeachingStateError();
  const [encodedPayload, encodedSignature, ...extra] = input.sessionToken.split('.');
  if (!encodedPayload || !encodedSignature || extra.length) throw new ActiveTeachingStateError();
  const expected = createHmac('sha256', signingSecret()).update(encodedPayload).digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(encodedSignature, 'base64url');
  } catch {
    throw new ActiveTeachingStateError();
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new ActiveTeachingStateError();
  let payload: ActiveSessionEntry;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as ActiveSessionEntry;
  } catch {
    throw new ActiveTeachingStateError();
  }
  const now = Date.now();
  const state = parseTrustedState(payload.state);
  if (payload.version !== 1 || payload.sessionKeyHash !== sessionKeyHash(input.sessionKey)
    || payload.lessonId !== input.lessonId || !state
    || !Number.isFinite(payload.issuedAt) || payload.issuedAt > now + 30_000
    || !Number.isFinite(payload.expiresAt) || payload.expiresAt <= now
    || typeof payload.nonce !== 'string' || (consume && consumedNonces.has(payload.nonce))) throw new ActiveTeachingStateError();
  if (consume) consumedNonces.set(payload.nonce, payload.expiresAt);
  return state;
}

function commitTrustedState(input: ActiveInput, state: ActiveTeachingSession) {
  removeExpiredNonces();
  const issuedAt = Date.now();
  const payload: ActiveSessionEntry = {
    version: 1,
    sessionKeyHash: sessionKeyHash(input.sessionKey),
    lessonId: input.lessonId,
    state,
    nonce: randomUUID(),
    issuedAt,
    expiresAt: issuedAt + ACTIVE_SESSION_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', signingSecret()).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

const normalize = (text: string) => text.replace(/[\s，。！？,.!?]/g, '').toLowerCase();
const asksMeaning = (text: string) => /artinya|maksud|apa arti|什么意思|tidak mengerti|nggak ngerti|gak ngerti/i.test(text);
const asksDemo = (text: string) => /ulang|contoh|dengar|示范|再说|再来|sekali lagi/i.test(text);
const asksHelp = (text: string) => /tidak tahu|tidak bisa|nggak bisa|gak bisa|susah|不会|不懂/i.test(text);
const offTopic = (text: string) => /bitcoin|saham|politik|cuaca|game|selebriti|明星|股票|天气|写程序/i.test(text);

function prerequisiteCheck(text: string) {
  const value = normalize(text);
  return (/(saya|aku)/i.test(value) || value.includes('我'))
    && /(besok)/i.test(value) && /(kerja|masukkerja)/i.test(value);
}

function attemptOutcome(text: string, target: '我明天上班' | '我今天上班'): 'EXACT' | 'PARTIAL' | 'WRONG' {
  const value = normalize(text);
  if (value === target) return 'EXACT';
  const tokens = target === '我明天上班' ? ['我', '明天', '上班'] : ['我', '今天', '上班'];
  const recalled = tokens.filter((token) => value.includes(token)).length;
  return recalled >= 2 ? 'PARTIAL' : 'WRONG';
}

function answer(text: string, chinese = '', pinyin = '', indonesian = '', strategy = 'ACTIVE_TEACHING') {
  return {
    answer: text, chinese, pinyin, indonesian, followUp: '', summary: 'Latihan aktif sementara: 我明天上班',
    ttsRate: 'slow' as const, teachingStrategy: strategy, rememberTarget: false,
    targetChinese: objective.surface, targetPinyin: objective.pinyin, targetMeaning: objective.meaningId,
    skillGap: false, skillGapReason: '',
  };
}

function telemetry(input: ActiveInput, state: ActiveTeachingSession, next: ActiveTeachingSession, config: {
  path: TeachingStage[]; outcome?: ActiveOutcome; kind?: TeachingTurnTelemetry['evidence']['kind']; source?: TeachingTurnTelemetry['evidence']['source'];
  action: string; hint?: HintType; correction?: TeachingTurnTelemetry['teaching']['correctionType']; recordsFailure?: boolean; technical?: TechnicalFailureReason;
}): TeachingTurnTelemetry {
  const turn: TeachingTurnTelemetry = {
    schema: 'indobrain.teaching-turn-telemetry/v1', turnId: input.requestId, lessonId: input.lessonId, direction: 'ID_TO_ZH',
    stage: state.stage, stagePath: config.path,
    objective: { ...objective, prerequisitesVerified: next.prerequisitesVerified },
    input: { modality: input.modality, text: input.message, sttConfidence: null },
    evidence: {
      kind: config.kind ?? 'NONE', outcome: config.outcome ?? 'NO_EVIDENCE', promptLevel: state.promptLevel,
      source: config.source ?? 'NONE', acousticVerified: false,
      written: input.modality === 'TEXT' && config.kind != null && config.kind !== 'NONE',
    },
    teaching: { action: config.action, hintType: config.hint ?? 'NONE', promptLevel: next.promptLevel, correctionType: config.correction ?? 'NONE' },
    technical: { failed: Boolean(config.technical), reason: config.technical ?? null },
    next: { stage: next.stage, difficulty: next.consecutiveErrors >= 2 ? 'DOWN' : 'HOLD', recordsLearnerFailure: config.recordsFailure === true, masteryStatus: next.masteryStatus },
  };
  if (config.technical) turn.next.difficulty = 'HOLD';
  assertTeachingTelemetryInvariant(turn);
  return turn;
}

function result(input: ActiveInput, state: ActiveTeachingSession, next: ActiveTeachingSession, response: ReturnType<typeof answer>, config: Parameters<typeof telemetry>[3]) {
  const turn = telemetry(input, state, next, config);
  const recallStage = state.stage === 'TRANSFER_TEST' ? 'R3' : state.stage === 'SPEAK' && state.promptLevel === 'NONE' ? 'R1' : undefined;
  const responseSurface = `${response.answer} ${response.chinese}`;
  const promptLeaksTarget = responseSurface.includes(objective.surface)
    || responseSurface.includes('我明天')
    || responseSurface.includes('明天上班');
  const recallStalled = recallStage === 'R1' && (turn.evidence.outcome === 'PARTIAL' || turn.evidence.outcome === 'NOT_YET');
  const hintChineseCharCount = Array.from(responseSurface.matchAll(/[\u3400-\u9fff]/g)).length;
  const hintIndonesianWordCount = response.answer
    .replace(/[\u3400-\u9fff]/g, ' ')
    .match(/[A-Za-zÀ-ɏ]+(?:[-'][A-Za-zÀ-ɏ]+)*/g)?.length ?? 0;
  const difficultyAdjustmentDisclosed = /\b(?:difficulty|level)\b|tingkat\s+kesulitan|(?:naik|turun)(?:kan)?\s+level/i.test(response.answer);
  const ruleContext = {
    unit: { scenarioKey: 'temporary-work-arrival-report' },
    turn: {
      direction: 'ID_TO_ZH', mode: 'TEACH', turnKind: turn.technical.failed ? 'TECH_FAILURE' : 'TEACHING',
      outcome: turn.evidence.outcome, newInfoPoints: 0, hintType: turn.teaching.hintType,
      hintTypesUsedThisTurn: turn.teaching.hintType === 'NONE' ? [] : [turn.teaching.hintType],
      hintCharCount: turn.teaching.hintType === 'NONE' ? 0 : hintChineseCharCount,
      hintChineseCharCount: turn.teaching.hintType === 'NONE' ? 0 : hintChineseCharCount,
      hintIndonesianWordCount: turn.teaching.hintType === 'NONE' ? 0 : hintIndonesianWordCount,
      learner: { producedIndependently: turn.evidence.kind === 'INDEPENDENT_PRODUCTION', scoringAttempted: false },
      cf: { type: turn.teaching.correctionType, focusSpans: turn.teaching.correctionType === 'NONE' ? [] : ['目标表达'] },
      recall: {
        stage: recallStage,
        stalled: recallStalled,
        promptLeaksTarget,
        modelDeliveredBefore: recallStalled && promptLeaksTarget,
        variationAxis: state.stage === 'TRANSFER_TEST' ? 'TIME' : undefined,
      },
      coach: { text: response.answer },
    },
    difficulty: { decision: turn.next.difficulty, changedDimensions: turn.next.difficulty === 'HOLD' ? [] : ['LENGTH'] },
    output: { userVisibleMessage: response.answer, difficultyAdjustmentDisclosed, target: { sentenceLength: 'SIMPLE' } },
    item: { masteryDelta: turn.evidence.kind === 'INDEPENDENT_PRODUCTION' ? 1 : 0 },
  };
  const engine = orchestrateTeachingTurn({
    requestId: input.requestId, direction: 'ID_TO_ZH', turnKind: turn.technical.failed ? 'TECH_FAILURE' : 'TEACHING',
    evidence: { kind: turn.evidence.kind, prompted: turn.evidence.promptLevel !== 'NONE', written: turn.evidence.written, reviewQueued: false },
    strategyHistory: [], teachingAction: turn.teaching.action, technicalFailure: turn.technical.reason,
    sources: { turnKind: 'CALLER_DECLARED', evidenceKind: turn.technical.failed ? 'TECHNICAL_FAILURE' : turn.evidence.written ? 'MASTERY_POLICY_ACCEPTED_EVIDENCE' : 'NO_ASSESSMENT_IN_CONVERSATION_ROUTE', strategyHistory: 'CALLER_DECLARED' },
    courseAuthorization: { authorized: true, lessonId: input.lessonId, source: 'MANDARIN_WORK_LEVEL_1' }, ruleContext,
  });
  return { response, session: next, telemetry: turn, engine: { ...engine, mode: 'ACTIVE' as const, status: 'ACTIVE_CONTROL' as const, action: turn.teaching.action } };
}

function advanceActiveTeachingTurn(input: ActiveInput, current: ActiveTeachingSession) {
  if (input.startRequested) {
    const next = { ...current, stage: 'DIAGNOSE' as const };
    return result(input, current, next, answer('Sebelum mulai, tulis arti tiga kata ini: 我 · 明天 · 上班. Jawab singkat dalam Bahasa Indonesia.', '', '', '', 'DIAGNOSE_PREREQUISITES'), { path: ['DIAGNOSE'], action: 'DIAGNOSE_PREREQUISITES' });
  }
  if (offTopic(input.message)) {
    return result(input, current, current, answer('Maaf, saya fokus membantu kamu belajar Mandarin 😊 Sekarang lanjutkan latihan “我明天上班”.', '', '', '', 'OFF_TOPIC_REDIRECT'), { path: [current.stage], action: 'OFF_TOPIC_REDIRECT' });
  }
  if (current.stage === 'DIAGNOSE') {
    const verified = prerequisiteCheck(input.message);
    const next: ActiveTeachingSession = { ...current, stage: 'SPEAK', promptLevel: 'FULL_MODEL', prerequisitesVerified: verified };
    const prefix = verified ? 'Bagus, tiga kata dasarnya sudah kamu kenali.' : 'Tidak apa-apa. Kita gunakan tiga kata yang sudah ada di Hari 1, 6, dan 27.';
    return result(input, current, next, answer(`${prefix} Dengarkan lalu coba ucapkan atau ketik:`, objective.surface, objective.pinyin, objective.meaningId, 'MODEL_THEN_INVITE'), { path: ['DIAGNOSE', 'MODEL', 'SPEAK'], action: 'MODEL_THEN_INVITE' });
  }
  if (current.stage === 'COMPLETE') {
    return result(input, current, current, answer('Latihan ini sudah selesai. Kamu berhasil berlatih dan melakukan satu tes transfer. Statusnya belum “mastered”.', objective.surface, objective.pinyin, objective.meaningId, 'COMPLETE'), { path: ['COMPLETE'], action: 'COMPLETE' });
  }
  if (asksMeaning(input.message)) {
    const next = { ...current, promptLevel: 'SEMANTIC_CUE' as const };
    return result(input, current, next, answer('Artinya: “Besok saya masuk kerja.” Sekarang coba sendiri:', objective.surface, objective.pinyin, objective.meaningId, 'EXPLAIN_THEN_RETRY'), { path: [current.stage, 'HINT', 'RETRY'], action: 'EXPLAIN_THEN_RETRY', hint: 'OBJECT_CUE' });
  }
  if (asksDemo(input.message) || asksHelp(input.message)) {
    const next = { ...current, stage: 'SPEAK' as const, promptLevel: 'FULL_MODEL' as const, hints: Math.min(4, current.hints + 1) };
    return result(input, current, next, answer('Tidak apa-apa. Dengarkan satu kali, lalu coba:', objective.surface, objective.pinyin, objective.meaningId, 'MODEL_ONE_MORE_TIME'), { path: [current.stage, 'HINT', 'RETRY', 'SPEAK'], action: 'MODEL_ONE_MORE_TIME', hint: 'FULL_MODEL' });
  }

  const target = current.stage === 'TRANSFER_TEST' ? '我今天上班' as const : objective.surface;
  const outcome = attemptOutcome(input.message, target);
  const attempts = current.attempts + 1;
  if (input.modality === 'VOICE' && outcome !== 'EXACT') {
    return result(input, current, current, answer('Saya belum bisa memastikan jawabannya dari transkripsi ini. Coba rekam lagi atau gunakan teks; nilaimu tidak berubah.', '', '', '', 'REQUEST_CLEARER_VOICE_OR_TEXT'), { path: [current.stage, 'EVALUATE', 'RETRY'], action: 'REQUEST_CLEARER_VOICE_OR_TEXT', outcome: 'NO_EVIDENCE', kind: 'NONE', source: 'STT_INTELLIGIBILITY' });
  }
  if (outcome === 'EXACT') {
    const independent = input.modality === 'TEXT' && current.promptLevel === 'NONE';
    if (current.stage === 'TRANSFER_TEST') {
      if (!independent) {
        const next = { ...current, attempts, promptLevel: 'NONE' as const, masteryStatus: 'PRACTICED' as const };
        return result(input, current, next, answer('Ucapanmu dapat dipahami. Karena STT bukan penilaian akustik, ketik “我今天上班” tanpa petunjuk untuk bukti transfer mandiri.', '我今天上班', 'wǒ jīn tiān shàng bān', 'Hari ini saya masuk kerja.', 'REQUEST_TEXT_TRANSFER'), { path: ['TRANSFER_TEST'], action: 'REQUEST_TEXT_TRANSFER', outcome: 'SCAFFOLDED_SUCCESS', kind: 'PROMPTED_ATTEMPT', source: 'STT_INTELLIGIBILITY' });
      }
      const next: ActiveTeachingSession = { ...current, stage: 'COMPLETE', attempts, consecutiveSuccesses: current.consecutiveSuccesses + 1, consecutiveErrors: 0, masteryStatus: 'INDEPENDENT', promptLevel: 'NONE' };
      return result(input, current, next, answer('Bagus. Kamu berhasil memindahkan pola waktunya: “我今天上班”. Ini bukti latihan mandiri, tetapi belum berarti mastered.', '我今天上班', 'wǒ jīn tiān shàng bān', 'Hari ini saya masuk kerja.', 'TRANSFER_COMPLETE'), { path: ['TRANSFER_TEST', 'COMPLETE'], action: 'TRANSFER_COMPLETE', outcome: 'INDEPENDENT_SUCCESS', kind: 'INDEPENDENT_PRODUCTION', source: 'TRANSFER_TASK' });
    }
    if (!independent) {
      const next: ActiveTeachingSession = { ...current, stage: 'SPEAK', attempts, consecutiveSuccesses: current.consecutiveSuccesses + 1, consecutiveErrors: 0, promptLevel: 'NONE', masteryStatus: 'PRACTICED' };
      return result(input, current, next, answer('Bagus, itu benar dengan bantuan model. Sekarang coba sekali lagi tanpa melihat contoh.', '', '', '', 'REMOVE_SCAFFOLD_AND_RETRY'), { path: ['SPEAK', 'EVALUATE', 'ADVANCE', 'SPEAK'], action: 'REMOVE_SCAFFOLD_AND_RETRY', outcome: 'SCAFFOLDED_SUCCESS', kind: 'PROMPTED_ATTEMPT', source: input.modality === 'VOICE' ? 'STT_INTELLIGIBILITY' : 'MEANING_TASK' });
    }
    const next: ActiveTeachingSession = { ...current, stage: 'TRANSFER_TEST', attempts, consecutiveSuccesses: current.consecutiveSuccesses + 1, consecutiveErrors: 0, promptLevel: 'NONE', masteryStatus: 'INDEPENDENT' };
    return result(input, current, next, answer('Benar tanpa petunjuk. Sekarang ganti satu bagian waktu saja. Bagaimana mengatakan “Hari ini saya masuk kerja” dalam Mandarin?', '', '', '', 'ADVANCE_TO_TRANSFER'), { path: ['SPEAK', 'EVALUATE', 'ADVANCE', 'TRANSFER_TEST'], action: 'ADVANCE_TO_TRANSFER', outcome: 'INDEPENDENT_SUCCESS', kind: 'INDEPENDENT_PRODUCTION', source: 'UNPROMPTED_RECALL' });
  }
  if (outcome === 'PARTIAL') {
    const errors = current.consecutiveErrors + 1;
    const reduce = errors >= 2;
    const next: ActiveTeachingSession = { ...current, stage: current.stage, attempts, consecutiveErrors: errors, consecutiveSuccesses: 0, hints: Math.min(4, current.hints + 1), promptLevel: reduce ? 'FULL_MODEL' : 'FIRST_WORD', masteryStatus: current.masteryStatus === 'NOT_STARTED' ? 'PRACTICED' : current.masteryStatus };
    const copy = reduce
      ? 'Kita pecah menjadi tiga bagian: 我 / 明天 / 上班. Gabungkan sekali lagi.'
      : `Hampir. Bagian awalnya “我…”. Lengkapi sendiri sampai berarti “${current.stage === 'TRANSFER_TEST' ? 'Hari ini' : 'Besok'} saya masuk kerja”.`;
    return result(input, current, next, answer(copy, reduce ? objective.surface : '', reduce ? objective.pinyin : '', reduce ? objective.meaningId : '', reduce ? 'REDUCE_ONE_VARIABLE' : 'ONE_TARGETED_HINT'), { path: [current.stage, 'EVALUATE', 'HINT', 'RETRY'], action: reduce ? 'REDUCE_ONE_VARIABLE' : 'ONE_TARGETED_HINT', outcome: 'PARTIAL', kind: 'PROMPTED_ATTEMPT', source: 'MEANING_TASK', hint: reduce ? 'SKELETON_BLANK' : 'FIRST_TOKEN', correction: 'ELICITATION', recordsFailure: true });
  }
  const errors = current.consecutiveErrors + 1;
  const next: ActiveTeachingSession = { ...current, stage: current.stage, attempts, consecutiveErrors: errors, consecutiveSuccesses: 0, hints: Math.min(4, current.hints + 1), promptLevel: errors >= 2 ? 'FULL_MODEL' : 'SEMANTIC_CUE', masteryStatus: current.masteryStatus === 'NOT_STARTED' ? 'PRACTICED' : current.masteryStatus };
  const copy = errors >= 2 ? 'Kita kecilkan dulu. Susun tiga bagian ini: 我 / 明天 / 上班. Lalu coba kalimat lengkap.' : 'Coba lagi. Pertahankan makna “saya + besok + masuk kerja”.';
  return result(input, current, next, answer(copy, errors >= 2 ? objective.surface : '', errors >= 2 ? objective.pinyin : '', errors >= 2 ? objective.meaningId : '', errors >= 2 ? 'REDUCE_ONE_VARIABLE' : 'CORRECT_ONE_POINT'), { path: [current.stage, 'EVALUATE', 'HINT', 'RETRY'], action: errors >= 2 ? 'REDUCE_ONE_VARIABLE' : 'CORRECT_ONE_POINT', outcome: 'NOT_YET', kind: 'PROMPTED_ATTEMPT', source: 'MEANING_TASK', hint: errors >= 2 ? 'SKELETON_BLANK' : 'CONTRAST_HINT', correction: 'EXPLICIT', recordsFailure: true });
}

export function runActiveTeachingTurn(input: ActiveInput) {
  const current = input.startRequested ? emptyState() : requireTrustedState(input);
  const turn = advanceActiveTeachingTurn(input, current);
  const sessionToken = commitTrustedState(input, turn.session);
  return { ...turn, sessionToken };
}

export function buildActiveTechnicalFailure(input: Omit<ActiveInput, 'startRequested'> & { reason: TechnicalFailureReason }) {
  const current = requireTrustedState({ ...input, startRequested: false }, false);
  const turn = result({ ...input, startRequested: false }, current, current, answer('Terjadi gangguan teknis. Coba lagi atau gunakan teks; hasil belajarmu tidak berubah.', '', '', '', 'TECHNICAL_RETRY_OR_TEXT_FALLBACK'), { path: [current.stage], action: 'TECHNICAL_RETRY_OR_TEXT_FALLBACK', technical: input.reason });
  return { ...turn, sessionToken: input.sessionToken };
}
