# Scream Trick CPU counterplay — 2026-11-02

## Acceptance criteria

- Add a difficulty-scaled CPU response to the already-present one-second held-DRIBBLE Scream trigger.
- Only the nearest eligible opposing outfielder within Scream's existing 135-unit radius responds; unrelated tricks, short taps, distant players and keepers do not.
- Use the existing JUMP action early enough to reach Scream's existing airborne counter state before the cast. Preserve grounded SHOOT-slide and defensive counters, trick timing, cooldown/fatigue, controls, roster assignments, and save schema.
- Lower difficulty retains its slower reaction timing; do not grant an impossible pre-cast jump.

## Implementation

`reactToScreamTrick` watches the opponent's existing Scream assignment and held-DRIBBLE timer. After 0.35 seconds, the nearest eligible CPU defender starts the existing difficulty reaction delay. While the tell is active, the AI pauses its regular approach so it does not cancel the response by lunging first. The CPU then uses the ordinary JUMP action; once the hold reaches the existing one-second cast, the helper clears and normal play resumes. Rookie's 0.78-second delay is too slow for this window and remains unchanged; Easy through Expert can react, with their configured delays preserved. No new ability, control, or persistent state was added.

## Validation

- `node --test tests/magic_scream_ai_counter.test.cjs tests/magic_scream_jump_counter.test.cjs tests/magic_scream_slide_counter.test.cjs` — **11 passed, 0 failed**. Covers both directions and 30/60/120 Hz timing, difficulty reaction delays, eligibility and state filters, and preservation of existing jump/slide counter rules.
- `python -X utf8 scripts/build.py` — modular browser fixture built successfully.
- `python -X utf8 tests/magic_scream_ai_counter_browser_qa.py` — desktop and simulated-touch Chromium passed both directions at 30/60/120 Hz. The CPU starts its existing jump with at least 0.25 seconds before cast, and the four-button layout remains unchanged with no page errors.

The browser check confirms the live `driveAI` response path and button contract; it does not replace human counterplay/balance review or physical-device acceptance.
