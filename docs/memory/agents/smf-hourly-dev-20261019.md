# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.287 — KEEPER-HIGH-CROSS-CROSS-TRACK-TURN-READ-01:** CPU high-cross claim reach now discounts cross-track keeper momentum by a turn-response cost capped at 18 units. Aligned approach momentum retains its existing bonus, retreating momentum its existing penalty, and stationary reach is unchanged. Active attacker/teammate arrival priority, claim geometry and catch physics are preserved.
- Production change: src/modules/ai.js. Focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both goals, cross-track versus aligned momentum and the bounded cost ceiling.
- First exact-head Modular QA #45562171349 and Full Regression Census #45562171160 found the same source integration error: targetDx/targetDy were referenced before declaration in the high-cross helper (2,877/2,888 Node pass, 11 fail). The helper now defines the projected target vector once; exact-head reruns are pending.
- **0.12.81.286:** exact-head Modular QA #45560134671 and Full Regression Census #45560134679 passed. The QA-gated promotion advanced main to 5ff5690bd4f0b6c2235c1e3808f0278e28268702; Pages deployment #45561627064 succeeded. Independent main Census #45561635861 remains in progress, with hosted smoke/preflight/preview passed and remaining shards running at last inspection.

## Next smallest action
Run exact .287 Modular QA and four-Node/four-Chromium Full Regression Census after the target-vector correction. Fix only confirmed failures; then verify QA-gated promotion, Pages deployment, independent main Census and hosted-byte smoke. Continue with another distinct gameplay or existing-player Studio improvement.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. Authenticated online hosting is not live without owner resources.

## Evidence
- .287 source-fix parent dev HEAD: 897832ec1b82479a59c49e31ca80e933dc4fd6e3; main HEAD: 5ff5690bd4f0b6c2235c1e3808f0278e28268702.
- .286 exact-head Modular QA and dev Census passed; .286 promotion and Pages deployment succeeded. Main Census is not yet independently green.
- GitHub branch metadata reports dev.protected=false and main.protected=false; repository rulesets are empty and #87 remains open. #48 remains open; no physical two-phone certification is claimed.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.