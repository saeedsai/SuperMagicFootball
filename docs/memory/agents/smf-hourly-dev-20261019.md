# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.281 — AI-GROUND-PASS-HURT-RECOVERY-EXCLUSION-01:** CPU support, goalmouth and give-and-go pass reads no longer count outfielders in active hurt recovery as able to intercept/block; cutback and through-ball already had this readiness rule. Completed hurt timers and active slides remain defensive threats.
- Production changes: `src/modules/ai.js`; mirrored Node tests cover five ground-pass evaluators and both directions. Actual-engine desktop/simulated-touch Chromium verifies support-pass dispatch and active/finished hurt, keeper and slide countercases.
- **.280 certified and promoted:** exact-head Modular QA #45525312541, dev Full Regression Census #45525312459, QA-gated promotion, Pages deployment #45526531724 and independent main Census #45526539150 all passed. Dev and main were then both `a592241841c0aa29e872da53eb6607a908d6882a`.
- .281 is a new dev candidate; its CI has not yet been observed.

## Next smallest action
Inspect the unfiltered GitHub Actions runs for the exact .281 dev head. Verify Modular QA and all four Node/four Chromium Census shards, repair confirmed failures, then permit only the green exact head through the existing QA-gated promotion. Independently verify main Census, Pages deployment and hosted-byte smoke.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical two-phone acceptance and #86 Render drift open; authenticated online hosting is not live without owner resources. Keep #87 a real security issue; do not assume branch protection.

## Evidence
- .280 Modular QA #45525312541 and dev Census #45525312459 passed; Census promotion job succeeded.
- .280 Pages deployment #45526531724 passed; independent main Census #45526539150 passed hosted-pages smoke, preflight, preview, all four Node and all four Chromium shards.
- Before .281 edit, GitHub REST confirmed both dev and main at `a592241841c0aa29e872da53eb6607a908d6882a`; both branch protection flags were false and repository rulesets were empty.
- .281 focused execution and exact-head release gates remain pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
