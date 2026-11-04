# Player profile nose polish — 3 November 2026

## Acceptance criteria

- Smooth the projected nose tip in side and quarter-front views while retaining all current face anchors and keeping front-facing nose art pixel-identical.
- Preserve six distinct nose options in both side and quarter-front projections; all output remains nonblank and unclipped at actual gameplay scale.
- Compare before/after player-scale renderer crops and inspect the full 5-view gallery. This is a technical art improvement, not owner visual approval.
- Change no roster, identity, saved appearance field, head proportions, player position, hitbox, or gameplay state.

## Implementation and validation

- `node --test tests/player_art_v3_contract.test.cjs`: **18/18 passed**. All six style variants retain their view anchors and remain distinct across front, quarter-front and profile projections.
- `python -X utf8 scripts/build.py`: passed before the renderer comparison.
- `python -X utf8 tests/player_art_profile_nose_browser_qa.py`: **30 actual gameplay-renderer samples** passed (five views × six nose styles). Zero blank or clipped samples; all six nose styles remain visually distinct in each projection. The front crop is pixel-identical; all 24 profile/quarter samples change. Across 64px head crops, 898 pixels change in total and at most 45 in any sample.
- Before/after and full game-scale galleries were visually inspected: [before/after comparison](PLAYER_ART_PROFILE_NOSE_POLISH_20261103/before_after_game_size_pixels.png), [after gallery](PLAYER_ART_PROFILE_NOSE_POLISH_20261103/after_game_scale.png), and [machine-readable report](PLAYER_ART_PROFILE_NOSE_POLISH_20261103/browser_render_report.json).
- The harness reports the same two pre-existing app-only `classList` startup errors for both baseline and candidate; its renderer checks start after module initialization, and no new rendering errors were introduced.
- `git diff --check` passed for the implementation, focused test, browser comparison, and evidence.

This is a restrained procedural-art improvement, not an approved modular asset or a replacement for the required Studio-backed character pipeline. Physical-device review and owner visual approval remain open.
