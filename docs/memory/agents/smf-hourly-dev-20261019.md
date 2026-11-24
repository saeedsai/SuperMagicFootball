# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.253 — AI-MAGIC-TRICK-2D-FACING-READ-01:** the second-defender forward-screen READ! now requires the defender's full 2D heading to point toward the carrier. It uses current dx/dy, then movement velocity, then the existing horizontal face as a stationary fallback. Perpendicular/away-facing markers cannot cancel a named Magic Trick merely because their horizontal sign matches.
- Focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both teams, perpendicular and diagonal headings, movement-velocity fallback, stationary face fallback, and unchanged trick/possession/counterpress behavior. Exact-head Modular QA and four-Node/four-Chromium Census pending.
- **0.12.81.252 main-promoted and Pages deployed:** Modular QA #45333018835 and exact-head Census #45333018761 passed on SHA `653978915b559fc1d7d70ced0afb43293f2b7d5a`; QA-gated promotion succeeded. Pages #45334513946 succeeded; independent main Census #45334521390 is in progress.

## Next smallest action
Inspect exact-head .253 Modular QA and Full Regression Census. Fix any confirmed source or fixture failure, then allow only the green exact SHA through the existing QA-gated promotion pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical #48, Render drift #86 and main protection #87 remain open. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .252 dev Modular QA and Full Regression Census passed; all four Node and four Chromium shards passed, QA-gated promotion succeeded.
- .252 Pages deployment passed; independent main Census is still running.
- .253 source and focused regressions are committed; exact-head CI results pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Do not read/edit another agent's private checkpoint. Never bypass CI, security or QA promotion.