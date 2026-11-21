# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .164 AI-PASS-RECEIVER-COVER-01: during a targeted low pass, the second CPU defender predicts the receiver's bounded movement and shades into the final pass lane while the primary keeps chasing the ball. High/long/stale/misdirected passes and unavailable receivers are ignored. Runtime-only; four actions, saves and rosters unchanged. Four focused Node cases plus desktop/simulated-touch Chromium acceptance added.
- .163 AI-GOALMOUTH-GIVE-AND-GO-DEFENSIVE-SCREEN-01 is main-promoted: Modular QA #44939540530, dev Census #44939540558 (all 8 shards), Pages #44940376229 and main Census #44940375595 passed.
- .162 KEEPER-PARRY-REBOUND-CHASE-01: dev Modular QA #44935200826 and dev Full Regression Census #44935200823 passed; Pages #44936865795 succeeded. Main-dispatch Census #44936866079 failed only historical lan_auto_two_browser_qa.py (62 pass, one 10-second wait timeout); failed-job-only retry requested. No physical acceptance claimed.
- .161 AI-CARRY-ESCAPE-01 is main-promoted; exact-head QA, all eight Census shards, Pages and independent main smoke passed.

## Next smallest action
Inspect .164 exact-head Modular QA and four Node/four Chromium Census; fix only confirmed failures. Then continue the next unfinished gameplay improvement, or existing-player Studio art if its import/provenance and visual-review gates are available.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Base dev/main SHA: `7cbda79937bcdc9fab8e000746fd8a55990522a1`. Main branch API reports `protected: false`; protection endpoint is not readable by this integration. Physical two-phone acceptance #48 and Render drift #86 remain open. No visual art approval or physical-device acceptance claimed.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI or security.
