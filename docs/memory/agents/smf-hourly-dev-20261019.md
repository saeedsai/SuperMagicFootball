# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.272 — AI-PASS-INTERCEPTION-CROSS-TRACK-READ-01:** the second CPU defender now discounts sideways momentum when turning into a targeted low-pass interception lane. Aligned momentum still helps; stationary/average-Defence baselines remain unchanged.
- Production change in `src/modules/ai.js`; focused real-engine Node and desktop/simulated-touch Chromium regressions cover both directions and aligned/cross-track/stationary movement.

## Next smallest action
Run exact-head Modular QA and the four-Node/four-Chromium Full Regression Census for .272. Repair only confirmed failures, then allow only the existing QA-gated promotion and independently verify Pages, main Census and hosted bytes. Continue with the next unblocked player-facing backlog item.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .271 Modular QA #45446769098 passed; exact-head Census #45446768657 passed preflight, preview, all four Node and all four Chromium shards; its QA-gated promotion job succeeded.
- Pages deployment #45449015218 succeeded on .271. Main Census #45449032183 attempt 1 failed only historical `lan_auto_two_browser_qa.py` (10-second wait); failed-job-only retry attempt 2 is running.
- Before .272, dev and main both pointed to .271 SHA `004d82892131ffd95ab73006fdba4c125c03a5ad`.
- REST reports `main.protected=false` and `dev.protected=false`; repository rulesets are empty and #87 remains open. No manual promotion or protection bypass.
- Physical two-phone #48, Render drift #86 and authenticated online hosting remain unverified/open.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
