# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Prioritize player-facing gameplay, then existing-player animation/graphics, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only work. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current candidate
- **0.12.81.214 — AI-THROUGH-BALL-GOALKEEPER-CLAIM-READ-01:** through-ball safety now projects an active opposing keeper into the bounded arrival window and uses a 90–110-unit collection pocket scaled by GK Skill, GK Diving and fatigue. High-reach keepers can stop a speculative lead; weak/tired keepers may not. Recovery/catch states do not falsely block. The existing safe support-run PASS remains the fallback. Outfield reach, ball physics and four actions are unchanged.
- Mirrored Node regressions cover both goals, skill/fatigue, outfield baseline, recovery and closing/retreating keeper motion. New desktop/simulated-touch browser acceptance drives the actual engine and checks throughBall vs supportRun fallback.
- Candidate committed to existing dev; exact-head Modular QA and Full Regression Census are pending. No local Node/Chromium result is claimed.

## Previous verified baseline
- 0.12.81.213 exact dev/main baseline: `7455a4de94fc4c4f17fe120afab4d5a2ef6eb86e`.
- Modular QA #45109382597 and Full Regression Census #45109382674 passed at .213. Main Census #45110306675 and Pages deployment #45110298723 passed. Hosted verification applies to .213, not .214.
- Main and dev were equal at .213. GitHub reported `protected=false` for both branches; issue #87 remains a real security issue.
- #86 Render commit-trigger drift, #48 physical two-phone acceptance, #10 graphics scope and #3 Android double-tap remain open. Do not close #48 or claim physical certification. No routine LAN/P2P work.

## Next five product improvements
1. Improve first-touch responsiveness, intelligent passing and fair interception/tackle decisions without adding controls.
2. Continue source-faithful existing-player eight-view Studio graphics after graphics scope is available; require game-scale desktop/touch screenshot acceptance and retain procedural fallback.
3. Improve goalkeeper dive/catch reactions and second-ball recovery where a reproducible gap remains.
4. Improve Player Studio live preview and directional customization.
5. Deepen Career/Cup progression and match presentation.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Authenticated online hosting still needs owner resources. Do not expose Git SHA in player UI.

## Evidence
- .213 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45109382597
- .213 Full Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45109382674
- .213 Main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45110306675
- .213 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45110298723

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
