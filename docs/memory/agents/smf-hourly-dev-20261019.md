# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.271 — AI-DRIBBLE-TRICK-READY-THREAT-01:** CPU dribble-style tricks now judge risk and choose their escape side from active defenders only. Downed, invulnerable, shot-down/get-up and impact/hurt-recovery opponents no longer create false pressure or pull the CPU away from the defender who can actually contest the move. Active slides remain threats; human trick targeting is unchanged.
- Implementation in `src/modules/engine.js`; focused real-engine Node and desktop/simulated-touch Chromium regressions cover both teams, unavailable-state filtering, active-defender priority and human compatibility.

## Next smallest action
Run exact-head Modular Game Dev QA and the four-Node/four-Chromium Full Regression Census for .271. Repair only confirmed failures, then allow only the existing QA-gated promotion and independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .270 Modular QA #45440068162 passed; exact-head Full Regression Census #45440068012 passed preflight, preview, all four Node and all four Chromium shards, and its QA-gated promotion job succeeded.
- Pages deployment #45441979864 succeeded; independent main Census #45441993948 passed preflight, preview, hosted-pages smoke and all four Node/four Chromium shards.
- Before the .271 commit, dev and main both pointed to .270 SHA `bbbb3e675d3e2b11a3c40908e7286a72e9257d9c`. .271 is a new dev candidate; its exact-head gates are pending.
- REST reports `main.protected=false` and `dev.protected=false`; repository rulesets are empty and #87 remains open. No manual promotion or protection bypass.
- Physical two-phone #48, Render drift #86 and authenticated online hosting remain unverified/open.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
