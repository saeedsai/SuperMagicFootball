# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.322 — KEEPER-PARRY-REBOUND-RECOVERY-READ-01:** parry second-ball races now ignore opponents and teammates with positive shot-impact pending, knockdown or get-up timers. Recovering rivals cannot make the keeper abandon a safe chase; recovering teammates cannot steal the handoff, and both re-enter the same race when their timers clear.
- Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both goals, all three timers and active-state countercases. Exact-head gates are running on the .322 candidate; parent .321 Modular QA #45764345312 passed 2,947/2,947, but Census #45764345274 failed two browser fixtures described below.
- **.323 gate-fixture repair:** the Teleport CPU-only baseline now initializes with zero humans so its CPU defender cannot be mistaken for the selected human. The Fireball human-marker fixture now controls only the defending marker and advances the carrier's wind-up explicitly, avoiding synthetic-input cancellation and testing the intended JUMP backup. No production code changed in this repair.
- Parent dev SHA for the .322 feature: `ea86e342b210129336e3ee157186b8f18ce5c15c`; main remains `e1720386be42b69c068afa0c193148f21abaefe7` (.314). This .323 repair is test/docs-only; player-facing version remains .322.

## Next smallest action
Inspect exact-head .323 Modular QA and Full Regression Census. Fix any confirmed failure, then let only a green exact head use the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with a distinct defensive-coordination or Player Studio improvement.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- Parent .321 Modular QA #45764345312 passed 2,947/2,947 Node tests.
- Parent .321 Census #45764345274: preflight/preview and all four Node shards passed; browser shards 0 and 2 failed the Teleport CPU-only baseline and Fireball human-marker fixtures; no source gameplay failure was established.
- .322 exact-head Modular QA #45766726060 and Census #45766725769 were running at last observation; Census preflight and preview passed, Node shards 2/3 passed.
- Main HEAD: `e1720386be42b69c068afa0c193148f21abaefe7`; branch protection #87 remains unresolved.

## Cleanup
- Read only this agent's checkpoint. No LAN/P2P, roster, art, save-schema or online-hosting changes in this increment.
