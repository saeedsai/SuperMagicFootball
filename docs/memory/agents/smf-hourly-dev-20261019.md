# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.366 — SLIDE-EXPOSED-BALL-CLEAN-TOUCH-01: human Pass/Shoot slides can resolve a clean ball-only touch on a validated exposed low ball within 34 units when the carrier body remains outside the 64-unit body-contact envelope. The carrier is not stunned or displaced; body tackles, shielding and fallback remain.
- Production: src/modules/engine.js; transient slide target identity only, no save-schema or roster change.
- Regressions: mirrored actual-GameEngine Node coverage and desktop/simulated-touch browser acceptance for both teams/actions, 34-unit boundary, shielded/missing-ball fallback and body-contact precedence.
- .365 Modular QA #45998616273 passed; Full Regression Census #45998616291 failed one browser fixture because its pressure marker was not mirrored with team facing. .366 repairs that fixture without changing production .365 behavior.

## Next smallest action
Inspect .366 exact-head Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline; independently verify main Census, Pages deployment and hosted bytes. Then advance the next distinct gameplay or existing-player animation improvement.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Current dev base: 3e21f1f2ad091839c0bb32498147dde00658674a; main: 9fa60ffcbf285df8b8c5145074c02c23a89d17b8.
- .365 Modular QA #45998616273 passed. .365 Census #45998616291: preflight, four Node shards and three Chromium shards passed; one Chromium shard exposed the mirrored first-touch fixture issue.
- Main .364 Census #45996166446 and Pages deployment #45996157210 passed; .366 is not certified, promoted or deployed.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
