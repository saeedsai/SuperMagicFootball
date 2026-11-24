# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.266 — AI-THIRD-MAN-MARK-ARRIVAL-READ-01:** the remaining CPU defender now scores a third-man mark using a bounded 120 ms projection of its own movement toward the goal-side target. Per-axis displacement is capped at 24 units and score influence at ±12; a slightly farther defender already closing can beat a nearer defender moving away, while materially better geometry and existing primary/support roles remain preferred.
- Gameplay commit: `fd42ffb04067307c9ec96d3f6aa57427c9841d42`. Release metadata, README heading/banner, version policy, cache suffix and master backlog are synchronized to .266. Final checkpoint update is this follow-up.
- **.265 test-only repair:** `ebc3d2f3ceaf207386f0677614cfd4b034b150e8` corrects the goalkeeper browser test's 223-original-team count (runtime includes two existing demo/reference teams) and confines jump-pose repeat raster comparison to the actual character bounds, excluding fixture label/ground guide.
- .266 focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both defending goals, arrival-based selection, the bounded geometry fallback, possession, four controls and team invariants. Exact-head Modular QA/Census are pending.
- Main remains .261 on SHA `5ab96a2ddf6eeb5763e7e1cc834aaedf995b3aed`; .261 Pages #45379378786 and independent main Census #45379388061 passed.

## Next smallest action
Observe exact final-head Modular QA and Full Regression Census. Fix only confirmed failures, then continue an independent gameplay increment on dev; promote only a fully green exact head through the existing QA-gated pipeline and independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .265 Full Regression Census #45407087040 failed browser shard 1 on the incorrect 223-vs-225 runtime-array assertion and shard 2 on a repeat-raster fixture comparison that included non-player label/guide pixels; both test-only repairs are in ebc3d2f.
- .266 implementation and focused regressions are committed in fd42ffb; no .266 test result is claimed before Actions completes.
- Prior .261 release was independently verified and deployed; .266 is not promoted or deployed.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
