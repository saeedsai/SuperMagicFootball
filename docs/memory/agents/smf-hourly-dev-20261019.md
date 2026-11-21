# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .163 AI-GOALMOUTH-GIVE-AND-GO-DEFENSIVE-SCREEN-01: when an opponent controls a goalmouth square pass and the original passer runs into the reserved return lane, the second CPU defender screens the return corridor while the primary presser keeps closing. Runtime-only, mirrored, short carrier lead; four focused Node regressions added.
- .162 KEEPER-PARRY-REBOUND-CHASE-01: dev Modular QA #44935200826 and dev Full Regression Census #44935200823 passed; Pages #44936865795 succeeded. Main-dispatch Census #44936866079 failed only historical lan_auto_two_browser_qa.py (62 pass, one 10-second wait timeout); failed-job-only retry requested. No physical acceptance claimed.
- .161 AI-CARRY-ESCAPE-01 is main-promoted; exact-head QA, all eight Census shards, Pages and independent main smoke passed.

## Next smallest action
Inspect .163 exact-head Modular QA and four Node/four Chromium Census; repair only confirmed failures. Then move to the next unfinished gameplay or existing-player visual improvement, not Breath or routine LAN.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Base dev/main SHA: `68f4df1bbc71be0e2d9f9817fe13c6df94861eeb`. Main branch API reports `protected: false`; protection endpoint is not readable by this integration. Physical two-phone acceptance #48 and Render drift #86 remain open. No visual art approval or physical-device acceptance claimed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
