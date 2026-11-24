# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.273 — AI-FIRST-TOUCH-OUTLET-SETTLING-EXCLUSION-01:** CPU pressured-interception outlet selection skips teammates still inside their own first-touch control window and chooses the next ready, unblocked receiver. If no safe outlet exists, existing possession retention remains.
- Production change in `src/modules/ai.js`; mirrored helper and actual-engine Node tests plus desktop/simulated-touch Chromium acceptance cover both teams.
- .272's focused helper Node tests passed, but its exact-head Census failed one browser assertion because the browser fixture placed all movement profiles outside the early-reach window; the fixture now derives its position from the active CPU profile.

## Next smallest action
Run exact-head Modular QA and the four-Node/four-Chromium Full Regression Census for .273. Repair confirmed failures, then allow only the existing QA-gated promotion. Independently verify Pages, main Census and hosted bytes before claiming release.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .272 Modular QA #45457059560 passed; .272 Full Regression Census #45457059541 failed only `ai_pass_receiver_cover_browser_qa.py` in browser shard 2; other seven regression shards and preflight/preview passed.
- Main .271 Pages deployment #45449015218 succeeded; independent main Census #45449032183 attempt 2 failed only historical `lan_auto_two_browser_qa.py` (10-second wait).
- Before .273, dev SHA was `86ed3214858d369f24634294e1e330b04e69d1c3`; main SHA was `004d82892131ffd95ab73006fdba4c125c03a5ad`.
- REST reports `main.protected=false` and `dev.protected=false`; repository rulesets are empty and #87 remains open. No manual promotion or protection bypass.
- Physical two-phone #48, Render drift #86 and authenticated online hosting remain unverified/open.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
