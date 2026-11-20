# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-20

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .129 PASS-POKE-VALID-TARGET-01: normal PASS poke excludes invulnerable, downed and getting-up targets and selects the next reachable active opponent. Focused regression added; exact-head QA pending.
- .128 Teleport second-defender grounded SHOOT-slide interception; .127 Wind distance falloff; .126 airborne Wind resistance; .125 Mud jump evasion; all exact-head QA pending.
- Latest observed exact-head .128 Census and Modular QA failed in Node preflight/source-and-data. Confirmed failures included stale README heading, old Wind distance assumptions, test harnesses missing extracted helpers/context, stale Magic Trick assertions, and this checkpoint's missing identity marker. Fix those gates before promotion.
- Main protection #87, Render drift #86 and physical two-phone acceptance #48 remain open. Breath .66–.68 is complete.

## Next smallest action
Run exact-head Census and Modular QA; fix any remaining confirmed failures. Then continue intelligent passing/tackling, goalkeeper behavior and original existing-player animation.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN work or other agents' private checkpoints.

## Evidence
Candidate .129 production code, regression and release metadata committed on dev. Exact-head tests and hosted release are not yet observed.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
