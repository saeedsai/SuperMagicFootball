# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-30

## Mission
Develop directly on existing dev only; no new branches, force pushes or CI/security bypass. Preserve 223 teams, 2676 players, six formations, exactly Pass/Shoot/Dribble/Jump, ten Career/Cup slots, SD09 and offline saves.

## Current checkpoint
- STUDIO-GALLERY-FRAME-STEP-01 0.12.17.0 candidate: previous/next four-phase eight-view comparison with slider sync, unsaved edits preserved. Node + Chromium regression added; exact-head CI/promotion/hosted checks pending. Baseline e2a55e4eac5a0fc1e25c2275d11dca710defd5a2 dev/main green and Pages successful.
- BREATH-SWITCH-IMMEDIATE-01 0.12.16.4: renderer Breath ring uses live selected identity instead of stale controlled flag; Node and desktop/touch Chromium regression added. Previous 0.12.16.3 Modular QA green, full 4+4 queued. New exact-head checks and Pages pending.
- BREATH-CRITICAL-RING-01 0.12.16.3 candidate: selected player's circular Breath ring pulses below 20%; focused regression committed, exact-head QA and deployment unverified. Prior Breath balance candidate Modular QA passed while full regression jobs were queued.
- BREATH-RUN-SELECTED-01 candidate 0.12.16.2: normal running/carrying .6 intensity (low drain), sprint 1.5, hyperdash 1.7; Breath ring only currently selected human-controlled player. Focused tests committed; exact-head CI, main promotion and hosted bytes unverified.
- Starting dev/main synchronized at `1b511ac09f54922b21031251586a2eaef9c3b0e6` (previous hosted 0.12.16.0).
- STUDIO-GALLERY-A11Y-PHASE-01 candidate `0.12.16.1`: the eight direction tiles/canvases announce selected action and frame 1–4, and polite status includes frame. Presentation only; no art assets or gameplay altered.
- Extended real gallery Node tests. Exact-head 4 Node + 4 Chromium, Modular QA, protected main promotion and hosted Pages verification require independent GitHub evidence; do not infer results from earlier commits.
- Eight bespoke art directions still unfinished; physical two-phone LAN #48 not certified.

## Next smallest action
1. Inspect focused and exact-head CI, repair failures.
2. Promote only through green pipeline and verify Pages bytes.
3. Implement independent side/quarter character art; visually verify #15.
4. Improve a four-button counterable Magic Trick and goalkeeper animation.
5. Extend Career progression; inspect Render #86 and main protection #87.

## Ownership and exclusions
Sole developer; historical locks are not gates. Never read or edit other agents' memory. No routine LAN/P2P implementation.

## Evidence
GitHub connector SHA-checked fast-forward; local GitHub DNS unavailable. Full CI and physical-device verification are separate.

## Cleanup
Checkpoint under 4 KiB; historical commits preserved.
