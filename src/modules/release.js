// Authoritative player-facing release metadata. Change only with certified game releases.
// Internal Git SHAs remain in GitHub Actions and release audit; never infer a deployed build from remote dev.
const RELEASE=Object.freeze({
 version:'0.9.4.0',
 date:'2026-10-22',
 notes:Object.freeze([
  'Player Studio now offers Drill and Burst defensive moves at levels 1–5, while Spinning Bumper requires level 3.',
  'Player Studio now equips eligible defender Super Defence abilities with levels 1–5, guarded saves and no fifth control button.',
  '10 independent Career save slots, including legacy career migration and backup support.',
  'New opt-in Spinning Bumper defender ability prototype with jump and dash counters.',
  'Cup tournaments support ten safe slots, non-destructive duplication, and checked backup export/import and a read-only slot preview before explicit overwrite confirmation.',
  'Improved touch input, match stability, offline caching and regression coverage.'
 ])
});
export {RELEASE};
