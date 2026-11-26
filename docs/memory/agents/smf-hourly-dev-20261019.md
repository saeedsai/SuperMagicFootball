# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-26

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.321 — AI-TELEPORT-LANE-HUMAN-BACKUP-01:** CPU Teleport response selects the nearest ready defender in the actual forward slide-intercept lane; a closer off-lane opponent no longer blocks the response. If the selected human is the nearest lane marker and has not already countered with JUMP, grounded SHOOT-slide or Defence read, the nearest ready CPU teammate in-lane backs them up using existing difficulty timing. Resolver corridor/range, .88 slide timing and one-second cast remain unchanged.
- Focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both sides, off-lane nearest opponent, selected-human backup, no-duplicate counters and four actions. Exact-head results are pending.
- **.320 Census repair:** #45761287589 failed only browser shard 2. Fireball's 60-frame fixture ended at hold .8667 before the existing backup window; its CPU was still inside the 120-unit radius. Scream's fixture observed the selected human already in a valid airborne JUMP and countered=true, but incorrectly demanded a duplicate CPU JUMP. Both browser assertions are corrected without production rule changes.
- Parent dev before .321: 9447f79a22ed287de71b9c7165618f1f84de03e7; main: e1720386be42b69c068afa0c193148f21abaefe7 (.314).

## Next smallest action
Inspect exact .321 follow-up Modular QA and Full Regression Census after the confirmed browser-fixture corrections. Fix any new failure, then allow only a green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with a distinct CPU defensive coordination or goalkeeper improvement after the gate.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- .320 Modular QA #45761287613 passed; Keeper Save Event Integrity #45761287691 passed. Census #45761287589: preflight/preview and all Node shards plus three Chromium shards passed; browser shard 2 failed the two fixture expectations above.
- .321 Modular QA #45763418879 and Census #45763418866 were in progress at last inspection; exact-head results pending.
- GitHub REST reports main/dev protection false; #87 remains open. Physical two-phone acceptance #48 and Render drift #86 remain open.

## Cleanup
- Read only this agent's checkpoint. No LAN/P2P, roster, art, save-schema or online-hosting changes in this increment.
