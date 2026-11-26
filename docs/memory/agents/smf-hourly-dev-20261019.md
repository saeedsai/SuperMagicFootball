# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.320 — AI-SCREAM-HUMAN-MARKER-BACKUP-COUNTER-01:** during the existing one-second Scream hold, a selected human nearest target retains control; the nearest ready CPU teammate backs them up only when no effective human or teammate JUMP, grounded SHOOT-slide or Defence read already counters. The actual resolver recognizes that backup's existing JUMP/slide while the human remains the nearest target; only an already-countering teammate inside 135 units suppresses backup.
- .320 adds mirrored Node and actual-engine desktop/simulated-touch Chromium regressions for both teams, existing-counter suppression and exactly four gameplay actions.
- **.319 repair:** commit `67878b54c77364a5a5dc74a0bd923a81d6b7e2b0` corrected the stale offline cache, Lightning source contract, VM helper extraction and required checkpoint headings. Modular QA #45759190682 passed; Census #45759190640 passed preflight, preview and Node shards 0/2/3 at the latest observation; Node shard 1 and all four Chromium shards were running.
- .319 feature remains selected-human Lightning backup; .318 remains Fireball/Freeze/Bat backup. See master backlog for prior exact-head evidence.
- **.320 QA:** first preflight failures were three stale source contracts (Fireball counterRivals, Scream JUMP and Scream slide). The first test-only repair used over-escaped literal replacements and did not change them; #45760843095 Modular QA and #45760843057 Census therefore failed on the same three assertions. The exact escaped literals are corrected in the current repair; no .320 browser acceptance was reached in those runs.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Next smallest action
Rerun .320 Modular QA and four-Node/four-Chromium Census after the exact source-contract repairs, Fireball backup-radius fixture correction and Scream duplicate-counter radius refinement. Inspect the Scream desktop/simulated-touch browser result, fix confirmed failures, then allow only a green exact head through the existing QA-gated main pipeline. Verify main Census, Pages deployment and hosted bytes independently.

## Evidence
- Parent before .320: `67878b54c77364a5a5dc74a0bd923a81d6b7e2b0`; main: `e1720386be42b69c068afa0c193148f21abaefe7` (.314).
- .319 repair Modular QA #45759190682 passed. Census #45759190640: preflight, preview and all four Node shards passed; Chromium shards 0, 1 and 3 passed; shard 2 failed only the Fireball human-backup fixture described above.
- Original .319 preflight failures (offline cache, checkpoint heading, Lightning source contract, VM extraction SyntaxError) were corrected. .320's three stale counter-source contracts are corrected; Fireball backup browser fixture now keeps the backup inside the existing 120-unit radius.
- Main protection remains disabled (#87); physical two-phone acceptance #48 and Render drift #86 remain open.

## Cleanup
- No other agent checkpoint was read or modified. No LAN/P2P, roster, art, save-schema or online-hosting changes in this repair.
