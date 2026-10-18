import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MANDARIN_LEARNING_GUEST_SCOPE,
  MANDARIN_LEARNING_SCOPE_POINTER,
  currentMandarinLearningScope,
  mandarinLearningScopeForAccount,
  readScopedMandarinJson,
  scopedMandarinStorageKey,
  setMandarinLearningScope,
  writeScopedMandarinJson,
} from '../lib/mandarin-learning-storage-scope.ts';

class MemoryStorage {
  #values = new Map();
  get length() { return this.#values.size; }
  clear() { this.#values.clear(); }
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  key(index) { return [...this.#values.keys()][index] ?? null; }
  removeItem(key) { this.#values.delete(key); }
  setItem(key, value) { this.#values.set(String(key), String(value)); }
}

const localStorage = new MemoryStorage();
const sessionStorage = new MemoryStorage();
globalThis.window = {
  localStorage,
  sessionStorage,
  dispatchEvent() { return true; },
};

const tester01 = mandarinLearningScopeForAccount('TESTER01');
const tester02 = mandarinLearningScopeForAccount('TESTER02');
assert.equal(tester01, 'TESTER01:ID_TO_ZH');
assert.equal(tester02, 'TESTER02:ID_TO_ZH');

const coachBaseKey = 'indobrain:mandarin-ai-coach:mandarin-work-level-1-day-1:v1';
setMandarinLearningScope(tester01);
writeScopedMandarinJson(coachBaseKey, { account: 'TESTER01', expressions: ['A'] });
assert.deepEqual(readScopedMandarinJson(coachBaseKey), { account: 'TESTER01', expressions: ['A'] });

setMandarinLearningScope(tester02);
assert.equal(readScopedMandarinJson(coachBaseKey), null, 'TESTER02 must not read TESTER01 data');
writeScopedMandarinJson(coachBaseKey, { account: 'TESTER02', expressions: ['B'] });
assert.deepEqual(readScopedMandarinJson(coachBaseKey), { account: 'TESTER02', expressions: ['B'] });
assert.deepEqual(readScopedMandarinJson(coachBaseKey, tester01), { account: 'TESTER01', expressions: ['A'] });

setMandarinLearningScope(MANDARIN_LEARNING_GUEST_SCOPE);
assert.equal(readScopedMandarinJson(coachBaseKey), null, 'guest must not read an authenticated account');
writeScopedMandarinJson(coachBaseKey, { account: 'guest' });
assert.deepEqual(readScopedMandarinJson(coachBaseKey), { account: 'guest' });
assert.deepEqual(readScopedMandarinJson(coachBaseKey, tester02), { account: 'TESTER02', expressions: ['B'] });

const legacyValue = JSON.stringify({ account: 'legacy-unscoped' });
localStorage.setItem(coachBaseKey, legacyValue);
assert.equal(readScopedMandarinJson(coachBaseKey, tester01).account, 'TESTER01');
assert.equal(localStorage.getItem(coachBaseKey), legacyValue, 'legacy unscoped data must remain untouched');

const malformedKey = scopedMandarinStorageKey('malformed-profile', tester01);
localStorage.setItem(malformedKey, '{not-json');
assert.equal(readScopedMandarinJson('malformed-profile', tester01), null);
assert.equal(localStorage.getItem(malformedKey), '{not-json', 'malformed data must not be overwritten while reading');

assert.equal(sessionStorage.getItem(MANDARIN_LEARNING_SCOPE_POINTER), MANDARIN_LEARNING_GUEST_SCOPE);
assert.equal(currentMandarinLearningScope(), MANDARIN_LEARNING_GUEST_SCOPE);

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const layout = read('app/learn-chinese/layout.tsx');
const boundary = read('components/MandarinLearningScopeBoundary.tsx');
const coachProfile = read('lib/mandarin-ai-coach-profile.ts');
const personalization = read('lib/mandarin-coach-personalization-profile.ts');
const aggregate = read('lib/mandarin-learning-local-data.ts');

assert.match(layout, /getCurrentAccountUser\(\)/, 'scope must originate from the verified server session');
assert.match(layout, /MandarinLearningScopeBoundary scope=\{scope\}/, 'local consumers must be behind the verified scope boundary');
assert.match(boundary, /activeScope !== scope/, 'children must not mount under a stale account scope');
assert.match(coachProfile, /readScopedMandarinJson\(storageBaseKey\(lesson\), scope\)/);
assert.match(coachProfile, /scopedMandarinStorageKey\(baseKey\)/);
assert.match(coachProfile, /writeScopedMandarinJson\(baseKey, persisted\)/);
assert.match(coachProfile, /writeScopedMandarinJson\(storageBaseKey\(lesson\), fresh\)/);
assert.doesNotMatch(coachProfile, /localStorage\.getItem\(LEGACY_STORAGE_KEY\)/, 'legacy unscoped coach data must not be auto-claimed');
assert.match(personalization, /readScopedMandarinJson\(STORAGE_KEY, scope\)/);
assert.match(personalization, /writeScopedMandarinJson\(STORAGE_KEY, state\)/);
assert.match(aggregate, /Side-effect-free input/);
assert.doesNotMatch(aggregate, /setItem\(|writeScopedMandarinJson|saveCoachProfile/, 'aggregate reader must not write data');

console.log('Mandarin local account isolation verification passed.');

