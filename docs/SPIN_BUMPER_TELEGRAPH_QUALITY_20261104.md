# Spin Bumper telegraph visual quality — 4 November 2026

## Acceptance

Improve readability of the existing SD09 defense warning using its existing 0.42-second timer. Preserve four-button controls, warning/counter timing, collision and physics. Retain reduced-flash accessibility.

## Change

The actual match renderer overlays a gold progress arc on the existing warning ring, advances the orbit and two markers in phase with the warning timer, and keeps the original JUMP OR DASH instruction. Reduced-flash holds the orbit still but continues to reveal remaining warning time through the non-flashing arc. No gameplay or saved state is read or written beyond the existing pending timer and user preference.

## Validation

- `tests/art102_spin_bumper_pose.test.cjs` and `tests/spinning_bumper_defence.test.cjs`: **11/11**. Covers timer linkage, reduced-flash static orbit, defense timing, interruption, counters, difficulty response, and four-action parity.
- `tests/spin_bumper_telegraph_quality_browser_qa.py`: actual production renderer, **80 samples** (8 headings × 5 timer phases × standard/reduced-flash). All heading/mode rows have five distinct pixel phases, at least 7,939 painted pixels per cell, no page errors, and live match state unchanged.
- `python -X utf8 scripts/build.py`: passed before browser capture.
- Full Node gate components: `node --test tests/*.test.cjs` **1,949/1,949 passed**; `node tests/club26_fc27_roster.mjs` passed (32 clubs/384 slots). `TEMP`/`TMP` were redirected to D: because C: had no free space; the npm wrapper could not create its log, so its build/test steps were executed directly.
- Gallery: [eight-heading countdown comparison](SPIN_BUMPER_TELEGRAPH_QUALITY_20261104.png).

Commissioned view-specific art, owner visual review and physical-device acceptance remain open; the procedural renderer remains the fallback.
