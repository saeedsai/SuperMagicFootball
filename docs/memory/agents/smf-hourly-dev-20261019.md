# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-26

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.321 — AI-TELEPORT-LANE-HUMAN-BACKUP-01:** CPU Teleport response now selects the nearest ready defender in the actual forward slide-intercept lane; an off-lane nearer opponent no longer blocks that response. If the selected human is the nearest lane marker and has not already countered with JUMP, grounded SHOOT-slide or Defence read, the nearest ready CPU teammate in-lane backs them up using existing difficulty timing. Resolver corridor/range, .88 slide timing and one-second cast remain unchanged.
- Focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both sides, off-lane nearest opponent, selected-human backup, no-duplicate counters and four actions. Exact-head results are pending.
- Parent dev before .321: 9447f79a22ed287de71b9c7165618f1f84de03e7; main: e1720386be42b69c068afa0c193148f21abaefe7 (.314).
- .320 current-head Modular QA #45761287613 passed; Keeper Save Event Integrity #45761287691 passed. Full Regression Census #45761287589 passed preflight and preview, Node shards 2/3 passed; Node shards 0/1 and all four Chromium shards were still running at last observation.

## Next smallest action
Inspect exact .321 Modular QA and Full Regression Census. Fix any confirmed focused Node/Chromium failure, then let only a green exact head use the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. After the release gate, continue with a bounded CPU defensive handoff or goalkeeper improvement rather than repeating already-covered counter fixtures.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Evidence
- .320 exact-head Modular QA #45761287613: passed. Keeper Save Event Integrity #45761287691: passed. Census #45761287589: preflight/preview and Node shards 2/3 passed; other six shards still running at last inspection.
- .321 source/tests and release metadata prepared as one fast-forward dev change; exact-head Modular QA/Census results must be observed before certification.
- GitHub REST reports main and dev protection false; #87 remains open. Physical two-phone acceptance #48 and Render drift #86 remain open.

## Cleanup
- Read only this agent's checkpoint. No LAN/P2P, roster, art, save-schema or online-hosting changes in this increment.
