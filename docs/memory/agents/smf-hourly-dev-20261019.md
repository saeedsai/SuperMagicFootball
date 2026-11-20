# SuperMagicFootball — smf-hourly-dev-20261019
**Updated:** 2026-11-20

## Mission
Ship player-facing gameplay and visual improvements with four controls, original assets, saves and offline support.

## Current checkpoint
- 0.12.81.115 KEEPER-ROLL-MOVING-LEAD-01: bounded moving-receiver rollout lead. Focused test added; CI unverified.\n- 0.12.81.114 KEEPER-ROLL-SAFE-RECEIVER-01: grounded DRIBBLE rollout prefers safer standing outlet. Exact-head QA pending.
- 0.12.81.113 KEEPER-OUTLET-PRESSURE-01: Prefer clear short distribution receivers with less immediate defender pressure. Exact-head QA pending.\n- 0.12.81.112 KEEPER-DIVE-SETTLE-01: Goalkeeper dive animation settles sooner for skilled, fresh keepers and lasts slightly longer for tired or inexperienced keepers; existing save reach and dive cooldown remain unchanged. Exact-head QA pending.
- .110 immunity targeting; .109 eligible targets; .108 moving lead; .107 airborne guard; Breath .66–.68 complete.
- Main protection #87, Render drift #86 and physical two-phone #48 remain open.

## Next smallest action
Verify exact-head Census and Modular QA; then improve goalkeeper catch-to-release transition and original eight-view animation.

## Ownership and exclusions
Only own checkpoint. No concept heroes, copied art or routine LAN work.

## Evidence
Production goalkeeper animation change and focused regression added; no full QA observed. Full CI and hosted checks pending.

## Cleanup
Keep under 4 KiB. Promote only via existing QA-gated main pipeline.
