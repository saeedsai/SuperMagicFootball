# Standard player hand silhouette polish

## Scope and acceptance

The actual idle game render showed standard outfield-player hands as plain oval endpoints. Add a small inward-facing thumb contour to the existing palm shape so the hand reads as a fist at the normal render size. Keep the change within `arm()` and apply it only to non-keeper players.

Acceptance criteria:

- Two mirrored thumb contours render for standard outfield players.
- Keeper palms and catch-glove detail remain unchanged.
- The actual game renderer produces nonblank, unclipped body renders across several skin tones with no browser errors.

## Implementation

`src/modules/characterart.js`: added a skin-derived, dark-outlined thumb shape immediately after the existing non-keeper palm oval. It follows the arm sign to face inward on both sides. No pose, arm, kit, gameplay, or goalkeeper drawing logic was changed.

## Visual and regression evidence

- [Before, native game-size bodies](hands_before_game_size.png)
- [After, native game-size bodies and enlarged hand crops](hands_native_game_scale.png)
- [Browser QA report](hand_report.json) and [reproduction script](hand_shape_browser_qa.py)
- The script runs the actual game renderer with four skin tones and uses the same built app module for both comparisons, removing only this isolated hand-detail block for the before rendering. Before and after each have four unique checksums, zero blank/clipped player renders, and zero browser errors; all four rendered variants change after the detail is added.
- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — 23/23 pass. The focused regression checks both standard thumb shapes, their outlines, and absence of standard thumb details on keeper catches while preserving the catch-glove palm.
- Build: PowerShell `$env:PYTHONUTF8='1'; py -3 scripts/build.py` — pass.
- `git diff --check -- src/modules/characterart.js tests/player_art_v3_contract.test.cjs docs/PLAYER_ART_HAND_SHAPE_20261102` — pass.

This is a renderer prototype, not owner-approved art. The contact sheet shows actual renderer output at native scale; only the hand crop below each player is enlarged for inspection.
