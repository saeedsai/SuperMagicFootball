# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.385 — AI-MAGIC-HAZARD-SIDESTEP-HEADING-LOCK-01.
- CPU outfielders retain the initial run-lane heading while sidestepping an active Banana Peel/Ice Patch. Agility-smoothed movement keeps its forward component across consecutive frames instead of rotating the escape basis and curling backward.
- Production: `src/modules/engine.js`. Focused Node: `tests/magic_hazard_ai_avoidance.test.cjs`. Actual-engine desktop/simulated-touch QA: `tests/magic_hazard_ai_avoidance_browser_qa.py`.

## Exact-head QA diagnosis
- Parent .384 final SHA: `909d7a2819fcb74972b979cdf252e24c2cc4d81f`; main SHA: `ffc4ca5122abfd16849b69c705fa5f341cb52e7a`.
- Parent .384 Modular QA #46077778110 passed 3,044/3,044. Full Census #46077778146 failed only browser shard 0: the first 16 ms actual-engine step produced 0.734 units lateral displacement under Agility smoothing, below the fixture's one-frame >1 threshold.
- .385 Modular QA #46080677777 ran 3,045 tests: 3,044 passed; the only failure was the new mirrored Node fixture placing team 1 outside its synthetic field bounds. The actual engine correctly used direct-away fallback. The fixture now uses a centered origin; an isolated V8 run of the production method passed all four trap/team combinations. The .385 production implementation is unchanged and exact-head CI must rerun.
- .385 retains the initial heading through the active hazard event and tests multi-frame actual movement rather than weakening the assertion. New immediate hazards can still preempt; off-lane fallback and slide/JUMP counters remain.

## Next smallest action
- Verify .385 Modular QA and exact-head four-Node/four-Chromium Full Regression Census. Inspect both desktop and simulated-touch multi-frame sidestep results.
- Only a fully green exact dev head may pass the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.
- Continue through-ball interception, counterable Magic Tricks and goalkeeper response; do not repeat already-covered Breath or LAN work.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Main .382 Census #46074238725 and Pages deployment #46074231407 passed; hosted smoke verified exact main HTML/JS/CSS bytes.
- .384 Modular QA passed; .384 Full Regression Census failed one actual-engine sidestep browser assertion and was not promoted.
- .385 first Modular QA exposed only a synthetic-field coordinate error in the new team-1 Node fixture; corrected on dev without changing production code. Exact-head rerun pending.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
