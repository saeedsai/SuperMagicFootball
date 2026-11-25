# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.293 — AI-DEFENSIVE-PRESS-CROSS-TRACK-TURN-READ-01:** CPU press and support selection now charge a bounded 120 ms cross-track turn reserve, scaled by the defender's existing Agility (up to 12 score units). High-Agility players reorient sooner; low-Agility players are less likely to win a close arrival tie while drifting laterally.
- Production: `src/modules/ai.js`; focused Node and actual-engine desktop/simulated-touch Chromium regressions extend `ai_defensive_press_arrival`.
- .292 Modular QA #45592513282 passed. Full Regression Census #45592512918 failed only `online_account_ui_browser_qa.py` in browser shard 0 because the external online service returned its 43-second timeout message instead of the expected loading/server state; the other 71 scripts in that shard passed, and all Node shards plus the other three browser shards passed. Failed-job-only retry was requested; no production gameplay failure is established by that external-service result.
- Main remains .291 on SHA `c99e5a0a34ebced3faeeb7eef323ab22b929294c`; .292 is not promoted or deployed. Its Pages deployment and independent main Census passed.

## Next smallest action
Run exact-head Modular QA and four-Node/four-Chromium Full Regression Census for .293. Repair confirmed code/test failures, then allow only a green exact dev head through the existing QA-gated main pipeline; verify main Census, Pages deployment and hosted bytes independently.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .292 Modular QA #45592513282 passed on `faa2fda91f6c34e49c27adf1d9f5c5e4a5f7452b`.
- .292 Full Regression Census #45592512918: preflight, preview, four Node shards and three Chromium shards passed; one external online-account browser check failed. Failed-job-only retry requested.
- .291 Pages deployment #45585445113 and independent main Census #45585459338 passed.
- GitHub REST reports dev and main currently unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
