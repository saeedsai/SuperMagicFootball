# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.255 — AI-MAGIC-TRICK-SECOND-DEFENDER-DIRECT-READ-01:** direct named Magic Trick counters now search every active in-range defender, not only the nearest rival. The closest defender whose current 2D input or residual movement points toward the carrier and whose Defence meets/exceeds carrier Dribbling cancels the trick and receives the existing READ! cue. Retreating, stationary, low-Defence and out-of-range defenders do not qualify.
- The first-touch probabilistic screen read, Lightning timing, nearest-target non-counter effects, cooldown/fatigue, possession, four actions, saves, rosters, persistence and offline play are unchanged. Focused mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both teams, skill and range boundaries.
- **0.12.81.254 main-promoted:** Modular QA #45338748981 passed 2,843/2,843; exact-head Full Regression Census #45338748933 passed all four Node and four Chromium shards. QA-gated promotion advanced main/dev to `4c95f4f5f92ca42dfe9ff35918b5dadb8c56ba53`. Main Census #45339991189 hosted Pages smoke, preflight, preview and all Node shards passed; one browser shard had a historical LAN auto-discovery timeout, and failed-job-only retry is running.
- GitHub Pages hosted-byte smoke passed for .254. The main Census retry is still required before calling main regression fully green.

## Next smallest action
Inspect .255 exact-head Modular QA and Full Regression Census. Fix confirmed failures only; promote only the exact green dev SHA through the existing QA-gated pipeline, then verify Pages deployment, main Census and hosted bytes independently.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical #48, Render drift #86 and main protection #87 remain open. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .254 Modular QA and exact-head four-Node/four-Chromium Census passed; QA-gated promotion succeeded.
- .254 main hosted smoke passed; one historical LAN browser timeout is under failed-job-only retry.
- .255 gameplay source, focused Node/browser regressions and synchronized About/release/offline metadata are prepared for exact-head CI.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Do not read/edit another agent's private checkpoint. Never bypass CI, security or QA promotion.
