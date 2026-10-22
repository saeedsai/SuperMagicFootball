// Authoritative player-facing release metadata. Change only with certified game releases.
// Internal Git SHAs remain in GitHub Actions and release audit; never infer a deployed build from remote dev.
const RELEASE=Object.freeze({
 version:'0.9.1.0',
 date:'2026-10-22',
 notes:Object.freeze([
  '10 independent Career save slots, including legacy career migration and backup support.',
  'New opt-in Spinning Bumper defender ability prototype with jump and dash counters.',
  'Cup tournaments now support ten safe slots, validated loading and campaign duplication into the first empty slot.',
  'Improved touch input, match stability, offline caching and regression coverage.'
 ])
});
export {RELEASE};
