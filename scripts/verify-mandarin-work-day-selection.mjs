import assert from 'node:assert/strict';
import {
  createMandarinWorkDaySelection,
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

console.log('MANDARIN WORK DAY SELECTION: PASS (Day 5 restore, explicit Day 1 stability, next-day flow, Level 1 bounds)');
