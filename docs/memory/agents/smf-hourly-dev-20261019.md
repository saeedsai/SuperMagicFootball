# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .157 AI-GOALMOUTH-SQUARE-PASS-01: CPU carriers in the final third can choose a low square pass to a central teammate at least 65 world units closer to goal when bounded receiver movement, projected defender pressure and the ground-pass corridor show a safer scoring outlet. Shot-first finishing, cutbacks and through balls retain priority; no new control or save field.
- .156 AI-KEEPER-SHOT-LEAD-01 is main-promoted and Pages-verified. Exact-head Modular QA #44910040703, all four Node/four Chromium dev Census shards #44910040664, Pages deployment #44910745704 and independent main Census/hosted-pages smoke #44910746145 passed.

## Next smallest action
Run focused goalmouth-pass regression, exact-head Modular QA and four-Node/four-Chromium Full Regression Census for .157. Fix only observed failures; promote only through the existing QA-gated pipeline.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Current parent dev/main .156: 6125ce3083ca5baffe64a77de263bb52ea89acbb. Main protection #87 remains unresolved; #48 physical two-phone acceptance and Render drift #86 remain open. .157 is not yet certified or deployed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
