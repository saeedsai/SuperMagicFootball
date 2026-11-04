# Fireball Trick CPU counterplay — 2026-11-02

## Acceptance criteria

- CPU defenders use the existing JUMP counter against an approaching Fireball cast, without adding a control or save field.
- Only the nearest eligible outfielder inside Fireball's existing 120-unit range reacts; other tricks, out-of-range casts, already-countering slides/jumps and keepers remain unaffected.
- Preserve Fireball's one-second held-DRIBBLE trigger, JUMP/ground-slide/facing counters, 0.32-second stagger, 0.48-second visual cue and existing fatigue/cooldown.
- Respect current CPU difficulty reaction timings on both sides and frame rates.

## Implementation

`reactToFireballTrick` observes the opponent's existing Fireball assignment and held-DRIBBLE tell. The nearest eligible CPU defender within the same strict 120-unit range used by Fireball begins the configured reaction delay, then uses the existing JUMP action. AI pauses its approach while the response is pending so it does not replace the jump with a lunge. Already-airborne and active-slide defenders keep their current counter. Rookie's slower reaction remains too late; Easy through Expert respond according to their configured delays. No trick timing, effect, player assignment, control or save data changed.

## Validation

- `node --test tests/magic_fireball_ai_counter.test.cjs tests/magic_fireball_jump_counter.test.cjs tests/magic_fireball_slide_counter.test.cjs tests/magic_fireball_burn.test.cjs tests/magic_scream_jump_counter.test.cjs` — **18 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — modular browser fixture built successfully.
- `python -X utf8 tests/magic_fireball_ai_counter_browser_qa.py` — desktop and simulated-touch Chromium passed both sides at 30/60/120 Hz. CPU JUMP begins at least 0.31 seconds before the cast, with four action buttons and no page errors.

This focused check does not establish physical-device or human balance acceptance.
