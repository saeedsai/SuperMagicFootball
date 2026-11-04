# Teleport Trick CPU counterplay — 2026-11-02

## Acceptance criteria

- Add CPU response to the existing held-DRIBBLE Teleport warning using its existing counter: an active grounded SHOOT-slide through the carrier's forward lane.
- Only the nearest eligible opposing outfielder in the existing 85-ahead/35-across lane should respond; rear, wide, distant, wrong-trick and keeper cases remain unaffected.
- Use configured difficulty reaction timing and start the slide late enough that it remains active at the existing one-second cast.
- Preserve the 85-unit displacement, six-second cooldown/fatigue, four-button controls, human counter rules and save format.

## Implementation

`reactToTeleportTrick` observes only a known Teleport carrier's existing held-DRIBBLE state, then evaluates the same forward-lane geometry used by the human slide counter. The nearest eligible CPU defender waits for its configured reaction delay, then starts the existing grounded slide near the cast so the action remains active when Teleport resolves. AI pauses regular pursuit during the response, preventing it from overwriting or prematurely cancelling the slide. Rookie's slower reaction remains too late; Easy through Expert can counter. This adds no control, persistent field or save migration.

## Validation

- `node --test tests/magic_teleport_ai_counter.test.cjs tests/magic_teleport_slide_counter.test.cjs tests/tr18_teleport_bounds.test.cjs tests/tr18_teleport_trail.test.cjs` — **18 passed, 0 failed**. Covers both directions and 30/60/120 Hz, timing, eligibility/lane filters, existing human counter geometry and preserved Teleport bounds/cue behavior.
- `python -X utf8 scripts/build.py` — modular browser fixture built successfully.
- `python -X utf8 tests/magic_teleport_ai_counter_browser_qa.py` — desktop and simulated-touch Chromium passed both sides at 30/60/120 Hz; the existing slide starts near the cast and remains active through it; four actions remain and no page errors occurred.

This focused browser check does not replace physical-device or human balance review.
