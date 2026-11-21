# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .151 AI-DEFENSIVE-CUTBACK-COVER-01: when an opponent carries wide within 320 units of the byline, the second CPU defender shades into the central cutback lane while the primary presser keeps closing. Cover point is bounded to 110 units behind the carrier and 62% toward pitch centre; central, distant, keeper and unavailable carriers retain ordinary support positioning.
- Three focused Node regressions cover mirrored directions, fallback eligibility and real driveAI support positioning. Exact-head QA pending.
- .150 AI-CUTBACK-MARKING-READ-01 is now main-promoted. Modular QA, four Node/four Chromium dev Census shards, QA-gated promotion and Pages deployment passed. Separate main-dispatch Census had one LAN browser wait timeout; failed-job-only retry attempt 2 is running.

## Next smallest action
Run .151 focused regression, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards). Fix confirmed failures, then continue with a distinct gameplay increment or documented existing-player front-run art only if Studio import/export and game-scale screenshot QA are available.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev/main: fcb2cf962e8acc1212ebb57ba0cbd2ff7d8cd061. .150 Modular QA #44888602794 and dev Census #44888602833 passed; QA-gated promotion completed; Pages deployment #44889268418 passed. Main-dispatch Census #44889268930 attempt 1 failed only browser shard 0 in lan_auto_two_browser_qa.py; attempt 2 retry is running. Issues #87, #86 and #48 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
