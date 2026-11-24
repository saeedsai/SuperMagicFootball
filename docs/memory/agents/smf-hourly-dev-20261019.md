# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.257 — AI-LOOSE-BALL-PRIMARY-LANDING-READ-01:** for eligible descending high loose balls, the primary CPU presser now meets the shared predicted landing point while the second defender keeps the 26-unit goal-side cover. Both roles use one bounded ballistic projection, avoiding divergent pursuit targets. Ground spills, passes, shots, keeper behavior, ball physics, four actions, saves, rosters, persistence and offline play are unchanged.
- Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions cover both goals, moving/vertical drops, shared projection, 26-unit spacing and fail-closed states. Modular QA #45358492760 passed; exact-head Census #45358492733 is running.
- Corrected the stale contested-cross browser fixture: its 80-unit rebound pocket was intentionally unreachable under .256's new arrival gate; it now matches the Node test's reachable 8-unit pocket. The dedicated parry-chase suite retains far/unreachable coverage.
- **.256 prior candidate:** Modular QA #45356206934 passed; Census #45356206870 failed only the contested-cross browser fixture's unreachable 80-unit chase setup. Corrected in the .257 follow-up; no .256 promotion is claimed.
- **0.12.81.255 main-promoted:** dev Modular QA #45347036594 and Full Regression Census #45347036669 passed on `16824300c39c3d97fb59dfa3d82556de0eac47b1`; QA-gated promotion advanced main/dev to the same SHA. Pages deployment #45348250257 succeeded. Main Census #45348259495 passed on failed-job-only retry attempt 2: all Node/Chromium shards, preflight, preview and hosted-pages smoke.

## Next smallest action
Inspect .257 exact-head Modular QA and Full Regression Census. Fix confirmed failures only; promote only the exact green dev SHA through the existing QA-gated pipeline, then independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical #48, Render drift #86 and main protection #87 remain open. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .255 dev Modular QA and exact-head four-Node/four-Chromium Census passed; QA-gated promotion and Pages deployment succeeded.
- .255 main Census passed after failed-job-only retry, including hosted-byte smoke and all four Node/four Chromium shards.
- .256 source, focused Node/browser regressions and synchronized About/release/offline metadata are prepared for exact-head CI.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Do not read/edit another agent's private checkpoint. Never bypass CI, security or QA promotion.
