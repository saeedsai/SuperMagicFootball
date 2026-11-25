# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-25

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four match actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.300 — KEEPER-HIGH-CROSS-JUMP-REACH-01:** a grounded attacker now forces a high-cross punch only when the existing Jumping stat's first-jump envelope can reach the projected ball at the 120 ms pressure horizon. Low/average Jumping no longer creates false punch pressure on unreachable high balls; elite jumpers and reachable lower crosses still count. Airborne challengers retain live-pose/body-overlap checks.
- Parent .299 `25da96aa2ddf1ba5d188da936f097c649f657e4f` passed Modular QA #45642933090 and dev Full Regression Census #45642931875. QA-gated promotion succeeded; Pages #45644606856 and independent main Census #45644621966 passed, including hosted smoke and all four Node/four Chromium shards. Dev and main both reached .299.
- .300 adds mirrored Node and actual-engine desktop/simulated-touch Chromium coverage for both goals, Jumping 1/50/100, missing/invalid fallback and a low cross that remains contestable.

## Next smallest action
Run exact-head Modular QA and the complete four-Node/four-Chromium Full Regression Census for .300. Diagnose observed failures only; if green, allow the existing QA-gated pipeline to promote and independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance, game-scale QA and owner acceptance. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- Parent dev/main HEAD: `25da96aa2ddf1ba5d188da936f097c649f657e4f`.
- Parent Modular QA #45642933090: passed; dev Census #45642931875: all four Node/four Chromium passed; promotion succeeded.
- Main Pages #45644606856: passed; main Census #45644621966: all gates and hosted-pages smoke passed.
- .300 exact-head CI: pending; no local Node/Chromium run because github.com DNS is unavailable in the container, so connected GitHub Actions is the validation path.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.
