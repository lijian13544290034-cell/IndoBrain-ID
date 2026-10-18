import { loadMandarinCourseInventory } from './lib/mandarin-course-inventory.mjs';

const inventory = loadMandarinCourseInventory();
console.log(JSON.stringify({ counts: inventory.counts, scenarios: inventory.scenarios }, null, 2));
