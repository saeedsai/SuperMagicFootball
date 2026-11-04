# In-match penalty attacking direction — 2026-11-02

## Acceptance criteria

- In-match penalties direct each team toward its normal attacking goal, with the taker, keeper, aim cue, and shot path mirrored together.
- Taker approach and short dribbles remain bounded around the side-specific spot and progress toward the correct goal.
- Post-draw shootouts preserve their existing same-end alternating lifecycle.
- No new action or save fields; the four-button control grammar remains intact.

## Implementation

The in-match penalty state now carries transient attack direction, goal-line x, and spot x. Team 0 attacks right and team 1 attacks left, matching normal match play. Ball movement and shot interpolation follow that direction; the penalty renderer places the kicker, defending keeper, and aim marker at the matching end and turns both players toward the field. Shootouts retain their existing right-end setup and old-save fallback behavior.

## Validation

- `node --test tests/penalty_area_orientation.test.cjs` — **2 passed, 0 failed**. Checks both attack directions, approach and shot movement, visual placements, and unchanged shootout orientation.
- `python -X utf8 scripts/build.py` — modular browser fixture built successfully.
- `python -X utf8 tests/penalty_area_orientation_browser_qa.py` — desktop and simulated-touch Chromium passed for both teams. The runtime ball and rendered actors/marker all face the attacking goal; four action buttons remain and there are no page errors.

This focused validation does not replace physical-device, hosted, or owner gameplay review.
