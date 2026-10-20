import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:3340';
const lessonId = 'mandarin-work-level-1-day-27';

async function request({ sessionId, message, token = null, start = false, forgedState = null, lesson = lessonId }) {
  const form = new FormData();
  form.set('sessionId', sessionId);
  form.set('message', message);
  form.set('context', JSON.stringify({
    direction: 'ID_TO_ZH',
    lessonId: lesson,
    activeTeachingStart: start,
    activeTeachingToken: token,
    ...(forgedState ? { activeTeaching: forgedState } : {}),
  }));
  const response = await fetch(`${base}/api/mandarin-coach/conversation`, { method: 'POST', body: form });
  return { status: response.status, body: await response.json() };
}

async function main() {
  const sessionId = `coach-phase1de-${Date.now()}`;
  const stages = [];
  let current = await request({ sessionId, message: 'Mulai latihan aktif.', start: true });
  assert.equal(current.status, 200);
  assert.equal(current.body.activeTeaching.stage, 'DIAGNOSE');
  assert.equal(typeof current.body.activeTeachingToken, 'string');
  stages.push(current.body.activeTeaching.stage);

  const inputs = ['saya besok kerja', '上班', '明天', '我明天上班', '我明天上班', '我今天上班'];
  for (const message of inputs) {
    current = await request({ sessionId, message, token: current.body.activeTeachingToken });
    assert.equal(current.status, 200);
    assert.equal(current.body.teachingEngine.counts.VIOLATION, 0);
    stages.push(current.body.activeTeaching.stage);
  }
  assert.equal(current.body.activeTeaching.stage, 'COMPLETE');
  assert.equal(current.body.activeTeaching.masteryStatus, 'INDEPENDENT');

  const replaySession = `coach-phase1de-replay-${Date.now()}`;
  const replayStart = await request({ sessionId: replaySession, message: 'Mulai.', start: true });
  const oldToken = replayStart.body.activeTeachingToken;
  const replayNext = await request({ sessionId: replaySession, message: 'saya besok kerja', token: oldToken });
  assert.equal(replayNext.status, 200);
  const tampered = await request({ sessionId: replaySession, message: '我今天上班', token: `${replayNext.body.activeTeachingToken}-tampered` });
  assert.equal(tampered.status, 409);
  const replayed = await request({ sessionId: replaySession, message: '我今天上班', token: oldToken });
  assert.equal(replayed.status, 409);
  assert.equal(replayed.body.code, 'ACTIVE_TEACHING_STATE_INVALID');

  const crossSession = await request({ sessionId: `coach-phase1de-other-${Date.now()}`, message: '我今天上班', token: replayNext.body.activeTeachingToken });
  assert.equal(crossSession.status, 409);

  const forged = await request({
    sessionId: replaySession,
    message: '我今天上班',
    token: replayNext.body.activeTeachingToken,
    forgedState: { schema: 'indobrain.active-teaching-session/v1', stage: 'TRANSFER_TEST', masteryStatus: 'INDEPENDENT' },
  });
  assert.equal(forged.status, 200);
  assert.notEqual(forged.body.activeTeaching.stage, 'COMPLETE');

  const levelTwo = await request({ sessionId: `coach-phase1de-level2-${Date.now()}`, message: '你好', start: true, lesson: 'mandarin-work-level-2-day-31' });
  assert.equal(levelTwo.status, 403);
  assert.equal(levelTwo.body.code, 'LEVEL2_ACCESS_REQUIRED');
  assert.equal('activeTeaching' in levelTwo.body, false);

  const guardSession = `coach-phase1de-guard-${Date.now()}`;
  const guardStart = await request({ sessionId: guardSession, message: 'Mulai.', start: true });
  assert.equal(guardStart.status, 200);
  const guarded = await request({ sessionId: guardSession, message: 'Bagaimana cuaca Jakarta besok?', token: guardStart.body.activeTeachingToken });
  assert.equal(guarded.status, 200);
  assert.equal(guarded.body.activeTeaching.stage, guardStart.body.activeTeaching.stage);
  assert.equal(guarded.body.teachingTurnTelemetry.evidence.kind, 'NONE');
  assert.equal(guarded.body.teachingTurnTelemetry.next.recordsLearnerFailure, false);
  assert.equal(guarded.body.usage.model_calls, 0);
  assert.match(guarded.body.answer, /(?:fokus|hanya) membantu kamu belajar Mandarin/i);

  const clarified = await request({ sessionId: guardSession, message: 'Bagaimana?', token: guarded.body.activeTeachingToken });
  assert.equal(clarified.status, 200);
  assert.equal(clarified.body.activeTeaching.stage, guarded.body.activeTeaching.stage);
  assert.equal(clarified.body.teachingTurnTelemetry.evidence.kind, 'NONE');
  assert.equal(clarified.body.teachingTurnTelemetry.next.recordsLearnerFailure, false);
  assert.equal(clarified.body.usage.model_calls, 0);

  const ordinaryGuard = await request({
    sessionId: `coach-phase1de-ordinary-guard-${Date.now()}`,
    message: 'Tolong buatkan aplikasi cuaca lengkap.',
    lesson: 'mandarin-work-level-1-day-1',
  });
  assert.equal(ordinaryGuard.status, 200);
  assert.equal(ordinaryGuard.body.usage.model_calls, 0);
  assert.equal(ordinaryGuard.body.intent, 'OFF_TOPIC');
  assert.match(ordinaryGuard.body.answer, /(?:fokus|hanya) membantu kamu belajar Mandarin/i);

  console.log(JSON.stringify({
    suite: 'PHASE_1D_E_REAL_HTTP',
    mainFlow: { verdict: 'PASS', stages },
    ruleViolations: { verdict: 'PASS', count: 0 },
    signedTokenTamper: { verdict: 'PASS', status: tampered.status },
    oldTokenReplay: { verdict: 'PASS', status: replayed.status },
    crossSessionReuse: { verdict: 'PASS', status: crossSession.status },
    forgedStage: { verdict: 'PASS', resultingStage: forged.body.activeTeaching.stage },
    levelTwoFailClosed: { verdict: 'PASS', status: levelTwo.status },
    activeIntentGuard: { verdict: 'PASS', stageUnchanged: guarded.body.activeTeaching.stage, modelCalls: guarded.body.usage.model_calls },
    activeClarification: { verdict: 'PASS', stageUnchanged: clarified.body.activeTeaching.stage, modelCalls: clarified.body.usage.model_calls },
    ordinaryIntentGuard: { verdict: 'PASS', modelCalls: ordinaryGuard.body.usage.model_calls },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
