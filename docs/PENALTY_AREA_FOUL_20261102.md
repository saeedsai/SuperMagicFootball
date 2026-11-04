# Penalty-area foul restart — 2026-11-02

## Acceptance criteria

- A successful, existing grounded slide-from-behind foul awards a one-kick penalty when the carrier is inside the fouled team's attacking penalty area.
- The area is mirrored for both teams, includes its boundary lines, and is proportioned to the configured field dimensions.
- A foul outside the area keeps the direct free-kick restart; ordinary post-draw penalty shootouts retain their alternating multi-kick lifecycle.
- A scored in-match penalty adds one match goal, emits the regular goal event, and resumes play after the normal kickoff flow. A miss/save leaves the score unchanged, returns possession to the defending keeper, and resumes play.
- Preserve the four-action controls and existing save schema.

## Implementation

`src/modules/engine.js` classifies each penalty area from the attacker's goal side using the standard 16.5 m depth and 40.32 m total width, scaled to the game's 105 m by 68 m field. Boundary lines count as inside. The existing slide-from-behind foul branch now starts a single-kick in-match penalty only when the carrier is inside that area; the prior free-kick branch handles outside fouls. In-match penalties are distinguished from the existing shootout state and resolve after one attempt. Goals use the normal score, scorer, morale, celebration, kickoff, and goal-event paths. Misses award the defending keeper possession. UI toast and rendered overlay identify an in-match penalty as `PENALTY KICK` while the shootout retains its own label.

The dimensions follow [IFAB Law 1, section 1.6](https://www.theifab.com/laws/latest/the-field-of-play/): the penalty area extends 16.5 m from the goal line, with its sides 16.5 m from each inside goalpost. The combined width is therefore 7.32 m goal width plus 33 m, or 40.32 m. IFAB also states boundary lines belong to the area they enclose.

## Validation

- `node --test tests/penalty_area_foul.test.cjs` — **6 passed, 0 failed**. Covers mirrored inclusive boundaries, both foul sides, outside-box free-kick fallback, goal/miss resolution, and shootout compatibility.
- `python -X utf8 scripts/build.py` — modular browser fixture built successfully (4,810,288 JS chars; 4,888,170 HTML chars).
- `python -X utf8 tests/penalty_area_foul_browser_qa.py` — **desktop and simulated-touch Chromium passed**. Each exercised goals and misses for both teams, verified resumed play, score/keeper outcomes, penalty-resolution events, no page errors, and exactly four action buttons.

This focused validation does not establish physical-device, hosted, or owner gameplay acceptance.
