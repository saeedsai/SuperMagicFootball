# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.322 — KEEPER-PARRY-REBOUND-RECOVERY-READ-01:** parry second-ball races now ignore opponents and teammates with positive shot-impact pending, knockdown or get-up timers. Recovering rivals cannot make the keeper abandon a safe chase; recovering teammates cannot steal the handoff, and both re-enter the same race when their timers clear.
- Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both goals, all three timers and active-state countercases. Exact-head Modular QA and four-Node/four-Chromium Census are triggered by the .322 dev commit and remain pending.
- Parent dev SHA: `99fb044d3fa03ee9425d2ef8bcde6a85085e7ec3`; main remains `e1720386be42b69c068afa0c193148f21abaefe7` (.314). Parent .321 Modular QA #45764345312 passed 2,947/2,947; Full Regression Census #45764345274 was still running at last inspection.

## Next smallest action
Inspect exact .322 Modular QA and Full Regression Census. Fix any confirmed failure on dev, then let only a green exact head use the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with a distinct defensive-coordination, goalkeeper or Player Studio improvement.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- Parent .321 Modular QA #45764345312 passed 2,947/2,947 Node tests.
- Parent .321 Full Regression Census #45764345274 was in progress; no four-Node/four-Chromium pass is claimed.
- GitHub REST branch heads before this increment: dev `99fb044d3fa03ee9425d2ef8bcde6a85085e7ec3`, main `e1720386be42b69c068afa0c193148f21abaefe7`; main/dev protection remains unresolved under #87.

## Cleanup
- Read only this agent's checkpoint. No LAN/P2P, roster, art, save-schema or online-hosting changes in this increment.
