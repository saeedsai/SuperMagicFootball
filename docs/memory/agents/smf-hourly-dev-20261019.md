# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.262 — AI-DEFENDER-RELATIVE-APPROACH-POKE-01:** early CPU PASS-poke timing now uses relative defender/carrier closing. A defender already moving into a grounded, exposed carrier can commit in the existing window; retreating/lateral motion and stationary facing alone cannot. Defender velocity is capped at 360 units/s; existing skill threshold, 55 ms/12-unit lead, 16-unit step and 62-unit predicted-gap gate remain.
- Added mirrored helper boundaries, actual GameEngine.driveAI Node integration and desktop/simulated-touch browser acceptance. Four controls and ball/tackle physics are unchanged.
- **.261 exact-head gates:** Modular QA #45377473770 passed 2,849/2,849; Full Regression Census #45377473225 passed all four Node and four Chromium shards on SHA `5ab96a2ddf6eeb5763e7e1cc834aaedf995b3aed`.
- **.261 main release:** Pages deployment #45379378786 succeeded; independent main Census #45379388061 passed hosted smoke, preflight, preview, all four Node and all four Chromium shards. Main/dev were both .261 before this candidate.
- Main protection #87 remains open; REST reports both branches unprotected. Physical #48 and Render drift #86 remain open; no device or authenticated-hosting claim.

## Next smallest action
Inspect exact-head .262 Modular QA and Full Regression Census. Fix confirmed source/test failures, then promote only a green exact dev head through the existing QA-gated pipeline and independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Existing-player artwork requires Studio provenance, game-scale QA and owner acceptance. Do not claim unverified art, device or hosting acceptance.

## Evidence
- .261 dev Census #45377473225: passed all eight shards.
- .261 main Pages #45379378786: success.
- .261 main Census #45379388061: success, including hosted-pages smoke and all eight shards.
- .262 implementation and focused Node/Chromium regressions committed on existing dev; exact-head gates pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
