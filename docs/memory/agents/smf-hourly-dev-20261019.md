# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.234 — KEEPER-HIGH-CROSS-CLAIM-READ-SKILL-FATIGUE-01:** CPU goalkeeper high-cross claim reach now scales with GK Skill and GK Diving independently, with a combined 260-unit cap; average 50/50 keeps the previous 235-unit limit exactly. Low ratings reduce the claim pocket and fatigue subtracts up to 28 units. Flight-time and aerial-contest checks remain authoritative.
- Focused mirrored Node and real-engine desktop/simulated-touch Chromium regressions cover skill-only, diving-only, neutral, low, tired, invalid and clamped profiles on both goals.
- .233 exact-head Modular QA #45218022588 passed; Full Regression Census #45218025990 passed preflight/preview and Node shards 2/3, with Node shards 0/1 and all four Chromium shards still in progress at the .234 start. The .233 metadata-only failure was the missing code-formatted Agent ID; fixed in a1b5ba78f7a32ab1b1f8328748e24eb240a5b154.
- .232 passed exact-head Modular QA #45201732994 and all four Node/four Chromium Census shards #45201732936, then promoted through the existing QA-gated pipeline. Pages #45203753806 and independent main Census/hosted smoke #45203767885 passed. Dev and main were both b3740b4bf79903d686ed61b5e6d927dce2f8d672 before this .233 commit.

## Next smallest action
Observe .233 exact-head Modular QA and Full Regression Census. Fix only confirmed failures; allow promotion only through the existing green exact-head QA pipeline, then independently verify Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is not enabled. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .232 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45201732994
- .232 exact-head Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45201732936
- .232 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45203753806
- .232 independent main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45203767885

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read or edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
