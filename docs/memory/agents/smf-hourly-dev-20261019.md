# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.232:** AI-LOFTED-PASS-JUMP-REACH-01 makes the second defender's JUMP commitment respect the player's Jumping rating and predicted first-jump arc. A live airborne JUMP can now collect a lofted pass above the grounded 45-unit reach; grounded players keep their prior limit.
- Added mirrored helper/engine Node regressions and desktop/simulated-touch Chromium checks for both sides, high/low Jumping, actual possession collection and the exact four buttons.
- .232 exact-head Modular QA/Census are pending; no release, Pages or hosted-smoke claim.

## Next smallest action
Observe all four Node and four Chromium Census shards at the exact .232 SHA; fix confirmed failures, then allow only the green exact head through the existing QA-gated promotion pipeline. Verify Pages deployment, independent main Census and hosted-byte smoke separately.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is not enabled. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .231 checkpoint-only Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45198101899
- .231 Census (was running when .232 began): https://github.com/saeedsai/SuperMagicFootball/actions/runs/45198101955
- .232 exact-head gates: pending after commit.
- Latest known main SHA: `91adea9bad06524c3022e7ee60a8ece58fb16142` (.225).

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read or edit other agents' private checkpoints. Never bypass required CI, security or QA promotion.
