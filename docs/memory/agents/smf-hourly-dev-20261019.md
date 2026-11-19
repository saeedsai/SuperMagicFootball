# SuperMagicFootball — smf-hourly-dev-20261019
**Updated:** 2026-11-20

## Mission
Ship player-facing gameplay and visual improvements with four controls, original assets, saves and offline support.

## Current checkpoint
- 0.12.81.111 SLIDE-CLOSING-CONTACT-01: Sliding defenders can connect with fast opponents moving into the contact corridor using a bounded 45 ms prediction; retreating and lateral opponents retain ordinary contact reach. Exact-head QA pending.
- .110 immunity targeting; .109 eligible targets; .108 moving lead; .107 airborne guard; Breath .66–.68 complete.
- Main protection #87, Render drift #86 and physical two-phone #48 remain open.

## Next smallest action
Verify exact-head Census and Modular QA; then improve goalkeeper dive recovery and original eight-view animation.

## Ownership and exclusions
Only own checkpoint. No concept heroes, copied art or routine LAN work.

## Evidence
Production slide-contact change and focused regression added. Full CI and hosted checks pending.

## Cleanup
Keep under 4 KiB. Promote only via existing QA-gated main pipeline.
