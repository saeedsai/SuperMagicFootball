# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.291 — AI-SUPPORT-COVER-PROJECTED-FLANK-01:** CPU second-defender selection and cover point now use the carrier's bounded 120 ms lateral arrival lane; the support holds its actual side of the projected carrier when a cut crosses its current y-line.
- Production: `src/modules/ai.js`; focused Node and actual-engine desktop/simulated-touch Chromium regressions extend `ai_support_carrier_lateral_cover`.
- First .291 exact-head Modular QA #45583144965 and Census #45583145075 stopped in Node preflight on two issues: the support-selection fixture was within the existing 25-unit side deadband, and the policy contract required the About-only prefix. Both are corrected in this follow-up; fresh exact-head gates are pending.
- .290 was promoted to main/dev; Pages deployment #45580452060 succeeded. Independent main Census #45580461016 failed browser shards 1 and 3: a third-man actual-engine fixture mismatch and the known external Render hosted-broker 45-second timeout. Failed-job-only retry requested; #86 remains open.

## Next smallest action
Observe .291 Modular QA and all four Node/four Chromium Census shards on the exact corrected head. Repair confirmed failures, then allow only a green exact head through the existing promotion pipeline; verify main Census, Pages and hosted bytes independently.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .290 exact-head Modular QA #45578845899 and Full Regression Census #45578845866 passed.
- .290 Pages #45580452060 succeeded; main Census retry is running.
- GitHub REST reports both branches unprotected; #87 remains open.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
