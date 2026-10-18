import assert from 'node:assert/strict';
import {
  createMandarinWorkDaySelection,
  parseMandarinWorkDayParam,
  restoreMandarinWorkDay,
  selectMandarinWorkDay,
} from '../lib/mandarin-work-day-selection.ts';

let selection = createMandarinWorkDaySelection();
selection = restoreMandarinWorkDay(selection, 5);
assert.deepEqual(selection, { selectedDay: 5, restoredFromProfile: true }, 'Saved Day 5 must restore on first load');

selection = selectMandarinWorkDay(selection, 1);
assert.equal(selection.selectedDay, 1, 'Learner must be able to select Day 1');

const afterFavoriteSync = restoreMandarinWorkDay(selection, 5);
assert.strictEqual(afterFavoriteSync, selection, 'Profile updates must not override an explicit Day 1 selection');
assert.equal(afterFavoriteSync.selectedDay, 1, 'Explicit Day 1 selection must survive a profile sync');

const nextDay = selectMandarinWorkDay(afterFavoriteSync, 2);
assert.equal(nextDay.selectedDay, 2, 'Next-day navigation must remain functional');
assert.equal(restoreMandarinWorkDay(nextDay, 6).selectedDay, 2, 'Later profile syncs must not move an active lesson');

assert.equal(restoreMandarinWorkDay(createMandarinWorkDaySelection(), 60).selectedDay, 30, 'Level 1 restore must clamp to Day 30');
assert.equal(selectMandarinWorkDay(selection, 0).selectedDay, 1, 'Manual day selection must clamp to Day 1');

assert.equal(parseMandarinWorkDayParam('28'), 28, 'A valid favorite deep link must parse its Day');
assert.equal(parseMandarinWorkDayParam('31'), null, 'Level 1 deep links must not accept Level 2 Days');
assert.equal(parseMandarinWorkDayParam('5.5'), null, 'Fractional Day values must be rejected');
assert.equal(parseMandarinWorkDayParam(['28', '29']), null, 'Ambiguous repeated Day parameters must be rejected');

const deepLinkSelection = createMandarinWorkDaySelection(parseMandarinWorkDayParam('28'));
assert.deepEqual(deepLinkSelection, { selectedDay: 28, restoredFromProfile: true }, 'A valid deep link must select Day 28 immediately');
assert.strictEqual(restoreMandarinWorkDay(deepLinkSelection, 5), deepLinkSelection, 'Saved Day 5 must not override a valid Day 28 deep link');

const invalidDeepLinkSelection = createMandarinWorkDaySelection(parseMandarinWorkDayParam('99'));
assert.equal(restoreMandarinWorkDay(invalidDeepLinkSelection, 5).selectedDay, 5, 'An invalid deep link must fall back to saved progress');

console.log('MANDARIN WORK DAY SELECTION: PASS (Day 5 restore, explicit selection stability, safe Day deep links, Level 1 bounds)');
