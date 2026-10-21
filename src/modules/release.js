// Authoritative player-facing release metadata. Change only with certified game releases.
// Internal Git SHAs remain in GitHub Actions and release audit; never infer a deployed build from remote dev.
const RELEASE=Object.freeze({
 version:'0.9.0.0',
 date:'2026-10-21',
 notes:Object.freeze([
  '10 independent Career save slots, including legacy career migration and backup support.',
  'New opt-in Spinning Bumper defender ability prototype with jump and dash counters.',
  'Improved touch input, match stability, offline caching and regression coverage.'
 ])
});
export {RELEASE};
