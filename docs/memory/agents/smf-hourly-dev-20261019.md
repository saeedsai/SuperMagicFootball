# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.261 — AI-LOOSE-BALL-SUPPORT-ARRIVAL-READ-01:** for validated high loose-ball and fresh ground-spill landing reads, the second CPU defender is selected using bounded 0.12-second movement projection to the exact 26-unit goal-side cover pocket. A slightly farther teammate moving into the pocket can take support from a nearer teammate moving away. Primary landing selection and non-landing distance-first behavior remain unchanged.
- Added mirrored unit, engine-level Node and actual-engine desktop/simulated-touch Chromium acceptance for both teams. Repaired the confirmed .260 fixture-scope failure: stale spill now builds from the local loose-ball fixture instead of another test's block-scoped `spill`.
- **.260 exact-head failure:** Modular QA #45374605081 and Census #45374604869 failed 1/2,847 Node tests at `tests/ai_loose_ball_second_ball_cover.test.cjs:197` with `ReferenceError: spill is not defined`; 2,846 tests passed. Source/data safeguards passed. This is a test-fixture defect, not a confirmed production gameplay failure.
- Main remains .258 on SHA `6b6d839399699341f23a11a07cc20be4d95d2553`; Pages deployment #45364600064 succeeded. Independent main Census #45364610881 attempt 2 failed only hosted `lan_render_hosted_browser_qa.py` timeout; no LAN source changed.
- Main protection #87 remains open; REST rulesets are empty. Physical #48 and Render drift #86 remain open. No physical-device or authenticated-online-hosting claim.

## Next smallest action
Inspect .261 exact-head Modular QA and Full Regression Census; fix only confirmed failures. Promote only the exact green dev head through the existing QA-gated pipeline, then independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Existing-player artwork requires Studio provenance, game-scale QA and owner acceptance. Do not claim unverified art, device or hosting acceptance.

## Evidence
- .260 Modular QA/Census #45374605081/#45374604869: 2,846/2,847 Node passed; one test fixture failed because `spill` was out of scope.
- .261 gameplay, Node, Chromium and release changes committed on existing dev; exact-head verification pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
