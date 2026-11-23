# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.232:** AI-LOFTED-PASS-JUMP-REACH-01 makes the second defender's JUMP commitment respect the player's Jumping rating and predicted first-jump arc. A live airborne JUMP can now contact a ball above the grounded 45-unit reach; grounded players keep their prior limit.
- Added mirrored helper/engine Node regressions and desktop/simulated-touch Chromium checks for both sides, high/low Jumping, actual possession collection and the exact four buttons.
- First .232 Modular QA #45201133547 and Census #45201133684 stopped on four README heading contracts before gameplay tests. Follow-up restores the required .232 project heading and preserves the .231 release note; no gameplay failure was established yet.

## Next smallest action
Observe the rerun's four Node and four Chromium Census shards at the exact .232 SHA; fix confirmed failures, then allow only the green exact head through the existing QA-gated promotion pipeline. Verify Pages deployment, independent main Census and hosted-byte smoke separately.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is not enabled. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .232 first Modular QA failure: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45201133547
- .232 first Census preflight failure: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45201133684
- .231 exact-head Census success: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45198101955
- .231 exact-head Modular QA success: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45198101899
- Main remains at .231 SHA `bb25e770023caab277aba5e6757e3ec71fc3a87c`; .232 is not deployed.

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read or edit other agents' private checkpoints. Never bypass required CI, security or QA promotion.
