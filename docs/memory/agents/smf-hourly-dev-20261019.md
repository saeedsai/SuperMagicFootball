# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .178 AI-KEEPER-HIGH-CROSS-CLAIM-01: CPU keepers predict a reachable targeted lofted pass landing in their own goal corridor and step off the line to claim it. The helper requires a fresh unowned opposing pass, active intended receiver, bounded flight/landing region and enough time to reach the point; it yields to a clearly closer active outfielder. Existing shot/dive/catch thresholds and ball physics are unchanged.
- Focused Node helper/engine regressions and desktop/simulated-touch Chromium acceptance are committed; execution on exact .178 SHA is pending.
- .177 Modular QA #44993688149 and Census #44993688107 failed the single project-memory contract because this checkpoint lacked `## Evidence`. Restored in base commit fe2b6d59; no production gameplay failure was reported. A fresh exact-head run after the repair was not observed.
- Before .178 work, main and dev both resolved to fe2b6d59. Independent Pages/main hosted verification for .177 was not rechecked in this run.
- #87 main protection, #48 physical two-phone acceptance, #86 Render drift and #10 existing-art owner acceptance remain open.

## Next smallest action
Run exact-head Modular QA and the full four-Node/four-Chromium Census for .178. Fix only confirmed failures, then continue with an independent gameplay improvement.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual approval or physical-device acceptance claimed.

## Evidence
- Base dev/main SHA: `fe2b6d59b69e0ee0ebeaed5b16333f62d67d6aa5`.
- AI helper commit: `e18be5fb7c96a022331ff2428a0ad446fc222d3b`.
- Engine integration commit: `2a33b13fa0e9ddc2cdbdc1ae6046a3c366e8275b`.
- Node regression commit: `6d566aac4cedb43dbaae5f315de8b27019ec5b67`.
- Chromium acceptance commit: `abbf92aa67aeba9247a8d351f8ceb692ab2d0339`.
- .178 release metadata, backlog and checkpoint updates are committed after those feature/test commits; exact final head is reported in the run summary.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
