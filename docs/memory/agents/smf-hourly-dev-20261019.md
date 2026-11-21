# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .156 AI-KEEPER-SHOT-LEAD-01: CPU finishers project an active goalkeeper's lateral moveVY over a bounded shot-arrival horizon (0.10–0.34 s, max 65 world units) and rank lanes against the projected position. Human shot aim is unchanged; diving, recovering, stunned, downed and dive-intent keepers are not extrapolated. No ball physics or save changes.
- .155 KEEPER-PARRY-SCRAMBLE-01: parry cooldown reduction is bounded and preserves the dive/get-up animation. Modular QA and keeper integrity passed; Census browser shard 0 timed out in historical LAN movement QA and shard 1 exposed a wrong-side hazard fixture, corrected in .156.
- .154 MAGIC-HAZARD-CPU-SHOOT-SWEEP-01 remains in dev but was not promoted; .156 corrects the browser fixture to exercise the actual production disarm phase with isolated players.

## Next smallest action
Run focused keeper-shot Node regression, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards). Fix confirmed failures, then promote only through the existing exact-head QA-gated pipeline.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev .155: 99d1a6b6b4e4b8c1a4ec0925c9144072ca6e275c; Modular QA #44908233879 passed; Keeper integrity #44908233821 passed; Census #44908233828 passed preflight, preview and four Node shards but failed browser shard 0 LAN movement wait and browser shard 1 Magic Hazard fixture. Main .153: 550168c8ba2f56dff9c51b45e18029c0bdd6ffdd; Pages #44899003224 and main Census/hosted smoke #44899003446 passed. Main protection #87 remains unresolved; #48 and Render drift #86 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
