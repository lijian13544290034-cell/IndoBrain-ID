import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseCoachConversationResponse, normalizeCoachConversationError } from '../lib/mandarin-coach-conversation-client.ts';

const valid = {
  questionId: 'q-1', answer: 'Jawaban', timestamp: new Date().toISOString(), detectedLanguage: 'MIXED', intent: 'MEANING',
  intents: ['MEANING'], skillIds: ['MEANING'], capabilityIds: ['TRANSLATION_EXPLANATION'], speechSegments: [], usage: {},
};

async function expectFailure(response, code, message) {
  await assert.rejects(() => parseCoachConversationResponse(response), (error) => {
    assert.equal(error.code, code);
    assert.match(error.message, message);
    return true;
  });
}

assert.equal((await parseCoachConversationResponse(new Response(JSON.stringify(valid), { status: 200 }))).questionId, 'q-1');
await expectFailure(new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401 }), 'AUTH_REQUIRED', /masuk/i);
await expectFailure(new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 }), 'ACCESS_DENIED', /akses/i);
await expectFailure(new Response(JSON.stringify({ error: 'limit' }), { status: 429 }), 'RATE_LIMITED', /batas/i);
await expectFailure(new Response(JSON.stringify({ error: 'internal' }), { status: 500 }), 'SERVER_ERROR', /gangguan/i);
await expectFailure(new Response('<html>bad gateway</html>', { status: 200 }), 'INVALID_RESPONSE', /belum dapat dibaca/i);
await expectFailure(new Response(JSON.stringify({ questionId: 'q-empty', answer: '' }), { status: 200 }), 'INVALID_RESPONSE', /belum lengkap/i);
assert.equal(normalizeCoachConversationError(new TypeError('Failed to fetch')).code, 'NETWORK_ERROR');
assert.equal(normalizeCoachConversationError(new DOMException('aborted', 'AbortError')).code, 'TIMEOUT');

const component = fs.readFileSync('components/AiCoachConversation.tsx', 'utf8');
assert.match(component, /history\.scrollTo\(\{ top: history\.scrollHeight/);
assert.match(component, /ref=\{historyRef\}/);
assert.match(component, /profileRef\.current/);
assert.match(component, /parseCoachConversationResponse/);
assert.match(component, /Coba lagi/);
assert.ok(component.indexOf('role="alert"') < component.indexOf('<AiCoachRecorder busy={busy}'), 'error must be rendered before the voice recorder');

console.log('Mandarin Coach send reliability verification passed: 200/401/403/429/500/network/malformed responses, retry UI, auto-scroll, and latest-profile merge.');
