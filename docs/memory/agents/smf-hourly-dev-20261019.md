# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.266 — AI-THIRD-MAN-MARK-ARRIVAL-READ-01:** the remaining CPU defender now scores a third-man mark using a bounded 120 ms projection of its own movement toward the goal-side target. Per-axis displacement is capped at 24 units and score influence at ±12; a slightly farther defender already closing can beat a nearer defender moving away, while materially better geometry and existing primary/support roles remain preferred.
- Gameplay commit: `fd42ffb04067307c9ec96d3f6aa57427c9841d42`. Test-fixture correction: `12c6a969a8bc2ba8b6ee13638a3d67c5f5bb7b94`. Release metadata, README heading/banner, version policy, cache suffix and master backlog are synchronized to .266.
- **.265 test-only repair:** `ebc3d2f3ceaf207386f0677614cfd4b034b150e8` fixed the jump-pose comparison to sample only character pixels, but its Crown reference filter used the wrong ID. The exact ID `demo_crown_royals_reference` and original 223-team count are corrected in 12c6a96.
- **.266 first exact-head failure:** #45412360843 and #45412360854 failed Node preflight because the new test requested bench index 6 instead of one of six active on-field players. The mirrored Node/Chromium fixture now uses active slot 2; no production AI failure was established.
- Main remains .261 on SHA `5ab96a2ddf6eeb5763e7e1cc834aaedf995b3aed`; Pages #45379378786 and independent main Census #45379388061 passed.

## Next smallest action
Verify exact final-head Modular QA and four-Node/four-Chromium Census. Fix only confirmed failures, then continue an independent gameplay increment on dev; promote only a fully green exact head through the existing QA-gated pipeline and independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .265 Full Census #45410908941: preflight, preview and all four Node shards passed; browser shard 0 still failed the first filter at 224, browser shard 2 passed the player-region repeat comparison, and other browser shards were still running. Corrected team ID in 12c6a96.
- .266 Modular QA #45412360843 and Census #45412360854 failed only at Node preflight on the invalid bench-slot fixture; corrected in 12c6a96. New exact-head runs are required.
- .261 release was independently verified and deployed; .266 is not promoted or deployed.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
