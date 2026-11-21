# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .162 KEEPER-PARRY-REBOUND-CHASE-01: a CPU goalkeeper that parries a shot may step up to a bounded landing pocket for its own descending rebound. It yields to a closer active teammate or an opponent who can reach the pocket first; the runtime-only chase clears on possession, a new kick or expiry. Dive/get-up timing, catch/save radius, ball physics, human input, saves and rosters unchanged.
- Five focused helper/engine Node regressions added in `tests/keeper_parry_rebound_chase.test.cjs`. Exact-head CI, focused Chromium and release gates pending; no local Node/Chromium run.
- .161 AI-CARRY-ESCAPE-01 is main-promoted: Modular QA #44929100642, all four Node/four Chromium dev Census shards #44929100633, QA-gated promotion, Pages #44929914880 and independent main Census/hosted smoke #44929914783 passed.

## Next smallest action
Inspect .162 exact-head Modular QA and Census; fix only confirmed failures, then continue the next meaningful gameplay or existing-player visual improvement. Do not repeat Breath or already-covered counter work.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Base main/dev SHA: `25553f70d931bcfbdd171ff5fe581f5868b94506`. Feature test commit: `bd0575eadfbe274055583a28fccfe436410d8a62`. Main protection #87, physical two-phone acceptance #48 and Render drift #86 remain open. No visual art approval or physical-device acceptance claimed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
