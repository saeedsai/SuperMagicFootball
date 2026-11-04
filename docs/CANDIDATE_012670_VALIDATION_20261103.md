# Candidate 0.12.67 validation — 3 November 2026

## Changes

- Added real-engine input-path coverage for dribble-style taps and one-second Magic Trick holds on keyboard, touch and gamepad. Added real-engine Super Shot activation coverage for keyboard, touch and both gamepad slots, checking the double-Jump-then-Shoot sequence, shot ownership and duplicate suppression while preserving four actions.
- Career/Cup slot labels truncate on Unicode code-point boundaries instead of splitting surrogate pairs. Both Career runtimes reject duplicate player IDs in fitness reports before changing any player state.
- Cup tournament advancement now stages a detached campaign, commits the active Cup slot first, and publishes live campaign state and legacy mirror only after persistence succeeds.

## Validation

- Full local Node: **1,845/1,845 passed**; club fixture passed.
- Focused new game-input suites: dribble styles/trick hold **10/10**, Super Shot input paths **4/4**.
- Career/Cup: slot Unicode and persistence tests **46/46**; duplicate fitness/season/archive tests **16/16**; Cup result atomicity and tournament suites **21/21**. Each pre-fix persistence regression failed on the original code before passing after its correction.
- Actual Chromium evidence from the `.66` integration remains valid: manager/player canvas labels, six formation names, Player Studio desktop/touch gamepad/save flows, nine distinct shot-reaction phases, and reduced-flash/downed-breathing captures passed with no page errors.
- Data validation passes (223 teams, 2,676 players, 84 presets); release/version contracts after metadata rotation pass 21/21.

## Acceptance limits

The broad browser census, hosted signaling/deployment, physical-device and two-device acceptance remain open. Owner visual review remains open; the Run 00 bald-head edge cleanup is still rejected and no generated art was promoted. No production deployment is claimed.