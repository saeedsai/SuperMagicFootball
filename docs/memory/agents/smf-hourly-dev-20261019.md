# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-29

## Mission
Continue tested increments on existing dev only; never create branches, force-push, or bypass CI/security. Preserve 223 teams, 2676 players, six formations, four Pass/Shoot/Dribble/Jump actions, SD09, offline saves, Career/Cup ten slots.

## Current checkpoint
- Previous certified dev/main `e5438025ba310b93c8615fdb38108ae331c976a6` (0.11.5.0): exact-head dev/main 4+4 and Modular QA/Pages reported green.
- Owner-requested Mini Football-inspired **original** UI/art and gameplay presentation now specified in `docs/MINI_FOOTBALL_VISUAL_ROADMAP_20261029.md` and promoted in `docs/DEVELOPMENT_PLAN_AND_PRIORITIES.md`.
- VIZ-01 candidate **0.11.6.0** adds original colored high-contrast four-button CSS diamond, contrast joystick, compact responsive safe-area treatment and more legible score panel; test `tests/arcade_match_ui_visual_contract.test.cjs`.
- About-only four-part release, package, README and SW cache rotated. Code maintains original controls and saves. Exact-head CI/Modular, main/Pages and live browser boot are separate gates; do not claim success before verifying.
- Physical two-phone LAN issue #48 open; Render commit-trigger drift issue #86 open. Do not resume routine LAN implementation.

## Next smallest action
1. Diagnose any exact-head Node/Chromium/Modular failures and fix on dev.
2. Promote only exact green dev head via existing pipeline; verify Pages byte hashes.
3. Capture real portrait/landscape touch visual QA and deployed startup errors.
4. Implement VIZ-02 original streamlined menus then VIZ-03 independently authored eight directional player views.
5. Expand goalkeeper, animation, camera, Career and Player Studio increments without regressing four controls.

## Ownership and exclusions
Sole developer; do not read/edit other agents' private memory. No physical LAN certification until two real phones pass.
