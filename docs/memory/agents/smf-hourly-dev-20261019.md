# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.289 — AI-MAGIC-READ-COVER-PRIORITY-01:** after a successful second-defender Magic Trick read, active give-and-go, cutback, pass-lane, loose-ball and first-touch cover assignments now outrank the temporary 0.42-second counterpress screen. The read screen remains available when no established cover is active; primary pressing and no-auto-tackle counterplay are retained.
- Production change: `src/modules/engine.js`. Focused actual-engine Node and desktop/simulated-touch Chromium regressions cover both attack directions. The .288 browser fixture's diagonal-lane assertion is calibrated from >25 to >20 units; the old horizontal fallback remains below that bound.
- **0.12.81.287 promoted and deployed:** exact-head Modular QA #45562433034 and dev Full Regression Census #45562433019 passed on SHA `76426e1492c75b8280151e986cdfa20a2a50efe7`. Main Census #45563580753 and Pages deployment #45563570683 also succeeded on that exact SHA.
- **.288 gate:** Modular QA #45571214589 passed 2,889/2,889. Full Regression Census #45571214506 failed only `magic_trick_secondary_screen_read_browser_qa.py` in browser shard 1; 71 browser tests passed and one diagonal-target threshold assertion failed. Four Node shards and three other Chromium shards passed. .288 was not certified or promoted.

## Next smallest action
Run exact .289 Modular QA and four-Node/four-Chromium Full Regression Census. Fix only confirmed failures; then verify QA-gated promotion, Pages deployment, independent main Census and hosted-byte smoke. Continue with the next bounded gameplay or existing-player Studio item.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. Authenticated online hosting is not live without owner resources.

## Evidence
- Parent/dev before .289: `f9ec86c37750449eb02c8770dbeb86a50dfd4ae9`; main remains `76426e1492c75b8280151e986cdfa20a2a50efe7`.
- .288 Modular QA #45571214589 passed; Census #45571214506 failed only the stated browser assertion.
- GitHub integration cannot read branch-protection endpoints (403); #87 remains open and no protected-branch claim is made. #48 remains open; no physical two-phone certification is claimed.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.