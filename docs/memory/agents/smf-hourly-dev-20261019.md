# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve the four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.248 — AI-DRIBBLING-SKILL-CARRY-CUT-01:** CPU pressure escapes now use the carrier's Dribbling rating to shape only the existing diagonal target. Neutral 50 preserves the old 78-forward/86-lateral route; low ratings cut more forward, high ratings can cut more sharply laterally. Safety scoring, slide clearance, movement speed and human input remain unchanged.
- Added mirrored Node helper regressions and actual-engine desktop/simulated-touch Chromium coverage for both teams, low/neutral/high stats and missing/invalid fallback. Exact-head CI pending at the new commit.
- **.247 main-promoted and independently verified:** Modular QA #45306378261 and dev Census #45306378185 passed on SHA `31c24ae2a11007b7c719a97913d8821f0d7bd6e0`; Pages #45307713844 and independent main Census/hosted smoke #45307721714 passed all four Node/Chromium shards.

## Next smallest action
Inspect exact-head .248 Modular QA and Full Regression Census, repair only confirmed failures, then permit only the green exact dev head through the existing QA-gated promotion. Independently verify resulting main SHA, Pages deployment, main Census and hosted-byte smoke. Continue with the next unblocked gameplay improvement.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 remains unresolved. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .247 Modular QA #45306378261, dev Census #45306378185, Pages #45307713844 and independent main Census/hosted smoke #45307721714 passed.
- .246 main release independently verified by QA #45302839796, dev Census #45302839739, Pages #45304190113 and main Census #45304200011.
- #87 branch protection; #86 Render commit-trigger drift; #48 physical two-phone acceptance.

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read/edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
