# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.216 — two gameplay improvements:** AI-THROUGH-BALL-ARRIVAL-LEAD-01 scales the support-run lead to estimated pass travel time while preserving the 110-unit minimum pass distance and 48–100-unit lead cap. AI-CUTBACK-GOALKEEPER-CLAIM-READ-01 scales the central cutback receiving pocket to keeper Skill, Diving and fatigue (72–92 units); outfield reach remains 74.
- Mirrored Node regressions cover both attacking sides, lead timing, minimum-distance safety and keeper skill/fatigue. Desktop/simulated-touch real-engine through-ball acceptance uses the same geometry. Exact-head QA/Census pending; no local Node/Chromium result is claimed.
- **.215 gate diagnosis:** Modular QA #45118297505 and Full Census #45118297492 failed 3 of 2,785 Node tests. The shorter flight-time lead made three existing fixtures fall just below the 110-unit minimum; .216 preserves that invariant geometrically. No test was weakened.
- **.214 gate diagnosis:** #45116568036 and #45116568001 failed because this checkpoint lacked the required `## Current checkpoint` heading; all required sections are now present.

## Next smallest action
Inspect .216 exact-head Modular QA and all four Node/four Chromium Census shards. Fix only confirmed failures, then continue with first-touch/defensive interception intelligence or the next unblocked player-facing backlog item.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Do not change routine LAN/P2P; physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .215 Modular QA failure: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45118297505
- .215 Full Census failure: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45118297492
- .213 verified baseline: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45109382674
- .213 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45110298723

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
