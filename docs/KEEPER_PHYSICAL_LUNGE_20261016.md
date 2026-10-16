# Bounded physical goalkeeper lunge — implementation and QA checkpoint
**Date:** 16 October 2026. **Module:** `src/modules/engine.js`, active Pages gameplay.

## Problem / evidence
Prior diving iterations implemented a visible early `keeperDiveAttempt` and shot-to-contact telemetry, but **only animation** moved on an attempt. A completed real-engine 149/149 baseline ([regression #38883629200](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38883629200)) provided 288 deterministic ordinary/straight Super Shot calibrations across desktop/touch, three FPS, mirrored teams, fatigued/rested keepers and center/corner lanes. This is not a measured population of human-v-CPU match attempts; do not extrapolate real-world scoring percentages.

## Delivered P0 functionality
- New `advanceKeeperDive(p,dt)` is applied in playable `updatePlayers()` to an **autonomous** goalkeeper only if an eligible predicted dive intent is active. The real goalie `y` world position moves toward the physical projected ball crossing point.
- A **28 world-unit hard cap** *per dive attempt* ensures that this never becomes a teleport; individual keeper cap `min(28, 9 + 0.22 * GK Diving) × (1 - 0.55 * fatigue)`. Per-frame speed is also bounded by `(105 + 0.75 * GK Diving) × (1 - 0.55 * fatigue)` units/s. `diveAdvanceTravel` tracks cumulative displacement, reset on new early intent. Bounded `dt <= 0.1s` prevents a throttled single-frame leap.
- The early dive must still be in an active attempt/animation phase, and ball movement must be toward the guarded keeper goal. The lunge stops for a carried/outgoing shot, stun, cooldown, a shot clearly past the keeper, invalid prediction or outside-mouth target.
- No change to ball trajectory, shot power/fatigue, goalie reaction/contact radius, goal geometry, swept contact, rare Super-save probability, save notification, controls or player metadata.
- Manual goalkeeper movement is never overridden. Other agents' rosters/art/data/save formats are preserved.
- Rotated the PWA service worker identifier to `smf-082537-keeper-lateral-lunge-v1` and synchronized the inherited pinned offline-cache test assertions.

## New acceptance tests
- `tests/keeper_physical_lunge.test.cjs`: bounded travel, partial-fatigue factor, physical-only implementation, no ball mutations, preserved narrow `tryKeeperDive` contact, AI-only update hook, intent reset.
- `tests/keeper_physical_lunge_browser_qa.py`: real modular HTML engine in desktop and emulated-touch Chromium; two defending sides × 30/60/120Hz × fresh/tired = **12 fixtures per browser context**, 24 in total. A keeper must physically move on real `updatePlayers`, never move its X position, never exceed per-attempt cap or change the ball before `updateBall`, never record early contact or save, stop lunge for away shots, and move less when tired.
- Registered new tests with `.github/workflows/full-regression-census.yml`. Existing seeded shot/corner calibration, old keeper/goal tests, four-button input, team/graphics and roster tests must all continue passing in the full census.

## Integration QA details / incident
Initial code-checkpoint commits had a **false failure** in historical `tests/keeper_dive_intent.test.cjs`, which extracted everything between the intent method and `tryKeeperDive` and forbade changing *any* keeper position. The new genuine physical lunge method was inserted in that same range and correctly adjusts `p.y`. The test now extracts **only** `tryKeeperDiveIntent` to confirm early intent is still nonmutating; the new lunge test separately enforces its bounded physical movement and no ball manipulation. No gameplay rollback is warranted from this old assertion failure.

A concurrent goalkeeper agent corrected duplicate save notifications from diving catches and retained the original catch pose on its own `dev` commits. The latest test-only correction was applied *on top* of that fix without overwriting it. Compare and certify exact GitHub Actions commit SHAs rather than assuming all queued runs pass.

## Remaining limitations and next actions
1. Current lunge is deliberately modest; repeated **full engine human-v-CPU match** benchmarks are required before any further reach/dive power increase. Refine the serious Super Shot and late wide-corner save cohort (nonlinear levels 2–5).
2. Finish eight-direction glove holding/throw/punt animations without touching match ball grip height.
3. Improve first-touch, pass and reception animations with directional visual tests.
4. Add source-aware graphics/player data merge provenance and editor conflict review; roster and art agents work concurrently.
5. Add career/tactics suitability/substitution guidance without migration of save schema.

Full physical Android/iOS browser matrix, offline/PWA installation performance, referee/classic parity and network play are still deferred or long-term. **No archived reports/templates were deleted**: old test scripts are discovered by current CI; local generated `tests/.generated` and Python cache files remain ignored transient output.

## Final workflow results
To be filled with an exact green `dev` source SHA, completed Node and browser shard totals, and post-deploy desktop/touch smoke. Never attach an older green run to the later live code if a concurrent agent has advanced `dev`.
